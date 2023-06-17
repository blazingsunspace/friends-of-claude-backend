import HTTP_STATUS from 'http-status-codes'

import { Request, Response } from 'express'

import Logger from 'bunyan'
import { ObjectId } from 'mongodb'
import { config } from '@src/config'
import { BadRequestError } from '@globals/helpers/error-handler'
import { authService } from '@services/db/auth.service'
import { IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'
import EmailQueue from '@services/queues/email.queue'

import { IAccountPromotedToAdmin } from '@user/interfaces/user.interface'

import UpdateAuthQueue from '@services/queues/update-auth'
import { accountUnPromotedToAdminTemplate } from '@services/emails/templates/account-un-promtoed-to-admin/account-un-promtoed-to-admin-template'

const log: Logger = config.createLogger('approveAccount')

export class UnSetAdmin {
	public async read(req: Request, res: Response): Promise<void> {
		const { _id } = req.body

		if (!_id) {
			throw new BadRequestError('can not unset admin role to account if you do not send id')
		}

		if (!ObjectId.isValid(_id)) {
			throw new BadRequestError('id for un settting admin is not in right format')
		}

		const existingUser: IAuthDocument = await authService.getAuthUserById(_id)

		if (!existingUser) {
			throw new BadRequestError('no existing user with that id')
		}

		if (existingUser?.role !== config.CONSTANTS.userRoles.admin) {
			throw new BadRequestError('user is not admin')
		}

		try {
			const query: IAuthUpdate = {
				updateWhere: {
					_id: _id
				},
				pointer: 'unsetAdmin'
			}
			new UpdateAuthQueue('updateAuthUserToDB', query)
		} catch (error) {
			log.error('un sett admin to account error')
		}

		const templateParams: IAccountPromotedToAdmin = {
			username: existingUser.username,
			date: new Date().toISOString()
		}

		const template: string = accountUnPromotedToAdminTemplate.accountUnPromotedToAdminTemplate(templateParams)

		new EmailQueue('sendAccountUnSettedToAddmin', {
			template,
			receiverEmail: existingUser.email,
			subject: 'Account un setted from admin successfully 4220255'
		})

		res.status(HTTP_STATUS.OK).json({
			message: 'user successfully un setted to admin',
			success: true,
			info: `un setted from admin user id: ${_id}`
		})
	}
}
