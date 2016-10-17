var express = require("express");
var mongoose = require("mongoose");
var bp = require("body-parser");
var https = require("https");

var app = express();
var Hist = require("./history").hist;

var searchImages = function(req, res, next) {
    var params = req.params.params.replace(" ", "%20");
    var host = "api.flickr.com";
    var path = "/services/rest/?method=flickr.photos.search&api_key=a4ed5c56a749e0e16646a2583bcd0c7d&format=json&text="+params;
    https.get({host: host, path: path}, (response) => {
        var s = '';
        response.on('data', (chunk) => {
            s+=chunk;
        });
        response.on('end', () => {
            var j = JSON.parse(s.replace("jsonFlickrApi(", "").slice(0, -1));
            if (j.stats === "OK") {
                var base = "https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg";
                var photos = j.photos.photo;
                var toSend = [];
                photos.forEach((v, i) => {
                    toSend.push({
                        url: base
                        .replace("{farm-id}", v.farm)
                        .replace("{server-id}", v.server)
                        .replace("{id}", v.id)
                        .replace("{secret}", v.secret),
                        title: v.title,
                        page: "https://www.flickr.com/photos/"+v.owner
                    });
                });
                req.result = JSON.stringify({photos: toSend});
                next();
            } else {
                req.result = "Error";
            }
        });
        response.on('error', (err) => {
            req.result = err;
            next();
        })
    });
}

app.use(bp.urlencoded({
  extended: true
}));

app.get("/:params",searchImages, (req, res) => {
    return res.send(req.result);
});

app.listen(8080)
