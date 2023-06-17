import Joi, { ObjectSchema } from 'joi'

const emailSchema: ObjectSchema = Joi.object().keys({
	email: Joi.string().email().required().messages({
		'string.base': 'Field must be valid',
		'string.required': 'Field must be valid',
		'string.email': 'Field must be valid'
	})
})

const passwordSchema: ObjectSchema = Joi.object().keys({
	password: Joi.string()
		.required()
		.pattern(new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[ `!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~]).*$/)),
	confirmPassword: Joi.string()
		.required()
		.valid(Joi.ref('password'))
		.pattern(new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[ `!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~]).*$/))
})

export { emailSchema, passwordSchema }
