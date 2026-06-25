
function calculoNovacion() {

    var NOV = {
        pagoMinimo:           '1f7c2b79-87a6-402f-95f2-414aea88a4bf',
        tasa:                 'b76668b5-0710-4eee-9718-a2633605c35e',
        plazo:                '9382c5a1-0445-4ed9-a785-850d06da2cd2',
        saldoTotal:           '616e6102-56e5-48e9-bfc2-fce8497e629d',
        intCte:               'e2c2ca76-e568-413d-8aac-b7bd2c3b9f52',
        intExtra:             'a710006e-72a9-4388-84ed-cc3b743ef45f',
        intMora:              'ce31f456-c5d9-4476-a56f-f5f44d2c8827',
        otrosCargos:          '51440ec8-1f3c-49fa-8672-15870130cb90',
        abonoMinimo:          '4cbf2d64-0442-4c98-964f-e741a6a4e6a1',
        tasaGxC:              '435298fd-5cda-4327-9e83-079eda46f0a9',
        gastosCobranza:       '3300e7e1-8d86-47d1-b709-2aa4773ec615',
        factMes1:             'eb81310f-a2f4-4cac-8dee-cd877f840a0f',
        factMes2a6:           '9f4dc8d9-4df5-46b4-89b5-4e9271b003eb',
        cuotaEstimada:        'd157fb29-fd6f-450b-b637-8fa18c824cd2',
        saldoFinalDiferir:    'c6923383-8eec-4efe-81a5-954ce52b8882',
        pagoParaNegociacion:  '92bcba6d-4dab-459e-bd8f-164da7eeb526',
        honorarios:           '075c9be0-baad-48b2-864d-acae840b7256'
    }

    function num(v)    { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
    function piso(n)   { return Math.floor(n); }
    function divi(a,b) { return (b === 0) ? 0 : a / b; }

    window.NOV_calculando = true;

    try {
        var chk = document.getElementById('check_novacion');
        var esHonorarios = chk ? chk.checked : false;
        var saldoTotal  = num(getFieldValue(NOV.saldoTotal));
        var pagoMinimo  = num(getFieldValue(NOV.pagoMinimo));
        var tasa        = num(getFieldValue(NOV.tasa));
        var intCte      = num(getFieldValue(NOV.intCte));
        var intExtra    = num(getFieldValue(NOV.intExtra));
        var intMora     = num(getFieldValue(NOV.intMora));
        var otrosCargos = num(getFieldValue(NOV.otrosCargos));

        // El plazo viene de un <select>; se prefiere el texto visible (número de meses)
        // sobre el value interno del campo para evitar leer el ID de la opción.
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

        // GASTOS_90: régimen especial que elimina el tope máximo de GxC.
        
        var tipoCobro = (sessionStorage.TipoCobro || '').toUpperCase();
        if (tipoCobro === 'GASTOS_90') { topeMax = 0; }

        // CAMPO 1 — Abono mínimo (igual para ambos mecanismos)
        var abonoMinimo = pagoMinimo * (porMora / 100);
        var tasaVigente = tasa / 100;

        // totalICS: promedio mensual del total de intereses y otros cargos durante 6 meses
        var totalICS    = (intCte + intExtra + intMora + otrosCargos) / 6;

        var base, tasaGxC, gastosCobranza, pagoNegociacion;
        var factMes1, factMes2a6, cuotaEstimada, saldoFinal, honorarios;

        if (esHonorarios) {
            // ================= MECANISMO HONORARIOS =================
            var porcCartera = num(sessionStorage.NOV_porcCartera);
            honorarios = piso((abonoMinimo * porcCartera) / 100); // piso SOLO en honorarios

            base = saldoTotal - (abonoMinimo + honorarios);

            tasaGxC = 0;
            gastosCobranza = 0;
            pagoNegociacion = abonoMinimo + honorarios;

            factMes1   = (base * tasaVigente) + totalICS;
            factMes2a6 = divi(base, plazoNov) + ((base * tasaVigente) + totalICS);
            var cuotaCapH = divi(base, plazoNov);
            cuotaEstimada = cuotaCapH + ((base - (6 * cuotaCapH)) * tasaVigente);
            saldoFinal = base;

        } else {

            // ================= MECANISMO GxC =================
            honorarios = 0;
            base = saldoTotal - abonoMinimo;

            tasaGxC = num(sessionStorage.NOV_tasaGxC);

            if (tasaGxC <= 0) {
                gastosCobranza = 0;
            } else {
                var valorGxC = (pagoMinimo - abonoMinimo) * (tasaGxC / 100);
                if (topeMax > 0 && valorGxC > topeMax) { gastosCobranza = topeMax; }
                else if (valorGxC < topeMin)            { gastosCobranza = topeMin; }
                else                                    { gastosCobranza = valorGxC; }
            }

            pagoNegociacion = abonoMinimo;
            if (tasaGxC > 0) {
                var cargoNeg = Math.max(abonoMinimo * (tasaGxC / 100), topeMin);
                if (topeMax > 0 && cargoNeg > topeMax) { cargoNeg = topeMax; }
                pagoNegociacion += cargoNeg;
            }
            //FACTURACION ME 1, DOS A 6 GASTOS POR COBRANZA TENIENDO EN CUENTA TOPES
            factMes1   = (base * tasaVigente) + totalICS + gastosCobranza;
            factMes2a6 = divi(base, plazoNov) + ((base * tasaVigente) + totalICS);
            cuotaEstimada = divi(base, plazoNov) +
                ((base - (divi(base, plazoNov) * 6)) * tasaVigente);
            saldoFinal = base;
        }

        // SETEO DE CAMPOS CREADOS
        setFieldValue(NOV.abonoMinimo,         abonoMinimo);
        setFieldValue(NOV.honorarios,          honorarios);   // honorarios ya viene con piso
        setFieldValue(NOV.tasaGxC,             tasaGxC);
        setFieldValue(NOV.gastosCobranza,      gastosCobranza);
        setFieldValue(NOV.factMes1,            factMes1);
        setFieldValue(NOV.factMes2a6,          factMes2a6);
        setFieldValue(NOV.cuotaEstimada,       cuotaEstimada);
        setFieldValue(NOV.saldoFinalDiferir,   saldoFinal);
        setFieldValue(NOV.pagoParaNegociacion, pagoNegociacion);

        try {
            if (typeof toggleHonorariosNov === 'function') {
                toggleHonorariosNov(esHonorarios);
            }
        } catch (e2) { console.error("ERROR AL VALIDAR SI ES HONORARIOS"); }

    } catch (error) {
        console.error('Error en calculoNovacion:', error);
    } finally {
        window.NOV_calculando = false;
    }
}

function consultarRango() {
    var ID_DIAS = '0cb35f96-ddc9-40e7-b948-8f0d4d86bf79';

    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }

    var edadMora = num(getFieldValue(ID_DIAS));

    if (edadMora > 0) {
        var queryRango = "select * from SimiladorDNC_Lappiz_rangosGastosCobranza";

        execQuery(queryRango).then(function (resRango) {
            var filas = (resRango && resRango[0]) ? resRango[0] : [];
            var rango = null;

            for (var i = 0; i < filas.length; i++) {
                if (edadMora >= num(filas[i].MinDias) && edadMora <= num(filas[i].MaxDias)) {
                    rango = filas[i];
                    break;
                }
            }

            var topeMin = 0, topeMax = 0, tasaGxCporc = 0, porcAbono = 0;
            if (rango) {
                topeMin     = num(rango.TopeMinimo);
                topeMax     = num(rango.TopeMaximo);
                tasaGxCporc = num(rango.PorcTasaGastoCobranza) * 100;
                porcAbono   = num(rango.PorcAbonoMinimo) * 100;
            }

            sessionStorage.NOV_topeMin = topeMin;
            sessionStorage.NOV_topeMax = topeMax;
            sessionStorage.NOV_tasaGxC = tasaGxCporc;
            sessionStorage.porMora     = porcAbono;

            if (typeof calculoNovacion === 'function') { calculoNovacion(); }
        }).catch(function (err) {
            console.error('consultarRango - error:', err);
        });
    } else {
        sessionStorage.NOV_topeMin = 0;
        sessionStorage.NOV_topeMax = 0;
        sessionStorage.NOV_tasaGxC = 0;
        if (typeof calculoNovacion === 'function') { calculoNovacion(); }
    }
}



function validacion() {
    var abono = parseFloat(getFieldValue('4cbf2d64-0442-4c98-964f-e741a6a4e6a1')) || 0;
    var pago = parseFloat(getFieldValue('92bcba6d-4dab-459e-bd8f-164da7eeb526')) || 0;
    if (abono > pago) {
        toastr.warning("El pago para la negociación debe de ser mayor al abono mínimo requerido");
    }
}

function onPagoNegociacionChange(e) {
    if (window.NOV_calculando) { return; }

    setFieldValue('1f7c2b79-87a6-402f-95f2-414aea88a4bf', e.value); // pago mínimo
    if (typeof validacion === 'function') { validacion(); }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}

function toggleHonorariosNov(on) {
    var idsHon = [
        '46155d51-2885-490a-8a71-d75a35da95b4', // Línea N
        'baa0e784-8248-45b8-9394-8932fe45094e', // Tipo de Cartera N
        '075c9be0-baad-48b2-864d-acae840b7256'  // Honorarios
    ];

    var idsGxC = [
        '435298fd-5cda-4327-9e83-079eda46f0a9', // Tasa GxC %
        '3300e7e1-8d86-47d1-b709-2aa4773ec615'  // Gastos GxC
    ];

    for (var i = 0; i < idsHon.length; i++) {
        try { visibilityField(idsHon[i], on); } catch (e) {}
    }

    for (var j = 0; j < idsGxC.length; j++) {
        try { visibilityField(idsGxC[j], !on); } catch (e) {}
    }
}



function honoranovacionvacio(){}

async function calculoHonorariosNov() {
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }

    var ID_TIPO_CARTERA = 'baa0e784-8248-45b8-9394-8932fe45094e';
    var GID_LINEA       = '#46155d51-2885-490a-8a71-d75a35da95b4';

    try {
        // --- LÍNEA: consultar nombre por código (sessionStorage.Linea)--
        var codigoLinea = sessionStorage.Linea;
        if (codigoLinea) {
            try {
                var qLinea = "SELECT NomProductos FROM SimiladorDNC_Lappiz_LineaProducto WHERE CodCodigo = '" + codigoLinea + "'";
                var rLinea = await execQuery(qLinea);
                if (rLinea && rLinea[0] && rLinea[0][0]) {
                    var nombreLinea = rLinea[0][0].NomProductos;
                    var ddLinea = kendo.jQuery(GID_LINEA).data("kendoDropDownList");
                    if (ddLinea) {
                        var itemLinea = ddLinea.dataSource.data().find(function (x) {
                            return x.NomProductos === nombreLinea;
                        });
                        if (itemLinea) {
                            ddLinea.value(itemLinea.Id);
                            ddLinea.trigger("change");
                        }
                    }
                }
            } catch (eL) { console.error("Error cargando línea:", eL); }
        }

        // --- CARTERA: leer texto del dropdown y consultar el % ---
        var tipoCartera = '';
        var widget = document.querySelector('[aria-owns="' + ID_TIPO_CARTERA + '_listbox"]');
        if (widget) {
            var kInput = widget.querySelector('.k-input');
            if (kInput) { tipoCartera = kInput.textContent.trim(); }
        }

        if (!tipoCartera) {
            sessionStorage.NOV_porcCartera = 0;
        } else {
            var query = "select ValorHonorarios,TipoHonorarios from SimiladorDNC_Lappiz_dethonorarios where TipoHonorarios = '" + tipoCartera + "'";
            var response = await execQuery(query);
            var fila = (response && response[0] && response[0][0]) ? response[0][0] : null;
            sessionStorage.NOV_porcCartera = fila ? num(fila.ValorHonorarios) : 0;
        }

        if (typeof calculoNovacion === 'function') { calculoNovacion(); }

    } catch (error) {
        console.error('[HON] ERROR:', error);
    }
}

function onDiasMoraChange(e) {
    if (window.NOV_diasMoraTimer) { clearTimeout(window.NOV_diasMoraTimer); }
    window.NOV_diasMoraTimer = setTimeout(function () {
        if (typeof consultarRango === 'function') { consultarRango(); }
    }, 500);
}

function initSwitchHonorariosNov() {
    var intentos = 0;
    function intentar() {
        var chk = document.getElementById('check_novacion');
        var tipo = (sessionStorage.TipoCobro || '').toUpperCase();
        if (!chk || (tipo === '' && intentos < 15)) { intentos++; setTimeout(intentar, 300); return; }
        chk.checked = (tipo.indexOf('HONORARIO') === 0);
        chk.dispatchEvent(new Event('change', { bubbles: true }));
    }
    intentar();
}
