import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { Helpers } from '@globals/helpers/helpers'
import { AuthModel } from '@auth/models/auth.schema'

class AuthService {
	public async createAuthUser(data: IAuthDocument): Promise<void> {
		await AuthModel.create(data)
	}

	public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
		await AuthModel.updateOne(
			{
				_id: authId
			},
			{
				passwordResetToken: token,
				passwordResetExpires: tokenExpiration
			}
		)
	}

	public async updateAccountActivationToken(_id: string, token: string, tokenExpiration: number): Promise<void> {


		await AuthModel.updateOne(
			{
				_id: _id
			},
			{
				accountActivationToken: token,
				accountActivationExpires: tokenExpiration
			}
		)
	}

	public async getUserByPasswordTokenAndUId(token: string, uId: string): Promise<IAuthDocument> {

		const user: IAuthDocument = (await AuthModel.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: Date.now() },
			uId: uId

		}).exec()) as IAuthDocument

		return user
	}


	public async getUserByAccountActivationTokenAndUId(token: string, uId: string): Promise<IAuthDocument> {

		const user: IAuthDocument = await AuthModel.findOne(
			{
				accountActivationToken: token,
				accountActivationExpires: { $gt: Date.now() },
				uId: uId

			}) as IAuthDocument

		const user1: IAuthDocument = await AuthModel.updateOne(
			{ accountActivationToken: token },
			{
				activatedByEmail: true,
				accountActivationToken: '',
				accountActivationExpires: 0,

			}) as unknown as IAuthDocument



		return user
	}


	public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
		const query = {
			$or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
		}

		const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument

		return user
	}

	public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
		const user: IAuthDocument = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IAuthDocument
		return user
	}

	public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
		const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument
		return user
	}


}

export const authService: AuthService = new AuthService()
