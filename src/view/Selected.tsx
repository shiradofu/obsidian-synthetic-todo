import { type ComponentProps, Fragment } from "react"
import type { GroupNode, TodoNode } from "src/model"
import {
	CheckboxTodoItem,
	renderCheckboxTodoItemTree,
} from "./CheckboxTodoItem"
import type { SelectedTypeMap, SelectionHandlerCreator } from "./hooks"

const RenderNodeIf = ({
	cond,
	children,
	...props
}: {
	cond: boolean
} & ComponentProps<typeof CheckboxTodoItem>) =>
	cond ? (
		<CheckboxTodoItem {...props}>{children}</CheckboxTodoItem>
	) : (
		<>{children}</>
	)

export const CheckboxTodoSelected = ({
	farm,
	selectedTypeMap,
	createSelectedHandler,
	groupByFileName,
	groupByHeading,
}: {
	farm: GroupNode
	selectedTypeMap: SelectedTypeMap
	createSelectedHandler: SelectionHandlerCreator
	groupByFileName: boolean
	groupByHeading: boolean
}) => {
	return (
		<RenderNodeIf
			cond={groupByFileName}
			todo={farm}
			selectedType={selectedTypeMap.get(farm.id)}
			onClick={createSelectedHandler(farm)}
		>
			{farm.children.map((parcel) => {
				const cond = groupByHeading && parcel.value !== ""
				const UL = cond && groupByFileName ? "ul" : Fragment
				return (
					<UL key={parcel.id}>
						<RenderNodeIf
							cond={cond}
							todo={parcel}
							selectedType={selectedTypeMap.get(parcel.id)}
							onClick={createSelectedHandler(parcel)}
						>
							{renderCheckboxTodoItemTree(
								parcel.children,
								createSelectedHandler,
								selectedTypeMap,
							)}
						</RenderNodeIf>
					</UL>
				)
			})}
		</RenderNodeIf>
	)
}

export const FileNameTodoSelected = ({
	farm,
	selectedTypeMap,
	createSelectedHandler,
}: {
	farm: TodoNode
	selectedTypeMap: SelectedTypeMap
	createSelectedHandler: SelectionHandlerCreator
}) => (
	<>
		{renderCheckboxTodoItemTree(
			farm.children,
			createSelectedHandler,
			selectedTypeMap,
		)}
	</>
)
