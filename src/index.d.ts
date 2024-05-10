import "obsidian"

declare module "obsidian" {
	export interface Workspace extends Events {
		on(
			name: `SyntheticTodo:EmbeddedSearch:onChange:${string}`,
			callback: (files: TFile[], working: boolean) => void,
			ctx?: unknown,
		): EventRef
	}

	class EmbeddedSearchClass extends MarkdownRenderChild {
		constructor(app: App, el: HTMLElement, query: string, sourcePath: string)
		dom?: EmbeddedSearchDOMClass
		query: string
		sourcePath: string
		onunload(): void
		onload(): void
	}

	class EmbeddedSearchDOMClass {
		addResult(
			matchedFile: TFile,
			matchLoc: number[][],
			matchText: string,
			// biome-ignore lint: lint/suspicious/noExplicitAny
			...args: any[]
		): void
		changed(): void
		children: SearchResultItemClass[]
		el: HTMLElement
		infinityScroll: InfinityScroll
		onChange(): void
		parent?: EmbeddedSearchClass
		resultDomLookup: Map<TFile, SearchResultItemClass>
		sortOrder: string
		startLoader(): void
		stopLoader(): void
		working: boolean
	}

	class SearchResultItemClass {
		renderContentMatches(): void
		info: ItemInfo
		collapsible: boolean
		collpased: boolean
		extraContext: boolean
		showTitle: boolean
		parent: SearchResultDOM
		children: SearchResultItemMatch[]
		file: TFile
		content: string
		el: HTMLElement
		pusherEl: HTMLElement
		containerEl: HTMLElement
		childrenEl: HTMLElement
	}
}
