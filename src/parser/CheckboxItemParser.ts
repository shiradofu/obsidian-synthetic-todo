import type { CachedMetadata, ListItemCache, TFile } from "obsidian"
import {
	CheckboxItemEntity,
	CheckboxItemFarmEntity,
	CheckboxItemSegmentEntity,
} from "src/model"

type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export class CheckboxItemParser {
	private results: CheckboxItemFarmEntity[] = []

	constructor(
		private getFileCache: (file: TFile) => CachedMetadata | null,
		private readFile: (file: TFile) => Promise<string>,
		private pinned: string[],
	) {}

	public async parseIfTaskContained(file: TFile) {
		const targets = this.extractTargetLines(file)
		if (targets.length === 0) return false
		const fileLines = (await this.readFile(file)).split("\n")
		const idMap = new Map<number, CheckboxItemEntity>()
		let wipSegment = new CheckboxItemSegmentEntity()
		const segments: CheckboxItemSegmentEntity[] = []

		for (const t of targets) {
			switch (true) {
				case "task" in t: {
					const { line } = t.position.start
					const rawText = fileLines.at(line)
					if (!rawText) continue
					const match = rawText.indexOf("]")
					const text = match > -1 ? rawText.substring(match + 2) : ""
					if (!text) continue
					const item = new CheckboxItemEntity(text, t.task)
					idMap.set(line, item)
					t.parent < 0
						? wipSegment.items.push(item)
						: idMap.get(t.parent)?.children.push(item)
					break
				}
				case "heading" in t: {
					if (wipSegment.items.length > 0) segments.push(wipSegment)
					wipSegment = new CheckboxItemSegmentEntity([], t.heading)
				}
			}
		}
		if (wipSegment.items.length > 0) {
			segments.push(wipSegment)
		}
		this.results.push(new CheckboxItemFarmEntity(file.path, segments))
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
}
