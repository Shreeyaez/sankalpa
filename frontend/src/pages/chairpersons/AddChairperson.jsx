import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { chairpersonsAPI, authAPI } from "../../api/axios";
import { Loader2 } from "lucide-react";
import BSDatePicker from "../../components/BSDatePicker"; // ← adjust path if needed

export default function AddChairperson() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [createdAccountId, setCreatedAccountId] = useState(null);

  const [accountData, setAccountData] = useState({
    user_id: "", full_name: "", email: "", password: "", role: "USER"
  });

  const [chairpersonData, setChairpersonData] = useState({
    term_start: "",   // AD "YYYY-MM-DD"
    term_end:   ""    // AD "YYYY-MM-DD"
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handleChairpersonChange = (e) => {
    const { name, value } = e.target;
    setChairpersonData(prev => ({ ...prev, [name]: value }));
  };

  const parseApiError = (err) => {
    const data = err.response?.data;
    if (!data) return t("chairperson.account_failed");
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs.join(", ") : msgs;
          return `${field}: ${msg}`;
        })
        .join(" | ");
    }
    return t("chairperson.account_failed");
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(accountData);
      setCreatedAccountId(response.data.id);
      setStep(2);
    } catch (err) {
      console.error("Error creating account:", err);
      console.error("API response data:", err.response?.data);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChairpersonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await chairpersonsAPI.create({
        account_id: createdAccountId,
        term_start: chairpersonData.term_start || null,
        term_end:   chairpersonData.term_end   || null
      });
      alert(t("chairperson.add_success"));
      navigate('/app/chairpersons');
    } catch (error) {
      console.error("Error creating chairperson:", error);
      setError(error.response?.data?.message || t("chairperson.profile_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t("addproject.confirm_cancel"))) navigate('/app/chairpersons');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t("chairperson.add_title")}</h2>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepIndicator number={1} label={t("chairperson.step_account")} active={step === 1} completed={step > 1} />
        <div className="w-16 h-1 bg-gray-300" />
        <StepIndicator number={2} label={t("chairperson.step_term")}    active={step === 2} completed={false} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* STEP 1: Account */}
      {step === 1 && (
        <form onSubmit={handleAccountSubmit} className="bg-white border rounded-lg p-6 space-y-6">
          <Section title={t("chairperson.account_info")}>
            <Input label={t("chairperson.user_id")}   name="user_id"   value={accountData.user_id}   onChange={handleAccountChange} required placeholder="e.g., chair001" />
            <Input label={t("chairperson.full_name")} name="full_name" value={accountData.full_name} onChange={handleAccountChange} required placeholder={t("chairperson.full_name_placeholder")} />
            <Input label={t("contractor.email")}      name="email"     value={accountData.email}     onChange={handleAccountChange} required placeholder="email@example.com" type="email" />
            <Input label={t("chairperson.password")}  name="password"  value={accountData.password}  onChange={handleAccountChange} required placeholder={t("chairperson.password_placeholder")} type="password" />
          </Section>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={handleCancel} disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("loading") : t("chairperson.next_term")}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Term — BS date pickers */}
      {step === 2 && (
        <form onSubmit={handleChairpersonSubmit} className="bg-white border rounded-lg p-6 space-y-6">
          <Section title={t("chairperson.term_info")}>
            <BSDatePicker
              label={t("chairperson.term_start")}
              name="term_start"
              value={chairpersonData.term_start}
              onChange={handleChairpersonChange}
            />
            <BSDatePicker
              label={t("chairperson.term_end")}
              name="term_end"
              value={chairpersonData.term_end}
              onChange={handleChairpersonChange}
            />
          </Section>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={() => setStep(1)} disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              {t("back")}
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("addproject.saving") : t("chairperson.save")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------- COMPONENTS ---------- */
function StepIndicator({ number, label, active, completed }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
        completed ? 'bg-green-500 text-white' :
        active    ? 'bg-blue-600 text-white'  :
                    'bg-gray-300 text-gray-600'
      }`}>
        {completed ? '✓' : number}
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

function Input({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
    </div>
  );
}