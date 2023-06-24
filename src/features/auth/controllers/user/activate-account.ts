import { Request, Response } from 'express'

import HTTP_STATUS from 'http-status-codes'

import moment from 'moment'
import publicIP from 'ip'

import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@globals/helpers/error-handler'
import { IAuthDocument, IAuthUpdate, IUpdateAuthActivationUpdateWhat } from '@auth/interfaces/auth.interface'

import { IAccountActivateParams, IAccountActivatedParams } from '@user/interfaces/user.interface'

import { accountActivatedTemplate } from '@services/emails/templates/account-activated/account-activated-template'
import { EmailQueue, UpdateAuthQueue } from '@services/queues/base.queue'

import { config } from '@src/config'

import { resentAccountActivationWithPassword } from '@services/emails/templates/resend-account-activation-with-password/resend-account-activation-with-password-template'
import { resendAccountActivationTemplate } from '@services/emails/templates/resend-account-activation/resend-account-activation-template'

import { createRandomCharacters } from '@auth/controllers/user/helpers/create-random-characters'
export class ActivateAccount {
	private async activateAccount(token: string, uId: string, existingUser: IAuthDocument): Promise<void> {
		let uptadeWhatObject: IUpdateAuthActivationUpdateWhat = {
			activatedByEmail: true,
			accountActivationToken: '',
			accountActivationExpires: 0
		}

		if (existingUser.setPassword) {
			uptadeWhatObject = {
				...uptadeWhatObject,
				passwordResetToken: existingUser.passwordResetToken,
				passwordResetExpires: parseInt(String(existingUser.passwordResetExpires))
			}
		}

		const query: IAuthUpdate = {
			updateWhere: {
				accountActivationToken: token,
				uId: uId
			},
			updateWhat: uptadeWhatObject,
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

	public async resendAccountActivation(req: Request, res: Response): Promise<void> {
		const { _id } = req.body

		if (!_id) {
			throw new BadRequestError('cant resend activate account without _id')
		}

		const existingUserWithoutExpiration: IAuthDocument = await authService.getAuthUserById(_id)

		if (!existingUserWithoutExpiration) {
			throw new BadRequestError('can not find user with that token uid combination555')
		}

		const randomCharacters: string = await createRandomCharacters()
		const activateLink = `${config.CLIENT_URL}/activate-account?uId=${existingUserWithoutExpiration.uId}&token=${randomCharacters}`

		const query: IAuthUpdate = {
			updateWhere: {
				_id: _id,
				uId: existingUserWithoutExpiration.uId
			},
			updateWhat: {
				activatedByEmail: false,
				accountActivationToken: randomCharacters,
				accountActivationExpires: new Date().getTime() + 1000 * 60 * 60
			},
			pointer: 'resendAccountActivation'
		}

		new UpdateAuthQueue('updateAuthUserToDB', query)

		if (existingUserWithoutExpiration.approvedByAdmin) {
			const templateParams: IAccountActivateParams = {
				username: existingUserWithoutExpiration.username,
				activateLink: activateLink
			}

			const template: string = resentAccountActivationWithPassword.resentAccountActivationWithPassword(templateParams)

			new EmailQueue('sendAccountCreatedByAdminEmail', {
				template,
				receiverEmail: existingUserWithoutExpiration.email,
				subject: 'Send account reactivation with password'
			})
			res.status(HTTP_STATUS.OK).json({ message: 'Send account reactivation with password 4123' })
		} else {
			const templateParams: IAccountActivateParams = {
				username: existingUserWithoutExpiration.username,
				activateLink: activateLink
			}

			const template: string = resendAccountActivationTemplate.resendAccountActivationTemplate(templateParams)
			new EmailQueue('sendAccountActivationEmail', {
				template,
				receiverEmail: existingUserWithoutExpiration.email,
				subject: 'Send account reactivation 44'
			})

			res.status(HTTP_STATUS.OK).json({ message: 'Send account reactivation 443' })
		}
	}

	public async activate(req: Request, res: Response): Promise<void> {

		const { token, uId } = req.params

		if (!token && !uId) {
			throw new BadRequestError('cant activate account without token and id')
		}

		const existingUser: IAuthDocument = await authService.getUserByAccountActivationTokenAndUId(token, uId)

		if (!existingUser) {
			const existingUserWithoutExpiration: IAuthDocument = await authService.getUserByAccountActivationTokenAndUIdWithoutExpiration(token, uId)

			if (!existingUserWithoutExpiration) {
				throw new BadRequestError('can not find user with that token uid combination')
			}

			res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json({ message: 'Your token for activation has been expired', data: { resendActivationEmail: true } })
		} else {
			if (existingUser.setPassword) {
				const randomCharacters: string = await createRandomCharacters()

				existingUser.passwordResetToken = randomCharacters
				existingUser.passwordResetExpires = new Date().getTime() + 1000 * 60 * 60

				ActivateAccount.prototype.activateAccount(token, uId, existingUser)

				res.status(HTTP_STATUS.OK).json({
					message: 'Your account is created, but you will need to set password before you can continue using FOC app',
					data: {
						setPassword: true,
						uId: config.NODE_ENV === 'development' ? existingUser.uId : '',
						passwordResetToken: config.NODE_ENV === 'development' ?  randomCharacters : ''
					}
				})
			} else {
				ActivateAccount.prototype.activateAccount(token, uId, existingUser)
				res.status(HTTP_STATUS.OK).json({ message: 'Account succesfuly activated. 33223' })
			}
		}
	}
}
