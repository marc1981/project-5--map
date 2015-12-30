var initialCats = [
  {
      clickCount: 0,
      name: 'Trigger Toucher',
      imgSrc: 'img/small_target.jpg',
      imgAttr: 'somewhere',
      nicknames: ["leverage for death"]
  },
  {
      clickCount: 0,
      name: 'Trigger Blaster',
      imgSrc: 'img/target.png',
      imgAttr: 'somewhere',
      nicknames: ["trigger"]
  },
  {
      clickCount: 0,
      name: 'Trigger Bitch',
      imgSrc: 'img/target.png',
      imgAttr: 'somewhere',
      nicknames: ["bang-bang-dead"]
  },
  {
      clickCount: 0,
      name: 'Trigger Fuck Off',
      imgSrc: 'img/redtarget.jpg',
      imgAttr: 'somewhere',
      nicknames: ["killswitch"]
  },
  {
      clickCount: 0,
      name: 'Trigger Dick',
      imgSrc: 'img/small_target.jpg',
      imgAttr: 'somewhere',
      nicknames: ["death-maker 5000"]
  }
]


var Cat = function(data){
  this.clickCount = ko.observable(data.clickCount);
  this.name = ko.observable(data.name);
  this.imgSrc = ko.observable(data.imgSrc);
  this.imgAttr = ko.observable(data.imgAttr);
  this.nicknames = ko.observable(data.nicknames);

  this.title = ko.computed(function(){
    var title;
    var clicks = this.clickCount();
    if (clicks < 10){
      title = 'Ready';
    } else if (clicks < 25){
      title = 'Aim';
    } else {
      title = 'Fire';
    }
    return title;
  }, this);
}

var viewModel = function() {
  var self = this;

  this.catList = ko.observableArray([]);

  initialCats.forEach(function(catItem){
    self.catList.push( new Cat(catItem));
  });

  this.currentCat = ko.observable( this.catList()[0] );

  this.incrementCounter = function(){
    self.currentCat().clickCount(self.currentCat().clickCount() + 1);
  };

  this.setCat = function(clickedCat){
    console.log("hello");
    self.currentCat(clickedCat);
  };

};

ko.applyBindings(new viewModel());