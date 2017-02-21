'use strict';

document.body.onload = function() {
     var input = $("#input");
     var room = $("#room");
     var hisPan = $("#history");

     // Customize right mouse click menu
     myMenu();

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
               hisPan.css("min-height", (h - 48) + 'px');
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

          function onHisPanScrollHeightChange(elm, callback) {
               var lastHeight = elm[0].scrollHeight,
                    newHeight;
               (function run() {
                    newHeight = elm[0].scrollHeight;
                    if (lastHeight != newHeight)
                         callback();
                    lastHeight = newHeight;

                    if (elm.onHisPanScrollHeightChangeTimer)
                         clearTimeout(elm.onHisPanScrollHeightChangeTimer);

                    elm.onHisPanScrollHeightChangeTimer = setTimeout(run, 200);
               })();
          }


          onHisPanScrollHeightChange(hisPan, function() {
               var h = hisPan[0].scrollHeight;
               hisPan.scrollTop(h);
          });

          // function onInputHeightChange(elm, callback) {
          //      var lastHeight = elm.innerHeight(),
          //           newHeight;
          //      (function run() {
          //           newHeight = elm.innerHeight();
          //           if (lastHeight != newHeight)
          //                callback();
          //           lastHeight = newHeight;

          //           if (elm.onInputHeightChangeTimer)
          //                clearTimeout(elm.onInputHeightChangeTimer);

          //           elm.onInputHeightChangeTimer = setTimeout(run, 0);
          //      })();
          // }


          // onInputHeightChange(input, function() {
          //      var h = $("body").innerHeight() - 50 -
          //           $("#input-bar").innerHeight();
          //      hisPan.css("height", h + 'px');
          // });
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
 });

          socket.on('expression', function(data) {
               var expression = $(".expression");
               if (expression) {
                    expression.html(data.expression);
               }
               $(".expression div").one("click.express", function() {
                    var src = this.children[0].src;
                    socket.emit('sendExpression', {
                         username: username,
                         text: '<img onclick="window.open(src)" alt="[Image]" src="' +
                              src + '" />'
                    });
                    $("#previewImg").css("display", "none");
               });

               $(".expression div").mousemove(function(e) {
                    $("#previewImg")[0].src = this.children[0].src;
                    $("#previewImg").css({
                         "display": "block",
                         "top": e.pageY - $("#previewImg").innerHeight(),
                         "left": e.pageX
                    });
               });
               $(".expression div").mouseleave(function() {
                    $("#previewImg").css("display", "none");
               });

               // cancle event
               $("body").one('keypress.cancleExpression', function(e) {
                    if (27 == (e.keyCode || e.which)) {
                         $(".expression").css("display", "none");
                         expression.html("loding expression image...");
                    }
               });
               $("body").one("click.cancleExpression", function() {
                    $(".expression").css("display", "none");
                    expression.html("loding expression image...");
               });

          });

          socket.on('broadcast_expression', function(data) {
               var Msg;
               if (data.username === username) {
                    Msg = '<div class="Message" style="float: right">' +
                         '<div style="text-align: right">' +
                         '<span class="time">[' +
                         data.time + '] </span><span class="username">' +
                         username + '</span>: </div><div class="messageText"' +
                         'style="background: #85B4E9; float: right">' +
                         '<img class="imageMsg" alt src=' + data.src + ' /></div>';
               }
               else {
                    Msg = '<div class="Message"><div><span class="time">[' +
                         data.time + '] </span><span class="username">' +
                         data.username + '</span>: </div>' +
                         '<div class="messageText">' +
                         '<img class="imageMsg" alt="[Image]" src=' + data.src + ' /></div>';

                    // Notify
                    notify(data.username, "[Image]");
               }
               hisPan.append(Msg);

               $(".imageMsg:last").click(function() {
                    window.open(this.src);
               });

          });

          // Listen event 'broadcast_say' from server
          // Get message that other people say in the chat room
          socket.on('broadcast_say', function(data) {
               var Msg;
               var text = data.text;


               if (data.username === username) {
                    Msg = '<div class="Message" style="float: right">' +
                         '<div style="text-align: right">' +
                         '<span class="time">[' + data.time + '] </span>' +
                         '<span class="username">' + username + '</span>:' +
                         '</div><div class="messageText"' +
                         'style="background: #85B4E9; float: right">' +
                         text + '</div></div>';
               }
               else {
                    Msg = '<div class="Message"><div><span class="time">[' +
                         data.time + '] </span><span class="username">' +
                         data.username + '</span>:' + '</div>' +
                         '<div class="messageText">' + text + '</div></div>';

                    notify(data.username, text);
               }
               hisPan.append(Msg);

          });

          talking(username, socket);
     } // startSock

     function talking(username, socket) {
          var originInputHeight = input.height();
          var originHistoryHeight = hisPan.height();
          input.bind("keypress", function(event) {
               sendClick(event);
          });
          // $("#input").bind("DOMNodeInserted", function(){  });

          $(window).on("resize.room", function() {
               var h = $("body").innerHeight() - 50 -
                    $("#input-bar").innerHeight();
               hisPan.css("height", h + 'px');
               originHistoryHeight = h + 'px';
               hisPan.css("min-height", (h - 48) + 'px');
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
          
          input.resize(function() {
               var h = $("body").innerHeight() - 50 -
                    $("#input-bar").innerHeight();
               hisPan.css("height", h + 'px');
          });


          $("#send").off("click").on("click", function() {
               sendMesg(username, socket);
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

          function sendMesg(username, socket) {
               // parse <img src='...' /> as <img src='...' onclick=
               // "window.open(...)" />
               var img = $("#input").find("img");
               for (var k = 0; k < img.length; k++) {
                    var src = img[k].src;
                    img[k].setAttribute("onclick", 'window.open("' + src + '")');
               }
               
               var text = input.html();
               if ("" === text) {
                    return;
               }

               // parse 'http.*' as '<a href="..." target="_blank">...</a>'
               var i = 0,
                    s = 0,
                    j = 0;
               for (i = 0; i < text.length; i++) {
                    if ('<' === text[i]) {
                         s++;
                         continue;
                    };
                    if ('>' === text[i]) {
                         s--;
                         continue;
                    };
                    if (0 === s && "http" === text.substring(i, i + 4)) {
                         text = text + ' ';
                         for (j = i + 4;
                              ' ' !== text[j] && '<' !== text[j] && '>' !== text[j]; j++);

                         var href = '<a href="' + text.substring(i, j) +
                              '" target="_blank">' + text.substring(i, j) +
                              '</a>';
                         text = text.slice(0, i) + href + text.slice(j);
                         i += href.length - 1;
                    }
               }


               var sayContaint = {
                    username: username,
                    text: text
               };

               if ("/img" == text.substring(0, 4)) {
                    sayContaint.text = input.text();
                    if ("url" == text.substring(4, 7)) {
                         sayContaint.src = text.substring(7);
                    }
                    else {
                         $(".expression").css("display", "inline-block");
                    }
               }

               if (username == "") {
                    location.reload();
               }

               // clear input
               input.html("");

               //send  to server
               socket.emit('say', sayContaint);
          }
     } //talking

     // Rewrite mouse right button menu;
     function myMenu() {
          // var menu = $("#myMenu");
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

          // $("body").on('keypress.myMenu', function(e) {
          //      if (27 == (e.keyCode || e.which)) {
          //           menu.css("display", "none");
          //      }
          // });
          // $("body").on("click.myMenu", function() {
          //      menu.css("display", "none");
          // });
     }


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

     function notify(notifyTitle, notifyBody) {
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
                                   notifyTitle, {
                                        body: notifyBody,
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
};
