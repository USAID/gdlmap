define ([
	 "dojo/_base/declare",
     "dojo/_base/lang",
	 "dojo/Stateful",
	 "dojo/store/Memory"
], function (declare, lang, Stateful, Memory) {

	return declare([Memory], {

		// Manually call super constructor
		//"-chains-": {
		//	constructor: "manual"
		//},

		constructor: function(opLayer) {

			this.filters = [];
            this.refreshData(opLayer);
            console.debug("Constructed layer store");
        },

        refreshData: function(opLayer) {
            var lData = [];
            for (var j = 0; j < opLayer.graphics.length; j++) {
                var rec = opLayer.graphics[j].attributes;
                rec._graphic = opLayer.graphics[j];
                rec._selected = true;
                lData.push(rec);
            }
            //this.inherited({data: lData});
            this.data = lData;
            if (this.filters.length > 0) {
                this.filter();
            }
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
        }


	})  // return declare
})