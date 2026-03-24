import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { engineersAPI, authAPI } from "../../api/axios";
import { Loader2 } from "lucide-react";

export default function AddEngineer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(1);
  const [createdAccountId, setCreatedAccountId] = useState(null);

  const [accountData, setAccountData] = useState({
    user_id: "", full_name: "", email: "", password: "", role: "USER"
  });

  const [engineerData, setEngineerData] = useState({
    ward_no: "", role: "ENGINEER"
  });

  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (!isEdit) return;
    engineersAPI.get(id)
      .then(res => {
        const d = res.data;
        setEngineerData({ ward_no: d.ward_no || "", role: d.role || "ENGINEER" });
        setStep(2);
      })
      .catch(() => setErrors({ general: t("engineer.load_failed") }))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  /**
   * Parse a DRF error response into an errors object.
   * DRF returns  { field: ["msg", ...], non_field_errors: [...] }
   * or sometimes a plain string / { detail: "..." }
   */
  const parseDrfErrors = (err) => {
    const data = err.response?.data;
    if (!data) return { general: t("engineer.account_create_failed") };
    if (typeof data === "string") return { general: data };
    if (data.detail) return { general: data.detail };
    if (typeof data === "object") {
      // Flatten non_field_errors into general
      const result = {};
      Object.entries(data).forEach(([key, val]) => {
        if (key === "non_field_errors") {
          result.general = Array.isArray(val) ? val.join(" ") : val;
        } else {
          result[key] = Array.isArray(val) ? val.join(" ") : val;
        }
      });
      return result;
    }
    return { general: t("engineer.account_create_failed") };
  };

  // ── handlers ─────────────────────────────────────────────────────────────────

  const handleAccountChange  = (e) => {
    setAccountData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleEngineerChange = (e) => {
    setEngineerData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validateAccount = () => {
    const errs = {};
    if (!accountData.user_id.trim())      errs.user_id   = t("engineer.error_user_id");
    if (!accountData.full_name.trim())    errs.full_name = t("engineer.error_full_name");
    if (!accountData.email.trim())        errs.email     = t("engineer.error_email");
    if (accountData.password.length < 8) errs.password  = t("engineer.error_password");
    return errs;
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation first
    const validationErrors = validateAccount();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(accountData);
      setCreatedAccountId(res.data.id);
      setStep(2);
    } catch (err) {
      console.error("Error creating account:", err);
      console.error("API response data:", err.response?.data);
      setErrors(parseDrfErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEngineerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        ward_no:   engineerData.ward_no ? parseInt(engineerData.ward_no) : null,
        role:      engineerData.role,
        is_active: true,
        ...(!isEdit && { account_id: createdAccountId }),
      };
      if (isEdit) {
        await engineersAPI.update(id, payload);
        alert(t("engineer.update_success"));
      } else {
        await engineersAPI.create(payload);
        alert(t("engineer.add_success"));
      }
      navigate("/app/engineers");
    } catch (err) {
      console.error("Error saving engineer:", err);
      console.error("API response data:", err.response?.data);
      setErrors(parseDrfErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t("contractors.cancel_confirm"))) navigate("/app/engineers");
  };

  // ── render ───────────────────────────────────────────────────────────────────

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h2 className="text-2xl font-bold text-gray-800">
        {isEdit ? t("engineer.edit_title") : t("engineer.add_title")}
      </h2>

      {/* Step indicator — only shown when adding */}
      {!isEdit && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <StepIndicator number={1} label={t("engineer.step_account")} active={step === 1} completed={step > 1} />
          <div className="w-16 h-1 bg-gray-300" />
          <StepIndicator number={2} label={t("engineer.step_details")} active={step === 2} />
        </div>
      )}

      {/* General / top-level error banner */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {errors.general}
        </div>
      )}

      {/* ── STEP 1 — Account creation ── */}
      {step === 1 && !isEdit && (
        <form onSubmit={handleAccountSubmit} className="bg-white border rounded-lg p-6 space-y-6">
          <Section title={t("engineer.account_info")}>
            <Input
              label={t("engineer.user_id")}  name="user_id"  value={accountData.user_id}
              onChange={handleAccountChange}  required        placeholder="e.g., eng001"
              error={errors.user_id}
            />
            <Input
              label={t("engineer.full_name")} name="full_name" value={accountData.full_name}
              onChange={handleAccountChange}  required
              error={errors.full_name}
            />
            <Input
              label={t("engineer.email")} name="email" type="email" value={accountData.email}
              onChange={handleAccountChange} required
              error={errors.email}
            />
            <Input
              label={t("engineer.password")} name="password" type="password" value={accountData.password}
              onChange={handleAccountChange} required placeholder={t("engineer.password_hint")}
              error={errors.password}
            />
          </Section>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("engineer.creating") : t("next")}
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 2 — Engineer details ── */}
      {step === 2 && (
        <form onSubmit={handleEngineerSubmit} className="bg-white border rounded-lg p-6 space-y-6">
          <Section title={t("engineer.engineer_info")}>
            <Input
              label={t("engineer.ward_no")} name="ward_no" type="number"
              value={engineerData.ward_no}  onChange={handleEngineerChange}
              placeholder="e.g., 16"        error={errors.ward_no}
            />
            <Select
              label={t("engineer.role")} name="role" value={engineerData.role}
              onChange={handleEngineerChange} required   error={errors.role}
              options={[
                { value: "ENGINEER",   label: t("engineer.role_engineer")   },
                { value: "SUPERVISOR", label: t("engineer.role_supervisor") },
              ]}
            />
          </Section>

          <div className="flex justify-end gap-4 pt-4 border-t">
            {!isEdit && (
              <button type="button" onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                {t("back")}
              </button>
            )}
            {isEdit && (
              <button type="button" onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                {t("cancel")}
              </button>
            )}
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? t("saving")
                : isEdit ? t("contractors.save_changes") : t("engineer.save")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ number, label, active, completed }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
        completed ? "bg-green-500 text-white" :
        active    ? "bg-blue-600 text-white"  :
                    "bg-gray-300 text-gray-600"
      }`}>
        {completed ? "✓" : number}
      </div>
      <span className="text-xs text-gray-600 mt-2">{label}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700 text-lg">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false, placeholder = "", error }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, name, value, onChange, options = [], required = false, error }) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name} value={value} onChange={onChange} required={required}
        className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      >
        <option value="">{t("form.select")} {label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}