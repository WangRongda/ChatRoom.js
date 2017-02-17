'use strict';

document.body.onload = function() {
     var input = $("#input-bar textarea");
     var room = $("#room");
     var hisPan = $("#history");
     
     // Customize right mouse click menu
     // myMenu();
     
     // show login panel
     login();

     function login() {
          var w = room.innerWidth();
          if (470 > window.innerWidth) {
               w = 280;
          }
          var marX = (window.innerWidth - w) / 2;
          var marY = (window.innerHeight - room.innerHeight()) / 3;
          room.css({
               "margin": marY + "px " + marX + "px ",
               "width": w + "px",
               "left": "0"
          });

          if (navigator.userAgent.match(/(iPhone | iPod | Android | ios)/i)) {
               room.css("opacity", "1");
          }
          else {
               room.animate({
                    opacity: "1",
                    marginTop: marY - 10 + "px"
               }, "slow");
          }

          $(window).on("resize.loginPanel", function() {
               if (470 > window.innerWidth) {
                    w = 280;
               }
               else {
                    w = window.innerWidth * 0.6;
               }
               var marX = (window.innerWidth - w) / 2;
               var marY = (window.innerHeight - room.innerHeight()) / 3;
               room.css({
                    "margin": marY + "px " + marX + "px ",
                    "width": w + "px",
                    "left": "0"
               });
          });

          $("#login-bar input").on("keypress.login", function(e) {
               var username = $("#login-bar input").val();
               if (13 == e.keyCode && "" != username) {
                    changePanel(username);
               }
          });
     }

     function changePanel(username) {
          $("#login-bar").remove();
          var inputBar = $("#input-bar");
          $(window).off("resize.loginPanel");

          var windowW = window.innerWidth;
          var roomPadX, roomWidth;
          if (windowW > 540) {
               roomPadX = 20;
               roomWidth = 540;
          }
          else if (windowW > 500) {
               var pad = (window.innerWidth - 500) / 2;
               roomPadX = pad;
               roomWidth = 500 + pad * 2;
          }
          else if (windowW <= 500) {
               roomPadX = 0;
               roomWidth = window.innerWidth;
          }

          room.animate({
               "margin": "0",
               "width": roomWidth + "px",
               "height": "100%"
          }, "fast");
          var h = $("body").innerHeight() - 50 -
               inputBar.innerHeight();
          hisPan.animate({
               "height": h + "px"
          }, "fast", function() {
               room.css("padding", "10px " + roomPadX + "px");
               inputBar.css("display", "inline-block");
               hisPan.css("overflow-y", "scroll");
               $("head").append("<style> .gaosi::before { position: fixed; " +
                    "top:0; left:0; width: 540px; height:" + h + "px; ")

               input.focus();
               inputBar.animate({
                    "opacity": "1",
                    "bottom": "0"
               }, "slow", startSock(username));
          });
     }

     function startSock(username) {
          var socket = io.connect(); //Connect with Server

          // After Connect success, send a 'join' event with own username message
          socket.emit('join', {
               username: username
          });
          // Listen client event 'disconnect'
          // socket.on('disconnet', function() {
          //      var dis = '<div class="joinText" style="color: white;">' +
          //           'You leave the chat room at ' + username + '</div>';
          //      hisPan.append(dis);
          // });
          // Listen client event 'reconnect'
          socket.on('reconnect', function() {
               socket.emit('reco', {
                    username: username
               });
          });
          
          // listen server event below
          // listen event 'broadcast_reconnect' from server 
          // Get message than some one disconnet the room
          socket.on('broadcast_reconnect', function(data) {
               var reconnectMsg;
               if (data.username === username) {
                    reconnectMsg = '<div class="joinText" style="color: white;">' +
                         'You reconnect at ' + data.time + '</div>';
               }
               else {
                    reconnectMsg = '<div class="joinText">\'' + data.username +
                         '\'  reconnect at ' + data.time + '</div>';
               }
               hisPan.append(reconnectMsg);
          });
          // listen event 'broadcast_join' from server
          // Get message that other people join room
          socket.on('broadcast_join', function(data) {
               // show
               // console.log(data.username + ' joined the chat room at ' + data.time);
               var joinMsg;
               if (data.username === username) {
                    joinMsg = '<div class="joinText" style="color: white;">' +
                         'You(' + username + ') joined the chat room at ' +
                         data.time + '</div>';
               }
               else {
                    joinMsg = '<div class="joinText">\'' + data.username +
                         '\' joined the chat room at ' + data.time;
               }
               hisPan.append(joinMsg);
               // Notify 
               // if (!isActive) {

               // }

               // scroll bar to bottom
               var h = $("#history")[0].scrollHeight;
               $("#history").scrollTop(h);
          });
          // Listen event 'broadcast_quit' from server
          // Get message that other people left
          socket.on('broadcast_quit', function(data) {
               // console.log(data.username + ' leave the char room at ' + data.time);
               // show
               // console.log(data.username + ' joined the chat room at ' + data.time);
               var leaveMsg;
               // if (data.username === username) {
               //      leaveMsg = '<div class="joinText" style="color: white;">' +
               //           'You leave the chat room at ' + data.time + '</div>';
               // }
               // else {
                    leaveMsg = '<div class="joinText">\'' + data.username +
                         '\' leave the chat room at ' + data.time + '</div>';
               // }
               hisPan.append(leaveMsg);
               // Notify 
               // if (!isActive) {

               // }

               // scroll bar to bottom
               var h = $("#history")[0].scrollHeight;
               $("#history").scrollTop(h);
          });

          socket.on('expression', function(data) {
               var expression = $(".expression");
               if (expression) {
                    expression.html(data.expression);
               }
          });
          
          var isActive = true;
          var notification = [];
          var audio = document.createElement("audio");
          audio.src = "http://115.159.75.162/notify.mp3";

          var k = 0,
               i = 1;
          window.onfocus = function() {
               isActive = true;
               for (k in notification) {
                    notification[k].close();
               }
          };
          window.onblur = function() {
               isActive = false;
          };
          // Listen event 'broadcast_say' from server
          // Get message that other people say in the chat room
          socket.on('broadcast_say', function(data) {
               // console.log('(' + data.time + ')' + data.username + ': ' + data.text);
               // show
               var Msg;
               var text = data.text;
               // text = text.replace(/\n/g, "<br />");
               if (data.username === username) {
                    Msg = '<div class="Message" style="float: right">' +
                         '<div style="text-align: right">' +
                         '<span class="time">[' +
                         data.time + '] </span><span class="username">' +
                         username + '</span>:' + '</div>' +
                         '<pre class="messageText" style="background: #85B4E9">' +
                         text + '</pre></div>';
               }
               else {
                    Msg = '<div class="Message"><div><span class="time">[' +
                         data.time + '] </span><span class="username">' +
                         data.username + '</span>:' + '</div>' +
                         '<pre class="messageText">' + text + '</pre></div>';
                    if (!isActive) {
                         if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
                              // navigator.serviceWorker.register('sw.js');
                              // Notification.requestPermission(function(result) {
                              //      if (result === 'granted') {
                              //           navigator.serviceWorker.ready.then(function(registration) {
                              //                registration.showNotification('Notification with ServiceWorker');
                              //           });
                              //      }
                              // });
                         }
                         else {
                              if (window.Notification) {
                                   if (Notification.permission === 'granted') {
                                        notification[i] = new Notification(
                                             data.username, {
                                                  body: data.text,
                                                  icon: "http://115.159.75.162/dan.png",
                                                  // silent: false,
                                                  // sound: 'http://115.159.75.162/notify.mp3'
                                             });
                                        notification[i].onclick = function() {
                                             window.focus();
                                             while (--i) {
                                                  notification[i].close();
                                             }
                                        }
                                        i++;
                                   }
                                   else {
                                        Notification.requestPermission();
                                   }
                              }
                              else alert('你的浏览器不支持消息提示');
                              audio.play();
                         }
                    }
               }
               hisPan.append(Msg);

               // scroll bar to bottom
               var h = $("#history")[0].scrollHeight;
               $("#history").scrollTop(h);
          });
          
          talking(username, socket);
     } // startSock

     function talking(username, socket) {
          var originInputHeight = input.height();
          var originHistoryHeight = hisPan.height();
          var timewrap = 0;
          input.bind("keypress", function(event) {
               sendClick(event);
          });
          input.bind("input propertychange", function() {
               wrap();
          });
          $("#send").off("click").on("click", function() {
               sendMesg(username, socket);
          });
          $(window).on("resize.room", function() {
               var h = $("body").innerHeight() - 50 -
                    $("#input-bar").innerHeight();
               hisPan.css("height", h + 'px');
               // scroll bar to bottom
               var h = $("#history")[0].scrollHeight;
               $("#history").scrollTop(h);

               var windowW = window.innerWidth;
               if (windowW > 540) {
                    room.css({
                         'padding': "10px 20px",
                         'width': '540px'
                    });
               }
               else if (windowW > 500) {
                    var pad = (window.innerWidth - 500) / 2;
                    room.css("padding", "10px " + pad + "px");
                    room.css("width", 500 + pad * 2 + "px");
               }
               else if (windowW <= 500) {
                    room.css('padding', '10px 0');
                    room.css('width', window.innerWidth);
               }
          });
          // send message (keypress ctrl+enter or click send button)
          function sendClick(event) {
               var key = event.keyCode || event.which;
               if ((key == 13 ||
                         key == 10 // chrome
                    ) && event.ctrlKey) {
                    sendMesg(username, socket);
               }
          }
          // Wrap input (keypress enter)
          function wrap() {
               var currentLine = input.val().split("\n").length;
               if (3 < currentLine) {
                    return;
               }
               if (currentLine * 24 < input.height()) {
                    // Backspace 
                    timewrap--;
                    hisPan.height(originHistoryHeight - 24 * timewrap);
                    input.height(originInputHeight + 24 * timewrap);
               }
               else if (currentLine * 24 > input.height()) {
                    // Enter
                    timewrap++;
                    hisPan.height(originHistoryHeight - 24 * timewrap);
                    input.height(originInputHeight + 24 * timewrap);
               }
          }

          function sendMesg(username) {
               var youMessage = input.val();
               if ("" === youMessage) {
                    return;
               }
               else if ("/img" == youMessage.substring(0, 4)) {
                    $(".expression").css("display", "inline-block");
               }
               
               if (username == "") {
                    location.reload();
               }

               // clear input
               input.val("");
               hisPan.height(originHistoryHeight);
               input.height(originInputHeight);
               timewrap = 0;

               //send  to server
               socket.emit('say', {
                    username: username,
                    text: youMessage
               });

               // show in pan
               // var youMessageBox = "<div><pre>" + username + youMessage + "</pre></div>";
               // hisPan.append(youMessageBox);
          }
     }

     function myMenu() {
          var menu = $("#myMenu");
          $(document).mousedown(function(aevent) { //设置该元素的 按下鼠标右键右键的 处理函数
               if (window.event) aevent = window.event; //解决兼容性
               if (aevent.button == 2) { //当事件属性button的值为2时，表用户按下了右键
                    document.oncontextmenu = function(aevent) {　　　　
                         if (window.event) {　　　　
                              aevent = window.event;　　　　　　　　
                              aevent.returnValue = false; //对IE 中断 默认点击右键事件处理函数
                         }
                         else {　　　　　　　　
                              aevent.preventDefault(); //对标准DOM 中断 默认点击右键事件处理函数
                         };　　　　
                    };　　　　
               }　　
          });

          $("body").on('keypress.myMenu', function(e) {
               if (27 == (e.keyCode || e.which)) {
                    menu.css("display", "none");
               }
          });
          $("body").on("click.myMenu", function() {
               menu.css("display", "none");
          });
     }
};
