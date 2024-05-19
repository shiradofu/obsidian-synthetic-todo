import { StrictMode, useEffect, useState } from "react"
import type { ItemFarmEntity } from "../model"
import { Card } from "./Card"
import { CheckboxItemFarm } from "./CheckboxItemFarm"
import { FileNameItemFarm } from "./FileNameItemFarm"
import { bem } from "./bem"

const c = bem()

type Props = {
	registerListener: (callback: (itemFarms: ItemFarmEntity[]) => void) => void
}

export const UI = ({ registerListener }: Props) => {
	const [farms, setFarms] = useState<ItemFarmEntity[]>([])
	useEffect(() => {
		return registerListener((farms) => setFarms(farms))
	}, [registerListener])

	return (
		<StrictMode>
			<main id={c()}>
				<div className={c("left")}>
					{farms.map((f) => {
						switch (f.itemType) {
							case "checkbox":
								return <CheckboxItemFarm key={f.path} farm={f} />
							case "fileName":
								return <FileNameItemFarm key={f.tagOrFolder} farm={f} />
						}
					})}
				</div>
				<div className={c("right")}>
					<Card title="Selected">{null}</Card>
				</div>
			</main>
		</StrictMode>
	)
}
