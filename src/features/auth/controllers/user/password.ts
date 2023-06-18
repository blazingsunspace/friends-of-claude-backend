import { SignIn } from '@auth/controllers/user/signin'
import { Request, Response } from 'express'
import { config } from '@src/config'
import HTTP_STATUS from 'http-status-codes'

import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'

import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template'

import EmailQueue from '@services/queues/email.queue'

import { setNewPassword } from '@auth/controllers/user/helpers/set-new-password'
import UpdateAuthQueue from '@services/queues/update-auth'
import { emailSchema, passwordSchema } from '@auth/schemes/password'
import { joiValidation } from '@globals/decorators/joi-validation.decorators'
import { createRandomCharacters } from '@auth/controllers/user/helpers/create-random-characters'

export class Password {
	@joiValidation(emailSchema)
	public async create(req: Request, res: Response): Promise<void> {
		const { email } = req.body
		const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email)

		if (!existingUser) {
			throw new BadRequestError('Invalid credentials4')
		}

		const randomCharacters: string = await createRandomCharacters()

		const updatePasswordData: IAuthUpdate = {
			updateWhere: {
				_id: `${existingUser._id!}`
			},
			updateWhat: {
				passwordResetToken: randomCharacters,
				passwordResetExpires: new Date().getTime() + 1000 * 60 * 60
			},
			pointer: 'setNewPassword'
		}

		new UpdateAuthQueue('updateAuthUserToDB', updatePasswordData)

		const resetLink = `${config.CLIENT_URL}/reset-password?uId=${existingUser.uId}&token=${randomCharacters}`
		const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink)

		new EmailQueue('sendResetPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password 2' })

		res.status(HTTP_STATUS.OK).json({
			message: 'password reset email send.', data: config.NODE_ENV === 'development' ? {
			uId: existingUser.uId,
			passwordResetToken: randomCharacters
		} : ''})
	}

	@joiValidation(passwordSchema)
	public async update(req: Request, res: Response): Promise<void> {
		const { password, confirmPassword } = req.body
		const { token, uId } = req.params

		if (!token) {
			throw new BadRequestError('cant reset password without token')
		}

		//postoji validacija na schemi
		if (password !== confirmPassword) {
			throw new BadRequestError('Passwords do not match')
		}

		const existingUser: IAuthDocument = await authService.getUserByPasswordTokenAndUId(token, uId)

		if (!existingUser) {
			const existingUserWithoutExpiration: IAuthDocument = await authService.getUserByPasswordTokenAndUIdWithoutExpiration(token, uId)
			if (!existingUserWithoutExpiration) {
				throw new BadRequestError('there is no that passwordToken and uid combination')
			}

			res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json({ message: 'Your token for reset password has been expired', data: { resetPaswordTokenExpired: true } })
		} else {
			if (existingUser.setPassword) {
				await setNewPassword(token, uId, password)

				SignIn.prototype.login(existingUser, req, res, `${existingUser._id}`, 1)
			} else {
				await setNewPassword(token, uId, password)

				res.status(HTTP_STATUS.OK).json({ message: 'Password successfuly reset.' })
			}
		}
	}
}
