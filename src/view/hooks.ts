import {
	type EventHandler,
	type SyntheticEvent,
	useEffect,
	useState,
} from "react"
import {
	CheckboxTodo,
	type CheckboxTodoFarmParcel,
	type TodoFarm,
} from "src/model"

export const useFarms = (
	registerListener: (callback: (todoFarms: TodoFarm[]) => void) => void,
) => {
	const [farms, setFarms] = useState<TodoFarm[]>([])
	useEffect(() => {
		return registerListener((farms) => setFarms(farms))
	}, [registerListener])

	return farms
}

export type SelectedType = "copy" | "parent"
export type SelectedIdMap = Map<string, SelectedType>
export type SelectionHandlerCreator = (
	currentCtx: string[],
	children?: CheckboxTodo[] | CheckboxTodoFarmParcel[],
	isGroupName?: boolean,
) => EventHandler<SyntheticEvent>
export const useSelectedIdMap = (
	initialState: SelectedIdMap,
	setSelectedIdMapToViewState: (SelectedIdMap: SelectedIdMap) => void,
) => {
	const [selectedIdMap, _setSelectedIdMapToReactState] =
		useState<SelectedIdMap>(initialState)
	const setSelectedIdMap = (newMap: SelectedIdMap) => {
		_setSelectedIdMapToReactState(newMap)
		setSelectedIdMapToViewState(newMap)
	}

	const getChildInfo = (
		target: CheckboxTodo | CheckboxTodoFarmParcel,
		ctx: string[],
	) => {
		const isCheckboxTodo = target instanceof CheckboxTodo
		const text = isCheckboxTodo ? target.text : target.name
		const children = isCheckboxTodo ? target.children : target.todos
		const currentCtx = [...ctx, text]
		const id = currentCtx.join("/")
		return { isCheckboxTodo, currentCtx, id, children }
	}

	const addChildrenRecursive = (
		map: SelectedIdMap,
		children: CheckboxTodo[] | CheckboxTodoFarmParcel[],
		ctx: string[],
		selectedType: "copy",
	) => {
		for (const child of children) {
			const { isCheckboxTodo, currentCtx, id, children } = getChildInfo(
				child,
				ctx,
			)
			map.set(id, isCheckboxTodo ? selectedType : "parent")
			addChildrenRecursive(map, children, currentCtx, selectedType)
		}
	}

	const deleteChildrenRecursive = (
		map: SelectedIdMap,
		children: CheckboxTodo[] | CheckboxTodoFarmParcel[],
		ctx: string[],
	) => {
		for (const child of children) {
			const { currentCtx, id, children } = getChildInfo(child, ctx)
			map.delete(id)
			deleteChildrenRecursive(map, children, currentCtx)
		}
	}

	const areAllChildrenSelected = (
		map: SelectedIdMap,
		children: CheckboxTodo[] | CheckboxTodoFarmParcel[],
		ctx: string[],
	): boolean => {
		for (const child of children) {
			const { currentCtx, id, children } = getChildInfo(child, ctx)
			if (!map.has(id)) return false
			if (!areAllChildrenSelected(map, children, currentCtx)) return false
		}
		return true
	}

	const addParentRecursive = (map: SelectedIdMap, ctx: string[]) => {
		const currentCtx = ctx.slice(0, -1)
		if (currentCtx.length === 0) return
		const id = currentCtx.join("/")
		if (map.has(id)) return
		map.set(id, "parent")
		addParentRecursive(map, currentCtx)
	}

	const deleteParentRecursive = (map: SelectedIdMap, ctx: string[]) => {
		const currentCtx = ctx.slice(0, -1)
		if (currentCtx.length === 0) return
		const id = currentCtx.join("/")
		const hasNoSelectedChildren =
			Array.from(map.keys()).find((k) => k.startsWith(`${id}/`)) === undefined
		if (hasNoSelectedChildren && map.get(id) === "parent") {
			map.delete(id)
			deleteParentRecursive(map, currentCtx)
		}
	}

	const createSelectorHandler: SelectionHandlerCreator =
		(
			currentCtx: string[],
			children: CheckboxTodo[] | CheckboxTodoFarmParcel[] = [],
			isGroupName = false,
		) =>
		(e) => {
			e.stopPropagation()
			const selectedType = "copy"

			const map = new Map(selectedIdMap)
			const id = currentCtx.join("/")
			switch (map.get(id)) {
				// biome-ignore lint: lint/suspicious/noFallthroughSwitchClause
				case "parent":
					if (isGroupName) {
						if (areAllChildrenSelected(map, children, currentCtx)) {
							map.delete(id)
							deleteChildrenRecursive(map, children, currentCtx)
							deleteParentRecursive(map, currentCtx)
						} else {
							addChildrenRecursive(map, children, currentCtx, selectedType)
						}
						break
					}
				// this fallthrough is intentional
				case undefined:
					map.set(id, isGroupName ? "parent" : selectedType)
					addChildrenRecursive(map, children, currentCtx, selectedType)
					addParentRecursive(map, currentCtx)
					break
				case selectedType:
					map.delete(id)
					deleteChildrenRecursive(map, children, currentCtx)
					deleteParentRecursive(map, currentCtx)
					break
			}
			setSelectedIdMap(map)
		}

	const createSelectedHandler: SelectionHandlerCreator =
		(
			currentCtx: string[],
			children: CheckboxTodo[] | CheckboxTodoFarmParcel[] = [],
		) =>
		(e) => {
			e.stopPropagation()
			const map = new Map(selectedIdMap)
			const id = currentCtx.join("/")
			map.delete(id)
			deleteChildrenRecursive(map, children, currentCtx)
			deleteParentRecursive(map, currentCtx)
			setSelectedIdMap(map)
		}

	return {
		selectedIdMap,
		createSelectorHandler,
		createSelectedHandler,
	}
}
