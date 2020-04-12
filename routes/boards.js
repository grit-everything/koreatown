var express = require("express");
var router = express.Router();
var Board = require("../models/Board");

// Index
router.get("/", (req, res) => {
    Board.find({})
        .sort("-createdAt")
        .exec((err, boards) => {
            if (err) return res.json(err);
            res.render("boards/index", { boards: boards });
        });
});

// New
router.get("/new", (req, res) => {
    res.render("boards/new");
});
// Create
router.post("/", (req, res) => {
    Board.create(req.body, (err, board) => {
        if (err) return res.json(err);
        res.redirect("/boards");
    });
});
// Show
router.get("/:id", (req, res) => {
    Board.findOne({ _id: req.params.id }, (err, board) => {
        if (err) return res.json(err);
        res.render("boards/show", { board: board });
    });
});

// Edit
router.get("/:id/edit", (req, res) => {
    Board.findOne({ _id: req.params.id }, (err, board) => {
        if (err) return res.json(err);
        res.render("boards/edit", { board: board });
    });
});

// Update
router.put("/:id", (req, res) => {
    req.body.updatedAt = Date.now();
    Board.findOneAndUpdate({ _id: req.params.id }, req.body, (err, board) => {
        if (err) return res.json(err);
        res.redirect("/boards");
    });
});

// Destroy
router.delete("/:id", (req, res) => {
    Board.deleteOne({ _id: req.params.id }, (err) => {
        if (err) return err.json(err);
        res.redirect("/boards");
    });
});

module.exports = router;
