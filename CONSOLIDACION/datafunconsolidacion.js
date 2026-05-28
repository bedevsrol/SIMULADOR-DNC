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