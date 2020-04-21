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

module.exports = util;
