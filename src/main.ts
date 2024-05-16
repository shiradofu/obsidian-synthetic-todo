import { Plugin } from "obsidian"
import { SyntheticTodoSettings } from "./settings"
import { SyntheticTodoView } from "./view"

export default class SyntheticTodo extends Plugin {
	async onload() {
		const settings = new SyntheticTodoSettings(this.app, this)
		await settings.load()
		this.addSettingTab(settings.tab)

		this.registerView(...SyntheticTodoView.register())

		this.addRibbonIcon("checkbox-glyph", "Open View", async () => {
			// for debugging
			// biome-ignore lint: lint/suspicious/noExplicitAny
			const { commands } = this.app.commands as any
			const key = "synthetic-todo:test"
			if (!commands[key]) return console.error("command not found")
			commands[key].callback()
		})
	}

	onunload() {}
}
