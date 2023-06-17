import { IInvitationsDocument } from '@invitations/interfaces/invitations.interface'
import { BaseQueue } from '@services/queues/base.queue'

import { addInvitationToDBWorker } from '@workers/invitation.worker'

export default class InvitationQueue extends BaseQueue {
	constructor(jobName: string, data: IInvitationsDocument) {
		super(jobName)
		this.addInvitationToDB(jobName, data)
	}

	public async addInvitationToDB(jobName: string, data: IInvitationsDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addInvitationToDBWorker(jobName)
	}
}
