// models/Board.js

var mongoose = require("mongoose");

// Schema
var boardSchema = mongoose.Schema({
    title: { type: String, required: [true, "제목을 입력해 주세요!"] },
    body: { type: String, required: [true, "내용을 입력해 주세요!"] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", require: true }, //! ref:'user'를 통해  type 값을 user와 board 간 연결할 수 있다.
    createdAt: { type: Date, default: Date.now },
    updatedAte: { type: Date },
});

// model & export

var Board = mongoose.model("board", boardSchema);
module.exports = Board;
