  var socket = io();

  socket.on('shuaxin', (nickName, userCount, users) => {
    //console.log(userCount)
    document.querySelector('.userNum').textContent = userCount;
    $('.UserName').empty(); 
    for(var i in users) {
      $('.UserName').append(`<li>${users[i]}</li>`);    
    }

  })

  if(localStorage.name){ //将用户名保存到localStorage
    document.querySelector('footer .name').innerText = localStorage.name
    document.querySelector('.bgc').style.display = "none";
    socket.emit('conn', name);
    console.log(name);
  }

  socket.on('chat from server', function(data) {// 监听服务器发送的消息
    showMsg(data)
  })

  socket.on('conn', function(nickName, userCount) {
    showMsg(nickName + ' 进入了聊天室 ');
    appendSum(userCount);
  })

  socket.on('disconn', function(nickName, userCount, users) {
    showMsg(nickName + ' 离开了聊天室');
    appendSum(userCount);
    $('.UserName').empty(); 
    for(var i in users) {
      $('.UserName').append(`<li>${users[i]}</li>`);    
    }
  })

  document.querySelector('#submitName').onclick = function() {
    var name = document.querySelector('#name').value;
    if(name === '') {
      alert('请输入你要聊天的昵称！');
    } else {
      document.querySelector('footer .name').innerText = name;
      document.querySelector('.bgc').style.display = "none";
      socket.emit('conn', name);
    }
  }

  function goSubmit(e) {
    if(document.querySelector('footer .message').value === '') {
      alert('请输入你要发言的内容')
    }else {
      socket.emit('chat', document.querySelector('footer .name').innerText, document.querySelector('footer .message').value);//向服务器发送消息      
      document.querySelector('footer .message').value = '';
    }
  }

  document.querySelector('footer .name').onblur = function(e){
    console.log(this.value)
    if(this.innerText == ''){
      alert('名字不能为空')
      this.innerText = localStorage.name || '游客'
      return 
    }
    localStorage.name = this.innerText
  }

  function showMsg(data) {
    if(Notification.permission === 'granted') {
      var notification = new Notification(data);
    } else if(Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        if(permission === 'granted') {
          var notification = new Notification(data);
        }
      });
    }

    var msgNode = document.createElement('div')
    var childSpan = document.createElement('span')
    var date = document.createTextNode(`···················( ${new Date().toTimeString().substr(0, 8)} )` )
    var childText = document.createTextNode(data)
    msgNode.appendChild(childSpan)
    msgNode.appendChild(childText)
    msgNode.classList.add('message')
    setTimeout(function(){
      msgNode.classList.add('normal')
      msgNode.appendChild(date)
    }, 1000)
    document.body.querySelector('main .ChatContent').appendChild(msgNode)
    console.log(data);
  }

  function appendSum(userCount) {
    $('main > .UsersList > .userNum').empty();
    var para = document.createElement('span');
    var node = document.createTextNode(userCount);
    para.appendChild(node);
    document.querySelector('main > .UsersList > .userNum').appendChild(para);
  }

  /* 
    发送文件
  */
  $('#fileupload').on('change', function() {
    var $this = $(this);
    var files = $this[0].files;
    var nickName = $('.name').text();
    if(files.length != 0) {
      var file = files[0];
      var reader = new FileReader();
      if(!reader) {
        alert("您的浏览器版本过低，不能发送图片！");
        $this.val('');
        return;
      };
      reader.onload = function(e) {
        $this.val('');
        socket.emit('fileupload',{msg: '<img class="uploadPic" src="'+e.target.result+'" alt="img">', name: ''}, nickName);
      }
      reader.readAsDataURL(file);
    }
  })

  /* 
    接受服务器发送过来的信息，
    并将图片显示到页面上
  */
  socket.on('msg', (result) => {
    if(result.status == 'success') {
      var info = result.info;
      var date = document.createTextNode(`···················( ${new Date().toTimeString().substr(0, 8)} )` )
      var $picNode = $("<div class='message normal'></div>");
      $picNode.append(info.name + "说：" + info.msg);
      $picNode.append(date);
      $('main .ChatContent').append($picNode);
    }
  })