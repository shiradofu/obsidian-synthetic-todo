import type { CachedMetadata, ListItemCache, TFile } from "obsidian"
import { CheckboxTodoNode, GroupNode } from "src/model"

type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export class CheckboxTodoParser {
	private farms = new Map<string, GroupNode>()

	constructor(
		private getFileCache: (file: TFile) => CachedMetadata | null,
		private readFile: (file: TFile) => Promise<string>,
		private pinned: string[],
	) {}

	public async parseIfTaskContained(file: TFile) {
		const targets = this.extractTargetLines(file)
		if (targets.length === 0) return false

		const farm = new GroupNode(file.path, "file")
		let wipParcel = new GroupNode("", "heading")
		const lineNum2TodoMap = new Map<number, CheckboxTodoNode>()
		const fileLines = (await this.readFile(file)).split("\n")

		for (const t of targets) {
			switch (true) {
				case "task" in t: {
					const {
						task: status,
						position: {
							start: { line },
						},
						parent: parentLineNum,
					} = t
					const text = this.extractTodoText(fileLines.at(line))
					if (!text) continue
					const todo = new CheckboxTodoNode(text, status, line)
					lineNum2TodoMap.set(line, todo)
					parentLineNum < 0
						? wipParcel.addChild(todo)
						: lineNum2TodoMap.get(parentLineNum)?.addChild(todo)
					break
				}
				case "heading" in t: {
					if (wipParcel.children.length > 0) farm.addChild(wipParcel)
					wipParcel = new GroupNode(t.heading, "heading")
				}
			}
		}
		if (wipParcel.children.length > 0) farm.addChild(wipParcel)
		this.farms.set(farm.value, farm)
		return true
	}

	public finish() {
		const results = this.pinned.flatMap((p) => {
			const shouldPinned = this.farms.get(p)
			this.farms.delete(p)
			return shouldPinned ?? []
		})
		results.push(...this.farms.values())
		this.farms.clear()
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
		return [...tasks, ...(cache.headings ?? [])].sort(
			(a, b) => a.position.start.line - b.position.start.line,
		)
	}

	private extractTodoText(rawText: string | undefined) {
		if (!rawText) return
		const match = rawText.indexOf("]")
		return match > -1 ? rawText.substring(match + 2) : undefined
	}
}
