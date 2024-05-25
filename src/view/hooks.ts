import {
	type EventHandler,
	type SyntheticEvent,
	useEffect,
	useState,
} from "react"
import type { TodoNode } from "src/model"

export const useFarms = (
	registerListener: (callback: (todoFarms: TodoNode[]) => void) => void,
) => {
	const [farms, setFarms] = useState<TodoNode[]>([])
	useEffect(() => {
		return registerListener((farms) => setFarms(farms))
	}, [registerListener])

	return farms
}

export type SelectedType = "copy" | "parent"
export type SelectedTypeMap = Map<string, SelectedType>
export type SelectionHandlerCreator = (
	todoNode: TodoNode,
) => EventHandler<SyntheticEvent>

export const useSelectedTypeMap = (
	initialState: SelectedTypeMap,
	setSelectedTypeMapToViewState: (selectedTypeMap: SelectedTypeMap) => void,
) => {
	const [selectedTypeMap, _setSelectedTypeMapToReactState] =
		useState<SelectedTypeMap>(initialState)
	const setSelectedTypeMap = (newMap: SelectedTypeMap) => {
		_setSelectedTypeMapToReactState(newMap)
		setSelectedTypeMapToViewState(newMap)
	}

	const selectChildrenRecursive = (
		map: SelectedTypeMap,
		todoNode: TodoNode,
		selectedType: "copy",
	) => {
		for (const child of todoNode.children) {
			map.set(child.id, child.nodeType === "group" ? "parent" : selectedType)
			selectChildrenRecursive(map, child, selectedType)
		}
	}

	const deselectChildrenRecursive = (
		map: SelectedTypeMap,
		todoNode: TodoNode,
	) => {
		for (const child of todoNode.children) {
			map.delete(child.id)
			deselectChildrenRecursive(map, child)
		}
	}

	const areAllChildrenSelected = (
		map: SelectedTypeMap,
		todoNode: TodoNode,
	): boolean =>
		!todoNode.children.find(
			(child) =>
				!map.has(child.id) ||
				(child.nodeType === "todo" && map.get(child.id) === "parent") ||
				!areAllChildrenSelected(map, child),
		)

	const selectParentRecursive = (map: SelectedTypeMap, todoNode: TodoNode) => {
		if (todoNode.parent === undefined) return
		const { parent } = todoNode
		if (map.has(parent.id)) return
		map.set(parent.id, "parent")
		selectParentRecursive(map, parent)
	}

	const deselectParentRecursive = (
		map: SelectedTypeMap,
		todoNode: TodoNode,
	) => {
		if (todoNode.parent === undefined) return
		const { parent } = todoNode
		const hasNoSelectedChildren =
			Array.from(map.keys()).find((k) => k.startsWith(`${parent.id}/`)) ===
			undefined
		if (hasNoSelectedChildren && map.get(parent.id) === "parent") {
			map.delete(parent.id)
			deselectParentRecursive(map, parent)
		}
	}

	const select = (
		todoNode: TodoNode,
		selectedType: Exclude<SelectedType, "parent">,
	) => {
		const newMap = new Map(selectedTypeMap)
		newMap.set(
			todoNode.id,
			todoNode.nodeType === "group" ? "parent" : selectedType,
		)
		selectChildrenRecursive(newMap, todoNode, selectedType)
		selectParentRecursive(newMap, todoNode)
		setSelectedTypeMap(newMap)
	}

	const deselect = (todoNode: TodoNode) => {
		const newMap = new Map(selectedTypeMap)
		newMap.delete(todoNode.id)
		deselectChildrenRecursive(newMap, todoNode)
		deselectParentRecursive(newMap, todoNode)
		setSelectedTypeMap(newMap)
	}

	const createSelectorHandler: SelectionHandlerCreator =
		(todoNode: TodoNode) => (e) => {
			e.stopPropagation()
			const selectedType = "copy"
			const currentType = selectedTypeMap.get(todoNode.id)
			if (currentType === "parent" && todoNode.nodeType === "group") {
				return areAllChildrenSelected(selectedTypeMap, todoNode)
					? deselect(todoNode)
					: select(todoNode, selectedType)
			}
			currentType === selectedType
				? deselect(todoNode)
				: select(todoNode, selectedType)
		}

	const createSelectedHandler: SelectionHandlerCreator =
		(todoNode: TodoNode) => (e) => {
			e.stopPropagation()
			deselect(todoNode)
		}

	return {
		selectedTypeMap,
		createSelectorHandler,
		createSelectedHandler,
	}
}
