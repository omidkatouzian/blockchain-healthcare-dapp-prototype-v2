function $(selector) {
  return document.querySelector(selector);
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function setResult(selector, value) {
  const el = $(selector);
  if (!el) return;
  el.textContent = typeof value === "string" ? value : pretty(value);
}

function showToast(message, isError = false) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.hidden = false;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { toast.hidden = true; }, 4800);
}

function parseJsonOrThrow(raw, fallback = {}) {
  const text = (raw || "").trim();
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

function formDataObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function apiPost(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || response.statusText || "Request failed";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}

async function apiGet(path) {
  const response = await fetch(path);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || response.statusText || "Request failed";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}

async function runAction(resultSelector, fn) {
  try {
    setResult(resultSelector, "Working...");
    const data = await fn();
    setResult(resultSelector, data);
    showToast("Operation completed successfully.");
    return data;
  } catch (error) {
    setResult(resultSelector, `Error: ${error.message}`);
    showToast(error.message, true);
    return null;
  }
}

function splitScopes(value) {
  return (value || "read:ehr")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function setupRegisterPage() {
  const roleSelect = $("#roleSelect");
  const patientFields = document.querySelectorAll(".patient-only");
  const staffFields = document.querySelectorAll(".staff-only");

  function syncRoleFields() {
    const isPatient = roleSelect.value === "patient";
    patientFields.forEach((el) => { el.hidden = !isPatient; });
    staffFields.forEach((el) => { el.hidden = isPatient; });
  }
  roleSelect?.addEventListener("change", syncRoleFields);
  syncRoleFields();

  $("#registerActorForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#registerResult", async () => {
      const values = formDataObject(event.currentTarget);
      const extraMetadata = parseJsonOrThrow(values.metadata_json, {});
      const metadata = { ...extraMetadata };

      if (values.role === "patient") {
        metadata.bloodType = values.bloodType || "";
        metadata.allergies = (values.allergies || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else {
        metadata.licenseNumber = values.licenseNumber || "";
        metadata.specialty = values.specialty || "";
        metadata.organization = values.organization || "";
      }

      return apiPost("/api/actors/register", {
        private_key: values.private_key,
        role: values.role,
        name: values.name,
        metadata,
      });
    });
  });

  $("#lookupActorForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#registerResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiGet(`/api/actors/${encodeURIComponent(values.actor_address)}`);
    });
  });
}

function setupPatientPage() {
  const keyInput = $("#patientPrivateKey");
  const addressInput = $("#patientAddress");

  $("#derivePatientAddressBtn")?.addEventListener("click", () => {
    runAction("#patientResult", async () => {
      const data = await apiPost("/api/utils/address-from-key", { private_key: keyInput.value });
      addressInput.value = data.address;
      return data;
    });
  });

  $("#loadPatientActorBtn")?.addEventListener("click", () => {
    runAction("#patientResult", async () => apiGet(`/api/actors/${encodeURIComponent(addressInput.value)}`));
  });

  $("#loadAccessRequestsBtn")?.addEventListener("click", () => {
    runAction("#patientRequestsResult", async () => apiPost("/api/access/requests", {
      private_key: keyInput.value,
      patient_address: addressInput.value,
    }));
  });

  $("#accessDecisionForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#patientResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiPost("/api/access/decide", {
        private_key: keyInput.value,
        request_id: Number(values.request_id),
        grant: values.grant === "true",
        duration_seconds: Number(values.duration_seconds || 604800),
        scopes: splitScopes(values.scopes),
      });
    });
  });

  $("#addRecordForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#patientResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiPost("/api/records", {
        private_key: keyInput.value,
        patient_address: addressInput.value,
        record_type: values.record_type,
        record_data: parseJsonOrThrow(values.record_data),
        metadata: parseJsonOrThrow(values.metadata, {}),
      });
    });
  });

  $("#listPatientRecordsBtn")?.addEventListener("click", () => {
    runAction("#patientRecordsResult", async () => apiPost("/api/records/list", {
      private_key: keyInput.value,
      patient_address: addressInput.value,
    }));
  });

  $("#readPatientRecordForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#patientRecordsResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiPost("/api/records/read", {
        private_key: keyInput.value,
        record_id: Number(values.record_id),
      });
    });
  });
}

function setupStaffPage() {
  const keyInput = $("#staffPrivateKey");
  const patientInput = $("#staffPatientAddress");

  $("#deriveStaffAddressBtn")?.addEventListener("click", () => {
    runAction("#staffResult", async () => apiPost("/api/utils/address-from-key", { private_key: keyInput.value }));
  });

  $("#loadStaffActorBtn")?.addEventListener("click", async () => {
    const derived = await runAction("#staffResult", async () => apiPost("/api/utils/address-from-key", { private_key: keyInput.value }));
    if (!derived?.address) return;
    runAction("#staffResult", async () => apiGet(`/api/actors/${encodeURIComponent(derived.address)}`));
  });

  $("#staffRequestAccessForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#staffResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiPost("/api/access/request", {
        private_key: keyInput.value,
        patient_address: patientInput.value,
        purpose: values.purpose,
      });
    });
  });

  $("#staffListRecordsBtn")?.addEventListener("click", () => {
    runAction("#staffRecordsResult", async () => apiPost("/api/records/list", {
      private_key: keyInput.value,
      patient_address: patientInput.value,
    }));
  });

  $("#staffReadRecordForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#staffResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiPost("/api/records/read", {
        private_key: keyInput.value,
        record_id: Number(values.record_id),
      });
    });
  });
}

function setupAdminPage() {
  $("#verifyActorForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#adminResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiPost("/api/actors/verify", {
        private_key: values.private_key,
        actor_address: values.actor_address,
        verified: values.verified === "true",
      });
    });
  });

  $("#adminLookupActorForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runAction("#adminResult", async () => {
      const values = formDataObject(event.currentTarget);
      return apiGet(`/api/actors/${encodeURIComponent(values.actor_address)}`);
    });
  });
}
