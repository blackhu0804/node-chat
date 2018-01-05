
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var axios = require('axios');
var users = [];

var APIKEY = 'aac8c08a883a4ba8ac09412ae01182ea';
io.on('connection', function(socket){
  socket.on('conn', (name) => {
    socket.nickname = name;
    users.push(name);
    console.log('当前在线用户' + users);
    socket.broadcast.emit('conn', socket.nickname, users.length) 
    io.sockets.emit('shuaxin',socket.nickname,users.length,users);
  })

  socket.on('disconnect', function() {
    if(socket.nickname != null) {
      users.splice(users.indexOf(socket.nickname), 1);
      socket.broadcast.emit('disconn', socket.nickname, users.length,users);
      console.log(socket.nickname + '离开了聊天室');
    }
  })

  socket.on('chat', function(username, content) { //监听浏览器发送过来的消息
    console.log(username + ' say: ' + content);
    if(/小图/.test(content)) {
      axios.post('http://www.tuling123.com/openapi/api', {
        key: APIKEY,
        info: content,
        userid: username
      }).then(function(res) {
        console.log(res.data)
        io.sockets.emit('chat from server', `小图说：${res.data.text}`)
      })
    }

    //socket.broadcast.emit('chat from server', `${username} 说：${content}`); //给除了自己以外的所有人发送信息
    io.sockets.emit('chat from server', `${username} 说：${content}`); //向浏览器发送消息
  })

  /* 
    接受浏览器发送过来的图片信息，
    并返回给浏览器
  */
  socket.on('fileupload', (obj, nickname) => {
    if(nickname){
      obj.name = nickname;
      io.sockets.emit('msg', { status:"success", info: obj});
    }else{
      io.sockets.emit('msg', { status:"failure" });
    }
  })
})



server.listen(3000, function() {
  console.log("listen to port: 3000");
})

app.use(express.static('./public'));

