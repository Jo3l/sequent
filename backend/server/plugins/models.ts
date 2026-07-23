import { existsSync, mkdirSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import { get } from "node:https";
import { getDataPath } from "../utils/db";

const MODELS: { name: string; url: string }[] = [
  {
    name: "realesr-animevideov3-x2.bin",
    url: "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-animevideov3-x2.bin",
  },
  {
    name: "realesr-animevideov3-x2.param",
    url: "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-animevideov3-x2.param",
  },
];

export default defineNitroPlugin(() => {
  const modelsDir = getDataPath("models");
  mkdirSync(modelsDir, { recursive: true });

  const missing = MODELS.filter(m => !existsSync(join(modelsDir, m.name)));

  if (missing.length > 0) {
    console.log(`⬇️  Downloading ${missing.length} AI upscaling model(s)...`);
    // Run downloads asynchronously — don't block server startup
    downloadModels(modelsDir, missing);
  }
});

function downloadModels(dir: string, models: typeof MODELS) {
  let remaining = models.length;

  for (const model of models) {
    const filePath = join(dir, model.name);
    const file = createWriteStream(filePath);

    get(model.url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          file.close();
          get(redirectUrl, (redirectRes) => {
            redirectRes.pipe(createWriteStream(filePath));
            redirectRes.on("end", () => markDone());
          }).on("error", (err) => {
            console.error(`❌ Failed to download ${model.name}: ${err.message}`);
            markDone();
          });
          return;
        }
      }

      if (res.statusCode !== 200) {
        console.error(`❌ Failed to download ${model.name}: HTTP ${res.statusCode}`);
        file.close();
        markDone();
        return;
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`✅ Downloaded ${model.name}`);
        markDone();
      });
    }).on("error", (err) => {
      console.error(`❌ Failed to download ${model.name}: ${err.message}`);
      try { file.close(); } catch { /* ignore */ }
      markDone();
    });
  }

  function markDone() {
    remaining--;
    if (remaining === 0) {
      console.log("✅ AI upscaling models ready");
    }
  }
}
