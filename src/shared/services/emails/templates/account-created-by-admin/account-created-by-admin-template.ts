import fs from 'fs'
import ejs from 'ejs'
import { IAccountActivateParams } from '@user/interfaces/user.interface'

class AccountCreatedByAdminTemplate {
	public accountCreatedByAdminTemplateTemplate(templateParams: IAccountActivateParams): string {
		const { username, activateLink } = templateParams



		return ejs.render(fs.readFileSync(__dirname + '/account-created-by-admin-template.ejs', 'utf8'), {
			username,
			activateLink,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp'
		})
	}
}

export const accountCreatedByAdminTemplate: AccountCreatedByAdminTemplate = new AccountCreatedByAdminTemplate()
