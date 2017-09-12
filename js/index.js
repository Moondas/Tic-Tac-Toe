/*global $*/

var player = {
  sign: "X"
};

var game = {
  turn: 0,
  player: "X",
  getTurn: function () {return this.turn; },
  getPlayer: function () {return this.player; },
  togglePlayer: function () {this.player = (this.player === 'X') ? 'O' : 'X'; },
  nextTurn: function () {
    this.togglePlayer();
    $(".label span").toggleClass('active');
    this.turn++;
    this.printStat();
    if (this.turn === 9) console.log('No more moves left!')
    
    // Check winner
    this.checkWin();
  },
  fDim: 3,
  field: new Array(9).fill('-'),
  getRow: function (r) {
    let fDim = this.fDim;
    return this.field.slice(r * fDim, r * fDim + fDim);
  },
  getCol: function (c) {
    let fDim = this.fDim;
    return this.field.filter(function (e, i) {
      return i % fDim === c;
    });
  },
  getDiag: function (d) {
    let fDim = this.fDim;
    let f =    this.field;
    let diag = [];

    switch (d) {
      case 1: { // Top left to bottom right
        for (let a = 0; a < fDim; a++) {
          diag.push(f[fDim * a + a]);
        }
        break;
      }
      case 2: { // Top right to bottom left
        for (let a = 0; a < fDim; a++) {
          diag.push(f[(fDim - 1) * (a + 1)]);
        }
        break;
      }
      default: {
        console.log('No more diagonals!');
      }
    }

    return diag;
  },
  addSign: function (c, r) {
    let f = this.field;
    let fDim = this.fDim;
    let player = this.player;
    let id = r * fDim + c;
    
    if (f[id] === '-') {
      f[id] = player;
      g.sign[player](c, r);
      return true;
    }
    return false;
  },
  printStat: function () {
    for (let r = 0; r < this.fDim; r++) {
      console.log(...this.getRow(r));
    }
  },
  reset: function () {
    this.field = new Array(9).fill('-');
    
    g.clear();
    g.make();
  },
  checkWin: function () {
    let f = this.field;
    let fDim = this.fDim;
    let msg = "";
    let win = ["XXX", "OOO"]; // TODO Get winner's sign
    let dir = "";
    
    // Check in row match
    for(var r=0; r < fDim; r++) {
      if (win.indexOf(this.getRow(r).join("")) > -1) {
        msg = `Match in ${r+1}. row`;
        dir = `r${r}`;
      }
    }
    
    // Check in col match
    for (var c=0; c < 3; c++) {
      if (win.indexOf(this.getCol(c).join("")) > -1) {
        msg = `Match in ${c+1}. col`;
        dir = `c${c}`;
      }
    }
    
    // Diagonals
    if (win.indexOf(this.getDiag(1).join("")) > -1) {
      msg = "Match in TL to BR \\";
      dir = `d1`;
    }
    if (win.indexOf(this.getDiag(2).join("")) > -1) {
      msg = "Match in TR to BL \/";
      dir = `d2`;
    }
    
    if (msg) {
      msg = "Winner combination: \n" + msg;
      g.cross(dir);
      console.log(msg);
    }
  }
}

var grid = function (cw, ch, dim, marg) {
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
      
      ctx.beginPath();
      ctx.moveTo(offsetX + g.tile.W/div, offsetY + g.tile.H/div);
      ctx.lineTo(offsetX + g.tile.W*2/div, offsetY + g.tile.H*2/div);

      ctx.moveTo(offsetX + g.tile.W*2/div, offsetY + g.tile.H/div);
      ctx.lineTo(offsetX + g.tile.W/div, offsetY + g.tile.H*2/div);
      ctx.stroke();
    },
    this.sign.O = function(c, r){
      var ctx = g.ctx,
          div = 3,
          offsetX = g.tile.W * (c || 0),
          offsetY = g.tile.H * (r || 0);
      
      ctx.beginPath();
      ctx.arc(offsetX + g.tile.W/2, offsetY + g.tile.H/2, g.tile.H/div/2, 0, Math.PI*2);
      ctx.stroke();
    },
    this.sign.getPos = function(x, y) {
      var c = parseInt(x/g.cw*3);
      var r = parseInt(y/g.ch*3);
      return [c, r];
    },
      
    this.m = marg || 15; // Margin
    
    this.cross = function (id = "") {
      var g = this,
          ctx = g.ctx;
      let dir = id.split('')[0];
      let step = id.split('')[1];
      
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "yellowgreen";
      
      switch (dir) {
        case 'r': {
          ctx.moveTo(0 + this.m, step * g.tile.H + g.tile.H/2);
          ctx.lineTo(cw - this.m, step * g.tile.H + g.tile.H/2);
          break;
        }
        case 'c': {
          ctx.moveTo(step * g.tile.W + g.tile.W/2, 0 + this.m);
          ctx.lineTo(step * g.tile.W + g.tile.W/2, ch - this.m);
          break;
        }
        case 'd': {
          if (id == 'd1') {
            ctx.moveTo(0 + this.m, 0 + this.m);
            ctx.lineTo(cw - this.m, ch - this.m);
          }
          if (id == 'd2') {
            ctx.moveTo(cw - this.m, 0 + this.m);
            ctx.lineTo(0 + this.m, ch - this.m);
          }
          break;
        }
        default: `Houston, I have a problem`;
      }
      
      ctx.stroke();
      ctx.restore();
    };
    
    this.clear = function () {this.ctx.clearRect(0, 0, this.ch, this.cw); };
    this.make = function () {
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
      this.cross();
    }
  })()
};

// Computer AI
var comp = function () {
  var f = game.field;
  var c = undefined, r = undefined;
  var center = 4;
  var dimension = 3;
  var stepped = false;
  
  var corners = [
                  0, 2,
                  6, 8
                ];
  
  // Sort directions by usage
  var top = (() => {
    let srt = (() => {
      let list = [
        //r#: [], // Rows
        //c#: [], // Cols
        //d#: [], // Diags
      ];
      
      let item = (i, v) => Object({id: i, val: v,});
      
      for (let i = 0; i < dimension; i++) {
        list.push(item('r' + i, game.getRow(i)));
        list.push(item('c' + i, game.getCol(i)));
        if (i > 0) list.push(item('d' + i, game.getDiag(i)));
      }
      
      return list;
    })();
    
    let getKey = (n) => Object.keys(n)[0];
    
    let ftr = (e) => e !== '-';
    
    // Longest first
    srt.sort((a, b) => {
      return b.val.filter(ftr).length -
             a.val.filter(ftr).length;
    });
    
    // Only for console view
    let view = {};
    
    srt.map((e) => {
      view[e.id] = e.val.join('');
    });
    
    //console.log(view);
    
    return srt;
  })();
  
  var potentials = (() => {
    let cache = {};
    let ftr = (e) => e !== '-';
    
    // We don't deal with longer than 2, because it's not in game
    cache = top.filter(e => e.val.filter(ftr).length < 3);
    
    // Filter mixed directions
    cache = cache.filter(e => !(e.val.indexOf('X') > -1 && e.val.indexOf('O') > -1));
    
    // Opposite views
    var halfling = {
      O: (() => cache.filter(e => e.val.indexOf('O') > -1))(),
      X: (() => cache.filter(e => e.val.indexOf('X') > -1))(),
    };
    
    console.log("Halflings are: ", "O:", halfling.O[0], "X:", halfling.X[0]);
    
    return halfling;
  })();
  
  console.log('Start comp');
  
  // Real decisions begins here
  if (game.getTurn() > 1 && game.turn < 9) {
    let halflings = potentials;
    
    let cpuSign = (player.sign === "O") ? 'X' : 'O';
    let userSign = player.sign;
    let cpu =  halflings[cpuSign][0];
    let user = halflings[userSign][0];
    
    let first = cpu; // In all possibilities select O, except '2X' has it or inversely
    
    if (user !== undefined && cpu !== undefined) 
      if (user.val.filter(e => e === userSign).length === 2 &&
        !(cpu.val.filter(e => e === cpuSign).length === 2) ) first = user;
    
    if (user !== undefined && cpu === undefined) first = user;
    
    if (first !== undefined) {
      let index = first.id;
      let arr = first.val;

      let dir = index.split('')[0];

      switch (dir) {
        case 'r': {
          r = Number(index.split('')[1]);
          c = Number(arr.indexOf('-'));
          break;
        }
        case 'c': {
          c = Number(index.split('')[1]);
          r = Number(arr.indexOf('-'));
          break;
        }
        case 'd': {
          r = arr.indexOf('-')

          if (index == 'd1') {
            c = r;
          }
          if (index == 'd2') {
            c = dimension-1-r;
          }
          break;
        }
        default: `Houston, I have a problem`;
      }

      console.log(arr, index, c, r);
    }
    
    if (c !== undefined && r !== undefined) stepped = true;
  }
  
  // First: center
  if (!stepped && f[center] == '-') {
    console.log('Check: center');
    c = center % dimension;
    r = parseInt(center / dimension);
    stepped = true;
  }
  // Second: corner
  if (!stepped && f[center] !== '-') {
    console.log('Check: corner');

    // Choose one at will
    var whichCorner = (() => {
      var rand = -1;
      var used = f.filter(function(e,i,a){
        return corners.indexOf(i) > -1 && a[i] !== '-';
      }).length;
      
      while(f[corners[rand]] !== '-' && used < 4) {
        rand = Math.floor(Math.random()*4);
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
    
  if (stepped) { 
    console.log("Position: ", c, "/", r);
    
    if (game.addSign(c, r)) game.nextTurn();
  }
}

var makeGrid = function () {
  g = grid(400, 400);
  
  g.make();
  
  var sign = () => game.player.toUpperCase();
  
  if (sign() !== player.sign) comp();
  
  g.can.on('click', function (evt) {
    if (sign() == player.sign) placeSign(evt, sign());
    
    if (sign() !== player.sign) setTimeout(comp, 300); // Wait 300 msec for implement sleep(300) function, because comp too fast answer and turn chance don't shown
  });
}

var placeSign = function (evt, player) { // For player
  var x = evt.offsetX;
  var y = evt.offsetY;

  if (game.addSign(...g.sign.getPos(x, y))) game.nextTurn();
}

// TODO Choice layout wiring
// TODO Make end game
// FUTURE Score counting
$("#signX, #signO").on('click', function (evt) {
  var choosed = evt.target.id;
  player.sign = choosed.slice(-1); // Gets sign from ID (last char)
  $orig = $(this); // Choosed one
  $origS = $orig.siblings(); // Other elements
  $choice = $(".choice"); // Layout for Choice
  
  $origS.fadeOut().promise().done(function () {
    $orig.addClass('pulse').delay(1000).queue('fx', function () {
      $choice.fadeOut('slow');
    });
  });
})

makeGrid();
