// ============================================================
// AQ Wellness Portal — Homepage / Login Logic
// ============================================================

const patientOverlay = document.getElementById("patientLoginOverlay");
const doctorOverlay = document.getElementById("doctorLoginOverlay");

document.getElementById("openPatientLogin").addEventListener("click", () => {
  patientOverlay.classList.add("active");
});
document.getElementById("openDoctorLogin").addEventListener("click", () => {
  doctorOverlay.classList.add("active");
});

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    patientOverlay.classList.remove("active");
    doctorOverlay.classList.remove("active");
    clearErrors();
  });
});

[patientOverlay, doctorOverlay].forEach(overlay => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      clearErrors();
    }
  });
});

function clearErrors() {
  document.getElementById("patientLoginError").classList.remove("active");
  document.getElementById("doctorLoginError").classList.remove("active");
}

function showError(elId, message) {
  const el = document.getElementById(elId);
  el.textContent = message;
  el.classList.add("active");
}

/**
 * Signs in, verifies the profile's role matches the portal used,
 * and redirects accordingly. If the role doesn't match (e.g. a
 * patient tries the doctor form), sign them back out and show
 * an error rather than letting them into the wrong dashboard.
 */
async function handleLogin(email, password, expectedRole, errorElId, btnEl) {
  btnEl.disabled = true;
  const originalText = btnEl.textContent;
  btnEl.textContent = "Signing in...";

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      showError(errorElId, "Invalid email or password. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await sb
      .from("profiles")
      .select("role, full_name")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      showError(errorElId, "We couldn't find an account profile for this login. Please contact the clinic.");
      await sb.auth.signOut();
      return;
    }

    if (profile.role !== expectedRole) {
      showError(
        errorElId,
        expectedRole === "patient"
          ? "This account is a doctor account. Please use Doctor Login."
          : "This account is a patient account. Please use Patient Login."
      );
      await sb.auth.signOut();
      return;
    }

    window.location.href = expectedRole === "doctor" ? "admin-dashboard.html" : "client-dashboard.html";

  } catch (err) {
    console.error(err);
    showError(errorElId, "Something went wrong. Please try again.");
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = originalText;
  }
}

document.getElementById("patientLoginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("patientEmail").value.trim();
  const password = document.getElementById("patientPassword").value;
  handleLogin(email, password, "patient", "patientLoginError", document.getElementById("patientLoginBtn"));
});

document.getElementById("doctorLoginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("doctorEmail").value.trim();
  const password = document.getElementById("doctorPassword").value;
  handleLogin(email, password, "doctor", "doctorLoginError", document.getElementById("doctorLoginBtn"));
});

// If already logged in, skip straight to the right dashboard.
(async () => {
  const profile = await getCurrentProfile();
  if (profile) {
    window.location.href = profile.role === "doctor" ? "admin-dashboard.html" : "client-dashboard.html";
  }
})();
