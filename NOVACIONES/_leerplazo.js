/* ============================================================================
   _leerPlazo()  - plazo desde el dropdown (texto -> número, con guard)
   ============================================================================ */
function _leerPlazo() {
    const dd = document.getElementById(NOV.plazo);
    if (dd && dd.selectedOptions && dd.selectedOptions[0]) {
        return _num(dd.selectedOptions[0].textContent);
    }
    return _num(getFieldValue(NOV.plazo));
}