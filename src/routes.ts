import { currentUserRoutes } from '@auth/routes/currentRoutes'
import { authRoutes } from '@auth/routes/authRoutes'
import { serverAdapter } from '@services/queues/base.queue'
import { Application } from 'express'
import { authMiddleware } from '@globals/helpers/auth-midleware'

const BASE_PATH = '/api/v1'

export default (app: Application) => {
	const routes = () => {
		app.use('/queues', serverAdapter.getRouter())

		app.use(BASE_PATH, authRoutes.routes())
		app.use(BASE_PATH, authRoutes.signOutRoute())

		app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes())
	}

	routes()

}
