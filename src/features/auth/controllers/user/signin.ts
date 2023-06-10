import { Request, Response } from 'express'
import { config } from '@src/config'
import HTTP_STATUS from 'http-status-codes'

import JWT from 'jsonwebtoken'
import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'

import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import { userService } from '@services/db/user.service'

export class SignIn {
	public async read(req: Request, res: Response): Promise<void> {
		const { password,  username} = req.body

		const existingUser: IAuthDocument = await authService.getUserByUsername(username)

		if (!existingUser) {
			throw new BadRequestError('Invalid credentials1')
		}

		const passwordsMarch: boolean = await existingUser.comparePassword(password)

		if (!passwordsMarch) {
			throw new BadRequestError('Invalid credentials2')
		}

		if (!existingUser.activatedByEmail) {
			throw new BadRequestError('account not activated')
		}

		const user: IUserDocument = await userService.getUserByAuthId(`${existingUser!._id}`)

		const userInfId: IUserDocument = (await userService.getUserByAuthId(`${existingUser!._id}`)) as IUserDocument

		const userJwt: string = JWT.sign(
			{
				_id: existingUser._id,
				authId: userInfId._id
			},
			config.JWT_TOKEN!
		)


		req.session = { jwt: userJwt }

		const userDocuments: IUserDocument = {
			...user,
			authId: existingUser._id,
			username: existingUser.username,
			email: existingUser.email,
			avatarColor: existingUser.avatarColor,
			uId: existingUser.uId,
			createdAt: existingUser.createdAt
		} as IUserDocument

		res.status(HTTP_STATUS.OK).json({ message: 'user login succesfuly',user: userDocuments, token: userJwt })
	}
}
