import type { Vault } from "obsidian"
import { Parser } from "./parser"

type ServeArgs = {
	vault: Vault
}

export async function serve({ vault }: ServeArgs) {
	const markdownFiles = vault.getMarkdownFiles()
	const itemFarms = await Promise.all(
		markdownFiles.map(async (f) => {
			const fileContents = await vault.cachedRead(f)
			const parser = new Parser()
			return parser.parse(f.path, fileContents)
		}),
	)
	const result = itemFarms.filter((f) => f.sections.length > 0)
	console.log(JSON.stringify(result, null, 2))
}
