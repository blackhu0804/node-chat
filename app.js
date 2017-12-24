var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on('chat', function(username, content) { //监听浏览器发送过来的消息
    console.log(username + 'say: ' + content);
    socket.emit('chat', 'hi' + user); //向浏览器发送消息
  })
})
server.listen(3000, function() {
  console.log("listen to port: 3000");
})

app.use(express.static('./public'));

