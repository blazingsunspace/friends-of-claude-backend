import mongoose from 'mongoose'

import Logger from 'bunyan'
import { config } from '@root/config'

const log: Logger = config.createLogger('database')

export default function () {
	const connect = function () {
		mongoose
			.connect(`${config.DATABASE_URL}`)
			.then(function () {
				log.info('success connected to mongo db')
			})
			.catch(function (error) {
				log.error('error connecting to database', error)
				return process.exit(1)
			})
	}
	connect()

	mongoose.connection.on('disconected', connect)
}

/* import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() */
/* async function main() {
    // ... you will write your Prisma Client queries here
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }) */
