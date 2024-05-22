import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react"
import { removeDupMarker } from "src/helper"
import type { CheckboxTodo } from "src/model"
import { bem } from "./bem"
import type { SelectedIdMap } from "./hooks"

const c = bem("CheckboxTodoItem")

export const CheckboxTodoItem = ({
	todo,
	children,
	selectedType,
	...props
}: {
	todo: CheckboxTodo
	children?: ReactNode
	selectedType: string | undefined
} & HTMLAttributes<HTMLLIElement>) => {
	const selectedAs = selectedType ? c("", `selected-as-${selectedType}`) : ""
	const isChecked = todo.status !== " " ? "is-checked" : ""
	const status = todo.status !== " " ? todo.status : ""
	return (
		<li
			data-task={status}
			className={`${c()} ${selectedAs} ${isChecked}`}
			{...props}
		>
			<span className={c("content")} data-task={status}>
				<input
					type="checkbox"
					data-task={status}
					checked={!!isChecked}
					readOnly
				/>
				{removeDupMarker(todo.text)}
			</span>
			{children}
		</li>
	)
}

export const renderCheckboxTodoItemTree = (
	todos: CheckboxTodo[],
	parentCtx: string[],
	createOnClick: (
		currentCtx: string[],
		children: CheckboxTodo[],
	) => MouseEventHandler,
	selectedIdMap: SelectedIdMap,
) => (
	<ul>
		{todos.map((todo) => {
			const currentCtx = [...parentCtx, todo.text]
			const id = currentCtx.join("/")
			return (
				<CheckboxTodoItem
					key={id}
					todo={todo}
					onClick={createOnClick(currentCtx, todo.children)}
					selectedType={selectedIdMap.get(id)}
				>
					{todo.children.length > 0 &&
						renderCheckboxTodoItemTree(
							todo.children,
							currentCtx,
							createOnClick,
							selectedIdMap,
						)}
				</CheckboxTodoItem>
			)
		})}
	</ul>
)
