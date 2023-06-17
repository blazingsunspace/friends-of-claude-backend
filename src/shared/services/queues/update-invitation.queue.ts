
import { IInvitationUpdate } from '@invitations/interfaces/invitations.interface'
import { BaseQueue } from '@services/queues/base.queue'

import { updateInvitationToDBWorker } from '@workers/update-invitation.worker'

export default class UpdateInvitationQueue extends BaseQueue {
	constructor(jobName: string, data: IInvitationUpdate) {
		super(jobName)
		this.updateInvitationToDB(jobName, data)
	}

	public async updateInvitationToDB(jobName: string, data: IInvitationUpdate): Promise<void> {
		await this.addJobToQueue(jobName, data)

		updateInvitationToDBWorker(jobName)
	}
}
