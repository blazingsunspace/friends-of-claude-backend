import { currentUserRoutes } from '@auth/routes/currentRoutes'
import { authRoutes } from '@auth/routes/authRoutes'

import { Application } from 'express'
import { authMiddleware } from '@globals/helpers/auth-midleware'
import { adminRoutes } from '@auth/routes/adminRoutes'
import { superAdminRoutes } from '@auth/routes/superAdminRoutes'
import { ExpressAdapter } from '@bull-board/express'
const BASE_PATH = '/api/v1'

export let serverAdapter: ExpressAdapter
// eslint-disable-next-line prefer-const
serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

export class ApplicationRoutes {
	app: Application
	constructor(app: Application) {
		this.app = app
		this.routes()
	}

	protected routes() {
		this.app.use('/queues', serverAdapter.getRouter())

		this.app.use(BASE_PATH, authRoutes.routes())
		this.app.use(BASE_PATH, authRoutes.signOutRoute())

		//authenticated routes
		this.app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes())
		this.app.use(BASE_PATH, authMiddleware.verifyUser, adminRoutes.routes())

		//super admin routes

		this.app.use(BASE_PATH, authMiddleware.verifyUser, superAdminRoutes.routes())
	}
}
