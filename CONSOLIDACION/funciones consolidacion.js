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
        // Campos
        const fields = [
            { label: "Saldo Total *", value: item.SaldoTotalObl},
            { label: "Honorarios *", value: honorarios},
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
//funcion para la sumatoria del total en consolidacion
function sumarvalor(label) {
    let Total = 0;

    // Obtener todas las cards generadas
    const cards = document.querySelectorAll('.card1');

    // Recorrer cada card y verificar si el toggle está activado
    cards.forEach((card) => {
        // Obtener el toggle (checkbox) de la tarjeta
        const toggle = card.querySelector('input[type="checkbox"]');

        // Verificar si el toggle está activado (checked)
        if (toggle && toggle.checked) {
            // Buscar el campo de "Saldo Total" usando el atributo 'data-label'
            const valorInput = card.querySelector(`.field-container .input[data-label='${label}']`);
            
            if (valorInput) {
                // Usar el valor sin formato del atributo 'data-raw-value'
                const rawValue = valorInput.getAttribute('data-raw-value');
                const numericValue = parseFloat(rawValue); // Convertir el valor a número

                // Asegurarse de que el valor sea un número válido
                if (!isNaN(numericValue)) {
                    Total += numericValue; // Sumar el valor al total
                }
            }
        }
    });

    // Retornar el total sumado
    return Total;
}

//funciones consolidacion
function CalculosConsolidacion(){
    let dato = sumarvalor('Interes Corriente *')
    console.log("Valor Sumatoia de Intereses Corrientes: " + dato);
    setFieldValue('04dbcb19-8f74-4eac-81f3-6bcc76cd7f9a', dato)
    let interesmora = sumarvalor('Interes Mora *')
    console.log("Valor Sumatoia de Intereses de Mora: " + interesmora);
    setFieldValue('f848cad9-f94d-4e56-9468-863a2a55e402', interesmora)
    let interesextra = sumarvalor('Int Extracontables "TC"')
    console.log("Valor Sumatoia de Intereses Extracontables: " + interesextra);
    setFieldValue('dc9166ce-a5c8-4fc7-ad2b-4c6479d63f12', interesextra)
    let honorarios = sumarvalor('Honorarios *')
    console.log("Valor Sumatoria de Honorarios:" + honorarios);
    setFieldValue('4f89c370-65c2-43d8-90aa-6b3e3b29906b', honorarios)

    let porIntCo = dato == 0 || dato == "" ? 0 : 100;
    let porIntMo = interesmora == 0 || interesmora === "" ? 0 : 100;
    let porIntEX = interesextra == 0 || interesextra == "" ? 0 : 100;
    console.log("pocentajes de consolidacion: " + porIntCo, porIntMo, porIntEX);
    
    setFieldValue('b42b41d8-cd57-4233-9bff-8a5ceec5af03', porIntCo)
    
    setFieldValue('e970af6e-de8d-47b3-97d0-98e4950c9bdf', porIntEX)
    
    setFieldValue('e079d101-5148-42ed-854e-9be982adc01e', porIntMo)

    let totalSaldo = sumarvalor('Saldo Total *')
    let saldoDesembolsar = totalSaldo-dato-interesmora-interesextra-honorarios

    setFieldValue('69b7fc43-675b-4984-bd64-9fd68799a97b',saldoDesembolsar)

    let peormarca = obtenerMarcaLetraConPeorMarcaMaxima()
    setFieldValue('183f4194-c998-41a4-9a8c-1436cc78132f',peormarca)
}