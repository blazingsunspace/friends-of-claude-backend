import HTTP_STATUS from 'http-status-codes'

import { Request, Response } from 'express'

import Logger from 'bunyan'
import { ObjectId } from 'mongodb'
import { config } from '@src/config'
import { BadRequestError } from '@globals/helpers/error-handler'
import { authService } from '@services/db/auth.service'
import { IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'
import EmailQueue from '@services/queues/email.queue'

import { IAccountApproveParams, IInviteUserParams } from '@user/interfaces/user.interface'
import { approveAccountCreation } from '@services/emails/templates/approve-account-creation/approve-account-creation'
import UpdateAuthQueue from '@services/queues/update-auth'
import InvitationQueue from '@services/queues/invitation.queue'
import { IInvitationsCreate, IInvitationsDocument } from '@invitations/interfaces/invitations.interface'
import { createRandomCharacters } from '@auth/controllers/user/helpers/create-random-characters'
import { emailSchema } from '@auth/schemes/password'
import { joiValidation } from '@globals/decorators/joi-validation.decorators'
import { inviteUserTemplate } from '@services/emails/templates/invite-user/invite-user-template'

const log: Logger = config.createLogger('approveAccount')

export class InviteUser {
	@joiValidation(emailSchema)
	public async read(req: Request, res: Response): Promise<void> {
		const { username, email } = req.body

		if (!email) {
			throw new BadRequestError('can not invite user without email')
		}


		try {
			const randomCharacters: string = await createRandomCharacters()



			const data: IInvitationsDocument = InviteUser.prototype.invitationData({
				_id: new ObjectId(),
				email,
				username,
				invitationToken: randomCharacters,
				invitationTokenExpires: new Date().getTime() + 1000 * 60 * 60,
				invitedBy: req.currentUser?._id

			})

			new InvitationQueue('addInvitationToDB', data)


			const activateLink = `${config.CLIENT_URL}/signup/${randomCharacters}`

			const templateParams: IInviteUserParams = {
				username: username,
				activateLink: activateLink
			}

			const template: string = inviteUserTemplate.inviteUserTemplate(templateParams)

			new EmailQueue('sendAccountApprovedEmail', {
				template,
				receiverEmail: email,
				subject: 'You are invited to join Friends of Claude 400024'
			})

			res.status(HTTP_STATUS.OK).json({
				message: 'potential user successfully invited',
				success: true,
				info: `potential user invited: ${email}`
			})

		} catch (error) {
			log.error('user invitation failed')
			throw new BadRequestError('user invitation failed')
		}


	}

	private invitationData(data: IInvitationsCreate): IInvitationsDocument {
		const {
			_id,
			email,
			username,
			invitationToken,
			invitationTokenExpires,
			invitedBy

		} = data

		return {
			_id,
			email,
			username,
			invitationToken,
			invitationTokenExpires,
			invitedBy
		} as unknown as IInvitationsDocument
	}
}
