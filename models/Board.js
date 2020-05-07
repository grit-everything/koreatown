var mongoose = require('mongoose');
var Counter = require('./Counter');

// Schema
var boardSchema = mongoose.Schema({
  title: { type: String, required: [true, '제목을 입력해 주세요!'] },
  body: { type: String, required: [true, '내용을 입력해 주세요!'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', require: true },
  views: { type: Number, default: 0 },
  numId: { type: Number },
  attachment: { type: mongoose.Schema.ObjectId, ref: 'file' },
  createdAt: { type: Date, default: Date.now },
  updatedAte: { type: Date },
});

boardSchema.pre('save', async function (next) {
  var board = this;
  if (board.isNew) {
    counter = await Counter.findOne({ name: 'boards' }).exec();
    if (!counter) counter = await Counter.create({ name: 'boards' });
    counter.count++;
    counter.save();
    board.numId = counter.count;
  }
  return next();
});

// model & export

var Board = mongoose.model('board', boardSchema);
module.exports = Board;
