import { hash, compare } from 'bcryptjs'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { model, Model, Schema } from 'mongoose'

const SALT_ROUND = 10

const authSchema: Schema = new Schema<IAuthDocument>(
	{
		_id: { type: String, required: true },
		username: { type: String },
		uId: { type: String },
		email: { type: String, index: true },
		password: { type: String },
		role: { type: Number, default: 1 },
		avatarColor: { type: String },

		nottifyMeIfUsedInDocumentary: { type: Boolean, default: true },
		listMeInDirectory: { type: Boolean, default: true },
		listMyTestemonials: { type: Boolean, default: true },

		imStatus: { type: Boolean, default: true },

		uniqueUrlForLogin: { type: String },

		lastTimeLogged: { type: Date, default: Date.now },
		isUploaded: { type: Object },

		approvedByAdmin: { type: Boolean, default: false },

		setPassword: { type: Boolean, default: false },

		activatedByEmail: { type: Boolean, default: false },
		accountActivationToken: { type: String },
		accountActivationExpires: { type: Number },

		passwordResetToken: { type: String },
		passwordResetExpires: { type: Number },

		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Object, default: `{[${new Date().toISOString()}]}` },
		deleted: { type: Boolean, default: false }
	},
	{
		toJSON: {
			transform(_doc, ret) {
				delete ret.password
				return ret
			}
		}
	}
)

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
	const hashedPassword: string = await hash(this.password as string, SALT_ROUND)

	this.password = hashedPassword

	next()
})

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	const hashedPassword: string = (this as unknown as IAuthDocument).password!

	return compare(password, hashedPassword)
}

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
	return hash(password, SALT_ROUND)
}

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth')

export { AuthModel }
