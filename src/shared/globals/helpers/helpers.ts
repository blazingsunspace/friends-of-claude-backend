export class Helpers {
	static firstLetterUppercase(str: string): string {
		const valueString = str.toLocaleLowerCase()
		return valueString
			.split(' ')
			.map((value: string) => `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`)
			.join(' ')
	}

	static lowerCase(str: string): string {
		return str.toLocaleLowerCase()
	}

	static generateRandomIntigers(intigerLenghth: number): number {
		const characters = '0123456789'
		let result = ' '
		const charactersLenght = characters.length
		for (let i = 0; i < intigerLenghth; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLenght))

		}
		return parseInt(result, 10)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static parseJson(prop: string): any {
		try {
			JSON.parse(prop)
		} catch (error) {
			return prop
		}
	}
}
