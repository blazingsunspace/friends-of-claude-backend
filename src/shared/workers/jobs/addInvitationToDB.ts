import { authService } from '@services/db/auth.service'
import { invitationService } from '@services/db/invitations.service'

import { Job } from 'bullmq'

export default async function jobProcessor(job: Job): Promise<'DONE'> {
	await job.log(`Started processing job with id ${job.id}`)
	console.log( job.data,'33333333333333')

	// TODO: do your CPU intense logic here

	await invitationService.addInvitationToDb(job.data)

	await job.updateProgress(100)
	return 'DONE'
}
