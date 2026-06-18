async function calculoNovacion(e) {

    /* =====================================================================
       1) INPUT IDENTIFICACIÓN
    ===================================================================== */
    const identificacion =
        document.getElementById("75fda36b-9317-4062-93d7-26d45e6188d6").value;

    /* =====================================================================
       2) HELPERS
    ===================================================================== */
    const safeNumber = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
    const piso = n => Math.floor(n);
    const div = (a, b) => (b === 0 ? 0 : a / b);

    const TXT_USA_COBRANZA =
        'NO, COBRANZAS - Call int.ext tabla GXC';

    /* =====================================================================
       3) MAPEO CAMPOS
    ===================================================================== */
    const DI = {
        saldoTotal:       'SaldoTotalObl',
        pagoMinimo:       'PagoMinObl',
        interesCorriente: 'InteresCteObl',
        interesExtra:     'InteresesExtracontablesObl',
        interesMora:      'InteresMoraObl',
        otrosCargos:      'OtrosCargosExigibles',
    };

    const F = {
        tasa:              '',
        plazoNovacion:     'ID_PLAZO',

        abonoMinimo:       'idAbonoMinimo',
        tasaGxc:           'idtasaGxc',
        factMes1:          'idFactMes1',
        gastosCobranza:    'idGastosCobranza',
        factMes2a6:        'idFactMes2a6',
        cuotaEstimada:     'idCuotaEstimada',
        saldoFinalDiferir: 'idSaldoFinalDiferir',
        pagoNegociacion:   'idPagoNegociacion',
        pagoHonorarios:    'idPagoHonorarios',
        requiereHonorarios:'ID_REQUIERE_HONORARIOS'
    };

    /* =====================================================================
       4) INPUTS FORM + DATAITEM
    ===================================================================== */

    const tasa     = safeNumber(getFieldValue(F.tasa));
    const plazoNov = safeNumber(getFieldValue(F.plazoNovacion));

    const saldoTotal  = safeNumber(e.dataItem[DI.saldoTotal]);
    const pagoMinimo  = safeNumber(e.dataItem[DI.pagoMinimo]);
    const intCte      = safeNumber(e.dataItem[DI.interesCorriente]);
    const intExtra    = safeNumber(e.dataItem[DI.interesExtra]);
    const intMora     = safeNumber(e.dataItem[DI.interesMora]);
    const otrosCargos = safeNumber(e.dataItem[DI.otrosCargos]);

    const requiereHonorarios =
        (getFieldValue(F.requiereHonorarios) || '').trim();

    const hayHonorarios =
        requiereHonorarios !== TXT_USA_COBRANZA;

    /* =====================================================================
       5) CONSULTA DIAS MORA
    ===================================================================== */
    try {

        const diasMoraQuery = `
            SELECT DIAS_MORA_OBL
            FROM SimiladorDNC_Lappiz_PoblamientoDatos
            WHERE IDENTIFICACION = '${identificacion}'
        `;

        const resDias = await execQuery(diasMoraQuery);
        const fila = resDias?.[0]?.[0];

        if (!fila) return;

        const edadMora = Number(fila.DIAS_MORA_OBL);

        /* =================================================================
           6) CONSULTA RANGO GXC
        ================================================================= */

        const rangoQuery = `
            SELECT TOP 1
                Tope_Minimo,
                Tope_Maximo,
                PorcTasaGastoCobranza,
                PorcAbonoMinimo
            FROM SimiladorDNC_Lappiz_rangosGastosCobranza
            WHERE ${edadMora} BETWEEN MinDias AND MaxDias
        `;

        const resRango = await execQuery(rangoQuery);
        const rango = resRango?.[0]?.[0];

        if (!rango) return;

        /* =================================================================
           7) VARIABLES RANGO
        ================================================================= */

        const topeMin = safeNumber(rango.Tope_Minimo);
        const topeMax = safeNumber(rango.Tope_Maximo);

        const tasaGxC = hayHonorarios
            ? 0
            : safeNumber(rango.PorcTasaGastoCobranza) * 100;

        const porcAbonoMin = safeNumber(rango.PorcAbonoMinimo);

        /* =================================================================
           8) CÁLCULOS BASE
        ================================================================= */

        const abonoMinimo = piso(porcAbonoMin * pagoMinimo);

        const base = saldoTotal - abonoMinimo;

        const tasaVigente = tasa / 100;

        const totalICS =
            (intCte + intExtra + intMora + otrosCargos) / 6;

        /* 9) GASTOS COBRANZA (CAMPO 4) */

        const valorGxC =
            (pagoMinimo - abonoMinimo) * (tasaGxC / 100);

        let gastosCobranza;

        if (tasaGxC <= 0) {
            gastosCobranza = 0;
        } else if (topeMax > 0 && valorGxC > topeMax) {
            gastosCobranza = topeMax;
        } else if (valorGxC < topeMin) {
            gastosCobranza = topeMin;
        } else {
            gastosCobranza = valorGxC;
        }

        gastosCobranza = piso(gastosCobranza);

        /* =================================================================
           10) FACTURACIÓN
        ================================================================= */

        const factMes1 =
            (base * tasaVigente) +
            totalICS +
            gastosCobranza;

        const factMes2a6 =
            div(base, plazoNov) +
            ((base * tasaVigente) + totalICS);

        const cuotaEstimada =
            div(base, plazoNov) +
            ((base - (div(base, plazoNov) * 6)) * tasaVigente);

        const saldoFinal = base;

        /* =================================================================
           11) PAGO NEGOCIACIÓN (CAMPO 8)
        ================================================================= */

        const gxcNeg = tasaGxC <= 0 ? 0
                : Math.min( Math.max(abonoMinimo * (tasaGxC / 100), topeMin),
                    topeMax
                );

        const pagoNegociacion = abonoMinimo + gxcNeg;

        /* =================================================================
           12) HONORARIOS (PENDIENTE REAL)
        ================================================================= */
        let pagoHonorarios = 0;

        if (hayHonorarios) {
            // pendiente fórmula negocio
            pagoHonorarios = 0;
        }

        /* =================================================================
           13) OUTPUTS
        ================================================================= */

        setFieldValue(F.abonoMinimo, abonoMinimo);
        setFieldValue(F.tasaGxc, piso(tasaGxC));
        setFieldValue(F.gastosCobranza, gastosCobranza);

        setFieldValue(F.factMes1, piso(factMes1));
        setFieldValue(F.factMes2a6, piso(factMes2a6));
        setFieldValue(F.cuotaEstimada, piso(cuotaEstimada));

        setFieldValue(F.saldoFinalDiferir, piso(saldoFinal));
        setFieldValue(F.pagoNegociacion, piso(pagoNegociacion));

        if (hayHonorarios) {
            setFieldValue(F.pagoHonorarios, piso(pagoHonorarios));
        }

    } catch (error) {
        console.error("Error en calculoNovacion:", error);
    }
}





