import { useEffect, useState } from "react"
import type {
	CheckboxItem,
	CheckboxItemFarm,
	FileNameItemFarm,
	ItemFarm,
} from "./model"

type Props = {
	registerListener: (callback: (itemFarms: ItemFarm[]) => void) => void
}

const renderItemRecursive = (items: CheckboxItem[], parentText: string) => {
	return (
		<>
			{items.map((item) => {
				return (
					<li key={`${parentText}/${item.text}`}>
						[{item.status}] {item.text}
						{item.children.length > 0 && (
							<ul>{renderItemRecursive(item.children, item.text)}</ul>
						)}
					</li>
				)
			})}
		</>
	)
}

const CheckboxItemFarmCard = ({ farm }: { farm: CheckboxItemFarm }) => {
	return (
		<div>
			<h2>{farm.path}</h2>
			{farm.segments.map((s) => {
				return (
					<div key={s.heading ?? ""}>
						{s.heading && <h3>{s.heading}</h3>}
						<ul>{renderItemRecursive(s.items, "")}</ul>
					</div>
				)
			})}
		</div>
	)
}

const FileNameItemFarmCard = ({ farm }: { farm: FileNameItemFarm }) => {
	return (
		<div>
			<h2>{farm.tagOrFolder}</h2>
			<div>
				<ul>
					{farm.segments[0]?.items.map((item) => {
						return <li key={item.path}>{item.path}</li>
					})}
				</ul>
			</div>
		</div>
	)
}

export const UI = ({ registerListener }: Props) => {
	const [files, setFiles] = useState<ItemFarm[]>([])
	useEffect(() => {
		return registerListener((farms) => setFiles(farms))
	}, [registerListener])

	return (
		<div>
			{files.map((f) => {
				switch (f.itemType) {
					case "checkbox":
						return <CheckboxItemFarmCard key={f.path} farm={f} />
					case "fileName":
						return <FileNameItemFarmCard key={f.tagOrFolder} farm={f} />
				}
			})}
		</div>
	)
}
