define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/query",
	"dojo/Stateful",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/store/Memory", 
	"dijit/form/FilteringSelect",
    "dojo/NodeList-traverse"  // no mapping required
	], function(declare, lang, array, dom, domConstruct, domAttr, domClass, query, Stateful,
				_WidgetBase, _TemplatedMixin, Memory, FilteringSelect){

		return declare("CountryProjectList", [_WidgetBase, _TemplatedMixin], {

			templateString: '<div>'+
							'<div data-dojo-attach-point="filter_cb_el"></div>' +
							'<hr>' +
							'<div data-dojo-attach-point="list_el" class="projectListContainer"></div>' +
							'</div>',
			store: null,

			country: null,
			_setCountryAttr: function(value) {
				this.country = value;
				this._countryChanged()
			},

			countryColumn: "Country",
			filterColumn: "Activity_Type",
			nameColumn: "Activity_Name",
			descriptionColumn: "Activity_Description",

			_filterStore: new Memory({data:{}}),
			_filterWidget: null,
			_filterValue: null,

			postCreate: function() {

				if (this.country) this._countryChanged(this.country);

				this._filterWidget = new FilteringSelect({
					store: this._filterStore,
					onChange: this._filterChanged
				}, this.filter_cb_el);
				this._filterWidget.on("change", this._filterChanged);
			},

			_countryChanged: function() {

				if (!this.store) return;

				this._filterValue = null;
				var countryRecords = this._queryStore();
				var uniqueValues = [];
				for (var i = 0; i < countryRecords.length; i++) {
					var val = countryRecords[i][this.filterColumn];
					if (uniqueValues.indexOf(val) < 0) {
						uniqueValues.push(val);
					}
				}
				uniqueValues.sort();
				uniqueValues.unshift("All");
				this._filterStore = new Memory({data: array.map(uniqueValues, function(v){return {'name': v};})});
				if (this._filterWidget) {
					this._filterWidget.set("store", this._filterStore);
					this._filterWidget.set("value", uniqueValues[0]);
				}

				this._updateProjectList();
			},

			_filterChanged: function(val) {
				console.debug("Filter changed");
			},

			_updateProjectList: function() {
				domConstruct.empty(this.list_el);
				var prList = this._queryStore();
				for (var i =0; i < prList.length; i++) {
					var pr = prList[i];
					// var prAtts = {
					// 	className: "projectListItem",
					// 	innerHTML: pr[this.nameColumn],
					// 	alt: pr[this.descriptionColumn]
					// };
					// var prEl = domConstruct.create("div", prAtts,this.list_el, "last");
					var prAtts = {
						className: "btn btn-default projectListItem",
						innerHTML: pr[this.nameColumn],
					};
					if (pr[this.descriptionColumn]) {
						prAtts.title = pr[this.descriptionColumn],
						prAtts.data_toggle = "tooltip"
					}
					var prEl = domConstruct.create("button", prAtts,this.list_el, "last");

				}
			},

			_queryStore: function() {
				var q = {};
				if (this.country) {
					q[this.countryColumn] = this.country;
				}
				if (this._filterValue) {
					q[this.filterColumn] = this._filterValue;
				}
				return this.store.queryFiltered(q);
			}
		

		});  // Return declare
	}); //define

