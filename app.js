var express = require('express')
  , lessMiddleware = require('less-middleware')
  , databaseUrl = 'mydb'
  , collections = ['pages']
  , db = require('mongojs').connect(databaseUrl, collections)
  , md = require('node-markdown').Markdown;


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
      body: 'This is the body',
      md: md
    }
   );
});

app.get('/pages', function(req, res) {
  db.pages.find(function(err, docs) {
    console.log(JSON.stringify(docs));
    res.render('pages',
      { title: 'Pages editor', 
        docs: docs });
  });
  // Remember the asynchronous nature of this, you can't assume
  // res.render happens after db.pages.find has finished

})

app.get('/pages/new', function(req, res) {
  res.render('new',
    { title: 'New'});
})

function setUrlListeners(docs) {
  console.log(md('#hello'));
  docs.forEach(function (doc) {
    app.get(doc.path, function(req, res) {
      res.render('page', {
        title: doc.title,
        body: doc.body,
        md: md
      });
    });
  })
};

app.post('/page', function(req, res) {
  var title = req.body.pageTitle
    , body  = req.body.pageText
    , path  = req.body.path
    , reqBody = JSON.stringify(req.body)
    , pageDoc = {title: title, path: path, body: body};
  console.log("Request body is: " + reqBody);
  db.pages.save(pageDoc, function(err, saved) {
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