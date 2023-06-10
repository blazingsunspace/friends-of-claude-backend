import Joi, { ObjectSchema } from 'joi'

const signupSchema: ObjectSchema = Joi.object().keys({
	username: Joi.string().required().pattern(new RegExp(/(?=^[^_\n][A-Za-z0-9_]+$)\w{4,50}/)),
	password: Joi.string().required().pattern(new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[ `!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~]).*$/)),
	email: Joi.string().required().email().messages({
		'string.base': 'Email must be of type string',
		'string.email': 'Email must be valid',
		'string.empty': 'Email is a required field'
	}),
	avatarColor: Joi.string().messages({
		'any.required': 'Avatar color is required'
	}),
	avatarImage: Joi.string().messages({
		'any.required': 'Avatar image is required'
	}),
	nottifyMeIfUsedInDocumentary: Joi.bool().required().messages({
		'any.required': 'nottifyMeIfUsedInDocumentary image is required'
	}),
	listMeInDirectory: Joi.bool().required().messages({
		'any.required': 'listMeInDirectory image is required'
	}),
	listMyTestemonials: Joi.bool().required().messages({
		'any.required': 'listMyTestemonials image is required'
	}),
	imStatus: Joi.bool().required().messages({
		'any.required': 'imStatus image is required'
	}),
	acceptTermsAndConditions: Joi.bool().required().messages({
		'any.required': 'acceptTermsAndConditions image is required'
	})
})

export { signupSchema }
