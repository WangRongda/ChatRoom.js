'use strict';

function getExpress(keyword) {
    var cheerio = require('cheerio'),
        $;

    var https = require("http");
    var url = "http://www.ubiaoqing.com";
    var options = {
        host: "www.ubiaoqing.com",
        path: "/search/qq",
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

    var src = [];
    var req = https.request(options, function(res) {
        var i = 0;
        res.on("data", function(data) {
            $ = cheerio.load(data);
            var imgObj = $("img.img-responsive.center-block");
            // console.log(imgObj);
            // while (imgObj[i]) {
            for (i = 0;i < 10; i++) {
                // if (imgObj[i].attribs.src) {
                // console.log(imgObj[i].attribs.src);
                // }
                var s = imgObj[i].attribs.src;
                if (s) {
                    src[i] = s; 
                }
            }
            // console.log(i);
        });
    }).on('error', function(err) {
        console.log('error ' + err);
    });

    // req.write("");
    req.end();
    return src;
}
