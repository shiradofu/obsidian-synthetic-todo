import type { ReactNode } from "react"
import { bem } from "./bem"

type Props = {
	title: string
	children: ReactNode
}

const c = bem("Card")

export const Card = ({ title, children }: Props) => (
	<div className={c()}>
		<h1 className={c("title")}>{title}</h1>
		<hr className={c("divider")} />
		{children}
	</div>
)
