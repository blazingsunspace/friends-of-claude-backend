import { config } from '@root/config'
import HTTP_STATUS from 'http-status-codes'
import JWT from 'jsonwebtoken'
import { Request, Response } from 'express'
import { AuthPayload } from '@auth/interfaces/auth.interface'

export class SignOut {
	public async update(req: Request, res: Response): Promise<void> {
		if (req.session?.jwt) {


			try {
				const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload
				if (payload) {
					req.session = null
					res.status(HTTP_STATUS.OK).json({ message: 'Logout successful', user: {}, token: '' })
				}

			} catch (error) {
				res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Token is expired, invalid you are logged out' })
			}


		} else {
			res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'You are not logged in' })
		}


	}
}
