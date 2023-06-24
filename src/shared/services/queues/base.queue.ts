import { Queue, QueueEvents, Job } from 'bullmq'
import { createBullBoard } from '@bull-board/api'
import Logger from 'bunyan'
import { config } from '@src/config'
import { REDIS_QUEUE_HOST, REDIS_QUEUE_PORT } from './config.constants'

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { serverAdapter } from './../../../routes'
import { IEmailJob, IUserDocument } from '@user/interfaces/user.interface'
import { IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'
import { IInvitationUpdate, IInvitationsDocument } from '@invitations/interfaces/invitations.interface'


import { addEmailToDBWorker } from '@workers/email.worker'
import { addAuthUserToDBWorker } from '@workers/auth.worker'
import { addUserToDBWorker } from '@workers/user.worker'
import { updateInvitationToDBWorker } from '@workers/update-invitation.worker'
import { updateAuthUserToDBWorker } from '@workers/update-auth.worker'
import { addInvitationToDBWorker } from '@workers/invitation.worker'

// retrieve the index of the `--myVar` flag
const myVarIndex = process.argv.indexOf('--username')

// get the value of `myVar` from the next argument in the array
const myVar = process.argv[myVarIndex + 1]


const bullAdapters: BullMQAdapter[] = []

class BaseQueue  {
	queue: Queue

	log: Logger


	DEFAULT_REMOVE_CONFIG = {
		removeOnComplete: {
			age: 3600
		},
		removeOnFail: {
			age: 24 * 3600
		},
		backoff: { type: 'fixed', delay: 3000 }
	}
	redisOptions = {
		connection: {
			host: REDIS_QUEUE_HOST,
			port: REDIS_QUEUE_PORT
		}
	}

	constructor(queueName: string) {

		this.queue = new Queue(queueName, this.redisOptions)

		bullAdapters.push(new BullMQAdapter(this.queue))

		createBullBoard({
			queues: bullAdapters,
			serverAdapter: serverAdapter
		})

		serverAdapter.setBasePath('/queues')

		this.log = config.createLogger(`${queueName}Queue`)

		const queueEvents = new QueueEvents(queueName, this.redisOptions)

		queueEvents.on('waiting', ({ jobId }) => {
			console.info(`A job with ID ${jobId} is waiting`)
		})
		queueEvents.on('progress', ({ jobId, data }, timestamp) => {
			console.info(`${jobId} reported progress ${data} at ${timestamp}`)
		})
		queueEvents.on('active', ({ jobId, prev }) => {
			console.info(`Job ${jobId} is now active; previous status was ${prev}`)
		})

		queueEvents.on('completed', ({ jobId, returnvalue }) => {
			console.info(`${jobId} has completed and returned ${returnvalue}`)
		})

		queueEvents.on('failed', ({ jobId, failedReason }) => {
			console.info(`${jobId} has failed with reason ${failedReason}`)
		})

	}

	protected async addJobToQueue<T>(
		name: string,
		data: IAuthDocument | IUserDocument | IEmailJob | IAuthUpdate | IInvitationsDocument | IInvitationUpdate
	): Promise<Job<T>> {
		return this.queue.add(name, data, this.DEFAULT_REMOVE_CONFIG)
	}
}



class EmailQueue extends BaseQueue {
	constructor(jobName: string, data: IEmailJob) {
		super(jobName)
		this.addEmailJob(jobName, data)
	}

	public async addEmailJob(jobName: string, data: IEmailJob): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addEmailToDBWorker(jobName)
	}
}


class AuthQueue extends BaseQueue {
	constructor(jobName: string, data: IAuthDocument) {
		super(jobName)
		this.addAuthUserJob(jobName, data)
	}

	public async addAuthUserJob(jobName: string, data: IAuthDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addAuthUserToDBWorker(jobName)
	}
}



class UserQueue extends BaseQueue {
	constructor(jobName: string, data: IUserDocument) {
		super(jobName)
		this.addUserJob(jobName, data)
	}

	public async addUserJob(jobName: string, data: IUserDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addUserToDBWorker(jobName)
	}
}

class UpdateInvitationQueue extends BaseQueue {
	constructor(jobName: string, data: IInvitationUpdate) {
		super(jobName)
		this.updateInvitationToDB(jobName, data)
	}

	public async updateInvitationToDB(jobName: string, data: IInvitationUpdate): Promise<void> {
		await this.addJobToQueue(jobName, data)

		updateInvitationToDBWorker(jobName)
	}
}




class UpdateAuthQueue extends BaseQueue {
	constructor(jobName: string, data: IAuthUpdate) {
		super(jobName)
		this.updateAuthUserJob(jobName, data)
	}

	public async updateAuthUserJob(jobName: string, data: IAuthUpdate): Promise<void> {
		await this.addJobToQueue(jobName, data)

		updateAuthUserToDBWorker(jobName)
	}
}


class InvitationQueue extends BaseQueue {
	constructor(jobName: string, data: IInvitationsDocument) {
		super(jobName)
		this.addInvitationToDB(jobName, data)
	}

	public async addInvitationToDB(jobName: string, data: IInvitationsDocument): Promise<void> {
		await this.addJobToQueue(jobName, data)

		addInvitationToDBWorker(jobName)
	}
}

export { BaseQueue, EmailQueue, AuthQueue, UserQueue, UpdateInvitationQueue, UpdateAuthQueue, InvitationQueue }
