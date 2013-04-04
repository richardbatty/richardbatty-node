var express = require('express')
  , stylus  = require('stylus')
  , nib     = require('nib')
  , jade    = require('jade');


var app = express();
module.exports = app;

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}
app.configure(function () {
    app.set('port', 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(stylus.middleware({
        src: __dirname,
        force: true,
        compile: compile
    }));
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
   var body = "Hello world";
   res.render('index', 
    { title: 'Home'}
   );
});

app.listen(app.settings.port);
console.log("Listening on port" + app.settings.port);