import express from 'express'

import { FriendsOfClaudeServer } from '@src/setupServer'

import databaseConnection from '@src/setupDatabase'

/* import sentryConnection from '@src/sentryConnection' */

import { config } from '@src/config'

class Application {
	public initialize(): void {
		this.loadConfig()

		databaseConnection()

		const app: express.Application = express()

		const server: FriendsOfClaudeServer = new FriendsOfClaudeServer(app)

		server.start()
	}

	private loadConfig(): void {
		config.validateConfig()
		config.cloadinaryConfig()
	}
}

const application: Application = new Application()

application.initialize()
