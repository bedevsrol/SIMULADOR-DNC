/*evento para la validación del pago para negociacion en novaciones*/
function validacion(pagoCliente) {
    let abono = getFieldValue('4cbf2d64-0442-4c98-964f-e741a6a4e6a1')
    if(abono>pagoCliente){
        toastr.warning("El pago para la negociación debe de ser mayor al abono mínimo requerido")
    }
}
//se eliminaron en caso dado crear de nuevo en el lappiz 
/* 
evento General 
nombre 
valuechanged de pago minimo novaciones
function abono(pago) {
    debugger
    let pagominimo = pago;
        let porcentajeabono = sessionStorage.porMora
        console.log(porcentajeabono)
        let abonominimo = pagominimo * (porcentajeabono / 100);
        setFieldValue("4cbf2d64-0442-4c98-964f-e741a6a4e6a1", abonominimo);
        console.log(abonominimo); 

 }*/
/*General evento cuota proyectada novacion
function cuota() {
    debugger
    let saldoFinal = getFieldValue("c6923383-8eec-4efe-81a5-954ce52b8882")
    let plazo = document.querySelector("#\\39 382c5a1-0445-4ed9-a785-850d06da2cd2").selectedOptions[0].textContent
    let tasa = getFieldValue("b76668b5-0710-4eee-9718-a2633605c35e")
    let resultado = (saldoFinal/plazo)+(saldoFinal*(tasa/100))
    setFieldValue("d157fb29-fd6f-450b-b637-8fa18c824cd2",resultado)
}
*/

/*General 
evento saldo final a diferir en novaciones
function saldoFinal() {
let saldototal= getFieldValue('616e6102-56e5-48e9-bfc2-fce8497e629d');
let pagonego = getFieldValue('92bcba6d-4dab-459e-bd8f-164da7eeb526');
let resultado = saldototal-pagonego
setFieldValue("c6923383-8eec-4efe-81a5-954ce52b8882",resultado)
}*/