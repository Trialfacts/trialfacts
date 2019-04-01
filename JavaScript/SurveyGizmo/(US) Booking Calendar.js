document.getElementById('SOIDIV_XXX').setAttribute('id', 'SOIDIV_[question("value"), id="139"]'); /* Set div ID to Booking Page Name HVA */
let countryCode = "1";
(function () {
    function SOEScriptLoaded() {
        if (typeof soe != 'undefined') {
            soe.AddEventListners('//meetme.so/[question("value"), id="139"]?brdr=1pxd8d8d8&dt=&em=1&name=[question("value"), id="17"]%20[question("value"), id="18"]&email=[question("value"), id="19"]&phone=1[question("value"), id="123",stringformat="%u"]&mobile=1[question("value"), id="122",stringformat="%u"]&skip=1', '[question("value"), id="139"]', "635px", "100% !important", "true", "true");
        } else {
            setTimeout(SOEScriptLoaded, 1);
        }
    }
    setTimeout(SOEScriptLoaded, 1)
})()