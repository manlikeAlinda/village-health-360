"use client";

import { 
  FileText, FileSpreadsheet, Download, Filter, 
  Calendar, CheckCircle, FileBarChart, Presentation 
} from "lucide-react";

// 1. Mock Data: Report Templates [cite: 581-586]
const reportTemplates = [
  { 
    id: "R-01", 
    title: "Monthly Health Status", 
    desc: "Vaccination rates, maternal health stats, and disease incidence.", 
    sector: "Health",
    formats: ["PDF", "Excel"] 
  },
  { 
    id: "R-02", 
    title: "WASH Infrastructure Audit", 
    desc: "Functional vs. broken water points and sanitation coverage.", 
    sector: "WASH",
    formats: ["Excel", "CSV"] 
  },
  { 
    id: "R-03", 
    title: "Vulnerability Index Summary", 
    desc: "List of critical-risk households needing immediate intervention.", 
    sector: "General",
    formats: ["PDF", "Excel"] 
  },
  { 
    id: "R-04", 
    title: "Donor Impact Presentation", 
    desc: "Auto-generated slides showing key outcomes vs. targets.", 
    sector: "Donor",
    formats: ["PPT"] 
  },
  { 
    id: "R-05", 
    title: "Agricultural Yield Forecast", 
    desc: "Crop production estimates and input support needs.", 
    sector: "Agriculture",
    formats: ["Excel"] 
  },
];

// 2. Mock Data: Recently Generated Reports
const recentReports = [
  { name: "Gulu_Health_Report_Nov2025.pdf", date: "Today, 10:30 AM", user: "Dr. Sarah A.", size: "2.4 MB" },
  { name: "WASH_Audit_Q3.xlsx", date: "Yesterday, 4:15 PM", user: "John O.", size: "850 KB" },
  { name: "Beneficiary_List_Omoro.csv", date: "Nov 28, 2025", user: "Admin", size: "120 KB" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
          <p className="text-gray-500 text-sm">Automated Reporting & Data Exports</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <FileText size={16} /> Custom Report
          </button>
        </div>
      </div>

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${
                report.sector === "Health" ? "bg-blue-50 text-brand-blue" :
                report.sector === "WASH" ? "bg-orange-50 text-orange-600" :
                report.sector === "Agriculture" ? "bg-green-50 text-green-600" :
                "bg-gray-100 text-gray-600"
              }`}>
                {report.formats.includes("PPT") ? <Presentation size={24} /> : 
                 report.formats.includes("Excel") ? <FileSpreadsheet size={24} /> : 
                 <FileBarChart size={24} />}
              </div>
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs font-medium uppercase tracking-wide">
                {report.sector}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-500 mb-6 h-10">{report.desc}</p>
            
            <div className="flex gap-2">
              {report.formats.map((fmt) => (
                <button 
                  key={fmt} 
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-brand-blue/30 hover:text-brand-blue transition-colors"
                >
                  <Download size={14} /> {fmt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recently Generated Reports</h3>
          <button className="text-sm text-brand-blue hover:underline font-medium">View All History</button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentReports.map((file, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {file.date}</span>
                    <span>•</span>
                    <span>Generated by {file.user}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">{file.size}</span>
                <button className="text-gray-400 hover:text-brand-blue transition-colors">
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}