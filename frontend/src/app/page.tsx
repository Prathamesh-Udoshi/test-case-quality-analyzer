"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Lightbulb,
  MessageSquareText,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeText } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import {
  ReadinessMeter,
  ConfidenceBadge,
  AmbiguityBreakdown,
  AssumptionBreakdown,
  IssueList,
  RiskSummary,
} from "@/components/analysis/ResultCards";
import { InterrogatorPanel } from "@/components/ai/AIPanels";
import { OptimizerPanel } from "@/components/ai/AIPanels";

const EXAMPLES = [
  "The system should load fast and handle errors properly",
  "User logs in with valid credentials and accesses dashboard",
  "Click the submit button and verify error message appears",
  "The application must respond quickly to user interactions",
  "Given user is logged in, when clicking save, then data should persist",
  "System should be scalable and handle up to 1000 concurrent users",
  "Navigate to user profile page and update personal information",
];

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedText, setAnalyzedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeText(trimmed);
      setResult(res);
      setAnalyzedText(trimmed);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Analysis failed. Check API connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (example: string) => {
    setText(example);
  };

  const textLen = text.trim().length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Hero ── */}
      <div className="text-center space-y-3 pb-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text">Test Case Quality</span> Analyzer
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Detect ambiguity, hidden assumptions, and automation risks in your test
          cases before implementation — powered by NLP and AI.
        </p>
      </div>

      {/* ── Input Section ── */}
      <div className="grid lg:grid-cols-[1fr_220px] gap-4">
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your test case or requirement here..."
              rows={4}
              maxLength={10000}
              className={cn(
                "w-full rounded-xl bg-card border border-border px-4 py-3 text-sm",
                "placeholder:text-muted-foreground/50 resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
                "transition-all"
              )}
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50">
              {textLen} / 10,000
            </span>
          </div>

          {/* Validation hints */}
          {textLen > 0 && textLen < 10 && (
            <p className="text-xs text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" /> Very short text — analysis
              confidence may be lower.
            </p>
          )}
          {textLen > 500 && (
            <p className="text-xs text-blue-400 flex items-center gap-1.5">
              <FileText className="h-3 w-3" /> Long text — consider breaking
              into smaller, focused test cases.
            </p>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.99]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              !loading && text.trim() && "glow-primary"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Test Quality
              </>
            )}
          </button>
        </div>

        {/* Quick Examples */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MessageSquareText className="h-3 w-3" />
            Quick Examples
          </p>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                className={cn(
                  "w-full text-left text-[11px] px-2.5 py-2 rounded-lg border transition-all truncate",
                  "border-border/60 text-muted-foreground",
                  "hover:border-primary/30 hover:text-foreground hover:bg-primary/5"
                )}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3"
        >
          {error}
        </motion.div>
      )}

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Risk Summary */}
            <RiskSummary
              score={result.readiness_score}
              level={result.readiness_level}
              issueCount={result.issues.length}
            />

            {/* Confidence */}
            <ConfidenceBadge confidence={result.ambiguity.confidence} />

            {/* Main Analysis Grid */}
            <div className="grid lg:grid-cols-[1fr_200px] gap-6">
              <div className="space-y-6">
                {/* Ambiguity + Assumption breakdowns */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <AmbiguityBreakdown data={result.ambiguity} />
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <AssumptionBreakdown data={result.assumptions} />
                  </div>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-4">
                    <IssueList issues={result.issues} />
                  </div>
                )}

                {/* Clarifying Questions */}
                {result.clarifying_questions.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                      Recommended Clarifications
                    </h3>
                    <ul className="space-y-2">
                      {result.clarifying_questions.map((q, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-blue-400 font-mono font-medium shrink-0">
                            {i + 1}.
                          </span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Panels */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <InterrogatorPanel
                      text={analyzedText}
                      issues={result.issues}
                    />
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <OptimizerPanel
                      text={analyzedText}
                      issues={result.issues}
                    />
                  </div>
                </div>
              </div>

              {/* Readiness Meter - Sidebar */}
              <div className="flex flex-col items-center">
                <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
                  <ReadinessMeter
                    score={result.readiness_score}
                    level={result.readiness_level}
                  />
                </div>
              </div>
            </div>

            {/* Original Text */}
            <details className="bg-card rounded-xl border border-border">
              <summary className="px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition">
                📝 Original Test Case
              </summary>
              <div className="px-4 pb-3 text-xs text-foreground/80 whitespace-pre-wrap">
                {analyzedText}
              </div>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
