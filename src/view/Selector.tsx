import { StrictMode } from "react"
import type { TodoFarm } from "../model"
import { Card } from "./Card"
import { CheckboxTodoSelector } from "./CheckboxTodoSelector"
import { FileNameTodoSelector } from "./FileNameTodoSelector"
import { CheckboxTodoSelected, FileNameTodoSelected } from "./Selected"
import { bem } from "./bem"
import { type SelectedIdMap, useFarms, useSelectedIdMap } from "./hooks"

const c = bem()

type Props = {
	registerFarmListener: (callback: (todoFarms: TodoFarm[]) => void) => void
	setSelectedIdMapToViewState: (SelectedIdMap: SelectedIdMap) => void
	selectedIdMapHydration: SelectedIdMap
}

export const Selector = ({
	registerFarmListener,
	selectedIdMapHydration,
	setSelectedIdMapToViewState,
}: Props) => {
	const farms = useFarms(registerFarmListener)
	const { selectedIdMap, createSelectorHandler, createSelectedHandler } =
		useSelectedIdMap(selectedIdMapHydration, setSelectedIdMapToViewState)
	const config = {
		groupByFileName: true,
		groupByHeading: false,
	}

	return (
		<StrictMode>
			<main id={c()}>
				<div className={c("left")}>
					{farms.map((f) => {
						switch (f.todoType) {
							case "checkbox":
								return (
									<CheckboxTodoSelector
										farm={f}
										selectedIdMap={selectedIdMap}
										createSelectorHandler={createSelectorHandler}
										key={f.path}
									/>
								)
							case "fileName":
								return (
									<FileNameTodoSelector
										farm={f}
										selectedIdMap={selectedIdMap}
										createSelectorHandler={createSelectorHandler}
										key={f.tagOrFolder}
									/>
								)
						}
					})}
				</div>
				<div className={c("right")}>
					<Card title="Selected">
						<ul className={bem("Selected")()}>
							{farms.map((f) => {
								switch (f.todoType) {
									case "checkbox":
										return (
											<CheckboxTodoSelected
												farm={f}
												selectedIdMap={selectedIdMap}
												createSelectedHandler={createSelectedHandler}
												key={f.path}
												{...config}
											/>
										)
									case "fileName":
										return (
											<FileNameTodoSelected
												farm={f}
												selectedIdMap={selectedIdMap}
												createSelectedHandler={createSelectedHandler}
												key={f.tagOrFolder}
											/>
										)
								}
							})}
						</ul>
					</Card>
				</div>
			</main>
		</StrictMode>
	)
}
