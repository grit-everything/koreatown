var mongoose = require('mongoose');

// schema

var fileSchema = mongoose.Schema({
  originalFilenName: { type: String },
  serverFileName: { type: String },
  size: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', require: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'board' },
  isDeleted: { type: Boolean, default: false },
});

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
