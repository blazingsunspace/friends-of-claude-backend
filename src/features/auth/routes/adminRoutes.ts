import { ApproveAccountCreation } from '@auth/controllers/admin/approve-account-creation'
import { DispproveAccountCreation } from '@auth/controllers/admin/disapprove-account-creation'
import { GetAccountCreationRequests } from '@auth/controllers/admin/get-account-creation-requests'
import { authMiddleware } from '@globals/helpers/auth-midleware'
import express, { Router } from 'express'

class AdminRoutes {
	private router: Router

	constructor() {
		this.router = express.Router()
	}

	public routes(): Router {
		this.router.get(
			'/get-approved-acounts-list',
			authMiddleware.adminAuthentification,
			GetAccountCreationRequests.prototype.getApprovedAccountsList
		)
		this.router.get('/get-account-creation-request-list', authMiddleware.adminAuthentification, GetAccountCreationRequests.prototype.read)
		this.router.post('/approve-account-creation', authMiddleware.adminAuthentification, ApproveAccountCreation.prototype.read)
		this.router.post('/disapprove-account-creation', authMiddleware.adminAuthentification, DispproveAccountCreation.prototype.read)

		return this.router
	}
}

export const adminRoutes: AdminRoutes = new AdminRoutes()
