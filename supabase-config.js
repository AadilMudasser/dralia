// ============================================================
// AQ Wellness Portal — Client (Patient) Dashboard Logic
// ============================================================

let currentProfile = null;
let currentPatient = null;

// ---------------- Init ----------------
(async function init() {
  const profile = await requireRole("patient");
  if (!profile) return; // requireRole already redirected
  currentProfile = profile;

  renderSidebarUser(profile);
  renderProfileTab(profile);

  await loadPatientRow();
  await Promise.all([
    loadStats(),
    loadRecentActivity(),
    loadPhotos(),
    loadPlans(),
    loadForms(),
    loadNotes(),
    loadNotifications()
  ]);

  setupTabNav();
  setupPhotoUploads();
  setupNotifPanel();
  setupSidebarToggle();

  document.getElementById("logoutBtn").addEventListener("click", logout);
})();

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function renderSidebarUser(profile) {
  document.getElementById("sidebarName").textContent = profile.full_name || profile.email;
  const av = document.getElementById("sidebarAvatar");
  if (profile.avatar_url) {
    av.innerHTML = `<img src="${escapeHtml(profile.avatar_url)}" alt="avatar" />`;
  } else {
    av.textContent = initials(profile.full_name);
  }
}

async function loadPatientRow() {
  const { data, error } = await sb
    .from("patients")
    .select("*")
    .eq("id", currentProfile.id)
    .single();
  if (!error) currentPatient = data;
}

// ---------------- Tab Navigation ----------------
function setupTabNav() {
  const titles = {
    overview: ["Overview", "Welcome back to your wellness journey"],
    profile: ["My Profile", "Your personal and medical information"],
    photos: ["Progress Photos", "Track your transformation over time"],
    plans: ["Treatment Plans", "Plans assigned by your doctor"],
    forms: ["Forms", "Complete forms assigned to you"],
    notes: ["Consultation Notes", "Notes from your doctor"]
  };

  document.querySelectorAll(".nav-item[data-tab]").forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.dataset.tab;
      document.querySelectorAll(".nav-item[data-tab]").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(`tab-${tab}`).classList.add("active");
      document.getElementById("pageTitle").textContent = titles[tab][0];
      document.getElementById("pageSub").textContent = titles[tab][1];
      closeSidebarMobile();
    });
  });
}

function setupSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  document.getElementById("mobileToggle").addEventListener("click", () => {
    sidebar.classList.add("open");
    backdrop.classList.add("active");
  });
  backdrop.addEventListener("click", closeSidebarMobile);
}
function closeSidebarMobile() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarBackdrop").classList.remove("active");
}

// ---------------- Profile Tab ----------------
function renderProfileTab(profile) {
  document.getElementById("profileName").textContent = profile.full_name || "—";
  document.getElementById("profileEmail").textContent = profile.email || "—";
  document.getElementById("profilePhone").textContent = profile.phone || "No phone on file";
  document.getElementById("profileDob").textContent = formatDate(profile.date_of_birth);
  document.getElementById("profileGender").textContent = profile.gender ? capitalize(profile.gender) : "—";
  document.getElementById("profileAddress").textContent = profile.address || "—";

  const avLg = document.getElementById("profileAvatarLg");
  if (profile.avatar_url) {
    avLg.innerHTML = `<img src="${escapeHtml(profile.avatar_url)}" alt="avatar" />`;
  } else {
    avLg.textContent = initials(profile.full_name);
  }
}

function renderPatientMedicalInfo(patient) {
  if (!patient) return;
  document.getElementById("profileHeight").textContent = patient.height_cm ? `${patient.height_cm} cm` : "—";
  document.getElementById("profileWeight").textContent = patient.weight_kg ? `${patient.weight_kg} kg` : "—";
  document.getElementById("profileGoals").textContent = patient.goals || "No goals recorded yet.";
  document.getElementById("profileMedHistory").textContent = patient.medical_history || "No medical history recorded yet.";
  document.getElementById("profileEmergency").textContent = patient.emergency_contact_name
    ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone || "no phone"})`
    : "—";
}

// ---------------- Stats ----------------
async function loadStats() {
  renderPatientMedicalInfo(currentPatient);

  const [{ count: plansCount }, { count: formsPendingCount }, { count: photosCount }, { count: notesCount }] = await Promise.all([
    sb.from("treatment_plans").select("*", { count: "exact", head: true }).eq("patient_id", currentProfile.id),
    sb.from("forms").select("*", { count: "exact", head: true }).eq("patient_id", currentProfile.id).eq("status", "pending"),
    sb.from("progress_photos").select("*", { count: "exact", head: true }).eq("patient_id", currentProfile.id),
    sb.from("consultation_notes").select("*", { count: "exact", head: true }).eq("patient_id", currentProfile.id)
  ]);

  document.getElementById("statPlans").textContent = plansCount ?? 0;
  document.getElementById("statForms").textContent = formsPendingCount ?? 0;
  document.getElementById("statPhotos").textContent = photosCount ?? 0;
  document.getElementById("statNotes").textContent = notesCount ?? 0;

  const badge = document.getElementById("formsBadge");
  if (formsPendingCount > 0) {
    badge.textContent = formsPendingCount;
    badge.style.display = "inline-flex";
  }
}

// ---------------- Recent Activity ----------------
async function loadRecentActivity() {
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("patient_id", currentProfile.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const wrap = document.getElementById("recentActivityList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No recent activity yet. Updates from your doctor will show up here.");
    return;
  }

  wrap.innerHTML = data.map(n => `
    <div class="list-item">
      <div class="list-item-icon ${iconBg(n.type)}">${iconSvg(n.type)}</div>
      <div class="list-item-body">
        <div class="list-item-title">${escapeHtml(n.title)}</div>
        <div class="list-item-meta">${formatDateTime(n.created_at)}</div>
        ${n.message ? `<div class="list-item-desc">${escapeHtml(n.message)}</div>` : ""}
      </div>
    </div>
  `).join("");
}

function iconBg(type) {
  if (type === "plan") return "";
  if (type === "form") return "";
  return "";
}
function iconSvg(type) {
  const wrap = (svg, bg, fg) => `<div style="width:38px;height:38px;border-radius:10px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;">${svg}</div>`;
  if (type === "plan") return wrap(`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`, "var(--color-pink-soft)", "var(--color-pink-deep)");
  if (type === "form") return wrap(`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`, "var(--color-purple-soft)", "var(--color-purple-deep)");
  if (type === "note") return wrap(`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, "var(--color-pink-soft)", "var(--color-pink-deep)");
  return wrap(`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`, "var(--color-purple-soft)", "var(--color-purple-deep)");
}

function emptyState(text) {
  return `<div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
    <p>${escapeHtml(text)}</p>
  </div>`;
}

// ---------------- Photos ----------------
async function loadPhotos() {
  const { data, error } = await sb
    .from("progress_photos")
    .select("*")
    .eq("patient_id", currentProfile.id)
    .order("uploaded_at", { ascending: false });

  const grid = document.getElementById("photoHistoryGrid");
  if (error || !data || data.length === 0) {
    grid.innerHTML = emptyState("No progress photos uploaded yet.");
    return;
  }

  const tiles = await Promise.all(data.map(async (photo) => {
    const { data: signed } = await sb.storage.from(BUCKETS.PROGRESS_PHOTOS).createSignedUrl(photo.storage_path, 3600);
    const url = signed?.signedUrl || "";
    return `
      <div class="photo-tile">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(photo.photo_type)} photo" loading="lazy" />
        <div class="photo-label">${escapeHtml(photo.photo_type)} · ${formatDate(photo.uploaded_at)}</div>
      </div>
    `;
  }));
  grid.innerHTML = tiles.join("");
}

function setupPhotoUploads() {
  document.querySelectorAll('[data-photo-type]').forEach(input => {
    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const photoType = input.dataset.photoType;
      await uploadProgressPhoto(file, photoType);
      input.value = "";
    });
  });
}

async function uploadProgressPhoto(file, photoType) {
  try {
    const ext = file.name.split(".").pop();
    const path = `${currentProfile.id}/${photoType}-${Date.now()}.${ext}`;

    const { error: uploadError } = await sb.storage
      .from(BUCKETS.PROGRESS_PHOTOS)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { error: dbError } = await sb.from("progress_photos").insert({
      patient_id: currentProfile.id,
      photo_type: photoType,
      storage_path: path
    });

    if (dbError) throw dbError;

    showToast(`${capitalize(photoType)} photo uploaded successfully`);
    await Promise.all([loadPhotos(), loadStats()]);
  } catch (err) {
    console.error(err);
    showToast("Failed to upload photo. Please try again.", "error");
  }
}

// ---------------- Plans ----------------
const PLAN_LABELS = {
  diet: "Diet Plan",
  exercise: "Exercise Plan",
  physiotherapy: "Physiotherapy Plan",
  supplement: "Supplement Plan",
  lifestyle: "Lifestyle Plan"
};

async function loadPlans() {
  const { data, error } = await sb
    .from("treatment_plans")
    .select("*")
    .eq("patient_id", currentProfile.id)
    .order("plan_date", { ascending: false });

  const wrap = document.getElementById("plansList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No treatment plans assigned yet.");
    return;
  }

  const items = await Promise.all(data.map(async (plan) => {
    let attachmentHtml = "";
    if (plan.attachment_path) {
      const { data: signed } = await sb.storage.from(BUCKETS.ATTACHMENTS).createSignedUrl(plan.attachment_path, 3600);
      if (signed?.signedUrl) {
        attachmentHtml = `<a href="${escapeHtml(signed.signedUrl)}" target="_blank" rel="noopener" class="file-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          View Attachment
        </a>`;
      }
    }
    return `
      <div class="list-item">
        <div class="list-item-icon" style="background:var(--color-pink-soft); color:var(--color-pink-deep);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        </div>
        <div class="list-item-body">
          <div class="list-item-title">${escapeHtml(plan.title)} <span class="badge badge-purple">${PLAN_LABELS[plan.plan_type] || capitalize(plan.plan_type)}</span></div>
          <div class="list-item-meta">${formatDate(plan.plan_date)}</div>
          ${plan.description ? `<div class="list-item-desc">${escapeHtml(plan.description)}</div>` : ""}
          ${attachmentHtml}
        </div>
      </div>
    `;
  }));
  wrap.innerHTML = items.join("");
}

// ---------------- Forms ----------------
async function loadForms() {
  const { data, error } = await sb
    .from("forms")
    .select("*")
    .eq("patient_id", currentProfile.id)
    .order("assigned_at", { ascending: false });

  const wrap = document.getElementById("formsList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No forms assigned yet.");
    return;
  }

  wrap.innerHTML = data.map(form => `
    <div class="list-item">
      <div class="list-item-icon" style="background:var(--color-purple-soft); color:var(--color-purple-deep);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      </div>
      <div class="list-item-body">
        <div class="list-item-title">${escapeHtml(form.title)}
          ${form.status === "completed"
            ? '<span class="badge badge-green">Completed</span>'
            : '<span class="badge badge-amber">Pending</span>'}
        </div>
        <div class="list-item-meta">Assigned ${formatDate(form.assigned_at)}${form.completed_at ? ` · Completed ${formatDate(form.completed_at)}` : ""}</div>
      </div>
      <div class="list-item-actions">
        <a href="${escapeHtml(form.form_url)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Open Form</a>
        ${form.status === "pending" ? `<button class="btn btn-primary btn-sm" data-mark-complete="${form.id}">Mark Complete</button>` : ""}
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-mark-complete]").forEach(btn => {
    btn.addEventListener("click", () => markFormComplete(btn.dataset.markComplete, btn));
  });
}

async function markFormComplete(formId, btnEl) {
  btnEl.disabled = true;
  btnEl.textContent = "Saving...";
  const { error } = await sb
    .from("forms")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", formId)
    .eq("patient_id", currentProfile.id);

  if (error) {
    showToast("Couldn't mark form complete. Try again.", "error");
    btnEl.disabled = false;
    btnEl.textContent = "Mark Complete";
    return;
  }
  showToast("Form marked as completed");
  await Promise.all([loadForms(), loadStats()]);
}

// ---------------- Notes ----------------
async function loadNotes() {
  const { data, error } = await sb
    .from("consultation_notes")
    .select("*")
    .eq("patient_id", currentProfile.id)
    .order("created_at", { ascending: false });

  const wrap = document.getElementById("notesList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No consultation notes yet.");
    return;
  }

  wrap.innerHTML = data.map(note => `
    <div class="list-item">
      <div class="list-item-icon" style="background:var(--color-pink-soft); color:var(--color-pink-deep);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="list-item-body">
        <div class="list-item-title">Consultation Note</div>
        <div class="list-item-meta">${formatDateTime(note.created_at)}</div>
        <div class="list-item-desc">${escapeHtml(note.note)}</div>
      </div>
    </div>
  `).join("");
}

// ---------------- Notifications ----------------
async function loadNotifications() {
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("patient_id", currentProfile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const list = document.getElementById("notifList");
  const dot = document.getElementById("notifDot");

  if (error || !data || data.length === 0) {
    list.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
    dot.classList.remove("active");
    return;
  }

  const unreadCount = data.filter(n => !n.is_read).length;
  dot.classList.toggle("active", unreadCount > 0);

  list.innerHTML = data.map(n => `
    <div class="notif-item ${n.is_read ? "" : "unread"}">
      <div class="ni-title">${escapeHtml(n.title)}</div>
      ${n.message ? `<div class="ni-msg">${escapeHtml(n.message)}</div>` : ""}
      <div class="ni-time">${formatDateTime(n.created_at)}</div>
    </div>
  `).join("");
}

function setupNotifPanel() {
  const bell = document.getElementById("notifBell");
  const panel = document.getElementById("notifPanel");
  bell.addEventListener("click", () => panel.classList.toggle("active"));
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !bell.contains(e.target)) {
      panel.classList.remove("active");
    }
  });
  document.getElementById("markAllReadBtn").addEventListener("click", async () => {
    await sb.from("notifications").update({ is_read: true }).eq("patient_id", currentProfile.id).eq("is_read", false);
    await loadNotifications();
    showToast("All notifications marked as read");
  });
}

// Live updates: refresh relevant sections when the doctor adds new content.
sb.channel("patient-updates")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
    if (currentProfile && payload.new.patient_id === currentProfile.id) {
      loadNotifications();
      showToast(payload.new.title || "You have a new update");
    }
  })
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "treatment_plans" }, (payload) => {
    if (currentProfile && payload.new.patient_id === currentProfile.id) { loadPlans(); loadStats(); }
  })
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "forms" }, (payload) => {
    if (currentProfile && payload.new.patient_id === currentProfile.id) { loadForms(); loadStats(); }
  })
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "consultation_notes" }, (payload) => {
    if (currentProfile && payload.new.patient_id === currentProfile.id) { loadNotes(); loadStats(); }
  })
  .subscribe();
