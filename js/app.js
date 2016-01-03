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
	    		'carried_weapon': ko.observable(data.information[i].carried_weapon),
	    		'armedIcon': ko.observable('img/' + data.information[i].carried_weapon + '.png')
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
	    	title: "Location: " + this.street() + " --- Date: " + this.eventDate(),
	    	icon: this.icon() 
	    }));

	    this.searchString = ko.computed(function(){
	    	var stringStreet = this.street().toString();
	    	var searchString = stringStreet;
	    	for (var i = 0; i < this.information().length; i++) {
        		searchString += " " + this.information()[i].status() + " " + this.information()[i].race_ethnicity() + " " + this.information()[i].carried_weapon();
      		}
	    	return searchString.toUpperCase(); 
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

	var remoteDataHelper = {
		gettingCensusData: false,

		isGettingData: function(){
			return this.gettingCensusData;
		},

		getRemoteData: function(event, datastatus){
			console.log("Getting census data.");
			datastatus.gettingdata(this.isGettingData());
			datastatus.errors([]);
			
				this.getCensusData(event, datastatus);
			
		},

		getCensusData: function(event, datastatus){
			var self = this;
			if(!self.gettingCensusData){
				self.gettingCensusData = true;
				datastatus.gettingdata(self.isGettingData());
				$.ajax({
					dataType: 'json',
					url: buildCensusURL(event.census_code()),
					success: function(data, status, xhr){
						console.log("Retrieved Census Data.");
						console.log(data);
            			console.log(status);
            			console.log(xhr);
            			
            			var totalPop = data[1][0];
            			var whitePop = data[1][1];
            			var blackPop = data[1][2];
            			var latinoPop = data[1][3];

            			var minPercent = ((totalPop - whitePop)/totalPop) * 100;
            			var minPerFormat = minPercent.toFixed(2) + '%';
            			
            			function formatNumber (num) {
    						return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
						}

						totalPopFormatted = formatNumber(totalPop);
						whitePopFormatted = formatNumber(whitePop);
						blackPopFormatted = formatNumber(blackPop);
						latinoPopFormatted = formatNumber(latinoPop);
                		
                		event.censusData.push({
                			'totalPop': totalPopFormatted, 
                			'whitePop': whitePopFormatted,
                			'blackPop': blackPopFormatted,
                			'latinoPop': latinoPopFormatted,
                			'minPercent': minPerFormat
                		});

						self.gettingCensusData = false;
			            datastatus.gettingdata(self.isGettingData());
			          },
			          error: function(jqhxr, status, error) {
			            console.log("Error getting census data.");
			            self.gettingCensusData = false;
			            datastatus.errors.push("Error getting census data.");
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

	    incidentDataMain = incidentData;

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
	    if (incident.searchString().indexOf(searchterms[j]) >= 0) {
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
		    zoom: 6,
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
		    
		    var panel = document.createElement('div');
		    panel.id = 'panel-list-control';
		    var panelist = $('#panel-list').detach();
		    ctx.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(panel);
			panelist.appendTo('#panel-list-control');

		    var control = document.createElement('div');
		    control.id = 'incident-list-control';
		    var list = $('#incident-list').detach();
		    ctx.map.controls[google.maps.ControlPosition.TOP_LEFT].push(control);
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


	function buildCensusURL(census_code){
    	var templateURL = 'http://api.census.gov/data/2012/acs5?get=B01003_001E,B03002_003E,B03002_004E,B03002_012E,NAME&for=county:{CODE}&in=state:48&key=06682d6716f20fd04b7df6fafdaa0a623f5e6817';
    	var updateTemplate = templateURL.replace('{CODE}', census_code);
    	return updateTemplate;
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