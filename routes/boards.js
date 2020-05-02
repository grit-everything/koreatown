var express = require('express');
var router = express.Router();
var Board = require('../models/Board');
var Comment = require('../models/Comment');
var User = require('../models/User');
var util = require('../util');

// Index

// router.get("/", function (req, res) {
//     Board.find({})
//         .populate("author") //@ model.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해 준다. 현재 board의 author에는 user의 id가 입력되어 있는데, 이 값을 통해 실제로 user의 값을 author에 생성하게 된다.
//         .sort("-createdAt")
//         .exec(function (err, boards) {
//             if (err) return res.json(err);
//             res.render("boards/index", { boards: boards });
//         });
// });

router.get('/', async function (req, res) {
  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  var skip = (page - 1) * limit;
  var maxPage = 0;
  var searchQuery = await createSearchQuery(req.query);
  var boards = [];

  if (searchQuery) {
    var count = await Board.countDocuments(searchQuery);
    maxPage = Math.ceil(count / limit);
    boards = await Board.find(searchQuery)
      .populate('author')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  res.render('boards/index', {
    boards: boards,
    currentPage: page,
    maxPage: maxPage,
    limit: limit,
    searchType: req.query.searchType,
    searchText: req.query.searchText,
  });
});

// New
router.get('/new', util.isLoggedin, function (req, res) {
  var board = req.flash('board')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('boards/new', { board: board, errors: errors });
});
// Create
router.post('/', util.isLoggedin, function (req, res) {
  req.body.author = req.user._id;
  Board.create(req.body, (err, board) => {
    if (err) {
      req.flash('board', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/boards/new' + res.locals.getPostQueryString());
    }
    res.redirect('/boards' + res.locals.getPostQueryString(false, { page: 1, searchText: '' }));
  });
});
// Show
router.get('/:id', function (req, res) {
  var commentForm = req.flash('commentForm')[0] || { _id: null, form: {} };
  var commentError = req.flash('commentError')[0] || { _id: null, parentComment: null, errors: {} };

  Promise.all([
    Board.findOne({ _id: req.params.id }).populate({ path: 'author', select: 'nickname' }),
    Comment.find({ board: req.params.id })
      .sort('createdAt')
      .populate({ path: 'author', select: 'nickname' }),
  ])
    .then(([board, comments]) => {
      var commentTrees = util.convertToTrees(comments, '_id', 'parentComment', 'childComments');

      res.render('boards/show', {
        board: board,
        commentTrees: commentTrees,
        commentForm: commentForm,
        commentError: commentError,
      });
    })
    .catch((err) => {
      return res.json(err);
    });
});

//     Board.findOne({ _id: req.params.id })
//         .populate("author")
//         .exec(function (err, board) {
//             if (err) return res.json(err);
//             res.render("boards/show", { board: board });
//         });
// });

// Edit
router.get('/:id/edit', checkPermission, util.isLoggedin, function (req, res) {
  var board = req.flash('board')[0];
  var errors = req.flash('errors')[0] || {};
  if (!board) {
    Board.findOne({ _id: req.params.id }, function (err, board) {
      if (err) return res.json(err);
      res.render('boards/edit', { board: board, errors: errors });
    });
  } else {
    board._id = req.params.id;
    res.render('boards/edit', { board: board, errors: errors });
  }
});

// Update
router.put('/:id', checkPermission, util.isLoggedin, function (req, res) {
  req.body.updatedAt = Date.now();
  Board.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (
    err,
    board
  ) {
    if (err) {
      req.flash('board', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/boards/' + req.params.id + '/edit' + res.locals.getPostQueryString());
    }
    res.redirect('/boards/' + req.params.id + res.locals.getPostQueryString());
  });
});

// Destroy
router.delete('/:id', checkPermission, util.isLoggedin, function (req, res) {
  Board.deleteOne({ _id: req.params.id }, function (err) {
    if (err) return err.json(err);
    res.redirect('/boards');
  });
});

module.exports = router;

// private function
function checkPermission(req, res, next) {
  Board.findOne({ _id: req.params.id }, function (err, board) {
    if (err) return res.json(err);
    if (board.author != req.user.id) return util.noPermission(req.res);

    next();
  });
}

async function createSearchQuery(queries) {
  var searchQuery = {};
  if (queries.searchType && queries.searchText && queries.searchText.length >= 3) {
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    if (searchTypes.indexOf('title') >= 0) {
      postQueries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if (searchTypes.indexOf('body') >= 0) {
      postQueries.push({ body: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if (searchTypes.indexOf('author!') >= 0) {
      var user = await User.findOne({ nickname: queries.searchText }).exec();
      if (user) postQueries.push({ author: user._id });
    } else if (searchTypes.indexOf('author') >= 0) {
      var users = await User.find({
        nickname: { $regex: new RegExp(queries.searchText, 'i') },
      }).exec();
      var userIds = [];
      for (var user of users) {
        userIds.push(user._id);
      }
      if (userIds.length > 0) postQueries.push({ author: { $in: userIds } });
    }
    if (postQueries.length > 0) searchQuery = { $or: postQueries };
    else searchQuery = null;
  }
  return searchQuery;
}
