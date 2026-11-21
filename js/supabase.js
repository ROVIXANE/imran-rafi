/* ============================================================
   Supabase REST client — uses fetch/XHR only, no external SDK.
   The anon/publishable key is public by design; security comes
   from Row Level Security policies in supabase/schema.sql.
   NEVER put a service-role key in this file or any frontend file.
   ============================================================ */
(function (global) {
  "use strict";

  var CONFIG = global.APP_CONFIG || {};
  var SESSION_KEY = "ir_admin_session";

  function base() {
    return String(CONFIG.supabaseUrl || "").replace(/\/+$/, "");
  }

  function key() {
    return String(CONFIG.supabaseAnonKey || "");
  }

  function configured() {
    return Boolean(base() && key() && /^https?:\/\//.test(base()));
  }

  function bucket() {
    return CONFIG.mediaBucket || "portfolio-media";
  }

  function readSession() {
    try {
      var raw = global.localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var session = JSON.parse(raw);
      if (!session || !session.access_token) return null;
      return session;
    } catch (e) {
      return null;
    }
  }

  function saveSession(session) {
    try {
      global.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) { /* storage may be unavailable */ }
  }

  function clearSession() {
    try { global.localStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ }
  }

  function token(forAdmin) {
    if (forAdmin) {
      var s = readSession();
      return s ? s.access_token : key();
    }
    return key();
  }

  function headers(forAdmin, extra) {
    var h = {
      "apikey": key(),
      "Authorization": "Bearer " + token(forAdmin),
      "Content-Type": "application/json"
    };
    Object.keys(extra || {}).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }

  async function parseError(response) {
    var message = "Request failed (" + response.status + ")";
    try {
      var data = await response.json();
      message = data.message || data.error_description || data.msg || data.error || message;
    } catch (e) { /* keep generic */ }
    return new Error(message);
  }

  async function api(path, options) {
    options = options || {};
    var response = await fetch(base() + path, {
      method: options.method || "GET",
      headers: headers(Boolean(options.admin), options.headers),
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store"
    });
    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return null;
    return response.json();
  }

  function queryString(opts) {
    opts = opts || {};
    var parts = [];
    if (opts.columns) parts.push("select=" + encodeURIComponent(opts.columns));
    (opts.filters || []).forEach(function (f) { parts.push(f); });
    if (opts.order) parts.push("order=" + encodeURIComponent(opts.order));
    if (opts.limit) parts.push("limit=" + Number(opts.limit));
    return parts.length ? "?" + parts.join("&") : "";
  }

  async function select(table, opts) {
    opts = opts || {};
    return api("/rest/v1/" + encodeURIComponent(table) + queryString(opts), { admin: opts.admin });
  }

  async function insert(table, rows, admin) {
    return api("/rest/v1/" + encodeURIComponent(table), {
      method: "POST",
      admin: admin !== false,
      headers: { "Prefer": "return=representation" },
      body: rows
    });
  }

  async function update(table, id, patch) {
    return api("/rest/v1/" + encodeURIComponent(table) + "?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      admin: true,
      headers: { "Prefer": "return=representation" },
      body: patch
    });
  }

  async function remove(table, id) {
    return api("/rest/v1/" + encodeURIComponent(table) + "?id=eq." + encodeURIComponent(id), {
      method: "DELETE",
      admin: true,
      headers: { "Prefer": "return=representation" }
    });
  }

  async function upsert(table, rows) {
    return api("/rest/v1/" + encodeURIComponent(table), {
      method: "POST",
      admin: true,
      headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
      body: rows
    });
  }

  /* ---------- Authentication ---------- */
  async function signIn(email, password) {
    if (!configured()) throw new Error("Supabase is not configured");
    var response = await fetch(base() + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "apikey": key(), "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(data.error_description || data.msg || data.message || "Invalid email or password");
    }
    var session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
      email: data.user && data.user.email ? data.user.email : email
    };
    saveSession(session);
    return session;
  }

  function signOut() {
    clearSession();
  }

  async function refresh(refreshToken) {
    if (!refreshToken) return null;
    try {
      var response = await fetch(base() + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { "apikey": key(), "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (!response.ok) return null;
      var data = await response.json();
      if (!data.access_token) return null;
      var session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
        email: (data.user && data.user.email) || (readSession() || {}).email || ""
      };
      saveSession(session);
      return session;
    } catch (e) {
      return null;
    }
  }

  async function getUser() {
    if (!configured()) return null;
    var session = readSession();
    if (!session) return null;

    function fetchUser(accessToken) {
      return fetch(base() + "/auth/v1/user", {
        headers: { "apikey": key(), "Authorization": "Bearer " + accessToken },
        cache: "no-store"
      });
    }

    var response = await fetchUser(session.access_token);
    if (!response.ok && session.refresh_token) {
      var renewed = await refresh(session.refresh_token);
      if (renewed) response = await fetchUser(renewed.access_token);
    }
    if (!response.ok) {
      clearSession();
      return null;
    }
    return response.json();
  }

  /* ---------- Storage ---------- */
  function publicUrl(path) {
    if (!path) return "";
    /* Already absolute, repo-relative, or a fallback asset: keep it as-is */
    if (/^(https?:\/\/|assets\/|\/)/i.test(path)) return path;
    return base() + "/storage/v1/object/public/" + bucket() + "/" + path;
  }

  function safeName(name) {
    return String(name || "image")
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(-80);
  }

  function upload(file, folder, onProgress) {
    return new Promise(function (resolve, reject) {
      if (!configured()) { reject(new Error("Supabase is not configured")); return; }
      var session = readSession();
      if (!session) { reject(new Error("Not signed in")); return; }
      var path = (folder || "general") + "/" + Date.now() + "-" + safeName(file.name);
      var xhr = new XMLHttpRequest();
      xhr.open("POST", base() + "/storage/v1/object/" + bucket() + "/" + path);
      xhr.setRequestHeader("apikey", key());
      xhr.setRequestHeader("Authorization", "Bearer " + session.access_token);
      xhr.setRequestHeader("x-upsert", "true");
      if (onProgress) {
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolve(path);
        else {
          var message = "Upload failed (" + xhr.status + ")";
          try { message = JSON.parse(xhr.responseText).message || message; } catch (e) { /* noop */ }
          reject(new Error(message));
        }
      };
      xhr.onerror = function () { reject(new Error("Network error during upload")); };
      var form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });
  }

  function removeFile(path) {
    if (!path || /^https?:\/\//i.test(path)) return Promise.resolve(null);
    return api("/storage/v1/object/" + bucket() + "/" + path, { method: "DELETE", admin: true });
  }

  global.AppSupabase = {
    configured: configured,
    bucket: bucket,
    select: select,
    insert: insert,
    update: update,
    remove: remove,
    upsert: upsert,
    signIn: signIn,
    signOut: signOut,
    getUser: getUser,
    getSession: readSession,
    publicUrl: publicUrl,
    upload: upload,
    removeFile: removeFile
  };
})(window);
