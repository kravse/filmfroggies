/**
 * Admin page (#admin): password gate, user roster, invite code generation.
 */

const ADMIN_TOKEN_KEY = "moviecollector-admin-token";
const ADMIN_TIMEOUT_MS = 15_000;

function parseAdminHash(hash) {
  return hash === "#admin" || hash === "#admin/" ? true : false;
}

function loadAdminToken() {
  try {
    const text = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!text) {
      return null;
    }
    const parsed = JSON.parse(text);
    const token = typeof parsed?.token === "string" ? parsed.token.trim() : "";
    const expiresAt = Number(parsed?.expiresAt);
    if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      return null;
    }
    return { token, expiresAt };
  } catch (_) {
    return null;
  }
}

function saveAdminToken(payload) {
  try {
    if (!payload?.token) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      return;
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, JSON.stringify(payload));
  } catch (_) {
    /* Private browsing may refuse storage. */
  }
}

function clearAdminToken() {
  saveAdminToken(null);
}

async function adminRequest(path, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ADMIN_TIMEOUT_MS);
  try {
    const headers = {};
    if (auth) {
      const session = loadAdminToken();
      headers.authorization = `Bearer ${session?.token || ""}`;
    }
    if (body) {
      headers["content-type"] = "application/json";
    }
    const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
    const response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && auth) {
        clearAdminToken();
      }
      const error = new Error(payload?.error || `Admin request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function setAdminStatus(message, isError = false) {
  if (!adminStatusEl) {
    return;
  }
  adminStatusEl.textContent = message || "";
  adminStatusEl.classList.toggle("is-error", Boolean(isError && message));
}

function showAdminLogin() {
  if (adminLoginPanel) {
    adminLoginPanel.hidden = false;
  }
  if (adminDashboardPanel) {
    adminDashboardPanel.hidden = true;
  }
  if (adminLoginErrorEl) {
    adminLoginErrorEl.textContent = "";
  }
}

function showAdminDashboard() {
  if (adminLoginPanel) {
    adminLoginPanel.hidden = true;
  }
  if (adminDashboardPanel) {
    adminDashboardPanel.hidden = false;
  }
}

function renderAdminUserRow(user) {
  const li = document.createElement("li");
  li.className = "admin-user-row";
  li.dataset.userId = String(user.id);

  const meta = document.createElement("div");
  meta.className = "admin-user-meta";

  const name = document.createElement("strong");
  name.className = "admin-user-name";
  name.textContent = user.displayName || user.email;

  const email = document.createElement("span");
  email.className = "admin-user-email";
  email.textContent = user.email;

  const movies = document.createElement("span");
  movies.className = "admin-user-movies";
  const movieCount = Number(user.movieCount) || 0;
  movies.textContent = movieCount === 1 ? "1 movie" : `${movieCount} movies`;

  meta.append(name, email);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "ghost-btn admin-user-delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    onAdminDeleteUser(user);
  });

  li.append(meta, movies, deleteBtn);
  return li;
}

function renderAdminUsers(users) {
  if (!adminUsersListEl) {
    return;
  }
  adminUsersListEl.replaceChildren();
  if (!users.length) {
    const empty = document.createElement("li");
    empty.className = "admin-users-empty";
    empty.textContent = "No users yet.";
    adminUsersListEl.append(empty);
    return;
  }
  for (const user of users) {
    adminUsersListEl.append(renderAdminUserRow(user));
  }
}

function renderAdminGeneratedCodes(codes) {
  if (!adminGeneratedCodesEl) {
    return;
  }
  adminGeneratedCodesEl.replaceChildren();
  if (!codes?.length) {
    adminGeneratedCodesEl.hidden = true;
    return;
  }
  adminGeneratedCodesEl.hidden = false;
  const title = document.createElement("p");
  title.className = "admin-generated-title";
  title.textContent = "New invite codes (copy now — shown once):";
  adminGeneratedCodesEl.append(title);

  const list = document.createElement("ul");
  list.className = "admin-generated-list";
  for (const code of codes) {
    const item = document.createElement("li");
    const codeEl = document.createElement("code");
    codeEl.className = "admin-code-chip";
    codeEl.textContent = code;
    item.append(codeEl);
    list.append(item);
  }
  adminGeneratedCodesEl.append(list);
}

/**
 * Rate limits key on the client IP, which for proxied traffic only comes from
 * X-Forwarded-For when Netlify's signature verifies. When it does not, every
 * visitor shares one bucket — invisible to a single user, so it is reported here
 * rather than left to be inferred from other people's 429s.
 */
const ADMIN_PROXY_STATES = {
  verified: {
    label: "Verified",
    tone: "ok",
    note: "Rate limits are keyed to real client IPs.",
  },
  unsigned: {
    label: "Not signed",
    tone: "error",
    note:
      "Netlify is not signing proxied requests, so every visitor shares one rate-limit bucket. Check that NETLIFY_PROXY_SIGNING_SECRET holds the same value on Netlify (Runtime scope) and on the Worker.",
  },
  unconfigured: {
    label: "Not configured",
    tone: "warn",
    note:
      "No signing secret on the Worker, so the forwarded IP is trusted on a header a caller can forge. Set NETLIFY_PROXY_SIGNING_SECRET in both places.",
  },
  direct: {
    label: "Direct request",
    tone: "neutral",
    note: "This request did not come through the Netlify proxy, so there is nothing to verify.",
  },
};

function renderAdminProxyDiagnostic(stats) {
  if (!adminProxyDiagnosticEl) {
    return;
  }
  const state = ADMIN_PROXY_STATES[stats?.proxySignature?.status];
  if (!state) {
    adminProxyDiagnosticEl.hidden = true;
    return;
  }
  adminProxyDiagnosticEl.hidden = false;
  adminProxyDiagnosticEl.classList.remove("is-ok", "is-error", "is-warn", "is-neutral");
  adminProxyDiagnosticEl.classList.add(`is-${state.tone}`);
  if (adminProxyValueEl) {
    adminProxyValueEl.textContent = state.label;
  }
  if (adminProxyNoteEl) {
    const ip = String(stats?.rateLimitIp || "").trim();
    adminProxyNoteEl.textContent = ip ? `${state.note} Rate-limit IP: ${ip}` : state.note;
  }
}

async function refreshAdminDashboard() {
  setAdminStatus("");
  try {
    const [stats, usersBody] = await Promise.all([
      adminRequest("/admin/stats"),
      adminRequest("/admin/users"),
    ]);
    if (adminUserCountEl) {
      adminUserCountEl.textContent = String(stats.userCount ?? 0);
    }
    if (adminUnusedInvitesEl) {
      adminUnusedInvitesEl.textContent = String(stats.unusedInviteCount ?? 0);
    }
    renderAdminProxyDiagnostic(stats);
    renderAdminUsers(usersBody.users || []);
  } catch (error) {
    if (error?.status === 401 || error?.status === 503) {
      showAdminLogin();
    }
    setAdminStatus(error?.message || "Could not load admin data.", true);
  }
}

async function onAdminLoginSubmit(event) {
  event.preventDefault();
  if (!adminPasswordInput) {
    return;
  }
  const password = adminPasswordInput.value;
  if (adminLoginErrorEl) {
    adminLoginErrorEl.textContent = "";
  }
  setAdminStatus("");
  try {
    const body = await adminRequest("/admin/login", {
      method: "POST",
      body: { password },
      auth: false,
    });
    saveAdminToken({ token: body.token, expiresAt: body.expiresAt });
    adminPasswordInput.value = "";
    showAdminDashboard();
    await refreshAdminDashboard();
  } catch (error) {
    const message = error?.message || "Login failed.";
    if (adminLoginErrorEl) {
      adminLoginErrorEl.textContent = message;
    }
  }
}

async function onAdminDeleteUser(user) {
  const label = user.displayName || user.email;
  if (!window.confirm(`Delete account for ${label}? This cannot be undone.`)) {
    return;
  }
  setAdminStatus("");
  try {
    await adminRequest(`/admin/users/${user.id}`, { method: "DELETE" });
    setAdminStatus(`Deleted ${label}.`);
    await refreshAdminDashboard();
  } catch (error) {
    setAdminStatus(error?.message || "Delete failed.", true);
  }
}

async function onAdminGenerateInvites() {
  const count = getAdminInviteCount();
  setAdminStatus("");
  renderAdminGeneratedCodes([]);
  try {
    const body = await adminRequest("/admin/invite-codes", {
      method: "POST",
      body: { count },
    });
    renderAdminGeneratedCodes(body.codes || []);
    setAdminStatus(`Generated ${body.codes?.length || 0} invite code(s).`);
    await refreshAdminDashboard();
  } catch (error) {
    setAdminStatus(error?.message || "Could not generate codes.", true);
  }
}

const ADMIN_INVITE_COUNT_MIN = 1;
const ADMIN_INVITE_COUNT_MAX = 20;

function clampAdminInviteCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return ADMIN_INVITE_COUNT_MIN;
  }
  return Math.min(ADMIN_INVITE_COUNT_MAX, Math.max(ADMIN_INVITE_COUNT_MIN, Math.trunc(n)));
}

function getAdminInviteCount() {
  return clampAdminInviteCount(adminInviteCountInput?.value || ADMIN_INVITE_COUNT_MIN);
}

function syncAdminInviteCountUi() {
  const count = getAdminInviteCount();
  if (adminInviteCountInput) {
    adminInviteCountInput.value = String(count);
  }
  if (adminInviteCountDisplay) {
    adminInviteCountDisplay.textContent = String(count);
  }
  if (adminInviteCountDec) {
    adminInviteCountDec.disabled = count <= ADMIN_INVITE_COUNT_MIN;
  }
  if (adminInviteCountInc) {
    adminInviteCountInc.disabled = count >= ADMIN_INVITE_COUNT_MAX;
  }
}

function onAdminInviteCountDec() {
  const next = clampAdminInviteCount(getAdminInviteCount() - 1);
  if (adminInviteCountInput) {
    adminInviteCountInput.value = String(next);
  }
  syncAdminInviteCountUi();
}

function onAdminInviteCountInc() {
  const next = clampAdminInviteCount(getAdminInviteCount() + 1);
  if (adminInviteCountInput) {
    adminInviteCountInput.value = String(next);
  }
  syncAdminInviteCountUi();
}

function onAdminLogout() {
  clearAdminToken();
  renderAdminGeneratedCodes([]);
  setAdminStatus("");
  showAdminLogin();
}

function renderAdminView() {
  if (!isAdminViewActive()) {
    return;
  }
  syncAppViewChrome();
  if (loadAdminToken()) {
    showAdminDashboard();
    refreshAdminDashboard();
  } else {
    showAdminLogin();
  }
}

function navigateToAdmin(options = {}) {
  closeDetail({ popHistory: false });
  if (typeof closeSettings === "function" && !settingsDialog.hidden) {
    closeSettings();
  }
  if (typeof closeLogin === "function" && !loginDialog.hidden) {
    closeLogin();
  }
  if (typeof clearFriendViewState === "function") {
    clearFriendViewState();
  }
  reorderModeActive = false;
  appView = "admin";
  activeCustomListId = null;
  if (options.pushHistory !== false) {
    history.pushState({ appView: "admin" }, "", "#admin");
    markProgrammaticLocation();
  }
  renderAdminView();
}

adminLoginForm?.addEventListener("submit", onAdminLoginSubmit);
adminGenerateInvitesBtn?.addEventListener("click", onAdminGenerateInvites);
adminLogoutBtn?.addEventListener("click", onAdminLogout);
adminInviteCountDec?.addEventListener("click", onAdminInviteCountDec);
adminInviteCountInc?.addEventListener("click", onAdminInviteCountInc);
syncAdminInviteCountUi();
