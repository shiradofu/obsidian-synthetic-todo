import { ItemView, type TFile, type ViewStateResult } from "obsidian"
import { Parser } from "./parser"
import { createEmbeddedSearch } from "./search"

export const VIEW_TYPE_SYNTHETIC_TODO = "synthetic-todo-view"

export class SyntheticTodoView extends ItemView {
	private query = ""
	private files: TFile[] = []
	private pre: HTMLPreElement | undefined

	getViewType() {
		return VIEW_TYPE_SYNTHETIC_TODO
	}

	getDisplayText() {
		return "Synthetic Todo"
	}

	async setState(state: unknown, result: ViewStateResult) {
		if (state === null || typeof state !== "object") {
			return super.setState(state, result)
		}
		if ("query" in state && typeof state.query === "string") {
			this.query = state.query
		}
		if ("files" in state && Array.isArray(state.files)) {
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

	getState() {
		return { query: this.query, files: this.files }
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
		const json = JSON.stringify(result, null, 2)
		this.pre?.setText(json)
	}
}
