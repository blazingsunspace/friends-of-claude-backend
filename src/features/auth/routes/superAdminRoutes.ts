import { SetAdmin } from '@auth/controllers/superAdmin/set-admin-role'
import { UnSetAdmin } from '@auth/controllers/superAdmin/unset-admin-role'
import { authMiddleware } from '@globals/helpers/auth-midleware'
import express, { Router } from 'express'

class SuperAdminRoutes {
	private router: Router

	constructor() {
		this.router = express.Router()
	}

	public routes(): Router {
		this.router.post('/set-admin', authMiddleware.superAdminAuthentification, SetAdmin.prototype.read)
		this.router.post('/un-set-admin', authMiddleware.superAdminAuthentification, UnSetAdmin.prototype.read)
		return this.router
	}
}

export const superAdminRoutes: SuperAdminRoutes = new SuperAdminRoutes()
