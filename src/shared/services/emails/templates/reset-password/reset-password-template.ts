import fs from 'fs'
import ejs from 'ejs'
import { IResetPasswordParams } from '@user/interfaces/user.interface'

class ResetPasswordTemplate {
	public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
		const { username, email, ipaddress, date } = templateParams
		return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'), {
			username,
			email,
			ipaddress,
			date,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp'
		})
	}
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate()
