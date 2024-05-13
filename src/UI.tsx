import type { TFile } from "obsidian"
import { useEffect, useState } from "react"

type Props = {
	registerListener: (callback: (files: TFile[]) => void) => void
}

export const UI = ({ registerListener }: Props) => {
	const [files, setFiles] = useState<TFile[]>([])
	useEffect(() => {
		registerListener((files) => setFiles(files))
	}, [registerListener])

	return (
		<ul>
			{files.map((f) => {
				return <li key={f.path}>{f.path}</li>
			})}
		</ul>
	)
}
