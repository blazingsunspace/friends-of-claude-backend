import dotenv from 'dotenv'

import cloudinary from 'cloudinary'

import bunyan from 'bunyan'

dotenv.config({})

interface constants {
	userRoles: userRoles
}

interface userRoles {
	user: number
	shopUser: number
	videoContributor: number
	admin: number
	superAdmin: number
}

const constants: constants = {
	userRoles: {
		user: 1,
		shopUser: 2,
		videoContributor: 3,
		admin: 4,
		superAdmin: 5
	}
}

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
	public SENDER_EMAIL: string | undefined
	public SENDER_EMAIL_PASSWORD: string | undefined
	public SENDGRID_API_KEY: string | undefined
	public SENDGRID_SENDER: string | undefined

	public CONSTANTS: constants

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
		this.SENDER_EMAIL = process.env.SENDER_EMAIL || ''
		this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || ''
		this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
		this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || ''

		this.CONSTANTS = constants
	}

	public createLogger(name: string): bunyan {
		const d = new Date()
		const date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()

		return bunyan.createLogger({
			name: name,
			streams: [
				{
					stream: process.stdout // log INFO and above to stdout
				},
				{
					path: `./src/shared/globals/helpers/logs/logs-${date}.txt` // log ERROR and above to a file
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
