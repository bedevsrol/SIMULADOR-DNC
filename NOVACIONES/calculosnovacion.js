/*
 * CALCULOSNOVACION.JS
 * Contiene todas las funciones del módulo de Novaciones del Simulador DNC.
 * Estas funciones se ejecutan en el render de Lappiz y dependen de las
 * utilidades getFieldValue / setFieldValue / visibilityField / execQuery
 * que el propio framework inyecta en el contexto de la página.
 *
 * FLUJO GENERAL:
 *  1. Al cambiar los días de mora  → onDiasMoraChange → consultarRango
 *  2. consultarRango carga topes y tasas desde BD y llama → calculoNovacion
 *  3. calculoNovacion recalcula los 7 campos de la novación y los escribe en el form.
 *  4. Al mover el toggle Honorarios → registrarSwitchHonorarios → toggleHonorarios + calculoNovacion
 *  5. Al cambiar el pago de negociación → onPagoNegociacionChange → validacion + calculoNovacion
 */


// =============================================================================
// nombre lappiz: Calculos novaciones
// Gatillo: se llama desde consultarRango (y desde eventos de campos del form).
// Calcula los 7 campos de salida de la novación en base a los valores del form
// y a los parámetros de rango guardados en sessionStorage por consultarRango.
// =============================================================================
function calculoNovacion() {

    // --- Mapa de IDs de campos Lappiz ---
    // Cada clave es el nombre lógico; el valor es el UUID del campo en la plataforma.
    var NOV = {
        pagoMinimo:           '1f7c2b79-87a6-402f-95f2-414aea88a4bf', // Entrada: cuota mínima del crédito
        tasa:                 'b76668b5-0710-4eee-9718-a2633605c35e', // Entrada: tasa de interés mensual (%)
        plazo:                '9382c5a1-0445-4ed9-a785-850d06da2cd2', // Entrada: plazo en meses (dropdown)
        saldoTotal:           '616e6102-56e5-48e9-bfc2-fce8497e629d', // Entrada: saldo total del crédito
        intCte:               'e2c2ca76-e568-413d-8aac-b7bd2c3b9f52', // Entrada: interés corriente acumulado
        intExtra:             'a710006e-72a9-4388-84ed-cc3b743ef45f', // Entrada: interés extra acumulado
        intMora:              'ce31f456-c5d9-4476-a56f-f5f44d2c8827', // Entrada: interés de mora acumulado
        otrosCargos:          '51440ec8-1f3c-49fa-8672-15870130cb90', // Entrada: otros cargos acumulados
        abonoMinimo:          '4cbf2d64-0442-4c98-964f-e741a6a4e6a1', // SALIDA 1: abono mínimo requerido
        tasaGxC:              '435298fd-5cda-4327-9e83-079eda46f0a9', // SALIDA 2: tasa de gastos de cobranza (%)
        gastosCobranza:       '3300e7e1-8d86-47d1-b709-2aa4773ec615', // SALIDA 4: monto gastos de cobranza
        factMes1:             'eb81310f-a2f4-4cac-8dee-cd877f840a0f', // SALIDA 3: factor cuota mes 1
        factMes2a6:           '9f4dc8d9-4df5-46b4-89b5-4e9271b003eb', // SALIDA 5: factor cuota meses 2 a 6
        cuotaEstimada:        'd157fb29-fd6f-450b-b637-8fa18c824cd2', // SALIDA 6: cuota estimada mes 7+
        saldoFinalDiferir:    'c6923383-8eec-4efe-81a5-954ce52b8882', // SALIDA 7: saldo base a diferir
        pagoParaNegociacion:  '92bcba6d-4dab-459e-bd8f-164da7eeb526'  // SALIDA: pago mínimo para negociar
    };

    // Helpers locales
    function num(v)    { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }  // convierte a número, 0 si NaN
    function piso(n)   { return Math.floor(n); }                              // redondeo hacia abajo (sin decimales)
    function divi(a,b) { return (b === 0) ? 0 : a / b; }                     // división segura (evita /0)

    try {
        // --- Estado del toggle Honorarios ---
        // Si el checkbox #check está marcado, el caso es de honorarios:
        // en ese modo la tasa de gastos de cobranza se fuerza a 0.
        var chk = document.getElementById('check');
        var esHonorarios = chk ? chk.checked : false;
        // toggleHonorarios se invoca AL FINAL para que un fallo de visibilityField
        // no interrumpa el cálculo principal.

        // --- Lectura de campos de entrada ---
        var saldoTotal  = num(getFieldValue(NOV.saldoTotal));
        var pagoMinimo  = num(getFieldValue(NOV.pagoMinimo));
        var tasa        = num(getFieldValue(NOV.tasa));
        var intCte      = num(getFieldValue(NOV.intCte));
        var intExtra    = num(getFieldValue(NOV.intExtra));
        var intMora     = num(getFieldValue(NOV.intMora));
        var otrosCargos = num(getFieldValue(NOV.otrosCargos));

        // Plazo: se lee del texto visible del <select> porque su value puede ser un ID interno.
        var plazoNov;
        var ddPlazo = document.getElementById(NOV.plazo);
        if (ddPlazo && ddPlazo.selectedOptions && ddPlazo.selectedOptions[0]) {
            plazoNov = num(ddPlazo.selectedOptions[0].textContent);
        } else {
            plazoNov = num(getFieldValue(NOV.plazo));
        }

        // --- Parámetros de rango cargados por consultarRango en sessionStorage ---
        var porMora = num(sessionStorage.porMora);        // % del pagoMinimo que debe abonar el cliente
        var topeMin = num(sessionStorage.NOV_topeMin);   // tope mínimo de gastos de cobranza en $
        var topeMax = num(sessionStorage.NOV_topeMax);   // tope máximo de gastos de cobranza en $

        // =========================================================================
        // CAMPO 1 — Abono mínimo
        // Fórmula: pagoMinimo × (porMora / 100), redondeado hacia abajo.
        // Es el monto mínimo que el cliente debe pagar sobre su cuota original
        // para que el acuerdo de novación sea válido.
        // =========================================================================
        var abonoMinimo = piso(pagoMinimo * (porMora / 100));

        // --- Variables intermedias ---
        var base        = saldoTotal - abonoMinimo;   // saldo neto a diferir/amortizar
        var tasaVigente = tasa / 100;                  // tasa en decimal
        // totalICS: promedio mensual de los intereses y cargos acumulados en 6 meses
        var totalICS    = (intCte + intExtra + intMora + otrosCargos) / 6;

        // =========================================================================
        // CAMPO 2 — Tasa de Gastos por Cobranza (%)
        // Si el caso es Honorarios la tasa se anula (0); en caso contrario se toma
        // el valor del rango cargado desde BD.
        // =========================================================================
        var tasaGxC = esHonorarios ? 0 : num(sessionStorage.NOV_tasaGxC);
        console.log('Tasa GxC:', tasaGxC, 'Tope Min:', topeMin, 'Tope Max:', topeMax);

        // =========================================================================
        // CAMPO — Pago para la negociación
        // Base: abonoMinimo.
        // Si hay gastos de cobranza (tasaGxC > 0), se suma el cargo GxC sobre el
        // abonoMinimo, respetando los topes mínimo y máximo del rango.
        // Fórmula del cargo: clamp(abonoMinimo × tasaGxC%, topeMin, topeMax)
        // =========================================================================
        var pagoNegociacion = abonoMinimo;
        if (tasaGxC > 0) {
            pagoNegociacion += Math.min(
                Math.max(
                    abonoMinimo * (tasaGxC / 100),
                    topeMin
                ),
                topeMax
            );
        }

        // =========================================================================
        // CAMPO 4 — Gastos de cobranza ($)
        // Si no hay tasa GxC → 0.
        // Si hay tasa, se calcula sobre la diferencia (pagoMinimo - abonoMinimo)
        // y se clampea entre topeMin y topeMax, redondeando hacia abajo.
        // =========================================================================
        var gastosCobranza;
        if (tasaGxC <= 0) {
            gastosCobranza = 0;
        } else {
            var valorGxC = (pagoMinimo - abonoMinimo) * (tasaGxC / 100);
            if (topeMax > 0 && valorGxC > topeMax) { gastosCobranza = topeMax; }
            else if (valorGxC < topeMin)            { gastosCobranza = topeMin; }
            else                                    { gastosCobranza = valorGxC; }
        }
        gastosCobranza = piso(gastosCobranza);

        // =========================================================================
        // CAMPO 3 — Factor cuota mes 1
        // Solo en el primer mes se cobran los gastos de cobranza junto con
        // los intereses y el promedio de ICS acumulados.
        // Fórmula: (base × tasaVigente) + totalICS + gastosCobranza
        // =========================================================================
        var factMes1 = (base * tasaVigente) + totalICS + gastosCobranza;

        // =========================================================================
        // CAMPO 5 — Factor cuota meses 2 a 6
        // Desde el mes 2 al 6 ya no se cobran gastos de cobranza.
        // Fórmula: (base / plazo) + (base × tasaVigente) + totalICS
        // =========================================================================
        var factMes2a6 = divi(base, plazoNov) + ((base * tasaVigente) + totalICS);

        // =========================================================================
        // CAMPO 6 — Cuota estimada (mes 7 en adelante)
        // A partir del mes 7 el saldo ya tiene 6 cuotas de capital amortizadas.
        // Fórmula: (base / plazo) + ((base - (base/plazo × 6)) × tasaVigente)
        // =========================================================================
        var cuotaEstimada = divi(base, plazoNov) +
            ((base - (divi(base, plazoNov) * 6)) * tasaVigente);

        // =========================================================================
        // CAMPO 7 — Saldo final a diferir
        // Es simplemente el saldo base (saldoTotal - abonoMinimo).
        // =========================================================================
        var saldoFinal = base;

        // --- Escritura de resultados en el formulario ---
        setFieldValue(NOV.abonoMinimo,         abonoMinimo);
        setFieldValue(NOV.tasaGxC,             tasaGxC);         // se guarda sin floor (es un %)
        setFieldValue(NOV.gastosCobranza,      gastosCobranza);
        setFieldValue(NOV.factMes1,            piso(factMes1));
        setFieldValue(NOV.factMes2a6,          piso(factMes2a6));
        setFieldValue(NOV.cuotaEstimada,       piso(cuotaEstimada));
        setFieldValue(NOV.saldoFinalDiferir,   piso(saldoFinal));
        setFieldValue(NOV.pagoParaNegociacion, pagoNegociacion);

        // Mostrar/ocultar sección de honorarios AL FINAL para que un error de
        // visibilityField no interrumpa el cálculo ya completado.
        try {
            if (typeof toggleHonorarios === 'function') {
                toggleHonorarios(esHonorarios);
            }
        } catch (e2) { /* ignora fallo de visibilidad */ }

    } catch (error) {
        console.error('Error en calculoNovacion:', error);
    }
}


// =============================================================================
// nombre lappiz: consulta rango de dias novaciones
// Gatillo: onDiasMoraChange (cambio en el campo días de mora).
// Lee los días de mora del formulario, consulta la tabla
// SimiladorDNC_Lappiz_rangosGastosCobranza para encontrar el rango que aplica
// y guarda en sessionStorage los cuatro parámetros que calculoNovacion necesita:
//   NOV_topeMin  → tope mínimo de gastos de cobranza ($)
//   NOV_topeMax  → tope máximo de gastos de cobranza ($)
//   NOV_tasaGxC  → tasa de gastos de cobranza (ya multiplicada ×100, queda en %)
//   porMora      → porcentaje de abono mínimo (ya multiplicado ×100, queda en %)
// Al terminar llama a calculoNovacion para actualizar la pantalla.
// =============================================================================
async function consultarRango() {
    var ID_DIAS = '0cb35f96-ddc9-40e7-b948-8f0d4d86bf79'; // UUID campo "días de mora"
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }

    var edadMora = num(getFieldValue(ID_DIAS));

    if (edadMora > 0) {
        // Consulta todos los rangos; el filtro se hace en JS comparando MinDias/MaxDias.
        var queryRango = "select * from SimiladorDNC_Lappiz_rangosGastosCobranza";

        await execQuery(queryRango).then(function (resRango) {
            var filas = (resRango && resRango[0]) ? resRango[0] : [];
            var rango = null;

            // Busca el primer rango cuyo intervalo [MinDias, MaxDias] contiene edadMora.
            for (var i = 0; i < filas.length; i++) {
                if (edadMora >= num(filas[i].MinDias) && edadMora <= num(filas[i].MaxDias)) {
                    rango = filas[i];
                    break;
                }
            }

            // Si no hay coincidencia, todos los parámetros quedan en 0.
            var topeMin = 0, topeMax = 0, tasaGxCporc = 0, porcAbono = 0;
            if (rango) {
                topeMin     = num(rango.TopeMinimo);
                topeMax     = num(rango.TopeMaximo);
                tasaGxCporc = num(rango.PorcTasaGastoCobranza) * 100; // BD guarda fracción → convertir a %
                porcAbono   = num(rango.PorcAbonoMinimo)       * 100; // BD guarda fracción → convertir a %
            }

            // Persiste los valores para que calculoNovacion los lea sin nueva consulta.
            sessionStorage.NOV_topeMin = topeMin;
            sessionStorage.NOV_topeMax = topeMax;
            sessionStorage.NOV_tasaGxC = tasaGxCporc;
            sessionStorage.porMora     = porcAbono;

            if (typeof calculoNovacion === 'function') { calculoNovacion(); }
        }).catch(function (err) {
            console.error('consultarRango - error:', err);
        });
    } else {
        // Sin días de mora: limpia los parámetros y recalcula con valores en 0.
        sessionStorage.NOV_topeMin = 0;
        sessionStorage.NOV_topeMax = 0;
        sessionStorage.NOV_tasaGxC = 0;
        if (typeof calculoNovacion === 'function') { calculoNovacion(); }
    }
}


// =============================================================================
// nombre lappiz: evento para la validacion del pago para negociacion en novaciones
// Gatillo: onPagoNegociacionChange (y puede llamarse directamente).
// Compara el abono mínimo calculado contra el pago ingresado por el usuario.
// Si el abono supera al pago, muestra una advertencia visual con toastr.
// No bloquea el guardado; es solo informativo.
// =============================================================================
function validacion() {
    var abono = parseFloat(getFieldValue('4cbf2d64-0442-4c98-964f-e741a6a4e6a1')) || 0; // abonoMinimo
    var pago  = parseFloat(getFieldValue('92bcba6d-4dab-459e-bd8f-164da7eeb526')) || 0; // pagoParaNegociacion
    if (abono > pago) {
        toastr.warning("El pago para la negociación debe de ser mayor al abono mínimo requerido");
    }
}


// =============================================================================
// nombre lappiz: Recalcular valores de novacion dias mora
// Gatillo: evento onChange del campo "días de mora" en Lappiz.
// Delega a consultarRango, que recarga los topes/tasas desde BD y luego
// vuelve a ejecutar calculoNovacion.
// =============================================================================
function onDiasMoraChange(e) {
    if (typeof consultarRango === 'function') { consultarRango(); }
}


// =============================================================================
// nombre lappiz: Recalculo pago minimo novaciones
// Gatillo: evento onChange del campo "Pago para la negociación" en Lappiz.
// 1. Copia el valor ingresado al campo pagoMinimo (UUID fijo), porque el
//    usuario puede ajustar manualmente cuánto quiere pagar.
// 2. Llama a validacion para alertar si el valor es menor al abonoMinimo.
// 3. Recalcula la novación completa con el nuevo pagoMinimo.
// =============================================================================
function onPagoNegociacionChange(e) {
    setFieldValue('1f7c2b79-87a6-402f-95f2-414aea88a4bf', e.value); // sincroniza pagoMinimo
    if (typeof validacion  === 'function') { validacion(e.value); }
    if (typeof calculoNovacion === 'function') { calculoNovacion(); }
}


// =============================================================================
// nombre lappiz: toogle Honorarios Novacion
// Muestra u oculta los campos relacionados con honorarios según el parámetro
// booleano `mostrar`.
//
// Campos DIRECTOS (visibles solo si esHonorarios = true):
//   46155d51  → Línea
//   baa0e784  → Tipo de Cartera
//   075c9be0  → Honorarios
// Se busca el contenedor padre más cercano (app-field, .form-group, etc.)
// para ocultar todo el bloque visual, no solo el input.
//
// Campos INVERSOS (visibles solo si esHonorarios = false):
//   435298fd  → Tasa GxC
//   3300e7e1  → Gastos de Cobranza
//   eb81310f  → Factor mes 1
//   9f4dc8d9  → Factor meses 2-6
//   1f7c2b79  → Pago mínimo
// Se usan con visibilityField (API de Lappiz): true = visible, false = oculto.
// =============================================================================
function toggleHonorarios(mostrar) {
    // Campos exclusivos del flujo Honorarios
    var ids = [
        '46155d51-2885-490a-8a71-d75a35da95b4', // Línea
        'baa0e784-8248-45b8-9394-8932fe45094e', // Tipo de Cartera
        '075c9be0-baad-48b2-864d-acae840b7256'  // Honorarios
    ];

    var display = mostrar ? '' : 'none';

    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (!el) continue;

        // Sube al contenedor del campo para ocultar el bloque completo (label + input).
        var cont =
            el.closest('app-field')         ||
            el.closest('.form-group')        ||
            el.closest('.field')             ||
            el.closest('[class*="col-"]')    ||
            el.parentElement;

        if (cont) {
            cont.style.display = display;
        } else {
            el.style.display = display;
        }
    }

    // Campos que deben ocultarse CUANDO es honorarios (lógica inversa).
    var camposInversos = [
        '435298fd-5cda-4327-9e83-079eda46f0a9', // Tasa GxC
        '3300e7e1-8d86-47d1-b709-2aa4773ec615', // Gastos de Cobranza
        'eb81310f-a2f4-4cac-8dee-cd877f840a0f', // Factor mes 1
        '9f4dc8d9-4df5-46b4-89b5-4e9271b003eb', // Factor meses 2-6
        '1f7c2b79-87a6-402f-95f2-414aea88a4bf'  // Pago mínimo
    ];

    // visibilityField(id, true) = mostrar | visibilityField(id, false) = ocultar
    for (var j = 0; j < camposInversos.length; j++) {
        visibilityField(camposInversos[j], mostrar ? false : true);
    }
}


// =============================================================================
// nombre lappiz: registrar switch honorarios novacion
// Gatillo: evento onDataLoad del formulario (se llama una vez cuando carga el registro).
// Hace dos cosas:
//   1. Registra el listener onChange del toggle #check para que cada vez que el
//      usuario lo mueva se apliquen visibilidad y recálculo en tiempo real.
//      Usa .off().on() para evitar listeners duplicados en re-renders de Lappiz.
//   2. Determina el estado INICIAL del toggle según sessionStorage.TipoCobro:
//      si empieza con "HONORARIO" (case-insensitive) → marca el toggle y oculta
//      los campos de cobranza; de lo contrario los deja visibles.
// =============================================================================
function registrarSwitchHonorarios() {
    // Listener para interacción manual del usuario con el toggle
    $(document).off('change', '#check').on('change', '#check', function () {
        toggleHonorarios(this.checked);
        if (typeof calculoNovacion === 'function') { calculoNovacion(); }
    });

    // Aplica el estado inicial según el tipo de cobro del registro cargado
    var chk = document.getElementById('check');
    if (chk) {
        var tipoCobro     = (sessionStorage.TipoCobro || '').toUpperCase();
        var esHonorarios  = (tipoCobro.indexOf('HONORARIO') === 0);

        chk.checked = esHonorarios;          // sincroniza el toggle visualmente
        toggleHonorarios(esHonorarios);      // aplica la visibilidad correspondiente
    }
}
