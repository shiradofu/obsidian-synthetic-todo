import { describe, expect, test } from "vitest"
import { Item, ItemTree } from "./item"
import { Parser } from "./parser"

const ItemTreeTestCases = {
	uncompleted: {
		mdText: "- [ ] foo",
		expected: [new ItemTree("foo")],
	},
	completed: {
		mdText: "* [x] foo",
		expected: [new ItemTree(new Item("foo", "x"))],
	},
	flat: {
		mdText: `
- [ ] foo
- [x] bar
`,
		expected: [new ItemTree("foo"), new ItemTree(new Item("bar", "x"))],
	},
	spaced: {
		mdText: `
- [ ] foo


- [ ] bar
`,
		expected: [new ItemTree("foo"), new ItemTree("bar")],
	},
	nestedBySpaces: {
		mdText: `
- [ ] foo
    - [ ] bar
`,
		expected: [new ItemTree("foo", [new ItemTree("bar")])],
	},
	nestedByTabs: {
		mdText: `
- [ ] foo
	- [ ] bar
`,
		expected: [new ItemTree("foo", [new ItemTree("bar")])],
	},
	bumpy: {
		mdText: `
- [ ] foo
    - [ ] bar
- [ ] baz
`,
		expected: [new ItemTree("foo", [new ItemTree("bar")]), new ItemTree("baz")],
	},
	unintendedIndent: {
		mdText: `
 - [ ] foo
- [ ] bar
`,
		expected: [new ItemTree("foo"), new ItemTree("bar")],
	},
	wired1: {
		mdText: `
- [ ] foo
            - [ ] bar
        - [ ] baz
    - [ ] fiz
`,
		expected: [
			new ItemTree("foo", [
				new ItemTree("bar"),
				new ItemTree("baz"),
				new ItemTree("fiz"),
			]),
		],
	},
	wired2: {
		mdText: `
- [ ] foo
        - [ ] bar
    - [ ] baz
- [ ] fiz
`,
		expected: [
			new ItemTree("foo", [new ItemTree("bar"), new ItemTree("baz")]),
			new ItemTree("fiz"),
		],
	},
	wired3: {
		mdText: `
    - [ ] foo
            - [ ] bar
        - [ ] baz
- [ ] fiz
`,
		expected: [
			new ItemTree("foo", [new ItemTree("bar"), new ItemTree("baz")]),
			new ItemTree("fiz"),
		],
	},
	practical: {
		mdText: `
- [ ] foo
    - [ ] foo.1
        - [ ] foo.1.1
            - [ ] foo.1.1.1
- [ ] bar
    - [ ] bar.1
    - [ ] bar.2
        - [ ] bar.2.1
    - [ ] bar.3
- [ ] baz
- [ ] fiz
`,
		expected: [
			new ItemTree("foo", [
				new ItemTree("foo.1", [
					new ItemTree("foo.1.1", [new ItemTree("foo.1.1.1")]),
				]),
			]),
			new ItemTree("bar", [
				new ItemTree("bar.1"),
				new ItemTree("bar.2", [new ItemTree("bar.2.1")]),
				new ItemTree("bar.3"),
			]),
			new ItemTree("baz"),
			new ItemTree("fiz"),
		],
	},
} as const

describe("ItemTree", () => {
	test.each<keyof typeof ItemTreeTestCases>(
		(<T extends Record<string, unknown>>(o: T): (keyof T)[] => Object.keys(o))(
			ItemTreeTestCases,
		),
	)("%s", (key) => {
		const t = ItemTreeTestCases[key]
		const parser = new Parser()
		const result = parser.parse("any", t.mdText)
		expect(result.sections[0]?.trees).toEqual(t.expected)
	})
})

describe("No ItemTrees", () => {
	const cases: [string, string][] = [
		["inline checkbox-like", "this is not an item! - [ ] foo"],
		["no status", "- [] foo"],
	]
	test.each(cases)("%s", (_, mdText) => {
		const parser = new Parser()
		const result = parser.parse("any", mdText)
		expect(result.sections.length).toEqual(0)
	})
})

describe("# Section", () => {
	const cases: [string, string][] = [
		["# heading", "- [ ] foo\n\n# section\n- [ ] foo"],
		["###### heading", "- [ ] foo\n\n###### section\n\n - [ ] foo"],
		[
			"###   heading with a lot of space after #",
			"- [ ] foo\n\n###   section\n\n- [ ] foo",
		],
	]
	test.each(cases)("%s", (_, mdText) => {
		const parser = new Parser()
		const result = parser.parse("any", mdText)
		expect(result.sections.length).toEqual(2)
		expect(result.sections[1]?.name).toEqual("section")
	})
})

describe("Non # Section", () => {
	const cases: [string, string][] = [
		["inline #", "- [ ] foo\n\nthis is not a ## section\n\n- [ ] foo"],
		["spaces before #", "- [ ] foo\n\n ## section\n\n- [ ] foo"],
		["# * 7", `- [ ] foo\n\n${"#".repeat(7)} section\n\n- [ ] foo`],
		["#tag", "- [ ] foo\n\n#not a section\n\n- [ ] foo"],
	]
	test.each(cases)("%s", (_, mdText) => {
		const parser = new Parser()
		const result = parser.parse("any", mdText)
		expect(result.sections[0]).toBeTruthy()
		expect(result.sections.length).toEqual(1)
		expect(result.sections[0]?.name).toBeUndefined()
	})
})

describe("Divider", () => {
	const cases: [string, string][] = [
		["---", "- [ ] foo\n\n---\n- [ ] foo"],
		["___", "- [ ] foo\n\n___\n- [ ] foo"],
		["***", "- [ ] foo\n\n***\n- [ ] foo"],
		["--- 999", `- [ ] foo\n\n${"-".repeat(999)}\n- [ ] foo`],
		["___ 999", `- [ ] foo\n\n${"_".repeat(999)}\n- [ ] foo`],
		["*** 999", `- [ ] foo\n\n${"*".repeat(999)}\n- [ ] foo`],
		["double ---", "- [ ] foo\n\n---\n---\n- [ ] foo"],
	]
	test.each(cases)("%s", (_, mdText) => {
		const parser = new Parser()
		const result = parser.parse("any", mdText)
		expect(result.sections[0]).toBeTruthy()
		expect(result.sections.length).toEqual(2)
		expect(result.sections[1]?.name).toBeUndefined()
	})
})

describe("= or - Section", () => {
	const cases: [string, string][] = [
		["=", "- [ ] foo\n\nsection\n=\n- [ ] foo"],
		["=== 999", `- [ ] foo\n\nsection\n${"=".repeat(999)}\n- [ ] foo`],
		["--", "- [ ] foo\n\nsection\n--\n- [ ] foo"],
		["--- 999", `- [ ] foo\n\nsection\n${"-".repeat(999)}\n- [ ] foo`],
	]
	test.each(cases)("%s", (_, mdText) => {
		const parser = new Parser()
		const result = parser.parse("any", mdText)
		expect(result.sections.length).toEqual(2)
		expect(result.sections[1]?.name).toEqual("section")
	})
})

describe("Non = or - Section", () => {
	const cases: [string, string, number?][] = [
		["no text", "- [ ] foo\n\n===\n\n- [ ] bar"],
		["bullet list", "- [ ] foo\n\n- this is not a section\n===\n- [ ] bar"],
		["quote", "- [ ] foo\n\n>some nice quotes\n===\n- [ ] bar"],
		[
			"image",
			"- [ ] foo\n![alt](https://example.com/image.jpg)\n===\n\n- [ ] bar",
		],
		["HTML tag", "- [ ] foo\n</div>\n===\n\n- [ ] bar"],
		["divider", "- [ ] foo\n---\n===\n\n- [ ] bar", 2],
		[
			"frontmatter",
			`---
key: value
---

- [ ] foo
`,
		],
		[
			"```",
			`
\`\`\`ts
const x = "foo"
\`\`\`
===

- [ ] foo`,
		],
	]

	test.each(cases)("%s", (_, mdText, sectionCount) => {
		const parser = new Parser()
		const result = parser.parse("any", mdText)
		expect(result.sections[0]).toBeTruthy()
		expect(result.sections.length).toEqual(sectionCount ?? 1)
		expect(result.sections[0]?.name).toBeUndefined()
	})
})

test("Integrated", () => {
	const mdText = `---
key1: foo
key2: bar
---

- [ ] Create my nice todo list
- [ ] Just do it!

---

- [ ] foo
    - [ ] bar

## section

- [ ] foo

section
---
- [ ] foo
- [ ] bar
---

- [ ] foo
===
- [ ] bar

<div>
	divided
</div>
---
- [ ] foo

`

	const parser = new Parser()
	const filePath = "test.md"
	const result = parser.parse(filePath, mdText)
	expect(result.path).toEqual(filePath)
	expect(result.sections[0]).toBeTruthy()
	expect(result.sections.length).toEqual(6)
	for (const { name } of result.sections) {
		name && expect(name).toEqual("section")
	}
})
