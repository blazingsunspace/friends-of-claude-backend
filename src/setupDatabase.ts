import mongoose from 'mongoose'

import Logger from 'bunyan'
import { config } from '@src/config'
import { redisConnection } from '@services/redis/redis.connection'

const log: Logger = config.createLogger('database')

export default function () {
	const connect = function () {
		mongoose
			.connect(`${config.DATABASE_URL}`)
			.then(function () {
				log.info('success connected to mongo db')
				redisConnection.connect()
			})
			.catch(function (error) {
				log.error('error connecting to database', error)
				return process.exit(1)
			})
	}
	connect()

	mongoose.connection.on('disconected', connect)
}
