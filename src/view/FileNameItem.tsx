import type { FileNameItem as FileNameItemEntity } from "src/model"
import { bem } from "./bem"

const c = bem("FileNameItem")

type Props = {
	item: FileNameItemEntity
}

export const FileNameItem = ({ item }: Props) => (
	<li className={c()}>
		<img src="https://picsum.photos/seed/picsum/100/100" alt={item.path} />
		{item.path}
	</li>
)
