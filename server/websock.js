'use strict';
//服务器及页面响应部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname + '/../client/'));
server.listen(5150);

// socket部分
var connectionList = {};

io.sockets.on('connection', function(socket) {
    //客户端连接时，保存socketId和用户名
    var socketId = socket.id;
    // console.log(socket);
    connectionList[socketId] = {
        // socket: socket
    };

    //用户进入聊天室事件，向其他在线用户广播其用户名
    socket.on('join', function(data) {
        var date = new Date(),
            hour = (8 + date.getHours()) % 24,
            minutes = date.getMinutes();
        hour = hour < 10 ? '0' + hour : hour;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        data.time = hour + ":" + minutes;

        io.emit('broadcast_join', data);
        connectionList[socketId].username = data.username;
        console.log("+ " + data.username + " join " + data.time);
    });

    // 广播重连
    socket.on('reco', function(data) {
        var date = new Date(),
            hour = (8 + date.getHours()) % 24,
            minutes = date.getMinutes();
        hour = hour < 10 ? '0' + hour : hour;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        data.time = hour + ":" + minutes;

        if (!connectionList[socketId].username) {
            connectionList[socketId].username = data.username;
        }
        io.emit('broadcast_reconnect', data);
        console.log("+ " + data.username + " reconnect at " + data.time);
    });

    socket.on('sendExpression', function(data) {
        var date = new Date(),
            hour = (8 + date.getHours()) % 24,
            minutes = date.getMinutes();
        hour = hour < 10 ? '0' + hour : hour;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        data.time = hour + ":" + minutes;

        io.emit('broadcast_say', data);
        console.log(data.username + ": " + data.text);
    });

    //用户离开聊天室事件，向其他在线用户广播其离开
    socket.on('disconnect', function() {
        var date = new Date(),
            hour = (8 + date.getHours()) % 24,
            minutes = date.getMinutes();
        hour = hour < 10 ? '0' + hour : hour;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var time = hour + ":" + minutes;

        if (connectionList[socketId].username) {
            io.emit('broadcast_quit', {
                username: connectionList[socketId].username,
                time: time
            });
            console.log("- " + connectionList[socketId].username + " leave " + time);
        }
        delete connectionList[socketId];
    });

    //用户发言事件，向其他在线用户广播其发言内容
    socket.on('say', function(data) {
        var date = new Date(),
            hour = (8 + date.getHours()) % 24,
            minutes = date.getMinutes();
        hour = hour < 10 ? '0' + hour : hour;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var time = hour + ":" + minutes;

        if (!data.username) {
            return;
        }
        if (!connectionList[socketId].username) {
            connectionList[socketId].username = data.username;
        }

        if ('/img' === data.text.substring(0, 4)) {
            if ('url' === data.text.substring(4, 7)) {
                io.emit('broadcast_expression', data);
                console.log(data.username + ": " + data.src);
                return ;
            }
            // var keyword = require("querystring").stringify(data.text.substring(4));
            var keyword = encodeURIComponent(data.text.substring(4));
            // console.log("keyword" + keyword);
            getExpress(keyword, socket);
        }
        else {
            io.emit('broadcast_say', {
                // username: connectionList[socketId].username,
                username: data.username,
                text: data.text,
                time: time
            });
        }
        console.log(time + " " + connectionList[socketId].username + ": " + data.text);
    });

}); //io.sockets.on

function getExpress(keyword, socket) {
    var cheerio = require('cheerio'),
        $;
    var https = require("http");
    var url = "http://www.ubiaoqing.com";
    var options = {
        host: "www.ubiaoqing.com",
        path: "/search/" + keyword,
        // path: "/",
        method: "GET",
        headers: {
            // "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
            // "Content-Length": data.length,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Cache-Control": "no-cache",
            "Connection": "Keep-Alive",
            "Host": "www.ubiaoqing.com",
            "Referer": url,
            "Origin": url,
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0"
        }
    };

    var req = https.request(options, function(res) {
        var i = 0;
        var arr = [];
        res.on("data", function(data) {
            arr.push(data);
        });
        res.on("end", function() {
            var data = Buffer.concat(arr).toString();
            $ = cheerio.load(data);
            var imgObj = $("img.img-responsive.center-block");
            var imgContain = "";
            for (i = 0; i < 10; i++) {
                try {
                    var s = imgObj[i].attribs.src;
                }
                catch (e) {
                    console.log(e.message);
                    continue;
                }
                imgContain += '<div><img src="' + s + '" /></div>';
            }
            // console.log(imgContain);
            // console.log(k++);
            socket.emit("expression", {
                expression: imgContain
            });

        }).on('error', function(err) {
            console.log('error ' + err);
        });
    });
    req.end();
}
