import fs from 'fs'
import ejs from 'ejs'
import { IInviteUserParams } from '@user/interfaces/user.interface'

class InviteUserTemplate {
	public inviteUserTemplate(templateParams: IInviteUserParams): string {
		const { username, activateLink } = templateParams

		return ejs.render(fs.readFileSync(__dirname + '/invite-user-template.ejs', 'utf8'), {
			username,
			activateLink,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp'
		})
	}
}

export const inviteUserTemplate: InviteUserTemplate = new InviteUserTemplate()
