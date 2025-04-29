sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ikor/project1/controller/Fragment",
    "sap/m/MessageBox"],
    function (Controller, Fragment,MessageBox) {
        "use strict";

        return Controller.extend("ikor.project1.controller.Fragment", {

            onCloseDialog: function () {
                debugger;
                
                this.oDialog.close();
            },
            onSave: function(){
               debugger;
                //let oMessageManager =  new Messaging();
                //Messaging.addMessages(["ddddddfdfd"]);
                MessageBox.success("Project 1234567 was created and assigned to team \"ABC\".");
                this.oDialog.close();

            }



        })
    })