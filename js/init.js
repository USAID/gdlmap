      require([
        "dojo/parser",
        "dojo/ready",
        "dojo/_base/lang",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/store/Observable",
        "dojo/store/Memory",
        "esri/map", 
        "esri/urlUtils",
        "esri/arcgis/utils",
        "esri/dijit/Legend",
        "esri/dijit/Scalebar",
        "dojo/domReady!"
      ], function(
        parser,
        ready,
        lang,
        BorderContainer,
        ContentPane,
        dom,
        domConstruct,
        on,
        Observable,
        Memory,
        Map,
        urlUtils,
        arcgisUtils,
        Legend,
        Scalebar
      ) {
        ready(function(){

        parser.parse();


        arcgisUtils.createMap("5bf2421c69414c8f81719b93da369fa9","map").then(function(response){
          //update the app 
          dom.byId("title").innerHTML = response.itemInfo.item.title;
          dom.byId("subtitle").innerHTML = response.itemInfo.item.snippet;

          var map = response.map;

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
            var opLayer = response.itemInfo.itemData.operationalLayers[0].layerObject;
            on.once(opLayer, 'update-end', lang.partial(createFilterUI, opLayer));
          }

        });

        });

      function createFilterUI(opLayer) {
        console.debug("Update filter ui");

        var data = [];
        var activityTypes = [];
        var gdlTeams = [];
        
        for (var i = 0; i < opLayer.graphics.length; i++) {
          var rec = opLayer.graphics[i].attributes;
          rec._geometry = opLayer.graphics[i].geometry;
          if (activityTypes.indexOf(rec.Activity_Type) < 0) {
            activityTypes.push(rec.Activity_Type);
          }
          if (gdlTeams.indexOf(rec.GDL_Team) < 0) {
            gdlTeams.push(rec.GDL_Team);
          }
        }
        var opLayStore = new Observable(new Memory({data: data}));
        activityTypes.sort();
        gdlTeam.sort();

        var cbdStyle = {float: 'left', left:'0px'};
        var lblStyle = {'padding-left': '10pt'}
        var edStyle = {clear:'both'}
        var atFilterElStyle = {'max-height': '200pt', 'overflow-x': 'auto'};

        var rootEl = dom.byId("filter");

        var atFilterLabel = domConstruct.create("span", {innerHTML: "Activity Type"}, rootEl, "last");
        var atFilterEl = domConstruct.create("div", {style:atFilterElStyle}, rootEl, "last");

        for (var i = 0; i < activityTypes.length; i++) {
          var at = activityTypes[i]

          var ed = domConstruct.create("div", {style:edStyle}, atFilterEl, "last");
          var cbd = domConstruct.create("div", {style: cbdStyle}, ed, "last");

          var cbatts = {type: "checkbox", value: at, checked: "checked", name: "atcb_" + i, id:  "atcb_" + i};
          var cb = domConstruct.create("input", cbatts, cbd, "last");

          var lbld = domConstruct.create("div", {style: lblStyle}, ed, "last");
          var lblatts = {innerHTML: at, 'for': "atcb_" + i}
          var lbl = domConstruct.create("label", lblatts, lbld, "last");
        }

        var gdlFilterLabel = domConstruct.create("span", {innerHTML: "GDL Team"}, rootEl, "last");
        var gdlFilterEl = domConstruct.create("div", {style:atFilterElStyle}, rootEl, "last");
        for (var i = 0; i < gdlTeams.length; i++) {
          var gdlt = gdlTeams[i]

          var ed = domConstruct.create("div", {style:edStyle}, gdlFilterEl, "last");
          var cbd = domConstruct.create("div", {style: cbdStyle}, ed, "last");

          var cbatts = {type: "checkbox", value: at, checked: "checked", name: "gdlcb_" + i, id:  "gdlcb_" + i};
          var cb = domConstruct.create("input", cbatts, cbd, "last");

          var lbld = domConstruct.create("div", {style: lblStyle}, ed, "last");
          var lblatts = {innerHTML: gdlt, 'for': "gdlcb_" + i}
          var lbl = domConstruct.create("label", lblatts, lbld, "last");
        }



        console.debug("End update filter ui");
      }

      });