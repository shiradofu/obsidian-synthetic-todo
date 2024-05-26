import type { App, TFile } from "obsidian"
import { CheckboxTodoParser } from "./CheckboxTodoParser"
import { FileNameTodoParser } from "./FileNameTodoParser"

export class Parser {
	private fileNameTodoParser: FileNameTodoParser
	private checkboxTodoParser: CheckboxTodoParser

	constructor(
		private app: App,
		pinned: string[],
		tagsAndFoldersForFileNameTodos: string[],
	) {
		this.fileNameTodoParser = new FileNameTodoParser(
			this.app.metadataCache.getFileCache.bind(this.app.metadataCache),
			(name?: string) => {
				if (!name) return
				const f = this.app.metadataCache.getFirstLinkpathDest(name, ".")
				if (!f) return
				return this.app.vault.getResourcePath(f)
			},
			tagsAndFoldersForFileNameTodos,
		)
		this.checkboxTodoParser = new CheckboxTodoParser(
			this.app.metadataCache.getFileCache.bind(this.app.metadataCache),
			this.app.vault.cachedRead.bind(this.app.vault),
			pinned,
		)
	}

	public async parse(files: TFile[]) {
		await Promise.all(
			files.map(async (f) => {
				this.fileNameTodoParser.storeIfMatch(f) ||
					this.checkboxTodoParser.parseIfTaskContained(f)
			}),
		)

		return [
			...this.checkboxTodoParser.finish(),
			...this.fileNameTodoParser.finish(),
		]
	}
}
