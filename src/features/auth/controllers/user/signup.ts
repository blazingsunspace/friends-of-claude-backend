import HTTP_STATUS from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'

import { AuthPayload, IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { authService } from '@services/db/auth.service'
import { BadRequestError, NotAcceptableError, UserDidNotAcceptTermsAndConditions } from '@globals/helpers/error-handler'
import { Helpers } from '@globals/helpers/helpers'
import { UploadApiResponse } from 'cloudinary'
import { uploads } from '@globals/helpers/cloudinary-upload'
import { IAccountActivateParams, IUserDocument } from '@user/interfaces/user.interface'
import { UserCache } from '@services/redis/user.cache'
import { omit } from 'lodash'

import UserQueue from '@services/queues/user.queue'
import JWT from 'jsonwebtoken'
import { config } from '@src/config'

import { accountActivationTemplate } from '@services/emails/templates/account-activation/account-activation-template'
import EmailQueue from '@services/queues/email.queue'

import crypto from 'crypto'

import { accountCreatedByAdminTemplate } from '@services/emails/templates/account-created-by-admin/account-created-by-admin-template'

import AuthQueue from '@services/queues/auth.queue'

import { joiValidation } from '@globals/decorators/joi-validation.decorators'
import { signupSchema } from '@auth/schemes/signup'
import { userService } from '@services/db/user.service'
import Logger from 'bunyan'
import { createRandomCharacters } from './helpers/create-random-characters'

const userCache: UserCache = new UserCache()

const log: Logger = config.createLogger('signUpController')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let existingUserHelper: any

export class SignUp {
	@joiValidation(signupSchema)
	public async create(req: Request, res: Response): Promise<void> {
		const {
			username,
			email,
			password,
			avatarColor,
			avatarImage,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus,
			acceptTermsAndConditions
		} = req.body

		if (!acceptTermsAndConditions) {
			throw new UserDidNotAcceptTermsAndConditions('User did not accepted terms and conditions')
		}

		const checkIfUserExist: IAuthDocument = await authService.getUserByUsername(username)


		if (req.headers.authorization) {
			try {
				const payload: AuthPayload = JWT.verify(req.headers.authorization.split(' ')[1], config.JWT_TOKEN!) as AuthPayload

				const existingUser: AuthPayload = await authService.getAuthUserById2(`${payload._id}`)

				const existingProfile: IUserDocument = await userService.getUserByAuthId(`${payload._id}`)

				if (existingUser == null || existingProfile == null) {
					throw new NotAcceptableError('Bearer token is not valid')
				}

				if (!(existingUser.role == config.CONSTANTS.userRoles.admin || existingUser.role == config.CONSTANTS.userRoles.superAdmin)) {
					throw new NotAcceptableError('You allready have account, you can not use sing up route')
				}

				existingUser.authId = existingProfile._id
				existingUserHelper = existingUser

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (error: any) {
				log.error('Bearer token is expired', error)
				throw new NotAcceptableError(error)
			}
		}


		if (checkIfUserExist) {
			throw new NotAcceptableError('User Allready Exist')
		}

		const authObjectId: ObjectId = new ObjectId()
		const userObjectId: ObjectId = new ObjectId()
		const uId = `${Helpers.generateRandomIntigers(40)}`


		const randomCharacters: string = await createRandomCharacters()

		const authData: IAuthDocument = SignUp.prototype.sigunupData({
			_id: authObjectId,
			uId,
			username,
			email,
			password,
			avatarColor,
			approvedByAdmin:
				existingUserHelper ? (existingUserHelper.role == config.CONSTANTS.userRoles.admin || existingUserHelper.role == config.CONSTANTS.userRoles.superAdmin
					? true
					: false) : false,
			setPassword:
				existingUserHelper ? (existingUserHelper.role == config.CONSTANTS.userRoles.admin || existingUserHelper.role == config.CONSTANTS.userRoles.superAdmin
					? true
					: false) : false,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus,
			accountActivationToken: randomCharacters,
			accountActivationExpires: new Date().getTime() + 1000 * 60 * 60
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

		new AuthQueue('addAuthUserToDB', authData)
		new UserQueue('addUserToDB', userDataForCache)

		/*
		const prisma = new PrismaClient({
			log: ['query']
		})


		async function main() {
			const data: AuthPostgres = {
				data: {
					email: 'ariadne@prisma.io',
					username: 'Ariadne',
					role: 'USER',
					password: 'milner'
				},
			} as unknown as AuthPostgres
			const profile = await prisma.user.create(data)
		}

		main()
			.then(async () => {
				await prisma.$disconnect()
			})
			.catch(async (e) => {
				console.error(e)
				await prisma.$disconnect()
				process.exit(1)
			}) */



		if (existingUserHelper ? (existingUserHelper.role == config.CONSTANTS.userRoles.admin || existingUserHelper.role == config.CONSTANTS.userRoles.superAdmin) : false) {
			const activateLink = `${config.CLIENT_URL}/activate-account?uId=${uId}&token=${randomCharacters}`

			const templateParams: IAccountActivateParams = {
				username: username,
				activateLink: activateLink
			}

			const template: string = accountCreatedByAdminTemplate.accountCreatedByAdminTemplateTemplate(templateParams)

			new EmailQueue('sendAccountCreatedByAdminEmail', { template, receiverEmail: email, subject: 'Account activation 44' })
		} else {
			const activateLink = `${config.CLIENT_URL}/activate-account?uId=${uId}&token=${randomCharacters}`

			const templateParams: IAccountActivateParams = {
				username: username,
				activateLink: activateLink
			}

			const template: string = accountActivationTemplate.accountActivationTemplate(templateParams)
			new EmailQueue('sendAccountActivationEmail', { template, receiverEmail: email, subject: 'Account activation 44' })
		}

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
				nottifyMeIfUsedInDocumentary: data.nottifyMeIfUsedInDocumentary,
				listMeInDirectory: data.listMeInDirectory,
				listMyTestemonials: data.listMyTestemonials,
				imStatus: data.imStatus,
				role: data.role
			},
			config.JWT_TOKEN!
		)
	}

	private sigunupData(data: ISignUpData): IAuthDocument {
		const {
			_id,
			username,
			email,
			uId,
			password,
			avatarColor,
			accountActivationToken,
			accountActivationExpires,
			nottifyMeIfUsedInDocumentary,
			approvedByAdmin,
			setPassword,
			listMeInDirectory,
			listMyTestemonials,
			imStatus
		} = data
		const currentTimestam = new Date()
		return {
			_id,
			uId,
			username: username,
			email: email,
			password,
			avatarColor,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus,
			approvedByAdmin,
			setPassword,
			createdAt: currentTimestam,
			updatedAt: currentTimestam,
			accountActivationToken,
			accountActivationExpires
		} as unknown as IAuthDocument
	}

	private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
		const {
			_id,
			username,
			email,
			uId,
			password,
			avatarColor,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus
		} = data
		const currentTimestam = new Date()
		return {
			_id: userObjectId,
			authId: _id,
			uId,
			username: username,
			email,
			password,
			avatarColor,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus,
			createdAt: currentTimestam,
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
