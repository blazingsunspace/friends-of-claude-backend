import { BaseQueue } from '@services/queues/base.queue'
import { IUserDocument } from '@user/interfaces/user.interface'
import { addUserToDBWorker } from '@workers/user.worker'

export default class UserQueue extends BaseQueue {
	constructor(jobName: string, data: IUserDocument) {
		super(jobName)
		this.addUserJob(jobName, data)
	}

	public async addUserJob(jobName: string, data: IUserDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addUserToDBWorker(jobName)
	}
}
