import { IAuthUpdate } from '@auth/interfaces/auth.interface'
import {BaseQueue} from '@services/queues/base.queue'
import { updateAuthUserToDBWorker } from '@workers/update-auth.worker'

export default class UpdateAuthQueue extends BaseQueue {
	constructor(jobName: string, data: IAuthUpdate) {
		super(jobName)
		this.updateAuthUserJob(jobName, data)
	}

	public async updateAuthUserJob(jobName: string, data: IAuthUpdate): Promise<void> {
		await this.addJobToQueue(jobName, data)

		updateAuthUserToDBWorker(jobName)
	}
}
