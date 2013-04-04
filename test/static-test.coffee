assert = require 'assert'
request = require 'request'
app = require '../server'

describe 'home page', ->
	options =
		uri: "http://localhost:#{app.settings.port}/"
	describe 'GET /', ->
		response = null
		before (done) ->
			request options, (err, _response, _body) ->
				response = _response
				done()
		it "is successful", ->
			assert.match response["statusCode"], "200"

	describe 'correct body', ->
		body = null
		before (done) ->
			request options, (err, _response, _body) ->
				console.log(_body)
				body = _body
				done()
		it "is Hello world", ->
			assert.match body, "Hello world"

