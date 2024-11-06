import { type Language, type LanguageWithMeta, languages as allLanguages, languageData } from '@/lib/languages'
import type { NextRequest } from 'next/server'

// export const dynamic = 'auto'

const calculateLanguageDifficulty = (knownLanguages: Array<Language>, targetLanguage?: Language) => {
	const knownLanguagesInfo = knownLanguages.map(lang => languageData[lang])

	// If targetLanguage is undefined, return a list of easy languages
	if (targetLanguage === undefined) {
		return {
			languages: getEasyLanguages(knownLanguages).languages.map(lang => ({
				...lang,
				// Capitalize each word in the language name
				name: lang.name.replace(/\b\w/g, l => l.toUpperCase())
			}))
		}
	}

	const targetInfo = languageData[targetLanguage]

	// Calculate difficulty scores for each known language
	const difficultyScores = knownLanguagesInfo.map(knownLang => calculateSingleLanguageDifficulty(knownLang, targetInfo))

	// Use the minimum difficulty score (i.e., the most helpful known language)
	const baseDifficulty = Math.min(...difficultyScores)

	// Apply a small bonus for each additional known language
	const multilingualBonus = Math.min(knownLanguagesInfo.length - 1, 3) * 0.2

	// Calculate final difficulty score
	const finalDifficulty = Math.max(1, baseDifficulty - multilingualBonus)

	// Normalize the score to a 1-5 scale
	const normalizedScore = Math.min(Math.max(finalDifficulty, 1), 5)

	return {
		languages: [],
		knownLanguages,
		targetLanguage,
		difficultyScore: normalizedScore.toFixed(2),
		interpretation: interpretDifficulty(normalizedScore)
	}
}

const calculateSingleLanguageDifficulty = (knownLang: LanguageWithMeta, targetLang: LanguageWithMeta) => {
	let langDifficulty = 0

	// Genealogical factors
	if (knownLang.family !== targetLang.family) {
		langDifficulty += 2 // Different language family
	} else if (knownLang.genus !== targetLang.genus) {
		langDifficulty += 1 // Same family, different genus
	}

	// Writing system
	if (knownLang.script !== targetLang.script) {
		langDifficulty += 1.5
	}

	// Structural factors
	const featureDifferences = Object.keys(knownLang.features)
		// @ts-expect-error This is fine
		.filter(key => knownLang.features[key] !== targetLang.features[key]).length
	langDifficulty += featureDifferences * 0.5

	return langDifficulty
}

const getEasyLanguages = (knownLanguages: Array<Language>) => {
	const allLanguages = Object.keys(languageData) as Array<Language>
	const knownLanguagesInfo = knownLanguages.map(lang => languageData[lang])

	return {
		knownLanguages: knownLanguagesInfo,
		languages: allLanguages
			.map(lang => {
				const targetInfo = languageData[lang]
				const difficultyScores = knownLanguagesInfo.map(knownLang => calculateSingleLanguageDifficulty(knownLang, targetInfo))

				const baseDifficulty = Math.min(...difficultyScores)
				const multilingualBonus = Math.min(knownLanguagesInfo.length - 1, 3) * 0.2
				const finalDifficulty = Math.max(1, baseDifficulty - multilingualBonus) + 0.5

				return {
					...languageData[lang],
					difficulty: finalDifficulty,
					difficultyLabel: interpretDifficulty(finalDifficulty)
				}
			})
			.filter(lang => lang.difficulty < 4)
			.filter(lang => !knownLanguages.includes(lang.name.toLowerCase() as Language))
			.sort((a, b) => a.difficulty - b.difficulty)
	}
}

const interpretDifficulty = (score: number) => {
	if (score < 1.5) return 'Easiest'
	if (score < 2) return 'Fairly Easy'
	if (score < 3.5) return 'Moderate'
	if (score < 4) return 'Difficult'
	return 'Very Difficult'
}

export const GET = (req: NextRequest) => {
	const l = req.nextUrl.searchParams.get('l')

	// Getting list of languages
	if (!l) {
		return Response.json({
			languages: Object.entries(languageData).map(([key, { genus }]) => {
				return {
					family: genus,
					name: key.replace(/\b\w/g, l => l.toUpperCase())
				}
			})
		})
	}

	const languages = (l as string).split(',').map(lang => lang.toLowerCase()) as Language[]

	for (const lang of languages) {
		if (!(allLanguages as string[]).includes(lang)) {
			return Response.json({ error: 'Language not found' }, { status: 404 })
		}
	}

	const result = calculateLanguageDifficulty(languages)

	return Response.json({ languages: result.languages })
}
