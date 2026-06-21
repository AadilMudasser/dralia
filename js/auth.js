// ============================================================
// AQ Wellness Portal — Shared Auth Helpers
// ============================================================
// Used by client-dashboard.html and admin-dashboard.html to
// guard pages and fetch the logged-in user's profile/role.
// ============================================================

/**
 * Returns the current session's user, or null if not logged in.
 */
async function getCurrentUser() {
  const { data, error } = await sb.auth.getSession();
  if (error || !data.session) return null;
  return data.session.user;
}

/**
 * Fetches the profile row (role, name, etc.) for the current user.
 */
async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }
  return data;
}

/**
 * Guards a page: redirects to index.html if not logged in,
 * or if the user's role doesn't match what's required.
 * requiredRole: "doctor" | "patient"
 */
async function requireRole(requiredRole) {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = "index.html";
    return null;
  }
  if (profile.role !== requiredRole) {
    // Logged in, but wrong portal — send them to their own dashboard.
    window.location.href = profile.role === "doctor"
      ? "admin-dashboard.html"
      : "client-dashboard.html";
    return null;
  }
  return profile;
}

/**
 * Logs the current user out and returns to the homepage.
 */
async function logout() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}

/**
 * Small helper to format dates consistently across the app.
 */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/**
 * Escapes HTML to prevent injection when inserting user-generated
 * text (names, notes, titles) into innerHTML.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Capitalizes the first letter of a string (e.g. "diet" -> "Diet").
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Tiny toast notification system used across all pages.
 */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
