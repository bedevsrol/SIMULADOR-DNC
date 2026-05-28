//En este documento haremos la gestion de datos fun consolidacion
// generamos la relacion de los ids comparado con campos del FUN real
function DataFunConsolidacion(mecanismo) {
    function DataCon() {
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
        // =======================
        // INFORMACIÓN CLIENTE
        // =======================
        var descripcionActividad = document.getElementById("c852f2a7-6f9c-48f6-96b5-6fdc26c399ef").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.getElementById("c852f2a7-6f9c-48f6-96b5-6fdc26c399ef").selectedOptions[0].innerText || "";
        var ingresoMensual = document.getElementById("67631aed-75e4-4b23-8601-17cadd1c7003").getAttribute("aria-valuenow") || "$";
        var ocupacionAdicional = document.getElementById("b54af750-167e-4831-bb8c-c374e7f45202").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.getElementById("b54af750-167e-4831-bb8c-c374e7f45202").selectedOptions[0].innerText || "";
        var ingresosAdicionales = document.getElementById("1a47c2c1-4551-4d13-89ca-82e89ce655c0").getAttribute("aria-valuenow") || "$";

        // =======================
        // CONSOLIDACIÓN
        // =======================
        var bajaEnCuentaIntCte = document.getElementById("b42b41d8-cd57-4233-9bff-8a5ceec5af03").getAttribute("aria-valuenow") || "$";
        var bajaEnCuentaIntMoraIcsConsolidacion = document.getElementById("e079d101-5148-42ed-854e-9be982adc01e").getAttribute("aria-valuenow") || "$";
        var bajaEnCuentaIntExtrac = document.getElementById("e970af6e-de8d-47b3-97d0-98e4950c9bdf").getAttribute("aria-valuenow") || "$";
        var saldo = document.getElementById("69b7fc43-675b-4984-bd64-9fd68799a97b").getAttribute("aria-valuenow") || "$";
        var amortizacion = document.getElementById("03011879-0560-4a41-826b-888c89f6ab83").getAttribute("aria-valuenow") || "$";
        var plazo = document.getElementById("aa4de771-cbaf-486d-8de2-06941dc220d5").getAttribute("aria-valuenow") || "$";
        var tasaIntEA = document.getElementById("c9f5317e-9099-43f1-9b7f-78b93d99aa6a").getAttribute("aria-valuenow") || "$";
        var cuotaProyectada = document.getElementById("e74b2587-dccc-4395-8333-f6c2f34338aa").getAttribute("aria-valuenow") || "$";
        var pagoNegociacion = document.getElementById("0ee03528-b018-47d1-856b-9e30dbae2ddf").getAttribute("aria-valuenow") || "$";

        // =======================
        // PÁGINA 4
        // =======================
        var observacionesPag4 = document.getElementById("be70a202-71a9-40ea-851b-945702693b51").value || "";
        var pregunta1 = getSelectText("pregunta1");
        var pregunta2 = getSelectText("pregunta2");
        var pregunta3 = getSelectText("pregunta3");
        var pregunta4 = getSelectText("pregunta4");
        var garantiaFAG = getSelectText("garantiaFAG");
        var garantiaFNG = getSelectText("garantiaFNG");

        return {
            descripcionActividad,
            ingresoMensual,
            ocupacionAdicional,
            ingresosAdicionales,
            bajaEnCuentaIntCte,
            bajaEnCuentaIntMoraIcsConsolidacion,
            bajaEnCuentaIntExtrac,
            saldoTotalDesembolsar,
            saldo,
            amortizacion,
            plazo,
            tasaIntEA,
            cuotaProyectada,
            pagoNegociacion,
            observacionesPag4,
            pregunta1,
            pregunta2,
            pregunta3,
            pregunta4,
            garantiaFAG,
            garantiaFNG,
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

        document.getElementById("saldoTotalCap_" + mecanismo).textContent = data.saldoTotalDesembolsar;
        document.getElementById("amortizacion_" + mecanismo).textContent = data.amortizacion;
        document.getElementById("nuevoPlazo_" + mecanismo).textContent = data.plazo;
        document.getElementById("tasaNegociacion_" + mecanismo).textContent = formateador.format(data.tasaIntEA);
        document.getElementById("valCuotaProyectada_" + mecanismo).textContent = formateador.format(data.cuotaProyectada);
        document.getElementById("pagoNegociacionNew_" + mecanismo).textContent = formateador.format(data.pagoNegociacion);

        document.getElementById("observaciones_" + mecanismo).textContent = data.observacionesPag4;

        document.getElementById("pregunta1_" + mecanismo).textContent = data.pregunta1;
        document.getElementById("pregunta2_" + mecanismo).textContent = data.pregunta2;
        document.getElementById("pregunta3_" + mecanismo).textContent = data.pregunta3;
        document.getElementById("pregunta4_" + mecanismo).textContent = data.pregunta4;
        document.getElementById("garantiaFAG_" + mecanismo).textContent = data.garantiaFAG;
        document.getElementById("garantiaFNG_" + mecanismo).textContent = data.garantiaFNG;
    }

    setTimeout(() => {
        loadFormData(DataCon());
        console.log("Datos para novacion cargados");
        console.log("Datos:", DataCon());
    }, 500);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
function obligacionConsolidacionvacia(data) {}
async function obligacionConsolidacion(data) {
    const consolidacionDiv = document.getElementById("consolidacion");
    consolidacionDiv.innerHTML = "";
    // Ejecutar consulta para obtener el response
    let response = await execQuery(`EXEC SimiladorDNC_Lappiz_EmailConfirmed @sw = 11`);

    // Obtener el listado de data items del response
    const dataItems = response[0]; // Se asume que esto contiene un arreglo con los elementos

    // Variables para el cálculo
    sessionStorage.PorcentajeConsolidacionMora = data[0].PorcentajeConsolidacionMora;
    sessionStorage.PorcentajeConsolidacionExtraC = data[0].PorcentajeConsolidacionExtraC;
    sessionStorage.PorcentajeConsolidacionCorriente = data[0].PorcentajeConsolidacionCorriente;

    if (data[0].MecanismoAplicaCampana && data[0].MecanismoAplicaCampana.includes("CONSOLIDACION")) {
        console.log("si tiene");
        sessionStorage.PorcentajeConsolidacionMora = data[0].DtoInteresesMoraCampana;
        sessionStorage.PorcentajeConsolidacionExtraC = data[0].DtoInteresExtracontablesCampana;
        sessionStorage.PorcentajeConsolidacionCorriente = data[0].DtoInteresesCampana;
        setFieldValue("c9f5317e-9099-43f1-9b7f-78b93d99aa6a", data[0].TasaCampana);
    }

    // Crear dinámicamente las cards
    data.forEach((item) => {
        const card1 = document.createElement("div");
        card1.className = "card1";

        // Título
        const title = document.createElement("h3");
        title.textContent = `Obligación: ${item.Obl}`;
        card1.appendChild(title);

        // Toggle Switch
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "toggle-switch";

        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.id = `toggle-${item.Obl}`;

        // Activar el toggle si SecuenciaObl es igual a 1
        toggleInput.checked = item.SecuenciaObl === "1";

        const toggleLabel = document.createElement("label");
        toggleLabel.htmlFor = `toggle-${item.Obl}`;
        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(toggleLabel);
        card1.appendChild(toggleContainer);

        // Campos
        const fields = [
            { label: "Saldo Total *", value: item.SaldoTotalObl },
            { label: "Interes Corriente *", value: item.InteresCteObl },
            { label: "Interes Mora *", value: item.InteresMoraObl },
            { label: 'Int Extracontables "TC"', value: item.InteresesExtracontablesObl },
        ];

        fields.forEach((field) => {
            const fieldContainer = document.createElement("div");
            fieldContainer.className = "field-container";

            const label = document.createElement("label");
            label.textContent = field.label;

            const input = document.createElement("input");
            input.type = "text";
            input.classList.add("input");
            input.setAttribute("data-label", field.label);
            input.value = formatNumber2(field.value); // Mostrar formateado
            input.setAttribute("data-raw-value", field.value); // Guardar el valor original sin formato

            // Habilitar o deshabilitar el input según el estado inicial del toggle
            input.disabled = item.SecuenciaObl !== "1";

            // Formatear al escribir
            input.addEventListener("input", (e) => {
                const rawValue = e.target.value.replace(/\D/g, ""); // Quitar todo excepto números
                e.target.setAttribute("data-raw-value", rawValue); // Actualizar el valor sin formato
                e.target.value = formatNumber2(rawValue); // Mostrar formateado
            });

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            card1.appendChild(fieldContainer);

            // Habilitar/deshabilitar campos cuando cambie el estado del toggle
            toggleInput.addEventListener("change", () => {
                input.disabled = !toggleInput.checked;
            });
        });

        // Campo "Marca Obligación" como lista desplegable
        const marcaFieldContainer = document.createElement("div");
        marcaFieldContainer.className = "field-container";

        const marcaLabel = document.createElement("label");
        marcaLabel.textContent = "Marca Obligación";

        const select = document.createElement("select");
        select.classList.add("marca-obligacion");

        // Rellenar el select con las opciones del response[0]
        dataItems.forEach((dataItem) => {
            const option = document.createElement("option");
            option.value = dataItem.Id;
            option.textContent = dataItem.Title;

            // Agregar los nuevos atributos PeorMarca y MarcaLetra a cada opción
            option.setAttribute("data-peorMarca", dataItem.PeorMarca);
            option.setAttribute("data-marcaLetra", dataItem.MarcaLetra);

            select.appendChild(option);

            // Seleccionar la opción correcta si contiene el texto del item.MarcaObl026
            if (dataItem.Title.includes(item.MarcaObl026)) {
                option.selected = true;
            }
        });

        // Deshabilitar el select si el toggle no está activado
        select.disabled = item.SecuenciaObl !== "1";

        marcaFieldContainer.appendChild(marcaLabel);
        marcaFieldContainer.appendChild(select);
        card1.appendChild(marcaFieldContainer);

        // Habilitar/deshabilitar el select cuando cambie el estado del toggle
        toggleInput.addEventListener("change", () => {
            select.disabled = !toggleInput.checked;
        });

        // Agregar la card1 al contenedor principal
        consolidacionDiv.appendChild(card1);
    });
}

// Función para formatear números con separadores de miles
function formatNumber2(value) {
    if (!value) return "";
    return parseFloat(value).toLocaleString("es-CO");
}*/