import {
	ItemView,
	type TFile,
	type ViewStateResult,
	type Workspace,
	type WorkspaceLeaf,
} from "obsidian"
import { type Root, createRoot } from "react-dom/client"
import type { TodoNode } from "src/model"
import { Parser } from "../parser"
import { createEmbeddedSearch } from "../search"
import type { SortOrder } from "../settings"
import { Selector } from "./Selector"
import type { SelectedIdMap, SelectedType } from "./hooks"

const t = "synthetic-todo-view" as const

type InitialState = {
	query: string
	sort: SortOrder
	pinned: string[]
	tagsAndFoldersForFileNameTodos: string[]
}

type State = InitialState & {
	selectedIdMap: Record<string, SelectedType>
}

export class SyntheticTodoView extends ItemView {
	public icon = "checkbox-glyph"
	public query = ""
	private sort: SortOrder = "alphabetical"
	private pinned: string[] = []
	private tagsAndFoldersForFileNameTodos: string[] = []
	private parser?: Parser
	private farmListeners: ((todoFarms: TodoNode[]) => void)[] = []
	private reactRoot: Root | null = null
	private selectedIdMap: SelectedIdMap = new Map()

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

	public getViewType() {
		return t
	}

	public getDisplayText() {
		return "Synthetic Todo"
	}

	public async setState(state: InitialState | State, result: ViewStateResult) {
		this.query = state.query
		this.sort = state.sort
		this.pinned = state.pinned
		this.tagsAndFoldersForFileNameTodos = state.tagsAndFoldersForFileNameTodos
		this.parser = new Parser(
			this.app,
			this.pinned,
			this.tagsAndFoldersForFileNameTodos,
		)
		if ("selectedIdMap" in state) {
			this.selectedIdMap = new Map(Object.entries(state.selectedIdMap || {}))
		}
		await this.initUI()
		return super.setState(state, result)
	}

	public getState(): State {
		return {
			query: this.query,
			sort: this.sort,
			pinned: this.pinned,
			tagsAndFoldersForFileNameTodos: this.tagsAndFoldersForFileNameTodos,
			selectedIdMap: Object.fromEntries(this.selectedIdMap),
		}
	}

	public async onClose() {
		this.reactRoot?.unmount()
	}

	private async initUI() {
		const container = this.containerEl.children[1]
		if (container === undefined) return
		container.empty()

		const reactEl = container.createEl("div")
		this.reactRoot = createRoot(reactEl)
		this.reactRoot.render(
			<Selector
				registerFarmListener={this.registerFarmListener}
				setSelectedIdMapToViewState={this.setSelectedIdMapToViewState}
				selectedIdMapHydration={this.selectedIdMap}
			/>,
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

	private registerFarmListener = (
		callback: (todoFarms: TodoNode[]) => void,
	) => {
		this.farmListeners.push(callback)
		return () => this.farmListeners.filter((l) => l !== callback)
	}

	private setSelectedIdMapToViewState = (selectedIdMap: SelectedIdMap) => {
		this.selectedIdMap = selectedIdMap
	}

	private async parse(files: TFile[]) {
		if (!this.parser) throw new Error("parser is not set")
		const todoFarms = await this.parser.parse(files)
		for (const listener of this.farmListeners) {
			listener(todoFarms)
		}
	}
}
