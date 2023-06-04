import { currentUserRoutes } from '@auth/routes/currentRoutes'
import { authRoutes } from '@auth/routes/authRoutes'
import { serverAdapter } from '@services/queues/base.queue'
import { Application } from 'express'
import { authMiddleware } from '@globals/helpers/auth-midleware'
import { adminRoutes } from '@auth/routes/adminRoutes'
import { superAdminRoutes } from '@auth/routes/superAdminRoutes'

const BASE_PATH = '/api/v1'

export default (app: Application) => {
	const routes = () => {
		// Enabling trust proxy


		app.use('/queues', serverAdapter.getRouter())

		app.use(BASE_PATH, authRoutes.routes())
		app.use(BASE_PATH, authRoutes.signOutRoute())

		//authenticated routes
		app.use(BASE_PATH, currentUserRoutes.routes())
		app.use(BASE_PATH, authMiddleware.verifyUser, adminRoutes.routes())

		//super admin routes

		app.use(BASE_PATH, authMiddleware.verifyUser, superAdminRoutes.routes())
	}

	routes()

}
