import {
	ItemView,
	type TFile,
	type ViewStateResult,
	type Workspace,
	type WorkspaceLeaf,
} from "obsidian"
import { Parser } from "./parser"
import { createEmbeddedSearch } from "./search"
import { ItemTree, type ItemFarm } from "./item"

const t = "synthetic-todo-view"

type InitialState = {
	query: string
	pinned: string[]
	tagsAndFoldersForFileNameItems: string[]
}

type State = InitialState & {
	files: TFile[]
}

export class SyntheticTodoView extends ItemView {
	private query = ""
	private pinned: string[] = []
	private files: TFile[] = []
	private tagsAndFoldersForFileNameItems: string[] = []
	private pre: HTMLPreElement | undefined

	public static register() {
		return [t, (leaf: WorkspaceLeaf) => new SyntheticTodoView(leaf)] as const
	}

	public static async open(workspace: Workspace, state: InitialState) {
		const leaves = workspace.getLeavesOfType(t)
		if (leaves[0]) return workspace.revealLeaf(leaves[0])
		const leaf = workspace.getLeaf("tab")
		await leaf.setViewState({ type: t, active: true, state })
		workspace.revealLeaf(leaf)
	}

	getViewType() {
		return t
	}

	getDisplayText() {
		return "Synthetic Todo"
	}

	async setState(state: InitialState | State, result: ViewStateResult) {
		this.query = state.query
		this.pinned = state.pinned
		this.tagsAndFoldersForFileNameItems = state.tagsAndFoldersForFileNameItems
		if ("files" in state) {
			this.files = state.files
		}
		this.app.workspace.on(
			`SyntheticTodo:EmbeddedSearch:onChange:${this.query}`,
			this.onSearchChange,
		)
		await this.renderFrame()
		await this.renderData()
		return super.setState(state, result)
	}

	getState(): State {
		return {
			query: this.query,
			files: this.files,
			pinned: this.pinned,
			tagsAndFoldersForFileNameItems: this.tagsAndFoldersForFileNameItems,
		}
	}

	async onClose() {
		this.app.workspace.off(
			`SyntheticTodo:EmbeddedSearch:onChange:${this.query}`,
			this.onSearchChange,
		)
	}

	onSearchChange = async (files: TFile[], working: boolean) => {
		if (working) {
			const paths = new Set(this.files.map((f) => f.path))
			const newFiles = files.filter((f) => !paths.has(f.path))
			this.files.push(...newFiles)
		} else {
			this.files = files
		}
		await this.renderData()
	}

	async renderFrame() {
		const container = this.containerEl.children[1]
		if (container === undefined) return
		container.empty()
		container.createEl("h4", { text: `query: ${this.query}` })

		const div = container.createEl("div")
		div.style.display = "none"
		this.addChild(await createEmbeddedSearch(this.app, div, this.query))

		this.pre = container.createEl("pre")
	}

	async renderData() {
		const { tagsForFileNameItems, pathsForFileNameItems } =
			this.tagsAndFoldersForFileNameItems.reduce(
				(acc, x) => {
					x.startsWith("#")
						? acc.tagsForFileNameItems.push(x)
						: acc.pathsForFileNameItems.push(x)
					return acc
				},
				{
					tagsForFileNameItems: [] as string[],
					pathsForFileNameItems: [] as string[],
				},
			)
		const fileNameItemMap: Record<string, string[]> = {}
		const itemFarms = await Promise.all(
			this.files.flatMap(async (f) => {
				const fileTags = this.app.metadataCache
					.getFileCache(f)
					?.tags?.map((t) => t.tag)
				const matchedTag = tagsForFileNameItems.find((t) =>
					fileTags?.contains(t),
				)
				if (matchedTag) {
					if (!fileNameItemMap[matchedTag]) fileNameItemMap[matchedTag] = []
					;(fileNameItemMap[matchedTag] as string[]).push(f.path)
					return
				}
				const matchedPath = pathsForFileNameItems.find((path) =>
					f.path.startsWith(path),
				)
				if (matchedPath) {
					if (!fileNameItemMap[matchedPath]) fileNameItemMap[matchedPath] = []
					;(fileNameItemMap[matchedPath] as string[]).push(f.path)
					return
				}
				const fileContents = await this.app.vault.cachedRead(f)
				const parser = new Parser()
				return parser.parse(f.path, fileContents)
			}),
		)
		const result = itemFarms.filter(
			(f): f is ItemFarm => !!f && f.sections.length > 0,
		)
		for (const p of [...this.pinned].reverse()) {
			const i = result.findIndex(({ path }) => path === p)
			if (i === -1) continue
			const shouldPinned = result.splice(i, 1)[0]
			if (!shouldPinned) continue
			result.unshift(shouldPinned)
		}
		for (const tagOrFolder of this.tagsAndFoldersForFileNameItems) {
			const items = fileNameItemMap[tagOrFolder]
			if (items === undefined) continue
			result.push({
				path: tagOrFolder,
				sections: [{ trees: items.map((i) => new ItemTree(i)) }],
				itemType: "fileName",
			})
		}
		const json = JSON.stringify(result, null, 2)
		this.pre?.setText(json)
	}
}
