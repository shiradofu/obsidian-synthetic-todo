import type { TFile } from "obsidian"
import { imgExts } from "src/constants"
import { FileNameItemEntity, FileNameItemFarmEntity } from "src/model"

type TagOrFolder = string

export class FileNameItemParser {
	private resultMap = new Map<TagOrFolder, { path: string; img?: string }[]>()
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
		const cache = this.getFileCache(file)
		const fileTags = cache?.tags?.map((t) => t.tag)
		const match =
			this.tags.find((t) => fileTags?.contains(t)) ??
			this.folders.find((folder) => file.path.startsWith(folder))
		if (!match) return false
		const firstImg = this.getImgPath(
			cache?.embeds?.find(({ link }) =>
				imgExts.includes(link.split(".").at(-1) ?? ""),
			)?.link,
		)
		this.add(match, file.path, firstImg)
		return true
	}

	private add(tagOrFolder: string, markdownFilePath: string, imgPath?: string) {
		const newItem = {
			path: tagOrFolder.endsWith("/")
				? markdownFilePath.substring(tagOrFolder.length)
				: markdownFilePath,
			img: imgPath,
		}
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
				{
					items: items.map(
						({ path, img }) => new FileNameItemEntity(path, img),
					),
				},
			])
		})
		this.resultMap = new Map()
		return sortedResult
	}
}
