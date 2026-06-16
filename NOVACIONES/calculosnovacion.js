/* ============================================================================
   PLANTILLA - CALCULOS NOVACIÓN (Lappiz)
   ----------------------------------------------------------------------------
   Patrón calcado de CalculosMora:
     - La EDAD DE MORA ya viene cargada (dropdown o e.dataItem) y se usa como
       LLAVE para consultar la tabla SimiladorDNC_Lappiz_rangosGastosCobranza.
     - execQuery es ASÍNCRONO -> TODO lo que dependa de la tabla va DENTRO del
       .then().
   ----------------------------------------------------------------------------
   RELLENAR: los '' (GUID de campos y nombres de columna de e.dataItem).
   Las columnas de la TABLA ya van prellenadas (vistas en la imagen real).
============================================================================ */

function CalculosNovacion() {

    /* =====================================================================
       CONFIG  ->  RELLENAR LOS '' 
       ===================================================================== */

    // --- Nombres de columna en e.dataItem (poblamiento de datos) ----------
    const DI = {
<<<<<<< HEAD
        diasMora:         'NOMBRE_CAMPO',               // días de mora (número, llave para rango MinDias/MaxDias)
        saldoTotal:       e.dataItem['NOMBRE_CAMPO'],   // saldo total            (CONFIRMAR si viene de dataItem)
        pagoMinimo:       e.dataItem['NOMBRE_CAMPO'],   // p. ej. 'PagoMinObl'
        interesCorriente: e.dataItem['NOMBRE_CAMPO'],   // p. ej. 'InteresCteObl'
        interesExtra:     e.dataItem['NOMBRE_CAMPO'],   // p. ej. 'InteresesExtracontablesObl'
        interesMora:      e.dataItem['NOMBRE_CAMPO'],   // p. ej. 'InteresMoraObl'
        otrosCargos:      e.dataItem['NOMBRE_CAMPO'],   // columna de otros cargos
=======
        saldoTotal:       '',   // saldo total            (CONFIRMAR si viene de dataItem)
        pagoMinimo:       '',   // p. ej. 'PagoMinObl'
        interesCorriente: '',   // p. ej. 'InteresCteObl'
        interesExtra:     '',   // p. ej. 'InteresesExtracontablesObl'
        interesMora:      '',   // p. ej. 'InteresMoraObl'
        otrosCargos:      '',   // columna de otros cargos
        edadMoraFallback: '',   // p. ej. 'EdadMoraCl' (si no hay dropdown)
>>>>>>> 0c35ddd7679baae9f135a603d4eaefa513db8f4a
    }

    // --- GUID de campos del formulario ------------------------------------
    const F = {
        // ENTRADAS que lee el usuario
        tasa:               '',  // % tasa vigente
        plazoNovacion:      '',  // plazo novación
        requiereHonorarios: '',  // validador (dropdown/campo)

        // SALIDAS (se escriben con setFieldValue)
        abonoMinimo:        '',  // CAMPO 1
        tasaGxC:            '',  // CAMPO 2
        factMes1:           '',  // CAMPO 3
        gastosCobranza:     '',  // CAMPO 4
        factMes2a6:         '',  // CAMPO 5
        cuotaEstimada:      '',  // CAMPO 6
        saldoFinalDiferir:  '',  // CAMPO 7
        pagoNegociacion:    '',  // CAMPO 8
        pagoHonorarios:     '',  // rama honorarios (PENDIENTE)
    }

<<<<<<< HEAD
    // --- Tabla de rangos (columnas YA conocidas de la imagen) -------------
    const TABLA = 'SimiladorDNC_Lappiz_rangosGastosCobranza'
    const COL = {
        minDias:   'MinDias',
        maxDias:   'MaxDias',
=======
    // --- GUID del dropdown de edad de mora --------------------------------
    const GUID_DROPDOWN_EDAD = ''   // se usa con getElementById (sin escapar)

    // --- Tabla de rangos (columnas YA conocidas de la imagen) -------------
    const TABLA = 'SimiladorDNC_Lappiz_rangosGastosCobranza'
    const COL = {
        edad:      'EdadMoragxc',
>>>>>>> 0c35ddd7679baae9f135a603d4eaefa513db8f4a
        tasaGxC:   'PorcTasaGastoCobranza',  // viene como FRACCIÓN (0.0714)
        topeMin:   'Tope_Minimo',
        topeMax:   'Tope_Maximo',
        porcAbono: 'PorcAbonoMinimo',        // viene como FRACCIÓN (0.03)
    }

    // --- Texto EXACTO del validador (NO honorarios -> usa cobranza) -------
    const TXT_USA_COBRANZA = 'NO, COBRANZAS - Call int.ext tabla GXC'

    /* =====================================================================
       HELPERS
       ===================================================================== */
    const safeNumber = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v)
    const piso = n => Math.floor(n)               // regla de negocio: floor
    const div  = (a, b) => (b === 0 ? 0 : a / b)  // división segura (plazo = 0)

    /* =====================================================================
       1) LEER ENTRADAS  (fuera del .then, no dependen de la tabla)
       ===================================================================== */

    // --- del poblamiento (e.dataItem) ---
<<<<<<< HEAD
    const diasMora    = safeNumber(e.dataItem[DI.diasMora])
=======
>>>>>>> 0c35ddd7679baae9f135a603d4eaefa513db8f4a
    const saldoTotal  = safeNumber(e.dataItem[DI.saldoTotal])
    const pagoMinimo  = safeNumber(e.dataItem[DI.pagoMinimo])
    const intCte      = safeNumber(e.dataItem[DI.interesCorriente])
    const intExtra    = safeNumber(e.dataItem[DI.interesExtra])
    const intMora     = safeNumber(e.dataItem[DI.interesMora])
    const otrosCargos = safeNumber(e.dataItem[DI.otrosCargos])

    // --- de campos del formulario ---
    const tasa        = safeNumber(getFieldValue(F.tasa))           // %
    const plazoNov    = safeNumber(getFieldValue(F.plazoNovacion))
    const requiereHon = (getFieldValue(F.requiereHonorarios) || '').trim()

<<<<<<< HEAD
=======
    // --- edad de mora: dropdown seleccionado, con fallback al dataItem ---
    // getElementById evita el lío de escapar IDs que empiezan por dígito
    const ddEdad = document.getElementById(GUID_DROPDOWN_EDAD)
    const edadMora = (ddEdad && ddEdad.selectedOptions && ddEdad.selectedOptions[0])
        ? ddEdad.selectedOptions[0].textContent.trim()
        : e.dataItem[DI.edadMoraFallback]

>>>>>>> 0c35ddd7679baae9f135a603d4eaefa513db8f4a
    /* =====================================================================
       2) LOOKUP A LA TABLA  (todo lo de abajo depende de la tabla)
       ===================================================================== */
    execQuery(
        `SELECT ${COL.tasaGxC}, ${COL.topeMin}, ${COL.topeMax}, ${COL.porcAbono} ` +
<<<<<<< HEAD
        `FROM ${TABLA} WHERE ${diasMora} >= ${COL.minDias} AND ${diasMora} <= ${COL.maxDias}`
=======
        `FROM ${TABLA} WHERE ${COL.edad} = '${edadMora}'`
>>>>>>> 0c35ddd7679baae9f135a603d4eaefa513db8f4a
    ).then((response) => {

        const fila = response[0][0]
        const porcTasaGxC  = safeNumber(fila[COL.tasaGxC])    // fracción 0.0714
        const topeMin      = safeNumber(fila[COL.topeMin])
        const topeMax      = safeNumber(fila[COL.topeMax])
        const porcAbonoMin = safeNumber(fila[COL.porcAbono])  // fracción 0.03

        /* -----------------------------------------------------------------
           CAMPO 2) TASA GXC   (aquí valida "requiere honorarios")
           ----------------------------------------------------------------- */
        const hayHonorarios = (requiereHon !== TXT_USA_COBRANZA)
        const tasaGxC = hayHonorarios ? 0 : (porcTasaGxC * 100)  // 0.0714 -> 7.14

        /* -----------------------------------------------------------------
           CAMPO 1) ABONO MÍNIMO REQUERIDO
           Se floorea y se PROPAGA floored (igual que PowerApps, que lee el
           .Text ya formateado). Para precisión completa, quita el piso().
           ----------------------------------------------------------------- */
        const abonoMinimo = piso(porcAbonoMin * pagoMinimo)

        /* -----------------------------------------------------------------
           CAMPO 4) GASTOS POR COBRANZA  (clamp entre topes)  *** DELICADO ***
           Base = (pago_minimo - abono_minimo) * (tasaGxC / 100)
           ----------------------------------------------------------------- */
        const valorGxC = (pagoMinimo - abonoMinimo) * (tasaGxC / 100)
        let gastosCobranza
        if (topeMax > 0 && valorGxC > topeMax)  gastosCobranza = topeMax
        else if (valorGxC < topeMin)            gastosCobranza = topeMin
        else                                    gastosCobranza = valorGxC
        gastosCobranza = piso(gastosCobranza)
        // Honorarios: si hayHonorarios -> tasaGxC=0 -> valorGxC=0 -> el clamp lo
        // deja en topeMin (NO en 0). Si negocio quiere 0 en ese caso, descomenta:
        // if (hayHonorarios) gastosCobranza = 0

        /* -----------------------------------------------------------------
           DERIVADOS  (usan abono y gastos YA floored)
           ----------------------------------------------------------------- */
        const base        = saldoTotal - abonoMinimo
        const tasaVigente = tasa / 100
        const totalICS    = (intCte + intExtra + intMora + otrosCargos) / 6

        /* -----------------------------------------------------------------
           CAMPO 3) 1ER MES FACTURACIÓN   (SÍ incluye gasto de cobranza)
           ----------------------------------------------------------------- */
        const factMes1 = (base * tasaVigente) + totalICS + gastosCobranza

        /* -----------------------------------------------------------------
           CAMPO 5) 2 A 6 MES FACTURACIÓN   (NO incluye gasto de cobranza,
           SÍ incluye abono a capital base/plazo)
           ----------------------------------------------------------------- */
        const factMes2a6 = div(base, plazoNov) + ((base * tasaVigente) + totalICS)

        /* -----------------------------------------------------------------
           CAMPO 6) CUOTA ESTIMADA
           ----------------------------------------------------------------- */
        const cuotaEstimada =
            div(base, plazoNov) +
            ((base - (div(base, plazoNov) * 6)) * tasaVigente)

        /* -----------------------------------------------------------------
           CAMPO 7) SALDO FINAL A DIFERIR
           ----------------------------------------------------------------- */
        const saldoFinal = base

        /* -----------------------------------------------------------------
           CAMPO 8) PAGO PARA LA NEGOCIACIÓN
           OJO: aquí el GxC usa base = abono_minimo (DISTINTA al campo 4).
           Inconsistencia a confirmar con negocio.
           ----------------------------------------------------------------- */
        let gxc8 = 0
        if (tasaGxC > 0) {
            gxc8 = Math.min(
                Math.max(abonoMinimo * (tasaGxC / 100), topeMin),
                topeMax
            )
        }
        const pagoNegociacion = abonoMinimo + gxc8

        /* -----------------------------------------------------------------
           RAMA HONORARIOS  (PENDIENTE: falta la fórmula del "otro cálculo")
           En mora era: abonoMinimo * sessionStorage.PorcCartera
           ----------------------------------------------------------------- */
        let pagoHonorarios = 0
        if (hayHonorarios) {
            // TODO: pagoHonorarios = abonoMinimo * <PorcCartera>
            //       (confirmar origen y formato: fracción 0.05 o porcentaje 5)
        }

        /* -----------------------------------------------------------------
           3) ESCRIBIR RESULTADOS  (floor al mostrar)
           ----------------------------------------------------------------- */
        setFieldValue(F.abonoMinimo,       abonoMinimo)        // ya floored
        setFieldValue(F.tasaGxC,           tasaGxC)            // con decimales
        setFieldValue(F.gastosCobranza,    gastosCobranza)     // ya floored
        setFieldValue(F.factMes1,          piso(factMes1))
        setFieldValue(F.factMes2a6,        piso(factMes2a6))
        setFieldValue(F.cuotaEstimada,     piso(cuotaEstimada))
        setFieldValue(F.saldoFinalDiferir, piso(saldoFinal))
        setFieldValue(F.pagoNegociacion,   piso(pagoNegociacion))
        if (hayHonorarios) setFieldValue(F.pagoHonorarios, piso(pagoHonorarios))
    })
}