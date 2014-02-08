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
    "dojo/NodeList-traverse"  // no mapping required
	], function(declare, lang, dom, domConstruct, domAttr, domClass, query, Stateful, _WidgetBase, _TemplatedMixin){

		return declare("MultiselectFilterView", [_WidgetBase, _TemplatedMixin], {

			templateString: '<div>'+
							'<span>${label}</span>' +
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
		            	className:"list-group-item  list-group-item-success", 
		            	innerHTML: uv,
		            	onclick: lang.hitch(this, this.filterClickHandler)
		            }
		            var liEl = domConstruct.create("a", liElAtts, this.ul_el, "last");
		            var iconEl = domConstruct.create("i", {className:"fa fa-check-square fa-fw"}, liEl, "first");
		    	}

		    	this.selectedValues = this.data;
			},

			filterClickHandler: function(event) {
				console.debug("Clicked");
				if (domClass.contains(event.target, "list-group-item-success")) {
					domClass.remove(event.target, "list-group-item-success");
					domClass.remove(event.target.children[0], "fa-check-square");
					domClass.add(event.target.children[0], "fa-square");
				} else {
					domClass.add(event.target, "list-group-item-success");
					domClass.remove(event.target.children[0], "fa-square");
					domClass.add(event.target.children[0], "fa-check-square");
				}
				var vl = [];
				query(".list-group-item-success", this.ul_el).forEach(function(node) {
					vl.push(node.text);
				});
				this.set('selectedValues', vl);
			}

		});
	});