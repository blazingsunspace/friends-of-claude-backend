import { Request, Response } from 'express'
import { config } from '@root/config'
import HTTP_STATUS from 'http-status-codes'

import { joiValidation } from '@globals/decorators/joi-validation.decorators'

import JWT from 'jsonwebtoken'
import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { loginSchema } from '@auth/schemes/signin'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface'
import { userService } from '@services/db/user.service'
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template'
import { emailQueue } from '@services/queues/email.queue'

import moment from 'moment'
import publicIP from 'ip'
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template'

export class SignIn {
	@joiValidation(loginSchema)
	public async read(req: Request, res: Response): Promise<void> {
		const { username, password } = req.body

		const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username)
		if (!existingUser) {
			throw new BadRequestError('Invalid credentials1')
		}

		const passwordsMarch: boolean = await existingUser.comparePassword(password)

		if (!passwordsMarch) {
			throw new BadRequestError('Invalid credentials2')
		}

		const user: IUserDocument = await userService.getUserByAuthId(`${existingUser!._id}`)

		const userJwt: string = JWT.sign(
			{
				userId: user._id,
				uId: existingUser.uId,
				email: existingUser.email,
				username: existingUser.username,
				avatarColor: existingUser.avatarColor
			},
			config.JWT_TOKEN!
		)


		const templateParams: IResetPasswordParams = {
			username: existingUser.username!,
			email: existingUser.email!,
			ipaddress: publicIP.address(),
			date: moment().format('DD/MM/YYYY HH:mm')
		}


		const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams)
		emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail:'arnold.nader57@ethereal.email', subject: 'Password reset confirmation'})


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

		res.status(HTTP_STATUS.OK).json({ message: 'user login succesfuly', user: userDocuments, token: userJwt })
	}
}
