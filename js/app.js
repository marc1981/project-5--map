$(function(){
	'use strict';

	/* Marker object. Set attributes of each marker. */

	var Shooting = function(data){
		this.street = ko.observable(data.street);
		this.lat = ko.observable(data.lat);
		this.lng = ko.observable(data.lng);
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

		this.eventDate = ko.observable(new Date(data.date).toDateString());

		this.positionMarker = ko.computed(function(){
			return {
				'lat': this.lat(),
				'lng': this.lng()
			};
		}, this);

		this.graphic = ko.computed(function(){
			var graphic;
			var status = 'injury_death'; 
			if(this.information()){
				status = this.information()[0].status().toLowerCase();
			};
			graphic = 'img/' + status + '.png';
			return {'anchor': new google.maps.Point(12,12),
					'url': graphic};
		}, this);

		this.mapPoint = ko.observable(new google.maps.Marker({
			position: this.positionMarker(),
			title: this.street() + " - " + this.eventDate(),
			icon: this.graphic()
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

    incidentDataMain = incidentData.sort(function(a, b) {
      var aup = a.street.toUpperCase();
      var bup = b.street.toUpperCase();
      if (aup < bup) {
        return -1;
      }
      if (aup > bup) {
        return 1;
      }

      return 0;
    });

    for (var location in incidentDataMain) {
      self.locations.push(new Shooting(incidentData[location]));
      for (var i = 0; i < incidentData[location].information.length; i++) {
        var place = incidentData[location].information[i];
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
      //remoteDataHelper.reset();
      location.mapPoint().setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        location.mapPoint().setAnimation(null);
      }, 2000);
      self.selectedLocation(location);
      //remoteDataHelper.getRemoteData(location, self.datastatus());
    };

    self.toggleMenu = function(open) {
      $('#shoot-list-hideable').toggleClass('shoot-menu-offsmall', typeof open ==='undefined' ? open : !open);
      $('#shoot-list-menu-toggle .fa').toggleClass('fa-caret-down', typeof open ==='undefined' ? open : !open);
      $('#shoot-list-menu-toggle .fa').toggleClass('fa-caret-up', open);
    };

    self.toggleFilter = function(filter) {
      filter.display(!filter.display());
    };

    self.filterList = function() {
      var shoot;
      var visible;
      /* Convert the value in the search box to all upper case, trim white
         space and split into an array of terms. */
      var searchstring = self.textSearch().toUpperCase().trim();
      var searchterms = searchstring.split(/\s+/);
      var visibleStatusArray = [];
      var emptysearch = true;
      for (var filter in self.filters()) {
        if (self.filters()[filter].display()) {
          visibleStatusArray.push(self.filters()[filter].status());
        }
      }

    };

  ko.bindingHandlers.googlemap = {

    init: function(element, valueAccessor, allBindings,
                    viewModel, bindingContext) {
      var mapOptions = {
        zoom: 7,
        center: { lat: 31.00746, lng: -99.086765 },
        disableDefaultUI: true,
        scrollwheel: false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
      };
      var ctx = bindingContext.$data;

      ctx.map = new google.maps.Map(element, mapOptions);

      google.maps.event.addListenerOnce(ctx.map, 'tilesloaded', function(e) {
        console.log("adding event listener");
        var control = document.createElement('div');
        control.id = 'location-list-control';
        var list = $('#location-list').detach();
        ctx.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control);
        list.appendTo('#location-list-control');
        $('#shoot-list-menu-toggle').click(function() {
          ctx.toggleMenu();
        });
      });
    },

    update: function(element, valueAccessor, allBindings,
                      viewModel, bindingContext) {
      var value = valueAccessor;
      var ctx = bindingContext.$data;
      console.log("Update map");
      for (var i in value().selectedLocation()) {
        var location = value().selectedLocation()[i];
        if (location.visible.peek()) {
          location.mapPoint().setMap(ctx.map);
          addClickListener(location.mapPoint(), location, ctx);
        } else {
          location.mapPoint().setMap(null);
          console.log("Removing from map");
        }
      }

      function addClickListener(mapPoint, data, bindingContext) {
        google.maps.event.clearListeners(mapPoint, 'click');
        google.maps.event.addListener(mapPoint, 'click', function() {
          bindingContext.showMarker(data);
        });
      }
    }
  };

  ko.bindingHandlers.infowindow = {

    init: function(element, valueAccessor, allBindings,
                    viewModel, bindingContext) {
      var ctx = bindingContext.$data;
      ctx.infowindow = new google.maps.InfoWindow(
        { content: '<div id="info-window"></div>' });
    },


    update: function(element, valueAccessor, allBindings,
                      viewModel, bindingContext) {
      console.log("Update info window");
      var ctx = bindingContext.$data;
      var infowindow = ctx.infowindow;
      var location = valueAccessor().location();
      var messages = valueAccessor().messages();

      infowindow.close();
      if (location !== null) {
        infowindow.open(ctx.map, location.mapPoint());
        addDOMListener(infowindow);

        var gettingdata = valueAccessor().messages().gettingdata();
        var errors = valueAccessor().messages().errors();

      } else {
        console.log("Location is null");
      }

      function addDOMListener(infowindow) {
        google.maps.event.addListener(infowindow, 'domready', function() {
          var windowcontent = $('#selected-location-info').html();
          $('#info-window').html(windowcontent);
        });
      }
    }
  };
}

  function decodeHtmlEntity(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
    });
  }

  if (typeof google !== 'undefined') {
    ko.applyBindings(new viewModel());
  } else {
    console.log("Error loading Google Maps API");
    $('.map-canvas').hide();
    $('body').prepend('<div class="error-dialog"><p class="error-message">' +
                      'There was an error loading Google Maps.</p></div>');
  }
});