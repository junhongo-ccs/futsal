const storageKey = "futsal-state-records-v1";
const draftStorageKey = "futsal-state-draft-v1";
const syncOnboardingSeenKey = "futsal-sync-onboarding-seen-v1";
let supabaseConfig = {};
let isSupabaseConfigured = false;
let supabaseClient = null;
const docs = [
  {
    slug: "readme",
    title: "週末フットサルの目的",
    path: "generated-docs/readme.html",
    summary: "全体の入口。目的、使い方、Webアプリの説明。",
  },
  {
    slug: "purpose",
    title: "自分のフットサルの目的",
    path: "generated-docs/purpose.html",
    summary: "週末フットサルで立ち戻る目的。",
  },
  {
    slug: "thinking",
    title: "目的論と原因論",
    path: "generated-docs/thinking.html",
    summary: "原因を見つけ、次の目的へ変える考え方。",
  },
  {
    slug: "preparation",
    title: "本番で安定するための準備力",
    path: "generated-docs/preparation.html",
    summary: "価値観、意識、技術を整える。",
  },
  {
    slug: "awareness",
    title: "意識系とは何か",
    path: "generated-docs/awareness.html",
    summary: "見る、切り替える、次に関わる。",
  },
  {
    slug: "body-sense",
    title: "体感覚に落とし込む",
    path: "generated-docs/body-sense.html",
    summary: "マインドを身体の合図に変える。",
  },
  {
    slug: "peripheral-vision-dribbling",
    title: "間接視野でボールを扱う",
    path: "generated-docs/peripheral-vision-dribbling.html",
    summary: "顔を上げ、周辺視野と触覚でボールを管理する。",
    tags: ["スキル"],
  },
  {
    slug: "dribbling-vision-map",
    title: "ドリブル中の視線マップ",
    path: "generated-docs/dribbling-vision-map.html",
    summary: "見る場所、順番、頻度を決めて判断を速くする。",
    tags: ["スキル"],
  },
  {
    slug: "mental-control",
    title: "からだ、ことば、いしきで整える",
    path: "generated-docs/mental-control.html",
    summary: "結果ではなく、まず状態を整える。",
  },
  {
    slug: "pressure-control",
    title: "狭いコートでのプレッシャー対処",
    path: "generated-docs/pressure-control.html",
    summary: "速い寄せの中で、受け入れ、外を見て、次に関わる。",
  },
  {
    slug: "daily-pressure-training",
    title: "日常の小さなプレッシャー訓練",
    path: "generated-docs/daily-pressure-training.html",
    summary: "小さな約束を守り、プレッシャーはあるものとして扱う。",
  },
  {
    slug: "app-implementation-plan",
    title: "Webアプリ実装計画",
    path: "generated-docs/app-implementation-plan.html",
    summary: "準備フェーズ、サッカーノート、DBと認証の実装方針。",
    tags: ["アプリ"],
  },
  {
    slug: "supabase-setup",
    title: "Supabase同期セットアップ",
    path: "generated-docs/supabase-setup.html",
    summary: "Googleログイン、PostgreSQL、RLSで複数端末同期を有効にする手順。",
    tags: ["アプリ"],
  },
  {
    slug: "reflection-template",
    title: "振り返りテンプレート",
    path: "generated-docs/reflection-template.html",
    summary: "週末フットサルの振り返りに使う記録テンプレート。",
    tags: ["テンプレート"],
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
  courtName: document.querySelector("#courtName"),
  stateNote: document.querySelector("#stateNote"),
  afterNote: document.querySelector("#afterNote"),
  smallActionRows: Array.from(document.querySelectorAll(".small-action")),
  bodyAction: document.querySelector("#bodyAction"),
  wordAction: document.querySelector("#wordAction"),
  focusAction: document.querySelector("#focusAction"),
  sceneNote: document.querySelector("#sceneNote"),
  resultNote: document.querySelector("#resultNote"),
  whyNote: document.querySelector("#whyNote"),
  cognitionGap: document.querySelector("#cognitionGap"),
  nextOptions: document.querySelector("#nextOptions"),
  cueWord: document.querySelector("#cueWord"),
  videoUrl: document.querySelector("#videoUrl"),
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
  authPanel: document.querySelector("#authPanel"),
  authStatus: document.querySelector("#authStatus"),
  signInButton: document.querySelector("#signInButton"),
  importLocalButton: document.querySelector("#importLocalButton"),
  syncBanner: document.querySelector("#syncBanner"),
  openSyncSplashButton: document.querySelector("#openSyncSplashButton"),
  syncSplashModal: document.querySelector("#syncSplashModal"),
  syncSplashLoginButton: document.querySelector("#syncSplashLoginButton"),
  syncSplashLaterButton: document.querySelector("#syncSplashLaterButton"),
};

const ctx = elements.canvas.getContext("2d");
const afterCtx = elements.afterCanvas.getContext("2d");

let records = [];
let currentUser = null;
let draftTimer;

function nowDateTimeLocal() {
  const date = new Date();
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function createRecordId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16),
  );
}

async function setupSupabase() {
  supabaseConfig = window.FUTSAL_SUPABASE || (await loadSupabaseConfig());
  isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey && window.supabase?.createClient);
  supabaseClient = isSupabaseConfigured ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;
}

async function loadSupabaseConfig() {
  try {
    const response = await fetch("config.json", { cache: "no-store" });
    if (!response.ok) return {};
    return response.json();
  } catch {
    return {};
  }
}

function normalizeRecord(record) {
  const dateTime = record.dateTime || (record.date ? `${record.date}T00:00` : nowDateTimeLocal());
  return {
    ...record,
    dateTime,
    date: record.date || dateTime.slice(0, 10),
    courtName: record.courtName || "",
    afterBodyScore: record.afterBodyScore ?? record.bodyScore,
    afterMindScore: record.afterMindScore ?? record.mindScore,
    bodyDelta: record.bodyDelta ?? (record.afterBodyScore ?? record.bodyScore) - record.bodyScore,
    mindDelta: record.mindDelta ?? (record.afterMindScore ?? record.mindScore) - record.mindScore,
    smallActions: normalizeSmallActions(record.smallActions),
    sceneNote: record.sceneNote || "",
    resultNote: record.resultNote || "",
    whyNote: record.whyNote || "",
    cognitionGap: record.cognitionGap || "",
    nextOptions: record.nextOptions || "",
    cueWord: record.cueWord || "",
    videoUrl: typeof record.videoUrl === "string" ? record.videoUrl.trim() : "",
  };
}

function normalizeSmallActions(actions = []) {
  return actions
    .map((action) => ({
      text: action.text || "",
      status: action.status || "",
      effort: action.effort || "",
      note: action.note || "",
    }))
    .filter((action) => action.text || action.status || action.effort || action.note);
}

function loadLocalRecords() {
  try {
    return (JSON.parse(localStorage.getItem(storageKey)) || []).map(normalizeRecord);
  } catch {
    return [];
  }
}

function saveLocalRecords() {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

async function loadRecords() {
  if (!isSupabaseActive()) {
    records = loadLocalRecords();
    return;
  }

  const { data, error } = await supabaseClient
    .from("futsal_records")
    .select("id, data, created_at, updated_at")
    .order("date_time", { ascending: false });

  if (error) {
    showSaveStatus("記録の読み込みに失敗しました");
    records = [];
    return;
  }

  records = (data || []).map((row) =>
    normalizeRecord({
      ...(row.data || {}),
      id: row.id,
      createdAt: row.data?.createdAt || row.created_at,
      updatedAt: row.data?.updatedAt || row.updated_at,
    }),
  );
}

async function saveRecord(record) {
  const user = await getAuthenticatedUser();
  if (!user) {
    records.push(record);
    saveLocalRecords();
    return record;
  }

  const { data, error } = await supabaseClient
    .from("futsal_records")
    .insert({
      id: record.id,
      user_id: user.id,
      date_time: record.dateTime,
      data: record,
    })
    .select("id, data, created_at, updated_at")
    .single();

  if (error) throw error;
  const saved = normalizeRecord({ ...(data.data || {}), id: data.id, createdAt: data.created_at, updatedAt: data.updated_at });
  records.push(saved);
  return saved;
}

async function deleteRecord(id) {
  if (!isSupabaseActive()) {
    records = records.filter((record) => record.id !== id);
    saveLocalRecords();
    return;
  }

  const { error } = await supabaseClient.from("futsal_records").delete().eq("id", id);
  if (error) throw error;
  records = records.filter((record) => record.id !== id);
}

function isSupabaseActive() {
  return Boolean(isSupabaseConfigured && currentUser);
}

async function getAuthenticatedUser() {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  if (currentUser) return currentUser;

  const { data, error } = await supabaseClient.auth.getSession();
  currentUser = error ? null : data.session?.user || null;
  updateAuthUi();
  return currentUser;
}

function getFormData() {
  const dateTime = elements.recordDateTime.value || nowDateTimeLocal();
  return {
    id: createRecordId(),
    dateTime,
    date: dateTime.slice(0, 10),
    courtName: elements.courtName.value,
    bodyScore: Number(elements.bodyScore.value),
    mindScore: Number(elements.mindScore.value),
    afterBodyScore: Number(elements.afterBodyScore.value),
    afterMindScore: Number(elements.afterMindScore.value),
    bodyDelta: Number(elements.afterBodyScore.value) - Number(elements.bodyScore.value),
    mindDelta: Number(elements.afterMindScore.value) - Number(elements.mindScore.value),
    stateNote: elements.stateNote.value.trim(),
    afterNote: elements.afterNote.value.trim(),
    smallActions: getSmallActions(),
    bodyAction: elements.bodyAction.value.trim(),
    wordAction: elements.wordAction.value.trim(),
    focusAction: elements.focusAction.value.trim(),
    sceneNote: elements.sceneNote.value.trim(),
    resultNote: elements.resultNote.value.trim(),
    whyNote: elements.whyNote.value.trim(),
    cognitionGap: elements.cognitionGap.value.trim(),
    nextOptions: elements.nextOptions.value.trim(),
    cueWord: elements.cueWord.value.trim(),
    videoUrl: elements.videoUrl.value.trim(),
    tryPlan: elements.tryPlan.value.trim(),
    reflection: elements.reflection.value.trim(),
    createdAt: new Date().toISOString(),
  };
}

function getDraftData() {
  return {
    dateTime: elements.recordDateTime.value || nowDateTimeLocal(),
    courtName: elements.courtName.value,
    bodyScore: elements.bodyScore.value,
    mindScore: elements.mindScore.value,
    afterBodyScore: elements.afterBodyScore.value,
    afterMindScore: elements.afterMindScore.value,
    stateNote: elements.stateNote.value,
    afterNote: elements.afterNote.value,
    smallActions: getSmallActions(false),
    bodyAction: elements.bodyAction.value,
    wordAction: elements.wordAction.value,
    focusAction: elements.focusAction.value,
    sceneNote: elements.sceneNote.value,
    resultNote: elements.resultNote.value,
    whyNote: elements.whyNote.value,
    cognitionGap: elements.cognitionGap.value,
    nextOptions: elements.nextOptions.value,
    cueWord: elements.cueWord.value,
    videoUrl: elements.videoUrl.value,
    tryPlan: elements.tryPlan.value,
    reflection: elements.reflection.value,
    updatedAt: new Date().toISOString(),
  };
}

function setFormData(data) {
  if (!data) return;
  elements.recordDateTime.value = data.dateTime || (data.date ? `${data.date}T00:00` : nowDateTimeLocal());
  elements.courtName.value = data.courtName ?? "";
  elements.bodyScore.value = data.bodyScore ?? "5";
  elements.mindScore.value = data.mindScore ?? "5";
  elements.afterBodyScore.value = data.afterBodyScore ?? "5";
  elements.afterMindScore.value = data.afterMindScore ?? "5";
  elements.stateNote.value = data.stateNote ?? "";
  elements.afterNote.value = data.afterNote ?? "";
  setSmallActions(data.smallActions ?? []);
  elements.bodyAction.value = data.bodyAction ?? "";
  elements.wordAction.value = data.wordAction ?? "";
  elements.focusAction.value = data.focusAction ?? "";
  elements.sceneNote.value = data.sceneNote ?? "";
  elements.resultNote.value = data.resultNote ?? "";
  elements.whyNote.value = data.whyNote ?? "";
  elements.cognitionGap.value = data.cognitionGap ?? "";
  elements.nextOptions.value = data.nextOptions ?? "";
  elements.cueWord.value = data.cueWord ?? "";
  elements.videoUrl.value = data.videoUrl ?? "";
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

async function loadRemoteDraft() {
  if (!isSupabaseActive()) return null;
  const { data, error } = await supabaseClient.from("futsal_drafts").select("data").eq("user_id", currentUser.id).maybeSingle();
  if (error) {
    showSaveStatus("下書きの読み込みに失敗しました");
    return null;
  }
  return data?.data || null;
}

function saveDraft(showMessage = true) {
  const draft = getDraftData();
  localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  if (isSupabaseActive()) {
    saveRemoteDraft(draft).catch(() => showSaveStatus("下書きの同期に失敗しました"));
  }
  if (showMessage) {
    showSaveStatus("途中保存しました");
  }
}

async function saveRemoteDraft(draft) {
  const { error } = await supabaseClient.from("futsal_drafts").upsert({
    user_id: currentUser.id,
    data: draft,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
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
  if (isSupabaseActive()) {
    supabaseClient.from("futsal_drafts").delete().eq("user_id", currentUser.id).then(({ error }) => {
      if (error) showSaveStatus("下書きの削除に失敗しました");
    });
  }
}

function showSaveStatus(message) {
  elements.saveStatus.textContent = message;
}

function updateAuthUi() {
  if (!elements.authPanel) return;
  elements.authPanel.hidden = true;

  if (!isSupabaseConfigured) {
    if (elements.syncBanner) elements.syncBanner.hidden = true;
    if (elements.syncSplashModal) elements.syncSplashModal.hidden = true;
    return;
  }

  if (!elements.syncBanner) return;
  const localCount = loadLocalRecords().length;

  if (currentUser) {
    elements.syncBanner.hidden = true;
    elements.authStatus.textContent = `${currentUser.email || "ログイン中"} として同期しています。`;
    if (elements.signInButton) elements.signInButton.hidden = true;
    if (elements.importLocalButton) elements.importLocalButton.hidden = localCount === 0;
    markSyncOnboardingSeen();
    return;
  }

  elements.syncBanner.hidden = false;
  elements.authStatus.textContent = "Googleログインすると、スマホ2台やPCから同じ記録を見られます。";
  if (elements.signInButton) elements.signInButton.hidden = false;
  if (elements.importLocalButton) elements.importLocalButton.hidden = true;
}

function hasSeenSyncOnboarding() {
  return localStorage.getItem(syncOnboardingSeenKey) === "1";
}

function markSyncOnboardingSeen() {
  localStorage.setItem(syncOnboardingSeenKey, "1");
}

function openSyncSplash() {
  if (!elements.syncSplashModal || currentUser || !isSupabaseConfigured) return;
  elements.syncSplashModal.hidden = false;
}

function closeSyncSplash() {
  if (!elements.syncSplashModal) return;
  elements.syncSplashModal.hidden = true;
}

function maybeOpenSyncSplash() {
  if (!isSupabaseConfigured || currentUser || hasSeenSyncOnboarding()) return;
  openSyncSplash();
}

function getAuthRedirectUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/index\.html$/, "");
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url.toString();
}

async function signInWithGoogle() {
  if (!supabaseClient) return;
  markSyncOnboardingSeen();
  const redirectTo = getAuthRedirectUrl();
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
  if (error) {
    showSaveStatus(`Googleログインを開始できませんでした: ${error.message || "設定を確認してください"}`);
  }
}

async function importLocalRecords() {
  if (!isSupabaseActive()) return;
  const localRecords = loadLocalRecords();
  if (localRecords.length === 0) return;

  const rows = localRecords.map((record) => {
    const normalized = normalizeRecord(record);
    return {
      id: normalized.id,
      user_id: currentUser.id,
      date_time: normalized.dateTime,
      data: normalized,
      updated_at: new Date().toISOString(),
    };
  });

  const { error } = await supabaseClient.from("futsal_records").upsert(rows);
  if (error) {
    showSaveStatus("この端末の記録を取り込めませんでした");
    return;
  }

  localStorage.removeItem(storageKey);
  await loadRecords();
  renderRecords();
  updateAuthUi();
  showSaveStatus("この端末の記録を取り込みました");
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

function getSmallActions(trim = true) {
  return elements.smallActionRows
    .map((row) => {
      const text = row.querySelector(".small-action-text").value;
      const note = row.querySelector(".small-action-note").value;
      return {
        text: trim ? text.trim() : text,
        status: row.querySelector(".small-action-status").value,
        effort: row.querySelector(".small-action-effort").value,
        note: trim ? note.trim() : note,
      };
    })
    .filter((action) => action.text || action.status || action.effort || action.note);
}

function setSmallActions(actions = []) {
  elements.smallActionRows.forEach((row, index) => {
    const action = actions[index] || {};
    row.querySelector(".small-action-text").value = action.text || "";
    row.querySelector(".small-action-status").value = action.status || "";
    row.querySelector(".small-action-effort").value = action.effort || "";
    row.querySelector(".small-action-note").value = action.note || "";
  });
}

function getActionStats(actions = []) {
  const normalized = normalizeSmallActions(actions);
  const total = normalized.length;
  const done = normalized.filter((action) => action.status === "done").length;
  const partial = normalized.filter((action) => action.status === "partial").length;
  const missed = normalized.filter((action) => action.status === "missed").length;
  const score = done + partial * 0.5;
  return { total, done, partial, missed, score };
}

function formatActionStats(actions = []) {
  const stats = getActionStats(actions);
  if (stats.total === 0) return "約束 -";
  return `約束 ${formatNumber(stats.score)}/${stats.total}`;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(value.toFixed(1));
}

function formatActionStatus(value) {
  const labels = {
    done: "できた",
    partial: "一部できた",
    missed: "できなかった",
  };
  return labels[value] || "未選択";
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
  const hash = window.location.hash || "#/docs";
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

  if (isSupabaseConfigured && !currentUser) {
    elements.records.innerHTML =
      '<p class="empty">まだ記録はありません。Googleログインで同期すると、他端末の記録も表示できます。</p>' +
      '<button class="button primary" id="loginFromRecordsButton" type="button">Googleでログイン</button>';
    return;
  }

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
                ${record.courtName ? `<span class="pill">${escapeHtml(record.courtName)}</span>` : ""}
                <span class="pill">${escapeHtml(formatActionStats(record.smallActions))}</span>
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
          <p class="record-summary">${escapeHtml(getRecordSummary(record))}</p>
        </article>
      `,
    )
    .join("");
}

function getRecordSummary(record) {
  return (
    record.resultNote ||
    record.tryPlan ||
    record.sceneNote ||
    record.cueWord ||
    getFirstActionText(record.smallActions) ||
    record.stateNote ||
    "記録詳細から内容を確認できます。"
  );
}

function getFirstActionText(actions = []) {
  return normalizeSmallActions(actions)[0]?.text || "";
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
        ${record.courtName ? `<p class="hint">参加コート: ${escapeHtml(record.courtName)}</p>` : ""}
      </div>
      <div class="record-scores">
        <span class="pill">${escapeHtml(formatActionStats(record.smallActions))}</span>
        <span class="pill">身体 ${record.bodyScore}</span>
        <span class="pill">心 ${record.mindScore}</span>
        <span class="pill">後 身体 ${record.afterBodyScore} (${formatDelta(record.bodyDelta)})</span>
        <span class="pill">後 心 ${record.afterMindScore} (${formatDelta(record.mindDelta)})</span>
      </div>
    </div>
    <div class="detail-grid">
      ${detailField("今の状態メモ", record.stateNote)}
      ${actionsDetailField(record.smallActions)}
      ${detailField("生活準備", record.bodyAction)}
      ${detailField("気持ちの準備", record.wordAction)}
      ${detailField("集中の準備", record.focusAction)}
      ${detailField("活動後の状態メモ", record.afterNote)}
      ${detailField("今日よかった場面", record.sceneNote)}
      ${detailField("何がよかったか", record.resultNote)}
      ${detailField("なぜよかったか", record.whyNote)}
      ${detailField("再現するきっかけ", record.cognitionGap)}
      ${detailField("次も少し増やしたいこと", record.nextOptions)}
      ${detailField("次回の合言葉", record.cueWord)}
      ${videoDetailField(record.videoUrl)}
      ${detailField("気になったポイント", record.tryPlan)}
      ${detailField("次回へどう生かすか", record.reflection)}
    </div>
  `;
}

function videoDetailField(rawUrl) {
  const safeUrl = toSafeHttpUrl(rawUrl);
  if (safeUrl) {
    return `
      <section class="detail-field">
        <h4>動画リンク</h4>
        <p><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">動画を開く</a></p>
      </section>
    `;
  }

  if (rawUrl) {
    return `
      <section class="detail-field">
        <h4>動画リンク</h4>
        <p>${escapeHtml(rawUrl)}</p>
      </section>
    `;
  }

  return detailField("動画リンク", "");
}

function actionsDetailField(actions = []) {
  const normalized = normalizeSmallActions(actions);
  if (normalized.length === 0) {
    return detailField("インサイドルール", "");
  }

  return `
    <section class="detail-field">
      <h4>インサイドルール</h4>
      <div class="action-list">
        ${normalized
          .map(
            (action) => `
              <div class="action-item">
                <h4>${escapeHtml(action.text || "未入力")}</h4>
                <span class="pill">${escapeHtml(formatActionStatus(action.status))}</span>
                ${action.effort ? `<span class="pill">負荷 ${escapeHtml(action.effort)}</span>` : ""}
                ${action.note ? `<p>${escapeHtml(action.note)}</p>` : ""}
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderDocsList() {
  elements.docsList.innerHTML = docs
    .map(
      (doc) => `
        <button class="doc-card" type="button" data-doc="${doc.slug}">
          <div>
            <h3>${escapeHtml(doc.title)}</h3>
            <p>${escapeHtml(doc.summary)}</p>
            ${renderDocTags(doc.tags)}
          </div>
        </button>
      `,
    )
    .join("");
}

function renderDocTags(tags = []) {
  if (tags.length === 0) return "";
  return `<div class="doc-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
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
    elements.docsDetail.innerHTML = await response.text();
  } catch {
    const directUrl = escapeHtml(new URL(doc.path, window.location.href).toString());
    elements.docsDetail.innerHTML = `
      <p class="empty">ドキュメントを読み込めませんでした。</p>
      <p class="hint">` +
      `ローカルファイルを直接開いている場合は、簡易サーバー経由で開くと表示できます。` +
      `</p>
      <p><a href="${directUrl}" target="_blank" rel="noopener noreferrer">ドキュメントを直接開く</a></p>
    `;
  }
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

function toSafeHttpUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function clearForm() {
  elements.bodyScore.value = "5";
  elements.mindScore.value = "5";
  elements.afterBodyScore.value = "5";
  elements.afterMindScore.value = "5";
  elements.courtName.value = "";
  elements.stateNote.value = "";
  elements.afterNote.value = "";
  setSmallActions([]);
  elements.bodyAction.value = "";
  elements.wordAction.value = "";
  elements.focusAction.value = "";
  elements.sceneNote.value = "";
  elements.resultNote.value = "";
  elements.whyNote.value = "";
  elements.cognitionGap.value = "";
  elements.nextOptions.value = "";
  elements.cueWord.value = "";
  elements.videoUrl.value = "";
  elements.tryPlan.value = "";
  elements.reflection.value = "";
  setDefaultDateTime();
  updateScoreLabels();
  drawAllCharts();
  clearDraft();
  showSaveStatus("入力をクリアしました");
}

async function saveCurrentRecord() {
  if (elements.saveButton?.disabled) return;

  setSaveInProgress(true);
  try {
    const record = getFormData();
    const saved = await saveRecord(record);
    clearForm();
    showSaveStatus("記録しました");
    renderRecords();
    navigate(`#/records/${encodeURIComponent(saved.id)}`);
  } catch (error) {
    console.error("Failed to save record", error);
    showSaveStatus(`記録に失敗しました: ${getErrorMessage(error)}`);
  } finally {
    setSaveInProgress(false);
  }
}

function setSaveInProgress(isSaving) {
  if (!elements.saveButton) return;
  elements.saveButton.disabled = isSaving;
  elements.saveButton.textContent = isSaving ? "記録中..." : "記録する";
  elements.saveButton.setAttribute("aria-busy", String(isSaving));
  if (isSaving) {
    showSaveStatus("記録中...");
  }
}

function getErrorMessage(error) {
  if (error?.message?.includes("row-level security")) {
    return "ログイン状態を確認できませんでした。再ログインしてからもう一度記録してください";
  }

  return error?.message || "通信状態とSupabase設定を確認してください";
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
- 参加コート: ${record.courtName || ""}
- 活動後の身体: ${record.afterBodyScore}
- 活動後の心: ${record.afterMindScore}
- 身体の変化: ${formatDelta(record.bodyDelta)}
- 心の変化: ${formatDelta(record.mindDelta)}
- インサイドルール: ${formatActionStats(record.smallActions)}
${formatActionsForMarkdown(record.smallActions)}
- 状態メモ: ${record.stateNote || ""}
- 生活準備: ${record.bodyAction || ""}
- 気持ちの準備: ${record.wordAction || ""}
- 集中の準備: ${record.focusAction || ""}
- 活動後の状態メモ: ${record.afterNote || ""}
- 今日よかった場面: ${record.sceneNote || ""}
- 何がよかったか: ${record.resultNote || ""}
- なぜよかったか: ${record.whyNote || ""}
- 再現するきっかけ: ${record.cognitionGap || ""}
- 次も少し増やしたいこと: ${record.nextOptions || ""}
- 次回の合言葉: ${record.cueWord || ""}
- 動画URL: ${record.videoUrl || ""}
- 気になったポイント: ${record.tryPlan || ""}
- 次回へどう生かすか: ${record.reflection || ""}
`,
    )
    .join("\n");

  closeDownloadModal();
  download("futsal-records.md", `# フットサル記録\n\n${content}`, "text/markdown");
}

function formatActionsForMarkdown(actions = []) {
  const normalized = normalizeSmallActions(actions);
  if (normalized.length === 0) return "";
  return normalized
    .map(
      (action, index) =>
        `- インサイドルール${index + 1}: ${action.text || ""} / ${formatActionStatus(action.status)} / 負荷 ${action.effort || "-"} / ${action.note || ""}`,
    )
    .join("\n");
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
  elements.newRecordNav?.addEventListener("click", () => navigate("#/new"));
  elements.recordsNav?.addEventListener("click", () => navigate("#/records"));
  elements.docsNav?.addEventListener("click", () => navigate("#/docs"));
  elements.backToRecordsButton?.addEventListener("click", () => navigate("#/records"));
  elements.backToDocsButton?.addEventListener("click", () => navigate("#/docs"));
  elements.saveDraftButton?.addEventListener("click", () => saveDraft(true));
  elements.saveButton?.addEventListener("click", saveCurrentRecord);
  elements.clearButton?.addEventListener("click", clearForm);
  elements.signInButton?.addEventListener("click", signInWithGoogle);
  elements.importLocalButton?.addEventListener("click", importLocalRecords);
  elements.openSyncSplashButton?.addEventListener("click", openSyncSplash);
  elements.syncSplashLoginButton?.addEventListener("click", signInWithGoogle);
  elements.syncSplashLaterButton?.addEventListener("click", () => {
    markSyncOnboardingSeen();
    closeSyncSplash();
  });
  elements.downloadButton?.addEventListener("click", openDownloadModal);
  elements.downloadJsonButton?.addEventListener("click", exportJson);
  elements.downloadMarkdownButton?.addEventListener("click", exportMarkdown);
  elements.cancelDownloadButton?.addEventListener("click", closeDownloadModal);
  elements.downloadModal?.addEventListener("click", (event) => {
    if (event.target === elements.downloadModal) {
      closeDownloadModal();
    }
  });
  elements.syncSplashModal?.addEventListener("click", (event) => {
    if (event.target === elements.syncSplashModal) {
      markSyncOnboardingSeen();
      closeSyncSplash();
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.downloadModal.hidden) {
      closeDownloadModal();
    }
  });
  window.addEventListener("hashchange", handleRoute);

  [
    elements.bodyScore,
    elements.mindScore,
    elements.afterBodyScore,
    elements.afterMindScore,
    elements.recordDateTime,
    elements.courtName,
    elements.stateNote,
    elements.afterNote,
    ...elements.smallActionRows.flatMap((row) => [
      row.querySelector(".small-action-text"),
      row.querySelector(".small-action-status"),
      row.querySelector(".small-action-effort"),
      row.querySelector(".small-action-note"),
    ]),
    elements.bodyAction,
    elements.wordAction,
    elements.focusAction,
    elements.sceneNote,
    elements.resultNote,
    elements.whyNote,
    elements.cognitionGap,
    elements.nextOptions,
    elements.cueWord,
    elements.videoUrl,
    elements.tryPlan,
    elements.reflection,
  ].forEach((input) => {
    input.addEventListener("input", scheduleDraftSave);
    input.addEventListener("change", scheduleDraftSave);
  });

  elements.records?.addEventListener("click", async (event) => {
    if (event.target.closest("#loginFromRecordsButton")) {
      await signInWithGoogle();
      return;
    }

    const detailId = event.target.dataset.detail;
    const deleteId = event.target.dataset.delete;

    if (detailId) {
      navigate(`#/records/${encodeURIComponent(detailId)}`);
      return;
    }

    if (!deleteId) return;
    try {
      await deleteRecord(deleteId);
      renderRecords();
      showSaveStatus("削除しました");
    } catch {
      showSaveStatus("削除に失敗しました");
    }
  });

  elements.docsList?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-doc]");
    const slug = card?.dataset.doc;
    if (!slug) return;
    navigate(`#/docs/${encodeURIComponent(slug)}`);
  });
}

async function initializeApp() {
  await setupSupabase();
  setDefaultDateTime();
  attachEvents();

  if (supabaseClient) {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    currentUser = sessionData.session?.user || null;
    if (!currentUser) {
      const { data, error } = await supabaseClient.auth.getUser();
      currentUser = error ? null : data.user;
    }
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      await refreshCloudState();
    });
  }

  await refreshCloudState();
  updateScoreLabels();
  drawAllCharts();
  renderDocsList();
  handleRoute();
}

async function refreshCloudState() {
  updateAuthUi();
  maybeOpenSyncSplash();
  await loadRecords();
  renderRecords();

  const draft = (await loadRemoteDraft()) || loadDraft();
  if (draft) {
    setFormData(draft);
    updateScoreLabels();
    drawAllCharts();
    showSaveStatus("途中保存を復元しました");
  }
}

initializeApp().catch(() => {
  showSaveStatus("初期化に失敗しました");
});
