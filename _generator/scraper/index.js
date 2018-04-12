var fs = require('fs')
var path = require('path')
var pMap = require('p-map-series')
var getPageList = require('./get-page-list.js')
var getComicObject = require('./get-comic-object.js')
var previousComicObjects = require('../tmp/_comic-objects.json')

getPageList()
	.then(function (pageUrls) {
		return pMap(pageUrls, function (pageUrl) {
			var basename = getBasename(pageUrl)
			var previousComicObject = previousComicObjects.find(function (comicObject) {
				return (comicObject && comicObject.basename === basename)
			})

			return getComicObject(pageUrl, previousComicObject)
				.then(function (comicObject) {
					if (!comicObject) return null

					return comicObject
				})
				.catch(function (err) {
					if (err.message === 'Comic no longer exists') return null

					console.error(pageUrl + ' ' + err.message)
				})
		})
	})
	.then(function (comicObjects) {
		writeFile('../tmp/_comic-objects.json', JSON.stringify(comicObjects, null, '\t'))
	})
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}

function getBasename(pageUrl) {
	return pageUrl.split('/')[3].trim()
}
