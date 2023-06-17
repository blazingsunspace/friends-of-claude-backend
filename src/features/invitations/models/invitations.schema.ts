
import { model, Model, Schema } from 'mongoose'
import { IInvitationsDocument } from '../interfaces/invitations.interface'


const invitationSchema: Schema = new Schema<IInvitationsDocument>(
	{
		_id: { type: String, required: true },

		email: { type: String, index: true },

		invitationToken: { type: String },
		invitationTokenExpires: { type: Number },

		accountCreated: { type: Boolean, default: false },
		authId: { type: String },

		invitedBy: { type: String },

		createdAt: { type: Date, default: Date.now },
		deleted: { type: Boolean, default: false }
	}
)



const InvitationsModel: Model<IInvitationsDocument> = model<IInvitationsDocument>('Invitations', invitationSchema, 'Invitations')

export { InvitationsModel }
