// ============================================================
// MÓDULO: Honorarios - Mecanismo de Mora
// Contiene funciones para calcular, recalcular y cargar
// los datos de honorarios en el simulador DNC.
// ============================================================


// Función placeholder vacía, reservada para validaciones
// o lógica futura de campos vacíos de honorarios.
function honoraVacios() {
}


// Consulta en BD el porcentaje de honorarios según el tipo de cartera
// seleccionado por el usuario, calcula el valor a pagar sobre el abono
// máximo y lo escribe en el campo correspondiente del formulario.
async function calculoHonorarios() {
    try {
        debugger;
        
        // Obtiene el tipo de honorarios seleccionado en el evento actual
        let tipocartera = e.dataItem.TipoHonorarios;

        // Consulta el porcentaje y tipo de honorarios según el tipo de cartera
        let query = `select ValorHonorarios,TipoHonorarios  from SimiladorDNC_Lappiz_dethonorarios where TipoHonorarios = '${tipocartera}'`
        let response = await execQuery(query)
        console.log(response[0][0])

        // Guarda en sessionStorage el porcentaje y el tipo obtenidos de la BD
        sessionStorage.PorcCartera = response[0][0].ValorHonorarios
        sessionStorage.TipoHonorarios = response[0][0].TipoHonorarios

        // Lee el abono máximo desde el campo del formulario
        let abonomax = getFieldValue("8f7266d7-dfc0-4ff4-afad-c50fbfa67062")

        // Calcula el valor de honorarios: abono máximo × porcentaje / 100
        let pagoHonorarios = (abonomax * sessionStorage.PorcCartera) / 100

        // Escribe el valor calculado de honorarios en el campo del formulario
        setFieldValue('993c55c0-8b02-4be9-a122-d7ec2cf5f87e', pagoHonorarios)

    } catch (error) {
        console.error("Error al mostrar los campos:", error);
    }
}


// Recalcula el abono máximo y valida que el valor de honorarios confirmado
// no supere el máximo permitido. Si lo supera, muestra un error y lo corrige.
function recalculoHonorarios() {

    // Abono máximo sin honorarios (campo base)
    let abonomaxSINHonorarios = getFieldValue("8f7266d7-dfc0-4ff4-afad-c50fbfa67062")

    // Valor de honorarios ya calculado previamente
    let abonoMaxHonorarios = getFieldValue("993c55c0-8b02-4be9-a122-d7ec2cf5f87e");

    // Valor de honorarios confirmado/digitado por el usuario
    let honoConfirm = getFieldValue("ae33bcc4-183a-47de-a6c8-f4ecc44be169");

    // Si el usuario ingresó un valor positivo de honorarios (lógica comentada
    // dejada para posible suma futura), de lo contrario deja el abono igual
    if (honoConfirm > 0) {
        // Suma comentada: actualmente no modifica el abono máximo
        //let sumaHonorarios = abonoMaxHonorarios + abonomaxSINHonorarios;
        //setFieldValue('8f7266d7-dfc0-4ff4-afad-c50fbfa67062', sumaHonorarios);
    } else if (honoConfirm <= 0) {
        // Sin honorarios confirmados, mantiene el abono máximo original
        setFieldValue('8f7266d7-dfc0-4ff4-afad-c50fbfa67062', abonomaxSINHonorarios);
    }

    // Valida que el valor confirmado no exceda el máximo de honorarios permitido
    if (honoConfirm > abonoMaxHonorarios) {
        // Muestra alerta al usuario y corrige el campo al valor máximo permitido
        toastr.error('El valor no puede ser mayor al abono maximo permitido de $' + abonoMaxHonorarios);
        setFieldValue('ae33bcc4-183a-47de-a6c8-f4ecc44be169', abonoMaxHonorarios);
    }
}


// Función placeholder vacía, usada como callback genérico en eventos
// donde no se requiere ejecutar ninguna acción adicional.
function vacia() {

}


// Precarga los campos de honorarios (check, línea de producto y tipo de cartera)
// en el formulario cuando el tipo de cobro corresponde a HONORARIO/HONORARIOS.
// Recibe los IDs de los elementos del DOM y los valores a precargar.
async function CargaCamposHonorarios(idcheck, idlineaKendo, idTipoCarteraKendo, tipocobro, tipolinea, tipocartera) {

    debugger
    console.log([idcheck, idlineaKendo, idTipoCarteraKendo, tipocobro, tipolinea, tipocartera]);

    // Verifica que se hayan enviado los tres IDs requeridos; aborta con error si faltan
    if (!(idcheck && idlineaKendo && idTipoCarteraKendo)) {
        console.error("No se enviaron los uid de los elementos")
    }

    // Solo ejecuta la carga si el tipo de cobro es honorario
    if (tipocobro == "HONORARIO" || tipocobro == "HONORARIOS") {

        // Activa el checkbox de honorarios y dispara su evento change para
        // que el formulario reaccione como si el usuario lo hubiera marcado
        const chk = document.getElementById(idcheck);
        chk.checked = true;
        chk.dispatchEvent(new Event('change', { bubbles: true }));

        // Carga la línea de producto: consulta el nombre en BD por código
        // y selecciona el ítem correspondiente en el DropDownList de Kendo UI
        try {
            let query = `SELECT NomProductos FROM SimiladorDNC_Lappiz_LineaProducto WHERE CodCodigo = '${tipolinea}'`
            let response = await execQuery(query)
            console.log(response[0][0])
            let response_nombre = response[0][0].NomProductos

            // Obtiene la instancia del DropDownList de Kendo para línea de producto
            var dropDownList1 = kendo.jQuery(idlineaKendo).data("kendoDropDownList");

            // Busca en el datasource el ítem cuyo nombre coincida con el obtenido en BD
            var item = dropDownList1.dataSource.data().find(
                x => x.NomProductos === response_nombre
            );

            // Si encuentra el ítem, lo selecciona y dispara el evento change
            if (item) {
                dropDownList1.value(item.Id);
                dropDownList1.trigger("change");
            }

        } catch (error) {
            console.error("Error al mostrar los campos:", error);
        }

        // Carga el tipo de cartera: busca en el datasource del segundo DropDownList
        // el ítem cuyo TipoHonorarios coincida con el parámetro recibido
        var dropDownList2 = kendo.jQuery(idTipoCarteraKendo).data("kendoDropDownList");
        var item2 = dropDownList2.dataSource.data().find(
            x => x.TipoHonorarios === tipocartera
        );
        console.log(item2)

        // Si encuentra el ítem, lo selecciona y dispara el evento change
        if (item2) {
            dropDownList2.value(item2.Id);
            dropDownList2.trigger("change");
        }
    }
}
