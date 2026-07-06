function honoranovacionvacio(){}
 
async function calculoHonorariosNov() {
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
 
    var ID_TIPO_CARTERA = 'baa0e784-8248-45b8-9394-8932fe45094e';
    var GID_LINEA       = '#46155d51-2885-490a-8a71-d75a35da95b4';
 
    try {
        // --- LÍNEA: consultar nombre por código (sessionStorage.Linea) y seleccionar ---
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
 
        // Refrescar el cálculo con el % ya guardado
        if (typeof calculoNovacion === 'function') { calculoNovacion(); }
 
    } catch (error) {
        console.error('[HON] ERROR:', error);
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


//funciones consulta honorarios novacion
function honoranovacionvacio(){}
 
async function calculoHonorariosNov() {
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
 
    var ID_TIPO_CARTERA = 'baa0e784-8248-45b8-9394-8932fe45094e';
    var GID_LINEA       = '#46155d51-2885-490a-8a71-d75a35da95b4';
 
    try {
        // --- LÍNEA: consultar nombre por código (sessionStorage.Linea) y seleccionar ---
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
 
        // Refrescar el cálculo con el % ya guardado
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
    return texto.indexOf('HONORARIO') === 0;
}
 

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
    var idsHon = [
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

function initGastoNov() {
    var GID_GASTO = '7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe';
    var tipo = (sessionStorage.TipoCobro || '').toUpperCase();
    var objetivo = (tipo.indexOf('HONORARIO') === 0) ? 'Honorarios' : 'Gastos';
 
    var id = getIdByPartialText(objetivo, GID_GASTO);
    if (id) {
        setFieldValue(GID_GASTO, id);
    }
    // Aplica visibilidad y recalcula con el valor ya seleccionado
    if (typeof toggleHonorariosNov === 'function' && typeof esHonorariosNov === 'function') {
        toggleHonorariosNov(esHonorariosNov());
    }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}if (typeof calculoNovacion === 'function') { calculoNovacion(); }

//evento pago para negociacion
function validacion() {
    debugger;
    var pagoParaNegociacion = parseFloat(getFieldValue('92bcba6d-4dab-459e-bd8f-164da7eeb526')) || 0;
    var pagoMinimoRequerido= parseFloat(getFieldValue('4cbf2d64-0442-4c98-964f-e741a6a4e6a1')) || 0;
    if (pagoParaNegociacion < pagoMinimoRequerido) {
        toastr.warning("El pago para la negociación debe de ser mayor al pago mínimo requerido");
    }
}


//llenar campos
function llenarCampos() {

    let plazoAut = '';
    let comprasAut = '';
    let producto = sessionStorage.Obl;
    let obligacion = '';

    //llenar campo observacione
    // if la obligacion llega vacia y coloque undefined no genere errores por undefined
    if (obligacion == undefined) {
        obligacion = '';
    } else {
        obligacion = document.getElementById("c5f3bb92-1efe-47ea-941a-5bf2c5f6ceb0").value === "" ? document.getElementById("caae86ca-b4e0-4e59-918e-8f7a1a4d4114").selectedOptions[0]?.innerText || '' : document.getElementById("c5f3bb92-1efe-47ea-941a-5bf2c5f6ceb0").value;
    }
    // 
    let saldoDiferir = getFieldValue("c6923383-8eec-4efe-81a5-954ce52b8882") || '';
    
    let honorarios = getFieldValue("075c9be0-baad-48b2-864d-acae840b7256") || '';
    
    let campoCompras = document.querySelector("#\\35 822926e-f256-4631-b01f-c63de416f711").selectedOptions[0].textContent;
    let plazo = document.querySelector("#\\39 382c5a1-0445-4ed9-a785-850d06da2cd2").selectedOptions[0].textContent;


    if (campoCompras == 'Seleccione un registro') {
        campoCompras = ''
    } else {
        plazoAut = campoCompras.slice(6, 8).replaceAll(' ', '');
        //plazo = plazo.slice(1,2).replaceAll(' ','');
        comprasAut = campoCompras.slice(1, 3);
    }

    //let tasa = document.querySelector("#\\39 1d24002-ea79-468e-8375-8fee8964b2f8").selectedOptions[0].textContent;
    let tasa = getFieldValue("b76668b5-0710-4eee-9718-a2633605c35e") || '';


    if (tasa == 'Seleccione un registro...') {
        tasa = ''
    }

    let cuotaProyectada = getFieldValue("d157fb29-fd6f-450b-b637-8fa18c824cd2") || '';
    let pagoNegociacion = getFieldValue("92bcba6d-4dab-459e-bd8f-164da7eeb526") || '';
    let fechaPago = document.querySelector("#\\35 c6f6251-9091-496a-966a-9bf0fb0eedcf > div.dx-dropdowneditor-input-wrapper > div > div.dx-texteditor-input-container > input").value;
    let fechaPago2 = fechaPago.replaceAll('-', '');

    let codigoExp = getFieldValue('e1c2af3d-be0b-45ea-b91c-9add93cbf7f9')

    if (codigoExp == '   ') {
        codigoExp = 0
    } else if (codigoExp == 'Seleccione un registro') {
        codigoExp = ''
    }

    let actividadEconomica = document.querySelector("#\\31 3a8a1c2-3026-481b-bddb-d62c2f321d2c").selectedOptions[0].textContent;

    if (actividadEconomica == 'Seleccione un registro...') {
        actividadEconomica = ''
    }

    let ingresoBruto = getFieldValue('e1b74a38-af43-4dbe-ae4e-8430eda34573') || '';
    let ingresosAd = getFieldValue('3f181299-b8fb-437e-aaa1-e21af8c747d1') || '';

    let ocupacionIngresosAd = document.querySelector("#\\31 0d62ee5-6dc2-4452-9a91-e8acae95a3d3").selectedOptions[0].textContent;

    if (ocupacionIngresosAd == 'Seleccione un registro...') {
        ocupacionIngresosAd = ''
    }

    let coutaBDB = getFieldValue('6bf36825-81e3-4383-8f78-ae13c7c394c6') || '';
    let marca = document.querySelector("#\\38 676efb4-1857-48d2-b604-8c4e23917fd0").selectedOptions[0].textContent;
    if (marca == 'Seleccione un registro...') {
        marca = ''
    } else {
        const match = marca.match(/\((.)\)/); // Busca un solo carácter dentro de paréntesis
        marca = match ? match[1] : '';
    }

    let observaciones = `TITULAR TOMA NOVACION DE SALDO TOTAL PARA SU TC ${obligacion} CUYO SALDO TOTAL ES DE $${saldoDiferir} ESTO DISPUESTO A UN PLAZO DE ${plazo} MESES, CON ${tasa} NMV QUE LE GENERA UNA CUOTA APROXIMADA POR $${cuotaProyectada} SIN INCLUIR CUOTA DE MANEJO SEGURO O NUEVOS USOS. ACEPTA NOVACION CON ABONO DE $${pagoNegociacion} Y HONORARIOS DE $${honorarios} REALIZADO EL ${fechaPago} LA ALTERNATIVA QUEDA SUJETA A VERIFICACION, APROBACION O NEGACION POR PARTE DEL BANCO.`;

    let plantillaSOX = `FECHAPAGOXX${fechaPago2}LLLCOMPRASAUTXX${comprasAut}LLLPLAZOAUTXX${plazoAut}LLLCODEXCXX${codigoExp}LLLOCUPACIONXX${actividadEconomica}LLLSALARIOPENSIONOINGRESOBRUTOXX${ingresoBruto}LLINGRESOSADICIONALESXX${ocupacionIngresosAd}LLLOCUPACIONINGRESOS ADICIONALESXX${ingresosAd}LLLCUOTAS MENSUALESSECTOR FINANCIEROXX${coutaBDB}LLLMARCACR026XX${marca}LLLOBSERVACIONESXX${observaciones}LLL`;

    setFieldValue('07b4e087-95c8-4867-b91f-1f9e9a4a1ea0', plantillaSOX)

    setFieldValue('637cda5e-a8da-499a-98be-564521dd6c25', observaciones)
}