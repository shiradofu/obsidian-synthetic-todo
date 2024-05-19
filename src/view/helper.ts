export const removeDupMarker = (text: string) =>
	text.endsWith("]]]!") ? text.substring(0, text.indexOf("![[[")) : text
