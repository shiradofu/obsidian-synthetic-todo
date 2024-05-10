import {
	type App,
	Component,
	type EmbeddedSearchClass,
	type EmbeddedSearchDOMClass,
	MarkdownView,
	type Workspace,
	WorkspaceSplit,
} from "obsidian"

let EmbeddedSearch: typeof EmbeddedSearchClass | undefined

const handler: ProxyHandler<typeof EmbeddedSearchClass> = {
	construct(
		target,
		[app, el, query, sourcePath]: ConstructorParameters<
			typeof EmbeddedSearchClass
		>,
	) {
		const instance = new target(app, el, query, sourcePath)
		const onload = instance.onload
		instance.onload = function (this: EmbeddedSearchClass) {
			if (this.dom === undefined) {
				throw new Error("EmbeddedSearchClass.dom is undefined")
			}
			this.dom.parent = this
			const startLoader = this.dom.startLoader
			this.dom.startLoader = function (this: EmbeddedSearchDOMClass) {
				startLoader.apply(this)
			}
			const onChange = this.dom.onChange
			this.dom.onChange = function (this: EmbeddedSearchDOMClass) {
				app.workspace.trigger(
					`SyntheticTodo:EmbeddedSearch:onChange:${query}`,
					Array.from(this.resultDomLookup.keys()),
					this.working,
				)
				onChange.apply(this)
			}
			return onload.apply(this)
		}
		return instance
	},
}

export async function createEmbeddedSearch(
	app: App,
	el: HTMLElement,
	query: string,
) {
	if (EmbeddedSearch !== undefined) {
		return new EmbeddedSearch(app, el, query, "")
	}
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
				const embeddedSearchInstance = child as unknown as EmbeddedSearchClass
				EmbeddedSearch = new Proxy(
					embeddedSearchInstance.constructor as typeof EmbeddedSearchClass,
					handler,
				)
			}
		} catch (err) {
			console.error(err)
		}
		const result = original.call<Component, [T], T>(this, child)
		return result
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

	if (!EmbeddedSearch) {
		throw new Error("Failed to catch EmbeddedSearchClass")
	}
	return new (EmbeddedSearch as unknown as typeof EmbeddedSearchClass)(
		app,
		el,
		query,
		"",
	)
}