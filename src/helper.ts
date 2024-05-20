const dupMarker = {
	start: "![[[",
	end: "]]]!",
} as const

export const addDupMarker = (text: string, count: number) =>
	`${text}${dupMarker.start}${count}${dupMarker.end}`

export const removeDupMarker = (text: string) =>
	text.endsWith(dupMarker.end)
		? text.substring(0, text.indexOf(dupMarker.start))
		: text
