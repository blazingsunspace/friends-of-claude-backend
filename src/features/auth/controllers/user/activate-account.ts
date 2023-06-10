import { Request, Response } from 'express'

import HTTP_STATUS from 'http-status-codes'

import moment from 'moment'
import publicIP from 'ip'

import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'

import EmailQueue from '@services/queues/email.queue'
import { IAccountActivatedParams } from '@user/interfaces/user.interface'

import { accountActivatedTemplate } from '@services/emails/templates/account-activated/account-activated-template'
import { AuthModel } from '@auth/models/auth.schema'

import { setNewPassword } from '@auth/controllers/user/helpers/set-new-password'

import UpdateAuthQueue from '@services/queues/update-auth'

export class ActivateAccount {

	private async activateAccount(token: string, uId: string): Promise<void> {
		const existingUser: IAuthDocument = await authService.getUserByAccountActivationTokenAndUId(token, uId)

		if (!existingUser) {
			throw new BadRequestError('can not find user with that token uid combination')
		}
		const query: IAuthUpdate = {
			updateWhere: {
				accountActivationToken: token,
				uId: uId
			},
			updateWhat: {
				activatedByEmail: true,
				accountActivationToken: '',
				accountActivationExpires: 0
			},
			pointer: 'accountActivation'
		}

		new UpdateAuthQueue('updateAuthUserToDB', query)


		const templateParams: IAccountActivatedParams = {
			username: existingUser.username!,
			email: existingUser.email!,
			ipaddress: publicIP.address(),
			date: moment().format('DD/MM/YY HH:mm')
		}

		const template: string = accountActivatedTemplate.accountActivatedTemplate(templateParams)
		new EmailQueue('sendAccountActivatedConfirmation', {
			template,
			receiverEmail: existingUser.email!,
			subject: 'Account activated Confirmation 34223'
		})
	}

	public async activate(req: Request, res: Response): Promise<void> {
		const { token, uId } = req.params

		if (!token && !uId) {
			throw new BadRequestError('cant activate account without token and id')
		}

		ActivateAccount.prototype.activateAccount(token, uId)

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

		await setNewPassword(token, uId, password)

		await ActivateAccount.prototype.activateAccount(token, uId)

		res.status(HTTP_STATUS.OK).json({ message: 'Account succesfuly activated and you set your first password. 3112142' })
	}


}
