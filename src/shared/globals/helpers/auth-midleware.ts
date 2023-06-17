import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken'
import { config } from '@src/config'
import { NotAuthorizedError, YouNeedToSetPasswordError } from '@globals/helpers/error-handler'
import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface'
import { authService } from '@services/db/auth.service'
import { IUserDocument } from '@user/interfaces/user.interface'
import { userService } from '@services/db/user.service'

import Logger from 'bunyan'
const log: Logger = config.createLogger('authMiddlewareLogger')

export class AuthMiddleware {
	public async signOutVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (req.session?.jwt) {
			const payload: AuthPayload = JWT.verify(req.session.jwt, config.JWT_TOKEN!) as AuthPayload
			if (payload) {
				const existingUser: AuthPayload = await authService.getAuthUserById2(`${payload._id}`)

				if (!(existingUser.role == config.CONSTANTS.userRoles.superAdmin || existingUser.role == config.CONSTANTS.userRoles.admin)) {
					throw new NotAuthorizedError(`This route can not be used by logged user ${req.url}`)
				}
			}
		}
		next()
	}

	public async verifyUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
		if (!req.session?.jwt) {
			throw new NotAuthorizedError('Token is not available. Please login again1')
		}

		try {
			if (req.headers?.authorization) {
				const payload: AuthPayload = JWT.verify(req.headers.authorization.split(' ')[1], config.JWT_TOKEN!) as AuthPayload

				const existingUser: AuthPayload | null = await authService.getAuthUserById2(`${payload._id}`)

				const existingUser2: IUserDocument = await userService.getUserByAuthId(`${payload._id}`)
				existingUser.authId = existingUser2._id

				req.currentUser = existingUser
			}
		} catch (error) {
			log.error(error)
			/* throw new NotAuthorizedError(`Token is invalid. Please login again2 :  ${error}`) */
		}

		next()
	}

	public async checkAuthentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
		if (req.currentUser?.setPassword) {
			throw new YouNeedToSetPasswordError('You need to set password. please wisit /set-password route')
		}

		if (!req.currentUser?.activatedByEmail) {
			throw new NotAuthorizedError('Your account is not activated')
		}

		if (!req.currentUser.approvedByAdmin) {
			throw new NotAuthorizedError('Account is not approved by admin')
		}

		next()
	}

	public async adminAuthentification(req: Request, _res: Response, next: NextFunction): Promise<void> {
		const existingUser: IAuthDocument = await authService.getAuthUserById(`${req.currentUser?._id}`)

		if (existingUser?.role !== config.CONSTANTS.userRoles.admin && existingUser?.role !== config.CONSTANTS.userRoles.superAdmin) {
			throw new NotAuthorizedError('This is admin space')
		}

		next()
	}

	public async superAdminAuthentification(req: Request, _res: Response, next: NextFunction): Promise<void> {
		const existingUser: IAuthDocument = await authService.getAuthUserById(`${req.currentUser?._id}`)

		if (existingUser?.role !== config.CONSTANTS.userRoles.superAdmin) {
			throw new NotAuthorizedError('This is super admin space')
		}

		next()
	}
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware()
