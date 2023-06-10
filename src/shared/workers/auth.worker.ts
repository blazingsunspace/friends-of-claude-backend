import Logger from 'bunyan'
import { config } from '@src/config'

import { Job, Worker } from 'bullmq'
import { REDIS_QUEUE_HOST, REDIS_QUEUE_PORT } from '@services/queues/config.constants'

const log: Logger = config.createLogger('authWorker')
let worker: Worker

import jobProcessor from './jobs/addAuthUserToDB'
export async function addAuthUserToDBWorker(jobName: string): Promise<void> {
	worker = new Worker(jobName, jobProcessor, {
		connection: {
			host: REDIS_QUEUE_HOST,
			port: REDIS_QUEUE_PORT
		},
		autorun: true
	})

	worker.on('completed', (job: Job, returnvalue: 'DONE') => {
		log.info(`Completed job with id ${job.id}`, returnvalue)
	})

	worker.on('active', (job: Job<unknown>) => {
		log.info(`Completed job with id ${job.id}`)
	})

	worker.on('error', (failedReason: Error) => {
		log.info('Job encountered an error', failedReason)
	})
}
