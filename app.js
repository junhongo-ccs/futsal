const storageKey = "futsal-state-records-v1";
const draftStorageKey = "futsal-state-draft-v1";
const docs = [
  {
    slug: "readme",
    title: "週末フットサルの目的",
    path: "README.md",
    summary: "全体の入口。目的、使い方、Webアプリの説明。",
  },
  {
    slug: "purpose",
    title: "自分のフットサルの目的",
    path: "docs/purpose.md",
    summary: "週末フットサルで立ち戻る目的。",
  },
  {
    slug: "thinking",
    title: "目的論と原因論",
    path: "docs/thinking.md",
    summary: "原因を見つけ、次の目的へ変える考え方。",
  },
  {
    slug: "preparation",
    title: "本番で安定するための準備力",
    path: "docs/preparation.md",
    summary: "価値観、意識、技術を整える。",
  },
  {
    slug: "awareness",
    title: "意識系とは何か",
    path: "docs/awareness.md",
    summary: "見る、切り替える、次に関わる。",
  },
  {
    slug: "body-sense",
    title: "体感覚に落とし込む",
    path: "docs/body-sense.md",
    summary: "マインドを身体の合図に変える。",
  },
  {
    slug: "mental-control",
    title: "からだ、ことば、いしきで整える",
    path: "docs/mental-control.md",
    summary: "結果ではなく、まず状態を整える。",
  },
];

const elements = {
  formView: document.querySelector("#formView"),
  recordsView: document.querySelector("#recordsView"),
  detailView: document.querySelector("#detailView"),
  docsView: document.querySelector("#docsView"),
  docsDetailView: document.querySelector("#docsDetailView"),
  newRecordNav: document.querySelector("#newRecordNav"),
  recordsNav: document.querySelector("#recordsNav"),
  docsNav: document.querySelector("#docsNav"),
  backToRecordsButton: document.querySelector("#backToRecordsButton"),
  backToDocsButton: document.querySelector("#backToDocsButton"),
  canvas: document.querySelector("#stateChart"),
  afterCanvas: document.querySelector("#afterStateChart"),
  bodyScore: document.querySelector("#bodyScore"),
  mindScore: document.querySelector("#mindScore"),
  afterBodyScore: document.querySelector("#afterBodyScore"),
  afterMindScore: document.querySelector("#afterMindScore"),
  bodyValueLabel: document.querySelector("#bodyValueLabel"),
  mindValueLabel: document.querySelector("#mindValueLabel"),
  afterBodyValueLabel: document.querySelector("#afterBodyValueLabel"),
  afterMindValueLabel: document.querySelector("#afterMindValueLabel"),
  deltaLabel: document.querySelector("#deltaLabel"),
  recordDateTime: document.querySelector("#recordDateTime"),
  stateNote: document.querySelector("#stateNote"),
  afterNote: document.querySelector("#afterNote"),
  bodyAction: document.querySelector("#bodyAction"),
  wordAction: document.querySelector("#wordAction"),
  focusAction: document.querySelector("#focusAction"),
  tryPlan: document.querySelector("#tryPlan"),
  reflection: document.querySelector("#reflection"),
  saveDraftButton: document.querySelector("#saveDraftButton"),
  saveButton: document.querySelector("#saveButton"),
  clearButton: document.querySelector("#clearButton"),
  saveStatus: document.querySelector("#saveStatus"),
  downloadButton: document.querySelector("#downloadButton"),
  downloadModal: document.querySelector("#downloadModal"),
  downloadMarkdownButton: document.querySelector("#downloadMarkdownButton"),
  downloadJsonButton: document.querySelector("#downloadJsonButton"),
  cancelDownloadButton: document.querySelector("#cancelDownloadButton"),
  records: document.querySelector("#records"),
  recordCount: document.querySelector("#recordCount"),
  recordDetail: document.querySelector("#recordDetail"),
  docsList: document.querySelector("#docsList"),
  docsDetail: document.querySelector("#docsDetail"),
};

const ctx = elements.canvas.getContext("2d");
const afterCtx = elements.afterCanvas.getContext("2d");

let records = loadRecords();
let draftTimer;

function nowDateTimeLocal() {
  const date = new Date();
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function normalizeRecord(record) {
  const dateTime = record.dateTime || (record.date ? `${record.date}T00:00` : nowDateTimeLocal());
  return {
    ...record,
    dateTime,
    date: record.date || dateTime.slice(0, 10),
    afterBodyScore: record.afterBodyScore ?? record.bodyScore,
    afterMindScore: record.afterMindScore ?? record.mindScore,
    bodyDelta: record.bodyDelta ?? (record.afterBodyScore ?? record.bodyScore) - record.bodyScore,
    mindDelta: record.mindDelta ?? (record.afterMindScore ?? record.mindScore) - record.mindScore,
  };
}

function loadRecords() {
  try {
    return (JSON.parse(localStorage.getItem(storageKey)) || []).map(normalizeRecord);
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function getFormData() {
  const dateTime = elements.recordDateTime.value || nowDateTimeLocal();
  return {
    id: crypto.randomUUID(),
    dateTime,
    date: dateTime.slice(0, 10),
    bodyScore: Number(elements.bodyScore.value),
    mindScore: Number(elements.mindScore.value),
    afterBodyScore: Number(elements.afterBodyScore.value),
    afterMindScore: Number(elements.afterMindScore.value),
    bodyDelta: Number(elements.afterBodyScore.value) - Number(elements.bodyScore.value),
    mindDelta: Number(elements.afterMindScore.value) - Number(elements.mindScore.value),
    stateNote: elements.stateNote.value.trim(),
    afterNote: elements.afterNote.value.trim(),
    bodyAction: elements.bodyAction.value.trim(),
    wordAction: elements.wordAction.value.trim(),
    focusAction: elements.focusAction.value.trim(),
    tryPlan: elements.tryPlan.value.trim(),
    reflection: elements.reflection.value.trim(),
    createdAt: new Date().toISOString(),
  };
}

function getDraftData() {
  return {
    dateTime: elements.recordDateTime.value || nowDateTimeLocal(),
    bodyScore: elements.bodyScore.value,
    mindScore: elements.mindScore.value,
    afterBodyScore: elements.afterBodyScore.value,
    afterMindScore: elements.afterMindScore.value,
    stateNote: elements.stateNote.value,
    afterNote: elements.afterNote.value,
    bodyAction: elements.bodyAction.value,
    wordAction: elements.wordAction.value,
    focusAction: elements.focusAction.value,
    tryPlan: elements.tryPlan.value,
    reflection: elements.reflection.value,
    updatedAt: new Date().toISOString(),
  };
}

function setFormData(data) {
  if (!data) return;
  elements.recordDateTime.value = data.dateTime || (data.date ? `${data.date}T00:00` : nowDateTimeLocal());
  elements.bodyScore.value = data.bodyScore ?? "5";
  elements.mindScore.value = data.mindScore ?? "5";
  elements.afterBodyScore.value = data.afterBodyScore ?? "5";
  elements.afterMindScore.value = data.afterMindScore ?? "5";
  elements.stateNote.value = data.stateNote ?? "";
  elements.afterNote.value = data.afterNote ?? "";
  elements.bodyAction.value = data.bodyAction ?? "";
  elements.wordAction.value = data.wordAction ?? "";
  elements.focusAction.value = data.focusAction ?? "";
  elements.tryPlan.value = data.tryPlan ?? "";
  elements.reflection.value = data.reflection ?? "";
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(draftStorageKey));
  } catch {
    return null;
  }
}

function saveDraft(showMessage = true) {
  localStorage.setItem(draftStorageKey, JSON.stringify(getDraftData()));
  if (showMessage) {
    showSaveStatus("途中保存しました");
  }
}

function scheduleDraftSave() {
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => {
    saveDraft(false);
    showSaveStatus("下書き保存済み");
  }, 700);
}

function clearDraft() {
  localStorage.removeItem(draftStorageKey);
}

function showSaveStatus(message) {
  elements.saveStatus.textContent = message;
}

function setDefaultDateTime() {
  elements.recordDateTime.value = nowDateTimeLocal();
}

function updateScoreLabels() {
  elements.bodyValueLabel.textContent = elements.bodyScore.value;
  elements.mindValueLabel.textContent = elements.mindScore.value;
  elements.afterBodyValueLabel.textContent = elements.afterBodyScore.value;
  elements.afterMindValueLabel.textContent = elements.afterMindScore.value;
  updateDeltaLabel();
}

function updateDeltaLabel() {
  const bodyDelta = Number(elements.afterBodyScore.value) - Number(elements.bodyScore.value);
  const mindDelta = Number(elements.afterMindScore.value) - Number(elements.mindScore.value);
  elements.deltaLabel.textContent = `身体 ${formatDelta(bodyDelta)} / 心 ${formatDelta(mindDelta)}`;
}

function formatDelta(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function formatDateTime(value) {
  if (!value) return "";
  const [date = "", time = ""] = value.split("T");
  return `${date.replaceAll("-", "/")} ${time}`;
}

function sortRecords(list) {
  return [...list].sort((a, b) => {
    const byDateTime = (b.dateTime || "").localeCompare(a.dateTime || "");
    if (byDateTime !== 0) return byDateTime;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

function drawChart(canvas = elements.canvas, context = ctx, bodyInput = elements.bodyScore, mindInput = elements.mindScore) {
  const width = canvas.width;
  const padding = 58;
  const plot = width - padding * 2;
  const bodyScore = Number(bodyInput.value);
  const mindScore = Number(mindInput.value);
  const x = padding + (mindScore / 10) * plot;
  const y = padding + ((10 - bodyScore) / 10) * plot;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#edf8fd";
  context.fillRect(padding, padding, plot, plot);

  context.strokeStyle = "#d5e5ee";
  context.lineWidth = 1;
  for (let i = 0; i <= 10; i += 1) {
    const lineX = padding + (i / 10) * plot;
    const lineY = padding + (i / 10) * plot;
    context.beginPath();
    context.moveTo(lineX, padding);
    context.lineTo(lineX, padding + plot);
    context.stroke();
    context.beginPath();
    context.moveTo(padding, lineY);
    context.lineTo(padding + plot, lineY);
    context.stroke();
  }

  context.strokeStyle = "#1c1b19";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(padding, padding);
  context.lineTo(padding, padding + plot);
  context.lineTo(padding + plot, padding + plot);
  context.stroke();

  context.fillStyle = "#16202a";
  context.font = "bold 18px system-ui";
  context.textAlign = "center";
  context.fillText("心の状態", padding + plot - 46, padding + plot + 42);
  context.fillText("5", padding + plot / 2, padding + plot + 25);
  context.fillText("10", padding + plot, padding + plot + 25);

  context.save();
  context.translate(24, padding + 86);
  context.rotate(-Math.PI / 2);
  context.fillText("身体の状態", 0, 0);
  context.restore();
  context.fillText("5", padding - 24, padding + plot / 2 + 6);
  context.fillText("10", padding - 28, padding + 6);

  context.strokeStyle = "#079bd8";
  context.lineWidth = 2;
  context.setLineDash([4, 6]);
  context.beginPath();
  context.moveTo(padding, y);
  context.lineTo(x, y);
  context.lineTo(x, padding + plot);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = "#079bd8";
  context.beginPath();
  context.arc(x, y, 9, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#079bd8";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, 18, 0, Math.PI * 2);
  context.stroke();
}

function handleCanvasPoint(event, canvas = elements.canvas, bodyInput = elements.bodyScore, mindInput = elements.mindScore) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const padding = 58;
  const plot = canvas.width - padding * 2;
  const rawX = (event.clientX - rect.left) * scaleX;
  const rawY = (event.clientY - rect.top) * scaleY;
  const x = Math.min(Math.max(rawX, padding), padding + plot);
  const y = Math.min(Math.max(rawY, padding), padding + plot);

  mindInput.value = String(Math.round(((x - padding) / plot) * 10));
  bodyInput.value = String(Math.round(10 - ((y - padding) / plot) * 10));
  updateScoreLabels();
  drawAllCharts();
  scheduleDraftSave();
}

function drawAllCharts() {
  drawChart(elements.canvas, ctx, elements.bodyScore, elements.mindScore);
  drawChart(elements.afterCanvas, afterCtx, elements.afterBodyScore, elements.afterMindScore);
}

function navigate(hash) {
  window.location.hash = hash;
}

function showView(name) {
  elements.formView.hidden = name !== "form";
  elements.recordsView.hidden = name !== "records";
  elements.detailView.hidden = name !== "detail";
  elements.docsView.hidden = name !== "docs";
  elements.docsDetailView.hidden = name !== "docsDetail";
  elements.newRecordNav.classList.toggle("active", name === "form");
  elements.recordsNav.classList.toggle("active", name === "records" || name === "detail");
  elements.docsNav.classList.toggle("active", name === "docs" || name === "docsDetail");
}

function handleRoute() {
  const hash = window.location.hash || "#/new";
  const detailMatch = hash.match(/^#\/records\/(.+)$/);
  const docsDetailMatch = hash.match(/^#\/docs\/(.+)$/);

  if (detailMatch) {
    renderDetail(decodeURIComponent(detailMatch[1]));
    showView("detail");
    return;
  }

  if (docsDetailMatch) {
    renderDocsDetail(decodeURIComponent(docsDetailMatch[1]));
    showView("docsDetail");
    return;
  }

  if (hash === "#/records") {
    renderRecords();
    showView("records");
    return;
  }

  if (hash === "#/docs") {
    renderDocsList();
    showView("docs");
    return;
  }

  showView("form");
  window.requestAnimationFrame(drawAllCharts);
}

function renderRecords() {
  const sorted = sortRecords(records);
  elements.recordCount.textContent = `${records.length}件`;

  if (sorted.length === 0) {
    elements.records.innerHTML = '<p class="empty">まだ記録はありません。</p>';
    return;
  }

  elements.records.innerHTML = sorted
    .map(
      (record) => `
        <article class="record">
          <div class="record-header">
            <div>
              <div class="record-date">${escapeHtml(formatDateTime(record.dateTime))}</div>
              <div class="record-scores">
                <span class="pill">身体 ${record.bodyScore}</span>
                <span class="pill">心 ${record.mindScore}</span>
                <span class="pill">後 身体 ${record.afterBodyScore} (${formatDelta(record.bodyDelta)})</span>
                <span class="pill">後 心 ${record.afterMindScore} (${formatDelta(record.mindDelta)})</span>
              </div>
            </div>
            <div class="record-actions">
              <button class="button secondary small" type="button" data-detail="${record.id}">詳細</button>
              <button class="delete-button" type="button" data-delete="${record.id}">削除</button>
            </div>
          </div>
          <p class="record-summary">${escapeHtml(record.tryPlan || record.stateNote || "記録詳細から内容を確認できます。")}</p>
        </article>
      `,
    )
    .join("");
}

function renderDetail(id) {
  const record = records.find((item) => item.id === id);
  if (!record) {
    elements.recordDetail.innerHTML = '<p class="empty">記録が見つかりません。</p>';
    return;
  }

  elements.recordDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="eyebrow">日時</p>
        <h3>${escapeHtml(formatDateTime(record.dateTime))}</h3>
      </div>
      <div class="record-scores">
        <span class="pill">身体 ${record.bodyScore}</span>
        <span class="pill">心 ${record.mindScore}</span>
        <span class="pill">後 身体 ${record.afterBodyScore} (${formatDelta(record.bodyDelta)})</span>
        <span class="pill">後 心 ${record.afterMindScore} (${formatDelta(record.mindDelta)})</span>
      </div>
    </div>
    <div class="detail-grid">
      ${detailField("今の状態メモ", record.stateNote)}
      ${detailField("からだ", record.bodyAction)}
      ${detailField("ことば", record.wordAction)}
      ${detailField("いしき", record.focusAction)}
      ${detailField("試して変わったこと", record.afterNote)}
      ${detailField("今日トライすること", record.tryPlan)}
      ${detailField("終わった後の振り返り", record.reflection)}
    </div>
  `;
}

function renderDocsList() {
  elements.docsList.innerHTML = docs
    .map(
      (doc) => `
        <article class="doc-card">
          <div>
            <h3>${escapeHtml(doc.title)}</h3>
            <p>${escapeHtml(doc.summary)}</p>
          </div>
          <button class="button secondary small" type="button" data-doc="${doc.slug}">読む</button>
        </article>
      `,
    )
    .join("");
}

async function renderDocsDetail(slug) {
  const doc = docs.find((item) => item.slug === slug);
  if (!doc) {
    elements.docsDetail.innerHTML = '<p class="empty">ドキュメントが見つかりません。</p>';
    return;
  }

  elements.docsDetail.innerHTML = '<p class="empty">読み込み中...</p>';

  try {
    const response = await fetch(doc.path);
    if (!response.ok) throw new Error(`Failed to load ${doc.path}`);
    const markdown = await response.text();
    elements.docsDetail.innerHTML = renderMarkdown(markdown);
  } catch {
    elements.docsDetail.innerHTML = '<p class="empty">ドキュメントを読み込めませんでした。</p>';
  }
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
    } else if (/^\d+\.\s/.test(trimmed)) {
      html.push(`<p>${formatInline(trimmed)}</p>`);
    } else {
      html.push(`<p>${formatInline(trimmed)}</p>`);
    }
  });

  flushList();
  flushQuote();
  return html.join("");
}

function formatInline(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function detailField(label, value) {
  return `
    <section class="detail-field">
      <h4>${label}</h4>
      <p>${value ? escapeHtml(value) : "未入力"}</p>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clearForm() {
  elements.bodyScore.value = "5";
  elements.mindScore.value = "5";
  elements.afterBodyScore.value = "5";
  elements.afterMindScore.value = "5";
  elements.stateNote.value = "";
  elements.afterNote.value = "";
  elements.bodyAction.value = "";
  elements.wordAction.value = "";
  elements.focusAction.value = "";
  elements.tryPlan.value = "";
  elements.reflection.value = "";
  setDefaultDateTime();
  updateScoreLabels();
  drawAllCharts();
  clearDraft();
  showSaveStatus("入力をクリアしました");
}

function saveCurrentRecord() {
  const record = getFormData();
  records.push(record);
  saveRecords();
  clearForm();
  showSaveStatus("記録しました");
  renderRecords();
  navigate(`#/records/${encodeURIComponent(record.id)}`);
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  closeDownloadModal();
  download("futsal-records.json", JSON.stringify(records, null, 2), "application/json");
}

function exportMarkdown() {
  const content = sortRecords(records)
    .reverse()
    .map(
      (record) => `## ${formatDateTime(record.dateTime)}

- 身体の状態: ${record.bodyScore}
- 心の状態: ${record.mindScore}
- 試した後の身体: ${record.afterBodyScore}
- 試した後の心: ${record.afterMindScore}
- 身体の変化: ${formatDelta(record.bodyDelta)}
- 心の変化: ${formatDelta(record.mindDelta)}
- 状態メモ: ${record.stateNote || ""}
- 試して変わったこと: ${record.afterNote || ""}
- からだ: ${record.bodyAction || ""}
- ことば: ${record.wordAction || ""}
- いしき: ${record.focusAction || ""}
- トライ: ${record.tryPlan || ""}
- 振り返り: ${record.reflection || ""}
`,
    )
    .join("\n");

  closeDownloadModal();
  download("futsal-records.md", `# フットサル記録\n\n${content}`, "text/markdown");
}

function openDownloadModal() {
  elements.downloadModal.hidden = false;
  elements.downloadMarkdownButton.focus();
}

function closeDownloadModal() {
  elements.downloadModal.hidden = true;
}

function attachEvents() {
  [elements.bodyScore, elements.mindScore, elements.afterBodyScore, elements.afterMindScore].forEach((input) => {
    input.addEventListener("input", () => {
      updateScoreLabels();
      drawAllCharts();
    });
  });

  elements.canvas.addEventListener("pointerdown", (event) => handleCanvasPoint(event));
  elements.afterCanvas.addEventListener("pointerdown", (event) =>
    handleCanvasPoint(event, elements.afterCanvas, elements.afterBodyScore, elements.afterMindScore),
  );
  elements.newRecordNav.addEventListener("click", () => navigate("#/new"));
  elements.recordsNav.addEventListener("click", () => navigate("#/records"));
  elements.docsNav.addEventListener("click", () => navigate("#/docs"));
  elements.backToRecordsButton.addEventListener("click", () => navigate("#/records"));
  elements.backToDocsButton.addEventListener("click", () => navigate("#/docs"));
  elements.saveDraftButton.addEventListener("click", () => saveDraft(true));
  elements.saveButton.addEventListener("click", saveCurrentRecord);
  elements.clearButton.addEventListener("click", clearForm);
  elements.downloadButton.addEventListener("click", openDownloadModal);
  elements.downloadJsonButton.addEventListener("click", exportJson);
  elements.downloadMarkdownButton.addEventListener("click", exportMarkdown);
  elements.cancelDownloadButton.addEventListener("click", closeDownloadModal);
  elements.downloadModal.addEventListener("click", (event) => {
    if (event.target === elements.downloadModal) {
      closeDownloadModal();
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.downloadModal.hidden) {
      closeDownloadModal();
    }
  });
  window.addEventListener("hashchange", handleRoute);

  document.querySelectorAll(".quick-actions button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(`#${button.dataset.target}`);
      target.value = button.dataset.text;
      target.focus();
      scheduleDraftSave();
    });
  });

  [
    elements.bodyScore,
    elements.mindScore,
    elements.afterBodyScore,
    elements.afterMindScore,
    elements.recordDateTime,
    elements.stateNote,
    elements.afterNote,
    elements.bodyAction,
    elements.wordAction,
    elements.focusAction,
    elements.tryPlan,
    elements.reflection,
  ].forEach((input) => {
    input.addEventListener("input", scheduleDraftSave);
    input.addEventListener("change", scheduleDraftSave);
  });

  elements.records.addEventListener("click", (event) => {
    const detailId = event.target.dataset.detail;
    const deleteId = event.target.dataset.delete;

    if (detailId) {
      navigate(`#/records/${encodeURIComponent(detailId)}`);
      return;
    }

    if (!deleteId) return;
    records = records.filter((record) => record.id !== deleteId);
    saveRecords();
    renderRecords();
  });

  elements.docsList.addEventListener("click", (event) => {
    const slug = event.target.dataset.doc;
    if (!slug) return;
    navigate(`#/docs/${encodeURIComponent(slug)}`);
  });
}

setDefaultDateTime();
const draft = loadDraft();
if (draft) {
  setFormData(draft);
  showSaveStatus("途中保存を復元しました");
}
updateScoreLabels();
drawAllCharts();
renderRecords();
renderDocsList();
attachEvents();
handleRoute();
