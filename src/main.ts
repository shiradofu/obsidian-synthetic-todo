import type { App } from "obsidian"
import { Plugin, PluginSettingTab, Setting } from "obsidian"
import { SyntheticTodoView } from "./view"

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
		this.registerView(...SyntheticTodoView.register())

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Open View",
			async (_evt: MouseEvent) => {
				const query = "dev"
				const pinned = "Untitled.md\ntabq.md\n"
					.trim()
					.split("\n")
					.map((p) => p.trim())
					.filter((p) => p)

				await SyntheticTodoView.open(this.app.workspace, {
					query,
					pinned,
				})
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
