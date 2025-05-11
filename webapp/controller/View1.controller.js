sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ikor/project1/controller/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
],
    function (Controller, FragmentController, JSONModel, MessageBox,MessageToast,Fragment) {
        "use strict";

        return Controller.extend("ikor.project1.controller.View1", {
            oFragment: new FragmentController(this),
            oKontierungsModel:{},
            oSelGevo:{},
            oGevoModel:{},
            _formFragments:{},
            onInit: function () {
                 debugger;
          var oModel = this.getOwnerComponent().getModel();
          oModel.read("/RueckstellungSet", {
            success: this.fnSuccessCallback.bind(this),
            error: this.fnErrorCallback.bind(this),
            }
        );

        


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
                //https://sapui5.hana.ondemand.com/#/entity/sap.ui.layout.form.Form/sample/sap.ui.layout.sample.Form354/code
                //this._toggleButtonsAndView(true);
                
                //this.getView().byId("edit").setVisible(false);
                //this.getView().byId("anzeigen").setVisible(true);
                let bEdit;
                if (oEvent.getSource().getText() === "Edit"){
                    bEdit = true;
                } else {
                    bEdit = false;
                }

                let oSelectedGevo = Object.assign({}, this.oSelGevo);

                this.oGevoModel =  new sap.ui.model.json.JSONModel();
                this.oGevoModel.setData(oSelectedGevo);
                //let oSelectedGevo = this.getView().getModel("oSelGevoModel");
                 //bind in Change View
                 //let oSelectedKontierungModel = this.getOwnerComponent().getModel("oSelGevoModel");
                sap.ui.getCore().byId(this.createId("idProductsTable1")).setModel(this.oKontierungsModel, "okontierungsModel1" );         
                sap.ui.getCore().byId(this.createId("FormToolbaredit2")).setModel(this.oGevoModel, "oSelGevoModel1");    
                //sap.ui.getCore().byId(this.createId("Gevochange")).bindElement("/GeschaeftsvorfallSet/1");
                this._getSplitApp().toDetail(this.createId("Gevochange"));
			    //this._gevoModeldata = Object.assign({}, this.getView().getModel("oSelGevoModel").getData().results);
            },

            _getFormFragment: function (sFragmentName) {
                debugger;
                var pFormFragment = this._formFragments[sFragmentName],
                    oView = this.getView();
    
                if (!pFormFragment) {
        //debugger;
                    pFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "ikor.project1.view." + sFragmentName
                    });
                    this._formFragments[sFragmentName] = pFormFragment;
                }
    
                return pFormFragment;
            },
           
            _showDisplayCreateUpdateFragment: function(bEdit){
                var oView = this.getView();

                let oGevoPage = this.byId("detailPage1");
                //let oGevoPage = this.byId("Gevo");
                
                oGevoPage.removeAllContent();
                this._getFormFragment(bEdit).then(function(oVBox){
                    oGevoPage.insertContent(oVBox);
                });
                //oGevoPage.removeAllContent();
                //let oFragment = sap.ui.xmlfragment("ikor.project1.view.Gevonew",this);
                //oGevoPage.insertContent(oFragment)
                /*this._getFormFragment(sFragmentName).then(function(oFragment){
                    oGevoPage.insertContent(oFragment);
                });*/
            },

            fnSuccessCallback: function(oResult, oResponse){
                // do something
                let  oModelRueckstellung = new sap.ui.model.json.JSONModel();
                oModelRueckstellung.setData(oResult.results);
                this.getView().setModel(oModelRueckstellung, "oModelRueckstell");
            },
            fnErrorCallback: function(oError){
                // output error
            },

            onRueck:function(oEvent){
                //let nItemNr = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("geschaeftsvorfaell_id")
                let oSelectedGevoModel = new sap.ui.model.json.JSONModel();
                let oSelectedObject  = oEvent.getParameter("listItem").getBindingContext("oModelRueckstell").getObject();
                var oModel = this.getOwnerComponent().getModel();
                oModel.read("/RueckstellungSet("+"'"+oSelectedObject.Rueckstellungid+"'"+")/GeschaeftsvorfallSet", {
                    success: function(oData, oResponse){
                        oSelectedGevoModel.setData(oData);
                        this.oGevoModel = oSelectedGevoModel;
                        oSelectedGevoModel.refresh();
                        this.getView().setModel(oSelectedGevoModel, "oSelGevoModel");
                       // this.getView().byId("Gevochange").setModel(oSelectedGevoModel, "oSelGevoModel");
                        this._getSplitApp().toMaster(this.createId("masterGevo"));
                    }.bind(this),
                    error: this.fnErrorCallback.bind(this),
                    }
                );
               
               // let sPath = oEvent.getParameter("listItem").getBindingContext("dataModel").getPath();
                
                
                //this.getView().
                //Mehrstufige Objektes berücksichtigen 
                //sPath = sPath+"/geschaeftsvorfaelle/";
                //this.byId("masterGevo").setModel(oSelectedGevoModel, "oSelGevoModel");
                
            },

            onGevo:function(oEvent){
                //let nItemNr = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("geschaeftsvorfaell_id")
                //let oSelectedObject  = oEvent.getParameter("listItem").getBindingContext("dataModel").getObject();
                let sPath = oEvent.getParameter("listItem").getBindingContext("oSelGevoModel").getPath();
                //let oSelectedGevoModel = this.getView().getModel("oSelectedGevoModel");
                //oSelectedGevoModel.setData(oSelectedObject);
                //oSelectedGevoModel.refresh();
                let oSelectedKontierungModel = new sap.ui.model.json.JSONModel();
                let oSelectedObject  = oEvent.getParameter("listItem").getBindingContext("oSelGevoModel").getObject();
                this.oSelGevo = oSelectedObject;
                var oModel = this.getOwnerComponent().getModel();
                oModel.read("/GeschaeftsvorfallSet("+"'"+oSelectedObject.Gevoid+"'"+")/KontierungSet", {
                    success: function(oData, oResponse){
                        oSelectedKontierungModel.setData(oData);
                        oSelectedKontierungModel.refresh();
                        this.oKontierungsModel = oSelectedKontierungModel;
                        //bind to the Display View
                        this.getView().byId("idProductsTable").setModel(oSelectedKontierungModel, "oSelKontierungModel");
                        this._getSplitApp().toMaster(this.createId("detailPage1"));
                    }.bind(this),
                    error: this.fnErrorCallback.bind(this),
                    }
                );
                this.byId("detailPage1").bindElement({ path: sPath, model: "oSelGevoModel" });
                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },

            onCancelCreateGevo:function(){
                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },

            onSaveNewGevo:function(){
                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },
            onCancelChangeGevo:function(){
                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },
            onSaveChangeGevo:function(){
                //https://community.sap.com/t5/technology-blog-posts-by-members/file-upload-and-download-in-sap-ui5/ba-p/13498211
                this._getSplitApp().toDetail(this.createId("detailPage1"));
                this.oGevoModel.setData({});
                this.oGevoModel.refresh();
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
