$(function(){

	var Incident = function(data){
		this.street = ko.observable(data.street);
		this.lat = ko.observable(data.lat);
		this.lng = ko.observable(data.lng);
		this.eventDate = ko.observable(new Date(data.date).toDateString());
		this.census_code = ko.observable(data.census_code);
		this.file_location = ko.observable(data.file_location);

	    //space for visible
        this.visible = typeof data.visible === 'boolean' ?
                ko.observable(data.visible) : ko.observable(true);
	    this.information = ko.observableArray([]);

	    for(var i = 0; i < data.information.length; i++){
	    	this.information.push({
	    		'race_ethnicity': ko.observable(data.information[i].race_ethnicity),
	    		'age': ko.observable(data.information[i].age),
	    		'status': ko.observable(data.information[i].status),
	    		'carried_weapon': ko.observable(data.information[i].carried_weapon)
	    	});
	    }
	
	    this.censusData = ko.observableArray([]);
	    this.censusData.extend({rateLimit: 50});

	    this.mapPoint = ko.computed(function(){
	    	return{
	    		'lat': this.lat(),
	    		'lng': this.lng()
	    	};
	    }, this);

	    this.icon = ko.computed(function(){
	    	var icon;
	    	var iconName = this.information()[0].status();
	    	icon = 'img/' + iconName + '.png';
	    	return{
	    		'anchor': new google.maps.Point(12,12),
	    		'url': icon
	    	};
	    }, this);

	    this.marker = ko.observable(new google.maps.Marker({
	    	position: this.mapPoint(),
	    	title: "Location: " + this.street() + " - Date: " + this.eventDate(),
	    	icon: this.icon() 
	    }));

	    this.searchTerms = ko.computed(function(){
	    	var searchterms = this.street + " " + this.information()[0].race_ethnicity() + " " + this.information()[0].status();
	    	return searchterms; 
	    }, this);

	    this.isIncident = ko.computed(function() {
      		var statuses = [];
      		for (var i = 0; i < this.information().length; i++) {
        		statuses.push(this.information()[i].status());
      		}
      		return statuses;
    	}, this);

	};
	//End of Incident

	var Sort = function(data) {
		this.status = ko.observable(data.status);
		this.display = ko.observable(data.display);
		this.imgSrc = ko.computed(function(){
			var filename;
			if (this.display()) {
				filename = "img/" + this.status() + "-large.png"
			} else {
				filename = "img/" + this.status() + "-nonselect.png"
			}
			return filename;
		}, this);
		this.hover = ko.computed(function(){
			var hoverstring = this.display() ? 'Click to hide all ' : 'Click to display all ';
			if(this.status() == 'injury'){
				hoverstring += 'injuries.';
			}else{
				hoverstring += 'deaths.';
			}
			return hoverstring;
		}, this);
	};
/*  var SortbyArmed = function(data) {
    this.carried_weapon = ko.observable(data.carried_weapon);
    this.display = ko.observable(data.display);
    this.imgSrcArmed = ko.computed(function(){
      var filename;
      if (this.display()) {
        filename = "img/" + this.carried_weapon() + ".png"
      } else {
        filename = "img/" + this.carried_weapon() + "-deselect.png"
      }
      return filename;
    }, this);
    this.hover = ko.computed(function(){
      var hoverstring = this.display() ? 'Click to hide all ' : 'Click to display all ';
      if(this.carried_weapon() == 'armed'){
        hoverstring += 'injuried/dead who were carrying a weapon.';
      }else{
        hoverstring += 'injuried/dead who were unarmed.';
      }
      return hoverstring;
    }, this);
  };
*/
	var remoteDataHelper = {
		gettingCensusData: false,

		isGettingData: function(){
			return this.gettingCensusData;
		},

		getRemoteData: function(event, datastatus){
			console.log("Getting census data.");
			datastatus.gettingdata(this.isGettingData());
			datastatus.errors([]);
			if(event.censusData().length === 0){
				this.getCensusData(event, datastatus);
			}
		},

		getCensusData: function(event, datastatus){
			var self = this;
			if(!self.gettingCensusData){
				self.gettingCensusData = true;
				datastatus.gettingdata(self.isGettingData());
				$.ajax({
					dataType: 'json',
					url: buildCensusURL(event.census_code()),
					success: function(data){
						var demos;
						if (data.getstatus === 'OK' && event.censusData.length === 0){
							demos = data.response.demos;
							for (var demo in demos){
								event.censusData.push({
									'url': 'http://www.google.com',
									'headline': 'GOOGLE!'
								});
							}
							console.log("GOT SOME STUFF!");
						} else {
							console.log("BUMMER!");
							datastatus.errors.push("ERROR!!! Oh no.");
						}
						self.gettingCensusData = false;
						datastatus.gettingdata(self.isGettingData());
					},
					error: function(jqhxr, getstatus, error){
						console.log("Bummer!!!");
						self.gettingCensusData = false;
						datastatus.errors.push("Bummer!!!");
						datastatus.gettingdata(self.isGettingData());
					}
				});
			}
		},
		reset: function(){
			this.gettingCensusData = false;
		}
	};

	var viewModel = function(){
		var self = this;
		var status;
		var incidentDataMain;
		var statuses = [];

		self.map = null;

		self.infowindow = null;

		self.datastatus = ko.observable({
			gettingdata: ko.observable(true),
			errors: ko.observableArray([])
		});

		self.searchtext = ko.observable("");
		self.searchtext.extend({
			rateLimit: {
				timeout: 400,
				method: "notifyWhenChangesStop"
			}
		});
		self.clearSearchText = function(){
			this.searchtext("");
		};

		self.filters = ko.observableArray([]);
		self.emptysearch = ko.observable(false);
		self.incidents = ko.observableArray([]);
		self.incidents.extend({
			rateLimit: {
				timeout: 20,
				method: "notifyWhenChangesStop"
			}
		});
/*
		incidentDataMain = incidentData.sort(function(a,b){

		})
*/
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

		for (var incident in incidentDataMain) {
		  self.incidents.push(new Incident(incidentData[incident]));
		  for (var i = 0; i < incidentData[incident].information.length; i++) {
		    var place = incidentData[incident].information[i];
		    if (statuses.indexOf(place.status) < 0) {
		      statuses.push(place.status);
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

		self.showMarker = function(incident) {
			self.toggleMenu(false);
			remoteDataHelper.reset();
			incident.marker().setAnimation(google.maps.Animation.BOUNCE);
			window.setTimeout(function() {
					incident.marker().setAnimation(null);
				}, 2000);
			self.selectedLocation(incident);
			remoteDataHelper.getRemoteData(incident, self.datastatus());
		};

	    self.toggleMenu = function(open) {
	      $('#event-list-hideable').toggleClass('event-menu-offsmall', typeof open ==='undefined' ? open : !open);
	      $('#event-list-menu-toggle .fa').toggleClass('fa-caret-down', typeof open ==='undefined' ? open : !open);
	      $('#event-list-menu-toggle .fa').toggleClass('fa-caret-up', open);
	    };
	
	    self.toggleFilter = function(filter) {
	      filter.display(!filter.display());
	    };

	    self.filterList = function() {
	      var event;
	      var visible;
	      /* Convert the value in the search box to all upper case, trim white
	         space and split into an array of terms. */
	      var searchstring = self.searchtext().toUpperCase().trim();
	      var searchterms = searchstring.split(/\s+/);
	      var visibleEvents = [];
	      var emptysearch = true;
	      for (var filter in self.filters()) {
	        if (self.filters()[filter].display()) {
	          visibleEvents.push(self.filters()[filter].status());
	        }
	      }

	      if (self.selectedLocation() !== null &&
	          !incidentClearsFilters(self.selectedLocation(), searchterms, visibleEvents)) {
	        self.selectedLocation(null);
	        console.log("Setting location to null");
	      }

	      for (var i = 0; i < self.incidents().length; i++) {
	        event = self.incidents()[i];
	        visible = incidentClearsFilters(event, searchterms, visibleEvents);
	        event.visible(visible);
	        if (emptysearch && visible) {
	          emptysearch = false;
	        }
	      }

	      self.incidents.valueHasMutated();
	      self.emptysearch(emptysearch);
	      setLastChildToClass(".event-list-ul", "event-list-last");
	    }; 
	
	    self.searchtext.subscribe(self.filterList);
	    for (var j = 0; j < statuses.length; j++) {
	      status = new Sort({ 'status': statuses[j], 'display': true });
	      status.display.subscribe(self.filterList);
	      self.filters.push(status);
	    }
	};

	var incidentClearsFilters = function(incident, searchterms, visibleEvents) {
	var visible = false;
	if (isIncidentDisplayed(incident, visibleEvents)) {
	  for (var j = 0; j < searchterms.length; j++) {
	    if (incident.searchTerms().indexOf(searchterms[j]) >= 0) {
	      visible = true;
	      break;
	    }
	  }
	}
	return visible;
	};

	var isIncidentDisplayed = function(incident, filterincidents) {
	    var displayed = false;
	    var isincident = incident.isIncident();
	    for (var status in isincident) {
	      if (filterincidents.indexOf(isincident[status]) >= 0) {
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
		    control.id = 'incident-list-control';
		    var list = $('#incident-list').detach();
		    ctx.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control);
		    list.appendTo('#incident-list-control');
		    $('#event-list-menu-toggle').click(function() {
		      ctx.toggleMenu();
		    });
		  });
		},

		update: function(element, valueAccessor, allBindings,
		                  viewModel, bindingContext) {
		  var value = valueAccessor;
		  var ctx = bindingContext.$data;
		  console.log("Update map");
		  for (var i in value().incidents()) {
		    var incident = value().incidents()[i];
		    if (incident.visible.peek()) {
		      incident.marker().setMap(ctx.map);
		      addClickListener(incident.marker(), incident, ctx);
		    } else {
		      incident.marker().setMap(null);
		      console.log("Removing from map");
		    }
		  }

		  function addClickListener(marker, data, bindingContext) {
		    google.maps.event.clearListeners(marker, 'click');
		    google.maps.event.addListener(marker, 'click', function() {
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
		  var incident = valueAccessor().incident();
		  var messages = valueAccessor().messages();

		  infowindow.close();
		  if (incident !== null) {
		    infowindow.open(ctx.map, incident.marker());
		    addDOMListener(infowindow);

		    var gettingdata = valueAccessor().messages().gettingdata();
		    var errors = valueAccessor().messages().errors();
		    var censusData = valueAccessor().incident().censusData();

		  } else {
		    console.log("Location is null");
		  }

		  function addDOMListener(infowindow) {
		    google.maps.event.addListener(infowindow, 'domready', function() {
		      var windowcontent = $('#selected-incident-info').html();
		      $('#info-window').html(windowcontent);
		    });
		  }
		}
	};

	function buildCensusURL(name) {
		var census_code = this.census_code;
		var urlCensus = 'http://api.census.gov/data/2012/acs5?get=B06012_002E,NAME&for=county:439&in=state:48&key=06682d6716f20fd04b7df6fafdaa0a623f5e6817';
		var formattedCensusURL = urlCensus.replace('{county_code}', census_code);
		return urlCensus;
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