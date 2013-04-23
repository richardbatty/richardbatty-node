assert = require 'assert'
should = require 'should'
request = require 'request'
app = require '../app'
databaseUrl = 'mydb'
collections = ['pages']
db = require('mongojs').connect(databaseUrl, collections)
base_uri = "http://localhost:#{app.settings.port}"

describe 'home page', ->
	options =
		uri: base_uri + "/"
	describe 'GET /', ->
		response = null
		before (done) ->
			request options, (err, _response, _body) ->
				response = _response
				done()
		it "is successful", ->
			response.should.have.status(200)

describe 'pages list', ->
  options =
    uri: base_uri + "/pages"
  describe 'GET /pages', ->
    response = null
    before (done) ->
      request options, (err, _response, _body) ->
        response = _response
        done()
    it "is successful", ->
      response.should.have.status(200)

describe 'pages/new', ->
  options =
    uri: base_uri + "/pages/new"
  describe 'GET /pages/new', ->
    response = null
    before (done) ->
      request options, (err, _response, _body) ->
        response = _response
        done()
    it "is successful", ->
      response.should.have.status(200)

describe 'create new page, edit it, and delete it:', ->
  testPageTitle = "test title"
  testPageText = "Test page text"
  testPagePath = "/pages/test-title" # This is a slugified version of the title

  describe 'POST to /pages', ->
    response = null
    options =
      uri: base_uri + "/pages"
      form: {
        pageTitle: testPageTitle,
        pageText: testPageText
      }
    before (done) ->
      request.post options, (err, _response, _body) ->
        response = _response
        done()
    it "is successful", ->
      # Status 302 for the redirect to /pages
      response.should.have.status(302)

  describe 'saving page in database', ->
    docs = null
    err = null
    before (done) ->
      db.pages.find {title: 'test title'}, (_err, _docs) ->
        docs = _docs
        err = _err
        done()
    it "has found the doc with the test title with no errors", ->
      should.not.exist(err)
    it "has recorded at least one record with the test title", ->
      docs.should.not.be.empty
    it "has created a doc with correct title", ->
      docs[0].title.should.equal(testPageTitle)
    it "has created a doc with the correct url", ->
      docs[0].path.should.equal(testPagePath)
    it "has created a doc with the correct text", ->
      docs[0].body.should.equal(testPageText)

  describe "Getting the test page", ->
    options =
      uri: base_uri + testPagePath
    describe 'GET /pages/test-title', ->
      response = null
      body = null
      before (done) ->
        request options, (err, _response, _body) ->
          response = _response
          body = _body
          done()
      it "is successful", ->
        response.should.have.status(200)

  describe "Getting the edit page for the test page", ->
    response = null
    options =
      uri: base_uri + testPagePath + '/edit'
    before (done) ->
      request options, (err, _response, _body) ->
        response = _response
        done()
    it "is successful", ->
      response.should.have.status(200)

  describe "Submitting the edit form", ->
    response = null
    changedPageTitle = 'An edited page'
    changedPageText = 'An edited page text'
    options =
      uri: base_uri + testPagePath
      form: {
        pageTitle: changedPageTitle,
        pageText: changedPageText
      }
    before (done) ->
      request.put options, (err, _response, _body) ->
        response = _response
        done()
    it "is successful", ->
      response.should.have.status(302)
    it "the database contains the updated record", ->
      db.pages.find {title: changedPageTitle}, (err, docs) ->
        docs.should.not.be.empty
    it "the database does not contain the old record", ->
      db.pages.find {title: testPageTitle}, (err, docs) ->
        docs.should.be.empty

  describe "Delete the test page", ->
    response = null
    options =
      uri: base_uri + testPagePath
      method: "DELETE"
    before (done) ->
      request options, (err, _response, _body) ->
        response = _response
        done()
    it "is successful", ->
      # Status 302 for the redirect to /pages
      response.should.have.status(302)
    it "has removed the page from the database", ->
      db.pages.find {path: options.uri}, (err, docs) ->
        docs.should.be.empty




