import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { AuthModel } from '@auth/models/auth.schema'
import { IUserDocument } from '@user/interfaces/user.interface'
import { UserModel } from '@user/models/user.schema'

import mongoose from 'mongoose'
import { config } from '@src/config'
import Logger from 'bunyan'

const log: Logger = config.createLogger('userService')

class UserService {
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

	public async addUserData(data: IUserDocument): Promise<void> {
		UserService.prototype.doTransaction(async () => {
			await UserModel.create(data)
		})
	}

	public async getAccountCreationRequests(): Promise<IAuthDocument> {
		const users: IAuthDocument = (await AuthModel.find({ approvedByAdmin: false }).exec()) as unknown as IAuthDocument

		return users
	}
	public async getApprovedAccountsList(): Promise<IAuthDocument> {
		const users: IAuthDocument = (await AuthModel.find({
			approvedByAdmin: true,
			role: { $nin: [2, 5] }
		}).exec()) as unknown as IAuthDocument

		return users
	}

	public async approveUser(_id: string) {
		UserService.prototype.doTransaction(async () => {
			await AuthModel.updateOne({ _id: _id }, { approvedByAdmin: true }).exec()
		})
	}

	public async setAdmin(_id: string) {
		UserService.prototype.doTransaction(async () => {
			await AuthModel.updateOne({ _id: _id }, { role: 2 }).exec()
		})
	}

	public async disapproveUser(_id: string) {
		UserService.prototype.doTransaction(async () => {
			await AuthModel.updateOne({ _id: _id }, { approvedByAdmin: false }).exec()
		})
	}

	public async getUserById(userId: string): Promise<IUserDocument> {
		const users: IUserDocument[] = await UserModel.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(userId) } },
			{ $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
			{ $unwind: '$authId' },
			{ $project: this.aggrigateProject() }
		])

		return users[0]
	}

	public async getUserByUId(uId: string): Promise<IUserDocument> {
		const user: IUserDocument = UserModel.findOne({ uId }).exec() as unknown as IUserDocument

		return user
	}

	public async getUserByAuthId(authId: string): Promise<IUserDocument> {
		const user: IUserDocument = UserModel.findOne({ authId: authId }).exec() as unknown as IUserDocument

		return user
	}

	private aggrigateProject() {
		return {
			_id: 1,
			username: '$authId.username',
			uId: '$authId.uId',
			email: '$authId.email',
			avatarColor: '$authId.avatarColor',
			nottifyMeIfUsedInDocumentary: '$authId.nottifyMeIfUsedInDocumentary',
			listMeInDirectory: '$authId.listMeInDirectory',
			listMyTestemonials: '$authId.listMyTestemonials',
			imStatus: '$authId.imStatus',
			firstName: 1,
			middleName: 1,
			lastName: 1,
			postsCount: 1,
			work: 1,
			school: 1,
			quote: 1,
			location: 1,
			blocked: 1,
			blockedBy: 1,
			followersCount: 1,
			followingCount: 1,
			notifications: 1,
			social: 1,
			bgImageVersion: 1,
			activated: 1,
			profilePicture: 1,
			createdAt: 1,
			updatedAt: 1,
			deleted: 1
		}
	}
}

export const userService: UserService = new UserService()
