type TodoType = "checkbox" | "filename"
type NodeType = "todo" | "group"

export class TodoNode {
	private _id?: string
	private _todoType?: TodoType
	private _parent?: TodoNode
	public children: TodoNode[] = []
	private nthSameValueInSiblings?: number

	constructor(public value: string) {}

	get parent() {
		return this._parent
	}

	get id(): string {
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

	get nodeType(): NodeType {
		if (this instanceof CheckboxTodoNode || this instanceof FilenameTodoNode) {
			return "todo"
		}
		return "group"
	}

	get todoType() {
		if (this._todoType) return this._todoType
		this._todoType = this.calculateTodoType()
		return this._todoType
	}

	private calculateTodoType(): TodoType | undefined {
		switch (true) {
			case this instanceof CheckboxTodoNode:
				return "checkbox"
			case this instanceof FilenameTodoNode:
				return "filename"
			default:
				return this.children.find((c) => c.todoType)?.todoType
		}
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
	}
}

export class CheckboxTodoNode extends TodoNode {
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
			throw new Error(`Not a checkbox todo: ${arg}`)
		}
		return true
	}

	public addChild(checkboxTodoNode: CheckboxTodoNode): void {
		super.addChild(checkboxTodoNode)
	}
}

export class FilenameTodoNode extends TodoNode {
	constructor(
		value: string,
		public img?: string,
	) {
		super(value)
	}

	public static mustBeFilenameTodoNode(arg: TodoNode): arg is FilenameTodoNode {
		if (!(arg instanceof FilenameTodoNode)) {
			throw new Error(`Not a checkbox todo: ${arg}`)
		}
		return true
	}
}
