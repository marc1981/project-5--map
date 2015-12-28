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
  	
  var remoteDataHelper = {
    gettingCensusData: false,

    isGettingData: function() {
      return this.gettingCensusData;
    },

    getRemoteData: function(shoot, datastatus) {
      console.log("Get remote data");
      datastatus.gettingdata(this.isGettingData());
      datastatus.errors([]);
      if (shoot.articles().length === 0) {
        this.getCensusData(shoot, datastatus);
      }
    },
	
	getCensusData: function(shoot, datastatus) {
      var self = this;
      if (!self.gettingCensusData) {
        self.gettingCensusData = true;
        datastatus.gettingdata(self.isGettingData());
        $.ajax({
          dataType: "json",
          url: buildCenusURL(shoot.census_code()),
          success: function(data) {
            var docs;
            if (data.status === 'OK' && shoot.articles.length === 0) {
              docs = data.response.docs;
              for (var doc in docs) {
                stad.articles.push({
                  'url': docs[doc].web_url,
                  'headline': decodeHtmlEntity(docs[doc].headline.main)
                });
              }
              console.log("Message");
            } else {
              console.log("Error getting data");
              datastatus.errors.push("Error getting data");
            }
            self.gettingCensusData = false;
            datastatus.gettingdata(self.isGettingData());
          },
          error: function(jqhxr, status, error) {
            console.log("Error getting NY Times articles");
            self.gettingCensusData = false;
            datastatus.errors.push("Error getting data");
            datastatus.gettingdata(self.isGettingData());
          }
        });
      }
    },
    reset: function() {
      this.gettingCensusData = false;
    }
  }; // Remote data helper

	var viewModel = function(){
		var self = this;
		var status;
		var incidentDataMain;
		var statusArray = [];
		self.map = null;
		self.infowindow= null;
	    self.datastatus = ko.observable({
	      gettingData: ko.observable(true),
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
      remoteDataHelper.reset();
      location.mapPoint().setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        location.mapPoint().setAnimation(null);
      }, 2000);
      self.selectedLocation(location);
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
      /*
         Close the infowindow on the selected stadium if it doesn't pass the
         filters, otherwise, it will open back up again if you revert to no
         filters. You have to do this now because you can't close an
         infowindow attached to a marker that's not attached to the map.
      */
      if (self.selectedLocation() !== null &&
          !locationClearsFilters(self.selectedLocation(), searchterms, visiblelocations)) {
        self.selectedLocation(null);
        console.log("Setting location to null");
      }

      for (var i = 0; i < self.locations().length; i++) {
        shoot = self.locations()[i];
        visible = locationClearsFilters(shoot, searchterms, visiblelocations);
        shoot.visible(visible);
        if (emptysearch && visible) {
          emptysearch = false;
        }
      }

      self.locations.valueHasMutated();
      self.emptysearch(emptysearch);
      setLastChildToClass(".shoot-list-ul", "shoot-list-last");
    };

    self.textSearch.subscribe(self.filterList);
    for (var j = 0; j < statusArray.length; j++) {
      status = new sortByStatus({ 'status': statusArray[j], 'display': true });
      status.display.subscribe(self.filterList);
      self.filters.push(status);
    }
  }; // ViewModel


  var locationClearsFilters = function(location, searchterms, visiblelocations) {
    var visible = false;
    if (isLocationDisplayed(location, visiblelocations)) {
      for (var j = 0; j < searchterms.length; j++) {
        if (location.searchString().indexOf(searchterms[j]) >= 0) {
          visible = true;
          break;
        }
      }
    }
    return visible;
  };

  var isLocationDisplayed = function(location, filterlocation) {
    var displayed = false;
    var victimcond = location.victimCondition();
    for (var status in victimcond) {
      if (filterlocation.indexOf(victimcond[status]) >= 0) {
        displayed = true;
        break;
      }
    }
    return displayed;
  };


  var setLastChildToClass = function(element, classtoapply) {
    $("." + classtoapply).removeClass(classtoapply);
    $(element).children().filter(':visible:last').addClass(classtoapply);
  };


  ko.bindingHandlers.googlemap = {

    init: function(element, valueAccessor, allBindings,
                    viewModel, bindingContext) {
      var mapOptions = {
        zoom: 7,
        center: { lat: 31.00746, lng: -99.086765 },
        disableDefaultUI: true,
        cursor: 'url(img/t2.png)',
        draggableCursor: 'url(img/t2.png), crosshair',
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

  function buildCenusURL(name) {
  	var census_code = Shooting.census_code();
  	var urlCensus = 'http://api.census.gov/data/2012/acs5?get=B06012_002E,NAME&for=county:{county_code}&in=state:48&key=06682d6716f20fd04b7df6fafdaa0a623f5e6817';
  	var formattedCensusURL = urlCensus.replace('{county_code}', census_code);
    return formattedCensusURL;
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