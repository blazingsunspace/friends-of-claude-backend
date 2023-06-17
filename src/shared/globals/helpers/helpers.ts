import { config } from '@src/config'


export class Helpers {
	static firstLetterUppercase(str: string): string {
		const valueString = str.toLocaleLowerCase()
		return valueString
			.split(' ')
			.map((value: string) => `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`)
			.join(' ')
	}

	static lowerCase(str: string): string {
		return str === '' ? '' : str.toLocaleLowerCase()
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
	/*

		Helpers.getPoTranslate('en', 'test 2')
		Helpers.getPoTranslate('en', 'test 3', JSON.stringify({ 'variable': 'milner' }))
		Helpers.getPoTranslate('de', 'test 3', JSON.stringify({ 'variable': 'milner' }))
		Helpers.getPoTranslate('de', 'test 4', JSON.stringify({ 'variable': 'milner', 'variable1': 'pilner' }))
		Helpers.getPoTranslate('en', 'test 4', JSON.stringify({ 'variable': 'milner', 'variable1': 'pilner' }))

	*/
	static getPoTranslate(language: string, poTranslateStringName: string, poArgs = '') {

		const i18n = JSON.parse(config.I18N)



		if (poArgs.length > 0) {


			if (typeof i18n[language] !== 'undefined' && typeof i18n[language] === 'object') {
				const result = i18n[language].filter((term: any) => term.term === poTranslateStringName)
				const resultPoString = result[0]?.definition.one ? result[0]?.definition.one : result[0]?.definition


				if (typeof resultPoString !== 'undefined' && resultPoString.length > 0) {


					const splitPoTag = resultPoString.split(':')
					let translatedWithArgs = ''


					for (let i = 0; i < splitPoTag.length - 1; i++) {




						const position = splitPoTag[i + 1].indexOf(' ')

						splitPoTag[i + 1] = JSON.parse(poArgs)[splitPoTag[i + 1].split(' ')[0]] + splitPoTag[i + 1].slice(position)
					}


					for (let i = 0; i < splitPoTag.length; i++) {
						translatedWithArgs += splitPoTag[i]
					}

					return translatedWithArgs
				}
			}
			return poTranslateStringName
		}

		if (typeof i18n[language] !== 'undefined' && typeof i18n[language] === 'object') {

			const result = i18n[language].filter((term: any) => term.term === poTranslateStringName)
			const resultPoString = result[0]?.definition

			if (typeof resultPoString !== 'undefined' && resultPoString.length > 0) {
				return resultPoString
			}
		}

		return poTranslateStringName
	}
}
