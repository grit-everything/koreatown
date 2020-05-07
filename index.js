var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('./config/passport');
var util = require('./util');

var app = express();

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_DB1);
var db = mongoose.connection;
db.once('open', () => {
  console.log('DB connected');
});
db.on('error', (err) => {
  console.log('DB ERROR : ', err);
});

// settings

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); //@  '현재_위치/public' route를 static폴더로 지정하라는 명령어가 됩니다. 즉 '/'에 접속하면 '현재_위치/public'를, '/css'에 접속하면 '현재_위치/public/css'를 연결해 줍니다.
app.use(bodyParser.json()); //@ bodyParser를 통해 json형식의 데이터를 받는다는 설정
app.use(bodyParser.urlencoded({ extended: true })); //@ 3번은 urlencoded data를 extended 알고리듬을 사용해서 분석한다는 설정입니다. 2번을 설정하면, route의 callback함수(function(req, res, next){...})의 req.body에서 form으로 입력받은 데이터를 사용할 수 있습니다.
//@이 부분이 지금 이해가 안가시면 이렇게 처리를 해 줘야 웹브라우저의 form에 입력한 데이터가 bodyParser를 통해 req.body으로 생성이 된다는 것만 아셔도 괜찮습니다.이 부분이 지금 이해가 안가시면 이렇게 처리를 해 줘야 웹브라우저의 form에 입력한 데이터가 bodyParser를 통해 req.body으로 생성이 된다는 것만 아셔도 괜찮습니다.
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({ secret: 'Mysecret', resave: true, saveUninitialized: true }));

// passport

app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  //@ res.locals 에 한마디로 로컬변수(Local Variables)로 isAuthenticated를 설정하는 표현식이다. 모든 미들웨어와 마찬가지로 어느 페이지에서도 호출이 가능하다. 즉 res.locals."값" 값은 로컬변수로 저장되고, 사용할 수 있다.
  //@ req.isAuthenticated() passport에서 제공하는 함수다. 현재 로그인 되었으면 true 아니면 false를 return한다.
  res.locals.currentUser = req.user;
  res.locals.util = util;
  next();
});

// routes
app.use('/', require('./routes/home'));
app.use('/discount', require('./routes/discount')); //! 할인정보
app.use('/boards', util.getPostQueryString, require('./routes/boards')); //! 자유게시판
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));

app.listen(process.env.PORT || 5000, () => {
  if (process.env.PORT) {
    console.log('server on!!' + process.env.PORT);
  } else {
    console.log('server on!!' + 5000);
  }
});
