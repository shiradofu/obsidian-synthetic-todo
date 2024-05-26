import { CheckboxTodoNode, type GroupNode } from "src/model"
import { Card } from "./Card"
import { renderCheckboxTodoItemTree } from "./CheckboxTodoItem"
import { bem } from "./bem"
import type { SelectedTypeMap, SelectionHandlerCreator } from "./useSelection"

const c = bem("CheckboxTodoSelector")

export const CheckboxTodoSelector = ({
	farm,
	selectedTypeMap,
	createHandler,
}: {
	farm: GroupNode
	selectedTypeMap: SelectedTypeMap
	createHandler: SelectionHandlerCreator
}) => {
	return (
		<Card
			title={
				<span
					className={c("card-title")}
					onClick={createHandler(farm)}
					onKeyDown={createHandler(farm)}
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
						onClick={createHandler(parcel)}
						onKeyDown={createHandler(parcel)}
					>
						{parcel.value !== "" && (
							<h2 className={c("parcel-name")}>{parcel.value}</h2>
						)}
						<div>
							{renderCheckboxTodoItemTree(
								parcel.children.filter(CheckboxTodoNode.mustBeCheckboxTodoNode),
								createHandler,
								selectedTypeMap,
							)}
						</div>
					</div>
				))}
			</section>
		</Card>
	)
}
