import HTTP_STATUS from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'

import { AuthPayload, IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { authService } from '@services/db/auth.service'
import { BadRequestError, NotAcceptableError, UserDidNotAcceptTermsAndConditions } from '@globals/helpers/error-handler'
import { Helpers } from '@globals/helpers/helpers'
import { UploadApiResponse } from 'cloudinary'
import { uploads } from '@globals/helpers/cloudinary-upload'
import { IAccountActivateParams, IAccountActivatedParams, IAccountCreatedParams, IUserDocument } from '@user/interfaces/user.interface'
import { UserCache } from '@services/redis/user.cache'
import { omit } from 'lodash'


import JWT from 'jsonwebtoken'
import { config } from '@src/config'

import { accountActivationTemplate } from '@services/emails/templates/account-activation/account-activation-template'
/* import { EmailQueue } from '@services/queues/base.queue' */

import { accountCreatedByAdminTemplate } from '@services/emails/templates/account-created-by-admin/account-created-by-admin-template'

/* import AuthQueue from '@services/queues/auth.queue' */

import { joiValidation } from '@globals/decorators/joi-validation.decorators'
import { signupSchema } from '@auth/schemes/signup'
import { userService } from '@services/db/user.service'
import Logger from 'bunyan'

import { createRandomCharacters } from '@auth/controllers/user/helpers/create-random-characters'
import { IInvitationUpdate, IInvitationsDocument } from '@invitations/interfaces/invitations.interface'
import { invitationService } from '@services/db/invitations.service'
/* import UpdateInvitationQueue from '@services/queues/update-invitation.queue' */
import { accountCteatedTemplate } from '@services/emails/templates/account-created/account-created-template'
import moment from 'moment'
import publicIP from 'ip'
import { SignIn } from './signin'
import { AuthQueue, EmailQueue, UpdateInvitationQueue, UserQueue } from '@services/queues/base.queue'
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

		const language: string = req.headers ? (req.headers['accept-language'] ?? 'en') : 'en'

		if (!acceptTermsAndConditions) {
			throw new UserDidNotAcceptTermsAndConditions(Helpers.getPoTranslate(language, 'SIGN_UP_USER_DID_NOT_ACCEPTED_TERMS_AND_CONDITIONS'))
		}

		const { invitationToken } =  req.params

		let invitationHelp = false

		if (invitationToken) {

			const invitation: IInvitationsDocument = await invitationService.getInvitationByInvitationToken(`${invitationToken}`)


			if (!invitation) {

				const invitationWithoutExpiration: IInvitationsDocument = await invitationService.getInvitationByInvitationTokenWithoutExpiration(
					`${invitationToken}`
				)

				if (!invitationWithoutExpiration) {
					throw new BadRequestError(Helpers.getPoTranslate(language, 'SIGN_UP_CAN_NOT_FIND_INVITATION_TOKEN'))
				}

				res.status(HTTP_STATUS.UNAUTHORIZED).json({
					message: Helpers.getPoTranslate(language, 'SIGN_UP_YOUR_TOKEN_FOR_ACTIVATION_HAS_BEEN_EXPIRED'),
					data: { resendInvitationToken: true }
				})

				return
			} else {
				invitationHelp = true
			}
		} else {
			if (req.headers.authorization) {
				try {
					const payload: AuthPayload = JWT.verify(req.headers.authorization.split(' ')[1], config.JWT_TOKEN!) as AuthPayload

					const existingUser: AuthPayload = await authService.getAuthUserById2(`${payload._id}`)

					const existingProfile: IUserDocument = await userService.getUserByAuthId(`${payload._id}`)

					if (existingUser == null || existingProfile == null) {
						throw new NotAcceptableError(Helpers.getPoTranslate(language, 'SIGN_UP_BEARER_TOKEN_IS_NOT_VALID'))
					}

					if (!(existingUser?.role == config.CONSTANTS.userRoles.admin || existingUser?.role == config.CONSTANTS.userRoles.superAdmin)) {
						throw new NotAcceptableError(Helpers.getPoTranslate(language, 'SIGN_UP_YOU_ALREADY_HAVE_ACCOUNT'))
					}

					existingUser.authId = existingProfile._id
					existingUserHelper = existingUser

					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} catch (error: any) {
					log.error(Helpers.getPoTranslate(language, 'SIGN_UP_BEARER_TOKEN_IS_EXPIRED'), error)
					throw new NotAcceptableError(error)
				}
			}
		}

		const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username)

		if (checkIfUserExist) {
			throw new NotAcceptableError(Helpers.getPoTranslate(language, 'SIGN_UP_USER_ALREADY_EXIST'))
		}

		const authObjectId: ObjectId = new ObjectId()
		const userObjectId: ObjectId = new ObjectId()
		const uId = `${Helpers.generateRandomIntigers(40)}`

		const randomCharacters: string = await createRandomCharacters()

		const approvedByAdmin =
			existingUserHelper
				? existingUserHelper.role == config.CONSTANTS.userRoles.admin || existingUserHelper.role == config.CONSTANTS.userRoles.superAdmin
					? true
					: false
				: false

		const setPassword =
			existingUserHelper && !invitationHelp
				? existingUserHelper.role == config.CONSTANTS.userRoles.admin || existingUserHelper.role == config.CONSTANTS.userRoles.superAdmin
					? true
					: false
				: false

		const authData: IAuthDocument = SignUp.prototype.sigunupData({
			_id: authObjectId,
			uId,
			username,
			email,
			password,
			avatarColor,
			approvedByAdmin: invitationHelp ? true : approvedByAdmin,
			setPassword: invitationHelp ? false : setPassword,
			nottifyMeIfUsedInDocumentary,
			listMeInDirectory,
			listMyTestemonials,
			imStatus,
			accountActivationToken: invitationHelp ? '' : randomCharacters,
			accountActivationExpires: invitationHelp ? 0 : new Date().getTime() + 1000 * 60 * 60,
			activatedByEmail: invitationHelp ? true : false
		})


		const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse

		if (!result?.public_id) {
			throw new BadRequestError(Helpers.getPoTranslate(language, 'SIGN_UP_FILE_UPLOAD_ERROR'))
		}
		//add redis cache
		const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId)
		userDataForCache.profilePicture = `https://res.cloudinary.com/deztrt9eh/image/upload/v${result.version}/${userObjectId}`
		await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache)
		//add to database
		omit(userDataForCache, ['uId', 'username', 'email', 'avatarColour', 'password'])

		new AuthQueue('addAuthUserToDB', authData)
		new UserQueue('addUserToDB', userDataForCache)
		if (invitationHelp) {
			const query: IInvitationUpdate = {
				updateWhere: {
					invitationToken: invitationToken
				},
				updateWhat: {
					authId: authObjectId,
					accountCreated: true,
					invitationToken: '',
					invitationTokenExpires: 0
				},
				pointer: 'validateInvitation'
			}

			new UpdateInvitationQueue('updateInvitationToDB', query)
		}
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
				})
		*/



		if (invitationHelp) {




			const templateParams: IAccountCreatedParams = {
				username: authData.username!,
				email: authData.email!,
				ipaddress: publicIP.address(),
				date: moment().format('DD/MM/YY HH:mm')
			}

			const template: string = accountCteatedTemplate.accountCteatedTemplate(templateParams)

			new EmailQueue('sendAccountCreatedConfirmation', {
				template,
				receiverEmail: authData.email!,
				subject: 'Account Created Confirmation'
			})

		}
		else if (
			existingUserHelper
				? existingUserHelper.role == config.CONSTANTS.userRoles.admin || existingUserHelper.role == config.CONSTANTS.userRoles.superAdmin
				: false
		) {
			const activateLink = `${config.CLIENT_URL}/activate-account?uId=${uId}&token=${randomCharacters}`

			const templateParams: IAccountActivateParams = {
				username: username,
				activateLink: activateLink
			}

			const template: string = accountCreatedByAdminTemplate.accountCreatedByAdminTemplateTemplate(templateParams)

			new EmailQueue('sendAccountCreatedByAdminEmail', { template, receiverEmail: email, subject: 'Account created by admin for you 44' })
		} else {
			const activateLink = `${config.CLIENT_URL}/activate-account?uId=${uId}&token=${randomCharacters}`

			const templateParams: IAccountActivateParams = {
				username: username,
				activateLink: activateLink
			}

			const template: string = accountActivationTemplate.accountActivationTemplate(templateParams)
			new EmailQueue('sendAccountActivationEmail', { template, receiverEmail: email, subject: 'Account activation 44' })
		}

		res.status(HTTP_STATUS.CREATED).json({
			message: 'user created succesfuly, now you can log in',
			user: userDataForCache, data: config.NODE_ENV === 'development' ? { authData } : ''
		})


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
			imStatus,
			activatedByEmail
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
			activatedByEmail,
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
