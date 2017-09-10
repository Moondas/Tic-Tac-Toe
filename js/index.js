var player = {
  sign: null,
}

var game = {
  turn: 0,
  player: "X",
  setTurn: function(tn) {this.player = tn},
  getTurn: function() {return this.player},
  nextTurn: function(){
    this.setTurn((this.getTurn() == 'X')? 'O':'X');
    $(".label span").toggleClass('active');
    this.turn++;
    this.printStat();
  },
  fDim: 3,
  field: new Array(9).fill('-'),
  getRow: function(r){
    var fDim = this.fDim;
    return this.field.slice(r*fDim, r*fDim+fDim)
  },
  getCol: function(c){
    var fDim = this.fDim;
    return this.field.filter(function(e,i){
      return i % fDim === c;
    });
  },
  addSign: function(c, r){
    let f = this.field;
    let fDim = this.fDim;
    
    if (f[r*fDim+c] === '-') {
      f[r*fDim+c] = this.player;
      return true;
    } else return false;
  },
  printStat: function(){
    for (let r = 0; r < this.fDim; r++) {
      console.log(...this.getRow(r));
    }
  },
  checkWin: function(){
    var f = this.field;
    var fDim = this.fDim;
    
    // Check in row match
    for(var r=0; r < fDim; r++) {
      if (this.getRow(r).join("") === "XXX") console.log(`Match in ${r+1}. row`);
    }
    
    // Check in col match
    for (var c=0; c < 3; c++) {
      if (this.getCol(c).join("") === "XXX") console.log(`Match in ${c+1}. col`);
    }
    
    // Angles    
    if (f[0] !=='-' && f[0] == f[4] && f[4] == f[8]) console.log("Match in TL to BR");
    if (f[2] !=='-' && f[2] == f[4] && f[4] == f[6]) console.log("Match in TR to BL");
  }
}

var grid = function(cw, ch, dim, marg) {
  var canvas = '<canvas id="can" width="' + cw + '" height="' + ch + '"></canvas>';
  $('app').append(canvas);
  
  return new (function() {
    this.can = $('#can');
    this.ctx = this.can[0].getContext('2d'),
      
    this.ch = cw,
    this.cw = ch,
    this.dimension = dim || 3, // Define row and column number in fixed 1:1 ratio
      
    this.setLine = function(cap, width){
      var ctx = this.ctx;
      
      ctx.lineCap = cap;
      ctx.lineWidth = width;
    }
      
    this.tile = {},
    this.tile.W = cw/this.dimension,
    this.tile.H = ch/this.dimension,
    
    this.sign = {},
    this.sign.X = function(c, r){ // Place sign X to Col & Row
      var ctx = g.ctx,
          div = 3,
          offsetX = g.tile.W * (c || 0),
          offsetY = g.tile.H * (r || 0);
      
      ctx.moveTo(offsetX + g.tile.W/div, offsetY + g.tile.H/div);
      ctx.lineTo(offsetX + g.tile.W*2/div, offsetY + g.tile.H*2/div);

      ctx.moveTo(offsetX + g.tile.W*2/div, offsetY + g.tile.H/div);
      ctx.lineTo(offsetX + g.tile.W/div, offsetY + g.tile.H*2/div);
    },
    this.sign.O = function(c, r){
      var ctx = g.ctx,
          div = 3,
          offsetX = g.tile.W * (c || 0),
          offsetY = g.tile.H * (r || 0);
      
      ctx.arc(offsetX + g.tile.W/2, offsetY + g.tile.H/2, g.tile.H/div/2, 0, Math.PI*2);
    },
    this.sign.getPos = function(x, y) {
      var c = parseInt(x/g.cw*3);
      var r = parseInt(y/g.ch*3);
      return [c, r];
    },
      
    this.m = marg || 15; // Margin
    
    this.clear = function(){this.ctx.clearRect(0, 0, this.ch, this.cw)};
    this.make = function(){
      var g = this,
          ctx = g.ctx;
      
      ctx.beginPath();
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (var i = 1; i < g.dimension; i++) {
        // Vertical lines
        ctx.moveTo(g.tile.W*i, g.m);
        ctx.lineTo(g.tile.W*i, g.ch-g.m);

        // Horizontal lines
        ctx.moveTo(g.m, g.tile.H*i);
        ctx.lineTo(g.cw-g.m, g.tile.H*i);
      }
      ctx.stroke();      
    }
  })()
};

var comp = function(){
  var f = game.field;
  var c, r;
  var center = 4;
  var dimension = 3;
  var stepped = false;
  
  var corners = [
                  0, 2,
                  6, 8
                ];
  
  console.log('Start comp');
  // See table
  // Decision: defense xor offense
  // @TODO Check Matches & Possibilities
  
  // First: center
  if (!stepped && f[center] == '-') {
    console.log('Check: center');
    c = center%dimension;
    r = parseInt(center/dimension);
    stepped = true;
  }
  // Second: corner
  if (!stepped && f[center] !== '-') {
    console.log('Check: corner');
    
    // @TODO: Check used corners
    
    // If all corners are empty, choose one at will
    var whichCorner = (function(){
      var rand = -1;
      var used = f.filter(function(e,i,a){
        return corners.indexOf(i) > -1 && a[i] !== '-';
      }).length;
      
      while(f[corners[rand]] !== '-' && used < 4) {
        rand = Math.floor(Math.random()*4);
        //debugger;
      }
      console.log("Selected corner: ", rand);
      return rand;
    })();
    
    switch(whichCorner) {
      case -1: console.log('No more corners left!');
      break;
      case 0: {
        c = 0;
        r = 0;
      }
      break;
      case 1: {
        c = dimension-1;
        r = 0;
      }
      break;
      case 2: {
        c = 0;
        r = dimension-1;
      }
      break;
      case 3: {
        c = dimension-1;
        r = dimension-1;
      }
      break;
      default: console.log("Something went wrong, Yikes!")
     }
    
    if (whichCorner > -1) stepped = true;
  }
  
  // Make match
  // Check enemy, check possibilities
  
  if (stepped) { 
    game.addSign(c, r);

    console.log("Position: ", c, "/", r);

    /* Draw Sign */
    var ctx = g.ctx;

    ctx.beginPath();
    g.sign.O(c,r);
    ctx.stroke();

    game.nextTurn();
  }
}

var makeGrid = function() {
  g = grid(400, 400);
  
  g.make();
  
  g.can.on('click', function(evt){
    var player = () => game.player.toUpperCase();
    
    if (player() == 'X') placeSign(evt, player());
    
    if (player() == 'O') setTimeout(comp, 300); // Wait 300 msec for implement sleep(300) function, because comp too fast answer and turn chance don't shown
    
    // Check winner
    game.checkWin();
  });
}

var placeSign = function(evt, player) { // For player
  var ctx = g.ctx;
  var x = evt.offsetX;
  var y = evt.offsetY;
  
  // @TODO Check busy cell, before replace with other sign
  if (game.addSign(...g.sign.getPos(x,y))) {
    
    /* Draw Sign */
    ctx.beginPath();
    g.setLine('round', 3);
    g.sign[player](...g.sign.getPos(x, y));
    ctx.stroke();
    
    game.nextTurn();
  }
}

$("#signX, #signO").on('click', function(evt){
  var choosed = evt.target.id;
  player.sign = choosed.slice(-1); // Gets sign from ID (last char)
  $orig = $(this); // Choosed one
  $origS = $orig.siblings(); // Other elements
  $choice = $(".choice"); // Layout for Choice
  
  $origS.fadeOut().promise().done(function(){
    $orig.addClass('pulse').delay(1000).queue('fx', function(){
      $choice.fadeOut('slow');
    });
  });
})

makeGrid();