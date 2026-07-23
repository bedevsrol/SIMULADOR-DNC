//funcion para poner las obligaciones  en consolidacion
function obligacionConsolidacionvacia(data) {}

async function obligacionConsolidacion(data) {
    const consolidacionDiv = document.getElementById("consolidacion");
    consolidacionDiv.innerHTML = "";

    // Ejecutar consulta para obtener el response
    let response = await execQuery(`EXEC SimiladorDNC_Lappiz_EmailConfirmed @sw = 11`);
    const dataItems = response[0];

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
        toggleInput.checked = item.SecuenciaObl === "1";

        const toggleLabel = document.createElement("label");
        toggleLabel.htmlFor = `toggle-${item.Obl}`;

        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(toggleLabel);
        card1.appendChild(toggleContainer);

        // --- Saldo total ya restado con honorarios ---
        var honorarios = parseFloat(item.CustomNumber1) || 0;
        var saldoRestado = (parseFloat(item.SaldoTotalObl) || 0) - honorarios;

        // Campos
        const fields = [
            { label: "Saldo Total *", value: saldoRestado },
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
            input.value = formatNumber2(field.value);
            input.setAttribute("data-raw-value", field.value);

            // Habilitar o deshabilitar el input según el estado inicial del toggle
            input.disabled = item.SecuenciaObl !== "1";

            // Formatear al escribir
            input.addEventListener("input", (e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                e.target.setAttribute("data-raw-value", rawValue);
                e.target.value = formatNumber2(rawValue);
            });

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            card1.appendChild(fieldContainer);

            // Habilitar/deshabilitar cuando cambie el toggle
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

        dataItems.forEach((dataItem) => {
            const option = document.createElement("option");
            option.value = dataItem.Id;
            option.textContent = dataItem.Title;
            option.setAttribute("data-peorMarca", dataItem.PeorMarca);
            option.setAttribute("data-marcaLetra", dataItem.MarcaLetra);
            select.appendChild(option);
            if (dataItem.Title.includes(item.MarcaObl026)) {
                option.selected = true;
            }
        });

        select.disabled = item.SecuenciaObl !== "1";

        marcaFieldContainer.appendChild(marcaLabel);
        marcaFieldContainer.appendChild(select);
        card1.appendChild(marcaFieldContainer);

        toggleInput.addEventListener("change", () => {
            select.disabled = !toggleInput.checked;
        });

        consolidacionDiv.appendChild(card1);
    });
}



// Función para formatear números con separadores de miles
function formatNumber2(value) {
    if (!value) return "";
    return parseFloat(value).toLocaleString("es-CO");
}

//btncrearobl.js
$(document).on('click', '#adicionar-obligacion', function () {
    console.log("Botón de adicionar obligación clickeado");
    debugger;
    try {
        Swal.fire({
            title: '¿Cuántas obligaciones quieres añadir?',
            html: `
    <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin: 20px 0;">
      <button type="button" id="minus" class="swal2-styled" style="background-color: #ffe100; margin: 0; border-radius: 5px; width: 40px;">-</button>
      <b id="cantidad" style="font-size: 1.5rem; width: 40px; text-align: center;">1</b>
      <button type="button" id="plus" class="swal2-styled" style="background-color: #0041a4; margin: 0; border-radius: 5px; width: 40px;">+</button>
    </div>
  `,
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            didOpen: () => {
                const btnMinus = Swal.getHtmlContainer().querySelector('#minus');
                const btnPlus = Swal.getHtmlContainer().querySelector('#plus');
                const display = Swal.getHtmlContainer().querySelector('#cantidad');

                let valor = 1;

                btnMinus.onclick = () => {
                    if (valor > 1) {
                        valor--;
                        display.innerText = valor;
                    }
                };

                btnPlus.onclick = () => {
                    valor++;
                    display.innerText = valor;
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Obtenemos el valor directamente del texto del elemento HTML
                const cantidadFinal = document.getElementById('cantidad').innerText;
                

                Swal.fire(`Elegiste ${cantidadFinal} obligaciones`);
                var cantidad = cantidadFinal; // Asignamos la cantidad seleccionada a la variable
                obligacionSinBaseConsolidacion(cantidad) // Retorna la cantidad seleccionada
            }
        });
    } catch (error) {
        console.error("Error al enviar los datos:", error);
    }
});

//crear obligaciones cuando no estan en base para consolidacion

function obligacionesSinBaseConsolidacionvacia(data) {}

async function obligacionSinBaseConsolidacion(Cantidad) {
    debugger;
    const consolidacionDiv = document.getElementById("consolidacion");
    //consolidacionDiv.innerHTML = "";

    // Ejecutar consulta para obtener el response
    const response = await execQuery(`EXEC SimiladorDNC_Lappiz_EmailConfirmed @sw = 11`);
    const dataItems = response[0]; // Se asume que esto contiene un arreglo con los elementos

    for (let i = 0; i < Cantidad; i++) {
        const card1 = document.createElement("div");
        card1.className = "card1";

        // Agregar encabezado <h3> con un texto inicial
        const header = document.createElement("h3");
        header.textContent = "Obligación: ";
        card1.appendChild(header);

        // Campo editable para Obligación
        const obligationContainer = document.createElement("div");
        obligationContainer.className = "field-container";

        const obligationLabel = document.createElement("label");
        obligationLabel.textContent = "Obligación * :";

        const obligationInput = document.createElement("input");
        obligationInput.type = "text";
        obligationInput.classList.add("obligation-input");
        obligationInput.placeholder = "Ingrese la obligación";
        obligationInput.id = `obligation-${i}`;
        obligationInput.setAttribute("data-label", "Obligación");

        obligationInput.addEventListener("input", () => {
            header.textContent = `Obligación: ${obligationInput.value}`;
        });

        obligationContainer.appendChild(obligationLabel);
        obligationContainer.appendChild(obligationInput);
        card1.appendChild(obligationContainer);

        // Toggle Switch
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "toggle-switch";

        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.id = `toggle-${i}`;

        const toggleLabel = document.createElement("label");
        toggleLabel.htmlFor = `toggle-${i}`;
        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(toggleLabel);
        card1.appendChild(toggleContainer);

        // Campos adicionales con formato de miles
        const fields = [
            { label: "Saldo Total *", id: "saldoTotal" },
            { label: "Interes Corriente *", id: "interesCorriente" },
            { label: "Interes Mora *", id: "interesMora" },
            { label: 'Int Extracontables "TC"', id: "interesesExtracontables" },
        ];

        fields.forEach((field) => {
            const fieldContainer = document.createElement("div");
            fieldContainer.className = "field-container";

            const label = document.createElement("label");
            label.textContent = field.label;

            const input = document.createElement("input");
            input.type = "text"; // Usamos "text" para aplicar el formato
            input.classList.add("input");
            input.placeholder = `Ingrese ${field.label}`;
            input.id = `${field.id}-${i}`;
            input.setAttribute("data-label", field.label);
            input.setAttribute("data-raw-value", "0"); // Valor inicial en formato crudo
            input.disabled = true;

            // Formatear el valor al escribir
            input.addEventListener("input", (e) => {
                const rawValue = e.target.value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
                input.setAttribute("data-raw-value", rawValue); // Guardar el valor crudo
                input.value = formatNumber(rawValue); // Mostrar el valor formateado
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
        select.disabled = true;

        dataItems.forEach((dataItem) => {
            const option = document.createElement("option");
            option.value = dataItem.Id;
            option.textContent = dataItem.Title;

            option.setAttribute("data-peorMarca", dataItem.PeorMarca);
            option.setAttribute("data-marcaLetra", dataItem.MarcaLetra);

            select.appendChild(option);
        });

        marcaFieldContainer.appendChild(marcaLabel);
        marcaFieldContainer.appendChild(select);
        card1.appendChild(marcaFieldContainer);

        toggleInput.addEventListener("change", () => {
            select.disabled = !toggleInput.checked;
        });

        consolidacionDiv.appendChild(card1);
    }
}
// Función para formatear números con separadores de miles
function formatNumber(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

//evento fun consolidacion
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

function DataFunConsolidacion(mecanismo) {

    mecanismo = mecanismo.toLowerCase(); // CLAVE

    function dataConsolidacion() {
        function getSelectText(id, defaultValue = "NO") {
            const el = document.getElementById(id);
            if (!el) return defaultValue;
            return el.selectedIndex >= 0
                ? el.options[el.selectedIndex].innerText.trim()
                : defaultValue;
        }

        return {
            descripcionActividad:
                document.getElementById("c852f2a7-6f9c-48f6-96b5-6fdc26c399ef")
                    ?.selectedOptions[0]?.innerText || "",

            ingresoMensual:
                document.getElementById("67631aed-75e4-4b23-8601-17cadd1c7003")
                    ?.getAttribute("aria-valuenow") || "0",

            ocupacionAdicional:
                document.getElementById("b54af750-167e-4831-bb8c-c374e7f45202")
                    ?.selectedOptions[0]?.innerText || "",

            ingresosAdicionales:
                document.getElementById("1a47c2c1-4551-4d13-89ca-82e89ce655c0")
                    ?.getAttribute("aria-valuenow") || "0",

            totalBajaEnCuentaIntCte:
                document.getElementById("04dbcb19-8f74-4eac-81f3-6bcc76cd7f9a")
                    ?.getAttribute("aria-valuenow") || "0",

            totalBajaEnCuentaIntMora:
                document.getElementById("f848cad9-f94d-4e56-9468-863a2a55e402")
                    ?.getAttribute("aria-valuenow") || "0",

            totalBajaEnCuentaExtraContables:
                document.getElementById("dc9166ce-a5c8-4fc7-ad2b-4c6479d63f12")
                    ?.getAttribute("aria-valuenow") || "0",

            saldoTotalDesembolsar:
                document.getElementById("69b7fc43-675b-4984-bd64-9fd68799a97b")
                    ?.getAttribute("aria-valuenow") || "0",

            amortizacion:
                document.getElementById("03011879-0560-4a41-826b-888c89f6ab83")
                    ?.getAttribute("aria-valuenow") || "0",

            plazo:
                document.getElementById("aa4de771-cbaf-486d-8de2-06941dc220d5")
                    ?.getAttribute("aria-valuenow") || "0",

            tasaIntEA:
                document.getElementById("c9f5317e-9099-43f1-9b7f-78b93d99aa6a")
                    ?.getAttribute("aria-valuenow") || "0",

            cuotaProyectada:
                document.getElementById("e74b2587-dccc-4395-8333-f6c2f34338aa")
                    ?.getAttribute("aria-valuenow") || "0",

            pagoNegociacion:
                document.getElementById("0ee03528-b018-47d1-856b-9e30dbae2ddf")
                    ?.getAttribute("aria-valuenow") || "0",

            observacionesPag4:
                document.getElementById("be70a202-71a9-40ea-851b-945702693b51")
                    ?.value || "",

            pregunta1: getSelectText("pregunta1"),
            pregunta2: getSelectText("pregunta2"),
            pregunta3: getSelectText("pregunta3"),
            pregunta4: getSelectText("pregunta4"),
            garantiaFAG: getSelectText("garantiaFAG"),
            garantiaFNG: getSelectText("garantiaFNG"),
        };
    }

    function getObligacionesActivas() {
        const obligaciones = [];

        const toggles = document.querySelectorAll("input[type='checkbox']");

        console.log("TOGGLES:", toggles.length);

        toggles.forEach((toggle) => {

            if (!toggle.checked) return;

            console.log("TOGGLE ACTIVO:", toggle);

            const card = toggle.closest(".card1") || toggle.closest("div");

            if (!card) {
                console.warn("No encontró card");
                return;
            }

            const numObligacion = toggle.id.replace("toggle-", "");

            function getRaw(label) {
                const input = card.querySelector(`input[data-label="${label}"]`);
                return input
                    ? (input.getAttribute("data-raw-value") || "0")
                    : "0";
            }

            const selectMarca = card.querySelector("select.marca-obligacion");

            obligaciones.push({
                numObligacion,
                saldoTotal: getRaw("Saldo Total *"),
                intCorrientes: getRaw("Interes Corriente *"),
                intMora: getRaw("Interes Mora *"),
                intExtraC: getRaw('Int Extracontables "TC"'),
                marcaObligacion: selectMarca?.value || "",
            });
        });

        return obligaciones;
    }

    function setCell(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? "";
    }

    function llenarFilasObligaciones(obligaciones) {
        const MAX_FILAS = 6;

        for (let i = 1; i <= MAX_FILAS; i++) {
            const obl = obligaciones[i - 1];

            if (obl) {
                setCell(`numObligacion_${i}_${mecanismo}`, obl.numObligacion);
                setCell(`saldoTotal_${i}_${mecanismo}`, formateador.format(obl.saldoTotal));
                setCell(`intCorrientes_${i}_${mecanismo}`, formateador.format(obl.intCorrientes));
                setCell(`intMora_${i}_${mecanismo}`, formateador.format(obl.intMora));
                setCell(`intExtraC_${i}_${mecanismo}`, formateador.format(obl.intExtraC));
            } else {
                setCell(`numObligacion_${i}_${mecanismo}`, "");
                setCell(`saldoTotal_${i}_${mecanismo}`, "");
                setCell(`intCorrientes_${i}_${mecanismo}`, "");
                setCell(`intMora_${i}_${mecanismo}`, "");
                setCell(`intExtraC_${i}_${mecanismo}`, "");
            }
        }
    }

    const formateador = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });

    function loadFormData(data) {
        setCell(`descripcionActividad_${mecanismo}`, data.descripcionActividad);
        setCell(`ingresoMensual_${mecanismo}`, formateador.format(data.ingresoMensual));
        setCell(`ocupacionAdicional_${mecanismo}`, data.ocupacionAdicional);
        setCell(`ingresosAdicionales_${mecanismo}`, formateador.format(data.ingresosAdicionales));
    }

    setTimeout(() => {
        console.log("Ejecutando consolidación");

        const data = dataConsolidacion();
        const obligActivas = getObligacionesActivas();

        console.log("OBLIGACIONES:", obligActivas);

        loadFormData(data);
        llenarFilasObligaciones(obligActivas);

    }, 500);
}