import { StrictMode } from "react"
import type { TodoNode } from "src/model"
import { Card } from "./Card"
import { CheckboxTodoSelector } from "./CheckboxTodoSelector"
import { FileNameTodoSelector } from "./FileNameTodoSelector"
import { CheckboxTodoSelected, FileNameTodoSelected } from "./Selected"
import { bem } from "./bem"
import { type SelectedTypeMap, useFarms, useSelectedTypeMap } from "./hooks"

const c = bem()

type Props = {
	registerFarmListener: (callback: (todoFarms: TodoNode[]) => void) => void
	setSelectedTypeMapToViewState: (SelectedTypeMap: SelectedTypeMap) => void
	selectedTypeMapHydration: SelectedTypeMap
}

export const Selector = ({
	registerFarmListener,
	selectedTypeMapHydration,
	setSelectedTypeMapToViewState,
}: Props) => {
	const farms = useFarms(registerFarmListener)
	const { selectedTypeMap, createSelectorHandler, createSelectedHandler } =
		useSelectedTypeMap(selectedTypeMapHydration, setSelectedTypeMapToViewState)
	const config = {
		groupByFileName: true,
		groupByHeading: false,
	}

	return (
		<StrictMode>
			<main id={c()}>
				<div className={c("left")}>
					{farms.map((f) => {
						const TodoSelector =
							f.todoType === "checkbox"
								? CheckboxTodoSelector
								: FileNameTodoSelector
						return (
							<TodoSelector
								key={f.value}
								farm={f}
								selectedTypeMap={selectedTypeMap}
								createSelectorHandler={createSelectorHandler}
							/>
						)
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
												key={f.id}
												farm={f}
												selectedTypeMap={selectedTypeMap}
												createSelectedHandler={createSelectedHandler}
												{...config}
											/>
										)
									case "filename":
										return (
											<FileNameTodoSelected
												key={f.id}
												farm={f}
												selectedTypeMap={selectedTypeMap}
												createSelectedHandler={createSelectedHandler}
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
