
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import Logger from 'bunyan'
import sendGridMail from '@sendgrid/mail'
import { config } from '@root/config'
import { BadRequestError } from '@globals/helpers/error-handler'

interface IMailOptions {
	from: string
	to: string
	subject: string
	html: string
}

const log: Logger = config.createLogger('mailOptions')


sendGridMail.setApiKey(config.SENDGRID_API_KEY!)

class MailTransport {


	public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
		if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
			this.developmentEmailSneder(receiverEmail, subject, body)
		} else {
			this.productionEmailSneder(receiverEmail, subject, body)
		}
	}

	private async productionEmailSneder(receiverEmail: string, subject: string, body: string): Promise<void> {

		const mailOptions: IMailOptions = {
			from: `Friends Of Claude <${config.SENDER_EMAIL}>`,
			to: receiverEmail,
			subject,
			html: body
		}

		try {
			await sendGridMail.send(mailOptions)
			log.info('Production email send')
		} catch (error) {
			log.error('Error sending email - production', error)
			throw new BadRequestError('Error sending email - production')
		}


	}
	private async developmentEmailSneder(receiverEmail: string, subject: string, body: string): Promise<void> {
		// create reusable transporter object using the default SMTP transport
		const transporter: Mail = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: config.SENDER_EMAIL, // generated ethereal user
				pass: config.SENDER_EMAIL_PASSWORD, // generated ethereal password
			},
		})


		const mailOptions: IMailOptions = {
			from: `Friends Of Claude <${config.SENDER_EMAIL}>`,
			to: receiverEmail,
			subject,
			html: body
		}

		try {
			await transporter.sendMail(mailOptions)
			log.info('Development email send')
		} catch (error) {
			log.error('Error sending email - Development', error)
			throw new BadRequestError('Error sending email - Development')
		}


	}
}

export const mailTransport: MailTransport = new MailTransport()
