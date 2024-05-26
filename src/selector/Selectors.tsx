import type { GroupNode } from "src/model"
import { CheckboxTodoSelector } from "./CheckboxTodoSelector"
import { FileNameTodoSelector } from "./FileNameTodoSelector"
import type { SelectedType, SelectionHandlerCreator } from "./useSelection"

export const Selectors = ({
	farms,
	selectedTypeMap,
	createHandler,
}: {
	farms: GroupNode[]
	selectedTypeMap: Map<string, SelectedType>
	createHandler: SelectionHandlerCreator
}) =>
	farms.map((f) => {
		const TodoSelector =
			f.todoType === "checkbox"
				? CheckboxTodoSelector
				: f.todoType === "fileName"
					? FileNameTodoSelector
					: () => {
							console.error(`invalid todoType: ${f.value} -> ${f.todoType}`)
							return null
						}
		return (
			<TodoSelector
				key={f.value}
				farm={f}
				selectedTypeMap={selectedTypeMap}
				createHandler={createHandler}
			/>
		)
	})
