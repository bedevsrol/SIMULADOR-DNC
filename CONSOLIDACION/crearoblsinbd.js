function obligacionesSinBaseConsolidacionvacia(data) {}

async function obligacionSinBaseConsolidacion(Cantidad) {
    const consolidacionDiv = document.getElementById("consolidacion");
    consolidacionDiv.innerHTML = "";

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