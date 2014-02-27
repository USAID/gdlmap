define ([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful", "dojo/store/Memory",
    "esri/tasks/query", "esri/tasks/QueryTask", "esri/layers/GraphicsLayer"
], function (declare, lang, Stateful, Memory, Query, QueryTask, GraphicsLayer) {

	return declare([Memory], {

		// Manually call super constructor
		//"-chains-": {
		//	constructor: "manual"
		//},

        countryColumn: "Country",
        graphicsLayer: null,
        map: null,

		constructor: function(opLayer, properties) {

            if (properties) {
                lang.mixin(this, properties);
            }
            if (!this.graphicsLayer) {
                this.graphicsLayer = new GraphicsLayer();
                this.map.addlayer(this.graphicsLayer);
            }

            var allQuery = new Query();
            allQuery.where = "1=1";
            allQuery.outFields = ['*'];
            allQuery.returnGeometry = true;
            var queryTask = new QueryTask(opLayer.url);
            queryCntTask.executeForCount(allQuery).then(lang.hitch(this, function(count) {
                if (count == opLayer.graphics.length) {

                } else if (count <= 1000) {
                    queryTask.execute(allQuery).then(lang.hitch(this, function(resultSet) {

                    }), function(error) {

                    });  // execute (all)
                } else {
                    queryTask.executeForIds(allQuery).then(lang.hitch(this, function(ids) {
                        var idQuery = new Query();
                        idQuery.outFiels = ['*'];
                        idQuery.returnGeometry = true;
                        while (ids.length > 0) {
                            idQuery.objectIds = ids.splice(0, 100);
                            queryTask.execute(idQuery).then(lang.hitch(this, function(resultSet) {

                            }), function(error) {

                            });  // execute (by ids)
                        }
                    }), function(error) {

                    }); // executeForIds
                }
            }), function(error) {

            });  // executeForCount

        },

        refreshData: function(opLayer) {
        },

        // Does not take into acount the filter
        getUniqueValues : function(column) {
        },

        setFilter: function(filterFunction, filterId) {
        },

        clearFilters: function() {
        },

        filter: function() {
        },

        // Return records with column = value, observing the current filter.
        getSelectedForValue: function(column, value) {

        },

        queryFiltered: function(q) {
        },

        setRecordSelected: function(rec, selected) {
        }

	})  // return declare
})