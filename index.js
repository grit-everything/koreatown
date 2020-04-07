var express = require("express");
var app = express();

// settings

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// routes
app.use("/", require("./routes/home"));

app.listen(process.env.PORT || 3000, () => {
    console.log("server on!!" + process.env.PORT);
});
