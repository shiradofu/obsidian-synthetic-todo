import { FileNameTodoNode, type GroupNode } from "src/model"
import { bem } from "./bem"
import type { SelectedTypeMap, SelectionHandlerCreator } from "./useSelection"

const c = bem("FileNameTodoSelector")

export const FileNameTodoSelector = ({
	farm,
	selectedTypeMap,
	createHandler,
}: {
	farm: GroupNode
	selectedTypeMap: SelectedTypeMap
	createHandler: SelectionHandlerCreator
}) => {
	return (
		<div className={c()}>
			<h1 className={c("tag-or-folder")}>{farm.value}</h1>
			<ul className={c("items")}>
				{farm.children
					.filter(FileNameTodoNode.mustBeFileNameTodoNode)
					.map((todo) => {
						const selectedType = selectedTypeMap.get(todo.id)
						const selectedAs = selectedType
							? c("item", `selected-as-${selectedType}`)
							: ""
						return (
							<li
								key={todo.id}
								className={`${c("item")} ${selectedAs}`}
								onClick={createHandler(todo)}
								onKeyDown={createHandler(todo)}
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
