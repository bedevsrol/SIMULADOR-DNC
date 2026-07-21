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
        honorarios:           '075c9be0-baad-48b2-864d-acae840b7256'
    };
 
    function num(v)    { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }
    function piso(n)   { return Math.floor(n); }
    function divi(a,b) { return (b === 0) ? 0 : a / b; }
 
    window.NOV_calculando = true;
 
    try {
        var estado = esHonorariosNov();           // 'HONORARIOS' | true | false | 'NINGUNO' | 'PILOTOS'
        // esHonorarios conserva 'PILOTOS' para diferenciar la rama con tasaGxC
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
        var factMes1, factMes2a6, cuotaEstimada, saldoFinal, honorarios;
 
        if (esHonorarios === true || esHonorarios === 'HONORARIOS' || esHonorarios === 'PILOTOS') {
            // ============ HONORARIOS / PILOTOS ============
            var porcHon = (esHonorarios === 'PILOTOS')
                ? num(sessionStorage.NOV_tasaGxC)        // PILOTOS usa tasa GxC
                : num(sessionStorage.NOV_porcCartera);   // Honorarios usa % cartera
            honorarios = piso((abonoMinimo * porcHon) / 100);
 
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
            // ========= GxC  y  NO APLICA (No aplica = GxC con gasto 0) =========
            honorarios = 0;
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
        setFieldValue(NOV.honorarios,          honorarios);
        setFieldValue('33e26099-22ea-4c29-8e5e-02346e3e366a', (esHonorarios === 'PILOTOS') ? honorarios : 0);
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
 
    try { visibilityField('075c9be0-baad-48b2-864d-acae840b7256', mostrarHon); } catch (e) {}       // Honorarios
    try { visibilityField('33e26099-22ea-4c29-8e5e-02346e3e366a', mostrarPilotos); } catch (e) {}    // PILOTOS
    try { visibilityField('435298fd-5cda-4327-9e83-079eda46f0a9', mostrarTasaGxC); } catch (e) {}    // Tasa GxC %
    try { visibilityField('3300e7e1-8d86-47d1-b709-2aa4773ec615', mostrarGastosGxC); } catch (e) {}  // Gastos GxC
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

//































function valoresPoblamiento() {
  //Pantalla Principal
  delete sessionStorage.campanamora
  setFieldValue('1ad60ed2-e515-4164-8270-54efa1e574fa', e.dataItem.NombreCompleto)
  e.dataItem.PosibilidadCambio026 == "SI" ? document.getElementById("4eedfe97-8bf2-499c-a05f-ff25e3ca9b95").selectedIndex = 1 : document.getElementById("4eedfe97-8bf2-499c-a05f-ff25e3ca9b95").selectedIndex = 2;
  let mora = getIdByPartialText(e.dataItem.EdadMoraCl, '5b9ce178-27fe-4c52-b91d-ba6a898ff546');
  if (e.dataItem.MecanismoAplicaCampana && e.dataItem.MecanismoAplicaCampana.includes("PAGOMORA")) {
    sessionStorage.campanamora = 'si'
  }
  setFieldValue('5b9ce178-27fe-4c52-b91d-ba6a898ff546', mora) //edad mora

  // honorarios 
  let producto = e.dataItem.Producto
  let TipoCobro = e.dataItem.CustomChar3
  let Linea = e.dataItem.CustomChar2
  let honorariosValues = e.dataItem.CustomNumber1
  let TipoCartera = e.dataItem.CustomChar1
  sessionStorage.TipProducto = producto
  sessionStorage.TipoCobro = TipoCobro
  sessionStorage.Linea = Linea
  sessionStorage.honorariosValues = parseFloat(honorariosValues)
  sessionStorage.TipoCartera = TipoCartera

  //Mora
  CalculosMora()
  sessionStorage.edadMora = e.dataItem.EdadMoraCl
  sessionStorage.intCampaña = e.dataItem.DtoInteresesCampana
  sessionStorage.intMoraCampaña = e.dataItem.DtoInteresesMoraCampana

  //Ampliacion
  CalculosAmpliacion()

  //cancelacion
  poblarCancelacion()

  //novaciones
  setFieldValue('616e6102-56e5-48e9-bfc2-fce8497e629d', e.dataItem.SaldoTotalObl);
  setFieldValue('1f7c2b79-87a6-402f-95f2-414aea88a4bf', e.dataItem.PagoMinObl);
  setFieldValue('e2c2ca76-e568-413d-8aac-b7bd2c3b9f52', e.dataItem.InteresCteObl);                    // Int Corriente
  setFieldValue('ce31f456-c5d9-4476-a56f-f5f44d2c8827', e.dataItem.InteresMoraObl);                   // Int Mora
  setFieldValue('a710006e-72a9-4388-84ed-cc3b743ef45f', e.dataItem.InteresesExtracontablesObl || 0);  // Int Extracontable
  setFieldValue('51440ec8-1f3c-49fa-8672-15870130cb90', e.dataItem.OtrosCargosExigibles || 0);        // Otros Cargos
  setFieldValue('0cb35f96-ddc9-40e7-b948-8f0d4d86bf79', e.dataItem.DiasMoraObl);                      // Días de mora

  // Seleccionar Tipo de Cartera (dispara calculoHonorariosNov -> línea + % honorarios)
  let idCarteraNov = getIdByPartialText(sessionStorage.TipoCartera, 'baa0e784-8248-45b8-9394-8932fe45094e');
  setFieldValue('baa0e784-8248-45b8-9394-8932fe45094e', idCarteraNov);

  // Seleccionar la lista Honorarios / Gastos / No aplica según TipoCobro
  if (typeof initGastoNov === 'function') { initGastoNov(); }

  // Consultar rango de días (topes, % abono, tasa GxC) y lanzar el cálculo
  if (typeof consultarRango === 'function') { consultarRango(); }

  let dropDownList1 = kendo.jQuery("#91d24002-ea79-468e-8375-8fee8964b2f8").data('kendoDropDownList');
  let dataSource1 = dropDownList1.dataSource;

  // Define el ID del ítem que quieres eliminar
  let idToRemove = 'AE441B5A-3FB9-4E62-9FF6-96CAD6C877CE';

  // Busca el ítem en el DataSource y lo elimina
  let itemToRemove = dataSource1.data().find(item => item.Id === idToRemove);
  if (itemToRemove) {
    dataSource1.remove(itemToRemove);
    dropDownList1.refresh();
  }

  if (e.dataItem.MecanismoAplicaCampana && e.dataItem.MecanismoAplicaCampana.includes("NOVACION")) {
    let dropDownList = kendo.jQuery("#91d24002-ea79-468e-8375-8fee8964b2f8").data('kendoDropDownList');

    if (!(sessionStorage.getItem("EdadMoraCl") === "0 - Al día")) {
      sessionStorage.campanaNovacion = 'si'
    }

    let dataSource = dropDownList.dataSource;

    var newItem = {
      Id: 'AE441B5A-3FB9-4E62-9FF6-96CAD6C877CE',
      Tasa: "TASA CAMPAÑA",
      TasaNovacion: e.dataItem.TasaCampana
    };

    dataSource.insert(0, newItem);
    dropDownList.refresh();
    dropDownList.value(newItem.Id);
    dropDownList.trigger("change");
  } else {
    var dropDownList2 = kendo.jQuery("#91d24002-ea79-468e-8375-8fee8964b2f8").data('kendoDropDownList');
    dropDownList2.value('1B8E59F0-A514-4EEE-92D7-C200D613A4B5')
    dropDownList2.trigger("change");
  }

  setFieldValue('e4b7cc87-de9e-4fa1-9d65-d9595ed2cca2', 0)
}

function getIdByPartialText(partialText, elemento) {
  const select = document.getElementById(elemento);
  const options = Array.from(select.options);
  const matchedOption = options.find(option => option.text.includes(partialText));
  return matchedOption ? matchedOption.value : null;
}
//funciones consulta honorarios
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
    if (texto.indexOf('NO APLICA') === 0) { return 'NINGUNO'; }   
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
function initGastoNov() {
    var GID_GASTO = '7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe';
    var tipo = (sessionStorage.TipoCobro || '').toUpperCase();
    var objetivo = (tipo.indexOf('HONORARIO') === 0) ? 'HONORARIO' : 'GASTO';

    var el = document.getElementById(GID_GASTO);
    if (el) {
        for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].text.toUpperCase().indexOf(objetivo) !== -1) {
                el.selectedIndex = i;
                el.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    if (typeof toggleHonorariosNov === 'function' && typeof esHonorariosNov === 'function') {
        toggleHonorariosNov(esHonorariosNov());
    }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}

//----------------FUNCIONES FUN NOVACION-------------------
//Data que llena el fun de novacion
function DataFunNovacion(mecanismo) {
    
    function dataNova() {
        debugger;
        function getSelectText(id, defaultValue = "NO") {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Elemento no encontrado: ${id}`);
                return defaultValue;
            }
            if (el.selectedIndex >= 0) {
                return el.options[el.selectedIndex].innerText.trim();
            }
            return defaultValue;
        }
        var descripcionActividad = document.getElementById("13a8a1c2-3026-481b-bddb-d62c2f321d2c").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.getElementById("13a8a1c2-3026-481b-bddb-d62c2f321d2c").selectedOptions[0].innerText || "";
        var ingresoMensual = document.getElementById("e1b74a38-af43-4dbe-ae4e-8430eda34573").value || "$";
        var ocupacionAdicional = document.getElementById("10d62ee5-6dc2-4452-9a91-e8acae95a3d3").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.getElementById("10d62ee5-6dc2-4452-9a91-e8acae95a3d3").selectedOptions[0].innerText || "";
        var ingresosAdicionales = document.getElementById("3f181299-b8fb-437e-aaa1-e21af8c747d1").value || "$";
        var numObligacion = document.getElementById("c5f3bb92-1efe-47ea-941a-5bf2c5f6ceb0").value === "" ? document.getElementById("caae86ca-b4e0-4e59-918e-8f7a1a4d4114").selectedOptions[0].innerText : document.getElementById("c5f3bb92-1efe-47ea-941a-5bf2c5f6ceb0").value;
        var saldoTotal = document.getElementById("616e6102-56e5-48e9-bfc2-fce8497e629d").getAttribute("aria-valuenow") || "$";
        var pagoMinimo = document.getElementById("1f7c2b79-87a6-402f-95f2-414aea88a4bf").getAttribute("aria-valuenow") || "$";
        var fechaPago =
            document.querySelector("#\\35 c6f6251-9091-496a-966a-9bf0fb0eedcf input")
                .value.replaceAll('-', ' ');
        var pagoNegociacion = document.getElementById("92bcba6d-4dab-459e-bd8f-164da7eeb526").getAttribute("aria-valuenow") || "$";
        var plazo = document.getElementById("9382c5a1-0445-4ed9-a785-850d06da2cd2").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.getElementById("9382c5a1-0445-4ed9-a785-850d06da2cd2").selectedOptions[0].innerText || "";
        var tasaMV = document.getElementById("b76668b5-0710-4eee-9718-a2633605c35e").value || "";
        var saldoDiferir = document.getElementById("c6923383-8eec-4efe-81a5-954ce52b8882").value || "$";
        var cuotaProyectada = document.getElementById("d157fb29-fd6f-450b-b637-8fa18c824cd2").value || "$";
        var pregunta1 = getSelectText("pregunta1");
        var pregunta2 = getSelectText("pregunta2");
        var pregunta3 = getSelectText("pregunta3");
        var pregunta4 = getSelectText("pregunta4");
        var garantiaFAG = getSelectText("garantiaFAG");
        var garantiaFNG = getSelectText("garantiaFNG");
        var observaciones = document.getElementById("4b025de3-4404-41f3-8ba8-ac9b0988391e").value || "";

        return {
            descripcionActividad,
            ingresoMensual,
            ocupacionAdicional,
            ingresosAdicionales,
            numObligacion,
            saldoTotal,
            pagoMinimo,
            fechaPago,
            pagoNegociacion,
            plazo: plazo + ' meses',
            tasaMV,
            saldoDiferir,
            cuotaProyectada,
            pregunta1,
            pregunta2,
            pregunta3,
            pregunta4,
            garantiaFAG,
            garantiaFNG,
            observaciones,

        }
    }
    const formateador = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });
    function loadFormData(data) {
        document.getElementById("descripcionActividad_" + mecanismo).textContent = data.descripcionActividad;
        document.getElementById("ingresoMensual_" + mecanismo).textContent = formateador.format(data.ingresoMensual);
        document.getElementById("ocupacionAdicional_" + mecanismo).textContent = data.ocupacionAdicional;
        document.getElementById("ingresosAdicionales_" + mecanismo).textContent = formateador.format(data.ingresosAdicionales);
        document.getElementById("numObligacion_" + mecanismo).textContent = data.numObligacion;
        document.getElementById("saldoTotal_" + mecanismo).textContent = formateador.format(data.saldoTotal);
        document.getElementById("pagoMinimo_" + mecanismo).textContent = formateador.format(data.pagoMinimo);
        document.getElementById("fechaPago_" + mecanismo).textContent = data.fechaPago;
        document.getElementById("pagoNegociacion_" + mecanismo).textContent = formateador.format(data.pagoNegociacion);
        document.getElementById("plazo_" + mecanismo).textContent = data.plazo;
        document.getElementById("tasaMV_" + mecanismo).textContent = data.tasaMV;
        document.getElementById("saldoDiferir_" + mecanismo).textContent = formateador.format(data.saldoDiferir);
        document.getElementById("cuotaProyectada_" + mecanismo).textContent = formateador.format(data.cuotaProyectada);
        document.getElementById("pregunta1_display_" + mecanismo).textContent = data.pregunta1;
        document.getElementById("pregunta2_display_" + mecanismo).textContent = data.pregunta2;
        document.getElementById("pregunta3_display_" + mecanismo).textContent = data.pregunta3;
        document.getElementById("pregunta4_display_" + mecanismo).textContent = data.pregunta4;
        document.getElementById("garantiaFAG_display_" + mecanismo).textContent = data.garantiaFAG;
        document.getElementById("garantiaFNG_display_" + mecanismo).textContent = data.garantiaFNG;
        document.getElementById("observaciones_" + mecanismo).textContent = data.observaciones;
    }
    setTimeout(() => {
        loadFormData(dataNova());
        console.log("Datos para novacion cargados");
        console.log("Datos:", dataNova());

    }, 500);
}

//Reflejar Observaciones en campo sox Novacion
function reflejarSoxNovacion(){

  const campoObs = document.getElementById('637cda5e-a8da-499a-98be-564521dd6c25');
  if (!campoObs) return;

  campoObs.addEventListener('input', () => {

    const obsActual = campoObs.value || '';

    let fechaPago =
      document.querySelector("#\\35 c6f6251-9091-496a-966a-9bf0fb0eedcf input")
        .value.replaceAll('-','');

    let comprasAut = '';
    let plazoAut = '';
    let campoCompras =
      document.querySelector("#\\35 822926e-f256-4631-b01f-c63de416f711")
        .selectedOptions[0].textContent;

    if (campoCompras !== 'Seleccione un registro') {
      plazoAut = campoCompras.slice(6,8).trim();
      comprasAut = campoCompras.slice(1,3);
    }

    let codigoExp = getFieldValue('e1c2af3d-be0b-45ea-b91c-9add93cbf7f9') || '';
    let actividadEconomica =
      document.querySelector("#\\31 3a8a1c2-3026-481b-bddb-d62c2f321d2c")
        .selectedOptions[0].textContent || '';

    let ingresoBruto = getFieldValue('e1b74a38-af43-4dbe-ae4e-8430eda34573') || '';
    let ingresosAd = getFieldValue('3f181299-b8fb-437e-aaa1-e21af8c747d1') || '';
    let coutaBDB = getFieldValue('6bf36825-81e3-4383-8f78-ae13c7c394c6') || '';
    let marca =
      document.querySelector("#\\38 676efb4-1857-48d2-b604-8c4e23917fd0")
        .selectedOptions[0].textContent || '';

    let soxActualizado =`FECHAPAGOXX${fechaPago}LLLCOMPRASAUTXX${comprasAut}LLLPLAZOAUTXX${plazoAut}LLLCODEXCXX${codigoExp}LLLOCUPACIONXX${actividadEconomica}LLLSALARIOPENSIONOINGRESOBRUTOXX${ingresoBruto}LLINGRESOSADICIONALESXX${ingresosAd}LLLCUOTAS MENSUALESSECTOR FINANCIEROXX${coutaBDB}LLLMARCACR026XX${marca}LLLOBSERVACIONESXX${obsActual}LLL`;
    setFieldValue('07b4e087-95c8-4867-b91f-1f9e9a4a1ea0', soxActualizado);
  });
}
//llenar campos observaciones novacion sox
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

