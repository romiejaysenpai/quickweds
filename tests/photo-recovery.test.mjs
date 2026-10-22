import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(code, {
    module: mod,
    exports: mod.exports,
    Buffer,
    require: (name) =>
      name === "server-only"
        ? {}
        : name === "./photo-path"
          ? load("src/lib/photo-path.ts")
          : require(name),
  });
  return mod.exports;
}
test("photo recovery releases only confirmed missing objects and fences successful completion", async () => {
  const { recoverPhotoReservation } = load("src/lib/photo-recovery.ts");
  const calls = [];
  let error = { statusCode: 503 };
  const bytes = Buffer.from("synthetic image");
  const claim = {
    object_path: "guest-uploads/w/photo.jpg",
    claim_token: "new-fence",
    photo_data: { uploader_name: "Frozen" },
    content_hash: require("node:crypto")
      .createHash("sha256")
      .update(bytes)
      .digest("hex"),
  };
  const db = {
    rpc: async (name, args) => {
      calls.push({ name, args });
      return {
        data: name === "quickweds_claim_photo_recovery" ? claim : "photo-id",
      };
    },
    storage: {
      from: () => ({
        download: async () => (error ? { error } : { data: new Blob([bytes]) }),
      }),
    },
  };
  await assert.rejects(
    recoverPhotoReservation(db, "w", "reservation"),
    /remains held/,
  );
  assert.equal(calls.length, 1);
  error = { statusCode: 404 };
  assert.equal(
    (await recoverPhotoReservation(db, "w", "reservation")).state,
    "released",
  );
  assert.equal(calls.at(-1).args.p_claim, "new-fence");
  error = null;
  assert.equal(
    (await recoverPhotoReservation(db, "w", "reservation")).state,
    "complete",
  );
  assert.equal(calls.at(-1).args.p_claim, "new-fence");
  assert.equal(calls.at(-1).args.p_data.uploader_name, "Frozen");
  claim.object_path = "guest-uploads/victim/photo.jpg";
  await assert.rejects(
    recoverPhotoReservation(db, "w", "reservation"),
    /Invalid photo/,
  );
});

test('legacy photo conversion preserves the public original when private verification or metadata write fails', async()=>{
 const {privatizeLegacyPhoto}=load('src/lib/photo-recovery.ts');const removed=[];const bytes=Buffer.from('original');let copy=new Blob([Buffer.from('wrong')]);
 const db={storage:{from:bucket=>({download:async()=>({data:bucket==='quickweds'?new Blob([bytes]):copy}),upload:async()=>({}),remove:async(paths)=>{removed.push(paths);return {};}})},from:()=>({update(){return this;},eq(){return this;},select(){return this;},maybeSingle:async()=>({error:new Error('Synthetic metadata failure')})})};
 const photo={id:'photo',storage_bucket:'quickweds',cloudinary_public_id:'guest-uploads/w/photo.jpg'};
 await assert.rejects(privatizeLegacyPhoto(db,'w',photo),/verify/);assert.equal(removed.length,0);
 copy=new Blob([bytes]);await assert.rejects(privatizeLegacyPhoto(db,'w',photo),/metadata changed/);assert.equal(removed.length,0);
 await assert.rejects(privatizeLegacyPhoto(db,'victim',photo),/individually/);assert.equal(removed.length,0);
});
