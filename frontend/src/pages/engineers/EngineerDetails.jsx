import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { engineersAPI } from "../../api/axios";
import {
  Loader2, ArrowLeft, Pencil, HardHat,
  Mail, Hash, MapPin, ShieldCheck, ShieldAlert, User
} from "lucide-react";

export default function EngineerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    engineersAPI.get(id)
      .then(res => setEngineer(res.data))
      .catch(() => setError(t("engineer.load_failed")))
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

  const e = engineer;
  const isActive = e.account?.is_active ?? false;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/app/engineers")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft size={16} /> {t("engineer.back_to_list")}
        </button>
        <button onClick={() => navigate(`/app/engineers/${id}/edit`)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm transition">
          <Pencil size={14} /> {t("engineer.edit_btn")}
        </button>
      </div>

      {/* Title card */}
      <div className="bg-blue-600 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {e.account?.full_name?.charAt(0).toUpperCase() || "E"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{e.account?.full_name || "—"}</h1>
            <p className="text-blue-200 text-sm capitalize">{e.role?.toLowerCase() || t("engineer.role_engineer")}</p>
          </div>
        </div>
        {isActive ? (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-200 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldCheck size={16} /> {t("engineer.active")}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldAlert size={16} /> {t("engineer.inactive")}
          </div>
        )}
      </div>

      {/* Details card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <HardHat size={16} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-700">{t("engineer.engineer_info")}</h2>
        </div>
        <div className="px-5 py-4 grid md:grid-cols-2 gap-4">
          <Field icon={<User size={14} />}    label={t("engineer.full_name")} value={e.account?.full_name} />
          <Field icon={<Mail size={14} />}    label={t("engineer.email")}     value={e.account?.email} />
          <Field icon={<Hash size={14} />}    label={t("engineer.user_id")}   value={e.account?.user_id} />
          <Field icon={<HardHat size={14} />} label={t("engineer.role")}      value={e.role} />
          <Field icon={<MapPin size={14} />}  label={t("engineer.ward_no")}   value={e.ward_no} />
          <Field icon={<Hash size={14} />}    label={t("engineer.account_id")} value={e.account?.id} />
        </div>
      </div>

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
          {value ?? <span className="text-gray-300 font-normal">—</span>}
        </p>
      </div>
    </div>
  );
}