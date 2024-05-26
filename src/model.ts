type NodeType = "todo" | "group"
type TodoType = "checkbox" | "fileName"
export type GroupType = "file" | "heading" | "tagOrfolder"

export class TodoNode {
	private _id?: string
	private _todoType?: TodoType
	private _parent?: TodoNode
	public children: TodoNode[] = []
	public nodeType: NodeType | undefined
	public groupType: GroupType | undefined
	private nthSameValueInSiblings?: number

	constructor(public value: string) {}

	public get parent() {
		return this._parent
	}

	public get id(): string {
		if (this._id !== undefined) return this._id
		this._id =
			this.parent === undefined
				? this.locallyUniqueValue
				: `${this.parent.id}/${this.locallyUniqueValue}`
		return this._id
	}

	private get locallyUniqueValue() {
		return this.nthSameValueInSiblings === undefined
			? this.value
			: `${this.value}@${this.nthSameValueInSiblings}`
	}

	public get todoType(): TodoType | undefined {
		if (this._todoType) return this._todoType
		this._todoType = this.children.find((c) => c.todoType)?.todoType
		return this._todoType
	}

	public addChild(todoNode: TodoNode) {
		todoNode._parent = this
		const lastSameValueSibling = this.children.findLast(
			(child) => child.value === todoNode.value,
		)
		if (lastSameValueSibling) {
			todoNode.nthSameValueInSiblings =
				lastSameValueSibling.nthSameValueInSiblings === undefined
					? 1
					: lastSameValueSibling.nthSameValueInSiblings + 1
		}
		this.children.push(todoNode)
		return this
	}
}

export class GroupNode extends TodoNode {
	public nodeType = "group" as const

	constructor(
		value: string,
		public groupType: GroupType,
	) {
		super(value)
	}
}

export class TagOrFolderTodoNode extends GroupNode {
	public nodeType = "group" as const
	public children: FileNameTodoNode[] = []

	constructor(value: string) {
		const groupType = "tagOrfolder" as const
		super(value, groupType)
		this.groupType = groupType
	}

	public addChild(todoNode: TodoNode): this {
		if (this.isFolder()) {
			todoNode.value = todoNode.value.substring(this.value.length)
		}
		return super.addChild(todoNode)
	}

	private isFolder() {
		return this.value.endsWith("/")
	}
}

export class CheckboxTodoNode extends TodoNode {
	public nodeType = "todo" as const
	public children: CheckboxTodoNode[] = []

	constructor(
		value: string,
		public status: string,
		public line: number,
	) {
		super(value)
	}

	public static mustBeCheckboxTodoNode(arg: TodoNode): arg is CheckboxTodoNode {
		if (!(arg instanceof CheckboxTodoNode)) {
			throw new Error(`Not a checkbox todo: ${JSON.stringify(arg)}`)
		}
		return true
	}

	public get todoType() {
		return "checkbox" as const
	}

	public addChild(checkboxTodoNode: CheckboxTodoNode) {
		return super.addChild(checkboxTodoNode)
	}
}

export class FileNameTodoNode extends TodoNode {
	public nodeType = "todo" as const

	constructor(
		value: string,
		public img?: string,
	) {
		const trimmed = value.endsWith(".md") ? value.slice(0, -3) : value
		super(trimmed)
	}

	public static mustBeFileNameTodoNode(arg: TodoNode): arg is FileNameTodoNode {
		if (!(arg instanceof FileNameTodoNode)) {
			throw new Error(`Not a fileName todo: ${JSON.stringify(arg)}`)
		}
		return true
	}

	public get todoType() {
		return "fileName" as const
	}
}
