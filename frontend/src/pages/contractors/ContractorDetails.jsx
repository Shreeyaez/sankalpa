import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { contractorsAPI } from "../../api/axios";
import {
  Loader2, Pencil, ArrowLeft, Briefcase, Building2,
  Phone, Mail, MapPin, FileText, Hash, CalendarDays,
  ExternalLink, ShieldCheck, ShieldAlert
} from "lucide-react";

export default function ContractorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    contractorsAPI.get(id)
      .then(res => setContractor(res.data))
      .catch(() => setError(t("contractors.load_failed")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">{error}</div>
  );

  const c = contractor;
  const typeLabel = { A: "Type A", B: "Type B", C: "Type C", D: "Type D" }[c.contractor_type] || c.contractor_type || "N/A";

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/app/contractors")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} /> {t("contractors.back")}
        </button>
        <button
          onClick={() => navigate(`/app/contractors/${id}/edit`)}
          className="flex items-center gap-2 bg-[#1F4E79] hover:bg-[#163a5a] text-white px-5 py-2 rounded-md text-sm transition"
        >
          <Pencil size={14} /> {t("contractors.edit_btn")}
        </button>
      </div>

      {/* Title card */}
      <div className="bg-[#1F4E79] text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {c.contractor_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{c.contractor_name}</h1>
            <p className="text-blue-200 text-sm">{typeLabel} {t("contractor.type")}</p>
          </div>
        </div>
        {c.suchidarta_flagged ? (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-200 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldCheck size={16} /> {t("contractors.active_approved")}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-400/40 text-orange-200 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldAlert size={16} /> {t("contractors.pending_approval")}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Personal Details */}
        <Section title={t("contractors.personal_details")} icon={<Briefcase size={16} className="text-[#1F4E79]" />}>
          <Field icon={<Hash size={14} />}         label={t("contractors.reg_no")}       value={c.registration_no} />
          <Field icon={<Hash size={14} />}         label={t("contractor.pan")}           value={c.pan_vat_no} />
          <Field icon={<CalendarDays size={14} />} label={t("contractors.latest_renewal")} value={c.latest_renewal_date} />
          <Field icon={<Briefcase size={14} />}    label={t("contractor.type")}          value={typeLabel} />
          <Field icon={<MapPin size={14} />}       label={t("contractor.address")}       value={c.address} />
          <Field icon={<Phone size={14} />}        label={t("contractor.contact")}       value={c.contact_number} />
          <Field icon={<Mail size={14} />}         label={t("contractor.email")}         value={c.email} />
        </Section>

        {/* Company Details */}
        <Section title={t("contractors.company_info")} icon={<Building2 size={16} className="text-[#1F4E79]" />}>
          <Field icon={<Building2 size={14} />} label={t("contractors.company_name")}    value={c.company_name} />
          <Field icon={<Phone size={14} />}     label={t("contractors.company_phone")}   value={c.company_phone} />
          <Field icon={<Mail size={14} />}      label={t("contractors.company_email")}   value={c.company_email} />
          <Field icon={<MapPin size={14} />}    label={t("contractors.company_address")} value={c.company_address} />
          <Field icon={<MapPin size={14} />}    label={t("contractors.municipality")}    value={c.municipality} />
          <Field icon={<MapPin size={14} />}    label={t("contractors.district")}        value={c.district} />
        </Section>
      </div>

      {/* Documents */}
      <Section title={t("contractors.section_docs")} icon={<FileText size={16} className="text-[#1F4E79]" />}>
        <div className="grid md:grid-cols-2 gap-4">
          <DocCard label={t("contractors.reg_cert")} url={c.registration_certificate} />
          <DocCard label={t("contractors.pan_cert")} url={c.pan_vat_certificate} />
        </div>
      </Section>

    </div>
  );
}

/* ---------- HELPERS ---------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
        {icon}
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium break-words">
          {value || <span className="text-gray-300 font-normal">—</span>}
        </p>
      </div>
    </div>
  );
}

function DocCard({ label, url }) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${url ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
      <div className="flex items-center gap-2">
        <FileText size={16} className={url ? "text-green-600" : "text-gray-300"} />
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          {url
            ? <p className="text-sm text-green-700 font-medium truncate max-w-[160px]">{url.split("/").pop()}</p>
            : <p className="text-sm text-gray-400">{t("contractors.not_uploaded")}</p>
          }
        </div>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer"
          className="text-[#1F4E79] hover:text-blue-800 transition" title="Open file">
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}