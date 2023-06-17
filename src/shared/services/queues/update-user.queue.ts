import { BaseQueue } from '@services/queues/base.queue'
import { IUserDocument } from '@user/interfaces/user.interface'
import { updateUserToDBWorker } from '@workers/update-user.worker'

export default class UpdateUserQueue extends BaseQueue {
	constructor(jobName: string, data: IUserDocument) {
		super(jobName)
		this.updateUserJob(jobName, data)
	}

	public async updateUserJob(jobName: string, data: IUserDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		updateUserToDBWorker(jobName)
	}
}
