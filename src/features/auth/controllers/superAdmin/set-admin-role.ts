import HTTP_STATUS from 'http-status-codes'

import { userService } from '@services/db/user.service'

import { Request, Response } from 'express'

import Logger from 'bunyan'
import { ObjectId } from 'mongodb'
import { config } from '@src/config'
import { BadRequestError } from '@globals/helpers/error-handler'
import { authService } from '@services/db/auth.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { emailQueue } from '@services/queues/email.queue'
import { accountActivationTemplate } from '@services/emails/templates/account-activation/account-activation-template'
import { IAccountActivateParams, IAccountApproveParams, IAccountPromotedToAdmin } from '@user/interfaces/user.interface'
import { approveAccountCreation } from '@services/emails/templates/approve-account-creation/approve-account-creation'
import moment from 'moment'
import { accountPromotedToAdminTemplate } from '@services/emails/templates/account-promtoed-to-admin/account-promtoed-to-admin-template'

const log: Logger = config.createLogger('approveAccount')

export class SetAdmin {
	public async read(req: Request, res: Response): Promise<void> {

		const { _id } = req.body

		if (!_id) {
			throw new BadRequestError('can not add admin role to account if you do not send id')
		}

		if (!ObjectId.isValid(_id)){
			throw new BadRequestError('id for setting admin is not in right format')
		}

		const existingUser: IAuthDocument = await authService.getAuthUserById(_id)

		if (!existingUser) {
			throw new BadRequestError('no existing user with that id')
		}

		if (existingUser?.role === 2) {
			throw new BadRequestError('user allready admin3')
		}

		try {
			await userService.setAdmin(_id)

		} catch (error) {
			log.error('sett admin to account error')
		}


		moment.locale('de')
		const templateParams: IAccountPromotedToAdmin = {
			username: existingUser.username,
			date: new Date().toISOString()
		}

		const template: string = accountPromotedToAdminTemplate.accountPromotedToAdminTemplate(templateParams)
		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: existingUser.email, subject: 'Account setted to admin successfully 4220255' })


		res.status(HTTP_STATUS.OK).json({
			message: 'user successfully setted to admin',
			success: true,
			info: `setted to admin user id: ${_id}`

		})
	}
}
