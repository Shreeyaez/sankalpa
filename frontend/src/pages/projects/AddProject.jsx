import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Info, Search, MapPin } from "lucide-react";
import { projectsAPI } from "../../api/axios";
import { useTranslation } from 'react-i18next';
import BSDatePicker from "../../components/BSDatePicker"; // ← adjust path if needed

export default function AddProject() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    project_code: "",
    project_name: "",
    project_description: "",
    priority: "",
    project_type: "",
    ward_no: "",
    municipality: "",
    district: "",
    province: "",
    location: "",
    total_approved_budget: "",
    budget_source: "",
    fiscal_year: "",
    assigned_engineer: "",
    chairperson: "",
    contractor: "",
    proposed_date: "",
    approved_date: "",
    planned_start_date: "",
    planned_completion_date: "",
    planned_duration_days: ""
  });

  const [selectedCompanyName, setSelectedCompanyName] = useState("");

  const [roadData, setRoadData] = useState({
    road_length_km: "",
    road_width_m: "",
    road_type: ""
  });

  const [dropdownData, setDropdownData] = useState({
    priorityLevels: [],
    projectTypes: [],
    roadTypes: [],
    budgetSources: [],
    fiscalYears: [],
    engineers: [],
    chairpersons: [],
    contractors: [],
    locations: []
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMode, setLocationMode] = useState("search");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (formData.planned_start_date && formData.planned_completion_date) {
      const start = new Date(formData.planned_start_date);
      const end = new Date(formData.planned_completion_date);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays !== parseInt(formData.planned_duration_days)) {
        setFormData(prev => ({ ...prev, planned_duration_days: diffDays.toString() }));
      }
    }
  }, [formData.planned_start_date, formData.planned_completion_date]);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [priorityLevels, projectTypes, roadTypes, budgetSources, fiscalYears, engineers, chairpersons, contractors, locations] = await Promise.all([
        fetch('/api/lookups/priority-levels/').then(r => r.json()),
        fetch('/api/lookups/project-types/').then(r => r.json()),
        fetch('/api/lookups/road-types/').then(r => r.json()),
        fetch('/api/lookups/budget-sources/').then(r => r.json()),
        fetch('/api/lookups/fiscal-years/').then(r => r.json()),
        fetch('/api/engineers/engineer/').then(r => r.json()),
        fetch('/api/chairpersons/chairperson/').then(r => r.json()),
        fetch('/api/contractors/contractor/').then(r => r.json()),
        fetch('/api/locations/location/').then(r => r.json()),
      ]);
      const activeContractors = contractors.filter(c => c.suchidarta_flagged);
      setDropdownData({ priorityLevels, projectTypes, roadTypes, budgetSources, fiscalYears, engineers, chairpersons, contractors: activeContractors, locations });
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      alert(t("addproject.load_failed"));
    } finally {
      setLoadingData(false);
    }
  };

  const determineStatus = (startDate, completionDate) => {
    if (!startDate) return "ONGOING";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = completionDate ? new Date(completionDate) : null;
    if (today < start) return "COMING_SOON";
    if (end && today > end) return "DELAYED";
    return "ONGOING";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoadChange = (e) => {
    const { name, value } = e.target;
    setRoadData(prev => ({ ...prev, [name]: value }));
  };

  const handleContractorChange = (e) => {
    const contractorId = e.target.value;
    setFormData(prev => ({ ...prev, contractor: contractorId }));
    if (contractorId) {
      const selected = dropdownData.contractors.find(c => c.id.toString() === contractorId.toString());
      setSelectedCompanyName(selected?.company_name || t("addproject.no_company_name"));
    } else {
      setSelectedCompanyName("");
    }
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocationSearch(`${t("location.ward")} ${loc.ward_no}, ${loc.place_or_street}`);
    setShowLocationDropdown(false);
    setFormData(prev => ({
      ...prev,
      ward_no: loc.ward_no.toString(),
      municipality: loc.municipality,
      district: loc.district,
      province: loc.province,
      location: loc.place_or_street
    }));
  };

  const filteredLocations = dropdownData.locations.filter(loc =>
    loc.place_or_street.toLowerCase().includes(locationSearch.toLowerCase()) ||
    loc.ward_no.toString().includes(locationSearch) ||
    loc.municipality.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const getSelectedProjectTypeName = () => {
    if (!formData.project_type) return null;
    const pt = dropdownData.projectTypes.find(p => p.id.toString() === formData.project_type.toString());
    return pt ? pt.name.toLowerCase() : null;
  };

  const isRoadProject   = () => getSelectedProjectTypeName() === 'road';
  const isFutureProject = () => {
    const name = getSelectedProjectTypeName();
    return name === 'building' || name === 'bridge';
  };

  const getContractorLabel = (contractor) => {
    const name = contractor.contractor_name || `${t("nav.contractors").replace(/s$/, "")} #${contractor.id}`;
    const pan  = contractor.pan_vat_no ? ` — ${t("contractor.pan")}: ${contractor.pan_vat_no}` : '';
    return `${name}${pan}`;
  };

  const getEngineerName    = (e) => e.account?.full_name || e.full_name || `Engineer #${e.id}`;
  const getChairpersonName = (c) => c.account?.full_name || c.full_name || `Chairperson #${c.id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const projectData = {
        project_code: formData.project_code,
        project_name: formData.project_name,
        project_description: formData.project_description || "",
        priority: formData.priority || "LOW",
        ward_no: parseInt(formData.ward_no) || 16,
        municipality: formData.municipality || "Kathmandu",
        district: formData.district || "Kathmandu",
        province: formData.province || "Bagmati",
        location: formData.location,
        total_approved_budget: formData.total_approved_budget ? parseFloat(formData.total_approved_budget) : null,
        budget_source: formData.budget_source ? parseInt(formData.budget_source) : null,
        fiscal_year: formData.fiscal_year ? parseInt(formData.fiscal_year) : null,
        assigned_engineer: formData.assigned_engineer ? parseInt(formData.assigned_engineer) : null,
        chairperson: formData.chairperson ? parseInt(formData.chairperson) : null,
        contractor: formData.contractor ? parseInt(formData.contractor) : null,
        proposed_date: formData.proposed_date || null,
        approved_date: formData.approved_date || null,
        planned_start_date: formData.planned_start_date || null,
        planned_completion_date: formData.planned_completion_date || null,
        planned_duration_days: formData.planned_duration_days ? parseInt(formData.planned_duration_days) : null,
        status: determineStatus(formData.planned_start_date, formData.planned_completion_date)
      };

      const createdProject = await projectsAPI.create(projectData);

      if (isRoadProject() && roadData.road_type) {
        try {
          await fetch('/api/roads/road/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project: createdProject.data.id,
              road_length_km: roadData.road_length_km ? parseFloat(roadData.road_length_km) : null,
              road_width_m: roadData.road_width_m ? parseFloat(roadData.road_width_m) : null,
              road_type: parseInt(roadData.road_type)
            })
          });
        } catch (roadError) {
          console.error("Road details error:", roadError);
        }
      }

      alert(t("addproject.created_success"));
      navigate('/app/projects');
    } catch (error) {
      console.error("❌ Error creating project:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          alert(`${t("addproject.create_failed")}:\n\n${errorMessages}`);
        } else {
          alert(`${t("addproject.create_failed")}: ${errorData}`);
        }
      } else {
        alert(`${t("addproject.create_failed")}: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t("addproject.confirm_cancel"))) navigate(-1);
  };

  if (loadingData) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600">{t("addproject.loading_form")}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t("addproject.title")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-8">

        {/* BASIC INFO */}
        <Section title={t("addproject.section_basic")}>
          <Input label={t("project.code")} name="project_code" value={formData.project_code} onChange={handleInputChange} placeholder="e.g., PRJ-2026-001" required />
          <Input label={t("project.name")} name="project_name" value={formData.project_name} onChange={handleInputChange} placeholder={t("addproject.project_name_placeholder")} required />

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("addproject.priority")} <span className="text-red-500">*</span>
            </label>
            <select name="priority" value={formData.priority} onChange={handleInputChange} required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">{t("form.select")} {t("addproject.priority")}</option>
              <option value="LOW">{t("addproject.priority_low")}</option>
              <option value="MEDIUM">{t("addproject.priority_medium")}</option>
              <option value="HIGH">{t("addproject.priority_high")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t("addproject.project_type")} <span className="text-red-500">*</span>
            </label>
            <select name="project_type" value={formData.project_type} onChange={handleInputChange} required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">{t("form.select")} {t("addproject.project_type")}</option>
              {dropdownData.projectTypes.map(pt => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">{t("project.description")}</label>
            <textarea name="project_description" value={formData.project_description} onChange={handleInputChange}
              placeholder={t("addproject.description_placeholder")} rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </Section>

        {/* FUTURE PROJECT NOTICE */}
        {isFutureProject() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 flex items-start gap-4">
            <Info className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 capitalize">{getSelectedProjectTypeName()} {t("addproject.project_type")}</h3>
              <p className="text-yellow-700 mt-1 text-sm">
                {t("addproject.future_project_notice", { type: getSelectedProjectTypeName() })}
              </p>
            </div>
          </div>
        )}

        {/* ROAD DETAILS */}
        {isRoadProject() && (
          <Section title={t("addproject.section_road")}>
            <Input label={t("addproject.road_length")} name="road_length_km" type="number" value={roadData.road_length_km} onChange={handleRoadChange} placeholder="e.g., 2.5" />
            <Input label={t("addproject.road_width")}  name="road_width_m"  type="number" value={roadData.road_width_m}  onChange={handleRoadChange} placeholder="e.g., 6.0" />
            <Select label={t("addproject.road_type")} name="road_type" value={roadData.road_type} onChange={handleRoadChange}
              options={dropdownData.roadTypes.map(rt => ({ value: rt.id, label: rt.name }))} required />
          </Section>
        )}

        {/* LOCATION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-medium text-gray-700 text-lg">{t("overview.location_details")}</h3>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => { setLocationMode("search"); setSelectedLocation(null); setLocationSearch(""); }}
                className={`px-3 py-1 text-sm rounded-md transition ${locationMode === "search" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t("addproject.search_existing")}
              </button>
              <button type="button"
                onClick={() => { setLocationMode("manual"); setSelectedLocation(null); setLocationSearch(""); setFormData(prev => ({ ...prev, ward_no: "", municipality: "", district: "", province: "", location: "" })); }}
                className={`px-3 py-1 text-sm rounded-md transition ${locationMode === "manual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t("addproject.enter_manually")}
              </button>
            </div>
          </div>

          {locationMode === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">
                  {t("addproject.search_location")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="text" value={locationSearch}
                    onChange={(e) => { setLocationSearch(e.target.value); setShowLocationDropdown(true); setSelectedLocation(null); }}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder={t("addproject.location_search_placeholder")}
                    className="w-full border border-gray-300 rounded px-3 py-2 pl-9 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                {showLocationDropdown && locationSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map(loc => (
                        <button key={loc.id} type="button" onClick={() => handleSelectLocation(loc)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{t("location.ward")} {loc.ward_no} – {loc.place_or_street}</div>
                              <div className="text-xs text-gray-500">{loc.municipality}, {loc.district}, {loc.province}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">{t("addproject.no_locations_found")}</div>
                    )}
                  </div>
                )}
              </div>

              {selectedLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm">{t("addproject.selected_location")}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-500">{t("location.ward")}:</span><p className="font-medium">{selectedLocation.ward_no}</p></div>
                    <div><span className="text-gray-500">{t("location.municipality")}:</span><p className="font-medium">{selectedLocation.municipality}</p></div>
                    <div><span className="text-gray-500">{t("location.district")}:</span><p className="font-medium">{selectedLocation.district}</p></div>
                    <div><span className="text-gray-500">{t("location.province")}:</span><p className="font-medium">{selectedLocation.province}</p></div>
                    <div className="md:col-span-4"><span className="text-gray-500">{t("location.place")}:</span><p className="font-medium">{selectedLocation.place_or_street}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {locationMode === "manual" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("location.ward")}         name="ward_no"      type="number" value={formData.ward_no}      onChange={handleInputChange} placeholder="e.g., 16"        required />
              <Input label={t("location.municipality")} name="municipality"               value={formData.municipality} onChange={handleInputChange} placeholder="e.g., Kathmandu" required />
              <Input label={t("location.district")}     name="district"                   value={formData.district}     onChange={handleInputChange} placeholder="e.g., Kathmandu" required />
              <Input label={t("location.province")}     name="province"                   value={formData.province}     onChange={handleInputChange} placeholder="e.g., Bagmati"   required />
              <div className="md:col-span-2">
                <Input label={t("location.place")} name="location" value={formData.location} onChange={handleInputChange} placeholder={t("addproject.place_placeholder")} required />
              </div>
            </div>
          )}
        </div>

        {/* BUDGET */}
        <Section title={t("addproject.section_budget")}>
          <Input label={t("addproject.total_budget")} name="total_approved_budget" type="number" value={formData.total_approved_budget} onChange={handleInputChange} placeholder="e.g., 50000000" required />
          <Select label={t("budget.source")}      name="budget_source" value={formData.budget_source} onChange={handleInputChange} options={dropdownData.budgetSources.map(bs => ({ value: bs.id, label: bs.name }))} required />
          <Select label={t("budget.fiscal_year")} name="fiscal_year"   value={formData.fiscal_year}   onChange={handleInputChange} options={dropdownData.fiscalYears.map(fy => ({ value: fy.id, label: fy.year_label }))} required />
        </Section>

        {/* PERSONNEL */}
        <Section title={t("addproject.section_personnel")}>
          <Select label={t("nav.engineers").replace(/s$/, "")}    name="assigned_engineer" value={formData.assigned_engineer} onChange={handleInputChange} options={dropdownData.engineers.map(eng => ({ value: eng.id, label: getEngineerName(eng) }))} />
          <Select label={t("nav.chairpersons").replace(/s$/, "")} name="chairperson"        value={formData.chairperson}       onChange={handleInputChange} options={dropdownData.chairpersons.map(chair => ({ value: chair.id, label: getChairpersonName(chair) }))} />

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              {t("nav.contractors").replace(/s$/, "")} <span className="text-red-500">*</span>
            </label>
            <select name="contractor" value={formData.contractor} onChange={handleContractorChange} required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">{t("form.select")} {t("nav.contractors").replace(/s$/, "")}</option>
              {dropdownData.contractors.map(cont => (
                <option key={cont.id} value={cont.id}>{getContractorLabel(cont)}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t("addproject.only_active_contractors")}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">{t("contractor.company")}</label>
            <input type="text" value={selectedCompanyName} readOnly
              placeholder={t("addproject.company_autofill_placeholder")}
              className={`w-full border rounded px-3 py-2 cursor-not-allowed ${selectedCompanyName ? "border-green-300 bg-green-50 text-gray-800" : "border-gray-300 bg-gray-50 text-gray-400"}`} />
            <p className="text-xs text-gray-500 mt-1">ℹ️ {t("addproject.company_autofill_hint")}</p>
          </div>
        </Section>

        {/* ── TIMELINE — BS date pickers ── */}
        <Section title={t("addproject.section_timeline")}>
          <BSDatePicker label={t("timeline.proposed")}   name="proposed_date"           value={formData.proposed_date}           onChange={handleInputChange} />
          <BSDatePicker label={t("timeline.approved")}   name="approved_date"           value={formData.approved_date}           onChange={handleInputChange} />
          <BSDatePicker label={t("timeline.start")}      name="planned_start_date"      value={formData.planned_start_date}      onChange={handleInputChange} required />
          <BSDatePicker label={t("timeline.completion")} name="planned_completion_date" value={formData.planned_completion_date} onChange={handleInputChange} required />

          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("addproject.duration_label")}</label>
            <input type="number" name="planned_duration_days" value={formData.planned_duration_days} readOnly
              placeholder={t("form.auto_calculated")}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">ℹ️ {t("addproject.duration_hint")}</p>
          </div>
        </Section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={handleCancel} disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            {t("cancel")}
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t("addproject.saving") : t("addproject.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- REUSABLE UI ---------- */
function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700 text-lg border-b pb-2">{title}</h3>
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

function Select({ label, name, value, onChange, options = [], required = false }) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select name={name} value={value} onChange={onChange} required={required}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">{t("form.select")} {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}