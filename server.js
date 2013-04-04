var express = require('express');
var app = express();
module.exports = app;

app.configure(function () {
    app.set('port', 3000);
});

app.get('/', function(req, res) {
   var body = "Hello world";
   res.end(body);
});

app.listen(app.settings.port);
console.log("Listening on port" + app.settings.port);