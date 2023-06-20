import { Date, Document } from 'mongoose'
import { ObjectId } from 'mongodb'
import { IUserDocument } from '@user/interfaces/user.interface'

declare global {
	namespace Express {
		interface Request {
			currentUser?: AuthPayload
		}
	}
}

export interface AuthPayload {
	_id: string | ObjectId
	authId?: string | ObjectId
	uId?: string
	email?: string
	role?: number
	username?: string
	avatarColor?: string
	approvedByAdmin?: boolean
	setPassword?: boolean
	activatedByEmail?: boolean
	iat?: number
}

export interface AuthPostgres {
	email: string
	role: string
	username: string
	password: string
}

export interface ActivateAccountDocument extends Document {
	uId: string
	username: string
	email: string
	activatedByEmail: boolean
	accountActivationToken?: string
	accountActivationExpires?: number | string
}
export interface IAuthUpdate {
	updateWhere: IUpdateAuthActivationUpdateWhere
	updateWhat?: IUpdateAuthActivationUpdateWhat
	pointer: string
}

export interface IUpdateAuthActivationUpdateWhere {
	_id?: string

	uId?: string
	accountActivationToken?: string
}
export interface IUpdateAuthActivationUpdateWhat {
	activatedByEmail?: boolean
	accountActivationToken?: string
	accountActivationExpires?: number

	passwordResetToken?: string | undefined
	passwordResetExpires?: number | undefined
}

export interface IAuthDocument extends Document {
	_id: string | ObjectId
	uId: string
	username: string
	email: string
	password?: string
	role: number
	avatarColor: string

	nottifyMeIfUsedInDocumentary: boolean
	listMeInDirectory: boolean
	listMyTestemonials: boolean

	imStatus: boolean
	uniqueUrlForLogin: string

	lastTimeLogged: Date
	isUploaded: object
	acceptTermsAndConditions: boolean
	approvedByAdmin: boolean

	setPassword: boolean

	activatedByEmail: boolean
	accountActivationToken?: string
	accountActivationExpires?: number | string

	passwordResetToken?: string
	passwordResetExpires?: number | string

	createdAt: Date
	updatedAt: Date
	deleted: boolean

	comparePassword(password: string): Promise<boolean>
	hashPassword(password: string): Promise<string>
}

export interface ISignUpData {
	_id: ObjectId | string
	uId: string
	email: string
	username: string
	password: string
	avatarColor: string
	avatarImage?: string
	nottifyMeIfUsedInDocumentary: boolean
	listMeInDirectory: boolean
	listMyTestemonials: boolean
	imStatus: boolean
	accountActivationToken?: string
	accountActivationExpires?: number
	approvedByAdmin?: boolean
	setPassword?: boolean
	activatedByEmail?: boolean,
	acceptTermsAndConditions?:boolean
}

export interface IAuthJob {
	value?: string | IAuthDocument | IUserDocument
}
