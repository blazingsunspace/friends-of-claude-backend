import { BaseCache } from '@services/redis/base.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import Logger from 'bunyan'
import { config } from '@src/config'
import { ServerError } from '@globals/helpers/error-handler'

import { Helpers } from '@globals/helpers/helpers'
import mongoose, { Date, Document } from 'mongoose'
const log: Logger = config.createLogger('userCache')

export class UserCache extends BaseCache {
	constructor() {
		super('userCache')
	}

	public async saveUserToCache(key: string, userUId: string, createUser: IUserDocument): Promise<void> {

		const {
			_id,
			uId,
			username,
			email,
			avatarColor,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus,
			blocked,
			blockedBy,
			postsCount,
			profilePicture,
			followersCount,
			followingCount,
			notifications,
			work,
			location,
			school,
			quote,
			bgImageId,
			bgImageVersion,
			createdAt,
			updatedAt,
			deleted
		} = createUser

		const firstList: string[] = [
			'_id',
			`${_id}`,
			'uId',
			`${uId}`,
			'username',
			`${username}`,
			'email',
			`${email}`,
			'avatarColor',
			`${avatarColor}`,
			'nottifyMeIfUsedInDocumentary',
			`${nottifyMeIfUsedInDocumentary}`,
			'listMeInDirectory',
			`${listMeInDirectory}`,
			'listMyTestemonials',
			`${listMyTestemonials}`,
			'imStatus',
			`${imStatus}`,
			'createdAt',
			`${createdAt}`,
			'updatedAt',
			`${updatedAt}`,
			'deleted',
			`${deleted}`,
		]

		const secondList: string[] = [
			'postsCount',
			`${postsCount}`,
			'blocked',
			JSON.stringify(blocked),
			'blockedBy',
			JSON.stringify(blockedBy),
			'profilePicture',
			`${profilePicture}`,
			'followersCount',
			`${followersCount}`,
			'followingCount',
			`${followingCount}`,
			'notifications',
			JSON.stringify(notifications),
			'work',
			`${work}`,
			'location',
			`${location}`,
			'school',
			`${school}`,
			'quote',
			`${quote}`,
			'social',
			JSON.stringify(notifications)
		]

		const thirdList: string[] = [
			'work',
			`${work}`,
			'location',
			`${location}`,
			'school',
			`${school}`,
			'quote',
			`${quote}`,
			'bgImageId',
			`${bgImageId}`,
			'bgImageVersion',
			`${bgImageVersion}`
		]

		const dataToSave: string[] = [...firstList, ...secondList, ...thirdList]

		try {
			if (!this.client.isOpen) {
				await this.client.connect()
			}

			await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` })
			await this.client.HSET(`users:${key}`, dataToSave)
		} catch (error) {
			log.error(error)
			throw new ServerError('Server error try again')
		}
	}

	public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
		try {
			if (!this.client.isOpen) {
				await this.client.connect()
			}
		
			const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument
	
			console.log(response, '444444444444', userId)
			

			response.postsCount = Helpers.parseJson(`${response.postsCount}`)
			response.blocked = Helpers.parseJson(`${response.blocked}`)
			response.blockedBy = Helpers.parseJson(`${response.blockedBy}`)
			response.work = Helpers.parseJson(`${response.work}`)
			response.school = Helpers.parseJson(`${response.school}`)
			response.location = Helpers.parseJson(`${response.location}`)
			response.quote = Helpers.parseJson(`${response.quote}`)
			response.notifications = Helpers.parseJson(`${response.notifications}`)
			response.social = Helpers.parseJson(`${response.social}`)
			response.followersCount = Helpers.parseJson(`${response.followersCount}`)
			response.followingCount = Helpers.parseJson(`${response.followingCount}`)
			/* response.createdAt = new Date(JSON.stringify(Helpers.parseJson(`${response.createdAt}`)))  */

			return response
		} catch (error) {
			log.error(error)
			throw new ServerError('Server error, try again.44')
		}
	}


}
