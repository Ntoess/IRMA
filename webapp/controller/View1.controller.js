sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ikor/project1/controller/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/BusyDialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/integration/widgets/Card",
    "sap/m/upload/Uploader",
    "sap/base/util/JSTokenizer",
    "../util/Formatter"
    //"pdfkit"


],
    function (Controller, FragmentController, JSONModel, MessageBox, MessageToast, Fragment, BusyDialog, Filter, FilterOperator, Card, Uploader, JSTokenizer, Formatter) {
        "use strict";

        return Controller.extend("ikor.project1.controller.View1", {
            oBusyDialog: new BusyDialog(),
            Formatter: Formatter,
            oFragment: new FragmentController(this),
            oKontierungsModel: {},
            oSelGevo: {},
            oGevoModel: {},
            oNewGevoModel: {},
            oModelKontiChart: {},
            _formFragments: {},
            aFilterChart: [],
            oModelDoc: new JSONModel(),
            oModelSelGevoWf: new JSONModel(),
            oModelSelGevoWfCtxt: new JSONModel(),
            oFileUploader: null,
            oSelectedRueck: {},
            sWfInstanceId: "",
            onInit: function () {
                debugger;
                var oModel = this.getOwnerComponent().getModel();
                this.oBusyDialog.open(),
                    oModel.read("/RueckstellungSet", {
                        success: this.fnSuccessCallback.bind(this),
                        error: this.fnErrorCallback.bind(this),
                    }
                    );




                let oData = {
                    result: [{
                        rueckstellung_id: "fsfdfd",
                        buchungsdatum: new Date(),
                        bewegungsart: "101",
                        betrag: 23400,
                        bestandneutraler_betr: 5000,
                        waerung: 'Eur'
                    }]
                }

                this.getView().setModel(new JSONModel({
                    features: [
                        "Enterprise-Ready Web Toolkit",
                        "Powerful Development Concepts",
                        "Feature-Rich UI Controls",
                        "Consistent User Experience",
                        "Free and Open Source",
                        "Responsive Across Browsers and Devices"
                    ]
                }),

                );
                /* this.oModel = new JSONModel();
                 this.oModel.setData({
                     badgeMin: "1",
                     badgeMax: "9999",
                     badgeCurrent: 1,
                     buttonText: "Button with Badge",
                     buttonIcon: "sap-icon://cart",
                     buttonType: "Default",
                     badgeStyle: "Default",
                     buttonWithIcon: true,
                     buttonWithText: true
                 });
                 this.getView().setModel(this.oModel);*/
                //this._initIntegrationCard();



            },

            _initDocument: function (oEvent) {
                var Json = [];
                this.oModelDoc.setProperty("/items", []);
                this.getOwnerComponent().getModel().read("/MediaSet", {
                    filters: [new Filter("Gevoid", FilterOperator.EQ, this.oSelGevo.GeschaeftsvorfaellId)],
                    success: function (oData) {
                        for (var i = 0; i < oData.results.length; i++) {
                            var item = {
                                Guid: oData.results[i].Guid,
                                Filename: oData.results[i].Filename,
                                Mimetype: oData.results[i].Mimetype,
                                url: "/sap/opu/odata/sap/Z_IRMA_DEMO_SRV/MediaSet('" + oData.results[i].Guid + "')/$value",
                                uploadState: "Complete",
                                CreatedBy: oData.results[i].Username,
                                Erdat: oData.results[i].Datum,
                                selected: false
                            };
                            Json.push(item);
                        }
                        this.oModelDoc.setProperty("/items", Json);
                        this.getView().byId("UploadSet").setModel(this.oModelDoc)
                        //this.getView().getModel("oModelAttach").setData(json);

                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageToast.show("Error occured reading data");
                    }
                });
            },

            _initUpload: function () {
                //this.setModel()
                // Modify "add file" button
                let oUploadSet = this.getView().byId("UploadSet");
                oUploadSet.getDefaultFileUploader().setButtonOnly(false);
                oUploadSet.getDefaultFileUploader().setTooltip("");
                oUploadSet.getDefaultFileUploader().setIconOnly(true);
                oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");
                oUploadSet.attachUploadCompleted(this.onUploadCompleted.bind(this));
            },
            onHandleUpdateFinished: function () {
                this.oBusyDialog.close();
            },
            onUploadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oUploadSet.uploadItem(oItem);
                    }
                });
            },
            onDownloadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oItem.download(true);
                    }
                });
            },
            onSelectionChange: function () {
                var oUploadSet = this.byId("UploadSet");
                // If there's any item selected, sets version button enabled
                if (oUploadSet.getSelectedItems().length > 0) {
                    if (oUploadSet.getSelectedItems().length === 1) {
                        this.byId("versionButton").setEnabled(true);
                    } else {
                        this.byId("versionButton").setEnabled(false);
                    }
                } else {
                    this.byId("versionButton").setEnabled(false);
                }
            },
            onVersionUpload: function (oEvent) {
                var oUploadSet = this.byId("UploadSet");
                this.oItemToUpdate = oUploadSet.getSelectedItem()[0];
                oUploadSet.openFileDialog(this.oItemToUpdate);
            },
            getRaw: function (oItem) {
                const oFileObject = oItem.getFileObject();
                var oFileRaw = {
                    name: oFileObject.name,
                    mimetype: oFileObject.type,
                    size: oFileObject.size,
                    data: []
                };

                var reader = new FileReader();
                reader.onload = function (e) {
                    oFileRaw.data = e.target.result; //set buffer data
                    this.uploadFileRaw = oFileRaw;
                    this.onPostDocu(oFileRaw)
                }.bind(this);
                reader.readAsArrayBuffer(oFileObject);

            },

            onPostDocu: function (oFileRaw) {

                //var oModel = this.getView().getModel();
                //var oItemData = this._getItemData(oItem);
                var oPayload = {
                    Filename: oFileRaw.name,
                    Value: oFileRaw.data,
                    Mimetype: oFileRaw.mimetype
                }
                var mHeaders = {
                    "slug": oFileRaw.name,
                    "Content-Type": oFileRaw.mimetype,
                    "value": oFileRaw.data
                };
                // this.getOwnerComponent().getModel().setHeaders(mHeaders);
                /*this.getOwnerComponent().getModel().create("/MediaSet", oPayload, {
                    success: function () {  
                        var oModel = this.oModelDoc;
                        var aItems = oModel.getProperty("/items");
                        oModel.setProperty("/items", aItems);
                        oModel.refresh();

                    }.bind(this),
                    error: function () {
                        //busy.close();
                        sap.m.MessageToast.show("Error updating Gevo");
                    }
                });*/
                //let sSlug = oFileRaw.name+','+ '123'+ ',' + this.oSelGevo.GeschaeftsvorfaellId
                //let sUrl = this.getOwnerComponent().getModel().sServiceUrl +"/MediaSet";
                //this.oFileUploader = this.getView().byId("UploadSet");
                //this.oFileUploader.setUploadUrl(sUrl);
                // this.oFileUploader.removeAllHeaderFields();
                // this.oFileUploader.addHeaderField(new sap.ui.core.Item({ key: "slug", text: sSlug }));
                //this.oFileUploader.addHeaderField(new sap.ui.core.Item({ key: "value", text: oFileRaw.data }));
                //this.oFileUploader.addHeaderField(new sap.ui.core.Item({ key: "uploadedBy", text: "robert" }));
                /*this.oFileUploader.addHeaderField(new sap.ui.core.Item({
                    key: "x-csrf-token",
                    text: this.getOwnerComponent().getModel().getSecurityToken()
                }));*/
            },
            onBeforeUploadStarts: function (oEvent) {
                var oHeaderItem = oEvent.getParameter("item"),
                    slugVal = oHeaderItem.getFileName() + ",1234," + this.oSelGevo.GeschaeftsvorfaellId;
                oHeaderItem.removeAllStatuses();
                oHeaderItem.addHeaderField(new sap.ui.core.Item({
                    key: "slug",
                    text: slugVal
                }));
                oHeaderItem.addHeaderField(new sap.ui.core.Item({
                    key: "x-csrf-token",
                    text: this.getOwnerComponent().getModel().getSecurityToken()
                }));
            },
            onUploadCompleted: function (oEvent) {
                var oStatus = oEvent.getParameter("status"),
                    oItem = oEvent.getParameter("item"),
                    oUploadSet = this.getView().byId("idAttach");
                if (oStatus && oStatus !== 201) {
                    oItem.setUploadState("Error");
                    oItem.removeAllStatuses();
                } else {
                    oUploadSet.removeIncompleteItem(oItem);
                    this.setAttachmentModel();
                }



                //this.oItemToUpdate = null;
                //this.byId("versionButton").setEnabled(false);
                // add item to the model
                //var oItem = oEvent.getParameter("item");

                //this.getRaw(oItem);





            },
            onAfterItemRemoved: function (oEvent) {
                // remove item from the model
                var oItem = oEvent.getParameter("item");
                var oModel = this.getView().getModel();
                var aItems = oModel.getProperty("/items");
                var oItemData = oItem?.getBindingContext()?.getObject();
                var iIndex = aItems.findIndex((item) => {
                    return item.id == oItemData?.id;
                });
                if (iIndex > -1) {
                    aItems.splice(iIndex, 1);
                    oModel.setProperty("/items", aItems);
                }
            },

            _getItemData: function (oItem) {
                // generate a 6 digit random number as id
                const iId = Math.floor(Math.random() * 1000000);
                const oFileObject = oItem.getFileObject();
                return {
                    id: iId,
                    Filename: oItem?.getFileName(),
                    uploaded: new Date(),
                    uploadedBy: "John Doe",
                    Mimetype: oFileObject.type,
                    // URL to the uploaded file from blob.
                    url: oItem?.getUrl() ? oItem?.getUrl() : URL.createObjectURL(oFileObject),
                    statuses: [
                        {
                            "title": "Uploaded By",
                            "text": "Jane Burns",
                            "active": true
                        },
                        {
                            "title": "Uploaded On",
                            "text": "Today",
                            "active": false
                        }
                    ]
                };
            },

            onHandleGevoEditPress: function (oEvent) {
                let bEdit;
                if (oEvent.getSource().getText() === "Edit") {
                    bEdit = true;
                } else {
                    bEdit = false;
                }

                // let oSelectedGevo = Object.assign({}, this.oSelGevo);
                let oSelectedGevo = this.oSelGevo;


                this.oGevoModel = new sap.ui.model.json.JSONModel();
                this.oGevoModel.setData(oSelectedGevo);
                sap.ui.getCore().byId(this.createId("idProductsTable1")).setModel(this.oKontierungsModel, "okontierungsModel1");
                sap.ui.getCore().byId(this.createId("FormToolbaredit2")).setModel(this.oGevoModel, "oSelGevoModel1");
                this._getSplitApp().toDetail(this.createId("Gevochange"));
                //this._gevoModeldata = Object.assign({}, this.getView().getModel("oSelGevoModel").getData().results);
            },

            onOpenPressed: function (oEvent) {

            },

            OnRemovePressed: function (oEvent) {

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

            _showDisplayCreateUpdateFragment: function (bEdit) {
                var oView = this.getView();

                let oGevoPage = this.byId("detailPage1");
                //let oGevoPage = this.byId("Gevo");

                oGevoPage.removeAllContent();
                this._getFormFragment(bEdit).then(function (oVBox) {
                    oGevoPage.insertContent(oVBox);
                });

            },

            onSelectionChangedChart: function (oEvent) {
                var oSegment = oEvent.getParameter("segment");

                let sQuery;
                //sQuery = "1387346";
                sQuery = oSegment.getLabel();
                if (oSegment.getSelected() === true) {
                    //this.aFilterChart.push(new Filter("Kostenstelle", FilterOperator.Contains, sQuery));
                    this.aFilterChart = this.aFilterChart.concat(new Filter("Beschreibung", FilterOperator.Contains, sQuery));

                } else {
                    //this.aFilterChart.remove(new Filter("Kostenstelle", FilterOperator.Contains, sQuery));
                    this.aFilterChart.splice(this.aFilterChart.findIndex(a => a.sPath === sQuery), 1)
                }

                let oTable = this.getView().byId("idProductsTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(this.aFilterChart);
            },

            fnSuccessCallback: function (oResult, oResponse) {
                // do something
                this.oBusyDialog.close();
                let oModelRueckstellung = new sap.ui.model.json.JSONModel();
                oModelRueckstellung.setData(oResult.results);
                this.getView().setModel(oModelRueckstellung, "oModelRueckstell");

            },
            fnErrorCallback: function (oError) {
                this.oBusyDialog.close();
                // output error
            },

            onRueck: function (oEvent) {
                this.oBusyDialog.open();

                //let nItemNr = oEvent.getParameter("listItem").getBindingContext("dataModel").getProperty("geschaeftsvorfaell_id")
                let oSelectedGevoModel = new sap.ui.model.json.JSONModel();
                let oSelectedObject = oEvent.getParameter("listItem").getBindingContext("oModelRueckstell").getObject();
                this.oSelectedRueck = oSelectedObject;
                var oModel = this.getOwnerComponent().getModel();
                //               oModel.read("/RueckstellungSet(" + "'" + oSelectedObject.Rueckstellungid + "'" + ")/GeschaeftsvorfallSet", {
                //                   success: function (oData, oResponse) {
                //                       oSelectedGevoModel.setData(oData);
                //                       this.oGevoModel = oSelectedGevoModel;
                //                       oSelectedGevoModel.refresh();
                //                       this.getView().setModel(oSelectedGevoModel, "oSelGevoModel");
                //                       // this.getView().byId("Gevochange").setModel(oSelectedGevoModel, "oSelGevoModel");
                //                       this._getSplitApp().toMaster(this.createId("masterGevo"));
                //                       this.oBusyDialog.close();
                //                   }.bind(this),
                //                   error: this.fnErrorCallback.bind(this),
                //               });


                var afilters = [];
                var filterByName = new sap.ui.model.Filter("Rueckstellungid", sap.ui.model.FilterOperator.Contains, oSelectedObject.Rueckstellungid)
                afilters.push(filterByName);
                oModel.read("/GeschaeftsvorfallSet", {
                    filters: afilters,
                    success: function (oData, oResponse) {
                        oSelectedGevoModel.setData(oData);
                        this.oGevoModel = oSelectedGevoModel;
                        oSelectedGevoModel.refresh();
                        this.getView().setModel(oSelectedGevoModel, "oSelGevoModel");
                        // this.getView().byId("Gevochange").setModel(oSelectedGevoModel, "oSelGevoModel");
                        this._getSplitApp().toMaster(this.createId("masterGevo"));
                        this.oBusyDialog.close();
                    }.bind(this),
                    error: this.fnErrorCallback.bind(this)
                });


            },

            onGevo: function (oEvent) {
                this.oBusyDialog.open();
                let sPath = oEvent.getParameter("listItem").getBindingContext("oSelGevoModel").getPath();
                let oSelectedKontierungModel = new sap.ui.model.json.JSONModel();
                let oSelectedObject = oEvent.getParameter("listItem").getBindingContext("oSelGevoModel").getObject();
                this.oSelGevo = oSelectedObject;
                var oModel = this.getOwnerComponent().getModel();
                let oModelSelRueck = new JSONModel();
                if (this.getView().getModel("oModelSelGevoWfCtxt")){
                    this.getView().getModel("oModelSelGevoWfCtxt").setData("");
                    //this.getView().byId("integrationCard").destroy()
                }

                if (this.getView().byId("integrationCard").getAggregation("items")){
                    if (this.getView().byId("integrationCard").getAggregation("items").length > 0){
                        this.getView().byId("integrationCard").getAggregation("items")[0].destroy();
                    }
                    
                }
                
                oModelSelRueck.setData(this.oSelectedRueck)
                this.getView().setModel(oModelSelRueck, "oModelSelRueck");
                if (this.oSelGevo.WfInstanceId) {
                    this.buildWfhistory(this.oSelGevo);
                    this.buildWfContext(this.oSelGevo);
                }




                //               oModel.read("/GeschaeftsvorfallSet(" + "'" + oSelectedObject.GeschaeftsvorfaellId + "'" + ")/KontierungSet", {
                //                   success: function (oData, oResponse) {
                //                       oSelectedKontierungModel.setData(oData);
                //                       oSelectedKontierungModel.refresh();
                //                       this.oKontierungsModel = oSelectedKontierungModel;
                //bind to the Display View
                //                       this.getView().byId("idProductsTable").setModel(oSelectedKontierungModel, "oSelKontierungModel");
                //                       this._getSplitApp().toMaster(this.createId("detailPage1"));
                //                       this.oBusyDialog.close();
                //                    }.bind(this),
                //                    error: this.fnErrorCallback.bind(this),
                //               } );


                var afilters = [];
                var filterByName = new sap.ui.model.Filter("Gevoid", sap.ui.model.FilterOperator.Contains, oSelectedObject.GeschaeftsvorfaellId)
                afilters.push(filterByName);
                oModel.read("/KontierungSet", {
                    filters: afilters,
                    success: function (oData, oResponse) {
                        oSelectedKontierungModel.setData(oData);
                        oSelectedKontierungModel.refresh();
                        this.oKontierungsModel = oSelectedKontierungModel;
                        //bind to the Display View
                        this.getView().byId("idProductsTable").setModel(oSelectedKontierungModel, "oSelKontierungModel");
                        this._getSplitApp().toMaster(this.createId("detailPage1"));
                        this.oBusyDialog.close();

                        createChart(this);
                    }.bind(this),
                    error: this.fnErrorCallback.bind(this)
                });

                this.byId("detailPage1").bindElement({ path: sPath, model: "oSelGevoModel" });
                this._getSplitApp().toDetail(this.createId("detailPage1"));
                this.aFilterChart = [];
                let aSelectedSegments = this.getView().byId("chart").getSelectedSegments();
                //Segments deselektieren
                //this.getView().byId("chart").setSelectedSegments(oSelectedSegments)
                aSelectedSegments.forEach(element => {
                    element.setSelected(false);

                });
                function createChart(that) {
                    //create JsonModel
                    let aSegments = [];
                    let aKontierungsdaten = that.oKontierungsModel.getData().results;
                    let oKontChart = {};
                    aKontierungsdaten.forEach(element => {
                        oKontChart = {}
                        oKontChart.label = element.Beschreibung
                        oKontChart.value = 30.0
                        oKontChart.DisplayedValue = oKontChart.value + "%"
                        oKontChart.color = "Error"
                        //aSegments.concat(oKontChart)
                        aSegments.push(oKontChart)
                    });

                    that.oModelKontiChart = new JSONModel();
                    that.oModelKontiChart.setData(aSegments);
                    that.getView().setModel(that.oModelKontiChart, "OModelKontierungChart");


                }

                this._initUpload();
                this._initDocument();


            },

            onCancelCreateGevo: function () {
                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },

            buildWfContext: function (oSelGevo) {
                var oModel = this.getOwnerComponent().getModel();
                this.sWfInstanceId = oSelGevo.WfInstanceId;
                oModel.callFunction("/GET_WF_CONTEXT", {
                    method: "GET",
                    urlParameters: {
                        instance_id_wf: oSelGevo.WfInstanceId
                    },
                    success: function (oData, response) {
                        let oWfContext = JSON.parse(oData.RESPONSE);
                        this.oModelSelGevoWfCtxt.setData(oWfContext);
                        //let aWfStatusDataCtxt = this._wfCtxtDataTransform(oWfContext);
                        //this._initIntegrationCard(aWfStatusData);
                        this.getView().setModel(this.oModelSelGevoWfCtxt, "oModelSelGevoWfCtxt");
                        // this.oBusyDialog.close();
                    }.bind(this), // callback function for success
                    error: function (oError) { }.bind(this) // callback function for error 
                });
            },

            buildWfhistory: function (oSelGevo) {
                // this.oBusyDialog.open();
                var oModel = this.getOwnerComponent().getModel();
                this.sWfInstanceId = oSelGevo.WfInstanceId;
                oModel.callFunction("/GET_EXECUTION_LOGS", {
                    method: "GET",
                    urlParameters: {
                        instance_id_wf: oSelGevo.WfInstanceId
                    },
                    success: function (oData, response) {
                        let oWfHistory = JSON.parse(oData.RESPONSE);
                        this.oModelSelGevoWf.setData(oWfHistory);
                        let aWfStatusData = this._wfDataTransform(oWfHistory);
                        this._initIntegrationCard(aWfStatusData);
                        this.getView().setModel(this.oModelSelGevoWf, "oModelSelGevoWf");
                        // this.oBusyDialog.close();
                    }.bind(this), // callback function for success
                    error: function (oError) { }.bind(this) // callback function for error 
                });
            },
            _wfCtxtDataTransform: function (aWfctxt) {

            },
            _wfDataTransform: function (aWfHistory) {
                let aTaskWf = [];
                aWfHistory.forEach(element => {
                    let oWfTask = {};
                    if ((element.type === 'WORKFLOW_STARTED') || (element.type === "ACTIONTASK_CREATED") || (element.type === "ACTIONTASK_FAILED")
                        || (element.type === "USERTASK_CREATED") || (element.type === "USERTASK_COMPLETED")) {
                        oWfTask.Title = element.type
                        if (element.recipientUsers) {
                            oWfTask.Description = element.recipientUsers[0]
                        }
                        if (element.type.toString().includes("WORKFLOW")) {
                            oWfTask.Icon = "sap-icon://begin"
                        } else if (element.type.toString().includes("USERTASK")) {
                            oWfTask.Icon = "sap-icon://employee"
                        } else if (element.type.toString().includes("ACTIONTASK")) {
                            oWfTask.Icon = "sap-icon://action-settings"
                        }
                        oWfTask.Time = element.timestamp;
                        oWfTask.Url = "Error";
                        aTaskWf.push(oWfTask);
                        oWfTask = {};
                    }


                })

                return aTaskWf;

            },
            onSaveNewGevo: function () {
                var busy = this.oBusyDialog;
                var oPayload = this.oNewGevoModel.getData();
                busy.open();
                oPayload.BetragInRw = oPayload.BetragInRw.toString();
                this.getOwnerComponent().getModel().create("/GeschaeftsvorfallSet", oPayload, {
                    success: function () {
                        busy.close();
                        sap.m.MessageToast.show("Gevo created successfully");
                        this._getSplitApp().toDetail(this.createId("detailPage2"));
                    }.bind(this),
                    error: function () {
                        busy.close();
                        sap.m.MessageToast.show("Error creating Gevo");
                    }
                });

            },

            _afterCreatingDeletingNewGevo: function () {
                this._getSplitApp().toDetail(this.createId("detailPage2"));
                //Refresh Gevotable (again read)
                //navigate back to the empty view
            },
            onDeleteGevo: function () {
                var oPayload = this.oGevoModel.getData();
                this.getOwnerComponent().getModel().remove("/GeschaeftsvorfallSet('" + oPayload.GeschaeftsvorfaellId + "')", oPayload, {
                    success: function () {
                        busy.close();
                        sap.m.MessageToast.show("Gevo deleted successfully");
                        this.oGevoModel.setData({});
                        this.oGevoModel.refresh();
                        this._getSplitApp().toDetail(this.createId("detailPage2"));
                    }.bind(this),
                    error: function () {
                        busy.close();
                        sap.m.MessageToast.show("Error deleting Gevo");
                    }
                });
            },

            onCancelChangeGevo: function () {
                this._getSplitApp().toDetail(this.createId("detailPage1"));
            },
            onSaveChangeGevo: function () {
                //update
                var busy = this.oBusyDialog;
                var oPayload = this.oGevoModel.getData();
                oPayload.BetragInRw = oPayload.BetragInRw.toString();
                busy.open()
                this.getOwnerComponent().getModel().update("/GeschaeftsvorfallSet('" + oPayload.GeschaeftsvorfaellId + "')", oPayload, {
                    success: function () {
                        busy.close();
                        sap.m.MessageToast.show("Gevo updated successfully");
                        this.oGevoModel.setData({});
                        this.oGevoModel.refresh();
                        this._getSplitApp().toDetail(this.createId("detailPage1"));
                        //this.getView().byId("gevosTable").getModel().refresh(true);
                        this.getView().getModel("oSelGevoModel").refresh(true);
                    }.bind(this),
                    error: function () {
                        busy.close();
                        sap.m.MessageToast.show("Error updating Gevo");
                    }
                });


            },
            onPressMasterRueckBack: function () {
                this._getSplitApp().backMaster();
                this._getSplitApp().toDetail(this.createId("detailPage2"));
            },
            _getSplitApp: function () {
                let result = this.byId("splitApp");
                if (!result) {
                    Log.info("SplitApp object can't be found");
                }
                return result;
            },

            onNew: function () {
                var oData = {
                    GeschaeftsvorfaellId: '900',
                    Gevoname: "n",
                    Gevoart: "gg",
                    Periode: "10",
                    RlaGruppe: "5",
                    Belegdatum: "2015-12-31T00:00:00",
                    Buchungsdatum: "2015-12-31T00:00:00",
                    Land: "DEU",
                    BetragInRw: "2.5",
                    Waers: "EUR",
                    Rueckstellungid: '36648'
                }

                let oNewGevoModel = new JSONModel(oData);
                sap.ui.getCore().byId(this.createId("FormToolbarnew")).setModel(oNewGevoModel, "oNewGevoModel");
                this.oNewGevoModel = oNewGevoModel;
                this._getSplitApp().toDetail(this.createId("newGevo"));
            },

            onSimulate: function () {
                // read msg from i18n model
                const oBundle = this.getView().getModel("i18n").getResourceBundle();
                this.onOpenDialog();
                // show message
                // MessageToast.show("fffffffffffffffffffffffffffffff");


                // require dependencies
                //const PDFDocument = require('pdfkit');
                //const blobStream = require('blob-stream');

                // create a document the same way as above
                const doc = new PDFDocument();

                // pipe the document to a blob
                const stream = doc.pipe(blobStream());

                // add your content to the document here, as usual

                // get a blob when you are done
                doc.end();
                stream.on('finish', function () {
                    // get a blob you can do whatever you like with
                    const blob = stream.toBlob('application/pdf');

                    // or get a blob URL for display in the browser
                    const url = stream.toBlobURL('application/pdf');
                    //iframe.src = url;
                    const clickElement = document.createElement("a");
                    clickElement.href = url;
                    clickElement.download = "MyPdf";
                    clickElement.click;

                });





            },
            async onOpenDialog() {
                this.oDialog ??= await this.loadFragment({
                    name: "ikor.project1.view.Simulationsergebnis",
                    controller: this.oFragment
                });

                debugger;
                this.oDialog.open();
            },
            onCloseApp: function () {
                MessageBox.warning("Wollen Sie wirklich die APP ohne Simulation verlassen", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        MessageToast.show("Action selected: " + sAction);
                    },
                    dependentOn: this.getView()
                });
            },
            _initIntegrationCard: function (aWfStatusData) {
                var oConfiguration = {
                    "_version": "1.15.0",
                    "sap.app": {
                        "id": "card.explorer.activities.timeline.card",
                        "type": "card",
                        "title": "Sample of a Activities Timeline",
                        "subTitle": "Sample of a Activities Timeline",
                        "applicationVersion": {
                            "version": "1.0.0"
                        },
                        "shortTitle": "A short title for this Card",
                        "info": "Additional information about this Card",
                        "description": "A long description for this Card",
                        "tags": {
                            "keywords": [
                                "Timeline",
                                "Card",
                                "Sample"
                            ]
                        }
                    },
                    "sap.ui": {
                        "technology": "UI5",
                        "icons": {
                            "icon": "sap-icon://activity-items"
                        }
                    },
                    "sap.card": {
                        "type": "Timeline",
                        "header": {
                            "title": "Genehmigungs-Workflow",
                            "subTitle": this.sWfInstanceId // this.oModelSelGevoWf
                        },
                        "content": {
                            "maxItems": 5,
                            "data": {
                                /* "json": [
                                     {
                                         "Title": "Weekly sync: Marketplace / Design Stream",
                                         "Description": "MRR WDF18 C3.2(GLASSBOX)",
                                         "Icon": "sap-icon://appointment-2",
                                         "Time": "2021-10-25T10:00:00.000Z",
                                         "Url": "/activity1"
                                     },
                                     {
                                         "Title": "Video Conference for FLP@SF, S4,Hybris",
                                         "Icon": "sap-icon://my-view",
                                         "Time": "2021-10-25T14:00:00.000Z",
                                         "Url": "/activity2"
                                     },
                                     {
                                         "Title": "Call 'Project Nimbus'",
                                         "Icon": "sap-icon://outgoing-call",
                                         "Time": "2021-10-25T16:00:00.000Z",
                                         "Url": "/activity3"
                                     }
                                 ]*/
                                "json": aWfStatusData
                            },
                            "item": {
                                "dateTime": {
                                    "value": "{Time}"
                                },
                                "description": {
                                    "value": "{Description}"
                                },
                                "title": {
                                    "value": "{Title}"
                                },
                                "icon": {
                                    "src": "{Icon}"
                                },
                                "actions": [
                                    {
                                        "type": "Navigation",
                                        "parameters": {
                                            "url": "{Url}"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }

                var oCard = new Card();
                oCard.setManifest(oConfiguration);
                //var oContainer = this.getView().byId("cardsContainer");
                var oContainer = this.getView().byId("integrationCard");
                try {
                    oContainer.removeAllContent();
                } catch (error) {

                }
                oContainer.addAggregation("items", oCard)
            }



        });
    });
