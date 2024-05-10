import { Plugin, PluginSettingTab, Setting } from "obsidian"
import type { App, WorkspaceLeaf } from "obsidian"
import { SyntheticTodoView, VIEW_TYPE_SYNTHETIC_TODO } from "./view"

interface MyPluginSettings {
	mySetting: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
}

const must = <T>(x: T | undefined): T => {
	if (x === undefined) throw new Error("unexpected undefined")
	return x
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings | undefined

	async onload() {
		await this.loadSettings()
		this.registerView(
			VIEW_TYPE_SYNTHETIC_TODO,
			(leaf) => new SyntheticTodoView(leaf),
		)

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Open View",
			async (_evt: MouseEvent) => {
				const query = "tab"
				let leaf: WorkspaceLeaf | null = null
				const leaves = this.app.workspace.getLeavesOfType(
					VIEW_TYPE_SYNTHETIC_TODO,
				)
				if (leaves.length > 0) {
					leaf = leaves[0] ?? null
				} else {
					leaf = this.app.workspace.getLeaf("tab")
					await leaf.setViewState({
						type: VIEW_TYPE_SYNTHETIC_TODO,
						active: true,
						state: { query },
					})
				}
				leaf && this.app.workspace.revealLeaf(leaf)
			},
		)
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class")

		this.addSettingTab(new SampleSettingTab(this.app, this))
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		if (this.plugin.settings !== undefined) {
			new Setting(containerEl)
				.setName("Setting #1")
				.setDesc("It's a secret")
				.addText((text) =>
					text
						.setPlaceholder("Enter your secret")
						.setValue(must(this.plugin.settings).mySetting)
						.onChange(async (value) => {
							must(this.plugin.settings).mySetting = value
							await this.plugin.saveSettings()
						}),
				)
		}
	}
}
