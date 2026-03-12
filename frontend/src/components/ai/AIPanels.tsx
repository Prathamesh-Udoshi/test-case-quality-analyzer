"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/analyze/interrogate/stream`, {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.1em] flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-400" />
          Deep Interrogation
        </h3>
        {output && !loading && (
          <button
            onClick={() => setOutput(null)}
            className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
      <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">
        AI agent hunts for &quot;Ghost Logic&quot; and hidden assumptions not
        caught by standard semantic analysis.
      </p>

      {!output && !loading && (
        <button
          onClick={handleInterrogate}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
            "bg-purple-600/10 border border-purple-500/30 text-purple-400",
            "hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-300",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          Start Deep Interrogation
        </button>
      )}

      {loading && !output && (
        <div className="flex items-center justify-center py-6">
           <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
        </div>
      )}

      {error && (
        <div className="text-xs font-medium text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4"
          >
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
               <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                Targeted Questions:
              </p>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-purple-500" />}
            </div>
            <div className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/analyze/optimize/stream`, {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-[0.1em] flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          Test Case Optimizer
        </h3>
        {output && !loading && (
          <button
            onClick={() => setOutput(null)}
            className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
      <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">
        Transform this test case into clear, structured, automation-ready steps.
      </p>

      {!output && !loading && (
        <button
          onClick={handleOptimize}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
            "bg-indigo-600 text-white shadow-lg shadow-indigo-600/5",
            "hover:bg-indigo-500 hover:shadow-indigo-600/10",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Start AI Optimization
        </button>
      )}

      {loading && !output && (
        <div className="flex items-center justify-center py-6">
           <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        </div>
      )}

      {error && (
        <div className="text-xs font-medium text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4"
          >
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
               <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                Optimized Output:
              </p>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />}
            </div>
            <div className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
              {output}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
