import { config } from '@src/config'
import Logger from 'bunyan'
import mongoose from 'mongoose'
import { IInvitationUpdate, IInvitationsDocument } from '@invitations/interfaces/invitations.interface'
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

	public async updateInvitationToDB(data: IInvitationUpdate): Promise<void> {
		InvitationService.prototype.doTransaction(async () => {
			switch (data.pointer) {
				case 'validateInvitation':


					await InvitationsModel.updateOne(
						{
							invitationToken: data.updateWhere.invitationToken
						},
						{
							authId: data.updateWhat?.authId,
							accountCreated: data.updateWhat?.accountCreated,
							invitationToken: data.updateWhat?.invitationToken,
							invitationTokenExpires: data.updateWhat?.invitationTokenExpires
						}
					).exec()
					break
			}
		})
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
