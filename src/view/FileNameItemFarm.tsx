import type { FileNameItemFarm as FileNameItemFarmEntity } from "src/model"
import { bem } from "./bem"
import { FileNameItem } from "./FileNameItem"

const c = bem("FileNameItemFarm")

export const FileNameItemFarm = ({
	farm,
}: { farm: FileNameItemFarmEntity }) => {
	return (
		<div className={c()}>
			<h1 className={c("title")}>{farm.tagOrFolder}</h1>
			<ul className={c("items")}>
				{farm.segments[0]?.items.map((item) => (
					<FileNameItem key={item.path} item={item} />
				))}
			</ul>
		</div>
	)
}
