import { removeDupMarker } from "src/helper"
import type { CheckboxTodoFarm } from "src/model"
import { Card } from "./Card"
import { renderCheckboxTodoItemTree } from "./CheckboxTodoItem"
import { bem } from "./bem"
import type { SelectedIdMap, SelectionHandlerCreator } from "./hooks"

const c = bem("CheckboxTodoSelector")

export const CheckboxTodoSelector = ({
	farm,
	selectedIdMap,
	createSelectorHandler,
}: {
	farm: CheckboxTodoFarm
	selectedIdMap: SelectedIdMap
	createSelectorHandler: SelectionHandlerCreator
}) => {
	return (
		<Card
			title={
				<span
					className={c("card-title")}
					onClick={createSelectorHandler([farm.path], farm.parcels, true)}
					onKeyDown={createSelectorHandler([farm.path], farm.parcels, true)}
				>
					{farm.path}
				</span>
			}
		>
			<section className={c("parcels")}>
				{farm.parcels.map((parcel) => (
					<div key={parcel.name} className={c("parcel")}>
						{parcel.name !== "" && (
							<h2
								className={c("parcel-name")}
								onClick={createSelectorHandler(
									[farm.path, parcel.name],
									parcel.todos,
									true,
								)}
								onKeyDown={createSelectorHandler(
									[farm.path, parcel.name],
									parcel.todos,
									true,
								)}
							>
								{removeDupMarker(parcel.name)}
							</h2>
						)}
						<div>
							{renderCheckboxTodoItemTree(
								parcel.todos,
								[farm.path, parcel.name],
								createSelectorHandler,
								selectedIdMap,
							)}
						</div>
					</div>
				))}
			</section>
		</Card>
	)
}
