import type { CachedMetadata, ListItemCache, TFile } from "obsidian"
import { addDupMarker } from "src/helper"
import {
	CheckboxTodo,
	CheckboxTodoFarm,
	CheckboxTodoFarmParcel,
} from "src/model"

type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export class CheckboxTodoParser {
	private results: CheckboxTodoFarm[] = []

	constructor(
		private getFileCache: (file: TFile) => CachedMetadata | null,
		private readFile: (file: TFile) => Promise<string>,
		private pinned: string[],
	) {}

	public async parseIfTaskContained(file: TFile) {
		const targets = this.extractTargetLines(file)
		if (targets.length === 0) return false

		const lineNum2TodoMap = new Map<number, CheckboxTodo>()
		const [uniqueHeading] = this.createDupCounter()
		const [uniqueTask, clearTaskDupChekcer] = this.createDupCounter()

		let wipParcel = new CheckboxTodoFarmParcel([], "")
		const parcels: CheckboxTodoFarmParcel[] = []

		const fileLines = (await this.readFile(file)).split("\n")

		for (const t of targets) {
			switch (true) {
				case "task" in t: {
					const { line } = t.position.start
					const rawText = fileLines.at(line)
					if (!rawText) continue
					const match = rawText.indexOf("]")
					const text = match > -1 ? rawText.substring(match + 2) : ""
					if (!text) continue
					const todo = new CheckboxTodo(uniqueTask(text), t.task)
					lineNum2TodoMap.set(line, todo)
					const parentLineNum = t.parent
					parentLineNum < 0
						? wipParcel.todos.push(todo)
						: lineNum2TodoMap.get(parentLineNum)?.children.push(todo)
					break
				}
				case "heading" in t: {
					if (wipParcel.todos.length > 0) parcels.push(wipParcel)
					clearTaskDupChekcer()

					wipParcel = new CheckboxTodoFarmParcel([], uniqueHeading(t.heading))
				}
			}
		}
		if (wipParcel.todos.length > 0) {
			parcels.push(wipParcel)
		}
		this.results.push(new CheckboxTodoFarm(file.path, parcels))
		return true
	}

	public finish() {
		for (const p of [...this.pinned].reverse()) {
			const i = this.results.findIndex(({ path }) => path === p)
			if (i === -1) continue
			const shouldPinned = this.results.splice(i, 1)[0]
			if (!shouldPinned) continue
			this.results.unshift(shouldPinned)
		}

		const { results } = this
		this.results = []
		return results
	}

	private extractTargetLines(file: TFile) {
		const cache = this.getFileCache(file)
		if (cache === null) return []
		const tasks =
			cache.listItems?.filter(
				(item): item is PartiallyRequired<ListItemCache, "task"> =>
					item.task !== undefined,
			) ?? []
		if (tasks.length === 0) return []

		const headings = cache.headings ?? []

		return [...tasks, ...headings].sort(
			(a, b) => a.position.start.line - b.position.start.line,
		)
	}

	private createDupCounter() {
		const counterMap = new Map<string, number>()
		function addSuffixIfDup(name: string) {
			const count = counterMap.get(name)
			count === undefined
				? counterMap.set(name, 1)
				: counterMap.set(name, count + 1)
			return count === undefined ? name : addDupMarker(name, count)
		}
		function clearMap() {
			counterMap.clear()
		}
		return [addSuffixIfDup, clearMap] as const
	}
}
