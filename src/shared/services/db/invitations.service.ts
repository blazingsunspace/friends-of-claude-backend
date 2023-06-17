import { AuthPayload, IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'
import { Helpers } from '@globals/helpers/helpers'
import { AuthModel } from '@auth/models/auth.schema'
import { config } from '@src/config'
import Logger from 'bunyan'
import mongoose from 'mongoose'
import { IInvitationsDocument } from '@invitations/interfaces/invitations.interface'
import { InvitationsModel } from '@invitations/models/invitations.schema'

const log: Logger = config.createLogger('invitationService')
class InvitationService {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async doTransaction(callback: any): Promise<void> {
		try {
			let session: mongoose.mongo.ClientSession | null = null
			return InvitationsModel.createCollection()
				.then(() => InvitationsModel.startSession())
				.then(async (_session) => {
					session = _session
					// Start a transaction
					session.startTransaction()
					// This `create()` is part of the transaction because of the `session`
					// option.
					await callback()
				})
				.then(() => session?.commitTransaction())
				.then(() => session?.endSession())
		} catch (error) {
			log.error(error, 'Mongo db could not finish transaction (add user data to mongo db)')
		}
	}


	public async addInvitationToDb(data: IInvitationsDocument): Promise<void> {
		InvitationService.prototype.doTransaction(async () => {
			await InvitationsModel.create(data)
		})
	}


	public async getInvitationByInvitationToken(invitationToken: string): Promise<IInvitationsDocument> {
		const invitation: IInvitationsDocument = (await InvitationsModel.findOne({
			invitationToken: invitationToken,
			invitationTokenExpires: { $gt: new Date().getTime() }
		}).exec()) as IInvitationsDocument

		return invitation
	}

	public async getInvitationByInvitationTokenWithoutExpiration(invitationToken: string): Promise<IInvitationsDocument> {
		const invitation: IInvitationsDocument = (await InvitationsModel.findOne({
			invitationToken: invitationToken
		}).exec()) as IInvitationsDocument

		return invitation
	}

}

export const invitationService: InvitationService = new InvitationService()
