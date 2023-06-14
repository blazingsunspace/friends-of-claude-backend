import { Password } from '@auth/controllers/user/password'
import { ActivateAccount } from '@auth/controllers/user/activate-account'
import { SignIn } from '@auth/controllers/user/signin'
import { SignOut } from '@auth/controllers/user/signout'
import { SignUp } from '@auth/controllers/user/signup'
import express, { Router } from 'express'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const throttle = require('express-throttle')

import { authMiddleware } from '@globals/helpers/auth-midleware'
class AuthRoutes {
	private router: Router
	constructor() {
		this.router = express.Router()
	}

	public routes(): Router {
		this.router.post('/signup', authMiddleware.signOutVerify, SignUp.prototype.create)

		this.router.post(
			'/signin',
			throttle({
				burst: 5,
				period: '1min',
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				on_throttled: function (req: any, res: any, next: any, bucket: any) {
					// Possible course of actions:
					// 1) Log request
					// 2) Add client ip address to a ban list
					// 3) Send back more information
					res.set('X-Rate-Limit-Limit', 5)
					res.set('X-Rate-Limit-Remaining', 0)
					// bucket.etime = expiration time in Unix epoch ms, only available
					// for fixed time windows
					res.set('X-Rate-Limit-Reset', bucket.etime)
					res.status(503).send({ message: 'System overloaded, try again at a later time.', success: false })
				}
			}),
			authMiddleware.signOutVerify,
			SignIn.prototype.read
		)
		this.router.post('/forgot-password', authMiddleware.signOutVerify, Password.prototype.create)
		this.router.post('/reset-password/:uId/:token', Password.prototype.update)
		this.router.post('/activate-account/:uId/:token', authMiddleware.signOutVerify, ActivateAccount.prototype.activate)
		this.router.post('/set-password/:uId/:token', authMiddleware.signOutVerify, ActivateAccount.prototype.setPassword)
		this.router.post('/resend-account-activation', authMiddleware.signOutVerify, ActivateAccount.prototype.resendAccountActivation)
		return this.router
	}

	public signOutRoute(): Router {
		this.router.get('/signout', SignOut.prototype.update)

		return this.router
	}
}

export const authRoutes: AuthRoutes = new AuthRoutes()
