import fs from 'fs'
import ejs from 'ejs'

class ForgotPasswordTemplate {
	public passwordResetTemplate(username: string, resetLink: string): string {
		return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf8'), {
			username,
			resetLink,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp',
		})
	}
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate()
