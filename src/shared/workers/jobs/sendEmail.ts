import { mailTransport } from '@services/emails/mail.transport'
import { Job } from 'bullmq'

export default async function jobProcessor(job: Job): Promise<'DONE'> {
	await job.log(`Started processing job with id ${job.id}`)
	/* console.log(`Job with id ${job.id}`, job.data) */

	// TODO: do your CPU intense logic here
	const { template, receiverEmail, subject } = job.data
	await mailTransport.sendEmail(receiverEmail, subject, template)

	await job.updateProgress(100)
	return 'DONE'
}
