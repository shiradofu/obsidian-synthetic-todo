export function c(...classNames: string[]) {
	return classNames.map((name) => `synthetic-todo-${name}`).join(" ")
}
