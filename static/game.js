var socket = io();
var worldX = 9000;
var worldY = 9000;
var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  name: 'player',
  id: 0000
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

// Send movement to the server ever so often
socket.emit('new player');

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

// Game
var canvas = document.getElementById('canvas');
canvas.width = 1600;
canvas.height = 1200;

var context = canvas.getContext('2d');

socket.on('state', function(players,foods,enemys) {

// Draw player
  context.clearRect(0, 0, 1600, 1200);
  for (var id in players) {
    var player = players[id];
    context.font = "30px Arial";
    context.fillStyle = "rgb("+player.r+", "+player.g+", "+player.b+")";
    context.beginPath();
    context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = "rgb(255,255,255)";
    context.fillText(player.name, player.x -player.radius /2, player.y);

  }

//draw food
  for (var num in foods) {
    var food = foods[num];
    context.fillStyle = "rgb(255, 255, 255)";
    context.beginPath();
    context.arc(food.x, food.y, 10, 0, 2 * Math.PI);
    context.fill();
  }

//draw enemy
for (var num in enemys) {
  var enemy = enemys[num];
  context.fillStyle = "rgb(140,38,24)";
  context.beginPath();
  context.arc(enemy.x, enemy.y, 15, 0, 2 * Math.PI);
  context.fill();
}


//Leaderboard
  var keys = Object.keys(players).sort(function(j, k) {
    return players[j].radius - players[k].radius;
  })

if (keys != undefined && players[keys[0]]  != undefined) {
  var indexOne = keys.length - 1
  document.getElementById("one").innerHTML = "1. "+players[keys[indexOne]].name+" ("+players[keys[indexOne]].radius+")";
  if (keys.length  >= 2) {
    var indexTwo  = keys.length - 2
    document.getElementById("two").innerHTML = "2. "+players[keys[indexTwo]].name +" ("+players[keys[indexTwo]].radius+")";
    if(keys.length >= 3){
      var indexThree  = keys.length - 3
      document.getElementById("three").innerHTML = "3. "+players[keys[indexThree]].name +" ("+players[keys[indexThree]].radius+")";;
    }
  }
}

});

socket.on('gameOver', function() {
  document.getElementById("text").innerHTML = "A new game has begun....";
  // movement.left = false;
  // movement.right = false;
  // movement.up = false;
  // movement.down = false;
});

socket.on('msg', function(text,death,p1,p2) {
  document.getElementById("text").innerHTML = text;
  if (death) {
      document.getElementById("text").innerHTML = p1+' ate '+p2;
  }
  setTimeout(function () {
  document.getElementById("text").innerHTML = "-";
  }, 5000);
});

document.addEventListener('keyup', function(event) {
if (event.keyCode == 13) {
  changeName(document.getElementById("userInput").value);
  document.activeElement.blur()
}
});

function changeName(name) {
  movement.name = name;
}

socket.on('death', function() {
    if (window.confirm("You Died")) {
      location.reload();
    }
});
