import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface'
import { Helpers } from '@globals/helpers/helpers'
import { AuthModel } from '@auth/models/auth.schema'
import { config } from '@src/config'
import Logger from 'bunyan'
import mongoose from 'mongoose'
import { UserModel } from '@user/models/user.schema'
const log: Logger = config.createLogger('authService')
class AuthService {

	private async doTransaction(callback: any): Promise<void> {
		try {
			let session: mongoose.mongo.ClientSession | null = null
			return AuthModel.createCollection()
				.then(() => AuthModel.startSession())
				.then(async _session => {
					session = _session
					// Start a transaction
					session.startTransaction()
					// This `create()` is part of the transaction because of the `session`
					// option.
					await callback()

				})
				.then(() => session?.commitTransaction())
				.then(() => session?.endSession())

		} catch (error) {
			log.error(error, 'Mongo db could not finish transaction (add user data to mongo db)')
		}
	}

	public async createAuthUser(data: IAuthDocument): Promise<void> {
		AuthService.prototype.doTransaction(async () => { await AuthModel.create(data) })

	}

	public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
		AuthService.prototype.doTransaction(async () => {
			await AuthModel.updateOne(
				{
					_id: authId
				},
				{
					passwordResetToken: token,
					passwordResetExpires: tokenExpiration
				}
			).exec()
		})

	}

	public async updateAccountActivationToken(_id: string, token: string, tokenExpiration: number): Promise<void> {

		AuthService.prototype.doTransaction(async () => {
			await AuthModel.updateOne(
				{
					_id: _id
				},
				{
					accountActivationToken: token,
					accountActivationExpires: tokenExpiration
				}
			).exec()
		})

	}

	public async getUserByPasswordTokenAndUId(token: string, uId: string): Promise<IAuthDocument> {


		const user: IAuthDocument = (await AuthModel.findOne({
			passwordResetToken: token,
			uId: uId,
			passwordResetExpires: { $gt: new Date().getTime() },


		}).exec()) as IAuthDocument

		return user
	}


	public async getUserByAccountActivationTokenAndUId(token: string, uId: string): Promise<IAuthDocument> {

		const user: IAuthDocument = await AuthModel.findOne(
			{
				accountActivationToken: token,
				uId: uId,
				accountActivationExpires: { $gt: new Date().getTime() },


			}).exec() as IAuthDocument



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


	public async getAuthUserById(_id: string): Promise<IAuthDocument> {
		const user: IAuthDocument = (await AuthModel.findOne({ _id: _id }).exec()) as IAuthDocument
		return user
	}

	public async getAuthUserById2(_id: string): Promise<AuthPayload> {
		const user: AuthPayload = (await AuthModel.findOne({ _id: _id }).exec()) as AuthPayload
		return user
	}

}

export const authService: AuthService = new AuthService()
