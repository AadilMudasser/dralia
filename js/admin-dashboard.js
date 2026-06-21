// ============================================================
// AQ Wellness Portal — Admin (Doctor) Dashboard Logic
// ============================================================

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-patient`;

let doctorProfile = null;
let allPatients = [];
let currentViewedPatientId = null;

// ---------------- Init ----------------
(async function init() {
  const profile = await requireRole("doctor");
  if (!profile) return;
  doctorProfile = profile;

  renderSidebarUser(profile);

  await Promise.all([
    loadDashboardStats(),
    loadRecentActivity(),
    loadRecentPatients(),
    loadPatientsTable(),
    loadNotifications()
  ]);

  setupViewNav();
  setupSidebarToggle();
  setupNotifPanel();
  setupPatientSearch();
  setupModals();

  document.getElementById("logoutBtn").addEventListener("click", logout);
})();

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function renderSidebarUser(profile) {
  document.getElementById("sidebarName").textContent = profile.full_name || profile.email;
  document.getElementById("sidebarAvatar").textContent = initials(profile.full_name);
  document.getElementById("pageSub").textContent = `Welcome back, ${profile.full_name || "Doctor"}`;
}

function emptyState(text) {
  return `<div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
    <p>${escapeHtml(text)}</p>
  </div>`;
}

// ---------------- View Navigation ----------------
function setupViewNav() {
  const titles = {
    dashboard: ["Dashboard", `Welcome back, ${doctorProfile.full_name || "Doctor"}`],
    patients: ["Patients", "Manage all your patients"]
  };

  document.querySelectorAll(".nav-item[data-view]").forEach(item => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });

  document.getElementById("backToPatientsBtn").addEventListener("click", () => switchView("patients"));

  function switchView(view) {
    document.querySelectorAll(".nav-item[data-view]").forEach(i => i.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (navItem) navItem.classList.add("active");

    document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(`view-${view}`).classList.add("active");

    if (titles[view]) {
      document.getElementById("pageTitle").textContent = titles[view][0];
      document.getElementById("pageSub").textContent = titles[view][1];
    }
    closeSidebarMobile();
  }
  window.switchView = switchView;
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

// ---------------- Dashboard Stats ----------------
async function loadDashboardStats() {
  const [{ count: patientsCount }, { count: pendingForms }, { count: activePlans }, { count: photosCount }] = await Promise.all([
    sb.from("patients").select("*", { count: "exact", head: true }),
    sb.from("forms").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("treatment_plans").select("*", { count: "exact", head: true }),
    sb.from("progress_photos").select("*", { count: "exact", head: true })
  ]);
  document.getElementById("statTotalPatients").textContent = patientsCount ?? 0;
  document.getElementById("statPendingForms").textContent = pendingForms ?? 0;
  document.getElementById("statActivePlans").textContent = activePlans ?? 0;
  document.getElementById("statTotalPhotos").textContent = photosCount ?? 0;
}

async function loadRecentActivity() {
  const { data, error } = await sb
    .from("notifications")
    .select("*, patients(id, profiles(full_name))")
    .order("created_at", { ascending: false })
    .limit(8);

  const wrap = document.getElementById("recentActivityList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No recent activity yet.");
    return;
  }
  wrap.innerHTML = data.map(n => `
    <div class="list-item">
      <div class="list-item-icon" style="background:var(--color-pink-soft); color:var(--color-pink-deep);">${iconSvgRaw(n.type)}</div>
      <div class="list-item-body">
        <div class="list-item-title">${escapeHtml(n.title)}</div>
        <div class="list-item-meta">${formatDateTime(n.created_at)}</div>
      </div>
    </div>
  `).join("");
}

function iconSvgRaw(type) {
  if (type === "plan") return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`;
  if (type === "form") return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
  if (type === "note") return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`;
}

async function loadRecentPatients() {
  const { data, error } = await sb
    .from("patients")
    .select("id, status, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(6);

  const wrap = document.getElementById("recentPatientsList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No patients added yet.");
    return;
  }
  wrap.innerHTML = data.map(p => `
    <div class="list-item" data-open-patient="${p.id}" style="cursor:pointer;">
      <div class="table-avatar">
        <div class="avatar-sm">${initials(p.profiles?.full_name)}</div>
      </div>
      <div class="list-item-body">
        <div class="list-item-title">${escapeHtml(p.profiles?.full_name || "Unnamed")}</div>
        <div class="list-item-meta">${escapeHtml(p.profiles?.email || "")} · Joined ${formatDate(p.created_at)}</div>
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-open-patient]").forEach(el => {
    el.addEventListener("click", () => openPatientProfile(el.dataset.openPatient));
  });
}

// ---------------- Patients Table ----------------
async function loadPatientsTable() {
  const { data, error } = await sb
    .from("patients")
    .select("id, status, created_at, profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }
  allPatients = data || [];
  renderPatientsTable(allPatients);
}

function renderPatientsTable(patients) {
  const tbody = document.getElementById("patientsTableBody");
  if (!patients || patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">${emptyState("No patients found.")}</td></tr>`;
    return;
  }
  tbody.innerHTML = patients.map(p => `
    <tr data-open-patient="${p.id}">
      <td>
        <div class="table-avatar">
          <div class="avatar-sm">${initials(p.profiles?.full_name)}</div>
          <span>${escapeHtml(p.profiles?.full_name || "Unnamed")}</span>
        </div>
      </td>
      <td>
        <div style="font-size:13px;">${escapeHtml(p.profiles?.email || "—")}</div>
        <div style="font-size:12px; color:var(--color-text-muted);">${escapeHtml(p.profiles?.phone || "")}</div>
      </td>
      <td><span class="badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}">${capitalize(p.status)}</span></td>
      <td style="font-size:13px; color:var(--color-text-muted);">${formatDate(p.created_at)}</td>
      <td><button class="btn btn-secondary btn-sm" data-view-patient="${p.id}">View</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll("tr[data-open-patient]").forEach(row => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openPatientProfile(row.dataset.openPatient);
    });
  });
  tbody.querySelectorAll("[data-view-patient]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openPatientProfile(btn.dataset.viewPatient);
    });
  });
}

function setupPatientSearch() {
  const searchInput = document.getElementById("patientSearch");
  const statusFilter = document.getElementById("statusFilter");

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const filtered = allPatients.filter(p => {
      const matchesQ = !q || (p.profiles?.full_name || "").toLowerCase().includes(q) || (p.profiles?.email || "").toLowerCase().includes(q);
      const matchesStatus = !status || p.status === status;
      return matchesQ && matchesStatus;
    });
    renderPatientsTable(filtered);
  }

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
}

// ---------------- Patient Profile View ----------------
async function openPatientProfile(patientId) {
  currentViewedPatientId = patientId;
  switchView("patient-profile");

  const { data: patient, error } = await sb
    .from("patients")
    .select("*, profiles(*)")
    .eq("id", patientId)
    .single();

  if (error || !patient) {
    showToast("Couldn't load patient profile", "error");
    switchView("patients");
    return;
  }

  renderPatientProfileHeader(patient);
  setupPatientTabs();

  await Promise.all([
    loadPatientPhotos(patientId),
    loadPatientPlans(patientId),
    loadPatientForms(patientId),
    loadPatientNotes(patientId)
  ]);
}

function renderPatientProfileHeader(patient) {
  const profile = patient.profiles;
  document.getElementById("ppName").textContent = profile.full_name || "—";
  document.getElementById("ppEmail").textContent = profile.email || "—";
  document.getElementById("ppPhone").textContent = profile.phone || "No phone";
  document.getElementById("ppAvatar").textContent = initials(profile.full_name);
  document.getElementById("ppStatusBadge").innerHTML = `<span class="badge ${patient.status === 'active' ? 'badge-green' : 'badge-gray'}">${capitalize(patient.status)}</span>`;

  document.getElementById("ppDob").textContent = formatDate(profile.date_of_birth);
  document.getElementById("ppGender").textContent = profile.gender ? capitalize(profile.gender) : "—";
  document.getElementById("ppHeight").textContent = patient.height_cm ? `${patient.height_cm} cm` : "—";
  document.getElementById("ppWeight").textContent = patient.weight_kg ? `${patient.weight_kg} kg` : "—";
  document.getElementById("ppAddress").textContent = profile.address || "—";
  document.getElementById("ppEmergency").textContent = patient.emergency_contact_name
    ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone || "no phone"})`
    : "—";
  document.getElementById("ppGoals").textContent = patient.goals || "No goals recorded yet.";
  document.getElementById("ppMedHistory").textContent = patient.medical_history || "No medical history recorded yet.";

  document.getElementById("editPatientBtn").onclick = () => openPatientModal(patient);
}

function setupPatientTabs() {
  document.querySelectorAll(".tab-btn[data-ptab]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab-btn[data-ptab]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll("#view-patient-profile .tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(`ptab-${btn.dataset.ptab}`).classList.add("active");
    };
  });
}

async function loadPatientPhotos(patientId) {
  const { data, error } = await sb
    .from("progress_photos")
    .select("*")
    .eq("patient_id", patientId)
    .order("uploaded_at", { ascending: false });

  const grid = document.getElementById("ppPhotoGrid");
  if (error || !data || data.length === 0) {
    grid.innerHTML = emptyState("No progress photos uploaded yet.");
    return;
  }
  const tiles = await Promise.all(data.map(async (photo) => {
    const { data: signed } = await sb.storage.from(BUCKETS.PROGRESS_PHOTOS).createSignedUrl(photo.storage_path, 3600);
    return `
      <div class="photo-tile">
        <img src="${escapeHtml(signed?.signedUrl || "")}" alt="${escapeHtml(photo.photo_type)}" loading="lazy" />
        <div class="photo-label">${escapeHtml(photo.photo_type)} · ${formatDate(photo.uploaded_at)}</div>
      </div>
    `;
  }));
  grid.innerHTML = tiles.join("");
}

const PLAN_LABELS = {
  diet: "Diet Plan", exercise: "Exercise Plan", physiotherapy: "Physiotherapy Plan",
  supplement: "Supplement Plan", lifestyle: "Lifestyle Plan"
};

async function loadPatientPlans(patientId) {
  const { data, error } = await sb
    .from("treatment_plans")
    .select("*")
    .eq("patient_id", patientId)
    .order("plan_date", { ascending: false });

  const wrap = document.getElementById("ppPlansList");
  if (error || !data || data.length === 0) {
    wrap.innerHTML = emptyState("No treatment plans yet.");
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
        <div class="list-item-actions">
          <button class="btn btn-ghost btn-sm" data-delete-plan="${plan.id}">Delete</button>
        </div>
      </div>
    `;
  }));
  wrap.innerHTML = items.join("");

  wrap.querySelectorAll("[data-delete-plan]").forEach(btn => {
    btn.addEventListener("click", () => deletePlan(btn.dataset.deletePlan));
  });
}

async function deletePlan(planId) {
  if (!confirm("Delete this treatment plan? This cannot be undone.")) return;
  const { error } = await sb.from("treatment_plans").delete().eq("id", planId);
  if (error) { showToast("Couldn't delete plan", "error"); return; }
  showToast("Plan deleted");
  await Promise.all([loadPatientPlans(currentViewedPatientId), loadDashboardStats()]);
}

async function loadPatientForms(patientId) {
  const { data, error } = await sb
    .from("forms")
    .select("*")
    .eq("patient_id", patientId)
    .order("assigned_at", { ascending: false });

  const wrap = document.getElementById("ppFormsList");
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
          ${form.status === "completed" ? '<span class="badge badge-green">Completed</span>' : '<span class="badge badge-amber">Pending</span>'}
        </div>
        <div class="list-item-meta">Assigned ${formatDate(form.assigned_at)}${form.completed_at ? ` · Completed ${formatDate(form.completed_at)}` : ""}</div>
      </div>
      <div class="list-item-actions">
        <a href="${escapeHtml(form.form_url)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Open</a>
        <button class="btn btn-ghost btn-sm" data-delete-form="${form.id}">Delete</button>
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-delete-form]").forEach(btn => {
    btn.addEventListener("click", () => deleteForm(btn.dataset.deleteForm));
  });
}

async function deleteForm(formId) {
  if (!confirm("Delete this form assignment?")) return;
  const { error } = await sb.from("forms").delete().eq("id", formId);
  if (error) { showToast("Couldn't delete form", "error"); return; }
  showToast("Form deleted");
  await Promise.all([loadPatientForms(currentViewedPatientId), loadDashboardStats()]);
}

async function loadPatientNotes(patientId) {
  const { data, error } = await sb
    .from("consultation_notes")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  const wrap = document.getElementById("ppNotesList");
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
      <div class="list-item-actions">
        <button class="btn btn-ghost btn-sm" data-delete-note="${note.id}">Delete</button>
      </div>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-delete-note]").forEach(btn => {
    btn.addEventListener("click", () => deleteNote(btn.dataset.deleteNote));
  });
}

async function deleteNote(noteId) {
  if (!confirm("Delete this consultation note?")) return;
  const { error } = await sb.from("consultation_notes").delete().eq("id", noteId);
  if (error) { showToast("Couldn't delete note", "error"); return; }
  showToast("Note deleted");
  await loadPatientNotes(currentViewedPatientId);
}

// ---------------- Modals ----------------
function setupModals() {
  document.querySelectorAll("[data-modal-close]").forEach(el => {
    el.addEventListener("click", () => closeAllModals());
  });
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeAllModals(); });
  });

  document.getElementById("addPatientBtn").addEventListener("click", () => openPatientModal());
  document.getElementById("addPlanBtn").addEventListener("click", () => openPlanModal());
  document.getElementById("addFormBtn").addEventListener("click", () => openFormModal());
  document.getElementById("addNoteBtn").addEventListener("click", () => openNoteModal());

  document.getElementById("patientForm").addEventListener("submit", handlePatientFormSubmit);
  document.getElementById("planForm").addEventListener("submit", handlePlanFormSubmit);
  document.getElementById("formAssignForm").addEventListener("submit", handleFormAssignSubmit);
  document.getElementById("noteForm").addEventListener("submit", handleNoteFormSubmit);
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(o => o.classList.remove("active"));
  document.querySelectorAll(".form-error").forEach(e => e.classList.remove("active"));
}

// --- Patient Add/Edit Modal ---
function openPatientModal(patient = null) {
  const form = document.getElementById("patientForm");
  form.reset();
  document.getElementById("patientModalError").classList.remove("active");

  if (patient) {
    document.getElementById("patientModalTitle").textContent = "Edit Patient";
    document.getElementById("patientFormId").value = patient.id;
    document.getElementById("pfFullName").value = patient.profiles.full_name || "";
    document.getElementById("pfEmail").value = patient.profiles.email || "";
    document.getElementById("pfEmail").disabled = true;
    document.getElementById("pfPasswordGroup").style.display = "none";
    document.getElementById("pfPassword").required = false;
    document.getElementById("pfPhone").value = patient.profiles.phone || "";
    document.getElementById("pfDob").value = patient.profiles.date_of_birth || "";
    document.getElementById("pfGender").value = patient.profiles.gender || "";
    document.getElementById("pfAddress").value = patient.profiles.address || "";
    document.getElementById("pfHeight").value = patient.height_cm || "";
    document.getElementById("pfWeight").value = patient.weight_kg || "";
    document.getElementById("pfEmergencyName").value = patient.emergency_contact_name || "";
    document.getElementById("pfEmergencyPhone").value = patient.emergency_contact_phone || "";
    document.getElementById("pfGoals").value = patient.goals || "";
    document.getElementById("pfMedHistory").value = patient.medical_history || "";
    document.getElementById("pfStatus").value = patient.status || "active";
  } else {
    document.getElementById("patientModalTitle").textContent = "Add New Patient";
    document.getElementById("patientFormId").value = "";
    document.getElementById("pfEmail").disabled = false;
    document.getElementById("pfPasswordGroup").style.display = "block";
    document.getElementById("pfPassword").required = true;
  }

  document.getElementById("patientModal").classList.add("active");
}

async function handlePatientFormSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById("patientModalError");
  errorEl.classList.remove("active");
  const submitBtn = document.getElementById("patientFormSubmit");
  submitBtn.disabled = true;

  const id = document.getElementById("patientFormId").value;
  const payload = {
    full_name: document.getElementById("pfFullName").value.trim(),
    email: document.getElementById("pfEmail").value.trim(),
    phone: document.getElementById("pfPhone").value.trim() || null,
    date_of_birth: document.getElementById("pfDob").value || null,
    gender: document.getElementById("pfGender").value || null,
    address: document.getElementById("pfAddress").value.trim() || null,
    height_cm: document.getElementById("pfHeight").value || null,
    weight_kg: document.getElementById("pfWeight").value || null,
    emergency_contact_name: document.getElementById("pfEmergencyName").value.trim() || null,
    emergency_contact_phone: document.getElementById("pfEmergencyPhone").value.trim() || null,
    goals: document.getElementById("pfGoals").value.trim() || null,
    medical_history: document.getElementById("pfMedHistory").value.trim() || null,
    status: document.getElementById("pfStatus").value
  };

  try {
    if (id) {
      // Edit existing patient
      const { error: profileErr } = await sb.from("profiles").update({
        full_name: payload.full_name, phone: payload.phone, date_of_birth: payload.date_of_birth,
        gender: payload.gender, address: payload.address
      }).eq("id", id);
      if (profileErr) throw profileErr;

      const { error: patientErr } = await sb.from("patients").update({
        height_cm: payload.height_cm, weight_kg: payload.weight_kg,
        emergency_contact_name: payload.emergency_contact_name, emergency_contact_phone: payload.emergency_contact_phone,
        goals: payload.goals, medical_history: payload.medical_history, status: payload.status
      }).eq("id", id);
      if (patientErr) throw patientErr;

      showToast("Patient updated successfully");
      closeAllModals();
      await Promise.all([loadPatientsTable(), openPatientProfile(id)]);

    } else {
      // Create new patient via edge function (requires service role to create auth user)
      payload.password = document.getElementById("pfPassword").value;
      if (!payload.password || payload.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const { data: sessionData } = await sb.auth.getSession();
      const accessToken = sessionData.session.access_token;

      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Failed to create patient");

      showToast("Patient created successfully");
      closeAllModals();
      await Promise.all([loadPatientsTable(), loadDashboardStats(), loadRecentPatients()]);
    }
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || "Something went wrong. Please try again.";
    errorEl.classList.add("active");
  } finally {
    submitBtn.disabled = false;
  }
}

// --- Plan Modal ---
function openPlanModal() {
  document.getElementById("planForm").reset();
  document.getElementById("planModalError").classList.remove("active");
  document.getElementById("plDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("planModal").classList.add("active");
}

async function handlePlanFormSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById("planModalError");
  errorEl.classList.remove("active");
  const submitBtn = document.getElementById("planFormSubmit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    let attachmentPath = null;
    const fileInput = document.getElementById("plAttachment");
    if (fileInput.files[0]) {
      const file = fileInput.files[0];
      const ext = file.name.split(".").pop();
      attachmentPath = `${currentViewedPatientId}/plan-${Date.now()}.${ext}`;
      const { error: uploadErr } = await sb.storage.from(BUCKETS.ATTACHMENTS).upload(attachmentPath, file);
      if (uploadErr) throw uploadErr;
    }

    const { error } = await sb.from("treatment_plans").insert({
      patient_id: currentViewedPatientId,
      plan_type: document.getElementById("plType").value,
      title: document.getElementById("plTitle").value.trim(),
      description: document.getElementById("plDescription").value.trim() || null,
      plan_date: document.getElementById("plDate").value || new Date().toISOString().split("T")[0],
      attachment_path: attachmentPath,
      created_by: doctorProfile.id
    });
    if (error) throw error;

    showToast("Treatment plan added");
    closeAllModals();
    await Promise.all([loadPatientPlans(currentViewedPatientId), loadDashboardStats(), loadRecentActivity()]);
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || "Couldn't save plan.";
    errorEl.classList.add("active");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Plan";
  }
}

// --- Form Assign Modal ---
function openFormModal() {
  document.getElementById("formAssignForm").reset();
  document.getElementById("formModalError").classList.remove("active");
  document.getElementById("formModal").classList.add("active");
}

async function handleFormAssignSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById("formModalError");
  errorEl.classList.remove("active");
  const submitBtn = document.getElementById("formAssignSubmit");
  submitBtn.disabled = true;

  try {
    const { error } = await sb.from("forms").insert({
      patient_id: currentViewedPatientId,
      title: document.getElementById("ffTitle").value.trim(),
      form_url: document.getElementById("ffUrl").value.trim(),
      assigned_by: doctorProfile.id
    });
    if (error) throw error;

    showToast("Form assigned successfully");
    closeAllModals();
    await Promise.all([loadPatientForms(currentViewedPatientId), loadDashboardStats(), loadRecentActivity()]);
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || "Couldn't assign form.";
    errorEl.classList.add("active");
  } finally {
    submitBtn.disabled = false;
  }
}

// --- Note Modal ---
function openNoteModal() {
  document.getElementById("noteForm").reset();
  document.getElementById("noteModalError").classList.remove("active");
  document.getElementById("noteModal").classList.add("active");
}

async function handleNoteFormSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById("noteModalError");
  errorEl.classList.remove("active");
  const submitBtn = document.getElementById("noteFormSubmit");
  submitBtn.disabled = true;

  try {
    const { error } = await sb.from("consultation_notes").insert({
      patient_id: currentViewedPatientId,
      note: document.getElementById("nfNote").value.trim(),
      created_by: doctorProfile.id
    });
    if (error) throw error;

    showToast("Consultation note added");
    closeAllModals();
    await Promise.all([loadPatientNotes(currentViewedPatientId), loadDashboardStats(), loadRecentActivity()]);
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || "Couldn't save note.";
    errorEl.classList.add("active");
  } finally {
    submitBtn.disabled = false;
  }
}

// ---------------- Notifications ----------------
async function loadNotifications() {
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  const list = document.getElementById("notifList");
  const dot = document.getElementById("notifDot");

  if (error || !data || data.length === 0) {
    list.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
    dot.classList.remove("active");
    return;
  }

  list.innerHTML = data.map(n => `
    <div class="notif-item">
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
}

// Live updates: refresh patient table / stats when patients upload photos etc.
sb.channel("doctor-updates")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "progress_photos" }, () => {
    loadDashboardStats();
    if (currentViewedPatientId) loadPatientPhotos(currentViewedPatientId);
  })
  .on("postgres_changes", { event: "UPDATE", schema: "public", table: "forms" }, () => {
    loadDashboardStats();
    if (currentViewedPatientId) loadPatientForms(currentViewedPatientId);
  })
  .subscribe();
