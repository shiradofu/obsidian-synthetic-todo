import type { ReactNode } from "react"
import type { CheckboxItemEntity } from "src/model"
import { bem } from "./bem"

const c = bem("CheckboxItem")

type Props = {
	item: CheckboxItemEntity
	children: ReactNode
}

const CheckboxItem = ({ item, children }: Props) => {
	const isChecked = item.status !== " " ? "is-checked" : ""
	const status = item.status !== " " ? item.status : ""
	return (
		<li data-task={status} className={`${c()} ${isChecked}`}>
			<p className={c("content")} data-task={status}>
				<input type="checkbox" checked={!!isChecked} readOnly />
				{item.text}
			</p>
			{children}
		</li>
	)
}

export const renderItemRecursive = (
	items: CheckboxItemEntity[],
	parentText: string,
) => (
	<>
		{items.map((item) => {
			const key = `${parentText}/${item.text}`
			return (
				<CheckboxItem key={key} item={item}>
					{item.children.length > 0 && (
						<ul>{renderItemRecursive(item.children, key)}</ul>
					)}
				</CheckboxItem>
			)
		})}
	</>
)
