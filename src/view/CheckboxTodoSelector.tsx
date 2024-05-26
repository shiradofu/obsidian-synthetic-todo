import { CheckboxTodoNode, type GroupNode } from "src/model"
import { Card } from "./Card"
import { renderCheckboxTodoItemTree } from "./CheckboxTodoItem"
import { bem } from "./bem"
import type { SelectedTypeMap, SelectionHandlerCreator } from "./hooks"

const c = bem("CheckboxTodoSelector")

export const CheckboxTodoSelector = ({
	farm,
	selectedTypeMap,
	createSelectorHandler,
}: {
	farm: GroupNode
	selectedTypeMap: SelectedTypeMap
	createSelectorHandler: SelectionHandlerCreator
}) => {
	return (
		<Card
			title={
				<span
					className={c("card-title")}
					onClick={createSelectorHandler(farm)}
					onKeyDown={createSelectorHandler(farm)}
				>
					{farm.value}
				</span>
			}
		>
			<section className={c("parcels")}>
				{farm.children.map((parcel) => (
					<div
						key={parcel.id}
						className={c("parcel")}
						onClick={createSelectorHandler(parcel)}
						onKeyDown={createSelectorHandler(parcel)}
					>
						{parcel.value !== "" && (
							<h2 className={c("parcel-name")}>{parcel.value}</h2>
						)}
						<div>
							{renderCheckboxTodoItemTree(
								parcel.children.filter(CheckboxTodoNode.mustBeCheckboxTodoNode),
								createSelectorHandler,
								selectedTypeMap,
							)}
						</div>
					</div>
				))}
			</section>
		</Card>
	)
}
