const https = require('https')
const concat = require('simple-concat')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		if (global.VERBOSE) {
			console.log('GET ' + url)
		}
		setTimeout(function () { // Rate limiting, haha
			https.get(url, handleResponse.bind(null, resolve, reject))
		}, global.DEBUG ? 0 : 900) // 800 might work, 700 doesn't
	})
}

function handleResponse(resolve, reject, response) {
	const statusCode = response.statusCode
	const location = response.headers.location

	if (statusCode === 200) {
		concat(response, function (err, buffer) {
			if (err) { reject(err) }
			else { resolve(buffer.toString()) }
		})
	} else if (statusCode >= 300 && statusCode < 400 && location === 'https://www.gocomics.com/') {
		reject(new Error('Comic no longer exists'))
	} else {
		reject(new Error(statusCode + ' error'))
	}
}
