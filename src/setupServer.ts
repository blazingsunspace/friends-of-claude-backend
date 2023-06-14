import { Application, json, urlencoded, Response, Request, NextFunction } from 'express'

import { readFileSync } from 'fs'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import compression from 'compression'
import cookieSession from 'cookie-session'
import HTTP_STATUS from 'http-status-codes'

import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

import Logger from 'bunyan'

import 'express-async-errors'

import { config } from '@src/config'

import { ApplicationRoutes } from '@src/routes'
import { CustomError, IErrorResponse } from '@globals/helpers/error-handler'
import spdy from 'spdy'
import path from 'path'

const SERVER_PORT = config.SERVER_PORT
const log: Logger = config.createLogger('server')
import bodyParser from 'body-parser'

const options = {
	key: readFileSync(path.join(__dirname + './../host.key')),
	cert: readFileSync(path.join(__dirname + './../host.cert')),
	allowHTTP1: true
}

export class ChattyServer {
	private app: Application

	constructor(app: Application) {
		this.app = app
	}

	public start(): void {
		this.securityMiddleware(this.app)
		this.standardMiddleware(this.app)
		this.routeMiddleware(this.app)
		this.globalErrorHandler(this.app)
		this.startServer(this.app)
	}

	private securityMiddleware(app: Application): void {
		app.use(
			cookieSession({
				name: 'session',
				keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
				maxAge: 2 * 60 * 60 * 1000,
				secure: config.NODE_ENV !== 'development'
			})
		)
		app.set('trust proxy', true)
		app.use(hpp())
		app.use(helmet())
		app.use(
			bodyParser.json({
				type: '*/*'
			})
		)
		app.use(
			cors({
				origin: '*' /* config.CLIENT_URL */,
				credentials: true,
				optionsSuccessStatus: 200,
				methods: ['GET', 'PUT', 'INSERT', 'POST', 'DELETE', 'OPTIONS']
			})
		)
	}
	private standardMiddleware(app: Application): void {
		app.use(compression())
		app.use(json({ limit: '50mb' }))
		app.use(urlencoded({ extended: true, limit: '50mb' }))
	}
	private routeMiddleware(app: Application): void {
		new ApplicationRoutes(app)
	}

	private globalErrorHandler(app: Application): void {
		app.all('*', (req: Request, res: Response) => {
			res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` })
		})

		app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
			log.error(error)

			if (error instanceof CustomError) {
				return res.status(error.statusCode).json(error.serializeErrors())
			}
		})
	}

	private async startServer(app: Application): Promise<void> {
		try {
			const server: spdy.server.Server = spdy.createServer(options, app)
			const socketIO: Server = await this.createSocketIO(server)
			this.startHttpServer(server)
			this.socketIOConnections(socketIO)
		} catch (error) {
			log.error(error)
		}
	}

	private async createSocketIO(httpServer: spdy.server.Server): Promise<Server> {
		const io: Server = new Server(httpServer, {
			cors: {
				origin: config.CLIENT_URL,
				methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
			}
		})
		const pubClient = createClient({ url: config.REDIS_HOST })
		const subClient = pubClient.duplicate()
		await Promise.all([pubClient.connect(), subClient.connect()])
		io.adapter(createAdapter(pubClient, subClient))
		return io
	}

	private startHttpServer(httpServer: spdy.server.Server): void {
		log.info(`Server has started with process ${process.pid}`)
		httpServer.listen(SERVER_PORT, function () {
			log.info(`Server running on port ${SERVER_PORT}`)
		})
	}

	private socketIOConnections(io: Server): void {
		log.info('socket connections')
	}
}
