"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Download, FileText, BarChart3, Users, Calendar, Mail, Share2, Settings } from "lucide-react"

export default function ReportingExportCenter({ testData, analyticsData, filters, onExport }) {
  const [selectedReports, setSelectedReports] = useState([])
  const [exportFormat, setExportFormat] = useState("pdf")
  const [emailRecipients, setEmailRecipients] = useState("")
  const [scheduledReports, setScheduledReports] = useState([])

  const reportTypes = [
    {
      id: "overview",
      name: "Test Overview Report",
      description: "Complete test performance summary with key metrics",
      icon: BarChart3,
      size: "2.3 MB",
      pages: 8,
    },
    {
      id: "student-performance",
      name: "Student Performance Analysis",
      description: "Individual student performance breakdown and rankings",
      icon: Users,
      size: "4.1 MB",
      pages: 15,
    },
    {
      id: "question-analytics",
      name: "Question Analytics Report",
      description: "Detailed question-wise performance and difficulty analysis",
      icon: FileText,
      size: "3.2 MB",
      pages: 12,
    },
    {
      id: "subject-intelligence",
      name: "Subject Intelligence Report",
      description: "Subject and topic-wise performance insights",
      icon: BarChart3,
      size: "2.8 MB",
      pages: 10,
    },
    {
      id: "advanced-analytics",
      name: "Advanced Analytics Suite",
      description: "AI-powered insights, predictions, and recommendations",
      icon: Settings,
      size: "5.5 MB",
      pages: 20,
    },
    {
      id: "executive-summary",
      name: "Executive Summary",
      description: "High-level overview for administrators and stakeholders",
      icon: FileText,
      size: "1.2 MB",
      pages: 4,
    },
  ]

  const exportFormats = [
    { value: "pdf", label: "PDF Document", icon: FileText },
    { value: "excel", label: "Excel Spreadsheet", icon: BarChart3 },
    { value: "csv", label: "CSV Data", icon: FileText },
    { value: "json", label: "JSON Data", icon: Settings },
  ]

  const handleReportToggle = (reportId) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleBulkExport = async () => {
    if (selectedReports.length === 0) {
      alert("Please select at least one report to export")
      return
    }

    for (const reportId of selectedReports) {
      await onExport(exportFormat, { ...filters, reportType: reportId })
    }
  }

  const handleScheduleReport = () => {
    // Implementation for scheduling reports
    console.log("Scheduling report...")
  }

  const handleEmailReport = () => {
    // Implementation for emailing reports
    console.log("Emailing report to:", emailRecipients)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
          Reports & Export Center
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-300"
          >
            {exportFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <Button
            onClick={handleBulkExport}
            disabled={selectedReports.length === 0}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected ({selectedReports.length})
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 text-teal-400 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Quick Export</h3>
            <p className="text-slate-400 text-sm mb-3">Export all data instantly</p>
            <Button onClick={() => onExport("pdf")} size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
              Export All
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Email Reports</h3>
            <p className="text-slate-400 text-sm mb-3">Send to stakeholders</p>
            <Button onClick={handleEmailReport} size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Setup Email
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Schedule Reports</h3>
            <p className="text-slate-400 text-sm mb-3">Automated delivery</p>
            <Button onClick={handleScheduleReport} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
              Schedule
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Share2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Share Dashboard</h3>
            <p className="text-slate-400 text-sm mb-3">Generate public link</p>
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
              Share Link
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            Available Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportTypes.map((report) => {
              const Icon = report.icon
              const isSelected = selectedReports.includes(report.id)

              return (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                  }`}
                  onClick={() => handleReportToggle(report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-teal-500/20" : "bg-slate-600/20"}`}>
                        <Icon className={`h-6 w-6 ${isSelected ? "text-teal-400" : "text-slate-400"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">{report.name}</h3>
                        <p className="text-slate-400 text-sm">{report.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span>{report.pages} pages</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onExport(exportFormat, { ...filters, reportType: report.id })
                        }}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? "border-teal-500 bg-teal-500" : "border-slate-500"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Recipients (comma-separated)
              </label>
              <input
                type="text"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="admin@school.edu, principal@school.edu"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-300 placeholder-slate-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleEmailReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Mail className="h-4 w-4 mr-2" />
                Send Reports Now
              </Button>
              <Button
                onClick={handleScheduleReport}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Weekly
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-teal-400" />
                <div>
                  <p className="text-slate-200 font-medium">Complete Analytics Report</p>
                  <p className="text-slate-400 text-sm">Exported 2 hours ago • PDF • 8.2 MB</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                Download Again
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-slate-200 font-medium">Student Performance Data</p>
                  <p className="text-slate-400 text-sm">Exported yesterday • Excel • 3.1 MB</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                Download Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
