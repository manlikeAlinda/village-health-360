"use client";

import { useState } from "react";
import { 
  FileText, FileSpreadsheet, Download, Filter, 
  Calendar, CheckCircle2, FileBarChart, Presentation,
  Search, MoreHorizontal, Clock, AlertCircle, File
} from "lucide-react";

// --- Mock Data ---
const reportTemplates = [
  { 
    id: "R-01", 
    title: "Monthly Health Status", 
    desc: "Aggregated vaccination rates, maternal health stats, and disease incidence trends.", 
    sector: "Health",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    formats: ["PDF", "Excel"] 
  },
  { 
    id: "R-02", 
    title: "WASH Infrastructure Audit", 
    desc: "Operational status of boreholes, latrines, and water points by sub-county.", 
    sector: "WASH",
    color: "bg-orange-50 text-orange-700 border-orange-100",
    formats: ["Excel", "CSV"] 
  },
  { 
    id: "R-03", 
    title: "Vulnerability Index", 
    desc: "Targeting list for households classified as 'Critical Risk' or 'High Priority'.", 
    sector: "General",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    formats: ["PDF", "Excel"] 
  },
  { 
    id: "R-05", 
    title: "Agri-Yield Forecast", 
    desc: "Seasonal crop production estimates vs. targets with input gap analysis.", 
    sector: "Agriculture",
    color: "bg-green-50 text-green-700 border-green-100",
    formats: ["Excel"] 
  },
  { 
    id: "R-04", 
    title: "Donor Impact Deck", 
    desc: "High-level visual summary of quarterly outcomes for external stakeholders.", 
    sector: "Donor",
    color: "bg-gray-50 text-gray-700 border-gray-100",
    formats: ["PPT"] 
  },
];

const recentReports = [
  { name: "Health_Nov2025_Final.pdf", date: "Today, 10:30 AM", user: "Dr. Laker J.", size: "2.4 MB", status: "Ready" },
  { name: "WASH_Audit_Q3_Draft.xlsx", date: "Yesterday, 4:15 PM", user: "John O.", size: "850 KB", status: "Ready" },
  { name: "Beneficiary_List_Omoro.csv", date: "Nov 28, 2025", user: "System", size: "12.4 MB", status: "Processing" },
  { name: "Yield_Forecast_v2.xlsx", date: "Nov 27, 2025", user: "Admin", size: "450 KB", status: "Failed" },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="space-y-8 bg-gray-50/50 min-h-screen p-6">
      
      {/* 1. Header: Context & Search */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            Automated intelligence exports and historical archives.
          </p>
        </div>
        
        <div className="flex flex-1 md:justify-end gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md transition-all active:scale-95">
            <FileText size={16} /> New Report
          </button>
        </div>
      </header>

      {/* 2. Templates Grid: Visual Cards */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Standard Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map((report) => (
            <div key={report.id} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${report.color}`}>
                   {report.formats.includes("PPT") ? <Presentation size={20} /> : 
                    report.formats.includes("Excel") ? <FileSpreadsheet size={20} /> : 
                    <FileBarChart size={20} />}
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${report.color}`}>
                  {report.sector}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {report.desc}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                {report.formats.map((fmt) => (
                  <button 
                    key={fmt} 
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95"
                  >
                    <Download size={14} /> {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recent Activity: Data Table */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm">Download History</h3>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
            View All Logs
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
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
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
      </section>
    </main>
  );
}

// --- Component System ---

function StatusBadge({ status }: { status: string }) {
  if (status === "Ready") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
        <CheckCircle2 size={12} /> READY
      </span>
    );
  }
  if (status === "Processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 animate-pulse">
        <Clock size={12} /> GENERATING...
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
      <AlertCircle size={12} /> FAILED
    </span>
  );
}