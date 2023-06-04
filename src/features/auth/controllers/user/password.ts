
import { Request, Response } from 'express'
import { config } from '@src/config'
import HTTP_STATUS from 'http-status-codes'


import moment from 'moment'
import publicIP from 'ip'

import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { IAuthDocument } from '@auth/interfaces/auth.interface'


import crypto from 'crypto'
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template'

import { emailQueue } from '@services/queues/email.queue'
import { IAccountActivatedParams, IResetPasswordParams } from '@user/interfaces/user.interface'
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template'
import { accountActivatedTemplate } from '@services/emails/templates/account-activated/account-activated-template'
import { AuthModel } from '@auth/models/auth.schema'

export class Password {

	public async create(req: Request, res: Response): Promise<void> {
		const { email } = req.body
		const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email)


		if (!existingUser) {
			throw new BadRequestError('Invalid credentials4')
		}

		const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
		const randomCharacters: string = randomBytes.toString('hex')

		await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, new Date().getTime() + 1000 * 60 * 60)

		const resetLink = `${config.CLIENT_URL}/reset-password?uId=${existingUser.uId}&token=${randomCharacters}`
		const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink)
		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: email, subject: 'Reset your password 2' })

		res.status(HTTP_STATUS.OK).json({ message: 'password reset email send.' })

	}
	private async activateAccount(token: string, uId: string): Promise<void> {
		const existingUser: IAuthDocument = await authService.getUserByAccountActivationTokenAndUId(token, uId)



		if (!existingUser) {
			throw new BadRequestError('can not find user with that token uid combination')
		}


		await AuthModel.updateOne(
			{
				accountActivationToken: token,
				uId: uId,
				accountActivationExpires: { $gt: new Date().getTime() },
			},
			{
				activatedByEmail: true,
				accountActivationToken: '',
				accountActivationExpires: 0
			}
		).exec()

		const templateParams: IAccountActivatedParams = {
			username: existingUser.username!,
			email: existingUser.email!,
			ipaddress: publicIP.address(),
			date: moment().format('DD/MM/YY HH:mm')
		}

		const template: string = accountActivatedTemplate.accountActivatedTemplate(templateParams)

		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: existingUser.email!, subject: 'Account activated Confirmation 34223' })
	}

	public async activate(req: Request, res: Response): Promise<void> {

		const { token, uId } = req.params

		if (!token && !uId) {
			throw new BadRequestError('cant activate account without token and id')
		}

		Password.prototype.activateAccount(token, uId)

		res.status(HTTP_STATUS.OK).json({ message: 'Account succesfuly activated. 33223' })




	}



	public async accountActivateAndSetPassword(req: Request, res: Response): Promise<void> {

		const { password, confirmPassword } = req.body
		const { token, uId } = req.params

		if (!token) {
			throw new BadRequestError('cant reset password without token')
		}

		if (!token && !uId) {
			throw new BadRequestError('cant activate account without token and id')
		}


		//postoji validacija na schemi
		if (password !== confirmPassword) {
			throw new BadRequestError('Passwords do not match')
		}

		await Password.prototype.setNewPassword(token, uId, password)

		await Password.prototype.activateAccount(token, uId)


		res.status(HTTP_STATUS.OK).json({ message: 'Account succesfuly activated and you set your first password. 3112142' })

	}

	private async setNewPassword(token: string, uId: string, password: string) {
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
	}



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

		await Password.prototype.setNewPassword(token, uId, password)

		res.status(HTTP_STATUS.OK).json({ message: 'Password successfuly reset.' })

	}
}
