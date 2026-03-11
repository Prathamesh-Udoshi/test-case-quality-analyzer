"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { cn, getScoreColor, getReadinessScoreColor } from "@/lib/utils";
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
      <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          Analyzing {SAMPLE_TEXTS.length} sample requirements...
        </p>
      </div>
    );
  }

  if (analysisRun && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
        <XCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-muted-foreground">
          Could not load dashboard data. Make sure the API is running.
        </p>
        <button
          onClick={runDashboardAnalysis}
          className="text-xs text-primary-light hover:text-primary transition"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Computed Metrics ── */
  const total = results.length;
  const readyCt = results.filter(
    (r) => r.readiness_level === "Ready"
  ).length;
  const clarifCt = results.filter(
    (r) => r.readiness_level === "Needs clarification"
  ).length;
  const riskCt = results.filter(
    (r) => r.readiness_level === "High risk for automation"
  ).length;

  const avgAmbiguity =
    results.reduce((s, r) => s + (r.ambiguity?.score ?? 0), 0) / total;
  const avgAssumptions =
    results.reduce((s, r) => s + (r.assumptions?.score ?? 0), 0) / total;
  const avgReadiness =
    results.reduce((s, r) => s + (r.readiness_score ?? 0), 0) / total;

  /* Pie data */
  const pieData = [
    { name: "Ready", value: readyCt },
    { name: "Needs Clarification", value: clarifCt },
    { name: "High Risk", value: riskCt },
  ].filter((d) => d.value > 0);

  /* Issue type distribution */
  const issueTypeCounts: Record<string, number> = {};
  results.forEach((r) =>
    r.issues?.forEach((iss) => {
      issueTypeCounts[iss.type] = (issueTypeCounts[iss.type] || 0) + 1;
    })
  );
  const issueBarData = Object.entries(issueTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  /* Radar data (averages) */
  const avgLexical =
    results.reduce(
      (s, r) => s + (r.ambiguity?.components?.lexical ?? 0),
      0
    ) / total;
  const avgTest =
    results.reduce(
      (s, r) => s + (r.ambiguity?.components?.testability ?? 0),
      0
    ) / total;
  const avgRef =
    results.reduce(
      (s, r) => s + (r.ambiguity?.components?.references ?? 0),
      0
    ) / total;
  const avgEnvCount =
    results.reduce(
      (s, r) => s + (r.assumptions?.components?.environment?.count ?? 0),
      0
    ) / total;
  const avgDataCount =
    results.reduce(
      (s, r) => s + (r.assumptions?.components?.data?.count ?? 0),
      0
    ) / total;
  const avgStateCount =
    results.reduce(
      (s, r) => s + (r.assumptions?.components?.state?.count ?? 0),
      0
    ) / total;

  const radarData = [
    { dimension: "Lexical", value: avgLexical },
    { dimension: "Testability", value: avgTest },
    { dimension: "References", value: avgRef },
    { dimension: "Env Deps", value: avgEnvCount * 10 },
    { dimension: "Data Deps", value: avgDataCount * 10 },
    { dimension: "State Deps", value: avgStateCount * 10 },
  ];

  /* Score distribution bar chart */
  const scoreDistribution = results.map((r, i) => ({
    name: `#${i + 1}`,
    readiness: r.readiness_score,
    ambiguity: r.ambiguity?.score ?? 0,
  }));

  const tooltipStyle = {
    contentStyle: {
      background: "#0f0f13",
      border: "1px solid #27272a",
      borderRadius: "8px",
      fontSize: "11px",
      color: "#fafafa",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-light" />
            Quality Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Quality metrics across {total} analyzed requirements
          </p>
        </div>
        <button
          onClick={runDashboardAnalysis}
          className="text-xs text-primary-light hover:text-primary flex items-center gap-1 transition"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Analyzed",
            value: total,
            icon: BarChart3,
            color: "text-primary-light",
          },
          {
            label: "Ready",
            value: `${((readyCt / total) * 100).toFixed(0)}%`,
            icon: CheckCircle2,
            color: "text-green-400",
          },
          {
            label: "Needs Work",
            value: `${((clarifCt / total) * 100).toFixed(0)}%`,
            icon: AlertTriangle,
            color: "text-amber-400",
          },
          {
            label: "High Risk",
            value: `${((riskCt / total) * 100).toFixed(0)}%`,
            icon: XCircle,
            color: "text-red-400",
          },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Average scores */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Avg Ambiguity",
            value: avgAmbiguity,
            colorFn: getScoreColor,
          },
          {
            label: "Avg Assumptions",
            value: avgAssumptions,
            colorFn: getScoreColor,
          },
          {
            label: "Avg Readiness",
            value: avgReadiness,
            colorFn: getReadinessScoreColor,
          },
        ].map(({ label, value, colorFn }) => (
          <div
            key={label}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <p
              className="text-3xl font-bold"
              style={{ color: colorFn(value) }}
            >
              {value.toFixed(1)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Readiness Distribution */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-4">
            Readiness Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Radar */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-4">
            Quality Dimensions Radar
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold mb-4">
          Score Comparison per Requirement
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
              />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey="readiness"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                name="Readiness"
              />
              <Bar
                dataKey="ambiguity"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Ambiguity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issue Type Distribution */}
      {issueBarData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-4">
            Most Common Issue Types
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={issueBarData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  type="number"
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  width={80}
                />
                <Tooltip {...tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill="#818cf8"
                  radius={[0, 4, 4, 0]}
                  name="Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
