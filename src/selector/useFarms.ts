import { useEffect, useState } from "react"
import type { GroupNode } from "src/model"

export const useFarms = (
	registerListener: (callback: (todoFarms: GroupNode[]) => void) => void,
) => {
	const [farms, setFarms] = useState<GroupNode[]>([])
	useEffect(() => {
		return registerListener((farms) => setFarms(farms))
	}, [registerListener])

	return farms
}
