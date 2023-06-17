import crypto from 'crypto'

async function createRandomCharacters(): Promise<string> {
	const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
	const randomCharacters: string = randomBytes.toString('hex')

	return randomCharacters
}

export { createRandomCharacters }
