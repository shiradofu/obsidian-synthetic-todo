import { Fragment, type HTMLAttributes, type ReactNode } from "react"
import { CheckboxTodoNode, type TodoNode } from "src/model"
import {
	CheckboxTodoItem,
	renderCheckboxTodoItemTree,
} from "./CheckboxTodoItem"
import type { SelectedIdMap, SelectionHandlerCreator } from "./hooks"

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
	selectedIdMap,
	createSelectedHandler,
	groupByFileName,
	groupByHeading,
}: {
	farm: TodoNode
	selectedIdMap: SelectedIdMap
	createSelectedHandler: SelectionHandlerCreator
	groupByFileName: boolean
	groupByHeading: boolean
}) => {
	return (
		<RenderCheckboxIf
			cond={groupByFileName}
			todo={farm}
			selectedType={selectedIdMap.get(farm.id)}
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
							selectedType={selectedIdMap.get(parcel.id)}
							onClick={createSelectedHandler(parcel)}
						>
							{renderCheckboxTodoItemTree(
								parcel.children.filter(CheckboxTodoNode.mustBeCheckboxTodoNode),
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
	farm: TodoNode
	selectedIdMap: SelectedIdMap
	createSelectedHandler: SelectionHandlerCreator
}) => (
	<>
		{renderCheckboxTodoItemTree(
			farm.children,
			createSelectedHandler,
			selectedIdMap,
		)}
	</>
)
