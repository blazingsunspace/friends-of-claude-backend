import HTTP_STATUS from 'http-status-codes'

import { userService } from '@services/db/user.service'

import { Request, Response } from 'express'

import Logger from 'bunyan'

import { config } from '@src/config'
import { BadRequestError } from '@globals/helpers/error-handler'
import { authService } from '@services/db/auth.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import EmailQueue from '@services/queues/email.queue'

import { IAccountApproveParams } from '@user/interfaces/user.interface'
import { approveAccountCreation } from '@services/emails/templates/approve-account-creation/approve-account-creation'

const log: Logger = config.createLogger('approveAccount')

export class ApproveAccountCreation {
	public async read(req: Request, res: Response): Promise<void> {
		const { _id } = req.body

		if (!_id) {
			throw new BadRequestError('can not approve account if you do not send id')
		}
		const existingUser: IAuthDocument = await authService.getAuthUserById(_id)

		if (existingUser?.approvedByAdmin) {
			throw new BadRequestError('user allready approved')
		}

		try {
			await userService.approveUser(_id)
		} catch (error) {
			log.error('approve account creation error')
		}

		const templateParams: IAccountApproveParams = {
			username: existingUser.username
		}

		const template: string = approveAccountCreation.approveAccountCreation(templateParams)

		new EmailQueue('sendAccountApprovedEmail', {
			template,
			receiverEmail: existingUser.email,
			subject: 'Account approved successfully 400024'
		})

		res.status(HTTP_STATUS.OK).json({
			message: 'user successfully approved',
			success: true,
			info: `approved user id: ${_id}`
		})
	}
}
