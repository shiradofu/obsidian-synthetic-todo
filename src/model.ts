type ItemType = "checkbox" | "fileName"
type Segment<T> = { items: T[] }
type Farm<T> = { segments: Segment<T>[]; itemType: ItemType }

/**
 * CheckboxItem
 */
export class CheckboxItem {
	constructor(
		public text: string,
		public status = " ",
		public children: CheckboxItem[] = [],
	) {}
}
export class CheckboxItemSegment implements Segment<CheckboxItem> {
	constructor(
		public items: CheckboxItem[] = [],
		public heading?: string,
	) {}
}
export class CheckboxItemFarm implements Farm<CheckboxItem> {
	public itemType = "checkbox" as const
	constructor(
		public path: string,
		public segments: CheckboxItemSegment[],
	) {}
}

/**
 * FileNameItem
 */
export class FileNameItem {
	constructor(public path: string) {}
}
export class FileNameItemSegment implements Segment<FileNameItem> {
	constructor(public items: FileNameItem[] = []) {}
}
export class FileNameItemFarm implements Farm<FileNameItem> {
	public itemType = "fileName" as const
	constructor(
		public tagOrFolder: string,
		public segments: FileNameItemSegment[],
	) {}
}

export type ItemFarm = CheckboxItemFarm | FileNameItemFarm
