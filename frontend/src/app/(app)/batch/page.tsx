"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Upload,
  FileSpreadsheet,
  Loader2,
  Download,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { cn, getReadinessColor, truncate } from "@/lib/utils";
import { analyzeBatch } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DEFAULT_EXAMPLES = [
  "The system should load fast and handle errors properly",
  "User logs in with valid credentials and accesses dashboard",
  "Click the submit button and verify error message appears",
  "The application must respond quickly to user interactions",
  "Given user is logged in, when clicking save, then data should persist",
  "System should be scalable and handle up to 1000 concurrent users",
  "Navigate to user profile page and update personal information",
];

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function BatchPage() {
  const [inputMode, setInputMode] = useState<"manual" | "csv" | "sample">(
    "manual"
  );
  const [manualText, setManualText] = useState("");
  const [texts, setTexts] = useState<string[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Parse input into texts array */
  const getTexts = (): string[] => {
    if (inputMode === "manual") {
      return manualText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    }
    if (inputMode === "sample") return DEFAULT_EXAMPLES;
    return texts;
  };

  /* CSV upload handler */
  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      const lines = csv.split("\n").map((l) => l.trim());
      const header = lines[0]?.toLowerCase().split(",");
      const textIdx = header?.indexOf("text") ?? -1;
      if (textIdx === -1) {
        setError("CSV must contain a 'text' column");
        return;
      }
      const parsed = lines
        .slice(1)
        .map((l) => {
          const cols = l.split(",");
          return cols[textIdx]?.replace(/^"|"$/g, "").trim();
        })
        .filter(Boolean) as string[];
      setTexts(parsed);
      setError(null);
    };
    reader.readAsText(file);
  };

  /* Run batch analysis */
  const handleAnalyze = async () => {
    const items = getTexts();
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeBatch(items);
      setResults(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Batch analysis failed");
    } finally {
      setLoading(false);
    }
  };

  /* Export CSV */
  const handleExport = () => {
    const items = getTexts();
    const header = "ID,Text,Ambiguity,Assumptions,Readiness,Status,Issues\n";
    const rows = results
      .map((r, i) => {
        const t = items[i]?.replace(/,/g, ";") || "";
        return `${i + 1},"${t}",${r.ambiguity?.score ?? "ERR"},${r.assumptions?.score ?? "ERR"},${r.readiness_score ?? "ERR"},${r.readiness_level ?? "ERR"},${r.issues?.length ?? 0}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test_case_analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentTexts = getTexts();
  const validResults = results.filter(
    (r) => r && r.readiness_score !== undefined
  );

  /* Distribution pie data */
  const dist: Record<string, number> = {};
  validResults.forEach((r) => {
    const l = r.readiness_level || "Unknown";
    dist[l] = (dist[l] || 0) + 1;
  });
  const pieData = Object.entries(dist).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-10 animate-fade-in py-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10">
            <Layers className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="gradient-text">Batch</span> Analysis
        </h1>
        <p className="text-[14px] text-zinc-500 max-w-xl font-medium leading-relaxed">
          Analyze multiple test cases at once for efficient, high-volume quality assessment.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-1">
          {(["manual", "csv", "sample"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                inputMode === mode
                  ? "bg-zinc-800 text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {mode === "manual"
                ? "Manual Entry"
                : mode === "csv"
                ? "CSV Upload"
                : "Sample Data"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* Form Content */}
          {inputMode === "manual" && (
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Enter requirements (one per line)..."
              rows={8}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-5 py-4 text-[14px] text-zinc-300 placeholder:text-zinc-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          )}

          {inputMode === "csv" && (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-4 py-16 rounded-xl border-2 border-dashed border-zinc-800 hover:border-indigo-500/30 bg-zinc-950/50 cursor-pointer transition-all group"
            >
              <div className="p-4 rounded-full bg-zinc-900 group-hover:bg-indigo-500/10 transition-colors">
                <Upload className="h-8 w-8 text-zinc-600 group-hover:text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-400">Click to upload CSV research</p>
                <p className="text-xs text-zinc-600 mt-1 uppercase tracking-tighter">Must contain a &apos;text&apos; column</p>
              </div>
              {texts.length > 0 && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-green-400 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/20">
                  ✓ {texts.length} Requirements Loaded
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSV}
              />
            </div>
          )}

          {inputMode === "sample" && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Using {DEFAULT_EXAMPLES.length} Standard Samples:
              </p>
              <div className="grid gap-2">
                {DEFAULT_EXAMPLES.map((e, i) => (
                  <div key={i} className="flex gap-3 text-[12px] text-zinc-500 font-medium">
                    <span className="text-indigo-500/60 font-mono">{i + 1}.</span>
                    <span className="truncate">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
             {currentTexts.length > 0 ? (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{currentTexts.length} Queued</span>
               </div>
             ) : <div />}
             
             <button
              onClick={handleAnalyze}
              disabled={loading || currentTexts.length === 0}
              className={cn(
                "min-w-64 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all",
                "bg-indigo-600 text-white shadow-lg shadow-indigo-600/5",
                "hover:bg-indigo-500 hover:shadow-indigo-600/10 active:scale-[0.98]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing {currentTexts.length} Items
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Process Batch Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {validResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Ambiguity Index", value: (validResults.reduce((s, r) => s + (r.ambiguity?.score ?? 0), 0) / validResults.length).toFixed(1) },
                { label: "Assumption Gap", value: (validResults.reduce((s, r) => s + (r.assumptions?.score ?? 0), 0) / validResults.length).toFixed(1) },
                { label: "Readiness Mean", value: (validResults.reduce((s, r) => s + (r.readiness_score ?? 0), 0) / validResults.length).toFixed(1) },
                { label: "Total Items", value: validResults.length.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 text-center">
                  <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
              {/* Results Table */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Dataset Breakdown</h3>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 hover:bg-zinc-700 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        <th className="px-6 py-4 text-left">Ref</th>
                        <th className="px-6 py-4 text-left">Requirement String</th>
                        <th className="px-6 py-4 text-right">Readiness</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {validResults.map((r, i) => (
                        <tr key={i} className="hover:bg-zinc-800/20 transition-colors group">
                          <td className="px-6 py-4 text-zinc-700 font-mono">{i + 1}</td>
                          <td className="px-6 py-4 max-w-[280px] truncate text-zinc-400 font-medium group-hover:text-zinc-200">
                            {currentTexts[i] || "—"}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-white">
                            {r.readiness_score?.toFixed(1) ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                r.readiness_level === "Ready" ? "bg-green-500/5 border-green-500/20 text-green-400" :
                                r.readiness_level === "Needs clarification" ? "bg-amber-500/5 border-amber-500/20 text-amber-400" :
                                "bg-red-500/5 border-red-500/20 text-red-400"
                              )}>
                                {r.readiness_level}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-zinc-500 font-bold">
                            {r.issues?.length ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart Sidebar */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex flex-col items-center">
                <h3 className="text-[10px] font-bold text-zinc-200 uppercase tracking-[0.2em] mb-8 w-full">Readiness Spread</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#09090b",
                          border: "1px solid #27272a",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 w-full space-y-3">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-zinc-500">{d.name}</span>
                      </div>
                      <span className="text-white">{d.value} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
