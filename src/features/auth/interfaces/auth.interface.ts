import { Document } from 'mongoose'
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
	userId: string
	uId: string
	email: string
	role: number
	username: string
	avatarColor: string
	iat?: number
}

export interface ActivateAccountDocument extends Document {
	uId: string
	username: string
	email: string
	activatedByEmail: boolean
	accountActivationToken?: string
	accountActivationExpires?: number | string

}

export interface IAuthDocument extends Document {
	_id: string | ObjectId
	uId: string
	username: string
	email: string
	password?: string
	role: number
	avatarColor: string
	createdAt: Date
	activatedByEmail: boolean
	approvedByAdmin: boolean
	accountActivationToken?: string
	accountActivationExpires?: number | string
	passwordResetToken?: string
	passwordResetExpires?: number | string
	comparePassword(password: string): Promise<boolean>
	hashPassword(password: string): Promise<string>
}

export interface ISignUpData {
	_id: ObjectId
	uId: string
	email: string
	username: string
	password: string
	avatarColor: string,
	accountActivationToken: string,
	accountActivationExpires: number
}

export interface IAuthJob {
	value?: string | IAuthDocument | IUserDocument
}
