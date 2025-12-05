"use client";

import { useState, useMemo } from "react";
import {
  FileText, FileSpreadsheet, Download, Filter,
  Calendar, CheckCircle2, FileBarChart, Presentation,
  Search, MoreHorizontal, Clock, AlertCircle, File,
  MapPin, Globe, ShieldCheck, PieChart, ChevronDown, X, Loader2,
  Share2, FolderOpen, TrendingUp
} from "lucide-react";

// --- REAL DATA: Integrated from districts.json ---
const DISTRICTS_DATA = {
  "Central": {
    "Kampala": ["Kampala City"],
    "Buganda South": ["Bukomansimbi", "Butambala", "Gomba", "Kalangala", "Kalungu", "Kyotera", "Lwengo", "Lyantonde", "Masaka", "Masaka City", "Mpigi", "Rakai", "Sembabule", "Wakiso"],
    "Buganda North": ["Buikwe", "Buvuma", "Kassanda", "Kayunga", "Kiboga", "Kyankwanzi", "Luweero", "Mityana", "Mubende", "Mukono", "Nakaseke", "Nakasongola", "Kasanda"]
  },
  "Eastern": {
    "Busoga": ["Bugiri", "Bugweri", "Buyende", "Iganga", "Jinja", "Jinja City", "Kaliro", "Kamuli", "Luuka", "Mayuge", "Namayingo", "Namutumba"],
    "Bukedi": ["Budaka", "Busia", "Butaleja", "Butebo", "Kibuku", "Pallisa", "Tororo"],
    "Elgon": ["Bududa", "Bukwo", "Bulambuli", "Kapchorwa", "Kween", "Manafwa", "Mbale", "Mbale City", "Namisindwa", "Sironko"],
    "Teso": ["Amuria", "Bukedea", "Kaberamaido", "Kalaki", "Kapelebyong", "Katakwi", "Kumi", "Ngora", "Serere", "Soroti", "Soroti City"]
  },
  "Northern": {
    "Karamoja": ["Abim", "Amudat", "Kaabong", "Karenga", "Kotido", "Moroto", "Nabilatuk", "Nakapiripirit", "Napak"],
    "Lango": ["Alebtong", "Amolatar", "Apac", "Dokolo", "Kole", "Kwania", "Lira", "Lira City", "Otuke", "Oyam"],
    "Acholi": ["Agago", "Amuru", "Gulu", "Gulu City", "Kitgum", "Lamwo", "Nwoya", "Omoro", "Pader"],
    "West Nile": ["Adjumani", "Arua", "Arua City", "Koboko", "Madi-Okollo", "Maracha", "Moyo", "Nebbi", "Obongi", "Pakwach", "Terego", "Yumbe", "Zombo"]
  },
  "Western": {
    "Bunyoro": ["Buliisa", "Hoima", "Hoima City", "Kagadi", "Kakumiro", "Kibaale", "Kikuube", "Kiryandongo", "Masindi"],
    "Tooro": ["Bundibugyo", "Kabarole", "Kamwenge", "Kitagwenda", "Kyegegwa", "Kyenjojo", "Ntoroko", "Kasese"],
    "Ankole": ["Buhweju", "Bushenyi", "Ibanda", "Isingiro", "Kazo", "Kiruhura", "Mbarara", "Mbarara City", "Mitooma", "Ntungamo", "Rubirizi", "Rwampara", "Sheema"],
    "Kigezi": ["Kabale", "Kanungu", "Kisoro", "Rubanda", "Rukiga", "Rukungiri"]
  }
};

// --- Helper Functions ---
const getAllDistricts = () => {
  const districts: string[] = [];
  Object.values(DISTRICTS_DATA).forEach(region => {
    Object.values(region).forEach(subRegionDistricts => {
      districts.push(...subRegionDistricts);
    });
  });
  return districts.sort();
};

const getSubcounties = (district: string | null) => {
  if (!district) return [];
  return [`${district} Central`, `${district} North`, `${district} South`, "Town Council"];
};

// --- Mock Data ---

const reportTemplates = [
  {
    id: "R-01",
    title: "Monthly Health Status",
    desc: "Aggregated vaccination rates, maternal health stats, and disease incidence trends.",
    sector: "Health",
    intent: "brand",
    formats: ["PDF", "Excel"]
  },
  {
    id: "R-02",
    title: "WASH Infrastructure Audit",
    desc: "Operational status of boreholes, latrines, and water points by sub-county.",
    sector: "WASH",
    intent: "warning",
    formats: ["Excel", "CSV"]
  },
  {
    id: "R-03",
    title: "Vulnerability Index",
    desc: "Targeting list for households classified as 'Critical Risk' or 'High Priority'.",
    sector: "General",
    intent: "brand",
    formats: ["PDF", "Excel"]
  },
  {
    id: "R-05",
    title: "Agri-Yield Forecast",
    desc: "Seasonal crop production estimates vs. targets with input gap analysis.",
    sector: "Agriculture",
    intent: "success",
    formats: ["Excel"]
  },
  {
    id: "R-04",
    title: "Donor Impact Deck",
    desc: "High-level visual summary of quarterly outcomes for external stakeholders.",
    sector: "Donor",
    intent: "neutral",
    formats: ["PPT"]
  },
];

const recentReports = [
  { name: "Health_Nov2025_Final.pdf", date: "Today, 10:30 AM", user: "Dr. Laker J.", size: "2.4 MB", status: "Ready" },
  { name: "WASH_Audit_Q3_Draft.xlsx", date: "Yesterday, 4:15 PM", user: "John O.", size: "850 KB", status: "Ready" },
  { name: "Beneficiary_List_Omoro.csv", date: "Nov 28, 2025", user: "System", size: "12.4 MB", status: "Processing" },
  { name: "Yield_Forecast_v2.xlsx", date: "Nov 27, 2025", user: "Admin", size: "450 KB", status: "Failed" },
];

// --- Types ---

type ReportConfig = {
  district: string;
  subcounty: string;
  period: string;
  startDate: string;
  endDate: string;
  features: string[];
};

// Filter Select Component
const FilterSelect = ({ value, onChange, options, placeholder, disabled }: any) => (
  <div className="relative min-w-[200px]">
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#004AAD] text-sm font-medium transition-colors ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
      <ChevronDown size={14} />
    </div>
  </div>
);

// Badge Component
function Badge({ children, intent = "brand", size = "md" }: { children: React.ReactNode, intent?: string, size?: string }) {
  const styles: Record<string, string> = {
    brand: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const sizeStyles = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-flex items-center font-bold rounded border ${styles[intent] || styles.brand} ${sizeStyles}`}>
      {children}
    </span>
  );
}

// --- Components ---

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const openNewReportModal = (templateId?: string) => {
    setSelectedTemplateId(templateId || reportTemplates[0].id);
    setIsModalOpen(true);
  };

  const filteredTemplates = reportTemplates.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Reports Center
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Generate compliant intelligence exports and impact assessments for {currentLocation}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export All
            </button>
            <button
              onClick={() => openNewReportModal()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
            >
              <FileText size={16} /> New Report
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          <FilterSelect
            value={selectedDistrict}
            onChange={(val: string) => {
              setSelectedDistrict(val || null);
              setSelectedSubcounty(null);
            }}
            options={allDistricts}
            placeholder="All Districts"
          />
          <FilterSelect
            value={selectedSubcounty}
            onChange={(val: string) => setSelectedSubcounty(val || null)}
            options={subcounties}
            placeholder="All Subcounties"
            disabled={!selectedDistrict}
          />
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {(selectedDistrict || selectedSubcounty || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDistrict(null);
                setSelectedSubcounty(null);
                setSearchTerm("");
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* 3. Templates Grid */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Standard Templates</h2>
          <span className="text-xs text-gray-400">{filteredTemplates.length} templates available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((report) => (
            <div
              key={report.id}
              onClick={() => openNewReportModal(report.id)}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${report.intent === 'brand' ? 'bg-indigo-50 text-indigo-600' :
                  report.intent === 'warning' ? 'bg-amber-50 text-amber-600' :
                    report.intent === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {report.formats.includes("PPT") ? <Presentation size={20} /> :
                    report.formats.includes("Excel") ? <FileSpreadsheet size={20} /> :
                      <FileBarChart size={20} />}
                </div>
                <Badge intent={report.intent}>{report.sector}</Badge>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {report.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                {report.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md bg-gray-50 text-xs font-semibold text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recent Activity */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Download History</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Recent Exports</h3>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
              View Audit Log
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentReports.map((file, i) => (
              <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors group">

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                    <File size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {file.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>By {file.user}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-mono">{file.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                  <StatusBadge status={file.status} />

                  <div className="flex items-center gap-2">
                    <button
                      disabled={file.status !== "Ready"}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      title="Download Again"
                    >
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Generation Modal */}
      {isModalOpen && (
        <ReportGeneratorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTemplateId={selectedTemplateId}
        />
      )}

    </main>
  );
}

// --- Sub-Components ---

function StatusBadge({ status }: { status: string }) {
  if (status === "Ready") {
    return <Badge intent="success" size="sm"><CheckCircle2 size={10} className="mr-1" /> READY</Badge>;
  }
  if (status === "Processing") {
    return <Badge intent="brand" size="sm"><Loader2 size={10} className="mr-1 animate-spin" /> GENERATING</Badge>;
  }
  return <Badge intent="danger" size="sm"><AlertCircle size={10} className="mr-1" /> FAILED</Badge>;
}

function ReportGeneratorModal({ isOpen, onClose, initialTemplateId }: { isOpen: boolean; onClose: () => void; initialTemplateId: string | null }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const [config, setConfig] = useState<ReportConfig>({
    district: "",
    subcounty: "",
    period: "last_30_days",
    startDate: "",
    endDate: "",
    features: ["compliance_check"],
  });

  const selectedTemplate = reportTemplates.find(t => t.id === initialTemplateId) || reportTemplates[0];
  const availableSubcounties = useMemo(() => getSubcounties(config.district || null), [config.district]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
    }, 2000);
  };

  const toggleFeature = (feature: string) => {
    if (config.features.includes(feature)) {
      setConfig({ ...config, features: config.features.filter(f => f !== feature) });
    } else {
      setConfig({ ...config, features: [...config.features, feature] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Generate Report</h3>
            <p className="text-xs text-gray-500">Configure parameters for {selectedTemplate.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8">

          {/* 1. Location Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</div>
              Geographic Scope
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">District</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={config.district}
                    onChange={(e) => setConfig({ ...config, district: e.target.value, subcounty: "" })}
                  >
                    <option value="">All Districts</option>
                    {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Sub-county</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                    value={config.subcounty}
                    onChange={(e) => setConfig({ ...config, subcounty: e.target.value })}
                    disabled={!config.district}
                  >
                    <option value="">All Sub-counties</option>
                    {availableSubcounties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Period Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</div>
              Reporting Period
            </div>

            <div className="ml-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: "last_30_days", label: "Last 30 Days" },
                  { id: "last_quarter", label: "Last Quarter" },
                  { id: "ytd", label: "Year to Date" },
                  { id: "custom", label: "Custom Range" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setConfig({ ...config, period: p.id })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${config.period === p.id
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {config.period === "custom" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Start Date</label>
                    <input type="date" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">End Date</label>
                    <input type="date" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FileText size={16} /> Generate Report
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}