import fs from 'fs'
import ejs from 'ejs'
import { IAccountActivatedParams } from '@user/interfaces/user.interface'

class AccountCteatedTemplate {
	public accountCteatedTemplate(templateParams: IAccountActivatedParams): string {
		const { username, email, ipaddress, date } = templateParams

		return ejs.render(fs.readFileSync(__dirname + '/account-created-template.ejs', 'utf8'), {
			username,
			email,
			ipaddress,
			date,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp'
		})
	}
}

export const accountCteatedTemplate: AccountCteatedTemplate = new AccountCteatedTemplate()
