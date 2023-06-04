import fs from 'fs'
import ejs from 'ejs'
import { IAccountDisapproveParams } from '@user/interfaces/user.interface'

class DispproveAccountCreation {
	public dispproveAccountCreation(templateParams: IAccountDisapproveParams): string {
		const { username } = templateParams
		return ejs.render(fs.readFileSync(__dirname + '/disapprove-account-creation.ejs', 'utf8'), {
			username,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp',
		})
	}
}

export const dispproveAccountCreation: DispproveAccountCreation = new DispproveAccountCreation()
