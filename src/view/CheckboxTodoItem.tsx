import type { HTMLAttributes, ReactNode } from "react"
import { CheckboxTodoNode, type TodoNode } from "src/model"
import { bem } from "./bem"
import type { SelectedTypeMap, SelectionHandlerCreator } from "./hooks"

const c = bem("CheckboxTodoItem")

export const CheckboxTodoItem = ({
	todo,
	children,
	selectedType,
	...props
}: {
	todo: TodoNode
	children?: ReactNode
	selectedType: string | undefined
} & HTMLAttributes<HTMLLIElement>) => {
	const selectedAs = selectedType ? c("", `selected-as-${selectedType}`) : ""
	const status = (todo instanceof CheckboxTodoNode && todo.status) || " "
	const isChecked = status !== " " ? "is-checked" : ""
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
				{todo.value}
			</span>
			{children}
		</li>
	)
}

export const renderCheckboxTodoItemTree = (
	todos: TodoNode[],
	createOnClick: SelectionHandlerCreator,
	selectedTypeMap: SelectedTypeMap,
) => (
	<ul>
		{todos.map((todo) => {
			return (
				<CheckboxTodoItem
					key={todo.id}
					todo={todo}
					onClick={createOnClick(todo)}
					selectedType={selectedTypeMap.get(todo.id)}
				>
					{todo.children.length > 0 &&
						renderCheckboxTodoItemTree(
							todo.children,
							createOnClick,
							selectedTypeMap,
						)}
				</CheckboxTodoItem>
			)
		})}
	</ul>
)
