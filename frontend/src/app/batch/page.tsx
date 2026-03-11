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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary-light" />
          Batch Analysis
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyze multiple test cases at once for efficient quality assessment.
        </p>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex gap-2">
        {(["manual", "csv", "sample"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-medium border transition",
              inputMode === mode
                ? "bg-primary/10 border-primary/30 text-primary-light"
                : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
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

      {/* Input Area */}
      {inputMode === "manual" && (
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Enter requirements (one per line)..."
          rows={8}
          className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        />
      )}

      {inputMode === "csv" && (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 py-12 rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-card cursor-pointer transition"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload CSV with a &apos;text&apos; column
          </p>
          {texts.length > 0 && (
            <p className="text-xs text-green-400">
              ✓ {texts.length} requirements loaded
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
        <div className="bg-card rounded-xl border border-border p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground mb-2">
            Using {DEFAULT_EXAMPLES.length} sample requirements:
          </p>
          {DEFAULT_EXAMPLES.map((e, i) => (
            <p key={i}>
              {i + 1}. {e}
            </p>
          ))}
        </div>
      )}

      {/* Preview */}
      {currentTexts.length > 0 && inputMode !== "sample" && (
        <details className="bg-card rounded-xl border border-border">
          <summary className="px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer flex items-center gap-2">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {currentTexts.length} requirements to analyze
            <ChevronDown className="h-3 w-3 ml-auto" />
          </summary>
          <div className="px-4 pb-3 space-y-1 text-xs text-foreground/80 max-h-40 overflow-y-auto">
            {currentTexts.map((t, i) => (
              <p key={i}>
                {i + 1}. {truncate(t, 80)}
              </p>
            ))}
          </div>
        </details>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || currentTexts.length === 0}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          !loading && currentTexts.length > 0 && "glow-primary"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing {currentTexts.length} requirements...
          </>
        ) : (
          <>
            <BarChart3 className="h-4 w-4" />
            Analyze Batch
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {validResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Avg Ambiguity",
                  value: (
                    validResults.reduce(
                      (s, r) => s + (r.ambiguity?.score ?? 0),
                      0
                    ) / validResults.length
                  ).toFixed(1),
                },
                {
                  label: "Avg Assumptions",
                  value: (
                    validResults.reduce(
                      (s, r) => s + (r.assumptions?.score ?? 0),
                      0
                    ) / validResults.length
                  ).toFixed(1),
                },
                {
                  label: "Avg Readiness",
                  value: (
                    validResults.reduce(
                      (s, r) => s + (r.readiness_score ?? 0),
                      0
                    ) / validResults.length
                  ).toFixed(1),
                },
                {
                  label: "Total Analyzed",
                  value: validResults.length.toString(),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-card rounded-xl border border-border p-4 text-center"
                >
                  <p className="text-2xl font-bold gradient-text">{value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Distribution Chart */}
            {pieData.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold mb-4">
                  Readiness Distribution
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f0f13",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Detailed Results</h3>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-xs text-primary-light hover:text-primary transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-4 py-2.5 text-left font-medium">#</th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Text
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Ambiguity
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Assumptions
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Readiness
                      </th>
                      <th className="px-4 py-2.5 text-center font-medium">
                        Status
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Issues
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {validResults.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-muted/30 transition"
                      >
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2.5 max-w-[200px] truncate">
                          {currentTexts[i] || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {r.ambiguity?.score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {r.assumptions?.score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {r.readiness_score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              getReadinessColor(r.readiness_level)
                            )}
                          >
                            {r.readiness_level}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {r.issues?.length ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
