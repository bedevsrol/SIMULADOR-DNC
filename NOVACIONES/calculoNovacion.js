function calculoNovacion() {
    var NOV = {
        pagoMinimo: '1f7c2b79-87a6-402f-95f2-414aea88a4bf',
        tasa: 'b76668b5-0710-4eee-9718-a2633605c35e',
        plazo: '9382c5a1-0445-4ed9-a785-850d06da2cd2',
        saldoTotal: '616e6102-56e5-48e9-bfc2-fce8497e629d',
        intCte: 'e2c2ca76-e568-413d-8aac-b7bd2c3b9f52',
        intExtra: 'a710006e-72a9-4388-84ed-cc3b743ef45f',
        intMora: 'ce31f456-c5d9-4476-a56f-f5f44d2c8827',
        otrosCargos: '51440ec8-1f3c-49fa-8672-15870130cb90',
        abonoMinimo: '4cbf2d64-0442-4c98-964f-e741a6a4e6a1',
        tasaGxC: '435298fd-5cda-4327-9e83-079eda46f0a9',
        gastosCobranza: 'PONER-GUID-GASTOS-GXC',
        factMes1: 'eb81310f-a2f4-4cac-8dee-cd877f840a0f',
        factMes2a6: '9f4dc8d9-4df5-46b4-89b5-4e9271b003eb',
        cuotaEstimada: 'd157fb29-fd6f-450b-b637-8fa18c824cd2',
        saldoFinalDiferir: 'c6923383-8eec-4efe-81a5-954ce52b8882'
    };
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
    function piso(n) { return Math.floor(n); }
    function divi(a, b) { return (b === 0) ? 0 : a / b; }

    try {
        var chk = document.getElementById('check');
        var esHonorarios = chk ? chk.checked : false;
        // (toggleHonorarios se llama AL FINAL, para que un error de
        //  visibilityField no rompa el cálculo)

        var saldoTotal = num(getFieldValue(NOV.saldoTotal));
        var pagoMinimo = num(getFieldValue(NOV.pagoMinimo));
        var tasa = num(getFieldValue(NOV.tasa));
        var intCte = num(getFieldValue(NOV.intCte));
        var intExtra = num(getFieldValue(NOV.intExtra));
        var intMora = num(getFieldValue(NOV.intMora));
        var otrosCargos = num(getFieldValue(NOV.otrosCargos));

        var plazoNov;
        var ddPlazo = document.getElementById(NOV.plazo);
        if (ddPlazo && ddPlazo.selectedOptions && ddPlazo.selectedOptions[0]) {
            plazoNov = num(ddPlazo.selectedOptions[0].textContent);
        } else {
            plazoNov = num(getFieldValue(NOV.plazo));
        }

        var porMora = num(sessionStorage.porMora);
        var topeMin = num(sessionStorage.NOV_topeMin);
        var topeMax = num(sessionStorage.NOV_topeMax);

        // CAMPO 1: Abono minimo
        var abonoMinimo = piso(pagoMinimo * (porMora / 100));

        var base = saldoTotal - abonoMinimo;
        var tasaVigente = tasa / 100;
        var totalICS = (intCte + intExtra + intMora + otrosCargos) / 6;

        // CAMPO 2: Tasa GxC (honorarios -> 0)
        var tasaGxC = esHonorarios ? 0 : num(sessionStorage.NOV_tasaGxC);

        // CAMPO 4: Gastos por cobranza (clamp)
        var gastosCobranza;
        if (tasaGxC <= 0) {
            gastosCobranza = 0;
        } else {
            var valorGxC = (pagoMinimo - abonoMinimo) * (tasaGxC / 100);
            if (topeMax > 0 && valorGxC > topeMax) { gastosCobranza = topeMax; }
            else if (valorGxC < topeMin) { gastosCobranza = topeMin; }
            else { gastosCobranza = valorGxC; }
        }
        gastosCobranza = piso(gastosCobranza);

        // CAMPO 3: 1er mes
        var factMes1 = (base * tasaVigente) + totalICS + gastosCobranza;

        // CAMPO 5: 2 a 6
        var factMes2a6 = divi(base, plazoNov) + ((base * tasaVigente) + totalICS);

        // CAMPO 6: Cuota
        var cuotaEstimada = divi(base, plazoNov) +
            ((base - (divi(base, plazoNov) * 6)) * tasaVigente);

        // CAMPO 7: Saldo final
        var saldoFinal = base;

        // RAMA HONORARIOS -> PENDIENTE (tasa por producto)

        // Escribir resultados (floor)
        setFieldValue(NOV.abonoMinimo, abonoMinimo);
        setFieldValue(NOV.tasaGxC, piso(tasaGxC));
        // Cuando tengas el GUID del campo Gastos GXC, ponlo arriba y descomenta:
        // setFieldValue(NOV.gastosCobranza, gastosCobranza);
        setFieldValue(NOV.factMes1, piso(factMes1));
        setFieldValue(NOV.factMes2a6, piso(factMes2a6));
        setFieldValue(NOV.cuotaEstimada, piso(cuotaEstimada));
        setFieldValue(NOV.saldoFinalDiferir, piso(saldoFinal));

        // Mostrar/ocultar honorarios AL FINAL (si falla, no rompe el cálculo)
        try {
            if (typeof toggleHonorarios === 'function') {
                toggleHonorarios(esHonorarios);
            }
        } catch (e2) { /* no romper el cálculo */ }

    } catch (error) {
        console.error('Error en calculoNovacion:', error);
    }
}