// models/Board.js

var mongoose = require("mongoose");

// Schema
var boardSchema = mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAte: { type: Date },
});

// model & export

var Board = mongoose.model("board", boardSchema);
module.exports = Board;
