define([
	"dojo/_base/declare",
	"dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/query",
	"dojo/Stateful",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dojo/NodeList-dom",      // no mapping required
    "dojo/NodeList-traverse"  // no mapping required
	], function(declare, lang, dom, domConstruct, domAttr, domClass, query, Stateful, _WidgetBase, _TemplatedMixin){

		return declare("MultiselectFilterView", [_WidgetBase, _TemplatedMixin], {

			templateString: '<div>'+
							'<div class="filterHead">'+
								'<span>${label}</span>'+
								'<a class="filter-select-all" data-dojo-attach-event="onclick: _toggleAllClickHandler">Unselect All</a>' +
							'</div>'+
							'<div data-dojo-attach-point="ul_el" class="filterBox list-group small">' +
							'</div>' +
							'</div>',

			data: [],
			label: "",
			selectedValues: [],

			postCreate: function() {

				for (var i = 0; i < this.data.length; i++) {
		            var uv = this.data[i]

		            var liElAtts = {
		            	className:"list-group-item selected", 
		            	innerHTML: uv,
		            	onclick: lang.hitch(this, this.filterClickHandler)
		            }
		            var liEl = domConstruct.create("a", liElAtts, this.ul_el, "last");

		            var liIconAtts = {
		            	className: "glyphicon glyphicon-ok filterItemIcon selected"
		            }
		            var iconEl = domConstruct.create("span", liIconAtts, liEl, "first");
		    	}

		    	this.selectedValues = this.data;
			},

			filterClickHandler: function(event) {
				console.debug("Clicked");
				if (domClass.contains(event.currentTarget, "selected")) {
					domClass.remove(event.currentTarget, "selected");
					domClass.remove(event.currentTarget.children[0], "selected");
				} else {
					domClass.add(event.currentTarget, "selected");
					domClass.add(event.currentTarget.children[0], "selected");
				}
				var vl = [];
				query(".list-group-item.selected", this.ul_el).forEach(function(node) {
					vl.push(node.text);
				});
				this.set('selectedValues', vl);
			},

			_toggleAllClickHandler: function(event) {
				vl = [];
				if (event.currentTarget.text == "Unselect All") {
					event.currentTarget.innerHTML = "Select All";
					query(".list-group-item, .filterItemIcon", this.ul_el).removeClass("selected");
				} else {
					event.currentTarget.innerHTML = "Unselect All";
					query(".list-group-item", this.ul_el).forEach(function(node) {
						vl.push(node.text);
					});
					query(".list-group-item, .filterItemIcon", this.ul_el).addClass("selected");
				}
				this.set('selectedValues', vl);
			}
		});
	});