// routes

var express = require("express");
var router = express.Router();
var User = require("../models/User");

// Index

router.get("/", function (req, res) {
    User.find({})
        .sort({ username: 1 })
        .exec(function (err, users) {
            if (err) return res.json(err);
            res.render("users/index", { users: users });
        });
});

// New
router.get("/new", function (req, res) {
    var user = req.flash("user")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("users/new", { user: user, errors: errors });
});

// Create

router.post("/", function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) {
            req.flash("user", req.body);
            req.flash("errors", parseError(err));
            return res.redirect("/users/new");
        }
        res.redirect("/users");
    });
});

// Show

router.get("/:username", function (req, res) {
    User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/show", { user: user });
    });
});

// Edit

router.get("/:username/edit", function (req, res) {
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if (!user) {
        User.findOne({ username: req.params.username }, function (err, user) {
            if (err) return res.json(err);
            res.render("users/edit", { username: req.params.username, user: user, errors: errors });
        });
    } else {
        res.render("users/edit", { username: req.params.username, user: user, errors: errors });
    }
});

// Update

//@Model.findOne은 DB에서 해당 model의 document를 하나 찾는 함수입니다. 첫번째 parameter로 찾을 조건을 object로 입력하고 data를 찾은 후 콜백 함수를 호출합니다. Model.find와 비교해서 Model.find는 조건에 맞는 결과를 모두 찾아 array로 전달하는데 비해 Model.findOne은 조건에 맞는 결과를 하나 찾아 object로 전달합니다. (검색 결과가 없다면 null이 전달됩니다.) 위 경우에는 {_id:req.params.id}를 조건으로 전달하고 있는데, 즉 DB의 contacts collection에서 _id가 req.params.id와 일치하는 data를 찾는 조건입니다.
router.put("/:username", function (req, res, next) {
    User.findOne({ username: req.params.username })
        .select("password")
        .exec(function (err, user) {
            if (err) return res.json(err);

            //update user object //! --------------------------------------다시 이해하기.
            user.originalPassword = user.password;
            user.password = req.body.newPassword ? req.body.newPassword : user.password;
            for (var p in req.body) {
                user[p] = req.body[p];
            } //!-------------------------------------------------------------------------

            // save updated user
            user.save(function (err, user) {
                if (err) return res.json(err);
                res.redirect("/users/" + user.username);
            });
        });
});

// destroy
router.delete("/:username", function (req, res) {
    User.deleteOne({ username: req.params.username }, function (err) {
        if (err) return res.json(err);
        res.redirect("/users");
    });
});

module.exports = router;

function parseError(errors) {
    var parsed = {};
    if (errors.name == "ValidationError") {
        for (var name in errors.errors) {
            var validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
        parsed.username = { message: "This username already exists!" };
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
}
