import { AuthPayload, IAuthDocument, IAuthUpdate } from '@auth/interfaces/auth.interface'
import { Helpers } from '@globals/helpers/helpers'
import { AuthModel } from '@auth/models/auth.schema'
import { config } from '@src/config'
import Logger from 'bunyan'
import mongoose from 'mongoose'

const log: Logger = config.createLogger('authService')
class AuthService {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async doTransaction(callback: any): Promise<void> {
		try {
			let session: mongoose.mongo.ClientSession | null = null
			return AuthModel.createCollection()
				.then(() => AuthModel.startSession())
				.then(async (_session) => {
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

	public async updateAuthUserToDB(data: IAuthUpdate): Promise<void> {
		AuthService.prototype.doTransaction(async () => {
			switch (data.pointer) {
				case 'resendAccountActivation':
					await AuthModel.updateOne(
						{
							_id: data.updateWhere._id,
							uId: data.updateWhere.uId
						},
						{
							activatedByEmail: data.updateWhat?.activatedByEmail,
							accountActivationToken: data.updateWhat?.accountActivationToken,
							accountActivationExpires: data.updateWhat?.accountActivationExpires
						}
					).exec()
					break
				case 'accountActivation':
					await AuthModel.updateOne(
						{
							accountActivationToken: data.updateWhere.accountActivationToken,
							uId: data.updateWhere.uId,
							accountActivationExpires: { $gt: new Date().getTime() }
						},
						{
							activatedByEmail: data.updateWhat?.activatedByEmail,
							accountActivationToken: data.updateWhat?.accountActivationToken,
							accountActivationExpires: data.updateWhat?.accountActivationExpires,
							passwordResetToken: data.updateWhat?.passwordResetToken,
							passwordResetExpires: data.updateWhat?.passwordResetExpires
						}
					).exec()
					break

				case 'setNewPassword':
					await AuthModel.updateOne(
						{
							_id: data.updateWhere._id
						},
						{
							passwordResetToken: data.updateWhat?.passwordResetToken,
							passwordResetExpires: data.updateWhat?.passwordResetExpires
						}
					).exec()
					break

				case 'setAdmin':
					await AuthModel.updateOne(
						{
							_id: data.updateWhere._id
						},
						{
							role: config.CONSTANTS.userRoles.admin
						}
					).exec()

					break

				case 'unsetAdmin':
					await AuthModel.updateOne(
						{
							_id: data.updateWhere._id
						},
						{
							role: config.CONSTANTS.userRoles.user
						}
					).exec()

					break

				case 'approveAccountCreation':
					console.log('sotirrrrrrrrrrrrrr')
					await AuthModel.updateOne(
						{
							_id: data.updateWhere._id
						},
						{
							approvedByAdmin: true
						}
					).exec()

					break

				case 'disapproveAccountCreation':
					await AuthModel.updateOne(
						{
							_id: data.updateWhere._id
						},
						{
							approvedByAdmin: false
						}
					).exec()

					break
			}
		})
	}

	public async createAuthUser(data: IAuthDocument): Promise<void> {
		AuthService.prototype.doTransaction(async () => {
			await AuthModel.create(data)
		})
	}

	public async getUserByPasswordTokenAndUId(token: string, uId: string): Promise<IAuthDocument> {
		const user: IAuthDocument = (await AuthModel.findOne({
			passwordResetToken: token,
			uId: uId,
			passwordResetExpires: { $gt: new Date().getTime() }
		}).exec()) as IAuthDocument

		return user
	}

	public async getUserByAccountActivationTokenAndUIdWithoutExpiration(token: string, uId: string): Promise<IAuthDocument> {
		const user: IAuthDocument = (await AuthModel.findOne({
			accountActivationToken: token,
			uId: uId
		}).exec()) as IAuthDocument

		return user
	}

	public async getUserByAccountActivationTokenAndUId(token: string, uId: string): Promise<IAuthDocument> {
		const user: IAuthDocument = (await AuthModel.findOne({
			accountActivationToken: token,
			uId: uId,
			accountActivationExpires: { $gt: new Date().getTime() }
		}).exec()) as IAuthDocument

		return user
	}

	public async getUserByUsername(username: string): Promise<IAuthDocument> {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((([a-zA-Z\-0-9])+\.+[a-zA-Z]{2,}))$/
		const ok = re.test(username)

		if (ok) {
			return (await AuthModel.findOne({ email: username }).exec()) as IAuthDocument
		}

		return (await AuthModel.findOne({ username }).exec()) as IAuthDocument
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
