'use strict'

import { readdirSync, openSync, fstatSync } from 'fs'
import { join } from 'path'
import { lookup } from 'mime-types'

function getFiles(baseDir) {
	const files = new Map()

	readdirSync(baseDir).forEach((fileName) => {
		const filePath = join(baseDir, fileName)
		const fileDescriptor = openSync(filePath, 'r')
		const stat = fstatSync(fileDescriptor)
		const contentType = lookup(filePath)

		files.set(`/${fileName}`, {
			fileDescriptor,
			headers: {
				'content-length': stat.size,
				'last-modified': stat.mtime.toUTCString(),
				'content-type': contentType
			}
		})
	})

	return files
}

export default {
	getFiles
}
