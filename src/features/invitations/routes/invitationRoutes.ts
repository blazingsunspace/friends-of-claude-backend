import { authMiddleware } from '@globals/helpers/auth-midleware'
import { InviteUser } from '@invitations/controllers/invite-user'
import express, { Router } from 'express'

class InvitationRoutes {
	private router: Router

	constructor() {
		this.router = express.Router()
	}

	public routes(): Router {

		this.router.post('/invite-user', authMiddleware.adminAuthentification, InviteUser.prototype.read)

		return this.router
	}
}

export const invitationRoutes: InvitationRoutes = new InvitationRoutes()
