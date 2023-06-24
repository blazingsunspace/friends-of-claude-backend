import mongoose, { Date, Document } from 'mongoose'
import { ObjectId } from 'mongodb'

export interface IUserDocument extends Document {
	_id: string | ObjectId
	authId: string | ObjectId
	username?: string
	email?: string
	password?: string
	avatarColor?: string
	uId?: string
	nottifyMeIfUsedInDocumentary?: boolean
	listMeInDirectory?: boolean
	listMyTestemonials?: boolean
	imStatus?: boolean
	firstName: string
	middleName: string
	lastName: string
	postsCount: number
	work: string
	school: string
	quote: string
	location: string
	blocked: mongoose.Types.ObjectId[]
	blockedBy: mongoose.Types.ObjectId[]
	followersCount: number
	followingCount: number
	notifications: INotificationSettings
	social: ISocialLinks
	bgImageVersion: string
	bgImageId: string
	profilePicture: string
	createdAt: Date
	updatedAt: Date
	deleted: boolean
}

export interface IResetPasswordParams {
	username: string
	email: string
	ipaddress: string
	date: string
}
export interface IAccountApproveParams {
	username: string
}

export interface IInviteUserParams {
	username: string
	activateLink: string
}

export interface IAccountDisapproveParams {
	username: string
}
export interface IAccountActivateParams {
	username: string
	activateLink: string
}

export interface IAccountPromotedToAdmin {
	username: string
	date: string
}

export interface IAccountActivatedParams {
	username: string
	email: string
	ipaddress: string
	date: string
}
export interface IAccountCreatedParams {
	username: string
	email: string
	ipaddress: string
	date: string
}

export interface INotificationSettings {
	messages: boolean
	reactions: boolean
	comments: boolean
	follows: boolean
}

export interface IBasicInfo {
	quote: string
	work: string
	school: string
	location: string
}

export interface ISocialLinks {
	facebook: string
	instagram: string
	twitter: string
	youtube: string
}

export interface ISearchUser {
	_id: string
	profilePicture: string
	username: string
	email: string
	avatarColor: string
}

export interface ISocketData {
	blockedUser: string
	blockedBy: string
}

export interface ILogin {
	userId: string
}

export interface IUserJobInfo {
	key?: string
	value?: string | ISocialLinks
}

export interface IUserJob {
	keyOne?: string
	keyTwo?: string
	key?: string
	value?: string | INotificationSettings | IUserDocument
}

export interface IEmailJob {
	receiverEmail: string
	template: string
	subject: string
}

export interface IAllUsers {
	users: IUserDocument[]
	totalUsers: number
}
