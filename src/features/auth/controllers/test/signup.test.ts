
import { Request, Response } from 'express'

import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload'
import { authMockRequest, authMockResponse } from '@mocks/auth.mock'
import { SignUp } from '../user/signup'
/* import { invitationService } from '@services/db/invitations.service' */
import { CustomError } from '@globals/helpers/error-handler'
import HTTP_STATUS from 'http-status-codes'
import { Helpers } from '@globals/helpers/helpers'
import httpMocks from 'node-mocks-http'
jest.mock('@services/queues/base.queue')
jest.mock('@services/redis/user.cache')
jest.mock('@services/db/invitations.service')
jest.mock('@globals/helpers/cloudinary-upload')



describe('SignUp', () => {

	it('should trow an error if username is not available', () => {
		const req: Request = authMockRequest({}, {
			username: '',
			password: 'asdqwE123~~',
			email: 'djmyle@gmail.com',
			avatarColor: 'red',
			avatarImage: '',
			nottifyMeIfUsedInDocumentary: true,
			listMeInDirectory: false,
			listMyTestemonials: true,
			imStatus: true,
			acceptTermsAndConditions: true
		}) as unknown as Request

		const res: Response = authMockResponse()

		SignUp.prototype.create(req, res).catch((error: CustomError) => {
			console.log(error)
		})
	})

	it('Should say that invitation token is not walid', () => {
		const req: Request = authMockRequest({}, {
			username: 'username',
			password: 'asdqwE123~~',
			email: 'djmyle@gmail.com',
			avatarColor: 'red',
			avatarImage: 'sdf',
			nottifyMeIfUsedInDocumentary: true,
			listMeInDirectory: false,
			listMyTestemonials: true,
			imStatus: true,
			acceptTermsAndConditions: true
		}, null, { invitationToken: '9e45d481cea6dd90b11b2d51321e02cca38e9248' }) as unknown as Request

		const res: Response = authMockResponse()

		SignUp.prototype.create(req, res).catch((error: CustomError) => {

			expect(error.statusCode).toEqual(400)
			expect(error.serializeErrors().message).toEqual(Helpers.getPoTranslate('en', 'SIGN_UP_CAN_NOT_FIND_INVITATION_TOKEN'))
		})
	})


	it('Should say that invitation token is expired', () => {
		const req: Request = authMockRequest({}, {
			username: 'username',
			password: 'asdqwE123~~',
			email: 'djmyle2@gmail.com',
			avatarColor: 'red',
			avatarImage: 'sdf',
			nottifyMeIfUsedInDocumentary: true,
			listMeInDirectory: false,
			listMyTestemonials: true,
			imStatus: true,
			acceptTermsAndConditions: true
		}, null, { invitationToken: '9e45d481cea6dd90b11b2d51321e02cca38e9248' }) as unknown as Request





		const res: Response = authMockResponse()

		SignUp.prototype.create(req, res).catch((error: CustomError) => {
			const language: string = req.headers
				? (req.headers['accept-language'] ?? 'en') : 'en'
			expect(error.statusCode).toEqual(400)
			/* 	const response = httpMocks.createResponse()
				const { data } = JSON.parse(response._getData());

				console.log(data);
 */

			expect(error.serializeErrors().message).toEqual(Helpers.getPoTranslate(language, 'SIGN_UP_YOUR_TOKEN_FOR_ACTIVATION_HAS_BEEN_EXPIRED'))
		})
	})
})
