import fs from 'fs'
import ejs from 'ejs'
import { IAccountPromotedToAdmin } from '@user/interfaces/user.interface'

class AccountUnPromotedToAdminTemplate {
	public accountUnPromotedToAdminTemplate(templateParams: IAccountPromotedToAdmin): string {
		const { username, date } = templateParams

		return ejs.render(fs.readFileSync(__dirname + '/account-un-promtoed-to-admin-template.ejs', 'utf8'), {
			username,
			date,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp'
		})
	}
}

export const accountUnPromotedToAdminTemplate: AccountUnPromotedToAdminTemplate = new AccountUnPromotedToAdminTemplate()
