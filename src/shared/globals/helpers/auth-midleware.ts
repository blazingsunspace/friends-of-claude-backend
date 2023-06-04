import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken'
import { config } from '@src/config'
import { NotAuthorizedError } from '@globals/helpers/error-handler'
import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface'
import { authService } from '@services/db/auth.service'
import { IUserDocument } from '@user/interfaces/user.interface'
import { userService } from '@services/db/user.service'

export class AuthMiddleware {
	public async verifyUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
		if (!req.session?.jwt) {
			throw new NotAuthorizedError('Token is not available. Please login again')
		}

		try {
			const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload

	
			const existingUser: AuthPayload = await authService.getAuthUserById2(`${payload._id}`)
		
			const existingUser2: IUserDocument = await userService.getUserByAuthId(`${payload._id}`)
			existingUser.authId = existingUser2._id
	
			
		
			req.currentUser = existingUser

		} catch (error) {
			throw new NotAuthorizedError('Token is invalid. Please login again')
		}

		next()
	}

	public async checkAuthentication(req: Request, _res: Response, next: NextFunction): Promise<void> {



		if (req.currentUser?.setPassword) {
			throw new NotAuthorizedError('You need to set password. please wisit /set-password route')
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


		if (existingUser?.role !== 2 && existingUser?.role !== 5) {
			throw new NotAuthorizedError('This is admin space')
		}




		next()
	}

	public async superAuthentification(req: Request, _res: Response, next: NextFunction): Promise<void> {


		const existingUser: IAuthDocument = await authService.getAuthUserById(`${req.currentUser?._id}`)


		if (existingUser?.role !== 5) {
			throw new NotAuthorizedError('This is super admin space')
		}


		next()
	}
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware()
