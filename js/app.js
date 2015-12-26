$(function(){
	'use strict';

	/* Marker object. Set attributes of each marker. */

	var Shooting = function(data){
		this.street = ko.observable(data.street);
		this.lat = ko.observable(data.lat);
		this.long = ko.observable(data.long);
		this.visible = typeof data.visible === 'boolean' ?
            ko.observable(data.visible) : ko.observable(true);
    	this.information = ko.observableArray([]);
		
		for (var i = 0; i < data.information.length; i++) {
      		this.information.push({
        		'race_ethnicity': ko.observable(data.information[i].race_ethnicity),
        		'status': ko.observable(data.information[i].status),
        		'age': ko.observable(data.information[i].age)
      		});
		}

		this.positionMarker = ko.computed(function(){
			return {
				'lat': this.lat(),
				'long': this.long()
			};
		}, this);

		this.graphic = ko.computed(function(){
			var graphic;
			var status = this.information()[0].status();
			graphic = 'img/' + status + .png;
			return {'anchor': new google.maps.Point(12,12),
					'url': graphic};
		}, this);

		this.mapPoint = ko.observable(new google.maps.Marker({
			position: this.positionMarker(),
			title: this.street(),
			graphic: this.graphic()
		}));

		this.searchable = ko.computed(function(){
			var searchable = this.street();
			for (var i = 0, i < this.information().length; i++){
				searchable += " " + this.information()[i].race_ethnicity();
			}
			for (var i = 0, i < this.information().length; i++){
				searchable += " " + this.information()[i].status();
			}
			return searchable.toUpperCase();
		}, this);

		this.victimCondition = ko.computed(function(){
			var condition = [];
			for (var i = 0; i < this.information().length; i++){
				condition.push(this.information()[i].status());
			}
			return condition;
		}, this);
	};

	var sortByStatus = function(data){
		this.status = ko.observable(data.status);
		this.display = ko.observable(data.display);
		this.imgSrc = ko.computed(function(){
			var imageSource;
			if(this.display()){
				imageSource = "img/" + this.status() + "_large.png";
			} else{
				imageSource = "img/" + this.status() + "_inactive.png";
			}
			return imageSource;

		})
	}

})