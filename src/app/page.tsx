'use client'

import type { LanguageWithMeta } from '@/lib/languages'
import { BookOpen, ChevronDown, Github, Globe, Languages, Linkedin, Twitter, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

type LanguageWithDifficulty = LanguageWithMeta & { difficulty: number; difficultyLabel?: string }

const RatingDots = ({ value }: { value: number }) => {
	const maxDots = 5
	const fullDots = Math.floor(value * (maxDots / 4))
	const partialDot = (value * (maxDots / 4)) % 1
	let emptyDots = maxDots - fullDots - (partialDot > 0 ? 1 : 0)
	emptyDots = emptyDots < 0 ? 0 : emptyDots

	return (
		<div className="flex gap-0.5">
			{/* Full dots */}
			{Array(fullDots)
				.fill(0)
				.map((_, i) => (
					<span key={`full-${i}`} className="text-teal-600">
						●
					</span>
				))}

			{/* Partial dot */}
			{partialDot > 0 && (
				<span className="relative inline-block">
					<span className="text-gray-300">●</span>
					<span className="absolute inset-0 text-teal-600 overflow-hidden" style={{ width: `${partialDot * 100}%` }}>
						●
					</span>
				</span>
			)}

			{/* Empty dots */}
			{Array(emptyDots)
				.fill(0)
				.map((_, i) => (
					<span key={`empty-${i}`} className="text-gray-300">
						●
					</span>
				))}
		</div>
	)
}

const Polypath = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [languages, setLanguages] = useState<LanguageWithMeta[]>([])
	const [selectedLanguages, setSelectedLanguages] = useState<LanguageWithMeta[]>([])
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [recommendations, setRecommendations] = useState<LanguageWithDifficulty[]>([])
	const [isSearching, setIsSearching] = useState<boolean>(false)

	// Derived values
	const filteredLanguages = languages.filter(
		lang => lang.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedLanguages.find(_ => _.name === lang.name)
	)

	useEffect(() => {
		fetch('/api/languages')
			.then(res => res.json())
			.then(data => setLanguages(data.languages))
			.catch(console.error)
			.finally(() => setIsLoading(false))
	}, [])

	// Event Handlers
	const handleLanguageSelect = (language: LanguageWithMeta): void => {
		const newSelected = [...selectedLanguages, language]
		setSelectedLanguages(newSelected)
		setSearchQuery('')
		void fetchRecommendations(newSelected)
	}

	const removeLanguage = (language: string): void => {
		const newSelected = selectedLanguages.filter(lang => lang.name !== language)
		setSelectedLanguages(newSelected)
		void fetchRecommendations(newSelected)
	}

	const fetchRecommendations = async (languages: LanguageWithMeta[]): Promise<void> => {
		if (languages.length === 0) return setRecommendations([])

		setIsSearching(true)

		fetch(`/api/languages?l=${languages.map(lang => lang.name).join(',')}`)
			.then(res => res.json())
			.then(data => {
				setRecommendations(
					data.languages.map((lang: LanguageWithDifficulty) => ({
						...lang
					}))
				)
			})
			.finally(() => setIsSearching(false))
	}

	return (
		<div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl h-screen">
			<div className="w-full max-w-xl mx-auto p-5 space-y-6">
				<div className="text-center space-y-2">
					<div className="flex justify-center mb-4">
						<Globe className="size-8 md:size-12 text-teal-600 animate-spin duration-2000" />
					</div>
					<h1 className="md:text-3xl text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
						Polypath: Find your next language
					</h1>
					<p className="text-gray-600">Select up to three languages you already know</p>
					<p className="text-gray-600 text-xs">
						Calculations based on an interesting approach outlined by{' '}
						<a href="https://www.cysouw.de/home/index.html" className="text-teal-600 font-semibold cursor-pointer">
							Michael Cysouw
						</a>{' '}
						in a{' '}
						<a href="https://library.oapen.org/handle/20.500.12657/23714" className="text-teal-600 font-semibold cursor-pointer">
							2013 paper
						</a>{' '}
						using typological similarity, geographical distance, genealogical relatedness, writing system, and specific grammatical
						features.
					</p>
					<div className="text-xs text-gray-600 flex flex-row gap-3 justify-center items-center">
						<a href="https://x.com/faizanali94" className="cursor-pointer" target="_blank" rel="noreferrer">
							<Twitter className="size-4 cursor-pointer stroke-teal-600" />
						</a>
						<a href="https://www.linkedin.com/in/faizanhali/" className="cursor-pointer" target="_blank" rel="noreferrer">
							<Linkedin className="size-4 cursor-pointer stroke-teal-600" />
						</a>
						<a href="https://github.com/faizan-ali/polypath" className="cursor-pointer" target="_blank" rel="noreferrer">
							<Github className="size-4 cursor-pointer stroke-teal-600" />
						</a>
					</div>
				</div>

				<div className="relative">
					{isLoading ? (
						<div className="flex justify-center">
							<div className="animate-pulse text-teal-600 my-auto">Loading Polypath...</div>
						</div>
					) : (
						<input
							type="text"
							placeholder="Search languages..."
							value={searchQuery}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
							className="w-full px-4 py-2 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-white/80 backdrop-blur-sm"
							disabled={selectedLanguages.length >= 3}
						/>
					)}

					{searchQuery && (
						<div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-teal-100 overflow-hidden z-10 animate-fadeIn">
							{filteredLanguages.map((lang, index) => (
								<div
									key={lang.name}
									onKeyDown={e => e.key === 'Enter' && handleLanguageSelect(lang)}
									onClick={() => handleLanguageSelect(lang)}
									className="px-4 py-2 hover:bg-teal-50 cursor-pointer transition-colors flex items-center space-x-2"
									style={{
										animation: 'slideIn 0.2s ease-out forwards',
										animationDelay: `${index * 0.05}s`
									}}
								>
									<BookOpen className="w-4 h-4 text-teal-600" />
									<span>{lang.name}</span>
									<span className="text-sm text-gray-500 ml-auto">{lang.family}</span>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="space-y-3">
					{selectedLanguages.map(lang => (
						<div key={lang.name} className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 animate-slideIn">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center space-x-2">
									<Languages className="w-5 h-5 text-teal-600" />
									<span className="font-medium">{lang.name}</span>
									<span className="text-sm text-gray-500">({lang.family})</span>
								</div>
								<button
									onClick={() => removeLanguage(lang.name)}
									className="text-gray-400 hover:text-gray-600 transition-colors"
									type="button"
									aria-label={`Remove ${lang}`}
								>
									<X size={18} />
								</button>
							</div>
						</div>
					))}
				</div>

				{isSearching && (
					<div className="flex justify-center">
						<div className="animate-pulse text-teal-600">Finding best matches...</div>
					</div>
				)}

				{recommendations.length > 0 && (
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
							<ChevronDown className="w-5 h-5 text-teal-600" />
							<span>Recommended Languages</span>
						</h2>
						<div className="space-y-2">
							{recommendations.map((lang, index) => (
								<div
									key={lang.name}
									className="p-4 bg-white rounded-lg shadow-sm border border-teal-100 transform hover:scale-102 transition-transform"
									style={{
										animation: 'slideInRight 0.3s ease-out forwards',
										animationDelay: `${index * 0.1}s`,
										opacity: 0,
										transform: 'translateX(-20px)'
									}}
								>
									<div className="flex flex-col gap-3">
										<div className="flex justify-between items-center">
											<div>
												<h3 className="font-medium text-lg">{lang.name}</h3>
												<p className="text-sm text-gray-500">{lang.genus} Family</p>
											</div>
											<div className="text-right flex flex-col gap-1">
												<div className="text-teal-600 font-semibold">{lang.difficultyLabel}</div>
												<div className="flex flex-row items-center gap-1 text-sm text-gray-500">
													Difficulty: <RatingDots value={lang.difficulty} />
												</div>
											</div>
										</div>

										<details className="group">
											<summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors list-none flex items-center gap-1">
												<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
												Learn more
											</summary>
											<p className="text-sm text-gray-600 mt-2 pl-5 animate-expandVertically">{lang.summary?.split('\n')[0]}</p>
										</details>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				<style jsx>{`
					@keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideInRight {
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes spin-slow {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes expandVertically {
                        from {
                            opacity: 0;
                            height: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            height: auto;
                            transform: translateY(0);
                        }
                    }
                `}</style>
			</div>
		</div>
	)
}

export default Polypath
