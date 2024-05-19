type ItemType = "checkbox" | "fileName"
type Segment<T> = { items: T[] }
type Farm<T> = { segments: Segment<T>[]; itemType: ItemType }

/**
 * CheckboxItem
 */
export class CheckboxItemEntity {
	constructor(
		public text: string,
		public status = " ",
		public children: CheckboxItemEntity[] = [],
	) {}
}
export class CheckboxItemSegmentEntity implements Segment<CheckboxItemEntity> {
	constructor(
		public items: CheckboxItemEntity[] = [],
		public heading?: string,
	) {}
}
export class CheckboxItemFarmEntity implements Farm<CheckboxItemEntity> {
	public itemType = "checkbox" as const
	constructor(
		public path: string,
		public segments: CheckboxItemSegmentEntity[],
	) {}
}

/**
 * FileNameItem
 */
export class FileNameItemEntity {
	constructor(
		public path: string,
		public img?: string,
	) {}
}
export class FileNameItemSegmentEntity implements Segment<FileNameItemEntity> {
	constructor(public items: FileNameItemEntity[] = []) {}
}
export class FileNameItemFarmEntity implements Farm<FileNameItemEntity> {
	public itemType = "fileName" as const
	constructor(
		public tagOrFolder: string,
		public segments: FileNameItemSegmentEntity[],
	) {}
}

export type ItemFarmEntity = CheckboxItemFarmEntity | FileNameItemFarmEntity
