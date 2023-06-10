import { Queue, QueueEvents, Job } from 'bullmq'
import { createBullBoard } from '@bull-board/api'
import Logger from 'bunyan'
import { config } from '@src/config'
import { REDIS_QUEUE_HOST, REDIS_QUEUE_PORT } from './config.constants'

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { serverAdapter } from './../../../routes'
import { IEmailJob, IUserDocument } from '@user/interfaces/user.interface'
import { IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'

const bullAdapters: BullMQAdapter[] = []

export abstract class BaseQueue {
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

	protected async addJobToQueue<T>(name: string, data: IAuthDocument | IUserDocument | IEmailJob | IAuthUpdate): Promise<Job<T>> {
		return this.queue.add(name, data, this.DEFAULT_REMOVE_CONFIG)
	}
}
