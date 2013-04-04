assert = require 'assert'
request = require 'request'
app = require '../app'

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

