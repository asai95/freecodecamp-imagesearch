var mongoose = require("mongoose")
var Schema = mongoose.Schema;
var db = mongoose.createConnection("mongodb://127.0.0.1/imagesearch");

var histSchema = new Schema({
    "query": String,
    "time": Date
});

var hist = db.model("hist", histSchema);

module.exports.hist = hist;