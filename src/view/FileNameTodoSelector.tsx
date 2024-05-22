import type { FileNameTodoFarm } from "src/model"
import { bem } from "./bem"
import type { SelectedIdMap, SelectionHandlerCreator } from "./hooks"

const c = bem("FileNameTodoSelector")

export const FileNameTodoSelector = ({
	farm,
	selectedIdMap,
	createSelectorHandler,
}: {
	farm: FileNameTodoFarm
	selectedIdMap: SelectedIdMap
	createSelectorHandler: SelectionHandlerCreator
}) => {
	return (
		<div className={c()}>
			<h1 className={c("tag-or-folder")}>{farm.tagOrFolder}</h1>
			<ul className={c("items")}>
				{farm.todos.map((item) => {
					const ctx = [farm.tagOrFolder, item.path]
					const id = ctx.join("/")
					const selectedType = selectedIdMap.get(id)
					const selectedAs = selectedType
						? c("item", `selected-as-${selectedType}`)
						: ""
					return (
						<li
							key={item.path}
							className={`${c("item")} ${selectedAs}`}
							onClick={createSelectorHandler(ctx)}
							onKeyDown={createSelectorHandler(ctx)}
						>
							{item.img ? (
								<img src={item.img} alt={item.path} />
							) : (
								<div className={c("item-noimg")} />
							)}
							{item.path}
						</li>
					)
				})}
			</ul>
		</div>
	)
}
