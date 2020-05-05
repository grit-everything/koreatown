var mongoose = require('mongoose');

// schema

var counterSchema = mongoose.Schema({
  name: { type: String, require: true },
  count: { type: Number, dafault: 0 },
});

// model & export

var Counter = mongoose.model('counter', counterSchema);
module.exports = Counter;
