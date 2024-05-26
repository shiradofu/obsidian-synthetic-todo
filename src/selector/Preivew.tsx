import { type ComponentProps, Fragment } from "react"
import type { GroupNode, TodoNode } from "src/model"
import type { SyntheGroupingSettings } from "src/settings"
import { Card } from "./Card"
import {
	CheckboxTodoItem,
	renderCheckboxTodoItemTree,
} from "./CheckboxTodoItem"
import { bem } from "./bem"
import type {
	SelectedType,
	SelectedTypeMap,
	SelectionHandlerCreator,
} from "./useSelection"

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

const CheckboxTodoPreview = ({
	farm,
	selectedTypeMap,
	createHandlerForPreview,
	config,
}: {
	farm: GroupNode
	selectedTypeMap: SelectedTypeMap
	createHandlerForPreview: SelectionHandlerCreator
	config: SyntheGroupingSettings
}) => {
	return (
		<RenderNodeIf
			cond={config.groupByFileName}
			todo={farm}
			selectedType={selectedTypeMap.get(farm.id)}
			onClick={createHandlerForPreview(farm)}
		>
			{farm.children.map((parcel) => {
				const cond = config.groupByHeading && parcel.value !== ""
				const UL = cond && config.groupByFileName ? "ul" : Fragment
				return (
					<UL key={parcel.id}>
						<RenderNodeIf
							cond={cond}
							todo={parcel}
							selectedType={selectedTypeMap.get(parcel.id)}
							onClick={createHandlerForPreview(parcel)}
						>
							{renderCheckboxTodoItemTree(
								parcel.children,
								createHandlerForPreview,
								selectedTypeMap,
							)}
						</RenderNodeIf>
					</UL>
				)
			})}
		</RenderNodeIf>
	)
}

export const FileNameTodoPreview = ({
	farm,
	selectedTypeMap,
	createHandlerForPreview,
}: {
	farm: TodoNode
	selectedTypeMap: SelectedTypeMap
	createHandlerForPreview: SelectionHandlerCreator
}) => (
	<>
		{renderCheckboxTodoItemTree(
			farm.children,
			createHandlerForPreview,
			selectedTypeMap,
		)}
	</>
)

export const Preview = ({
	farms,
	selectedTypeMap,
	createHandlerInPreivew,
	groupingConfig,
}: {
	farms: GroupNode[]
	selectedTypeMap: Map<string, SelectedType>
	createHandlerInPreivew: SelectionHandlerCreator
	groupingConfig: SyntheGroupingSettings
}) => (
	<Card title="Preview">
		<ul className={bem("Selected")()}>
			{farms.map((f) => {
				switch (f.todoType) {
					case "checkbox":
						return (
							<CheckboxTodoPreview
								key={f.id}
								farm={f}
								selectedTypeMap={selectedTypeMap}
								createHandlerForPreview={createHandlerInPreivew}
								config={groupingConfig}
							/>
						)
					case "fileName":
						return (
							<FileNameTodoPreview
								key={f.id}
								farm={f}
								selectedTypeMap={selectedTypeMap}
								createHandlerForPreview={createHandlerInPreivew}
							/>
						)
				}
			})}
		</ul>
	</Card>
)
