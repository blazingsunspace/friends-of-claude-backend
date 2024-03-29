import Logger from 'bunyan'
import { config } from '@src/config'
import { BaseCache } from '@services/redis/base.cache'

const log: Logger = config.createLogger('redisConnection')

class RedisConnection extends BaseCache {
	constructor() {
		super('redisConnection')
	}

	async connect(): Promise<void> {
		try {
			await this.client.connect()
			const res = await this.client.ping()
			log.info(res)
		} catch (error) {
			log.error(error)
		}
	}
}

export const redisConnection: RedisConnection = new RedisConnection()
