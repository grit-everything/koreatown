var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

var app = express();

// DB setting
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGO_DB1);
var db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");
});
db.on("error", (err) => {
    console.log("DB ERROR : ", err);
});

// settings

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); //@  '현재_위치/public' route를 static폴더로 지정하라는 명령어가 됩니다. 즉 '/'에 접속하면 '현재_위치/public'를, '/css'에 접속하면 '현재_위치/public/css'를 연결해 줍니다.
app.use(bodyParser.json()); //@ bodyParser를 통해 json형식의 데이터를 받는다는 설정
app.use(bodyParser.urlencoded({ extended: true })); //@ 3번은 urlencoded data를 extended 알고리듬을 사용해서 분석한다는 설정입니다. 2번을 설정하면, route의 callback함수(function(req, res, next){...})의 req.body에서 form으로 입력받은 데이터를 사용할 수 있습니다.
//@이 부분이 지금 이해가 안가시면 이렇게 처리를 해 줘야 웹브라우저의 form에 입력한 데이터가 bodyParser를 통해 req.body으로 생성이 된다는 것만 아셔도 괜찮습니다.이 부분이 지금 이해가 안가시면 이렇게 처리를 해 줘야 웹브라우저의 form에 입력한 데이터가 bodyParser를 통해 req.body으로 생성이 된다는 것만 아셔도 괜찮습니다.
app.use(methodOverride("_method"));

// routes
app.use("/", require("./routes/home"));
app.use("/discount", require("./routes/discount"));
app.use("/boards", require("./routes/boards"));

app.listen(process.env.PORT || 3000, () => {
    if (process.env.PORT) {
        console.log("server on!!" + process.env.PORT);
    } else {
        console.log("server on!!" + 3000);
    }
});
