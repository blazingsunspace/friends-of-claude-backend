import { IInvitationUpdate } from '@invitations/interfaces/invitations.interface'

import { invitationService } from '@services/db/invitations.service'

import { Job } from 'bullmq'

export default async function jobProcessor(job: Job): Promise<'DONE'> {
	await job.log(`Started processing job with id ${job.id}`)

	// TODO: do your CPU intense logic here
	const data: IInvitationUpdate = job.data

	await invitationService.updateInvitationToDB(data)

	await job.updateProgress(100)
	return 'DONE'
}
