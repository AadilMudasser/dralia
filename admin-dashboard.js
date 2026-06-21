/* ============================================================
   AQ Wellness Portal — Global Styles
   Theme: white / off-white / soft pink / soft purple
   ============================================================ */

:root {
  --color-bg: #faf8fb;
  --color-bg-alt: #ffffff;
  --color-pink: #f7d9e3;
  --color-pink-soft: #fdf0f4;
  --color-pink-deep: #e8a4bb;
  --color-purple: #d9cdf2;
  --color-purple-soft: #f3effc;
  --color-purple-deep: #9b7fd1;
  --color-accent: #8a63c9;
  --color-accent-dark: #6e4bb0;
  --color-text: #2e2a35;
  --color-text-muted: #79737f;
  --color-text-faint: #aaa3b0;
  --color-border: #ece6f0;
  --color-success: #6fbf8b;
  --color-warning: #e8b563;
  --color-danger: #e2727a;
  --shadow-sm: 0 1px 3px rgba(110, 75, 176, 0.08);
  --shadow-md: 0 4px 16px rgba(110, 75, 176, 0.10);
  --shadow-lg: 0 12px 32px rgba(110, 75, 176, 0.14);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --sidebar-width: 248px;
  --font-main: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  font-family: var(--font-main);
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }
input, select, textarea { font-family: inherit; }
img { max-width: 100%; display: block; }
ul { list-style: none; }

/* ---------------- Scrollbar ---------------- */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-purple); border-radius: 8px; }

/* ============================================================
   Landing / Login page
   ============================================================ */

.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at 12% 18%, var(--color-pink-soft) 0%, transparent 45%),
    radial-gradient(circle at 88% 82%, var(--color-purple-soft) 0%, transparent 50%),
    var(--color-bg);
}

.landing-brand {
  text-align: center;
  margin-bottom: 36px;
}

.landing-logo {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--color-pink-deep), var(--color-purple-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: var(--shadow-md);
}

.landing-logo svg { width: 32px; height: 32px; }

.landing-brand h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}

.landing-brand p {
  color: var(--color-text-muted);
  margin-top: 6px;
  font-size: 15px;
}

.landing-card {
  width: 100%;
  max-width: 880px;
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--color-border);
}

.portal-choice {
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  transition: background 0.2s ease;
}

.portal-choice:first-child {
  background: var(--color-pink-soft);
  border-right: 1px solid var(--color-border);
}

.portal-choice:last-child {
  background: var(--color-purple-soft);
}

.portal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-bg-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  margin-bottom: 6px;
}

.portal-icon svg { width: 26px; height: 26px; color: var(--color-accent); }

.portal-choice h2 { font-size: 19px; font-weight: 600; }
.portal-choice p { font-size: 13.5px; color: var(--color-text-muted); max-width: 220px; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 14.5px;
  font-weight: 600;
  border: none;
  transition: all 0.18s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-dark));
  color: #fff;
  box-shadow: 0 4px 12px rgba(138, 99, 201, 0.32);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(138, 99, 201, 0.4); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: var(--color-bg-alt);
  color: var(--color-accent-dark);
  border: 1.5px solid var(--color-purple);
}
.btn-secondary:hover { background: var(--color-purple-soft); }

.btn-danger { background: var(--color-danger); color: #fff; }
.btn-danger:hover { opacity: 0.9; }

.btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.btn-ghost:hover { background: var(--color-bg); }

.btn-sm { padding: 7px 14px; font-size: 13px; }
.btn-block { width: 100%; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

/* ---------------- Login Modal/Form ---------------- */

.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(46, 42, 53, 0.45);
  backdrop-filter: blur(3px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.login-overlay.active { display: flex; }

.login-box {
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 380px;
  padding: 32px;
  position: relative;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-box-close {
  position: absolute;
  top: 16px; right: 16px;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--color-bg);
  border: none;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted);
  font-size: 18px;
}
.login-box-close:hover { background: var(--color-pink-soft); }

.login-box h2 { font-size: 20px; margin-bottom: 4px; }
.login-box .subtitle { color: var(--color-text-muted); font-size: 13.5px; margin-bottom: 22px; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.15s ease;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-purple-deep);
  background: var(--color-bg-alt);
}
.form-group textarea { resize: vertical; min-height: 90px; }
.form-hint { font-size: 12px; color: var(--color-text-faint); margin-top: 4px; }
.form-error {
  background: #fdecee;
  color: #c0454f;
  border: 1px solid #f5c6cb;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 16px;
  display: none;
}
.form-error.active { display: block; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ============================================================
   Dashboard Layout (Sidebar + Main)
   ============================================================ */

.app-shell { display: flex; min-height: 100vh; }

.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--color-bg-alt);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
  transition: transform 0.25s ease;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-brand .logo-dot {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-pink-deep), var(--color-purple-deep));
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.sidebar-brand .logo-dot svg { width: 18px; height: 18px; color: #fff; }
.sidebar-brand .brand-text { line-height: 1.25; }
.sidebar-brand .brand-text strong { font-size: 14.5px; display: block; }
.sidebar-brand .brand-text span { font-size: 11px; color: var(--color-text-muted); }

.sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 3px;
  transition: all 0.15s ease;
  position: relative;
}
.sidebar-nav .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
.sidebar-nav .nav-item:hover { background: var(--color-pink-soft); color: var(--color-text); }
.sidebar-nav .nav-item.active {
  background: linear-gradient(135deg, var(--color-purple-soft), var(--color-pink-soft));
  color: var(--color-accent-dark);
  font-weight: 600;
}
.nav-badge {
  margin-left: auto;
  background: var(--color-danger);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.sidebar-footer { padding: 16px; border-top: 1px solid var(--color-border); }
.sidebar-user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sidebar-user .avatar-sm {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--color-purple-soft);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: var(--color-accent-dark); font-size: 14px;
  overflow: hidden; flex-shrink: 0;
}
.sidebar-user .avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
.sidebar-user .u-name { font-size: 13.5px; font-weight: 600; line-height: 1.2; }
.sidebar-user .u-role { font-size: 11.5px; color: var(--color-text-muted); }

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 28px 36px 60px;
  max-width: 100%;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}
.topbar h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.3px; }
.topbar .topbar-sub { color: var(--color-text-muted); font-size: 13.5px; margin-top: 2px; }
.topbar-actions { display: flex; align-items: center; gap: 12px; }

.mobile-toggle {
  display: none;
  width: 38px; height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  align-items: center; justify-content: center;
}

.notif-bell {
  position: relative;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
}
.notif-bell svg { width: 18px; height: 18px; color: var(--color-text-muted); }
.notif-bell .dot {
  position: absolute; top: 6px; right: 7px;
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--color-danger);
  border: 2px solid var(--color-bg-alt);
  display: none;
}
.notif-bell .dot.active { display: block; }

.notif-panel {
  position: absolute;
  top: 56px; right: 36px;
  width: 340px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  display: none;
  z-index: 60;
}
.notif-panel.active { display: block; }
.notif-panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 700;
  font-size: 14px;
  display: flex; justify-content: space-between; align-items: center;
}
.notif-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: default;
}
.notif-item:last-child { border-bottom: none; }
.notif-item.unread { background: var(--color-pink-soft); }
.notif-item .ni-title { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; }
.notif-item .ni-msg { font-size: 12.5px; color: var(--color-text-muted); }
.notif-item .ni-time { font-size: 11px; color: var(--color-text-faint); margin-top: 4px; }
.notif-empty { padding: 28px 16px; text-align: center; color: var(--color-text-faint); font-size: 13px; }

/* ============================================================
   Cards / Stats / Tables — shared components
   ============================================================ */

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.stat-card .stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.stat-card .stat-icon svg { width: 18px; height: 18px; }
.stat-card .stat-icon.pink { background: var(--color-pink-soft); color: var(--color-pink-deep); }
.stat-card .stat-icon.purple { background: var(--color-purple-soft); color: var(--color-purple-deep); }
.stat-card .stat-value { font-size: 26px; font-weight: 700; }
.stat-card .stat-label { font-size: 12.5px; color: var(--color-text-muted); margin-top: 2px; }

.card {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 22px;
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.card-header h3 { font-size: 16px; font-weight: 700; }
.card-header .card-sub { font-size: 12.5px; color: var(--color-text-muted); margin-top: 2px; }

.section-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; }

/* Tables */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
thead th {
  text-align: left;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-faint);
  font-weight: 700;
  padding: 0 12px 10px;
  border-bottom: 1.5px solid var(--color-border);
}
tbody td { padding: 13px 12px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: var(--color-pink-soft); cursor: pointer; }

.table-avatar {
  display: flex; align-items: center; gap: 10px;
}
.table-avatar .avatar-sm {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-purple-soft);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: var(--color-accent-dark); font-size: 12.5px;
  overflow: hidden; flex-shrink: 0;
}
.table-avatar .avatar-sm img { width: 100%; height: 100%; object-fit: cover; }

.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
}
.badge-pink { background: var(--color-pink-soft); color: var(--color-pink-deep); }
.badge-purple { background: var(--color-purple-soft); color: var(--color-purple-deep); }
.badge-green { background: #e7f6ec; color: #4d9d6c; }
.badge-amber { background: #fdf2e0; color: #c08838; }
.badge-gray { background: #f1f0f3; color: var(--color-text-muted); }
.badge-red { background: #fdecee; color: #c0454f; }

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--color-text-faint);
}
.empty-state svg { width: 44px; height: 44px; margin: 0 auto 12px; opacity: 0.5; }
.empty-state p { font-size: 13.5px; }

/* List items (forms, plans, notes, photos) */
.list-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  margin-bottom: 10px;
  transition: box-shadow 0.15s ease;
}
.list-item:hover { box-shadow: var(--shadow-sm); }
.list-item-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.list-item-icon svg { width: 18px; height: 18px; }
.list-item-body { flex: 1; min-width: 0; }
.list-item-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
.list-item-meta { font-size: 12px; color: var(--color-text-muted); }
.list-item-desc { font-size: 13px; color: var(--color-text-muted); margin-top: 6px; line-height: 1.5; }
.list-item-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }

/* Photo grid */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
}
.photo-tile {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 3/4;
  background: var(--color-purple-soft);
  border: 1px solid var(--color-border);
}
.photo-tile img { width: 100%; height: 100%; object-fit: cover; }
.photo-tile .photo-label {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.55));
  color: #fff; font-size: 11px; font-weight: 600;
  padding: 16px 8px 6px;
  text-transform: capitalize;
}
.photo-upload-tile {
  border: 2px dashed var(--color-purple);
  border-radius: var(--radius-sm);
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-accent-dark);
  background: var(--color-purple-soft);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  padding: 10px;
}
.photo-upload-tile svg { width: 22px; height: 22px; }
.photo-upload-tile input { display: none; }

/* Tabs */
.tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--color-border); margin-bottom: 20px; overflow-x: auto; }
.tab-btn {
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  white-space: nowrap;
}
.tab-btn.active { color: var(--color-accent-dark); border-bottom-color: var(--color-accent-dark); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* Search/filter bar */
.search-bar {
  display: flex; gap: 10px; align-items: center; margin-bottom: 18px; flex-wrap: wrap;
}
.search-input-wrap { position: relative; flex: 1; min-width: 220px; }
.search-input-wrap svg {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; color: var(--color-text-faint);
}
.search-input-wrap input { padding-left: 38px; }

/* Modal (generic, used for add/edit patient, plan, note forms) */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(46, 42, 53, 0.45);
  backdrop-filter: blur(3px);
  display: none;
  align-items: flex-start;
  justify-content: center;
  z-index: 200;
  padding: 40px 20px;
  overflow-y: auto;
}
.modal-overlay.active { display: flex; }
.modal-box {
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 560px;
  padding: 28px;
  position: relative;
  animation: slideUp 0.22s ease;
}
.modal-box.modal-lg { max-width: 760px; }
.modal-close {
  position: absolute; top: 18px; right: 18px;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-bg); border: none;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted); font-size: 18px;
}
.modal-close:hover { background: var(--color-pink-soft); }
.modal-box h2 { font-size: 19px; margin-bottom: 18px; padding-right: 24px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

/* Patient profile header */
.profile-header {
  display: flex; align-items: center; gap: 18px;
  margin-bottom: 24px; flex-wrap: wrap;
}
.profile-header .avatar-lg {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-pink-soft), var(--color-purple-soft));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 24px; color: var(--color-accent-dark);
  overflow: hidden; flex-shrink: 0; border: 3px solid var(--color-bg-alt); box-shadow: var(--shadow-sm);
}
.profile-header .avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.profile-header .profile-meta h2 { font-size: 21px; margin-bottom: 4px; }
.profile-header .profile-meta .pm-row { display: flex; gap: 14px; flex-wrap: wrap; font-size: 13px; color: var(--color-text-muted); }
.profile-header .profile-actions { margin-left: auto; display: flex; gap: 10px; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.info-item .info-label { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--color-text-faint); font-weight: 700; margin-bottom: 4px; }
.info-item .info-value { font-size: 14.5px; font-weight: 500; }

/* Loading spinner */
.spinner {
  width: 22px; height: 22px;
  border: 3px solid var(--color-purple-soft);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-wrap { display: flex; align-items: center; justify-content: center; padding: 40px; }

/* Toasts */
#toast-container {
  position: fixed; bottom: 24px; right: 24px;
  z-index: 999; display: flex; flex-direction: column; gap: 10px;
}
.toast {
  background: var(--color-text);
  color: #fff;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.25s ease;
}
.toast.show { opacity: 1; transform: translateY(0); }
.toast-success { background: #3f8f5e; }
.toast-error { background: #c0454f; }

/* File link chip */
.file-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  background: var(--color-purple-soft);
  color: var(--color-accent-dark);
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  margin-top: 8px;
}
.file-chip svg { width: 13px; height: 13px; }

/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); box-shadow: var(--shadow-lg); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin-left: 0; padding: 22px 18px 50px; }
  .mobile-toggle { display: flex; }
  .section-grid { grid-template-columns: 1fr; }
  .notif-panel { right: 18px; width: calc(100% - 36px); max-width: 360px; }
}

@media (max-width: 700px) {
  .landing-card { grid-template-columns: 1fr; }
  .portal-choice:first-child { border-right: none; border-bottom: 1px solid var(--color-border); }
  .form-row { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .stat-grid { grid-template-columns: 1fr; }
  .topbar h1 { font-size: 20px; }
  .profile-header .profile-actions { margin-left: 0; width: 100%; }
}

/* Sidebar overlay backdrop for mobile */
.sidebar-backdrop {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 40;
}
.sidebar-backdrop.active { display: block; }
