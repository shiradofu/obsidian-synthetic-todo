import { FilenameTodoNode, type TodoNode } from "src/model"
import { bem } from "./bem"
import type { SelectedIdMap, SelectionHandlerCreator } from "./hooks"

const c = bem("FileNameTodoSelector")

export const FileNameTodoSelector = ({
	farm,
	selectedIdMap,
	createSelectorHandler,
}: {
	farm: TodoNode
	selectedIdMap: SelectedIdMap
	createSelectorHandler: SelectionHandlerCreator
}) => {
	return (
		<div className={c()}>
			<h1 className={c("tag-or-folder")}>{farm.value}</h1>
			<ul className={c("items")}>
				{farm.children
					.filter(FilenameTodoNode.mustBeFilenameTodoNode)
					.map((todo) => {
						const selectedType = selectedIdMap.get(todo.id)
						const selectedAs = selectedType
							? c("item", `selected-as-${selectedType}`)
							: ""
						return (
							<li
								key={todo.id}
								className={`${c("item")} ${selectedAs}`}
								onClick={createSelectorHandler(todo)}
								onKeyDown={createSelectorHandler(todo)}
							>
								{todo.img ? (
									<img src={todo.img} alt={todo.value} />
								) : (
									<div className={c("item-noimg")} />
								)}
								{todo.value}
							</li>
						)
					})}
			</ul>
		</div>
	)
}
