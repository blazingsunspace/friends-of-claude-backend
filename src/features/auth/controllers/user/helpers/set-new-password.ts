import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { BadRequestError } from '@globals/helpers/error-handler'
import { authService } from '@services/db/auth.service'
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template'
import EmailQueue from '@services/queues/email.queue'
import moment from 'moment'
import publicIP from 'ip'
import { IResetPasswordParams } from '@user/interfaces/user.interface'

async function setNewPassword(token: string, uId: string, password: string) {
	const existingUser: IAuthDocument = await authService.getUserByPasswordTokenAndUId(token, uId)

	if (!existingUser) {
		throw new BadRequestError('Reset token has expired 56')
	}


	existingUser.password = password
	existingUser.passwordResetExpires = undefined
	existingUser.passwordResetToken = undefined
	existingUser.setPassword = false
	await existingUser.save()

	const templateParams: IResetPasswordParams = {
		username: existingUser.username!,
		email: existingUser.email!,
		ipaddress: publicIP.address(),
		date: moment().format('DD/MM/YY HH:mm')
	}

	const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams)
	new EmailQueue('sendPasswordResetConfiramtion', {
		template,
		receiverEmail: existingUser.email!,
		subject: 'Account activated Confirmation 34223'
	})
}

export { setNewPassword }
