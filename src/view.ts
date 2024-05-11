import {
	ItemView,
	type TFile,
	type ViewStateResult,
	type Workspace,
	type WorkspaceLeaf,
} from "obsidian"
import { Parser } from "./parser"
import { createEmbeddedSearch } from "./search"

const t = "synthetic-todo-view"

type InitialState = {
	query: string
	pinned: string[]
}

type State = InitialState & {
	files: TFile[]
}

export class SyntheticTodoView extends ItemView {
	private query = ""
	private pinned: string[] = []
	private files: TFile[] = []
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
		const itemFarms = await Promise.all(
			this.files.map(async (f) => {
				const fileContents = await this.app.vault.cachedRead(f)
				const parser = new Parser()
				return parser.parse(f.path, fileContents)
			}),
		)
		const result = itemFarms.filter((f) => f.sections.length > 0)
		for (const p of [...this.pinned].reverse()) {
			const i = result.findIndex(({ path }) => path === p)
			if (i === -1) continue
			const shouldPinned = result.splice(i, 1)[0]
			if (!shouldPinned) continue
			result.unshift(shouldPinned)
		}
		const json = JSON.stringify(result, null, 2)
		this.pre?.setText(json)
	}
}
