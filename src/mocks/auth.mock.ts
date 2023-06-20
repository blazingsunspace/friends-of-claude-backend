import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { Response } from 'express'


export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: ISignUpData | null, params?: any) => ({
	sessionData: sessionData,
	body,
	params,
	currentUser
})
const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => { });
export const authMockResponse = (): Response => {
	const res: Response = {} as Response
	res.status = jest.fn().mockReturnValue(res)
	res.json = jest.fn().mockReturnValue(res)
	console.warn = jest.fn()
	expect(console.warn).toHaveBeenCalled()
	return res
}
export interface IJWT {
	jwt?: string
}

export interface IAuthMock {
	_id?: string;
	username?: string;
	email?: string;
	uId?: string;
	password?: string;
	avatarColor?: string;
	avatarImage?: string;
	createdAt?: Date | string;
	currentPassword?: string;
	newPassword?: string;
	confirmPassword?: string;
	quote?: string;
	work?: string;
	school?: string;
	location?: string;
	facebook?: string;
	instagram?: string;
	twitter?: string;
	youtube?: string;
	messages?: boolean;
	reactions?: boolean;
	comments?: boolean;
	follows?: boolean;
	acceptTermsAndConditions?: boolean

	nottifyMeIfUsedInDocumentary?: boolean
	listMeInDirectory?: boolean
	listMyTestemonials?: boolean

	imStatus?: boolean
	uniqueUrlForLogin?: string

	lastTimeLogged?: Date
	isUploaded?: object

	approvedByAdmin?: boolean

	setPassword?: boolean

	activatedByEmail?: boolean
	accountActivationToken?: string
	accountActivationExpires?: number | string

	passwordResetToken?: string
	passwordResetExpires?: number | string


	updatedAt?: Date
	deleted?: boolean

}

export const authUserPayload: ISignUpData = {
	_id: '60263f14648fed5246e322d9',
	uId: '1621613119252066',
	username: 'Manny',
	email: 'manny@me.com',
	avatarColor: '#9c27b0',
	nottifyMeIfUsedInDocumentary: true,
	listMeInDirectory: true,
	listMyTestemonials: true,
	imStatus: true,
	password: '123',
	acceptTermsAndConditions: true
}

export const authMock = {
	_id: '60263f14648fed5246e322d3',
	uId: '1621613119252066',
	username: 'Manny',
	email: 'manny@me.com',
	avatarColor: '#9c27b0',
	createdAt: '2022-08-31T07:42:24.451Z',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	save: () => { },
	comparePassword: () => false
} as unknown as IAuthDocument


export const signUpMockData = {
	_id: '648f40b0a06779ee85e34f23',
	uId: '1.356930062207187e+39',
	username: 'milner',
	email: 'djmyle@gmail.com',
	avatarColor: 'red',
	password: 'asdqwE123~~',
	birthDay: { year: '', month: '', day: '' },
	postCount: 0,
	grender: '',
	quotes: '',
	about: '',
	relationship: '',
	blocked: [],
	blockedBy: [],
	bgImageVersion: '',
	bgImageId: '',
	work: [],
	school: [],
	placesLived: [],
	createdAt: new Date(),
	followersCount: 0,
	followingCount: 0,
	notifications: { messages: true, reactions: true, cpmments: true, follows: true },
	profilePicture: 'https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk='
}
