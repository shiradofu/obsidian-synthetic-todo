import { readFileSync, writeFileSync } from "node:fs"

const targetVersion = process.env.npm_package_version
if (!targetVersion) throw new Error("unable to get npm package version.")

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"))
manifest.version = targetVersion
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"))

const versions = JSON.parse(readFileSync("versions.json", "utf8"))
versions[targetVersion] = manifest.minAppVersion
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"))
