/**
 * CheckboxTodo
 */
export class CheckboxTodo {
	constructor(
		public text: string,
		public status = " ",
		public children: CheckboxTodo[] = [],
	) {}
}
export class CheckboxTodoFarmParcel {
	constructor(
		public todos: CheckboxTodo[],
		public name: string,
	) {}
}
export class CheckboxTodoFarm {
	public todoType = "checkbox" as const
	constructor(
		public path: string,
		public parcels: CheckboxTodoFarmParcel[],
	) {}
}

/**
 * FileNameTodo
 */
export class FileNameTodo {
	constructor(
		public path: string,
		public img?: string,
	) {}
}
export class FileNameTodoFarm {
	public todoType = "fileName" as const
	constructor(
		public tagOrFolder: string,
		public todos: FileNameTodo[],
	) {}
}

export type TodoFarm = CheckboxTodoFarm | FileNameTodoFarm
