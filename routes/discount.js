var express = require("express");
var router = express.Router();

//Discount

router.get("/", (req, res) => {
    res.render("discount/index");
});

module.exports = router;
