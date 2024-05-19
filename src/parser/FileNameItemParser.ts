import type { TFile } from "obsidian"
import { FileNameItemEntity, FileNameItemFarmEntity } from "src/model"

type TagOrFolder = string
type MarkdownFilePath = string

export class FileNameItemParser {
	private resultMap: Map<TagOrFolder, MarkdownFilePath[]> = new Map()
	private tags: string[]
	private folders: string[]
	private order: string[]

	constructor(
		private getFileCache: (file: TFile) => { tags?: { tag: string }[] } | null,
		tagsAndFolders: string[],
	) {
		const { tags, folders } = tagsAndFolders.reduce(
			(acc, x) => {
				x.startsWith("#") ? acc.tags.push(x) : acc.folders.push(x)
				return acc
			},
			{
				tags: [] as string[],
				folders: [] as string[],
			},
		)
		this.tags = tags
		this.folders = folders
		// tagsAndFolders keeps order spesified by user
		this.order = tagsAndFolders
	}

	public storeIfMatch(file: TFile) {
		const fileTags = this.getFileCache(file)?.tags?.map((t) => t.tag)
		const match =
			this.tags.find((t) => fileTags?.contains(t)) ??
			this.folders.find((folder) => file.path.startsWith(folder))
		if (!match) return false
		this.add(match, file.path)
		return true
	}

	private add(tagOrFolder: string, markdownFilePath: string) {
		const newItem = tagOrFolder.endsWith("/")
			? markdownFilePath.substring(tagOrFolder.length)
			: markdownFilePath
		const items = this.resultMap.get(tagOrFolder)
		if (!items) {
			this.resultMap.set(tagOrFolder, [newItem])
		} else {
			items.push(newItem)
		}
	}

	public finish() {
		const sortedResult = this.order.flatMap((tagOrFolder) => {
			const items = this.resultMap.get(tagOrFolder)
			if (items === undefined) return []
			return new FileNameItemFarmEntity(tagOrFolder, [
				{ items: items.map((i) => new FileNameItemEntity(i)) },
			])
		})
		this.resultMap = new Map()
		return sortedResult
	}
}
