var mongoose = require("mongoose")
var Schema = mongoose.Schema;
var db = mongoose.createConnection("mongodb://127.0.0.1/image");

var histSchema = new Schema({
    "query": String,
    "time": Date
}, {
    versionKey: false
});

var hist = db.model("hist", histSchema);

module.exports.hist = hist;