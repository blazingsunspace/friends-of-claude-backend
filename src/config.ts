
import dotenv from 'dotenv'



import cloudinary from 'cloudinary'


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
	public CLOUDINARY_NAME: string | undefined
	public CLOUDINARY_API_KEY: string | undefined
	public CLOUDINARY_API_SECRET: string | undefined


	private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/chatty-backend'

	constructor() {
		this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL
		this.JWT_TOKEN = process.env.JWT_TOKEN || ''
		this.NODE_ENV = process.env.NODE_ENV || ''
		this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || ''
		this.DATABASE_URL = process.env.DATABASE_URL || ''
		this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || ''
		this.CLIENT_URL = process.env.CLIENT_URL || ''
		this.SERVER_PORT = process.env.SERVER_PORT || ''
		this.REDIS_HOST = process.env.REDIS_HOST || ''
		this.CLOUDINARY_NAME = process.env.CLOUDINARY_NAME || ''
		this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
		this.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''
	}

	public createLogger(name: string): bunyan {



		const d = new Date()
		const date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
		/*
		let bunLevel = bunyan.createLogger({

			name: name
		}).level()

		let levelOfLog

		switch (bunLevel) {
			case 10:
				levelOfLog = '\x1b[1m\x1b[36mtrace\x1b[0m'
				break
			case 20:
				levelOfLog = '\x1b[1m\x1b[33mdebug\x1b[0m'
				break
			case 30:
				levelOfLog = '\x1b[1m\x1b[31minfo\x1b[0m'
				break
			case 40:
				levelOfLog = '\x1b[1m\x1b[33mwarn\x1b[0m'
				break
			case 50:
				levelOfLog = '\x1b[1m\x1b[91merror\x1b[0m'
				break
			case 60:
				levelOfLog = '\x1b[1m\x1b[31mfatal\x1b[0m'
				break

		}

		console.log('Logs from \x1b[100m' + name.toUpperCase() + '\x1b[0m [\x1b[106m' + d.toISOString() + '\x1b[0m] : (' + levelOfLog + ') ' + JSON.stringify(bunyan.createLogger({
			name: name
		}).fields)) */

		return bunyan.createLogger({
			name: name,
			streams: [
				{
					stream: process.stdout            // log INFO and above to stdout
				},
				{
					path: `./src/shared/globals/helpers/logs/logs-${date}.txt`// log ERROR and above to a file
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

	public cloadinaryConfig(): void {
		cloudinary.v2.config({
			cloud_name: this.CLOUDINARY_NAME,
			api_key: this.CLOUDINARY_API_KEY,
			api_secret: this.CLOUDINARY_API_SECRET
		})
	}
}
export const config: Config = new Config()
