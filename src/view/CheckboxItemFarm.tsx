import type { CheckboxItemFarmEntity } from "src/model"
import { Card } from "./Card"
import { renderItemRecursive } from "./CheckboxItem"
import { bem } from "./bem"
import { removeDupMarker } from "./helper"

const c = bem("CheckboxItemFarm")

export const CheckboxItemFarm = ({
	farm,
}: { farm: CheckboxItemFarmEntity }) => {
	return (
		<Card title={farm.path}>
			<section className={c("segments")}>
				{farm.segments.map((s) => (
					<div key={s.heading ?? ""} className={c("items")}>
						{s.heading && (
							<h2 className={c("segment-title")}>
								{removeDupMarker(s.heading)}
							</h2>
						)}
						<ul>{renderItemRecursive(s.items, s.heading ?? "")}</ul>
					</div>
				))}
			</section>
		</Card>
	)
}
