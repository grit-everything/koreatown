// mongoose/User.js
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

// Schema

var userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "아이디를 입력해주세요!"],
            match: [/^.{4,12}$/, "Should be 4-12 characters!"],
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "비밀번호를 입력해주세요!"],
            select: false,
        },
        nickname: {
            type: String,
            required: [true, "별명을 입력해주세요!"],
            match: [/^.{4,12}$/, "Should be 4-12 characters!"],
            trim: true,
        },
        email: {
            type: String,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Should be a vaild email address!"],
            trim: true,
        },
    },
    {
        toObject: { virtuals: true },
    }
);

// virtuals
userSchema
    .virtual("passwordConfirmation")
    .get(function () {
        return this._passwordConfirmation;
    })
    .set(function (value) {
        this._passwordConfirmation = value;
    });

userSchema
    .virtual("originalPassword")
    .get(function () {
        return this._originalPassword;
    })
    .set(function (value) {
        this._originalPassword = value;
    });

userSchema
    .virtual("currentPassword")
    .get(function () {
        return this._currentPassword;
    })
    .set(function (value) {
        this._currentPassword = value;
    });

userSchema
    .virtual("newPassword")
    .get(function () {
        return this._newPassword;
    })
    .set(function (value) {
        this._newPassword = value;
    });

//password validation

var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = "알파벳과 숫자를 최소 8자리 이상 입력해주세요!";

userSchema.path("password").validate(function (v) {
    var user = this;

    //create user

    if (user.isNew) {
        if (!user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호를 확인해 주세요!");
        }
        if (!passwordRegex.test(user.password)) {
            user.invalidate("password", passwordRegexErrorMessage);
        }
        if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호가 일치하지 않습니다!");
        }
    }
    //update user

    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate("currentPassword", "Current password is required");
        } else if (!bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
            user.invalidate("currentPassword", "Current Password is invalid");
        }
        if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            user.invalidate("newPassword", passwordRegexErrorMessage);
        }
        if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// hash password
userSchema.pre("save", function (next) {
    var user = this;
    if (!user.isModified("password")) {
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

// model methods
//@ user model의 password hash와 입력받은 password text를 비교하는 method를 추가합니다. 이번 예제에 사용되는 method는 아니고 나중에 로그인을 만들때 될 method인데 bcrypt를 사용하므로 지금 추가해봤습니다
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

//model & export

var User = mongoose.model("user", userSchema);
module.exports = User;
