
import { Request, Response } from 'express'

import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload'
import { authMockRequest, authMockResponse } from '@mocks/auth.mock'
import { SignUp } from '../user/signup'

import { CustomError } from '@globals/helpers/error-handler'


jest.mock('@services/queues/base.queue')
jest.mock('@services/redis/user.cache')
jest.mock('@services/queues/user.queue')
jest.mock('@services/queues/auth.queue')
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
})
