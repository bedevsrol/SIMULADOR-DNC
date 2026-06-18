/* ============================================================================
   cargarDatosNovacion(e)  - CORRE UNA VEZ. Hace las 2 consultas y siembra
   sesión: topes + tasa GxC. Luego dispara el primer cálculo.
   ============================================================================ */
async function cargarDatosNovacion(e) {
    try {
        /* --- 1) Días de mora (puente numérico entre ambas tablas) ---
           Data cargada: se siembra el campo con DIAS_MORA_OBL (por identificación).
           Data creada:  el usuario ya llenó el campo "Día de mora" (0cb35f96).
           En ambos casos, la edad se LEE de ese campo numérico.
        */
        const identificacion =
            (document.getElementById(NOV.identificacion) || {}).value || '';

        // Data cargada: sembrar el campo días con DIAS_MORA_OBL.
        if (identificacion) {
            const resDias = await execQuery(`
                SELECT DIAS_MORA_OBL
                FROM SimiladorDNC_Lappiz_PoblamientoDatos
                WHERE IDENTIFICACION = '${identificacion}'
            `);
            const filaDias = resDias?.[0]?.[0];
            if (filaDias) {
                setFieldValue(NOV.diasMora, Number(filaDias.DIAS_MORA_OBL));
            }
        }

        // La edad SIEMPRE se lee del campo numérico (sirve cargada y creada).
        const edadMora = _num(getFieldValue(NOV.diasMora));

        /* --- 2) Rango GxC por días de mora (topes + tasa) --- */
        let topeMin = 0, topeMax = 0, tasaGxCporc = 0;

        if (edadMora > 0) {
            const resRango = await execQuery(`
                SELECT TOP 1
                    Tope_Minimo,
                    Tope_Maximo,
                    PorcTasaGastoCobranza,
                    PorcAbonoMinimo
                FROM SimiladorDNC_Lappiz_rangosGastosCobranza
                WHERE ${edadMora} BETWEEN MinDias AND MaxDias
            `);
            const rango = resRango?.[0]?.[0];
            if (rango) {
                topeMin     = _num(rango.Tope_Minimo);
                topeMax     = _num(rango.Tope_Maximo);
                // PorcTasaGastoCobranza viene como FRACCIÓN (0.119) -> *100
                tasaGxCporc = _num(rango.PorcTasaGastoCobranza) * 100;
            }
        } else {
            console.warn('cargarDatosNovacion: edad de mora = 0 (sin rango GxC).');
        }

        /* --- 3) Sembrar en sesión (calculoNovacion los lee de aquí) --- */
        sessionStorage.NOV_topeMin = topeMin;
        sessionStorage.NOV_topeMax = topeMax;
        sessionStorage.NOV_tasaGxC = tasaGxCporc;   // % ya escalado

        /* --- 4) Primer cálculo --- */
        calculoNovacion();

    } catch (error) {
        console.error('Error en cargarDatosNovacion:', error);
    }
}
