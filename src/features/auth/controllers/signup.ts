import HTTP_STATUS from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { joiValidation } from '@globals/decorators/joi-validation.decorators'
import { signupSchema } from '@auth/schemes/signup'
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { authService } from '@services/db/auth.service'
import { BadRequestError, NotAcceptableError } from '@globals/helpers/error-handler'
import { Helpers } from '@globals/helpers/helpers'
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { uploads } from '@globals/helpers/cloudinary-upload'
import { IAccountActivateParams, IUserDocument } from '@user/interfaces/user.interface'
import { UserCache } from '@services/redis/user.cache'
import { omit } from 'lodash'
import { authQueue } from '@services/queues/auth.queue'
import { userQueue } from '@services/queues/user.queue'
import JWT from 'jsonwebtoken'
import { config } from '@root/config'
import publicIP from 'ip'
import moment from 'moment'
import { accountActivationTemplate } from '@services/emails/templates/account-activation/account-activation-template'
import { emailQueue } from '@services/queues/email.queue'

import crypto from 'crypto'
import { AuthModel } from '@auth/models/auth.schema'

const userCache: UserCache = new UserCache()

export class SignUp {
	@joiValidation(signupSchema)
	public async create(req: Request, res: Response): Promise<void> {
		const { username, email, password, avatarColor, avatarImage } = req.body

		const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email)
		if (checkIfUserExist) {
			throw new NotAcceptableError('User Allready Exist')
		}

		const authObjectId: ObjectId = new ObjectId()
		const userObjectId: ObjectId = new ObjectId()
		const uId = `${Helpers.generateRandomIntigers(40)}`

		const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
		const randomCharacters: string = randomBytes.toString('hex')


		const activateLink = `${config.CLIENT_URL}/reset-password?uId=${uId}&token=${randomCharacters}`

		const templateParams: IAccountActivateParams = {
			username: username,
			activateLink: activateLink
		}

		const template: string = accountActivationTemplate.accountActivationTemplate(templateParams)
		emailQueue.addEmailJob('sendEmail', { template, receiverEmail: email, subject: 'Account activation 44' })

		const authData: IAuthDocument = SignUp.prototype.sigunupData({
			_id: authObjectId,
			uId,
			username,
			email,
			password,
			avatarColor,
			accountActivationToken: randomCharacters,
			accountActivationExpires: Date.now() + 60 * 60 * 1000
		})

		const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse

		if (!result?.public_id) {
			throw new BadRequestError('File upload: error occured. try again.')
		}

		//add redis cache
		const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId)
		userDataForCache.profilePicture = `https://res.cloudinary.com/deztrt9eh/image/upload/v${result.version}/${userObjectId}`
		await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache)

		//add to database
		omit(userDataForCache, ['uId', 'username', 'email', 'avatarColour', 'password'])
		authQueue.addAuthUserJob('addAuthUserToDB', { value: authData })
		userQueue.addUserJob('addUserToDB', { value: userDataForCache })


		res.status(HTTP_STATUS.CREATED).json({ message: 'user created succesfuly', user: userDataForCache })
	}

	private signupToken(data: IAuthDocument, userObjectId: ObjectId): string {
		return JWT.sign(
			{
				userId: userObjectId,
				uId: data.uId,
				email: data.email,
				username: data.username,
				avatarColor: data.avatarColor,
				role: data.role,
			},
			config.JWT_TOKEN!
		)
	}

	private sigunupData(data: ISignUpData): IAuthDocument {
		const { _id, username, email, uId, password, avatarColor, accountActivationToken, accountActivationExpires } = data

		return {
			_id,
			uId,
			username: Helpers.firstLetterUppercase(username),
			email: Helpers.lowerCase(email),
			password,
			avatarColor,
			createdAt: new Date(),
			accountActivationToken,
			accountActivationExpires
		} as IAuthDocument
	}

	private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
		const { _id, username, email, uId, password, avatarColor } = data

		return {
			_id: userObjectId,
			authId: _id,
			uId,
			username: Helpers.firstLetterUppercase(username),
			email,
			password,
			avatarColor,
			profilePicture: '',
			blocked: [],
			blockedBy: [],
			work: '',
			location: '',
			school: '',
			quote: '',
			bgImageVersion: '',
			bgImageId: '',
			followersCount: 0,
			followingCount: 0,
			postsCount: 0,
			notifications: {
				messages: true,
				reactions: true,
				comments: true,
				follows: true
			},
			social: {
				facebook: '',
				instagram: '',
				twitter: '',
				youtube: ''
			}
		} as unknown as IUserDocument
	}
}
