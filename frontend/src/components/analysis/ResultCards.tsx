"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Database,
  Monitor,
  Zap,
} from "lucide-react";
import { cn, getScoreColor } from "@/lib/utils";
import type { ImpactIssue, AmbiguityAnalysis, AssumptionAnalysis, AssumptionComponentDetail } from "@/lib/types";

/* ── Readiness Meter ── */
export function ReadinessMeter({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  const rounded = Math.round(score);
  const color =
    level === "Ready"
      ? "#22c55e"
      : level === "Needs clarification"
      ? "#f59e0b"
      : "#ef4444";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (rounded / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/40"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {rounded}
          </motion.span>
          <span className="text-[11px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span
        className={cn(
          "text-xs font-semibold px-3 py-1 rounded-full border",
          level === "Ready"
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : level === "Needs clarification"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}
      >
        {level}
      </span>
    </div>
  );
}

/* ── Confidence Badge ── */
export function ConfidenceBadge({
  confidence,
}: {
  confidence: "HIGH" | "MEDIUM" | "LOW";
}) {
  const config = {
    HIGH: {
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
      icon: CheckCircle2,
      label: "High Confidence",
      desc: "Analysis based on clear signals and sufficient context",
    },
    MEDIUM: {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      icon: AlertTriangle,
      label: "Medium Confidence",
      desc: "Results should be reviewed — moderate confidence",
    },
    LOW: {
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      icon: XCircle,
      label: "Low Confidence",
      desc: "Requirement is very short or lacks context",
    },
  }[confidence];

  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs", config.bg)}>
      <Icon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
      <span className={cn("font-medium", config.color)}>{config.label}</span>
      <span className="text-muted-foreground">— {config.desc}</span>
    </div>
  );
}

/* ── Score Bar ── */
export function ScoreBar({
  label,
  score,
  maxScore = 100,
  helpText,
}: {
  label: string;
  score: number;
  maxScore?: number;
  helpText?: string;
}) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const color = getScoreColor(score);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">{label}</span>
          {helpText && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              {showHelp ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
        <span className="font-mono" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence>
        {showHelp && helpText && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-[11px] text-muted-foreground leading-relaxed overflow-hidden"
          >
            {helpText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Ambiguity Breakdown ── */
export function AmbiguityBreakdown({ data }: { data: AmbiguityAnalysis }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary-light" />
        Ambiguity Analysis
      </h3>
      <div className="grid gap-3">
        <ScoreBar
          label="Lexical Issues"
          score={data.components.lexical}
          helpText="Subjective or vague terms like 'fast', 'user-friendly', 'secure' that lack measurable criteria."
        />
        <ScoreBar
          label="Testability Gaps"
          score={data.components.testability}
          helpText="Phrases like 'works correctly' or 'handles properly' that can't be objectively verified."
        />
        <ScoreBar
          label="Reference Issues"
          score={data.components.references}
          helpText="Pronouns like 'it', 'this', 'that' without clear antecedents — may confuse which object or condition is being referenced."
        />
      </div>
    </div>
  );
}

/* ── Assumption Breakdown ── */
export function AssumptionBreakdown({ data }: { data: AssumptionAnalysis }) {
  const categories: {
    key: keyof typeof data.components;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: "environment", label: "Environment", icon: Monitor },
    { key: "data", label: "Data", icon: Database },
    { key: "state", label: "State", icon: Shield },
  ];

  const hasAny = categories.some(
    (c) => data.components[c.key].count > 0
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary-light" />
        Assumption Analysis
      </h3>
      {!hasAny ? (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>No significant assumptions detected — self-contained requirement</span>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(({ key, label, icon: Icon }) => {
            const comp: AssumptionComponentDetail = data.components[key];
            if (comp.count === 0) return null;
            const isStrong = comp.strength === "STRONG";
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs",
                  isStrong
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isStrong ? "text-red-400" : "text-amber-400"
                    )}
                  />
                  <span className="font-medium">{label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                      isStrong
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    )}
                  >
                    {isStrong ? "CRITICAL" : "MINOR"}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {comp.count} hidden {comp.count === 1 ? "dependency" : "dependencies"}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Issue List ── */
export function IssueList({ issues }: { issues: ImpactIssue[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!issues.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        Quality Issues ({issues.length})
      </h3>
      <div className="space-y-2">
        {issues.map((issue, idx) => {
          const expanded = expandedIdx === idx;
          const isAmbiguity = issue.type === "Ambiguity";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "rounded-lg border overflow-hidden cursor-pointer transition-colors",
                isAmbiguity
                  ? "border-indigo-500/20 hover:border-indigo-500/40"
                  : "border-amber-500/20 hover:border-amber-500/40"
              )}
              onClick={() => setExpandedIdx(expanded ? null : idx)}
            >
              <div className="flex items-start gap-3 px-3 py-2.5">
                <span
                  className={cn(
                    "shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded",
                    isAmbiguity
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-amber-500/20 text-amber-300"
                  )}
                >
                  {issue.type}
                </span>
                <span className="text-xs text-foreground leading-relaxed flex-1">
                  {issue.message}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/40 overflow-hidden"
                  >
                    <div className="px-3 py-2.5 space-y-1.5 text-xs text-muted-foreground bg-muted/30">
                      <p>
                        <span className="font-medium text-foreground">Impact: </span>
                        {issue.impact}
                      </p>
                      {issue.category && (
                        <p>
                          <span className="font-medium text-foreground">Category: </span>
                          {issue.category}
                        </p>
                      )}
                      {issue.assumption && (
                        <p>
                          <span className="font-medium text-foreground">Missing: </span>
                          {issue.assumption}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Risk Summary Banner ── */
export function RiskSummary({
  score,
  level,
  issueCount,
}: {
  score: number;
  level: string;
  issueCount: number;
}) {
  const getMessage = useCallback(() => {
    if (level === "Ready") {
      return score >= 90
        ? "This test case looks solid for automation — low risk of flaky execution."
        : "This test case should work for automation, but consider the suggestions below.";
    }
    if (level === "Needs clarification") {
      return issueCount > 3
        ? `This test case needs clarification before automation (${issueCount} issues found).`
        : "This test case could work but would benefit from clarification.";
    }
    return "High risk for automation — significant clarification needed to prevent flaky tests.";
  }, [score, level, issueCount]);

  const config =
    level === "Ready"
      ? { icon: CheckCircle2, bg: "bg-green-500/10 border-green-500/20", color: "text-green-400" }
      : level === "Needs clarification"
      ? { icon: AlertTriangle, bg: "bg-amber-500/10 border-amber-500/20", color: "text-amber-400" }
      : { icon: XCircle, bg: "bg-red-500/10 border-red-500/20", color: "text-red-400" };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start gap-3 px-4 py-3 rounded-xl border", config.bg)}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.color)} />
      <p className="text-sm leading-relaxed">{getMessage()}</p>
    </motion.div>
  );
}
