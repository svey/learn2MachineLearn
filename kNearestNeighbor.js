var Node = function (obj) {  
  for (var key in obj) {
    this[key] = obj[key];
  }
};

var NodeList = function (k) {
  this.nodes = [];
  this.k = k;
};

NodeList.prototype.add = function (node) {
  this.nodes.push(node);
};

NodeList.prototype.calculateRanges = function () {  
    this.areas = { min: Infinity, max: -1 * Infinity };
    this.rooms = { min: Infinity, max: -1 * Infinity };
    
    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].rooms < this.rooms.min) {
            this.rooms.min = this.nodes[i].rooms;
        }
        if (this.nodes[i].rooms > this.rooms.max) {
            this.rooms.max = this.nodes[i].rooms;
        }
        if (this.nodes[i].area < this.areas.min) {
            this.areas.min = this.nodes[i].area;
        }
        if (this.nodes[i].area > this.areas.max) {
            this.areas.max = this.nodes[i].area;
        }
    }
};

NodeList.prototype.determineUnknown = function () {
  this.calculateRanges();
  
  //loop through our nodes and look for unknown types.
  for (var i = 0; i < this.nodes.length; i++) {
    //if the node is an unknown type, clone the nodes list to neighbs and then measure distances.
    if (!this.nodes[i].type) {
      this.nodes[i].neighbors = [];
      for (var j = 0; j < this.nodes.length; j++) {
        //if we don't know a neighbs type don't include it
        if (this.nodes[j].type) {
          this.nodes[i].neighbors.push(new Node(this.nodes[j]));
        }
      }
      //measure distances
      this.nodes[i].measureDistances(this.areas, this.rooms);

      //sort by distance
      this.nodes[i].sortByDistance();

      //guess type
      console.log(this.nodes[i].guessType(this.k));
    }
  }
};

Node.prototype.measureDistances = function (areaRangeObj, roomsRangeObj) {  
  var roomsRange = roomsRangeObj.max - roomsRangeObj.min;
  var areaRange = areaRangeObj.max - areaRangeObj.min;

  for (var i = 0; i < this.neighbors.length; i++) {
    var neighbor = this.neighbors[i];

    var deltaRooms = neighbor.rooms - this.rooms;
    deltaRooms /= roomsRange;

    var deltaArea = neighbor.area - this.area;
    deltaArea /= areaRange;

    neighbor.distance = Math.sqrt((deltaRooms * deltaRooms) + (deltaArea * deltaArea));
  }
};

Node.prototype.sortByDistance = function () {  
  this.neighbors.sort((a, b) => a.distance - b.distance);
};

Node.prototype.guessType = function (k) {  
  var types = {};
  var kthNeighbors = this.neighbors.slice(0, k);
  for (var i = 0; i < kthNeighbors.length; i++) {
    var neighbor = this.neighbors[i];
    
    if (!types[neighbor.type]) {
      types[neighbor.type] = 0;
    }
    types[neighbor.type] += 1;
  }

  var guess = { type: false, count: 0 };
  for (var type in types) {
    if (types[type] > guess.count) {
      guess.type = type;
      guess.count = types[type];
    }
  }
  this.guess = guess;
  return types;
};

NodeList.prototype.draw = function(canvas_id) {  
    var rooms_range = this.rooms.max - this.rooms.min;
    var areas_range = this.areas.max - this.areas.min;

    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");
    var width = 400;
    var height = 400;
    ctx.clearRect(0, 0, width, height);

    for (var i in this.nodes) {
      ctx.save();
      switch (this.nodes[i].type) {
        case 'apartment':
            ctx.fillStyle = 'red';
            break;
        case 'house':
            ctx.fillStyle = 'green';
            break;
        case 'flat':
            ctx.fillStyle = 'blue';
            break;
        default:
            ctx.fillStyle = '#666666';
      }

      var padding = 40;
      var x_shift_pct = (width - padding) / width;
      var y_shift_pct = (height - padding) / height;
      var x = (this.nodes[i].rooms - this.rooms.min) * (width  / rooms_range) * x_shift_pct + (padding / 2);
      var y = (this.nodes[i].area - this.areas.min) * (height / areas_range) * y_shift_pct + (padding / 2);
      y = Math.abs(y - height);


      ctx.translate(x, y);
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.closePath();


        /* 
         * Is this an unknown node? If so, draw the radius of influence
         */

        if (!this.nodes[i].type) {
            switch (this.nodes[i].guess.type) {
                case 'apartment':
                    ctx.strokeStyle = 'red';
                    break;
                case 'house':
                    ctx.strokeStyle = 'green';
                    break;
                case 'flat':
                    ctx.strokeStyle = 'blue';
                    break;
                default:
                    ctx.strokeStyle = '#666666';
            }

            var radius = this.nodes[i].neighbors[this.k - 1].distance * width;
            radius *= x_shift_pct;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
};

var nodes;

var data = [
  { rooms: 1, area: 350, type: 'apartment' },
  { rooms: 2, area: 300, type: 'apartment' },
  { rooms: 3, area: 300, type: 'apartment' },
  { rooms: 4, area: 250, type: 'apartment' },
  { rooms: 4, area: 500, type: 'apartment' },
  { rooms: 4, area: 400, type: 'apartment' },
  { rooms: 5, area: 450, type: 'apartment' },
  { rooms: 7, area: 850, type: 'house' },
  { rooms: 7, area: 900, type: 'house' },
  { rooms: 7, area: 1200, type: 'house' },
  { rooms: 8, area: 1500, type: 'house' },
  { rooms: 9, area: 1300, type: 'house' },
  { rooms: 8, area: 1240, type: 'house' },
  { rooms: 10, area: 1700, type: 'house' },
  { rooms: 9, area: 1000, type: 'house' },
  { rooms: 1, area: 800, type: 'flat' },
  { rooms: 3, area: 900, type: 'flat' },
  { rooms: 2, area: 700, type: 'flat' },
  { rooms: 1, area: 900, type: 'flat' },
  { rooms: 2, area: 1150, type: 'flat' },
  { rooms: 1, area: 1000, type: 'flat' },
  { rooms: 2, area: 1200, type: 'flat' },
  { rooms: 1, area: 1300, type: 'flat' }
];

var run = function () {  
    nodes = new NodeList(3);
    for (var i = 0; i < data.length; i++) {
        nodes.add(new Node(data[i]));
    }
    //create random node and see what it is
    var rooms = Math.round(Math.random() * 10);
    var area = Math.round(Math.random() * 2000);
    var type = false;
    nodes.add(new Node({ rooms, area, type }));

    nodes.determineUnknown();
    nodes.draw('canvas');
};

var window = window;

window.onload = function () {  
    setInterval(run, 5000);
    run();
};
