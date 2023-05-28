import { createAdapter } from '@socket.io/redis-adapter'
import dotenv from 'dotenv'

import bunyan from 'bunyan'

dotenv.config({})

class Config {
	public DATABASE_URL: string | ''
	public JWT_TOKEN: string | ''
	public SERVER_PORT: string | undefined
	public NODE_ENV: string | undefined
	public SECRET_KEY_ONE: string | undefined
	public SECRET_KEY_TWO: string | undefined
	public CLIENT_URL: string | undefined
	public REDIS_HOST: string | undefined
	private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/chatty-backend'

	constructor() {
		this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL
		this.JWT_TOKEN = process.env.JWT_TOKEN || '12345'
		this.NODE_ENV = process.env.NODE_ENV || ''
		this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || ''
		this.DATABASE_URL = process.env.DATABASE_URL || ''
		this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || ''
		this.CLIENT_URL = process.env.CLIENT_URL || ''
		this.SERVER_PORT = process.env.SERVER_PORT || ''
		this.REDIS_HOST = process.env.REDIS_HOST || ''
	}

	public createLogger(name: string): bunyan {
		return bunyan.createLogger({
			name,
			streams: [
				{
					path: './src/features/shared/globals/helpers/logs/errors.txt' // log ERROR and above to a file
				}
			]
		})
	}

	public validateConfig(): void {
		for (const [key, value] of Object.entries(this)) {
			if (value === undefined) {
				throw new Error(`configuration error ${key} is undefined`)
			}
		}
	}
}
export const config: Config = new Config()
