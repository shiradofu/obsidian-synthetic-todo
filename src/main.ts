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
			const cmd = this.app.commands.commands["synthetic-todo:test"]
			cmd?.callback ? cmd.callback() : alert("cmd not found")
		})
	}

	onunload() {}
}
