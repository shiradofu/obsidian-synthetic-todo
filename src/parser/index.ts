import type { App, TFile } from "obsidian"
import { CheckboxItemParser } from "./CheckboxItemParser"
import { FileNameItemParser } from "./FileNameItemParser"

export class Parser {
	private checkboxItemParser: CheckboxItemParser
	private fileNameItemParser: FileNameItemParser

	constructor(
		private app: App,
		pinned: string[],
		tagsAndFoldersForFileNameItems: string[],
	) {
		this.fileNameItemParser = new FileNameItemParser(
			this.app.metadataCache.getFileCache.bind(this.app.metadataCache),
			tagsAndFoldersForFileNameItems,
		)
		this.checkboxItemParser = new CheckboxItemParser(
			this.app.metadataCache.getFileCache.bind(this.app.metadataCache),
			this.app.vault.cachedRead.bind(this.app.vault),
			pinned,
		)
	}

	public async parse(files: TFile[]) {
		await Promise.all(
			files.map(async (f) => {
				if (this.fileNameItemParser.storeIfMatch(f)) return
				this.checkboxItemParser.parseIfTaskContained(f)
			}),
		)

		return [
			...this.checkboxItemParser.finish(),
			...this.fileNameItemParser.finish(),
		]
	}
}
