      var filter_cfg = [], opLayerStore = null, map = null, ui = {};

      require([
        "dojo/parser", "dojo/ready", "dojo/_base/lang", "dojo/_base/array", "dijit/Dialog",
        "dojo/dom", "dojo/dom-construct", "dojo/on", "dojo/request", "dojo/query",
        "esri/map", "esri/urlUtils", "esri/arcgis/utils", "esri/graphic", "esri/dijit/Legend",
        "esri/dijit/Scalebar", 
        "gdljs/MultiselectFilterView", "gdljs/CountryProjectList", "gdljs/Filter",
        "gdljs/LayerStore", "gdljs/glStore",
        "dojo/NodeList-manipulate",  // Doesn't need mapping
        "dojo/domReady!"
      ], function(
        parser, ready, lang, array, Dialog,
        dom, domConstruct, on, request, query,
        Map, urlUtils, arcgisUtils, Graphic, Legend,
        Scalebar, MultiselectFilterView, CountryProjectList, Filter,
        LayerStore, GlStore
      ) {
        ready(function(){

        parser.parse();

        request("cfg/filters.json", {handleAs: 'json'}).then(function(v) {

          setWorking(true);

          filter_cfg = v;

          arcgisUtils.createMap("5bf2421c69414c8f81719b93da369fa9","map").then(function(response){

            // Remove map click handler - we'll have our own
            if (response.clickEventHandle) {
              response.clickEventHandle.remove();
            }

            map = response.map;

            var opLayer = response.itemInfo.itemData.operationalLayers[0].layerObject;
            // on(opLayer, 'click', projectClickHandler)

            //update the app 
            dom.byId("title").innerHTML = response.itemInfo.item.title;
            dom.byId("subtitle").innerHTML = response.itemInfo.item.description;

            //add the scalebar 
            var scalebar = new Scalebar({
              map: map,
              scalebarUnit: "english"
            });

            if (dom.byId("legend")) {
              //add the legend. Note that we use the utility method getLegendLayers to get 
              //the layers to display in the legend from the createMap response.
              var legendLayers = arcgisUtils.getLegendLayers(response); 
              var legendDijit = new Legend({
                map: map,
                layerInfos: legendLayers
              },"legend");
              legendDijit.startup();            
            }

            if (dom.byId("filter")) {
                on.once(opLayer, 'update-end', function() {
                    initializeFilters(opLayer);
                    initializeDialog();
                });
            }

            query(".map .logo-med").after("<div class='logo-usaid'></div>");

          }); // create map, then
        });  // request cfg_filters, then
      });  // ready

      function initializeFilters(opLayer) {
          console.debug("Initialize filter");
          var rootEl = dom.byId("filter");
          try {

              //var ls = new LayerStore(opLayer);
              var ls = new GlStore(opLayer, {
                map: map
              });
              opLayer.hide();

              on(opLayer, 'update-end', function() {
                  ls.refreshData(opLayer);
              });
              opLayerStore = ls;

              opLayerStore.initialize().then(function() {
                for (var i = 0; i < filter_cfg.length; i++) {
                    var flt = new Filter(filter_cfg[i], ls);                  
                    filter_cfg[i].filter = flt;

                    var filterForm = new MultiselectFilterView({
                        "data": flt.get("values"),
                        "label": flt.get("label")
                    }, domConstruct.create("div", null, rootEl, "last"));

                    filterForm.watch("selectedValues", function(prop, oldV, newV) {
                        flt.set("selectedValues", newV);
                    });
                    flt.watch(function(name, oldValue, value) {
                      query('#' + name + 'Label').innerHTML(value);
                    });
                    query('#totalCountLabel').innerHTML(flt.totalCount);
                    query('#filteredCountLabel').innerHTML(flt.filteredCount);

                    on(opLayerStore.graphicsLayer, 'click', projectClickHandler);

                    setWorking(false);
                }
              });
          } catch (e) {
              console.error(e);
          }
      }

      function initializeDialog() {
          ui.cpWidget = new CountryProjectList({
              store: opLayerStore
          }, domConstruct.create("div"));      

          ui.projectDialog = new Dialog({
              content: ui.cpWidget
          });

      }

      function projectClickHandler(event) {
          console.debug("Project clciked");
          var country = event.graphic.attributes.Country;

          ui.projectDialog.show();
          ui.cpWidget.set("country", country);
          ui.projectDialog.set("title", "Projects in " + country);

          console.debug("End Project clciked");
      }

      setWorking = function(isWorking) {
        query("#workingDiv").style("display", isWorking ? "block" : "none");
      };

});