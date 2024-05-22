import { Fragment, type HTMLAttributes, type ReactNode } from "react"
import {
	CheckboxTodo,
	type CheckboxTodoFarm,
	type FileNameTodoFarm,
} from "src/model"
import {
	CheckboxTodoItem,
	renderCheckboxTodoItemTree,
} from "./CheckboxTodoItem"
import type { SelectedIdMap, SelectionHandlerCreator } from "./hooks"

const RenderCheckboxIf = ({
	cond,
	text,
	children,
	selectedType,
	...props
}: {
	cond: boolean
	text: string
	children: ReactNode
	selectedType: string | undefined
} & HTMLAttributes<HTMLLIElement>) =>
	cond ? (
		<CheckboxTodoItem
			todo={new CheckboxTodo(text)}
			selectedType={selectedType}
			{...props}
		>
			{children}
		</CheckboxTodoItem>
	) : (
		<>{children}</>
	)

export const CheckboxTodoSelected = ({
	farm,
	selectedIdMap,
	createSelectedHandler,
	groupByFileName,
	groupByHeading,
}: {
	farm: CheckboxTodoFarm
	selectedIdMap: SelectedIdMap
	createSelectedHandler: SelectionHandlerCreator
	groupByFileName: boolean
	groupByHeading: boolean
}) => {
	return (
		<RenderCheckboxIf
			cond={groupByFileName}
			text={farm.path}
			selectedType={selectedIdMap.get(farm.path)}
			onClick={createSelectedHandler([farm.path], farm.parcels)}
		>
			{farm.parcels.map((parcel) => {
				const cond = groupByHeading && parcel.name !== ""
				const UL = cond && groupByFileName ? "ul" : Fragment
				const ctx = [farm.path, parcel.name]
				const id = ctx.join("/")
				return (
					<UL key={`${farm.path}/${parcel.name}`}>
						<RenderCheckboxIf
							cond={cond}
							text={parcel.name}
							selectedType={selectedIdMap.get(id)}
							onClick={createSelectedHandler(ctx, parcel.todos)}
						>
							{renderCheckboxTodoItemTree(
								parcel.todos,
								ctx,
								createSelectedHandler,
								selectedIdMap,
							)}
						</RenderCheckboxIf>
					</UL>
				)
			})}
		</RenderCheckboxIf>
	)
}

export const FileNameTodoSelected = ({
	farm,
	selectedIdMap,
	createSelectedHandler,
}: {
	farm: FileNameTodoFarm
	selectedIdMap: SelectedIdMap
	createSelectedHandler: SelectionHandlerCreator
}) => (
	<>
		{renderCheckboxTodoItemTree(
			farm.todos.map(({ path }) => new CheckboxTodo(path)),
			[farm.tagOrFolder],
			createSelectedHandler,
			selectedIdMap,
		)}
	</>
)
