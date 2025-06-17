
sap.ui.define([], function () {
    "use strict";
    return {
        statusText: function (sShipperName, sShippedDate, sStatus) {
            var resourceBundle =
                this.getView().getModel("i18n").getResourceBundle();
            var finalText = sShipperName + " " + sShippedDate + " ";
            switch (sStatus) {
                case "A":
                    return finalText + resourceBundle.getText("StatusA");
                case "B":
                    return finalText + resourceBundle.getText("StatusB");
                case "C":
                    return finalText + resourceBundle.getText("StatusC");
                default:
                    return finalText + sStatus;
            }
        },
        numberState: function (sPrice) {
            if (sPrice > 10) {
                return "Error";
            } else {
                return "Success";
            }
        },
        visible : function(value) {
            return !(typeof(value) == 'undefined' || value == null);
        }
    };
});