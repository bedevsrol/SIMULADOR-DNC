function obligacionesitahuvacia(data) {}

async function obligacionesitahu(data) {
    const consolidacionDiv = document.getElementById("consolidacionitahu");
    consolidacionDiv.innerHTML = "";

    if (!data || data.length === 0) return;

    let dataItau = data.filter(item => 
        (item.Grupo || "").trim().toUpperCase() === "ITAU"
    );

    if (dataItau.length === 0) {
        return;
    }

    dataItau = dataItau.sort((a, b) => {
        const diasA = parseFloat(a.DiasMoraObl) || 0;
        const diasB = parseFloat(b.DiasMoraObl) || 0;
        return diasB - diasA;
    });

    setFieldValue('ee828c1e-273d-4f48-80bd-270064a1593c', dataItau[0].NombreCompleto || "");
    setFieldValue('0a77d0fe-8905-4eb4-802b-ba7387e418e7', dataItau[0].Identificacion || "");
    setFieldValue('09dc2f41-1420-4a56-ac13-67b205362d4d', dataItau[0].CapitalTotalCl || "");

    // --- Resolver nombres de línea (evitando consultar el mismo código repetidas veces) ---
    const codigosLinea = [...new Set(dataItau.map(item => item.CustomChar2).filter(Boolean))];
    const mapaLineas = {};

    for (const codigo of codigosLinea) {
        try {
            const qLinea = "SELECT NomProductos FROM SimiladorDNC_Lappiz_LineaProducto WHERE CodCodigo = '" + codigo + "'";
            const rLinea = await execQuery(qLinea);
            if (rLinea && rLinea[0] && rLinea[0][0]) {
                mapaLineas[codigo] = rLinea[0][0].NomProductos;
            } else {
                mapaLineas[codigo] = codigo;
            }
        } catch (eL) {
            console.error("Error cargando línea:", eL);
            mapaLineas[codigo] = codigo;
        }
    }

    dataItau.forEach((item) => {
        const card1itahu = document.createElement("div");
        card1itahu.className = "card1itahu";

        const title = document.createElement("h3");
        title.textContent = `Obligación: ${item.Obligacion}`;
        card1itahu.appendChild(title);

        const fieldsGrid = document.createElement("div");
        fieldsGrid.className = "fields-grid";

        const nombreLinea = mapaLineas[item.CustomChar2] || item.CustomChar2;

        const fields = [
            { label: "Grupo", value: item.Grupo },
            { label: "Marca Camp", value: item.MarcaCampCrm },
            { label: "Marca Obl", value: item.MarcaObl026 },
            { label: "Producto", value: item.Producto },
            { label: "Tipo de Cartera", value: item.CustomChar1 },
            { label: "Tipo de Cobro", value: item.CustomChar3 },
            { label: "Tipo de Línea", value: nombreLinea },
            { label: "Tipo de Tasa ICS", value: item.TipoTasaIcs },
            { label: "Aplica Campaña", value: item.AplicaCampana },
            { label: "Mecanismo Aplica Campaña", value: item.MecanismoAplicaCampana },
            { label: "Días Mora", value: item.DiasMoraObl },
            { label: "Saldo Total", value: item.SaldoTotalObl, isMoney: true },
            { label: "Pago Mínimo", value: item.PagoMinObl, isMoney: true },
            { label: "Capital Total", value: item.CapitalTotalObl, isMoney: true },
            { label: "Interés Cte", value: item.InteresCteObl, isMoney: true },
            { label: "Interés Mora", value: item.InteresMoraObl, isMoney: true },
            { label: "Interés Extracontables", value: item.InteresesExtracontablesObl, isMoney: true },
            { label: "Otros Cargos Exigibles", value: item.OtrosCargosExigibles, isMoney: true },
            { label: "Prima Única", value: item.PrimaUnica, isMoney: true },
            { label: "Intereses Gastos Nofact", value: item.IntGastosNofact, isMoney: true },
            { label: "Valor Honorarios", value: item.CustomNumber1, isMoney: true },
        ];

        fields.forEach((field) => {
            const fieldContainer = document.createElement("div");
            fieldContainer.className = "field-container";

            const label = document.createElement("label");
            label.textContent = field.label;

            const value = document.createElement("div");
            value.className = "value-box";
            value.textContent = field.isMoney ? formatMoney(field.value) : (field.value ?? "");

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(value);
            fieldsGrid.appendChild(fieldContainer);
        });

        card1itahu.appendChild(fieldsGrid);
        consolidacionDiv.appendChild(card1itahu);
    });
}

function formatMoney(value) {
    if (value === null || value === undefined || value === "") return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString("es-CO");
}
