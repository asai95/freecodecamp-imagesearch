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
    var q = req.query.offset || 0;
    https.get({host: host, path: path}, (response) => {
        var s = '';
        response.on('data', (chunk) => {
            s+=chunk;
        });
        response.on('end', () => {
            var j = JSON.parse(s.replace("jsonFlickrApi(", "").slice(0, -1));
            if (j.stat === "ok") {
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
                toSend = toSend.slice(Number.parseInt(q), 10 + Number.parseInt(q));
                req.result = JSON.stringify({photos: toSend});
                next();
            } else {
                req.result = "Error";
                next();
            }
        });
        response.on('error', (err) => {
            req.result = err;
            next();
        })
    }).end();
}

var saveQuery = function(req, res, next) {
    var hist = new Hist({
        query: req.params.params,
        time: Date.now()
    });
    hist.save(() => { next() })
}

app.use(bp.urlencoded({
  extended: true
}));

app.get("/latest", (req, res) => {
    var q = req.query.offset || 0;
    Hist.find({}, '-_id', (err, response) => {
        var answ = response
        .sort((a, b) => {
            return (b.time - a.time)
        })
        .slice(Number.parseInt(q), 10 + Number.parseInt(q));
        res.send(answ);
    });
});

app.get("/search/:params", searchImages, saveQuery, (req, res) => {
    res.send(req.result);
});

app.get("*", (req, res) => {
    res.send(
        "How to use:\nGET /search/query to search images;\nGET /latest to view latest searches;\nEach root supports ?offset=n option."
        );
});

app.listen(process.env.PORT);
