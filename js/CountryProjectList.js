define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on",
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
	], function(declare, lang, array, on, dom, domConstruct, domAttr, domClass, query, Stateful,
				_WidgetBase, _TemplatedMixin, Memory, FilteringSelect){

		return declare("CountryProjectList", [_WidgetBase, _TemplatedMixin], {

			templateString: '<div>'+
							'<label class="prType_input">Project Type:' +
							'<input data-dojo-attach-point="filter_cb_el"></input>' +
							'</label>' +
							'<div class="prType_cntLabel">There are '+
							'<span data-dojo-attach-point="cnt_total">0</span> projects in the country, '+
							'<span data-dojo-attach-point="cnt_filter">0</span> for selected GDL Teams, '+
							'<span data-dojo-attach-point="cnt_type">0</span> for selected Project Type</div>'+
							'<hr>' +
							'<div data-dojo-attach-point="list_el" class="projectListContainer"></div>' +
							'<div data-dojo-attach-point="details_container_el" class="detailsContainer">' +
								'<ul class="nav nav-pills">' +
  							    	'<li><a data-dojo-attach-point="pr_details_back" href="#">Back to List</a></li>' +
  							    	//'<li><a data-dojo-attach-point="pr_details_prev" href="#">Previous</a></li>' +
  							    	//'<li><a data-dojo-attach-point="pr_details_next" href="#">Next</a></li>' +
								'</ul>' +
								'<div data-dojo-attach-point="pr_details_title" class="prDetails title"></div>' +
								'<hr>' +
								'<div data-dojo-attach-point="pr_details"></div>'+
							'</div>' +
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

			detailsColumns: [{
				column: "Activity_Type",
				label:  "Activity Type"
			},{
				column: "Activity_Description",
				label:  "Activity Decritpion"
			},{
				column: "GDL_Team",
				label:  "GDL Team"
			},{
				column: "Country",
				label:  "Country"				
			},{
				column: "Crosscutting_Sector",
				label:  "Sector"

			}],

			_filterStore: new Memory({data:{}}),
			_filterWidget: null,
			_filterValue: null,

			postCreate: function() {

				if (this.country) this._countryChanged(this.country);

				on(this.pr_details_back, "click", lang.hitch(this, function(e) {
					this.details_container_el.style.display = "none";
				}));

				this._filterWidget = new FilteringSelect({
					store: this._filterStore,
					onChange: lang.hitch(this, this._filterChanged)
				}, this.filter_cb_el);
				this._filterWidget.startup();
			},

			_countryChanged: function() {

				if (!this.store) return;

				this.details_container_el.style.display = "none";

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
				this._filterStore = new Memory({data: array.map(uniqueValues, function(v){return {'name': v, 'id': v};})});
				if (this._filterWidget) {
					this._filterWidget.set("store", this._filterStore);
					this._filterWidget.set("value", uniqueValues[0]);
					this._filterWidget.set("displayedValue", uniqueValues[0]);
				}

				this._updateProjectList();
			},

			_filterChanged: function(val) {
				console.debug("Filter changed");
				this._filterValue = val;
				this._updateProjectList();
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
						onclick: lang.hitch(this, this._showProjectDetails),
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
				this.cnt_total.innerHTML = this.store.query(q).length;
				this.cnt_filter.innerHTML = this.store.queryFiltered(q).length;
				if (this._filterValue && this._filterValue != "All") {
					q[this.filterColumn] = this._filterValue;
				}
				this.cnt_type.innerHTML = this.store.queryFiltered(q).length;
				return this.store.queryFiltered(q);
			},

			_showProjectDetails: function(event) {
				console.debug("Showing project details");
				var prName = event.target.textContent;
				var q = {}
				q[this.nameColumn] = prName;
				q[this.countryColumn] = this.country;
				var prData = this.store.queryFiltered(q)[0];
				this.pr_details_title.innerHTML = prData[this.nameColumn];

				domConstruct.empty(this.pr_details);

				for (var i = 0; i < this.detailsColumns.length; i++) {
					var column = this.detailsColumns[i].column;
					var label = this.detailsColumns[i].label;
					var value = prData[column];

					var labelElAtts = {
						className: "prDetails label",
						innerHTML: label
					}
					var labelEl = domConstruct.create("div", labelElAtts, this.pr_details, "last");

					var valueElAtts = {
						className: "prDetails value",
						innerHTML: value
					}
					var valueEl = domConstruct.create("div", valueElAtts, this.pr_details, "last");
					domConstruct.create("div", {style: "clear: both; width: 100%; height: 1px"}, this.pr_details, "last");
				}

				this.details_container_el.style.display = "block";
			}

		});  // Return declare
	}); //define

