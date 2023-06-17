import mongoose, { Date, Document } from 'mongoose'
import { ObjectId } from 'mongodb'


export interface IInvitationsDocument extends Document {
	_id: string | ObjectId
	email: string
	username: string
	invitationToken: string
	invitationTokenExpires: number | string
	accountCreated?: boolean
	authId?: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
	invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
	createdAt?: Date
	deleted?: boolean
}

export interface IInvitationsCreate {
	_id: string | ObjectId
	email: string
	username: string
	invitationToken: string
	invitationTokenExpires: number | string
	invitedBy?: string | ObjectId
}

export interface IEmailJob {
	receiverEmail: string
	template: string
	subject: string
}

export interface IAllInvitations {
	users: IInvitationsDocument[]
	totalUsers: number
}
