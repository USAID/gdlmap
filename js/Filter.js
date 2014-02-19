define ([
	 "dojo/_base/declare",
	 "dojo/Stateful",
	 "dojo/_base/lang"
], function (declare, Stateful, lang) {

	return declare([Stateful], {

		values: [],
		selectedValues: [],
		store: null,
		filterId : -1,
		totalCount: 0,
		filteredCount: 0,

		constructor: function(props, store) {
			lang.mixin(this, props);
			this.values = store.getUniqueValues(this.column);
			this.selectedValues = this.values;
			this.store = store;
			this.totalCount = this.filteredCount = store.data.length;
			this.watch("selectedValues", lang.hitch(this, function(name, oldVal, val) {
				this.filterId = this.store.setFilter(lang.hitch(this, this.selectFunction), this.filterId);
				this.store.filter();
				this.set("filteredCount", this.store.queryFiltered({}).length);
			}));
		},

		selectFunction: function(rec) {

            if (! rec.hasOwnProperty(this.column)) {
                console.warn("Column " + this.column + " doesn't exist in data.")
                throw "Column " + this.column + " doesn't exist in data."
            }
            var pass = false;
            if (this.type == 'IN') {
                pass = this.selectedValues.indexOf(rec[this.column]) >= 0;
            } else {
                console.warn("Unknown query type " + this.type)
                throw "Unknown query type " + this.type
            }
            return pass;
		}


	})  // return declare
})