const storageKey = "futsal-state-records-v1";
const draftStorageKey = "futsal-state-draft-v1";

const elements = {
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
  recordDate: document.querySelector("#recordDate"),
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
  exportMarkdownButton: document.querySelector("#exportMarkdownButton"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  records: document.querySelector("#records"),
  recordCount: document.querySelector("#recordCount"),
};

const ctx = elements.canvas.getContext("2d");
const afterCtx = elements.afterCanvas.getContext("2d");

let records = loadRecords();
let draftTimer;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function getFormData() {
  return {
    id: crypto.randomUUID(),
    date: elements.recordDate.value || today(),
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
    date: elements.recordDate.value || today(),
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
  elements.recordDate.value = data.date || today();
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

function setDefaultDate() {
  elements.recordDate.value = today();
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

function drawChart(canvas = elements.canvas, context = ctx, bodyInput = elements.bodyScore, mindInput = elements.mindScore) {
  const width = canvas.width;
  const height = canvas.height;
  const padding = 58;
  const plot = width - padding * 2;
  const bodyScore = Number(bodyInput.value);
  const mindScore = Number(mindInput.value);
  const x = padding + (mindScore / 10) * plot;
  const y = padding + ((10 - bodyScore) / 10) * plot;

  context.clearRect(0, 0, width, height);
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
  const mind = Math.round(((x - padding) / plot) * 10);
  const body = Math.round(10 - ((y - padding) / plot) * 10);

  mindInput.value = String(mind);
  bodyInput.value = String(body);
  updateScoreLabels();
  drawAllCharts();
  scheduleDraftSave();
}

function drawAllCharts() {
  drawChart(elements.canvas, ctx, elements.bodyScore, elements.mindScore);
  drawChart(elements.afterCanvas, afterCtx, elements.afterBodyScore, elements.afterMindScore);
}

function renderRecords() {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
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
              <div class="record-date">${escapeHtml(record.date)}</div>
              <div class="record-scores">
                <span class="pill">身体 ${record.bodyScore}</span>
                <span class="pill">心 ${record.mindScore}</span>
                <span class="pill">後 身体 ${record.afterBodyScore ?? record.bodyScore} (${formatDelta(record.bodyDelta ?? 0)})</span>
                <span class="pill">後 心 ${record.afterMindScore ?? record.mindScore} (${formatDelta(record.mindDelta ?? 0)})</span>
              </div>
            </div>
            <button class="delete-button" type="button" data-delete="${record.id}">削除</button>
          </div>
          <div class="record-body">
            ${field("状態", record.stateNote)}
            ${field("試した後", record.afterNote)}
            ${field("からだ", record.bodyAction)}
            ${field("ことば", record.wordAction)}
            ${field("いしき", record.focusAction)}
            ${field("トライ", record.tryPlan)}
            ${field("振り返り", record.reflection)}
          </div>
        </article>
      `,
    )
    .join("");
}

function field(label, value) {
  if (!value) return "";
  return `<p><strong>${label}</strong>${escapeHtml(value)}</p>`;
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
  setDefaultDate();
  updateScoreLabels();
  drawAllCharts();
  clearDraft();
  showSaveStatus("入力をクリアしました");
}

function saveCurrentRecord() {
  const record = getFormData();
  records.push(record);
  saveRecords();
  clearDraft();
  showSaveStatus("記録しました");
  renderRecords();
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
  download("futsal-records.json", JSON.stringify(records, null, 2), "application/json");
}

function exportMarkdown() {
  const content = records
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    .map(
      (record) => `## ${record.date}

- 身体の状態: ${record.bodyScore}
- 心の状態: ${record.mindScore}
- 試した後の身体: ${record.afterBodyScore ?? ""}
- 試した後の心: ${record.afterMindScore ?? ""}
- 身体の変化: ${formatDelta(record.bodyDelta ?? 0)}
- 心の変化: ${formatDelta(record.mindDelta ?? 0)}
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

  download("futsal-records.md", `# フットサル記録\n\n${content}`, "text/markdown");
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
  elements.saveDraftButton.addEventListener("click", () => saveDraft(true));
  elements.saveButton.addEventListener("click", saveCurrentRecord);
  elements.clearButton.addEventListener("click", clearForm);
  elements.exportJsonButton.addEventListener("click", exportJson);
  elements.exportMarkdownButton.addEventListener("click", exportMarkdown);

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
    elements.recordDate,
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
    const id = event.target.dataset.delete;
    if (!id) return;
    records = records.filter((record) => record.id !== id);
    saveRecords();
    renderRecords();
  });
}

setDefaultDate();
const draft = loadDraft();
if (draft) {
  setFormData(draft);
  showSaveStatus("途中保存を復元しました");
}
updateScoreLabels();
drawAllCharts();
renderRecords();
attachEvents();
