import type { FileNameItemEntity } from "src/model"
import { bem } from "./bem"

const c = bem("FileNameItem")

type Props = {
	item: FileNameItemEntity
}

export const FileNameItem = ({ item }: Props) => (
	<li className={c()}>
		{item.img ? (
			<img src={item.img} alt={item.path} />
		) : (
			<div className={c("no-image")} />
		)}
		{item.path}
	</li>
)
