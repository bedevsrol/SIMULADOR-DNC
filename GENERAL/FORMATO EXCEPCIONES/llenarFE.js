function llenarFormatoExcepciones() {
    const dropdown = kendo.jQuery("#caae86ca-b4e0-4e59-918e-8f7a1a4d4114").data('kendoDropDownList');
    const obligacion = dropdown ? dropdown.dataItem() : null;

    if (!obligacion) {
        console.warn('Formato de Excepciones: no se encontro la obligacion seleccionada');
        return;
    }

    const mecanismo = sessionStorage.mecanismo || '';

    // ids especificos por mecanismo, para los campos que se generan durante la negociacion
    const idsPorMecanismo = {
        consolidacion: {
            plazo: 'aa4de771-cbaf-486d-8de2-06941dc220d5',
            tasaEA: 'c9f5317e-9099-43f1-9b7f-78b93d99aa6a',
            fechaPago: '39505284-3650-4303-b564-747e7dd3a8e9',
            valorPago: '0ee03528-b018-47d1-856b-9e30dbae2ddf',
            honorarios: '4f89c370-65c2-43d8-90aa-6b3e3b29906b',
            pctCastigoIntCte: 'b42b41d8-cd57-4233-9bff-8a5ceec5af03',
            valorCastigoIntCte: '04dbcb19-8f74-4eac-81f3-6bcc76cd7f9a',
            pctCastigoIntMora: 'e079d101-5148-42ed-854e-9be982adc01e',
            valorCastigoIntMora: 'f848cad9-f94d-4e56-9468-863a2a55e402',
            pctCastigoExtrac: 'e970af6e-de8d-47b3-97d0-98e4950c9bdf',
            valorCastigoExtrac: 'dc9166ce-a5c8-4fc7-ad2b-4c6479d63f12'
        },
        novacion: {
            plazo: '9382c5a1-0445-4ed9-a785-850d06da2cd2',
            tasaEA: '0c009370-356b-461e-b19e-b510e82cef35',
            fechaPago: '5c6f6251-9091-496a-966a-9bf0fb0eedcf',
            valorPago: '92bcba6d-4dab-459e-bd8f-164da7eeb526',
            honorarios: '075c9be0-baad-48b2-864d-acae840b7256',
            // en novacion todos los intereses van al 100% de castigo (no hay campo de porcentaje editable)
            pctCastigoIntCte: null,
            valorCastigoIntCte: 'e2c2ca76-e568-413d-8aac-b7bd2c3b9f52',
            pctCastigoIntMora: null,
            valorCastigoIntMora: 'ce31f456-c5d9-4476-a56f-f5f44d2c8827',
            pctCastigoExtrac: null,
            valorCastigoExtrac: 'a710006e-72a9-4388-84ed-cc3b743ef45f',
            otrosCargos: '51440ec8-1f3c-49fa-8672-15870130cb90'
        },
        pagomora: {
            fechaPago: 'ee8b70aa-2712-408c-a87a-b121e20564b3',
            valorPago: 'af9911f8-4a06-4483-b25d-6bec9e1647fe',
            honorarios: 'ae33bcc4-183a-47de-a6c8-f4ecc44be169',
            pagoSNR: '3539dba8-0c22-491e-a05b-84642d675d59',
            pctCastigoIntCte: 'e076d650-c5d6-48b1-920b-295d431604b0',
            valorCastigoIntCte: '49ed37fa-10f7-46d1-b2d3-bd4e28bef0db',
            pctCastigoIntMora: '64fcdf9f-c6b3-4742-b4b2-e259759290d9',
            valorCastigoIntMora: 'db8c0e77-0029-4bf9-ba9a-ebc141721c33',
            pctCastigoExtrac: '0456eeb3-8809-48a5-8726-87e416efdcb3',
            valorCastigoExtrac: 'a01eeadb-b99e-4e08-9d93-3fe44b9e1cf8'
        },
        cancelacion: {
            fechaPago: '9630246d-c683-4104-a141-391c9541b5cd',
            honorarios: 'a0a2b9b0-17cc-41fe-be98-2ac2157e33ef',
            pagoSNR: 'b5c33a6d-9d65-4920-8a39-e73621b7daa9',
            saldoTotal: 'f47f1a89-6743-4f60-9cf6-0696e6c841ca',
            capitalTotal: '9dc154b0-5d64-4682-a76d-5e946415c253',
            pctCastigoIntCte: 'bcfd54b6-d1cf-40dc-8677-686652eedbb8',
            valorCastigoIntCte: '86f86bd7-d119-4d2a-a6c0-e711b1d835a6',
            pctCastigoIntMora: '433ffa22-78e7-4004-be47-2b0ccf497ad1',
            valorCastigoIntMora: 'a6ee4c8b-a6c5-4bd8-8c30-9e29b9c40115',
            pctCastigoExtrac: 'a724067d-e7bf-435c-94ac-bf44f72575e7',
            valorCastigoExtrac: '8ea64929-53a9-41b4-a01f-a14b74293d01',
            pctCastigoCapital: 'aa7aeaf3-6bc8-4939-9896-212d5efcd93e',
            valorCastigoCapital: '60bebeab-d3ca-4547-9eff-00cc8db69b82'
        },
        ampliacion: {
            plazo: 'f43686aa-8f4e-4203-9733-b483660e6ab1',
            tasaEA: '1540984f-2b52-4a6f-8b34-01236dfd291c',
            fechaPago: '3d0f4be2-1bb6-446c-9ebb-b38a7eba0d5c',
            honorarios: 'e2a45a6f-d7e5-40ea-813f-cdbee2c58c4b',
            pagoSNR: '44770cdb-4d75-4b2a-957f-400410e65e8d',
            capitalTotal: '12671e00-a829-472f-b644-be49ea7ebdbf',
            otrosCargos: 'e64cbac2-f6de-49eb-a9ec-79695d0e655a',
            intGastosNoFact: 'c54e9fde-a861-4446-ab8e-37b4473d231b',
            pctCastigoIntCte: 'd8e6669a-3079-4248-88d5-5f01cca53106',
            valorCastigoIntCte: '15a75d66-7dc0-4e25-b3e3-213a984a22fe',
            pctCastigoIntMora: '4f9627f2-7ada-415b-bf0c-cf308407c82a',
            valorCastigoIntMora: 'e4b7cc87-de9e-4fa1-9d65-d9595ed2cca2'
        }
    };

    const idsMecanismo = idsPorMecanismo[mecanismo] || {};

    function leer(id) {
        return id ? getFieldValue(id) : null;
    }

    // --- VALOR_HONORARIOS: si viene de la base (CustomNumber1) se usa ese; si es sin data, del campo propio del mecanismo ---
    let valorHonorarios;
    if (sessionStorage.getItem('UserCargado') === 'si' && obligacion.CustomNumber1) {
        valorHonorarios = obligacion.CustomNumber1;
    } else {
        valorHonorarios = leer(idsMecanismo.honorarios) || 0;
    }

    // --- AREA DE GESTION / FECHA_CASTIGO ---
    const areaGestion = (obligacion.Grupo || '').trim().toUpperCase() === 'TEMPRANA' ? 'TEMPRANA' : '';
    const fechaCastigo = areaGestion === 'JURIDICO' ? '' : '01/01/1900';

    const fecha = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota' }).format(new Date());

    const datosNegociacion = {
        MECANISMO: mecanismo,
        TIPO_ID: obligacion.TipoDoc || '',
        NUMERO_ID: obligacion.Identificacion || '',
        FECHA_NEGOCIACION: fecha,
        AREA_GESTION: areaGestion,
        AGENCIA: obligacion.Grupo || '',
        NUMERO_OBLIGACION: obligacion.Obligacion || '',
        TIPO_OBLIGACION: obligacion.Producto || '',
        FECHA_CASTIGO: fechaCastigo,
        EDAD_MORA: obligacion.DiasMoraObl != null ? obligacion.DiasMoraObl : '',
        PLAZO: leer(idsMecanismo.plazo) || '',
        CAPITAL_VENCIDO: obligacion.CapitalTotalObl != null ? obligacion.CapitalTotalObl : '',
        CAPITAL_TOTAL: leer(idsMecanismo.capitalTotal) || obligacion.CapitalTotalObl || '',
        INTERES_CORRIENTE: obligacion.InteresCteObl != null ? obligacion.InteresCteObl : '',
        INTERES_MORA: obligacion.InteresMoraObl != null ? obligacion.InteresMoraObl : '',
        INTERESES_EXTRACONTABLES: obligacion.InteresesExtracontablesObl != null ? obligacion.InteresesExtracontablesObl : '',
        OTROS_CARGOS: leer(idsMecanismo.otrosCargos) || obligacion.OtrosCargosExigibles || '',
        SALDO_TOTAL: leer(idsMecanismo.saldoTotal) || obligacion.SaldoTotalObl || '',
        TASA_INTERES_EA: leer(idsMecanismo.tasaEA) || obligacion.TasaInteresEaIcs || '',
        MARCA_C026: obligacion.MarcaObl026 || '',
        FECHA_PAGO: leer(idsMecanismo.fechaPago) || '',
        VALOR_PAGO: leer(idsMecanismo.valorPago) || '',
        PAGO_SNR: leer(idsMecanismo.pagoSNR) || '',
        VALOR_HONORARIOS: valorHonorarios,
        PCT_CASTIGO_INT_CTE: idsMecanismo.pctCastigoIntCte ? leer(idsMecanismo.pctCastigoIntCte) : 100,
        VALOR_CASTIGO_INT_CTE: leer(idsMecanismo.valorCastigoIntCte) || '',
        PCT_CASTIGO_INT_MORA: idsMecanismo.pctCastigoIntMora ? leer(idsMecanismo.pctCastigoIntMora) : 100,
        VALOR_CASTIGO_INT_MORA: leer(idsMecanismo.valorCastigoIntMora) || '',
        PCT_CASTIGO_EXTRAC: idsMecanismo.pctCastigoExtrac ? leer(idsMecanismo.pctCastigoExtrac) : 100,
        VALOR_CASTIGO_EXTRAC: leer(idsMecanismo.valorCastigoExtrac) || '',
        PCT_CASTIGO_CAPITAL: leer(idsMecanismo.pctCastigoCapital) || '',
        VALOR_CASTIGO_CAPITAL: leer(idsMecanismo.valorCastigoCapital) || '',
        INT_GASTOS_NOFACT: leer(idsMecanismo.intGastosNoFact) || obligacion.IntGastosNofact || '',
        DETALLE_PROPUESTA: ''
    };

    datosNegociacion.DETALLE_PROPUESTA =
        'Mecanismo: ' + mecanismo +
        ' | Obligacion: ' + datosNegociacion.NUMERO_OBLIGACION +
        ' | Producto: ' + datosNegociacion.TIPO_OBLIGACION +
        ' | Saldo total: ' + datosNegociacion.SALDO_TOTAL +
        ' | Capital total: ' + datosNegociacion.CAPITAL_TOTAL +
        ' | Valor pago: ' + datosNegociacion.VALOR_PAGO +
        ' | Fecha pago: ' + datosNegociacion.FECHA_PAGO +
        ' | Honorarios: ' + datosNegociacion.VALOR_HONORARIOS;

    localStorage.setItem('datosNegociacionFE', JSON.stringify(datosNegociacion));
    console.log('Formato de Excepciones: datos guardados en localStorage', datosNegociacion);
}