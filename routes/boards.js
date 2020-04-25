var express = require("express");
var router = express.Router();
var Board = require("../models/Board");
var util = require("../util");

// // Index
// router.get("/", function (req, res) {
//     Board.find({})
//         .populate("author") //@ model.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해 준다. 현재 board의 author에는 user의 id가 입력되어 있는데, 이 값을 통해 실제로 user의 값을 author에 생성하게 된다.
//         .sort("-createdAt")
//         .exec(function (err, boards) {
//             if (err) return res.json(err);
//             res.render("boards/index", { boards: boards });
//         });
// });

router.get("/", async function (req, res) {
    var page = Math.max(1, parseInt(req.query.page));
    var limit = Math.max(1, parseInt(req.query.limit));
    page = !isNaN(page) ? page : 1;
    limit = !isNaN(limit) ? limit : 10;

    var skip = (page - 1) * limit;
    var count = await Board.countDocuments({});
    var maxPage = Math.ceil(count / limit);
    var boards = await Board.find({}).populate("author").sort("-createdAt").skip(skip).limit(limit).exec();

    res.render("boards/index", {
        boards: boards,
        currentPage: page,
        maxPage: maxPage,
        limit: limit,
    });
});

// New
router.get("/new", util.isLoggedin, function (req, res) {
    var board = req.flash("board")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("boards/new", { board: board, errors: errors });
});
// Create
router.post("/", util.isLoggedin, function (req, res) {
    req.body.author = req.user._id;
    Board.create(req.body, (err, board) => {
        if (err) {
            req.flash("board", req.body);
            req.flash("errors", util.parseError(err));
            res.redirect("/boards/new");
        }
        res.redirect("/boards");
    });
});
// Show
router.get("/:id", function (req, res) {
    Board.findOne({ _id: req.params.id })
        .populate("author")
        .exec(function (err, board) {
            if (err) return res.json(err);
            res.render("boards/show", { board: board });
        });
});

// Edit
router.get("/:id/edit", checkPermission, util.isLoggedin, function (req, res) {
    var board = req.flash("board")[0];
    var errors = req.flash("errors")[0] || {};
    if (!board) {
        Board.findOne({ _id: req.params.id }, function (err, board) {
            if (err) return res.json(err);
            res.render("boards/edit", { board: board, errors: errors });
        });
    } else {
        board._id = req.params.id;
        res.render("boards/edit", { board: board, errors: errors });
    }
});

// Update
router.put("/:id", checkPermission, util.isLoggedin, function (req, res) {
    req.body.updatedAt = Date.now();
    Board.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, board) {
        if (err) {
            req.flash("board", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/boards/" + req.params.id + "/edit");
        }
        res.redirect("/boards/" + req.params.id);
    });
});

// Destroy
router.delete("/:id", checkPermission, util.isLoggedin, function (req, res) {
    Board.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return err.json(err);
        res.redirect("/boards");
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
