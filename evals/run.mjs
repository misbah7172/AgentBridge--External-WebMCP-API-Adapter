import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL(".", import.meta.url);
const files = ["tool-selection.json", "arguments.json", "chains.json", "failure-recovery.json"];
const cases = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(new URL(`datasets/${file}`, root), "utf8"))))).flat();
const output = new URL("../eval-results/", root);
await mkdir(output, { recursive: true });
const baseUrl = process.env.LLM_EVAL_BASE_URL ?? "https://api.openai.com/v1";
const model = process.env.LLM_EVAL_MODEL ?? "gpt-4.1-mini";
const trials = Number(process.env.LLM_EVAL_TRIALS ?? 3);
const key = process.env.OPENAI_API_KEY;
if (!key) {
  const result = { status: "not-run", reason: "OPENAI_API_KEY is not configured", model, trials, totals: { cases: cases.length, runs: 0 }, metrics: null, results: [] };
  await writeFile(new URL("summary.json", output), JSON.stringify(result, null, 2));
  await writeFile(new URL("report.md", output), "# WebMCP LLM evaluation\n\nNot run: `OPENAI_API_KEY` is not configured. No probabilistic metric is reported.\n");
  console.log("WebMCP LLM evaluation not run: OPENAI_API_KEY is not configured.");
  process.exit(0);
}
const same = (actual, expected) => JSON.stringify(actual ?? {}) === JSON.stringify(expected ?? {});
const runs = [];
for (const testCase of cases) for (let trial = 1; trial <= trials; trial++) {
  const started = performance.now(); let actual = []; let error = null;
  try {
    const input = `Return JSON only: {"calls":[{"name":"tool_name","arguments":{}}]}. User: ${testCase.prompt}\nAvailable tools: ${testCase.availableTools.join(", ")}`;
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/responses`, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model, input, temperature: 0 }) });
    const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? `HTTP_${response.status}`);
    const text = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).map((content) => content.text ?? "").join("");
    actual = JSON.parse(text).calls ?? [];
  } catch (caught) { error = caught instanceof Error ? caught.message : "MODEL_FAILURE"; }
  const expected = testCase.expectedCalls ?? [];
  const selected = !error && actual.map((call) => call.name).join("|") === expected.map((call) => call.name).join("|");
  const argumentsCorrect = selected && actual.every((call, index) => same(call.arguments, expected[index]?.arguments));
  runs.push({ id: testCase.id, trial, expected, actual, selection: selected, argumentsCorrect, chain: selected, latencyMs: Math.round(performance.now() - started), error });
}
const rate = (predicate) => Math.round((runs.filter(predicate).length / runs.length) * 10000) / 100;
const summary = { status: "completed", model, trials, totals: { cases: cases.length, runs: runs.length }, metrics: { toolSelectionAccuracy: rate((run) => run.selection), argumentAccuracy: rate((run) => run.argumentsCorrect), toolChainSuccessRate: rate((run) => run.chain), wrongToolRate: rate((run) => !run.selection), wrongArgumentRate: rate((run) => run.selection && !run.argumentsCorrect), averageLatencyMs: Math.round(runs.reduce((total, run) => total + run.latencyMs, 0) / runs.length) }, results: runs };
await writeFile(new URL("summary.json", output), JSON.stringify(summary, null, 2));
await writeFile(new URL("detailed-results.json", output), JSON.stringify(runs, null, 2));
await writeFile(new URL("report.md", output), `# WebMCP LLM evaluation\n\nModel: ${model}; trials per case: ${trials}; runs: ${runs.length}.\n\n| Metric | Result |\n| --- | ---: |\n| Tool selection accuracy | ${summary.metrics.toolSelectionAccuracy}% |\n| Argument accuracy | ${summary.metrics.argumentAccuracy}% |\n| Chain success rate | ${summary.metrics.toolChainSuccessRate}% |\n| Average latency | ${summary.metrics.averageLatencyMs} ms |\n`);
console.log(JSON.stringify(summary.metrics, null, 2));
