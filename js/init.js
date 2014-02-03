      var filter_cfg = [];

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
        "dojo/request",
        "esri/map", 
        "esri/urlUtils",
        "esri/arcgis/utils",
        "esri/dijit/Legend",
        "esri/dijit/Scalebar",
        "gdljs/MultiselectFilterView",
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
        request,
        Map,
        urlUtils,
        arcgisUtils,
        Legend,
        Scalebar,
        MultiselectFilterView
      ) {
        ready(function(){

        parser.parse();

        request("cfg/filters.cfg", {handleAs: 'json'}).then(function(v) {
          filter_cfg = v;
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
      });

      function createFilterUI(opLayer) {
        console.debug("Update filter ui");

        var data = [];
        var activityTypes = [];
        var gdlTeams = [];

        var aTypeInputs = [];
        var gdlTeamInputs = [];
        
        for (var i = 0; i < filter_cfg.length; i++) {
          var filter = filter_cfg[i];
          var data = [];
          filter.uValues = []
          for (var j = 0; j < opLayer.graphics.length; j++) {
            var rec = opLayer.graphics[j].attributes;
            rec._graphic = opLayer.graphics[j];
            if (filter.type == 'IN') {
                try {
                  if (filter.uValues.indexOf(rec[filter.column]) < 0) {
                    filter.uValues.push(rec[filter.column]);
                  }
                } catch (e) {
                  console.error("Column " + filter.column + " does not exist.")
                }
              }
          }
          filter.store = new Observable(new Memory({data: data}));
          filter.uValues.sort();

          var rootEl = dom.byId("filter");
          try {
            var filterForm = new MultiselectFilterView({
              "data": filter.uValues,
              "label": filter.label
            }, domConstruct.create("div", null, rootEl, "last"));
          } catch (e) {
            console.error(e);
          }
          console.debug("End update filter ui");
        }

        /*
        for (var i = 0; i < opLayer.graphics.length; i++) {
          var rec = opLayer.graphics[i].attributes;
          rec._graphic = opLayer.graphics[i];
          if (activityTypes.indexOf(rec.Activity_Type) < 0) {
            activityTypes.push(rec.Activity_Type);
          }
          if (gdlTeams.indexOf(rec.GDL_Team) < 0) {
            gdlTeams.push(rec.GDL_Team);
          }
        }
        var opLayStore = new Observable(new Memory({data: data}));
        activityTypes.sort();
        gdlTeams.sort();
        

        var cbdStyle = {float: 'left', left:'0px'};
        var lblStyle = {'padding-left': '10pt'}
        var edStyle = {clear:'both'}
        var filterElStyle = {'max-height': '200pt', 'overflow-x': 'auto'};

        var rootEl = dom.byId("filter");

        for (var i = 0; i < filter_cfg.length; i++) {
          var filter = filter_cfg[i];
          filter.inputEls = [];
          var filterLabel = domConstruct.create("span", {innerHTML: filter.label}, rootEl, "last");
          var filterEl = domConstruct.create("div", {style:filterElStyle}, rootEl, "last");

          for (var i = 0; i < filter.uValues.length; i++) {
            var uv = filter.uValues[i]

            var ed = domConstruct.create("div", {style:edStyle}, filterEl, "last");
            var cbd = domConstruct.create("div", {style: cbdStyle}, ed, "last");

            var cbatts = {type: "checkbox", 
                          value: uv,
                          checked: "checked", 
                          name: filter.name + "_cb_" + i, 
                          id:  filter.name + "_cb_" + i,
                          onchange: filterUpdateHandler};
            var cb = domConstruct.create("input", cbatts, cbd, "last");
            filter.inputEls.push(cb);

            var lbld = domConstruct.create("div", {style: lblStyle}, ed, "last");
            var lblatts = {innerHTML: at, 'for': "atcb_" + i}
            var lbl = domConstruct.create("label", lblatts, lbld, "last");
          }
          */
        }

        function filterUpdateHandler() {
          for (var i = 0; i < filter_cfg.length; i++) {
            var filter = filter_cfg[i];
            var queryObject = {
              columnName : filter.column,
              queryType : filter.type,
            }
            //if (filter.type == 'IN') {
            //  for 
            //}

          }
        }

        //function filterData(opLayStore, query) {
         // opLayStore.query(lang.partial(queryFunct, query, function(g, s) {setGraphicSelected(g._graphic, s)});
        //}

        // Query: object with properties
        //    columnName
        //    queryType: EQ, IN
        //    queryValue: string or number for EQ, list for IN
        function queryFunct(query, funct, object) {
          if (! (query.hasOwnProperty("columnName") && 
                 query.hasOwnProperty("queryType") && 
                 query.hasOwnProperty("queryValue"))) {
            console.error("Invalid query definition.")
            throw "Invalid query definition."
          }
          if (! object.hasOwnProperty(columnName)) {
            console.warning("Column " + query.columnName + " doesn't exist in data.")
            throw "Column " + query.columnName + " doesn't exist in data."

          }
          var pass = false;
          if (query.queryType == 'EQ') {
            pass = object[columnName] == query.queryValue;
          } else if (query.queryType == 'IN') {
            pass = query.indexOf(object) >= 0;
          } else {
            console.warning("Unknown query type " + query.queryType)
            throw "Unknown query type " + query.queryType
          }
          if (funct) {
            funct(object, pass);
          }
          return pass;
        }

        function setGraphicSelected(graphic, selected) {
          if (selected) {
            graphic.show();
          } else {
            graphic.hide();
          }
        }
      });