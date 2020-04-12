var express = require("express");
var router = express.Router();
var Board = require("../models/Board");

// Index
router.get("/", (req, res) => {
    Board.find({})
        .sort("-createdAt")
        .exec((err, boards) => {
            if (err) return res.json(err);
            res.render("boards/index");
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

// Edit

// Update

// Destroy

module.exports = router;
