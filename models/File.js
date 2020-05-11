var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
// schema

var fileSchema = mongoose.Schema({
  originalFileName: { type: String },
  serverFileName: { type: String },
  size: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', require: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'board' },
  isDeleted: { type: Boolean, default: false },
});

// instance methods
fileSchema.methods.processDelete = function () {
  this.isDeleted = true;
  this.save();
};
fileSchema.methods.getFileStream = function () {
  var stream;
  var filePath = path.join(__dirname, '..', 'uploadedFiles', this.serverFileName);
  var fileExists = fs.existsSync(filePath);
  if (fileExists) {
    stream = fs.createReadStream(filePath);
  } else {
    this.processDelete();
  }
  return stream;
};

// model & export

var File = mongoose.model('file', fileSchema);

// model methods
//@ file document를 프로그래밍으로 조작할 수 있게 오브젝트로 만든 것이다. SQL static class와 같은 개념이다.
File.createNewInstance = async function (file, uploadedBy, boardId) {
  return await File.create({
    originalFileName: file.originalname,
    serverFileName: file.filename,
    size: file.size,
    uploadedBy: uploadedBy,
    boardId: boardId,
  });
};

module.exports = File;
