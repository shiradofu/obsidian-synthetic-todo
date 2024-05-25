import { Fragment, type HTMLAttributes, type ReactNode } from "react"
import { CheckboxTodoNode, type TodoNode } from "src/model"
import {
	CheckboxTodoItem,
	renderCheckboxTodoItemTree,
} from "./CheckboxTodoItem"
import type { SelectedTypeMap, SelectionHandlerCreator } from "./hooks"

const RenderCheckboxIf = ({
	cond,
	children,
	...props
}: {
	cond: boolean
	children: ReactNode
	todo: TodoNode
	selectedType: string | undefined
} & HTMLAttributes<HTMLLIElement>) =>
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
	farm: TodoNode
	selectedTypeMap: SelectedTypeMap
	createSelectedHandler: SelectionHandlerCreator
	groupByFileName: boolean
	groupByHeading: boolean
}) => {
	return (
		<RenderCheckboxIf
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
						<RenderCheckboxIf
							cond={cond}
							todo={parcel}
							selectedType={selectedTypeMap.get(parcel.id)}
							onClick={createSelectedHandler(parcel)}
						>
							{renderCheckboxTodoItemTree(
								parcel.children.filter(CheckboxTodoNode.mustBeCheckboxTodoNode),
								createSelectedHandler,
								selectedTypeMap,
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
