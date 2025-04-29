sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ikor/project1/controller/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    function (Controller, Fragment, JSONModel, MessageBox,MessageToast) {
        "use strict";

        return Controller.extend("ikor.project1.controller.View1", {
            oFragment: new Fragment(this),

            onInit: function () {
                debugger;
                let oData = {
                    result:[{
                        rueckstellung_id: "fsfdfd",
                        buchungsdatum: new Date(),
                        bewegungsart: "101",
                        betrag: 23400,
                        bestandneutraler_betr: 5000,
                        waerung: 'Eur'
                    }]
                }

                //let oModel = new sap.ui.model.json.JSONModel(oData, "simulationsErgebnis");
                //this.getView().setModel(oModel); 

            },
            onHandleGevoEditPress: function(oEvent){
                //this._toggleButtonsAndView(true);
                this.getView().byId("edit").setVisible(false);
                //this.getView().byId("anzeigen").setVisible(true);
                this._showDisplayCreateFragment()
            },
           
            _showDisplayCreateFragment: function(){
                let oGevoPage = this.byId("detailPage1");
                oGevoPage.removeAllContent();
                let oFragment = sap.ui.xmlfragment("ikor.project1.view.Gevonew",this);
                oGevoPage.insertContent(oFragment)
                /*this._getFormFragment(sFragmentName).then(function(oFragment){
                    oGevoPage.insertContent(oFragment);
                });*/
            },

            onRueck:function(oEvent){
                //let nItemNr = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("geschaeftsvorfaell_id")
                let oSelectedGevoModel = new sap.ui.model.json.JSONModel();
                let oSelectedObject  = oEvent.getParameter("listItem").getBindingContext("dataModel").getObject();
               // let sPath = oEvent.getParameter("listItem").getBindingContext("dataModel").getPath();
                
                oSelectedGevoModel.setData(oSelectedObject.geschaeftsvorfaelle);
                oSelectedGevoModel.refresh();
                //this.getView().
                //Mehrstufige Objektes berücksichtigen 
                //sPath = sPath+"/geschaeftsvorfaelle/";
                //this.byId("masterGevo").setModel(oSelectedGevoModel, "oSelGevoModel");
                this.getView().setModel(oSelectedGevoModel, "oSelGevoModel");
                this._getSplitApp().toMaster(this.createId("masterGevo"));
            },

            onGevo:function(oEvent){
                //let nItemNr = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("geschaeftsvorfaell_id")
                //let oSelectedObject  = oEvent.getParameter("listItem").getBindingContext("dataModel").getObject();
                let sPath = oEvent.getParameter("listItem").getBindingContext("oSelGevoModel").getPath();
                //let oSelectedGevoModel = this.getView().getModel("oSelectedGevoModel");
                //oSelectedGevoModel.setData(oSelectedObject);
                //oSelectedGevoModel.refresh();
                this.byId("detailPage1").bindElement({ path: sPath, model: "oSelGevoModel" });


                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },

            onPressMasterRueckBack:function(){
                this._getSplitApp().backMaster();
                this._getSplitApp().toDetail(this.createId("detailPage2"));
            },
            _getSplitApp: function(){
                let result = this.byId("splitApp");
                if (!result) {
                    Log.info("SplitApp object can't be found");
                }
                return result;
            },

            onNew: function(){
                this._getSplitApp().toDetail(this.createId("newGevo"));
            },

            onSimulate: function () {
                // read msg from i18n model
                const oBundle = this.getView().getModel("i18n").getResourceBundle();
                this.onOpenDialog();
                // show message
                 MessageToast.show("fffffffffffffffffffffffffffffff");
            },
            async onOpenDialog() {
                // create dialog lazily
                this.oDialog ??= await this.loadFragment({
                    name: "ikor.project1.view.Simulationsergebnis",
                    controller: this.oFragment
                });
                
                debugger;
                //this.getView().addDependent(this.oDialog);
                this.oDialog.open();
            },
            onCloseApp:function(){
                MessageBox.warning("Wollen Sie wirklich die APP ohne Simulation verlassen", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        MessageToast.show("Action selected: " + sAction);
                    },
                    dependentOn: this.getView()
                });
            }

        });
    });
