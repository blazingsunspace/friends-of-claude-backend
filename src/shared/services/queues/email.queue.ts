import {BaseQueue} from '@services/queues/base.queue'
import { IEmailJob } from '@user/interfaces/user.interface'
import { addEmailToDBWorker } from '@workers/email.worker'

export default class EmailQueue extends BaseQueue {
	constructor(jobName: string, data: IEmailJob) {
		super(jobName)
		this.addEmailJob(jobName, data)
	}

	public async addEmailJob(jobName: string, data: IEmailJob): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addEmailToDBWorker(jobName)
	}
}
