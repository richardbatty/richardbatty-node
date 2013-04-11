var express = require('express')
  , lessMiddleware = require('less-middleware')
  , databaseUrl = 'mydb'
  , collections = ['pages']
  , db = require('mongojs').connect(databaseUrl, collections);


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
    app.use(express.bodyParser());
    app.use(lessMiddleware({
      src      : __dirname + "/public",
      compress : true
    }));
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
   res.render('page', 
    { title: 'Home',
      body: 'This is the body'}
   );
});

app.get('/pages', function(req, res) {
  res.render('pages',
    { title: 'Pages editor' });
})

function setUrlListeners(docs) {
  docs.forEach(function (doc) {
    app.get(doc.path, function(req, res) {
      res.render('page', {
        title: doc.title,
        body: doc.body
      });
    });
  })
};

app.post('/page', function(req, res) {
  var title = req.body.pageTitle
    , body  = req.body.pageText
    , path  = req.body.path
    , reqBody = JSON.stringify(req.body);
  console.log("Request body is: " + reqBody);
  db.pages.save({title: title, path: path, body: body}, function(err, saved) {
    if (err || !saved) console.log("Page not saved! Error: " + err);
    else {
      console.log("Page saved");
      db.pages.find(function(err, docs) {
        // Note that this might cause redundant listeners to be created
        // since it is called on all docs every time a new doc is saved
        setUrlListeners(docs);
      });
    }
  });
  res.end();
});

//db.pages.remove();

//db.pages.save({title: "Home", body: "Hello, this is my homepage"}, function(err, saved){
//  if (err || !saved) console.log("Page not saved");
//  else console.log("Page saved");
//});

app.listen(app.settings.port);
console.log("Listening on port" + app.settings.port);