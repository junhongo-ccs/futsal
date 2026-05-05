import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "generated-docs");

const documents = [
  { slug: "readme", source: "README.md", title: "週末フットサルの目的" },
  { slug: "purpose", source: "docs/purpose.md", title: "自分のフットサルの目的" },
  { slug: "thinking", source: "docs/thinking.md", title: "目的論と原因論" },
  { slug: "preparation", source: "docs/preparation.md", title: "本番で安定するための準備力" },
  { slug: "awareness", source: "docs/awareness.md", title: "意識系とは何か" },
  { slug: "body-sense", source: "docs/body-sense.md", title: "体感覚に落とし込む" },
  {
    slug: "peripheral-vision-dribbling",
    source: "docs/peripheral-vision-dribbling.md",
    title: "間接視野でボールを扱う",
  },
  { slug: "dribbling-vision-map", source: "docs/dribbling-vision-map.md", title: "ドリブル中の視線マップ" },
  { slug: "mental-control", source: "docs/mental-control.md", title: "からだ、ことば、いしきで整える" },
  { slug: "pressure-control", source: "docs/pressure-control.md", title: "狭いコートでのプレッシャー対処" },
  { slug: "daily-pressure-training", source: "docs/daily-pressure-training.md", title: "日常の小さなプレッシャー訓練" },
  { slug: "app-implementation-plan", source: "docs/app-implementation-plan.md", title: "Webアプリ実装計画" },
  { slug: "supabase-setup", source: "docs/supabase-setup.md", title: "Supabase同期セットアップ" },
  { slug: "reflection-template", source: "templates/reflection.md", title: "振り返りテンプレート" },
];

const sourceToDoc = new Map();
documents.forEach((doc) => {
  sourceToDoc.set(normalizeSource(doc.source), doc);
  sourceToDoc.set(path.basename(doc.source), doc);
});

await mkdir(outDir, { recursive: true });

for (const doc of documents) {
  const markdown = await readFile(path.join(root, doc.source), "utf8");
  const html = renderMarkdown(markdown);
  await writeFile(path.join(outDir, `${doc.slug}.html`), html, "utf8");
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listItems = [];
  let quoteLines = [];

  function flushList() {
    if (listItems.length === 0) return;
    html.push(`<ul>${listItems.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  function flushQuote() {
    if (quoteLines.length === 0) return;
    html.push(`<blockquote>${quoteLines.map((line) => `<p>${formatInline(line)}</p>`).join("")}</blockquote>`);
    quoteLines = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushQuote();
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushList();
      quoteLines.push(trimmed.slice(2));
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushQuote();
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    flushQuote();

    if (trimmed.startsWith("### ")) {
      html.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      html.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      html.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
    } else {
      html.push(`<p>${formatInline(trimmed)}</p>`);
    }
  });

  flushList();
  flushQuote();
  return `${html.join("\n")}\n`;
}

function formatInline(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const normalizedHref = normalizeSource(href);
      const doc = sourceToDoc.get(normalizedHref) || sourceToDoc.get(path.basename(normalizedHref));
      if (doc) {
        const linkLabel = label.endsWith(".md") ? doc.title : label;
        return `<a href="#/docs/${encodeURIComponent(doc.slug)}">${linkLabel}</a>`;
      }
      return `<a href="${escapeAttribute(href)}">${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function normalizeSource(value) {
  return value.replace(/^\.\//, "").replace(/^\/+/, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
