
import { Request, Response } from 'express'
import { config } from '@root/config'
import HTTP_STATUS from 'http-status-codes'


import moment from 'moment'
import publicIP from 'ip'

import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { joiValidation } from '@globals/decorators/joi-validation.decorators'
import { emailSchema, passwordSchema } from '@auth/schemes/password'

import crypto from 'crypto'
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template'

import { emailQueue } from '@services/queues/email.queue'
import { IAccountActivatedParams, IResetPasswordParams } from '@user/interfaces/user.interface'
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template'
import { accountActivatedTemplate } from '@services/emails/templates/account-activated/account-activated-template'

export class Password {
	@joiValidation(emailSchema)
	public async create(req: Request, res: Response): Promise<void> {
		const { email } = req.body
		const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email)


		if (!existingUser) {
			throw new BadRequestError('Invalid credentials4')
		}

		const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
		const randomCharacters: string = randomBytes.toString('hex')

		await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000)

		const resetLink = `${config.CLIENT_URL}/reset-password?uId=${existingUser.uId}&token=${randomCharacters}`
		const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink)
		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: email, subject: 'Reset your password 2' })

		res.status(HTTP_STATUS.OK).json({ message: 'password reset email send.' })

	}

	public async activate(req: Request, res: Response): Promise<void> {

		const { token, uId } = req.params

		if (!token && !uId) {
			throw new BadRequestError('cant activate account without token and id')
		}

		const existingUser: IAuthDocument = await authService.getUserByAccountActivationTokenAndUId(token, uId)




		if (!existingUser) {
			throw new BadRequestError('can not find user with that token uid combination')
		}



		const templateParams: IAccountActivatedParams = {
			username: existingUser.username!,
			email: existingUser.email!,
			ipaddress: publicIP.address(),
			date: moment().format('DD/MM/YY HH:mm')
		}

		const template: string = accountActivatedTemplate.accountActivatedTemplate(templateParams)

		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: existingUser.email!, subject: 'Account activated Confirmation 34223' })

		res.status(HTTP_STATUS.OK).json({ message: 'Account succesfuly activated. 33223' })

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
			throw new BadRequestError('Reset token has expired 56')
		}

		existingUser.password = password
		existingUser.passwordResetExpires = undefined
		existingUser.passwordResetToken = undefined

		await existingUser.save()

		const templateParams: IResetPasswordParams = {
			username: existingUser.username!,
			email: existingUser.email!,
			ipaddress: publicIP.address(),
			date: moment().format('DD/MM/YY HH:mm')
		}

		const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams)

		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: existingUser.email!, subject: 'Password Reset Confirmation 23' })

		res.status(HTTP_STATUS.OK).json({ message: 'Password successfuly reset.' })

	}
}
