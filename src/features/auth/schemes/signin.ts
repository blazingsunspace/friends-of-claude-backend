import Joi, { ObjectSchema } from 'joi'

const loginSchema: ObjectSchema = Joi.object().keys({
	username: Joi.string()
		.required()
		.pattern(new RegExp(/(?=^[^_\n][A-Za-z0-9_]+$)\w{4,50}/)),
	password: Joi.string()
		.required()
		.pattern(new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[ `!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~]).*$/))
})

export { loginSchema }
