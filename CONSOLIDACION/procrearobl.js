function obligacionesSinBaseConsolidacionvacia(data) {}

let contadorGlobal = 0;
async function obligacionSinBaseConsolidacion(cantidad = 1) {
    const consolidacionDiv = document.getElementById("consolidacion");

    // Consulta (solo se ejecuta una vez por llamada)
    const response = await execQuery(`EXEC SimiladorDNC_Lappiz_EmailConfirmed @sw = 11`);
    const dataItems = response[0];

    for (let i = 0; i < cantidad; i++) {

        const index = contadorGlobal++;

        const card1 = document.createElement("div");
        card1.className = "card1";

        // Encabezado
        const header = document.createElement("h3");
        header.textContent = "Obligación: ";
        card1.appendChild(header);

        // Input obligación
        const obligationContainer = document.createElement("div");
        obligationContainer.className = "field-container";

        const obligationLabel = document.createElement("label");
        obligationLabel.textContent = "Obligación * :";

        const obligationInput = document.createElement("input");
        obligationInput.type = "text";
        obligationInput.classList.add("obligation-input");
        obligationInput.placeholder = "Ingrese la obligación";
        obligationInput.id = `obligation-${index}`;

        obligationInput.addEventListener("input", () => {
            header.textContent = `Obligación: ${obligationInput.value}`;
        });

        obligationContainer.appendChild(obligationLabel);
        obligationContainer.appendChild(obligationInput);
        card1.appendChild(obligationContainer);

        // Toggle
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "toggle-switch";

        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.id = `toggle-${index}`;

        const toggleLabel = document.createElement("label");
        toggleLabel.htmlFor = `toggle-${index}`;

        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(toggleLabel);
        card1.appendChild(toggleContainer);

        // Campos numéricos
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
            input.type = "text";
            input.classList.add("input");
            input.placeholder = `Ingrese ${field.label}`;
            input.id = `${field.id}-${index}`;
            input.setAttribute("data-raw-value", "0");
            input.disabled = true;

            // Formato miles
            input.addEventListener("input", (e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                input.setAttribute("data-raw-value", rawValue);
                input.value = formatNumber(rawValue);
            });

            // Activar/desactivar con toggle
            toggleInput.addEventListener("change", () => {
                input.disabled = !toggleInput.checked;
            });

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            card1.appendChild(fieldContainer);
        });

        // Select marca
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

        toggleInput.addEventListener("change", () => {
            select.disabled = !toggleInput.checked;
        });

        marcaFieldContainer.appendChild(marcaLabel);
        marcaFieldContainer.appendChild(select);
        card1.appendChild(marcaFieldContainer);

        consolidacionDiv.appendChild(card1);
    }
}

// Formato miles
function formatNumber(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
