import HTTP_STATUS from 'http-status-codes'

import { userService } from '@services/db/user.service'

import { Request, Response } from 'express'

import Logger from 'bunyan'

import { config } from '@src/config'
import { BadRequestError } from '@globals/helpers/error-handler'
import { authService } from '@services/db/auth.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import EmailQueue from '@services/queues/email.queue'
import { dispproveAccountCreation } from '@services/emails/templates/disapprove-account-creation/disapprove-account-creation'
import { IAccountDisapproveParams } from '@user/interfaces/user.interface'

const log: Logger = config.createLogger('disapproveAccount')

export class DispproveAccountCreation {
	public async read(req: Request, res: Response): Promise<void> {
		const { _id } = req.body

		if (!_id) {
			throw new BadRequestError('can not disapprove account if you do not send id')
		}
		const existingUser: IAuthDocument = await authService.getAuthUserById(_id)

		if (!existingUser?.approvedByAdmin) {
			throw new BadRequestError('user allready disapproved')
		}

		try {
			await userService.disapproveUser(_id)
		} catch (error) {
			log.error('disapprove account creation error')
		}

		const templateParams: IAccountDisapproveParams = {
			username: existingUser.username
		}

		const template: string = dispproveAccountCreation.dispproveAccountCreation(templateParams)

		new EmailQueue('sendAccountDissaproveEmail', {
			template,
			receiverEmail: existingUser.email,
			subject: 'Account disapproved successfully 400025'
		})

		res.status(HTTP_STATUS.OK).json({
			message: 'user successfully disapproved',
			success: true,
			info: `disapproved user id: ${_id}`
		})
	}
}
