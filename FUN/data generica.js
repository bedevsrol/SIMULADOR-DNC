function funDataGenerica(mecanismo) {
    // Evento de la fecha
    function setCurrentDate() {
        const today = new Date();
        document.getElementById('day_' + mecanismo).textContent = today.getDate();
        document.getElementById('month_' + mecanismo).textContent = today.getMonth() + 1;
        document.getElementById('year_' + mecanismo).textContent = today.getFullYear();
    }
    function data() {
        var Oficina = document.getElementById("9552efdb-f91c-4e51-9f55-230282926b12").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.getElementById("9552efdb-f91c-4e51-9f55-230282926b12").selectedOptions[0].innerText || "";
        var NomOficina = document.getElementById("bd198dd5-328d-4ded-a3b4-b23adfad423a").value || "";
        let pagoProduto = "";
        if (mecanismo === "novacion" || mecanismo === "consolidacion") {
            pagoProduto = document.getElementById("685c5e9d-4409-4d4c-a11e-a0c17dcedb02").value || ""
        } else {
            pagoProduto = "000-778175"
        }
        // 1. Obtenemos el objeto del sessionStorage
        let userObj = JSON.parse(sessionStorage.getItem("LappizUser") || "{}");
        if (userObj.FullName) {
            // 2. Dividimos por la coma
            let partes = userObj.FullName.split(',');

            if (partes.length === 2) {
                // 3. Limpiamos espacios y reordenamos: Nombre + " " + Apellido
                let apellidos = partes[0].trim();
                let nombres = partes[1].trim();
                var nombreAsesor = `${nombres} ${apellidos}`;
                console.log("Nombre arreglado:", nombreAsesor);
            } else {
                var nombreAsesor = userObj.FullName;
            }
        }
        var nombreCliente = document.getElementById("1ad60ed2-e515-4164-8270-54efa1e574fa").value || "";
        var tipodoc = document.getElementById("15fb0de1-4989-4986-a662-61fb88b3aba1").value.replace(/^\d+:/, "") || "";
        var numeroDoc = document.getElementById("75fda36b-9317-4062-93d7-26d45e6188d6").value || "";
        const lugarExp = document.querySelector("#d8faf1c6-44fb-4bd9-93ca-aac3c9ef6ab3").selectedOptions[0].innerText === "Seleccione un registro..." ? "" : document.querySelector("#d8faf1c6-44fb-4bd9-93ca-aac3c9ef6ab3").selectedOptions[0].innerText || "";
        const fechaExp = document.querySelector(
            '[id="64b5c3a4-2d66-4e35-97af-8a9405f0cf63"] input'
        ).value.replaceAll('-', ' ');
        var edadMora = sessionStorage.getItem("EdadMoraCl") || "";
        var numDocTerd = numeroDoc;
        var nombreClienteTerd = nombreCliente;
        return {
            codOficina: Oficina,
            nombreOficina: NomOficina,
            pagoProduto,
            nombreAsesor: nombreAsesor,
            nombreCliente: nombreCliente,
            tipoDoc: tipodoc,
            numDoc: numeroDoc,
            lugarExp: lugarExp,
            fechaExp: fechaExp,
            diasMora: edadMora,
            numDocTerd: numDocTerd,
            nombreClienteTerd: nombreClienteTerd,
        }
    }
    function loadFormData(data) {
        document.getElementById("codOficina_" + mecanismo).textContent = data.codOficina;
        document.getElementById("nombreOficina_" + mecanismo).textContent = data.nombreOficina;
        document.getElementById("cuentaPago_" + mecanismo).textContent = data.pagoProduto;
        document.getElementById("funcionario_" + mecanismo).textContent = data.nombreAsesor;
        document.getElementById("nombreCliente_" + mecanismo).textContent = data.nombreCliente;
        document.getElementById("tipoDoc_" + mecanismo).textContent = data.tipoDoc;
        document.getElementById("numDoc_" + mecanismo).textContent = data.numDoc;
        document.getElementById("lugarExp_" + mecanismo).textContent = data.lugarExp;
        document.getElementById("fechaExp_" + mecanismo).textContent = data.fechaExp;
        document.getElementById("diasMora_" + mecanismo).textContent = data.diasMora;
        document.getElementById("nombreClienteTerd_" + mecanismo).textContent = data.nombreClienteTerd;
        document.getElementById("numDocTerd_" + mecanismo).textContent = data.numDocTerd;
    }
    setTimeout(() => {
        loadFormData(data());
        setCurrentDate();
        console.log("Datos cargados en el formulario.");
        console.log("Datos:", data());
    }, 500);

}