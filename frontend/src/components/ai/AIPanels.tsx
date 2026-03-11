"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { interrogateRequirement, optimizeTestCase } from "@/lib/api";
import type { ImpactIssue } from "@/lib/types";

/* ── Deep Interrogation Panel ── */
export function InterrogatorPanel({
  text,
  issues,
}: {
  text: string;
  issues: ImpactIssue[];
}) {
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterrogate = async () => {
    setLoading(true);
    setError(null);
    setOutput(""); // Start with empty for streaming
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/analyze/interrogate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, issues }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader!.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  setOutput((prev) => (prev || "") + data.token);
                } else if (data.error) {
                  setError(data.error);
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Interrogation failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-400" />
          Deep Interrogation
        </h3>
        {output && !loading && (
          <button
            onClick={() => setOutput(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        AI agent hunts for &quot;Ghost Logic&quot; and hidden assumptions not
        caught by rule-based analysis.
      </p>

      {!output && !loading && (
        <button
          onClick={handleInterrogate}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            "bg-purple-500/10 border border-purple-500/20 text-purple-300",
            "hover:bg-purple-500/20 hover:border-purple-500/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Bot className="h-4 w-4" />
          Hunt for Hidden Assumptions
        </button>
      )}

      {loading && !output && (
        <div className="flex items-center justify-center py-4">
           <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/5 border border-purple-500/20 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
               <p className="text-xs text-purple-300 font-medium">
                Ask stakeholders these targeted questions:
              </p>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-purple-400" />}
            </div>
            <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Test Case Optimizer Panel ── */
export function OptimizerPanel({
  text,
  issues,
}: {
  text: string;
  issues: ImpactIssue[];
}) {
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/analyze/optimize/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, issues }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader!.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  setOutput((prev) => (prev || "") + data.token);
                } else if (data.error) {
                  setError(data.error);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Optimization failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          Automation Optimizer
        </h3>
        {output && !loading && (
          <button
            onClick={() => setOutput(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Transform this test case into structured, automation-ready steps with
        explicit assertions.
      </p>

      {!output && !loading && (
        <button
          onClick={handleOptimize}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300",
            "hover:bg-cyan-500/20 hover:border-cyan-500/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Optimize for Automation
        </button>
      )}

      {loading && !output && (
        <div className="flex items-center justify-center py-4">
           <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
               <p className="text-xs text-cyan-300 font-medium">
                ✅ Optimized Test Case:
              </p>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />}
            </div>
            <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
