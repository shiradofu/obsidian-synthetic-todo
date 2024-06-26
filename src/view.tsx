import {
	ItemView,
	type TFile,
	type ViewStateResult,
	type Workspace,
	type WorkspaceLeaf,
} from "obsidian"
import { type Root, createRoot } from "react-dom/client"
import type { GroupNode } from "src/model"
import { Parser } from "./parser"
import { createEmbeddedSearch } from "./search"
import { SelectorUI } from "./selector"
import type { SelectedType, SelectedTypeMap } from "./selector/useSelection"
import type { SortOrder } from "./settings"

const t = "synthetic-todo-view" as const

type InitialState = {
	query: string
	sort: SortOrder
	pinned: string[]
	tagsAndFoldersForFileNameTodos: string[]
}

type State = InitialState & {
	selectedTypeMap: Record<string, SelectedType>
}

export class SyntheticTodoView extends ItemView {
	public icon = "checkbox-glyph"
	public query = ""
	private sort: SortOrder = "alphabetical"
	private pinned: string[] = []
	private tagsAndFoldersForFileNameTodos: string[] = []
	private parser?: Parser
	private farmListeners: ((todoFarms: GroupNode[]) => void)[] = []
	private reactRoot: Root | null = null
	private selectedTypeMap: SelectedTypeMap = new Map()

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
		if ("selectedTypeMap" in state) {
			this.selectedTypeMap = new Map(
				Object.entries(state.selectedTypeMap || {}),
			)
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
			selectedTypeMap: Object.fromEntries(this.selectedTypeMap),
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
			<SelectorUI
				registerFarmListener={this.registerFarmListener}
				setSelectedTypeMapToViewState={this.setSelectedTypeMapToViewState}
				selectedTypeMapHydration={this.selectedTypeMap}
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
		callback: (todoFarms: GroupNode[]) => void,
	) => {
		this.farmListeners.push(callback)
		return () => this.farmListeners.filter((l) => l !== callback)
	}

	private setSelectedTypeMapToViewState = (
		selectedTypeMap: SelectedTypeMap,
	) => {
		this.selectedTypeMap = selectedTypeMap
	}

	private async parse(files: TFile[]) {
		if (!this.parser) throw new Error("parser is not set")
		const todoFarms = await this.parser.parse(files)
		for (const listener of this.farmListeners) {
			listener(todoFarms)
		}
	}
}
