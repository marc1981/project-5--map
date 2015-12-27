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
			graphic = 'img/' + status + '.png';
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
			for (var i = 0; i < this.information().length; i++){
				searchable += " " + this.information()[i].race_ethnicity();
			}
			for (var i = 0; i < this.information().length; i++){
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
		}, this);
		this.reveal = ko.computed(function(){
			var revealStatus = this.display() ? "Mask " : "Reveal ";
			revealStatus += "Incident resulted in " + this.status() + ".";
			return revealStatus;
		}, this);
	};

	var viewModel = function(){
		var self = this;
		var status;
		var incidentDataMain;
		var statusArray = [];
		self.map = null;
		self.infowindow= null;
	    self.datastatus = ko.observable({
	      fetchingData: ko.observable(true),
	      errors: ko.observableArray([])
	    });

	    self.textSearch = ko.observable("");

	    self.textSearch.extend({
	      rateLimit: {
	        timeout: 400,
	        method: "notifyWhenChangesStop"
	      }
	    });

	    self.clearTextSearch = function() {
	      this.textSearch('');
	    };
    
    self.filters = ko.observableArray([]);

    self.emptysearch = ko.observable(false);

    self.locations = ko.observableArray([]);
    self.locations.extend({
      rateLimit: {
        timeout: 20,
        method: "notifyWhenChangesStop"
      }
    });

    /* Alphabetize the stadium list */
    incidentDataMain = incidentData.sort(function(a, b) {
      /* Upper case so sort is case insensitive. */
      var aup = a.street.toUpperCase();
      var bup = b.street.toUpperCase();
      if (aup < bup) {
        return -1;
      }
      if (aup > bup) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });

    for (var location in incidentDataMain) {
      self.locations.push(new Location(incidentData[location]));
      for (var i = 0; i < incidentData[location].status.length; i++) {
        var place = incidentData[location].status[i];
        if (statusArray.indexOf(place.status) < 0) {
          statusArray.push(place.status);
        }
      }
    }

    self.selectedLocation = ko.observable(null);
    self.selectedLocation.extend({
      rateLimit: {
        timeout: 10,
        method: "notifyWhenChangesStop"
      }
    });

    self.showMarker = function(location) {
      self.toggleMenu(false);
      remoteDataHelper.reset();
      location.marker().setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        location.marker().setAnimation(null);
      }, 2000);
      self.selectedStadium(stadium);
      remoteDataHelper.getRemoteData(location, self.datastatus());
    };

    self.toggleMenu = function(open) {
      $('#shoot-list-hideable').toggleClass('shoot-menu-offsmall', typeof open ==='undefined' ? open : !open);
      $('#shoot-list-menu-toggle .fa').toggleClass('fa-caret-down', typeof open ==='undefined' ? open : !open);
      $('#shoot-list-menu-toggle .fa').toggleClass('fa-caret-up', open);
    };

    self.toggleFilter = function(filter) {
      filter.display(!filter.display());
    };

	}

})