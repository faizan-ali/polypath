'use client'

import { TriangleAlert } from 'lucide-react'

export default function GlobalError() {
	return (
		<div className="flex h-dvh flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
			<div className="mx-auto flex flex-col items-center gap-8 space-y-4 text-center">
				<div className="flex items-center justify-center">
					<TriangleAlert className="size-16 text-red-500" />
				</div>
				<h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl dark:text-gray-50">
					Oops, something went wrong!
				</h1>
				<p className="text-lg text-gray-500 dark:text-gray-400">
					We&apos;re sorry, but it looks like there was an error on our end. Please try again later or contact us if the
					problem persists.
				</p>
			</div>
		</div>
	)
}
