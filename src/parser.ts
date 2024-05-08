import { Item, type ItemFarm, type ItemFarmSection, ItemTree } from "./item"

const ignorePatternFor2LineHeading = [
	"\\s",
	"- ",
	"\\* ",
	"1. ",
	">",
	"```",
	"!\\[.*\\]\\(.+\\)",
	"</?\\w+>.*",
	"-{3,}",
	"_{3,}",
	"\\*{3,}",
]

const parserPattern = new RegExp(
	[
		// checkbox item
		"^([ \\t]*)(?:-|\\*) \\[(.)\\] (.+)$",
		// heading by number signs
		"^#{1,6} +(.+)$",
		// heading by equal signs or hyphens
		`^((?:(?!${ignorePatternFor2LineHeading.join("|")})).*)\\n(?:=+|--+)$`,
		// hyphen divider
		"^-{3,}$",
		// asterisk or underscore divider
		"^\\*{3,}$",
		// underscore divider
		"^_{3,}$",
	].join("|"),
	"gm",
)

export class Parser {
	private wipItems: { trees: ItemTree[]; indent: number }[] = []

	public parse(filePath: string, mdText: string): ItemFarm {
		const mdTextWithoutFrontmatter = this.removeFrontmatter(mdText)
		const matches = mdTextWithoutFrontmatter.matchAll(parserPattern)
		const sections: ItemFarmSection[] = []

		// parse matches backwards for better performance
		for (const m of Array.from(matches).reverse()) {
			const [_, indentChars, status, text, ...sectionNames] = m
			if (indentChars !== undefined && !!status && !!text) {
				const item = new Item(text, status)
				this.filterItem(item) && this.addToWipTree(item, indentChars.length)
			} else {
				const trees = this.finishWipTrees()
				if (trees.length === 0) continue
				sections.unshift({ name: sectionNames.find((s) => s), trees })
			}
		}
		if (this.wipItems.length > 0) {
			sections.unshift({ name: undefined, trees: this.finishWipTrees() })
		}

		return {
			path: filePath,
			sections,
		}
	}

	private removeFrontmatter(mdText: string) {
		const frontmatterPattern = /^---$/gm
		if (frontmatterPattern.exec(mdText)?.index === 0) {
			const endMatch = frontmatterPattern.exec(mdText)
			return endMatch
				? mdText.substring(endMatch.index + 4)
				: mdText.substring(4)
		}
		return mdText
	}

	private filterItem(_item: Item) {
		return true
	}

	private addToWipTree(item: Item, indent: number) {
		const last = this.wipItems.at(-1)
		if (last === undefined) {
			this.wipItems.push({ trees: [new ItemTree(item)], indent })
			return
		}
		switch (true) {
			case indent > last.indent:
				this.wipItems.push({ trees: [new ItemTree(item)], indent })
				break
			case indent === last.indent:
				last.trees.unshift(new ItemTree(item))
				break
			case indent < last.indent: {
				this.wipItems.pop()
				const treeFragment = new ItemTree(item, last.trees)
				const secondLast = this.wipItems.at(-1)
				if (secondLast === undefined) {
					this.wipItems.push({ trees: [treeFragment], indent })
				} else if (secondLast.indent === indent) {
					secondLast.trees.unshift(treeFragment)
				} else {
					this.handleWiredItems(treeFragment, indent)
				}
				break
			}
		}
	}

	private handleWiredItems(treeFragment: ItemTree, indent: number) {
		/**
		 * this is an unusual case, invalid checklist structure:
		 * (current) indent < secondLast.indent
		 *
		 * - [ ] parent       <- (current)
		 *         - [ ] OMG  <- last
		 *     - [ ] child    <- secondLast
		 */
		const len = this.wipItems.length
		for (let i = 0; i < len; i++) {
			const last = this.wipItems.at(-1)
			if (last === undefined) throw new Error("unreacheable")
			if (indent === last.indent) {
				last.trees.unshift(treeFragment)
				return
			}
			if (indent > last.indent) {
				this.wipItems.push({ trees: [treeFragment], indent })
				return
			}
			if (indent < last.indent) {
				treeFragment.children.push(...last.trees)
				this.wipItems.pop()
			}
		}
		this.wipItems.push({ trees: [treeFragment], indent })
	}

	private finishWipTrees() {
		const trees = this.wipItems.map((w) => w.trees)
		this.wipItems = []

		if (trees.length === 0) return []
		if (trees.length === 1 && trees[0]) return trees[0]

		/**
		 * this is unusual case:
		 * for example, the first item would happen to be indented.
		 *
		 * ↓ one space character here
		 *  - [ ] the first item
		 * - [ ] the second item
		 */
		if (trees.length > 1) {
			return trees.reverse().flat()
		}

		throw new Error("unreacheable")
	}
}
