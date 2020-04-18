// mongoose/User.js
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

// Schema

var userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required!"],
            match: [/^.{4,12}$/, "4-12자리 문자입력이 필요합니다!"],
            unique: true,
        },
        password: {
            type: String,
            reuiqred: [true, "Password is required!"],
            select: false,
        },
        nickname: {
            type: String,
            required: [true, "Nickname is required!"],
            match: [/^.{4,12}$/, "4-12자리 문자입력이 필요합니다!"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Email is required!"],
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Should be a vaild email address!"],
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
            user.invalidate("passwordConfirmation", "Password Confirmation is required.");
        }
        if (!passwordRegex.test(user.password)) {
            user.invalidate("password", passwordRegexErrorMessage);
        }
        if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
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

userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

//model & export

var User = mongoose.model("user", userSchema);
module.exports = User;
