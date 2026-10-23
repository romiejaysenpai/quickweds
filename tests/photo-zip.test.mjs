import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
test("ZIP writes expected CRC, names, lengths, directory and rejects paths", () => {
  const source = ts.transpileModule(
    fs.readFileSync("src/lib/photo-zip.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(source, {
    module: loadedModule,
    exports: loadedModule.exports,
    Buffer,
  });
  const { createPhotoZip } = loadedModule.exports;
  const zip = createPhotoZip([
    { name: "photo.jpg", bytes: Buffer.from("123456789") },
  ]);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt32LE(14), 0xcbf43926);
  assert.equal(zip.readUInt32LE(18), 9);
  assert.equal(zip.subarray(30, 39).toString(), "photo.jpg");
  assert.equal(zip.subarray(39, 48).toString(), "123456789");
  assert.equal(zip.readUInt32LE(48), 0x02014b50);
  assert.equal(zip.readUInt16LE(zip.length - 14), 1);
  assert.throws(() =>
    createPhotoZip([{ name: "../escape.jpg", bytes: Buffer.from("") }]),
  );
});
