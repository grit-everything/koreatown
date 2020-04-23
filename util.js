// util.js

var util = {};

util.parseError = function (errors) {
    var parsed = {};
    if (errors.name == "ValidationError") {
        for (var name in errors.errors) {
            var validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
        parsed.username = { message: "이미 사용중인 아이디 입니다!" };
    } else if (errors.code == "11000" && errors.errmsg.indexOf("nickname") > 0) {
        parsed.nickname = { message: "이미 사용중인 별명 입니다!" };
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
};

util.isLoggedin = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("errors", { login: "로그인 후 이용해주세요~!" });
        res.redirect("/login");
    }
};

util.noPermission = function (req, res) {
    req.flash("errors", { login: "접근 권한이 없습니다." });
    req.logout();
    res.redirect("/login");
};

module.exports = util;
