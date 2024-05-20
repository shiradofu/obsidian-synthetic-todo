import { StrictMode, useEffect, useState } from "react"
import type { TodoFarm } from "../model"
import { Card } from "./Card"
import { CheckboxTodoSelector } from "./CheckboxTodoSelector"
import { FileNameTodoSelector } from "./FileNameTodoSelector"
import { bem } from "./bem"

const c = bem()

type Props = {
	registerListener: (callback: (todoFarms: TodoFarm[]) => void) => void
}

export const Selector = ({ registerListener }: Props) => {
	const [farms, setFarms] = useState<TodoFarm[]>([])
	useEffect(() => {
		return registerListener((farms) => setFarms(farms))
	}, [registerListener])

	return (
		<StrictMode>
			<main id={c()}>
				<div className={c("left")}>
					{farms.map((f) => {
						switch (f.todoType) {
							case "checkbox":
								return <CheckboxTodoSelector farm={f} key={f.path} />
							case "fileName":
								return <FileNameTodoSelector farm={f} key={f.tagOrFolder} />
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
