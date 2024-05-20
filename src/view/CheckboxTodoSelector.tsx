import { removeDupMarker } from "src/helper"
import type { CheckboxTodoFarm } from "src/model"
import { Card } from "./Card"
import { renderCheckboxTodoItemTree } from "./CheckboxTodoItem"
import { bem } from "./bem"

const c = bem("CheckboxTodoSelector")

export const CheckboxTodoSelector = ({ farm }: { farm: CheckboxTodoFarm }) => {
	return (
		<Card title={farm.path}>
			<section className={c("parcels")}>
				{farm.parcels.map((parcel) => (
					<div key={parcel.name} className={c("parcel")}>
						{parcel.name !== "" && (
							<h2 className={c("parcel-name")}>
								{removeDupMarker(parcel.name)}
							</h2>
						)}
						<div>
							{renderCheckboxTodoItemTree(
								parcel.todos,
								[farm.path, parcel.name],
								(context) => (e) => {
									e.stopPropagation()
									console.log(context)
								},
							)}
						</div>
					</div>
				))}
			</section>
		</Card>
	)
}
