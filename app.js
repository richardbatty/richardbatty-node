var express = require('express')
  , lessMiddleware = require('less-middleware')
  , databaseUrl = 'mydb'
  , collections = ['pages']
  , db = require('mongojs').connect(databaseUrl, collections)
  , md = require('node-markdown').Markdown
  , slug = require('slug')
  , requestModule = require('request');

var app = express();



app.configure(function () {
    app.set('port', 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    // To simulate full restful HTTP support in HTML forms.
    // See http://stackoverflow.com/questions/8378338/what-does-connect-js-methodoverride-do
    // for explanation
    app.use(express.methodOverride());
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

function renderPagesList(req, res) {
  db.pages.find(function(err, docs){
    res.render('pages', {
      title: 'Pages',
      docs: docs
    });
  });
}


app.get('/pages', function(req, res) {
  renderPagesList(req, res);
})

app.get('/pages/new', function(req, res) {
  res.render('new',
    { title: 'New page'});
})

app.get('/pages/:path', function(req, res) {
  console.log(req.params.path);
  db.pages.find({path: '/pages/' + req.params.path}, function(err, docs) {
    res.render('page', {
      title: docs[0].title,
      body: docs[0].body,
      md: md
    });
  });
});

app.get('/pages/:path/edit', function(req, res) {
  db.pages.find({path: '/pages/' + req.params.path}, function(err, docs) {
    res.render('edit', {
      title: docs[0].title,
      body: docs[0].body,
      md: md,
      doc: docs[0]
    });
  });
});

app.put('/pages/:path', function(req, res) {
  var title = req.body.pageTitle
    , body = req.body.pageText
    , path = '/pages/' + slug(title)
    , modifyOptions = {
        query: { path: '/pages/' + req.params.path },
        update: { $set: 
          { title: title,
            body: body,
            path: path
          }
        },
        new: true
      };
  db.pages.findAndModify(modifyOptions, function(err, doc) {
    // doc.tag === 'maintainer'
    console.log("The modified doc: ");
    console.log(doc);
    res.redirect('/pages');
  });
})

app.delete('/pages/:path', function(req, res) {
  db.pages.find({path: '/pages/' + req.params.path}, function(err, docs) {
    db.pages.remove(docs[0], function(err, numberOfRemovedDocs) {
      console.log(numberOfRemovedDocs + ' pages were removed');
      res.redirect('/pages');
    });
  });
});

app.post('/pages', function(req, res) {
  var title = req.body.pageTitle
    , body  = req.body.pageText
    , path  = '/pages/' + slug(title)
    , reqBody = JSON.stringify(req.body)
    , pageDoc = {title: title, path: path, body: body};
  db.pages.save(pageDoc, function(err, saved) {
    if (err || !saved) console.log("Page not saved! Error: " + err);
    else {
      console.log("Page saved");
      res.redirect('/pages');
    }
  });
});




//db.pages.remove();

//db.pages.save({title: "Home", body: "Hello, this is my homepage"}, function(err, saved){
//  if (err || !saved) console.log("Page not saved");
//  else console.log("Page saved");
//});

app.listen(app.settings.port);
console.log("Listening on port " + app.settings.port);

module.exports = app;