define([
	"dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
	"dojo/Stateful",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin"
	], function(declare, dom, domConstruct, domAttr, domClass, Stateful, _WidgetBase, _TemplatedMixin){

		return declare("MultiselectFilterView", [_WidgetBase, _TemplatedMixin], {

			templateString: '<div>'+
							'<span>${label}</span>' +
							'<div data-dojo-attach-point="ul_el" class="filterBox list-group small">' +
							'</div>' +
							'</div>',
			templateString2: '<div>'+
							'<span>${label}</span>' +
							'<div  style="width:100pt" data-dojo-attach-point="ul_el" class="btn-group">' +
							'</ul>' +
							'</div>',
			data: [],
			label: "",

			postCreate: function() {

				
				for (var i = 0; i < this.data.length; i++) {
		            var uv = this.data[i]

		            var liElAtts = {
		            	className:"list-group-item  list-group-item-success", 
		            	innerHTML: uv,
		            	onclick: this.filterClickHandler
		            }
		            var liEl = domConstruct.create("a", liElAtts, this.ul_el, "last");
		            var iconEl = domConstruct.create("i", {className:"fa fa-check-square fa-fw"}, liEl, "first");

		            // var liElAtts = {
		            // 	className:"btn btn-primary btn-block", 
		            // 	innerHTML: uv,
		            // 	onclick: this.filterClickHandler
		            // }
		            // var liEl = domConstruct.create("a", liElAtts, this.ul_el, "last");
		            // var iconEl = domConstruct.create("i", {className:"fa fa-check-square"}, liEl, "first");


		      }
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
			}

		})
	})