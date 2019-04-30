// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var  port= process.env.PORT;

if (port == null || port == "") {
  port = 5000;
}

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port '+port);
});

var players = {};
var food = {};
var enemy = {};

io.on('connection', function(socket) {
  socket.on('disconnect', (reason) => {
      var player = players[socket.id] || {};
      delete players[socket.id];
    });

  socket.on('new player', function() {
    var num = Math.round(0xffffff * Math.random());
    players[socket.id] = {
      x: Math.floor(Math.random() * 1600) + 1,
      y: Math.floor(Math.random() * 1200) + 1,
      r: num >> 16,
      g: num >> 8 & 255,
      b: num & 255,
      radius: 25,
      name: 'player',
      id: socket.id
    };
  });

socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    player.name = data.name;
    //make screen wrap
    if (player.y > 1200 ) {
      player.y = 5;
    }
    if(player.y < 0){
      player.y = 1195;
    }
    if(player.x> 1600){
      player.x = 5;
    }
    if(player.x < 0){
      player.x = 1595;
    }
    //movement
    if (data.left) {
      player.x -= 7;
    }
    if (data.up) {
      player.y -= 7;
    }
    if (data.right) {
      player.x += 7;
    }
    if (data.down) {
      player.y += 7;
    }

    for (var num in enemy) {
      if (Math.abs(enemy[num].x - player.x) <= player.radius && Math.abs(enemy[num].y - player.y) <= player.radius  ) {
        if (player.radius > 50) {
          player.radius -= 20;
          delete enemy[num];
        }else{
          player.radius = 20;
          delete enemy[num];
        }
      };
    }

    for(var num in food){
      if (player.radius <= 320) {
        if (Math.abs(food[num].x - player.x) <= player.radius && Math.abs(food[num].y - player.y) <= player.radius  ) {
            player.radius += 3;
              delete food[num];
        };
      }
    };

    for(var num in players){
        if (player.r != players[num].r && player.g != players[num].g && player.b != players[num].b  ) {
          if (Math.abs(players[num].x - player.x) <= player.radius && Math.abs(players[num].y - player.y) <= player.radius) {
              if (player.radius > players[num].radius) {
                player.radius += players[num].radius / 2;
                  io.sockets.emit('msg', "A player has died",true,player.name,players[num].name);
                  socket.to(players[num].id).emit('death');
                  delete players[num];
              }
          };
        };

    }

  });




});

//spawn food
for (var i = 0; i < 40; i++) {
  food[i] = {
    x: Math.floor(Math.random() * 1600) + 1,
    y: Math.floor(Math.random() * 1200) + 1,
    radius: 10
  };
}




setInterval(function() {

  io.sockets.emit('state', players,food,enemy);
  if(Object.keys(food).length == 10){
      io.sockets.emit('gameOver');
      io.sockets.emit('msg', 'New white dots have entered the playing field');
      //RESET
      for (var i = 0; i < 40; i++) {
        food[i] = {
          x: Math.floor(Math.random() * 1600) + 1,
          y: Math.floor(Math.random() * 1200) + 1,
          radius: 10
        };
      }
  };

  if (Object.keys(enemy).length == 3) {
    createEnemy(15);
  }
}, 1000 / 60);


createEnemy(20);

function createEnemy(num) {
    for (var i = 0; i < num; i++) {
      enemy[i] ={
        x: Math.floor(Math.random() * 1600) + 1,
        y: Math.floor(Math.random() * 1200) + 1,
        radius: 15
      }
    }
}
