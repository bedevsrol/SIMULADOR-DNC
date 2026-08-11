//Calculos Novaciones
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
        honorarios:           '075c9be0-baad-48b2-864d-acae840b7256',
        honorariosMax:        '1b7acda2-ec9a-4c72-937b-57fc95e4a4d1',
        pilotosMax:           'ca478a50-d210-4a8e-b64c-aef8fa26955b'
    };

    function num(v)    { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
    function piso(n)   { return Math.floor(n); }
    function divi(a,b) { return (b === 0) ? 0 : a / b; }

    window.NOV_calculando = true;

    try {
        var estado = esHonorariosNov();
        var esHonorarios = (estado === true || estado === 'HONORARIOS') ? true
                         : (estado === 'PILOTOS') ? 'PILOTOS'
                         : false;
        var esNinguno    = (estado === 'NINGUNO');

        var saldoTotal  = num(getFieldValue(NOV.saldoTotal));
        var pagoMinimo  = num(getFieldValue(NOV.pagoMinimo));
        var tasa        = num(getFieldValue(NOV.tasa));
        var intCte      = num(getFieldValue(NOV.intCte));
        var intExtra    = num(getFieldValue(NOV.intExtra));
        var intMora     = num(getFieldValue(NOV.intMora));
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

        var tipoCobro = (sessionStorage.TipoCobro || '').toUpperCase();
        if (tipoCobro === 'GASTOS_90' || esHonorarios === 'PILOTOS') { topeMax = 0; }

        var abonoMinimo = pagoMinimo * (porMora / 100);
        var tasaVigente = tasa / 100;
        var totalICS    = (intCte + intExtra + intMora + otrosCargos) / 6;

        var base, tasaGxC, gastosCobranza, pagoNegociacion;
        var factMes1, factMes2a6, cuotaEstimada, saldoFinal;
        var honorarios, honorariosPropuesto;

        if (esHonorarios === true || esHonorarios === 'HONORARIOS' || esHonorarios === 'PILOTOS') {
            // ============ HONORARIOS / PILOTOS ============
            var porcHon = (esHonorarios === 'PILOTOS')
                ? num(sessionStorage.NOV_tasaGxC)
                : num(sessionStorage.NOV_porcCartera);

            honorariosPropuesto = piso((abonoMinimo * porcHon) / 100);  // el MÁXIMO (fijo)
            honorarios = honorariosPropuesto;

            // Si el usuario editó a un valor menor, respetarlo para cuotas/pago
            var honActual = (esHonorarios === 'PILOTOS')
                ? num(getFieldValue('33e26099-22ea-4c29-8e5e-02346e3e366a'))
                : num(getFieldValue(NOV.honorarios));
            if (honActual > 0 && honActual < honorariosPropuesto) {
                honorarios = honActual;
            }

            base = saldoTotal - (abonoMinimo + honorarios);

            tasaGxC = (esHonorarios === 'PILOTOS') ? num(sessionStorage.NOV_tasaGxC) : 0;
            gastosCobranza = 0;
            pagoNegociacion = abonoMinimo + honorarios;

            factMes1   = (base * tasaVigente) + totalICS;
            factMes2a6 = divi(base, plazoNov) + ((base * tasaVigente) + totalICS);
            var cuotaCapH = divi(base, plazoNov);
            cuotaEstimada = cuotaCapH + ((base - (6 * cuotaCapH)) * tasaVigente);
            saldoFinal = base;

        } else {
            // ========= GxC  y  NO APLICA =========
            honorarios = 0;
            honorariosPropuesto = 0;
            base = saldoTotal - abonoMinimo;

            tasaGxC = esNinguno ? 0 : num(sessionStorage.NOV_tasaGxC);

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

            factMes1   = (base * tasaVigente) + totalICS + gastosCobranza;
            factMes2a6 = divi(base, plazoNov) + ((base * tasaVigente) + totalICS);
            cuotaEstimada = divi(base, plazoNov) +
                ((base - (divi(base, plazoNov) * 6)) * tasaVigente);
            saldoFinal = base;
        }

        setFieldValue(NOV.abonoMinimo,         abonoMinimo);
        setFieldValue(NOV.honorariosMax,       honorariosPropuesto);                              // MÁXIMO fijo
        setFieldValue(NOV.honorarios,          honorarios);                                       // editable (efectivo)
        setFieldValue('33e26099-22ea-4c29-8e5e-02346e3e366a', (esHonorarios === 'PILOTOS') ? honorarios : 0);
        setFieldValue(NOV.pilotosMax,          (esHonorarios === 'PILOTOS') ? honorariosPropuesto : 0);
        setFieldValue(NOV.tasaGxC,             tasaGxC);
        setFieldValue(NOV.gastosCobranza,      gastosCobranza);
        setFieldValue(NOV.factMes1,            factMes1);
        setFieldValue(NOV.factMes2a6,          factMes2a6);
        setFieldValue(NOV.cuotaEstimada,       cuotaEstimada);
        setFieldValue(NOV.saldoFinalDiferir,   saldoFinal);
        setFieldValue(NOV.pagoParaNegociacion, Math.round(pagoNegociacion));

        try {
            if (typeof toggleHonorariosNov === 'function') {
                toggleHonorariosNov(estado);
            }
        } catch (e2) { }

    } catch (error) {
        console.error('Error en calculoNovacion:', error);
    } finally {
        window.NOV_calculando = false;
    }
}
function onHonorarioChange(e) {
    if (window.NOV_calculando) { return; }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}

//evento pago para negociacion y honorarios max permitido novacion
function validacion() {
    var pagoParaNegociacion = parseFloat(getFieldValue('92bcba6d-4dab-459e-bd8f-164da7eeb526')) || 0;
    var pagoMinimoRequerido=  parseFloat(getFieldValue('4cbf2d64-0442-4c98-964f-e741a6a4e6a1')) || 0;
    if (pagoParaNegociacion < pagoMinimoRequerido) {
        toastr.warning("El pago para la negociación debe de ser mayor al pago mínimo requerido");
    }
}
function validaHono(){
    var maxPermitido  = parseFloat(getFieldValue('1b7acda2-ec9a-4c72-937b-57fc95e4a4d1'));
    var honorariosMax = parseFloat(getFieldValue('1b7acda2-ec9a-4c72-937b-57fc95e4a4d1')) || 0;
    var honorarios    = parseFloat(getFieldValue('075c9be0-baad-48b2-864d-acae840b7256')) || 0;
    if (honorarios > honorariosMax) {
        setFieldValue('075c9be0-baad-48b2-864d-acae840b7256', maxPermitido);
        toastr.warning("Los honorarios no pueden exceder el monto máximo permitido");
    }
}
function validaPiloto(){
    var maxPermitidoPiloto  = parseFloat(getFieldValue('ca478a50-d210-4a8e-b64c-aef8fa26955b'));
    var pilotoMax  = parseFloat(getFieldValue('ca478a50-d210-4a8e-b64c-aef8fa26955b'));
    var piloto              = parseFloat(getFieldValue('33e26099-22ea-4c29-8e5e-02346e3e366a'));
    if (piloto >   pilotoMax) {
        setFieldValue('33e26099-22ea-4c29-8e5e-02346e3e366a', maxPermitidoPiloto);
        toastr.warning("El valor GXC no puede exceder el monto máximo permitido");
    }
}

//consulta rango de dias novaciones
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


//funciones consulta honorarios novacion
function honoranovacionvacio(){}
 
async function calculoHonorariosNov() {
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
 
    var ID_TIPO_CARTERA = 'baa0e784-8248-45b8-9394-8932fe45094e';
    var GID_LINEA       = '#46155d51-2885-490a-8a71-d75a35da95b4';
 
    try {
        var codigoLinea = sessionStorage.Linea;
        if (codigoLinea) {
            try {
                var nombreLinea = null;
 
                if (codigoLinea.indexOf('0900') === 0) {
                    nombreLinea = 'Tarjeta de Credito [Cualquier Franquicia]';
                } else {
                    var qLinea = "SELECT NomProductos FROM SimiladorDNC_Lappiz_LineaProducto WHERE CodCodigo = '" + codigoLinea + "'";
                    var rLinea = await execQuery(qLinea);
                    if (rLinea && rLinea[0] && rLinea[0][0]) {
                        nombreLinea = rLinea[0][0].NomProductos;
                    }
                }
 
                // Seleccionar la opción en el dropdown
                if (nombreLinea) {
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



function esHonorariosNov() {
    var GID_GASTO = '7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe';
    var el = document.getElementById(GID_GASTO);
    var texto = '';
    if (el && el.selectedOptions && el.selectedOptions[0]) {
        texto = el.selectedOptions[0].textContent.trim().toUpperCase();
    }
    if (texto.indexOf('NO APLICA') === 0) { return 'NINGUNO'; }   // <-- agregar
    if (texto.indexOf('PILOTO') === 0) { return 'PILOTOS'; }
    return texto.indexOf('HONORARIO') === 0;
}
 
/* valuechanged del select -> aplica visibilidad + recalcula */
function onGastoNovChange(e) {
    if (typeof toggleHonorariosNov === 'function' && typeof esHonorariosNov === 'function') {
        toggleHonorariosNov(esHonorariosNov());
    }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}
function arranqueGastoNov() {
    var GID_GASTO = '7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe';
    var intentos = 0;
    function intentar() {
        var widget = document.querySelector('[aria-owns="' + GID_GASTO + '_listbox"]');
        if (!widget) {
            if (intentos < 25) { intentos++; setTimeout(intentar, 200); return; }
            return;
        }
        // Aplica visibilidad según el valor actual del dropdown
        if (typeof esHonorariosNov === 'function' && typeof toggleHonorariosNov === 'function') {
            toggleHonorariosNov(esHonorariosNov());
        }
    }
    intentar();
}
//funciones listado novaciones
function toggleHonorariosNov(on) {
    // Honorarios: visible solo en HONORARIOS
    var mostrarHon = (on === true || on === 'HONORARIOS');
    // Campo PILOTOS propio: visible solo en PILOTOS
    var mostrarPilotos = (on === 'PILOTOS');
    // Tasa GxC%: visible en GASTOS y PILOTOS
    var mostrarTasaGxC = (on === false || on === 'GASTOS' || on === 'PILOTOS');
    // Gastos GxC (valor): visible solo en GASTOS
    var mostrarGastosGxC = (on === false || on === 'GASTOS');

    try { visibilityField('1b7acda2-ec9a-4c72-937b-57fc95e4a4d1', mostrarHon); } catch (e) {}       // Honorarios Máximos
    try { visibilityField('075c9be0-baad-48b2-864d-acae840b7256', mostrarHon); } catch (e) {}       // Honorarios
    try { visibilityField('33e26099-22ea-4c29-8e5e-02346e3e366a', mostrarPilotos); } catch (e) {}    // PILOTOS
    try { visibilityField('ca478a50-d210-4a8e-b64c-aef8fa26955b', mostrarPilotos); } catch (e) {}    // PILOTOS MAX
    try { visibilityField('435298fd-5cda-4327-9e83-079eda46f0a9', mostrarTasaGxC); } catch (e) {}    // Tasa GxC %
    try { visibilityField('3300e7e1-8d86-47d1-b709-2aa4773ec615', mostrarGastosGxC); } catch (e) {}  // Gastos GxC

    // Lista tipo de cobro: bloqueada si data cargada, editable si data creada
    try {
        var listaCobro = document.getElementById('7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe');
        if (listaCobro) { listaCobro.disabled = (sessionStorage.getItem('UserCargado') === 'si'); }
    } catch (e) {}
}

function initGastoNov() {
    var GID_GASTO = '7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe';
    var tipo = (sessionStorage.TipoCobro || '').toUpperCase().trim();
    var objetivo = (tipo.indexOf('HONORARIO') === 0) ? 'HONORARIO'
                 : (tipo.indexOf('GASTOS_90') === 0) ? 'PILOTO'
                 : 'GASTO';

    console.log('initGastoNov -> TipoCobro:', JSON.stringify(tipo), '| objetivo:', objetivo);

    var el = document.getElementById(GID_GASTO);
    if (el) {
        for (var i = 0; i < el.options.length; i++) {
            var textoOpc = el.options[i].text.toUpperCase();
            if (objetivo === 'GASTO') {
                // "GASTO" pero NO "PILOTO" (evita cruce)
                if (textoOpc.indexOf('GASTO') !== -1 && textoOpc.indexOf('PILOTO') === -1) {
                    el.selectedIndex = i;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            } else {
                if (textoOpc.indexOf(objetivo) !== -1) {
                    el.selectedIndex = i;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
        console.log('initGastoNov -> seleccionado:', el.selectedOptions[0] ? el.selectedOptions[0].text : 'NADA');
    }

    if (typeof toggleHonorariosNov === 'function' && typeof esHonorariosNov === 'function') {
        toggleHonorariosNov(esHonorariosNov());
    }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}