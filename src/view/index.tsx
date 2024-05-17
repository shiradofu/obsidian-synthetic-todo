import {
	ItemView,
	type TFile,
	type ViewStateResult,
	type Workspace,
	type WorkspaceLeaf,
} from "obsidian"
import { StrictMode } from "react"
import { type Root, createRoot } from "react-dom/client"
import { UI } from "./UI"
import type { ItemFarm } from "../model"
import { Parser } from "../parser"
import { createEmbeddedSearch } from "../search"
import type { SortOrder } from "../settings"

const t = "synthetic-todo-view" as const

type States = {
	query: string
	sort: SortOrder
	pinned: string[]
	tagsAndFoldersForFileNameItems: string[]
}

export class SyntheticTodoView extends ItemView {
	public icon = "checkbox-glyph"
	public query = ""
	private sort: SortOrder = "alphabetical"
	private pinned: string[] = []
	private tagsAndFoldersForFileNameItems: string[] = []
	private parser?: Parser
	private listeners: ((itemFarms: ItemFarm[]) => void)[] = []
	private reactRoot: Root | null = null

	public static register() {
		return [t, (leaf: WorkspaceLeaf) => new SyntheticTodoView(leaf)] as const
	}

	public static async open(workspace: Workspace, state: States) {
		const leaves = workspace.getLeavesOfType(t)
		if (leaves[0]) return workspace.revealLeaf(leaves[0])
		const leaf = workspace.getLeaf("tab")
		await leaf.setViewState({ type: t, active: true, state })
		workspace.revealLeaf(leaf)
	}

	public getViewType() {
		return t
	}

	public getDisplayText() {
		return "Synthetic Todo"
	}

	public async setState(state: States, result: ViewStateResult) {
		this.query = state.query
		this.sort = state.sort
		this.pinned = state.pinned
		this.tagsAndFoldersForFileNameItems = state.tagsAndFoldersForFileNameItems
		this.parser = new Parser(
			this.app,
			this.pinned,
			this.tagsAndFoldersForFileNameItems,
		)
		await this.initUI()
		return super.setState(state, result)
	}

	public getState(): States {
		return {
			query: this.query,
			sort: this.sort,
			pinned: this.pinned,
			tagsAndFoldersForFileNameItems: this.tagsAndFoldersForFileNameItems,
		}
	}

	public async onClose() {
		this.reactRoot?.unmount()
	}

	private async initUI() {
		const container = this.containerEl.children[1]
		if (container === undefined) return
		container.empty()
		container.createEl("h1", { text: `query: ${this.query}` })

		const reactEl = container.createEl("div")
		this.reactRoot = createRoot(reactEl)
		this.reactRoot.render(
			<StrictMode>
				<UI registerListener={this.registerListener} />
			</StrictMode>,
		)

		const searchEl = container.createEl("div")
		searchEl.style.display = "none"
		const es = await createEmbeddedSearch(
			this.app,
			searchEl,
			this.query,
			this.sort,
		)
		if (!es) throw new Error("failed to create search insatance")
		es.addListener(this.onSearchChange)
		this.addChild(es)
	}

	private onSearchChange = async (files: TFile[], working: boolean) => {
		if (working && files.length === 0) return
		this.parse(files)
	}

	private registerListener = (callback: (itemFarms: ItemFarm[]) => void) => {
		this.listeners.push(callback)
		return () => this.listeners.filter((l) => l !== callback)
	}

	private async parse(files: TFile[]) {
		if (!this.parser) throw new Error("parser is not set")
		const itemFarms = await this.parser.parse(files)
		for (const listener of this.listeners) {
			listener(itemFarms)
		}
	}
}
