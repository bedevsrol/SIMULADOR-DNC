

*acomodar todos los requiere tramite en la sox de cada mecanismo que se por default sea No

*que habilite el flujo del Formulario Formato excepciones

*y que llene lo que viene de la base de datos y datos faltantes porque algunos vienen completos de la base informacion general de la obligacion

*levantar ids de la negociacion como tal verificando con el excel y agrupar todo para hacer una sola consulta con el Formulario final

*que haya boton de agregar Negociacion con excepcion y swalfire de seguro?

*y que aqui se haga la consulta, una SOLA CONSULTA  
/* ============================================================================
   Data — Formato de Excepciones
   ----------------------------------------------------------------------------
   Sirve para DATA CARGADA y DATA CREADA por igual:
     - UserCargado === 'si'  -> lee de sessionStorage (datos que ya llegaron
                                 con el cliente desde valoresPoblamiento).
     - UserCargado !== 'si'  -> lee con getFieldValue de los campos que el
                                 usuario llenó a mano en el formulario.

   Uso: Data('novacion' | 'consolidacion' | 'pagomora' | 'cancelacion' | 'ampliacion')

   PENDIENTE (marcado con <<< >>>):
     1. Reemplazar los GUID de getFieldValue por los IDs reales del formulario
        de excepciones, uno por mecanismo.
     2. Confirmar los nombres exactos de columnas en la tabla FormatoExcepciones
        para el EXEC final.
============================================================================ */

async function Data(mecanismo) {
    function num(v) { return isNaN(parseFloat(v)) ? 0 : parseFloat(v); }

    var userCargado = (sessionStorage.getItem('UserCargado') === 'si');

    var datos = {};

    try {
        switch (mecanismo) {

            // ================= CONSOLIDACIÓN =================
            case 'consolidacion':
                if (userCargado) {
                    datos = {
                        saldoTotal:      sessionStorage.getItem('SaldoTotalConsolidacion') || 0,
                        interesCorriente:sessionStorage.getItem('PorcentajeConsolidacionCorriente') || 0,
                        interesMora:     sessionStorage.getItem('PorcentajeConsolidacionMora') || 0,
                        interesExtra:    sessionStorage.getItem('PorcentajeConsolidacionExtraC') || 0
                        // <<< agregar más campos de sessionStorage aquí >>>
                    };
                } else {
                    datos = {
                        saldoTotal:       num(getFieldValue('GUID_SALDO_TOTAL_CONSOLIDACION')),        // <<< reemplazar GUID
                        interesCorriente: num(getFieldValue('GUID_INT_CORRIENTE_CONSOLIDACION')),      // <<< reemplazar GUID
                        interesMora:      num(getFieldValue('GUID_INT_MORA_CONSOLIDACION')),           // <<< reemplazar GUID
                        interesExtra:     num(getFieldValue('GUID_INT_EXTRA_CONSOLIDACION'))           // <<< reemplazar GUID
                        // <<< agregar más campos con getFieldValue aquí >>>
                    };
                }
                break;

            // ================= NOVACIÓN =================
            case 'novacion':
                if (userCargado) {
                    datos = {
                        saldoTotal:  sessionStorage.getItem('honorariosValues') || 0,
                        tipoCobro:   sessionStorage.getItem('TipoCobro') || '',
                        tipoCartera: sessionStorage.getItem('TipoCartera') || '',
                        linea:       sessionStorage.getItem('Linea') || ''
                        // <<< agregar más campos de sessionStorage aquí >>>
                    };
                } else {
                    datos = {
                        saldoTotal:  num(getFieldValue('616e6102-56e5-48e9-bfc2-fce8497e629d')),  // Saldo total (ya conocido)
                        tipoCobro:   getFieldValue('7f0df958-9e6d-48ba-95e3-0b3a8bc2e0fe'),        // Tipo de cobro (ya conocido)
                        tipoCartera: getFieldValue('baa0e784-8248-45b8-9394-8932fe45094e'),        // Tipo cartera (ya conocido)
                        linea:       getFieldValue('46155d51-2885-490a-8a71-d75a35da95b4')         // Línea (ya conocida)
                        // <<< agregar más campos con getFieldValue aquí >>>
                    };
                }
                break;

            // ================= PAGO MORA =================
            case 'pagomora':
                if (userCargado) {
                    datos = {
                        pagoMinimo: sessionStorage.getItem('PagoMinObl') || 0
                        // <<< agregar más campos de sessionStorage aquí >>>
                    };
                } else {
                    datos = {
                        pagoMinimo: num(getFieldValue('GUID_PAGO_MINIMO_MORA'))   // <<< reemplazar GUID
                        // <<< agregar más campos con getFieldValue aquí >>>
                    };
                }
                break;

            // ================= CANCELACIÓN =================
            case 'cancelacion':
                if (userCargado) {
                    datos = {
                        saldoTotal: sessionStorage.getItem('SaldoTotalCancelacion') || 0
                        // <<< agregar más campos de sessionStorage aquí >>>
                    };
                } else {
                    datos = {
                        saldoTotal: num(getFieldValue('GUID_SALDO_TOTAL_CANCELACION'))   // <<< reemplazar GUID
                        // <<< agregar más campos con getFieldValue aquí >>>
                    };
                }
                break;

            // ================= AMPLIACIÓN =================
            case 'ampliacion':
                if (userCargado) {
                    datos = {
                        capitalTotal: sessionStorage.getItem('CapitalTotalObl') || 0
                        // <<< agregar más campos de sessionStorage aquí >>>
                    };
                } else {
                    datos = {
                        capitalTotal: num(getFieldValue('GUID_CAPITAL_TOTAL_AMPLIACION'))   // <<< reemplazar GUID
                        // <<< agregar más campos con getFieldValue aquí >>>
                    };
                }
                break;

            default:
                console.error('Data() - mecanismo no reconocido:', mecanismo);
                return;
        }

        // ================= GUARDAR / CONSULTAR EN FORMATOEXCEPCIONES =================
        // <<< Ajustar nombres de columnas y parámetros según la tabla real >>>
        var query = `EXEC SimiladorDNC_Lappiz_FormatoExcepciones ` +
            `@mecanismo = '${mecanismo}', ` +
            `@cedula = '${sessionStorage.getItem('cedula') || ''}', ` +   // <<< ajustar nombre real de sessionStorage
            `@datos = '${JSON.stringify(datos)}'`;                        // <<< ajustar según cómo reciba los datos el SP

        var response = await execQuery(query);
        console.log('Data(' + mecanismo + ') -> respuesta:', response);
        return response;

    } catch (error) {
        console.error('Error en Data(' + mecanismo + '):', error);
    }
}
