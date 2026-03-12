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
import { InterrogatorPanel, OptimizerPanel } from "@/components/ai/AIPanels";

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
    <div className="space-y-12 animate-fade-in py-10">
      {/* ── Hero ── */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          <span className="gradient-text">Test Case Quality</span> Analyzer
        </h1>
        <p className="text-[14px] text-zinc-500 max-w-xl mx-auto leading-relaxed font-medium">
          Detect ambiguity, hidden assumptions, and automation risks in your test
          cases before implementation — powered by NLP and AI.
        </p>
      </div>

      {/* ── Input Section ── */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-8">
        <div className="space-y-4">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your test case or requirement here..."
              rows={5}
              maxLength={10000}
              className={cn(
                "w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-[14px] text-zinc-200",
                "placeholder:text-zinc-600 resize-none",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40",
                "transition-all"
              )}
            />
            <span className="absolute bottom-3 right-4 text-[10px] font-bold text-zinc-700 uppercase tracking-widest bg-zinc-900/80 px-1.5 py-0.5 rounded">
              {textLen} / 10,000
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
              {textLen > 0 && textLen < 10 && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" /> Low Confidence Risk
                </p>
              )}
              {textLen > 500 && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> High Complexity
                </p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className={cn(
                "min-w-48 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all",
                "bg-indigo-600 text-white shadow-lg shadow-indigo-600/5",
                "hover:bg-indigo-500 hover:shadow-indigo-600/10 active:scale-[0.98]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze Quality
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
            <MessageSquareText className="h-3.5 w-3.5" />
            Quick Templates
          </p>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                className={cn(
                  "w-full text-left text-[11px] px-3 py-2.5 rounded-xl border transition-all truncate font-medium",
                  "border-zinc-800 text-zinc-500",
                  "hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5"
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
          className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl px-5 py-4"
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
            className="space-y-8"
          >
            {/* Risk Summary + Confidence Header */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <RiskSummary
                  score={result.readiness_score}
                  level={result.readiness_level}
                  issueCount={result.issues.length}
                />
              </div>
              <div className="md:w-auto self-center">
                <ConfidenceBadge confidence={result.ambiguity.confidence} />
              </div>
            </div>

            {/* Main Analysis Grid */}
            <div className="grid lg:grid-cols-[1fr_240px] gap-8">
              <div className="space-y-8">
                {/* Ambiguity + Assumption breakdowns */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <AmbiguityBreakdown data={result.ambiguity} />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <AssumptionBreakdown data={result.assumptions} />
                  </div>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <IssueList issues={result.issues} />
                  </div>
                )}

                {/* Clarifying Questions */}
                {result.clarifying_questions.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.1em] flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-indigo-400" />
                      Recommended Clarifications
                    </h3>
                    <ul className="space-y-3">
                      {result.clarifying_questions.map((q, i) => (
                        <li
                          key={i}
                          className="text-[13px] text-zinc-400 flex items-start gap-3 font-medium border-l-2 border-zinc-800 pl-4 py-1"
                        >
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Panels */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <InterrogatorPanel
                      text={analyzedText}
                      issues={result.issues}
                    />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <OptimizerPanel
                      text={analyzedText}
                      issues={result.issues}
                    />
                  </div>
                </div>
              </div>

              {/* Readiness Meter - Sidebar */}
              <div className="hidden lg:block">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24 flex flex-col items-center">
                  <ReadinessMeter
                    score={result.readiness_score}
                    level={result.readiness_level}
                  />
                  <div className="mt-8 pt-8 border-t border-zinc-800 w-full text-center">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Analysis Timestamp</p>
                    <p className="text-[11px] text-zinc-600 font-mono">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Original Text Disclosure */}
            <details className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <summary className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-300 hover:bg-zinc-900 transition-all flex items-center justify-between">
                <span>Original Test Case</span>
                <span className="text-zinc-700 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 py-6 text-[13px] text-zinc-400 border-t border-zinc-800 leading-relaxed font-medium whitespace-pre-wrap">
                {analyzedText}
              </div>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
