define ([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful", "dojo/store/Memory",
    "dojo/Deferred", "dojo/promise/all", "dojo/on",
    "esri/tasks/query", "esri/tasks/QueryTask", "esri/layers/GraphicsLayer"
], function (declare, lang, Stateful, Memory, Deferred, all, on,
             Query, QueryTask, GraphicsLayer) {

	return declare([Memory], {

		// Manually call super constructor
		//"-chains-": {
		//	constructor: "manual"
		//},

        countryColumn: "Country",
        graphicsLayer: null,
		opLayer: null,
        map: null,
        filters: [],

		constructor: function(opLayer, properties) {

            if (properties) {
                lang.mixin(this, properties);
            }
            if (!this.graphicsLayer) {
                this.graphicsLayer = new GraphicsLayer({
                    id: "projects",
                    className: "projects-layer",
                    styling: false,
                    dataAttributes:["GDL_Team"]
                });
                // this.graphicsLayer = new GraphicsLayer({
                // });
                this.graphicsLayer.setRenderer(opLayer.renderer);
                this.map.addLayer(this.graphicsLayer);
            }
            this.data = [];
			this.opLayer = opLayer;

        },

        initialize: function() {
            var allDone = new Deferred();

            var cntQuery = new Query();
            cntQuery.where = "1=1";
            cntQuery.outFields = ['*'];
            cntQuery.returnGeometry = true;

            var queryCntTask = new QueryTask(this.opLayer.url);
            queryCntTask.executeForCount(cntQuery).then(lang.hitch(this, function(count) {
                // All of the records are already in tghe layer, no need to query
                if (count == this.opLayer.graphics.length) {
                    console.debug("Initializing with records from feature layer.");
                    this._loadFeatures(this.opLayer.graphics);
                    this._refreshGraphics();
                    allDone.resolve();

                // All records can be returned via one query
                } else if (count <= 1000) {
                    console.debug("Initializing with records from single query.");

                    var allQuery = new Query();
                    allQuery.where = "1=1";
                    allQuery.outFields = ['*'];
                    allQuery.returnGeometry = true;

                    var queryTask = new QueryTask(this.opLayer.url);
                    queryTask.execute(allQuery).then(lang.hitch(this, function(resultSet) {
                        this._loadFeatures(resultSet);
                        this._refreshGraphics();
                        allDone.resolve();
                    }), function(error) {
                        console.error("Error querying records");
                        allDone.reject(error);
                    });  // execute (all)

                // Records have to be returned through several queries
                } else {
                    console.debug("Initializing with records from multiple queries (" + count +") records." );

                    var allQuery = new Query();
                    allQuery.where = "1=1";
                    allQuery.outFields = ['*'];
                    allQuery.returnGeometry = true;

                    var queryTask = new QueryTask(this.opLayer.url);
                    queryTask.executeForIds(allQuery).then(lang.hitch(this, function(ids) {
                        while (ids.length > 0) {
                            var idQuery = new Query();
                            idQuery.outFields = ['*'];
                            idQuery.returnGeometry = true;
                            idQuery.objectIds = ids.splice(0, 100);

                            var queryByIdTask = new QueryTask(this.opLayer.url);
                            queryByIdTask.execute(idQuery).then(lang.hitch(this, function(resultSet) {
                                this._loadFeatures(resultSet);
                                this._refreshGraphics();
                                if (this.data.length == count) {
                                    allDone.resolve();
                                }
                            }), function(error) {
                                console.error("Error querying by ID");
                                allDone.reject(error);
                            });  // execute (by ids)

                        }
                    }), function(error) {
                        console.error("Error querying for ID");
                        allDone.reject(error);
                    }); // executeForIds

                }
            }), function(error) {
                console.error("Error querying for count");
                allDone.reject(error);
            });  // executeForCount

            allDone.then(lang.hitch(this, function(){
                console.debug("Store update done.")
                on.emit(this, "update-end");
            }), function(error) {
                console.error("Error building the glStore");
            })

            return allDone;
        },

        refreshData: function(opLayer) {
        },

        // Does not take into acount the filter
        getUniqueValues : function(column) {
            var uValues = []

            for (var i = 0; i < this.data.length; i++) {
                var rec = this.data[i];
                try {
                    if (uValues.indexOf(rec[column]) < 0) {
                        uValues.push(rec[column]);
                    }
                } catch (e) {
                    console.error("Column " + filter.column + " does not exist.")
                }
            }
            return uValues;
        },

        setFilter: function(filterFunction, filterId) {
            if (filterId < 0) {
               filterId = this.filters.push(filterFunction) -1;
            } else {
                this.filters[filterId] = filterFunction
            }
            return filterId;
        },

        clearFilters: function() {
            this.filters = [];
            for (var i = 0; i < this.data.length; i++) {
                var rec = this.data[i];
                this.setRecordSelected(rec, true);
            }
        },

        filter: function() {
            console.debug("Filtering");
            for (var i = 0; i < this.data.length; i++) {
                var rec = this.data[i];
                var pass = true;
                for (var j = 0; j < this.filters.length; j++) {
                    var filterFunction = this.filters[j];
                    pass = pass && filterFunction(rec);
                }
                this.setRecordSelected(rec, pass)
            }

            // Debug
            var selset = this.query({_selected: true});
            console.debug("End filtering. " + selset.length + " selected out of " + this.data.length);
        },

        // Return records with column = value, observing the current filter.
        getSelectedForValue: function(column, value) {

        },

        queryFiltered: function(q) {
            lang.mixin(q, {_selected: true})
            return this.query(q);
        },

        setRecordSelected: function(rec, selected) {
          if (selected) {
            rec._graphic.show();
            rec._selected = true;
          } else {
            rec._graphic.hide();
            rec._selected = false;
          }
        },

        _loadFeatures: function(features) {
            // Check if argument is featureset or array of graphics
            if (features.features) {
                features = features.features;
            }
            for (var i = 0; i < features.length; i++) {
                var rec = {};
                lang.mixin(rec, features[i].attributes);
                rec._graphic = features[i];
                rec._selected = true;
                this.data.push(rec);
            }
        },

        _refreshGraphics: function() {
            this.graphicsLayer.clear();
            for (var i = 0; i < this.data.length; i++) {
                var g = this.data[i]._graphic;
                this.graphicsLayer.add(g);
                if (this.data[i]._selected) {
                    g.show();
                } else {
                    g.hide();
                }
            }
        }

	})  // return declare
})