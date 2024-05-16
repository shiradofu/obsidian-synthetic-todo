import { type App, PluginSettingTab, Setting } from "obsidian"
import { APP_ID } from "./constants"
import { c } from "./helper"
import type SyntheticTodo from "./main"
import { SyntheticTodoView } from "./view"

const sortOrderOptions = {
	alphabetical: "File name (A to Z)",
	alphabeticalReverse: "File name (Z to A)",
	byModifiedTime: "Modified time (new to old)",
	byModifiedTimeReverse: "Modified time (old to new)",
	byCreatedTime: "Created time (new to old)",
	byCreatedTimeReverse: "Created time (old to new)",
} as const
export type SortOrder = keyof typeof sortOrderOptions

const groupByFileNameOptions = {
	none: "disable grouping",
	heading: "group using heading",
	parent: "group using tree parent",
} as const
type GroupByFileName = keyof typeof groupByFileNameOptions

type SyntheSettingsUnit = {
	name: string
	query: string
	sort: SortOrder
	pinned: string
	tagsAndFoldersForFileNameItems: string
	checkboxStatus: string
	groupByFileName: GroupByFileName
}
type SettingsStore = {
	synthe: SyntheSettingsUnit[]
}
const defaultSettingsStore: SettingsStore = {
	synthe: [],
}

const emptySyntheSettingsUnit: SyntheSettingsUnit = {
	name: "",
	query: "",
	sort: "alphabetical",
	pinned: "",
	tagsAndFoldersForFileNameItems: "",
	checkboxStatus: "",
	groupByFileName: "parent",
}

const addSpacerDiv = (el: HTMLElement, direction: "x" | "y", size: string) => {
	const spacer = el.createEl("div")
	const css =
		direction === "x"
			? { width: "1px", height: size }
			: { width: size, height: "1px" }
	spacer.setCssStyles(css)
}

export class SyntheticTodoSettings {
	public store: SettingsStore = defaultSettingsStore
	public tab: SyntheticTodoSettingTab
	public cmdMap = new Map<string, symbol>()

	constructor(
		private app: App,
		private plugin: SyntheticTodo,
	) {
		this.tab = new SyntheticTodoSettingTab(app, plugin, this)
	}

	public async load() {
		this.store = (await this.plugin.loadData()) ?? defaultSettingsStore
		this.syncCommand()
	}

	public syncCommand() {
		const { store, cmdMap } = this
		const ok = Symbol("ok")
		for (const s of store.synthe) {
			if (!cmdMap.has(s.name)) {
				this.plugin.addCommand({
					id: s.name,
					name: s.name,
					callback: async () => {
						const { query, sort } = s
						const pinned = s.pinned
							.trim()
							.split("\n")
							.map((p) => p.trim())
							.filter((p) => p)
						const tagsAndFoldersForFileNameItems =
							s.tagsAndFoldersForFileNameItems
								.trim()
								.split(":")
								.map((i) => i.trim())
								.filter((i) => i.startsWith("#") || i.endsWith("/"))

						await SyntheticTodoView.open(this.app.workspace, {
							query,
							sort,
							pinned,
							tagsAndFoldersForFileNameItems,
						})
					},
				})
			}
			cmdMap.set(s.name, ok)
		}

		cmdMap.forEach((v, k) => {
			if (v !== ok) {
				cmdMap.delete(k)
				this.app.commands.removeCommand(`${APP_ID}:${k}`)
			}
		})
	}
}

class SyntheticTodoSettingTab extends PluginSettingTab {
	constructor(
		public app: App,
		private plugin: SyntheticTodo,
		private settings: SyntheticTodoSettings,
	) {
		super(app, plugin)
	}

	public display(): void {
		const { containerEl } = this
		containerEl.empty()

		const syntheSettingsContainer = containerEl.createEl("div")
		syntheSettingsContainer.addClass(c("synthe-settings-container"))

		this.settings.store.synthe.map((s) => {
			this.renderUnit(syntheSettingsContainer, s)
		})

		addSpacerDiv(containerEl, "x", "20px")
		const buttonContainer = containerEl.createEl("div")
		const button = buttonContainer.createEl("button")
		button.addClass(c("settings-unit-add"))
		button.addEventListener("click", () => {
			const newUnit = { ...emptySyntheSettingsUnit }
			this.settings.store.synthe.push(newUnit)
			this.renderUnit(syntheSettingsContainer, newUnit)
		})
		button.setText("Add New Synthe Settings")
	}

	private renderUnit(el: HTMLElement, data: SyntheSettingsUnit) {
		const unitContainer = el.createEl("div")
		unitContainer.addClass(c("settings-unit"))
		const onChange = this.onChangeSyntheSettings(data)

		new Setting(unitContainer)
			.setName("Name")
			.setDesc("displayed in command pallete")
			.addText((t) => t.setValue(data.name).onChange(onChange("name")))

		new Setting(unitContainer)
			.setName("Query")
			.setDesc("to narrow down todo sources")
			.addTextArea((t) =>
				t
					.setValue(data.query)
					.setPlaceholder(
						"Search plugin terms can be used.\ntag:todos OR path:projects/",
					)
					.onChange(onChange("query")),
			)

		new Setting(unitContainer)
			.setName("Sort")
			.setDesc("order of files in selection UI")
			.addDropdown((d) =>
				d
					.addOptions(sortOrderOptions)
					.setValue(data.sort)
					.onChange(onChange("sort")),
			)

		new Setting(unitContainer)
			.setName("Pinned")
			.setDesc("files shown on top of the others")
			.addTextArea((t) =>
				t
					.setValue(data.pinned)
					.setPlaceholder("Urgent Tasks.md\nNice Project.md")
					.onChange(onChange("pinned")),
			)

		new Setting(unitContainer)
			.setName("Filename Items")
			.setDesc("show filename intead of checkboxes")
			.addTextArea((t) =>
				t
					.setValue(data.tagsAndFoldersForFileNameItems)
					.setPlaceholder("colon-separated list\n#tag:direcotry/:#anotherTag")
					.onChange(onChange("tagsAndFoldersForFileNameItems")),
			)

		new Setting(unitContainer)
			.setName("Checkbox status")
			.setDesc("shown in selection UI")
			.addTextArea((t) =>
				t
					.setValue(data.checkboxStatus)
					.setPlaceholder(
						"by default, all statuses are included.\nlist chars with no space.",
					)
					.onChange(onChange("checkboxStatus")),
			)

		new Setting(unitContainer)
			.setName("Group by Filename")
			.setDesc("when write todos")
			.addDropdown((d) =>
				d
					.addOptions(groupByFileNameOptions)
					.setValue(data.groupByFileName)
					.onChange(onChange("groupByFileName")),
			)

		addSpacerDiv(unitContainer, "x", "10px")
		const buttonsContainer = unitContainer.createEl("div")
		buttonsContainer.addClass(c("settings-unit-buttons"))
		const buttonsLeft = buttonsContainer.createEl("div")
		const removeButton = buttonsLeft.createEl("button")
		removeButton.setText("remove this settings")
		removeButton.addClass(c("settings-unit-remove"))
		removeButton.addEventListener("click", () => {
			this.settings.store.synthe = this.settings.store.synthe.filter(
				(s) => s !== data,
			)
			unitContainer.remove()
			this.save()
		})

		const buttonsRight = buttonsContainer.createEl("div")
		const moveUpButton = buttonsRight.createEl("button")
		moveUpButton.setText("↑")
		moveUpButton.addEventListener("click", async () => {
			const { synthe } = this.settings.store
			const i = synthe.findIndex((s) => s === data)
			if (i < 1) return
			synthe[i] = synthe[i - 1] as SyntheSettingsUnit
			synthe[i - 1] = data
			const older = el.childNodes[i - 1]
			if (!older) return
			el.insertBefore(unitContainer, older)
			unitContainer.scrollIntoView(true)
			await this.save()
		})
		const moveDownButton = buttonsRight.createEl("button")
		moveDownButton.setText("↓")
		moveDownButton.addEventListener("click", async () => {
			const { synthe } = this.settings.store
			const i = synthe.findIndex((s) => s === data)
			if (i === synthe.length - 1) return
			synthe[i] = synthe[i + 1] as SyntheSettingsUnit
			synthe[i + 1] = data
			const younger = el.childNodes[i + 1]
			if (!younger) return
			el.insertAfter(unitContainer, younger)
			unitContainer.scrollIntoView(false)
			await this.save()
		})
	}

	onChangeSyntheSettings =
		(data: SyntheSettingsUnit) =>
		<K extends keyof SyntheSettingsUnit>(key: K) =>
		async (value: string) => {
			data[key] = value as SyntheSettingsUnit[K]
			if (!this.validateSyntheSettings()) {
				return
			}
			await this.save()
		}

	private validateSyntheSettings() {
		const errorTextClass = c("setting-item-error-text")
		for (const e of this.containerEl.querySelectorAll(`.${errorTextClass}`)) {
			e.remove()
		}
		const errorUnitClass = c("settings-unit-error")
		for (const e of this.containerEl.querySelectorAll(`.${errorUnitClass}`)) {
			e.removeClass(errorUnitClass)
		}

		const { synthe } = this.settings.store
		const { nameDups } = synthe.reduce(
			(acc, s) => {
				;(acc.checked.has(s.name) ? acc.nameDups : acc.checked).add(s.name)
				return acc
			},
			{ checked: new Set<string>(), nameDups: new Set<string>() },
		)
		if (nameDups.size > 0) {
			let first = true
			for (const s of this.containerEl.querySelectorAll<HTMLDivElement>(
				"div.setting-item",
			)) {
				if (s.querySelector("div.setting-item-name")?.innerHTML !== "Name") {
					continue
				}
				const value =
					s.querySelector<HTMLInputElement>("input[type=text]")?.value
				if (value === undefined) continue
				if (nameDups.has(value)) {
					const errorDiv = s.createEl("div")
					errorDiv.addClass(errorTextClass)
					errorDiv.setText("Name must be unique.")
					if (first) {
						first = false
					} else {
						s.parentElement?.addClass(errorUnitClass)
					}
				}
			}
			return false
		}
		return true
	}

	private async save() {
		await this.plugin.saveData(this.settings.store)
		this.settings.syncCommand()
	}
}
