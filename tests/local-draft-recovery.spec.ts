import { test, expect } from "@playwright/test";
import fs from "node:fs";
import ts from "typescript";
test("local draft recovery preserves File bytes and isolates users and weddings", async ({
  page,
}) => {
  await page.goto("/login");
  const source = ts.transpileModule(
    fs.readFileSync("src/lib/builder-drafts.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  await page.addScriptTag({
    content: `(()=>{const exports={};${source};window.draftTest=exports;})()`,
  });
  const result = await page.evaluate(async () => {
    const api = (window as any).draftTest;
    const key = api.builderDraftKey("synthetic-user", "synthetic-wedding");
    await api.saveBuilderDraft(key, {
      formData: { brideName: "Synthetic" },
      currentStep: 4,
      updatedAt: new Date().toISOString(),
      mediaFiles: {
        heroImage: new File(["synthetic-image-bytes"], "image.png", {
          type: "image/png",
        }),
      },
      previews: { heroImage: "blob:expired-after-reload" },
    });
    const recovered = await api.loadBuilderDraft(key);
    const otherUser = await api.loadBuilderDraft(
      api.builderDraftKey("another-user", "synthetic-wedding"),
    );
    const otherWedding = await api.loadBuilderDraft(
      api.builderDraftKey("synthetic-user", "another-wedding"),
    );
    const bytes = await recovered.mediaFiles.heroImage.text();
    const isFile = recovered.mediaFiles.heroImage instanceof File;
    await api.deleteBuilderDraft(key);
    return {
      bytes,
      isFile,
      step: recovered.currentStep,
      otherUser,
      otherWedding,
      deleted: await api.loadBuilderDraft(key),
    };
  });
  expect(result).toEqual({
    bytes: "synthetic-image-bytes",
    isFile: true,
    step: 4,
    otherUser: undefined,
    otherWedding: undefined,
    deleted: undefined,
  });
});
