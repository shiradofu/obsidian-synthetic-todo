import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react"
import { removeDupMarker } from "src/helper"
import type { CheckboxTodo } from "src/model"
import { bem } from "./bem"

const c = bem("CheckboxTodoItem")

export const CheckboxTodoItem = ({
	todo,
	children,
	...props
}: {
	todo: CheckboxTodo
	children?: ReactNode
} & HTMLAttributes<HTMLLIElement>) => {
	const isChecked = todo.status !== " " ? "is-checked" : ""
	const status = todo.status !== " " ? todo.status : ""
	return (
		<li data-task={status} className={`${c()} ${isChecked}`} {...props}>
			<p className={c("content")} data-task={status}>
				<input type="checkbox" checked={!!isChecked} readOnly />
				{removeDupMarker(todo.text)}
			</p>
			{children}
		</li>
	)
}

export const renderCheckboxTodoItemTree = (
	todos: CheckboxTodo[],
	ctx: string[],
	createOnClick: (context: string[]) => MouseEventHandler,
) => (
	<ul>
		{todos.map((todo) => {
			const currentCtx = [...ctx, todo.text]
			return (
				<CheckboxTodoItem
					key={currentCtx.join("/")}
					todo={todo}
					onClick={createOnClick(currentCtx)}
				>
					{todo.children.length > 0 &&
						renderCheckboxTodoItemTree(
							todo.children,
							currentCtx,
							createOnClick,
						)}
				</CheckboxTodoItem>
			)
		})}
	</ul>
)
