import { IAuthDocument } from '@auth/interfaces/auth.interface'
import {BaseQueue} from '@services/queues/base.queue'
import { addAuthUserToDBWorker } from '@workers/auth.worker'

export default class AuthQueue extends BaseQueue {
	constructor(jobName: string, data: IAuthDocument) {
		super(jobName)
		this.addAuthUserJob(jobName, data)
	}

	public async addAuthUserJob(jobName: string, data: IAuthDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addAuthUserToDBWorker(jobName)
	}
}
