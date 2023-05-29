import { CurrentUser } from '@auth/controllers/current-user'
import { authMiddleware } from '@globals/helpers/auth-midleware'
import express, { Router } from 'express'


class CurrentUserRoutes {

	private router: Router

	constructor() {
		this.router = express.Router()
	}

	public routes(): Router {


		this.router.get('/current-user', authMiddleware.checkAuthentication, CurrentUser.prototype.read)

		return this.router
	}

}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes()
