import path from "node:path";
import type { FeatureExtractionPipeline } from "@huggingface/transformers" with { "resolution-mode": "import" };

const MODEL = "Xenova/bge-small-en-v1.5";
let extractor: Promise<FeatureExtractionPipeline> | undefined;

async function load(): Promise<FeatureExtractionPipeline> {
  // transformers.js is ESM-only, so it is loaded with a dynamic import from this CommonJS build.
  const { env, pipeline } = await import("@huggingface/transformers");
  // The quantized bge-small model ships in the repo (models/), so retrieval needs no API key and no download at runtime.
  env.localModelPath = path.join(process.cwd(), "models");
  env.allowRemoteModels = false;
  return pipeline("feature-extraction", MODEL, { dtype: "q8" });
}

export async function embed(texts: string[]): Promise<number[][]> {
  extractor ??= load();
  const output = await (await extractor)(texts, { pooling: "cls", normalize: true });
  return output.tolist() as number[][];
}

export function cosine(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
