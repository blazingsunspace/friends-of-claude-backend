import fs from 'fs'
import ejs from 'ejs'
import { IAccountApproveParams } from '@user/interfaces/user.interface'

class ApproveAccountCreation {
	public approveAccountCreation(templateParams: IAccountApproveParams): string {
		const { username } = templateParams
		return ejs.render(fs.readFileSync(__dirname + '/approve-account-creation.ejs', 'utf8'), {
			username,
			image_url: 'https://res.cloudinary.com/deztrt9eh/image/upload/v1685366435/6474a6a3186eae0f0b9705bd.webp'
		})
	}
}

export const approveAccountCreation: ApproveAccountCreation = new ApproveAccountCreation()
