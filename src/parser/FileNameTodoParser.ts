import type { TFile } from "obsidian"
import { imgExts } from "src/constants"
import {
	FilenameTodoNode,
	type GroupNode,
	TagOrFolderTodoNode,
} from "src/model"

type TagOrFolder = string

export class FileNameTodoParser {
	private farms = new Map<TagOrFolder, GroupNode>()
	private tags: string[]
	private folders: string[]
	private order: string[]

	constructor(
		private getFileCache: (
			file: TFile,
		) => { tags?: { tag: string }[]; embeds?: { link: string }[] } | null,
		private getImgPath: (name?: string) => string | undefined,
		tagsAndFolders: string[],
	) {
		this.tags = tagsAndFolders.filter((x) => x.startsWith("#"))
		this.folders = tagsAndFolders.filter((x) => x.endsWith("/"))
		// tagsAndFolders keeps order spesified by user
		this.order = tagsAndFolders
	}

	public storeIfMatch(file: TFile) {
		const cache = this.getFileCache(file)
		const fileTags = new Set(cache?.tags?.map((t) => t.tag))
		const matched =
			this.tags.find((t) => fileTags.has(t)) ??
			this.folders.find((folder) => file.path.startsWith(folder))
		if (matched === undefined) return false

		const newTodo = new FilenameTodoNode(file.path, this.getFirstImage(file))
		const farm = this.farms.get(matched)
		farm !== undefined
			? farm.addChild(newTodo)
			: this.farms.set(
					matched,
					new TagOrFolderTodoNode(matched).addChild(newTodo),
				)
		return true
	}

	private getFirstImage(file: TFile) {
		return this.getImgPath(
			this.getFileCache(file)?.embeds?.find(({ link }) =>
				imgExts.includes(link.split(".").at(-1) ?? ""),
			)?.link,
		)
	}

	public finish() {
		const sortedFarms = this.order.flatMap(
			(tagOrFolder) => this.farms.get(tagOrFolder) ?? [],
		)
		this.farms.clear()
		return sortedFarms
	}
}
