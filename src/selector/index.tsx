import { StrictMode } from "react"
import type { GroupNode } from "src/model"
import { Preview } from "./Preivew"
import { Selectors } from "./Selectors"
import { bem } from "./bem"
import { useFarms } from "./useFarms"
import { type SelectedTypeMap, useSelection } from "./useSelection"

const c = bem()

type Props = {
	registerFarmListener: (callback: (todoFarms: GroupNode[]) => void) => void
	setSelectedTypeMapToViewState: (SelectedTypeMap: SelectedTypeMap) => void
	selectedTypeMapHydration: SelectedTypeMap
}

export const SelectorUI = ({
	registerFarmListener,
	selectedTypeMapHydration,
	setSelectedTypeMapToViewState,
}: Props) => {
	const farms = useFarms(registerFarmListener)
	const { selectedTypeMap, createHandler, createHandlerForPreview } =
		useSelection(selectedTypeMapHydration, setSelectedTypeMapToViewState)
	const groupingConfig = {
		groupByFileName: true,
		groupByHeading: false,
	}

	return (
		<StrictMode>
			<main id={c()}>
				<div className={c("left")}>
					<Selectors
						farms={farms}
						selectedTypeMap={selectedTypeMap}
						createHandler={createHandler}
					/>
				</div>
				<div className={c("right")}>
					<Preview
						farms={farms}
						selectedTypeMap={selectedTypeMap}
						createHandlerInPreivew={createHandlerForPreview}
						groupingConfig={groupingConfig}
					/>
				</div>
			</main>
		</StrictMode>
	)
}
