
import { Request, Response } from 'express'
import { config } from '@root/config'
import HTTP_STATUS from 'http-status-codes'


import { joiValidation } from '@globals/decorators/joi-validation.decorators'

import JWT from 'jsonwebtoken'
import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { loginSchema } from '@auth/schemes/signin'
import { IAuthDocument } from '@auth/interfaces/auth.interface'

export class SignIn {
	@joiValidation(loginSchema)
	public async read(req: Request, res: Response): Promise<void> {
		const { username, password } = req.body

		const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username)
		if (!existingUser) {
			throw new BadRequestError('Invalid credentials')
		}

		const passwordsMarch: boolean = await existingUser.comparePassword(password)

		if (!passwordsMarch) {
			throw new BadRequestError('Invalid credentials')
		}

		const userJwt: string = JWT.sign(
			{
				userId: existingUser._id,
				uId: existingUser.uId,
				email: existingUser.email,
				username: existingUser.username,
				avatarColor: existingUser.avatarColor
			},
			config.JWT_TOKEN!
		)

		req.session = { jwt: userJwt}

		res.status(HTTP_STATUS.OK).json({ message: 'user login succesfuly', user: existingUser, token: userJwt })

	}
}
