export class Item {
	constructor(
		public text: string,
		public status = " ",
	) {}
}

export class ItemTree {
	public node: Item
	public children: ItemTree[]

	constructor(node: Item | string, children: ItemTree[] = []) {
		if (typeof node === "string") {
			// node is item text
			this.node = new Item(node)
		} else {
			this.node = node
		}
		this.children = children
	}
}

export type ItemFarmSection = {
	name?: string
	trees: ItemTree[]
}

export type ItemFarm = {
	path: string
	sections: ItemFarmSection[]
	itemType: "checkbox" | "fileName"
}
