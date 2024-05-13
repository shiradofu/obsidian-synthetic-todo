import {
	type App,
	Component,
	type EmbeddedSearchClass,
	type EmbeddedSearchDOMClass,
	MarkdownView,
	type TFile,
	type Workspace,
	WorkspaceSplit,
} from "obsidian"

type SearchOnChangeListener = (files: TFile[], working: boolean) => void
interface IExtendedEmbeddedSearch extends EmbeddedSearchClass {
	addListener(listener: SearchOnChangeListener): void
}
interface ExtendedEmbeddedSearchClass {
	new (
		app: App,
		el: HTMLElement,
		query: string,
		sortOrder: string,
	): IExtendedEmbeddedSearch
}
let ExtendedEmbeddedSearch: ExtendedEmbeddedSearchClass | undefined

const defineClass = (EmbeddedSearch: typeof EmbeddedSearchClass) => {
	ExtendedEmbeddedSearch = class extends EmbeddedSearch {
		private sortOrder: string
		private listeners: SearchOnChangeListener[] = []

		constructor(app: App, el: HTMLElement, query: string, sortOrder: string) {
			super(app, el, query, "")
			this.sortOrder = sortOrder || "byModifiedTime"
		}

		addListener(listener: SearchOnChangeListener) {
			this.listeners.push(listener)
		}

		onload(): void {
			if (!this.dom) {
				throw new Error("EmbeddedSearchClass.dom is undefined")
			}
			this.dom.parent = this
			this.dom.sortOrder = this.sortOrder
			const onChange = this.dom.onChange
			const listeners = this.listeners
			this.dom.onChange = function (this: EmbeddedSearchDOMClass) {
				for (const listener of listeners) {
					listener(Array.from(this.resultDomLookup.keys()), this.working)
				}
				onChange.apply(this)
			}
			super.onload()
		}
	}
}

export async function createEmbeddedSearch(
	app: App,
	el: HTMLElement,
	query: string,
	sortOrder = "",
) {
	const createIfPossible = () => {
		if (ExtendedEmbeddedSearch === undefined) return
		return new ExtendedEmbeddedSearch(app, el, query, sortOrder)
	}
	const maybeInstance = createIfPossible()
	if (maybeInstance) return maybeInstance

	const original = Component.prototype.addChild
	const addChildOverride = function <T extends Component>(
		this: Component,
		child: T,
	) {
		try {
			if (
				child instanceof Component &&
				Object.hasOwn(child, "searchQuery") &&
				Object.hasOwn(child, "sourcePath") &&
				Object.hasOwn(child, "dom")
			) {
				defineClass(child.constructor as typeof EmbeddedSearchClass)
			}
		} catch (err) {
			console.error(err)
		}
		return original.call<Component, [T], T>(this, child)
	}

	try {
		Component.prototype.addChild = addChildOverride

		const rootSplit: WorkspaceSplit = new (
			WorkspaceSplit as new (
				workspace: Workspace,
				direction: "horizontal" | "vertical",
			) => WorkspaceSplit
		)(app.workspace, "vertical")

		rootSplit.getRoot = () => app.workspace.rootSplit
		rootSplit.getContainer = () => app.workspace.rootSplit
		const tmpLeaf = app.workspace.createLeafInParent(rootSplit, 0)

		const textFile = new MarkdownView(tmpLeaf)
		textFile.setViewData("```query\n```", true)
		await tmpLeaf.open(textFile)
		const viewState = tmpLeaf.getViewState()
		viewState.state.source = false
		tmpLeaf.setViewState(viewState)
		tmpLeaf.detach()
	} catch (e) {
		if (e instanceof Error)
			throw new Error(
				"An error occured while trying to catch EmbeddedSearchClass",
				e,
			)
	} finally {
		Component.prototype.addChild = original
	}

	return createIfPossible()
}
