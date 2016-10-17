var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var db = mongoose.createConnection(process.env.MONGODB_URI);

var histSchema = new Schema({
    "query": String,
    "time": Date
}, {
    versionKey: false
});

var hist = db.model("hist", histSchema);

module.exports.hist = hist;