import type { FileNameTodoFarm } from "src/model"
import { bem } from "./bem"

const c = bem("FileNameTodoSelector")

export const FileNameTodoSelector = ({ farm }: { farm: FileNameTodoFarm }) => {
	return (
		<div className={c()}>
			<h1 className={c("tag-or-folder")}>{farm.tagOrFolder}</h1>
			<ul className={c("items")}>
				{farm.todos.map((item) => (
					<li key={item.path} className={c("item")}>
						{item.img ? (
							<img src={item.img} alt={item.path} />
						) : (
							<div className={c("item-noimg")} />
						)}
						{item.path}
					</li>
				))}
			</ul>
		</div>
	)
}
