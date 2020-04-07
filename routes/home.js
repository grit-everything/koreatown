var express = require("express");
var router = express.Router();

//Home

router.get("/", (req, res) => {
    res.render("home/welcome");
});

module.exports = router;
