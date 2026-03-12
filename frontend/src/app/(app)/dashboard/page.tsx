"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeBatch } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const SAMPLE_TEXTS = [
  "The system should load fast and handle errors properly",
  "User logs in with valid credentials and accesses dashboard",
  "Click the submit button and verify error message appears",
  "The application must respond quickly to user interactions",
  "Given user is logged in, when clicking save, then data should persist",
  "System should be scalable and handle up to 1000 concurrent users",
  "Navigate to user profile page and update personal information",
  "When the user clicks delete, the record should be removed",
  "The search function should return relevant results quickly",
  "Upload a CSV file and verify data is imported correctly",
  "Admin user can manage roles and permissions",
  "The dashboard should display real-time metrics",
];

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisRun, setAnalysisRun] = useState(false);

  const runDashboardAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyzeBatch(SAMPLE_TEXTS);
      setResults(res.filter((r) => r && r.readiness_score !== undefined));
    } catch {
      // silently handle — dashboard will show empty state
    } finally {
      setLoading(false);
      setAnalysisRun(true);
    }
  }, []);

  useEffect(() => {
    runDashboardAnalysis();
  }, [runDashboardAnalysis]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin relative" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white uppercase tracking-widest px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
            Generating Intelligence
          </p>
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-tighter">
            Analyzing baseline dataset...
          </p>
        </div>
      </div>
    );
  }

  if (analysisRun && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 animate-fade-in">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <div className="text-center space-y-4">
          <p className="text-sm font-bold text-zinc-200 uppercase tracking-widest">
            Dataset Unavailable
          </p>
          <button
            onClick={runDashboardAnalysis}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 text-[11px] font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-all"
          >
            Reconnect API
          </button>
        </div>
      </div>
    );
  }

  /* ── Computed Metrics ── */
  const total = results.length;
  const readyCt = results.filter((r) => r.readiness_level === "Ready").length;
  const clarifCt = results.filter((r) => r.readiness_level === "Needs clarification").length;
  const riskCt = results.filter((r) => r.readiness_level === "High risk for automation").length;

  const avgAmbiguity = results.reduce((s, r) => s + (r.ambiguity?.score ?? 0), 0) / total;
  const avgAssumptions = results.reduce((s, r) => s + (r.assumptions?.score ?? 0), 0) / total;
  const avgReadiness = results.reduce((s, r) => s + (r.readiness_score ?? 0), 0) / total;

  /* Pie data */
  const pieData = [
    { name: "Ready", value: readyCt },
    { name: "Clarification", value: clarifCt },
    { name: "High Risk", value: riskCt },
  ].filter((d) => d.value > 0);

  /* Issue distribution */
  const issueTypeCounts: Record<string, number> = {};
  results.forEach((r) =>
    r.issues?.forEach((iss) => {
      issueTypeCounts[iss.type] = (issueTypeCounts[iss.type] || 0) + 1;
    })
  );
  const issueBarData = Object.entries(issueTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  /* Radar data */
  const radarData = [
    { dim: "Lexical", val: results.reduce((s, r) => s + (r.ambiguity?.components?.lexical ?? 0), 0) / total },
    { dim: "Testability", val: results.reduce((s, r) => s + (r.ambiguity?.components?.testability ?? 0), 0) / total },
    { dim: "References", val: results.reduce((s, r) => s + (r.ambiguity?.components?.references ?? 0), 0) / total },
    { dim: "Env Deps", val: (results.reduce((s, r) => s + (r.assumptions?.components?.environment?.count ?? 0), 0) / total) * 10 },
    { dim: "Data Deps", val: (results.reduce((s, r) => s + (r.assumptions?.components?.data?.count ?? 0), 0) / total) * 10 },
    { dim: "State Deps", val: (results.reduce((s, r) => s + (r.assumptions?.components?.state?.count ?? 0), 0) / total) * 10 },
  ];

  /* Bar chart data */
  const scoreDistribution = results.map((r, i) => ({
    name: `#${i + 1}`,
    ready: r.readiness_score,
    ambig: r.ambiguity?.score ?? 0,
  }));

  const chartTheme = {
    background: "#09090b",
    border: "#27272a",
    text: "#a1a1aa",
    indigo: "#6366f1",
    green: "#22c55e",
    amber: "#f59e0b",
  };

  const tooltipStyle = {
    contentStyle: {
      background: chartTheme.background,
      border: `1px solid ${chartTheme.border}`,
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "bold",
      color: "#fff",
      padding: "8px 12px"
    },
  };

  return (
    <div className="space-y-12 animate-fade-in py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <LayoutDashboard className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="gradient-text">Quality</span> Intelligence
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Aggregated metrics across baseline dataset ({total} requirements)
          </p>
        </div>
        <button
          onClick={runDashboardAnalysis}
          className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold uppercase tracking-widest text-indigo-400 hover:text-white hover:border-indigo-500/30 transition-all"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Re-Analyze
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Directly Ready", value: `${((readyCt / total) * 100).toFixed(0)}%`, icon: CheckCircle2, color: "text-green-500" },
          { label: "Avg Readiness", value: avgReadiness.toFixed(1), icon: BarChart3, color: "text-indigo-400" },
          { label: "Needs Work", value: `${((clarifCt / total) * 100).toFixed(0)}%`, icon: AlertTriangle, color: "text-amber-500" },
          { label: "High Risk", value: `${((riskCt / total) * 100).toFixed(0)}%`, icon: XCircle, color: "text-red-500" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon className={cn("h-4 w-4", color)} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Primary Insights Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Distribution Pie */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 lg:col-span-1">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-8">Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{d.name}</span>
                </div>
                <span className="text-[12px] font-mono text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Radar */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 lg:col-span-2">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-8">Dimension Analysis Radar</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={chartTheme.border} />
                <PolarAngleAxis
                  dataKey="dim"
                  tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: "bold" }}
                />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar
                  dataKey="val"
                  stroke={chartTheme.indigo}
                  fill={chartTheme.indigo}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-[11px] text-zinc-500 text-center font-medium italic">
            Visualizing average scores across lexical, testability, and environmental dependency vectors.
          </p>
        </div>
      </div>

      {/* Comparisons Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-8">Baseline Volume Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.text, fontSize: 10 }} />
                <YAxis tick={{ fill: chartTheme.text, fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="ready" fill={chartTheme.green} radius={[4, 4, 0, 0]} name="Readiness" />
                <Bar dataKey="ambig" fill={chartTheme.amber} radius={[4, 4, 0, 0]} name="Ambiguity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-8">Global Issue Frequency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueBarData} layout="vertical">
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartTheme.text, fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: "bold" }} width={90} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill={chartTheme.indigo} radius={[0, 4, 4, 0]} name="Frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
