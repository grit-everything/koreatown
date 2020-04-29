// routes/comments.js

var express = require('express');
var router = express.Router();
var Comment = require('../models/Comment');
var Board = require('../models/Board');
var util = require('../util');

// create

router.post('/', util.isLoggedin, checkBoardId, function (req, res) {
    var board = res.locals.board;

    req.body.author = req.user._id;
    req.body.board = board._id; //@ _id는 고유 식별문자인데 이것은 내가 만드는 것이 아니라는 걸 표기하기 위해 _ 를 추가한 것이 아닐까? 뇌피셜임

    Comment.create(req.body, function (err, comment) {
        if (err) {
            req.flash('commentForm', { _id: null, form: req.body });
            req.flash('commentError', { _id: null, errors: util.parseError(err) });
        }
        return res.redirect('/boards/' + board._id + res.locals.getPostQueryString());
    });
});

// update
router.put('/:id', util.isLoggedin, checkPermission, checkBoardId, function (req, res) {
    var board = res.locals.board;

    req.body.updatedAt = Date.now();
    Comment.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, comment) {
        if (err) {
            req.flash('commentForm', { _id: req.params.id, form: req.body });
            req.flash('commentError', { _id: req.params.id, errors: util.parseError(err) });
        }
        return res.redirect('/boards/' + board._id + res.locals.getPostQueryString());
    });
});

// destroy

router.delete('/:id', util.isLoggedin, checkPermission, checkBoardId, function (req, res) {
    var board = res.locals.board;

    Comment.findOne({ _id: req.params.id }, function (err, comment) {
        if (err) return res.json(err);

        // save updated comment
        comment.isDeleted = true;
        comment.save(function (err, comment) {
            if (err) return res.json(err);

            return res.redirect('/boards/' + board._id + res.locals.getPostQueryString());
        });
    });
});

module.exports = router;

// private functions

function checkPermission(req, res, next) {
    Comment.findOne({ _id: req.params.id }, function (err, comment) {
        if (err) return res.json(err);
        if (comment.author != req.user.id) return util.noPermission(req, res);
        next();
    });
}

function checkBoardId(req, res, next) {
    Board.findOne({ _id: req.query.boardId }, function (err, board) {
        if (err) return res.json(err);

        res.locals.board = board;
        next();
    });
}
