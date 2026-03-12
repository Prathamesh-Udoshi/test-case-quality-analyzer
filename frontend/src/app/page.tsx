"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Search,
  Layers,
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  Target,
  AlertTriangle,
  Eye,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/* ────────────────────────────────────────────────── */
/*  Fade-in animation variants                        */
/* ────────────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ────────────────────────────────────────────────── */
/*  Features data                                     */
/* ────────────────────────────────────────────────── */
const features = [
  {
    icon: Eye,
    title: "Ambiguity Detection",
    description:
      "Identifies vague language, untestable statements, and ambiguous references in your test cases using NLP-powered lexical analysis.",
    color: "#818cf8",
  },
  {
    icon: AlertTriangle,
    title: "Hidden Assumption Finder",
    description:
      "Surfaces implicit assumptions about environment, data, and system state that could cause test failures or misinterpretation.",
    color: "#f59e0b",
  },
  {
    icon: Target,
    title: "Automation Readiness Score",
    description:
      "Assigns a readiness score to each test case, clearly indicating whether it's ready, needs clarification, or is high-risk for automation.",
    color: "#22c55e",
  },
  {
    icon: BrainCircuit,
    title: "AI Deep Interrogation",
    description:
      "Uses LLM-powered questioning to probe requirements for missing information, edge cases, and unstated preconditions.",
    color: "#a78bfa",
  },
  {
    icon: Sparkles,
    title: "AI Test Case Optimization",
    description:
      "Rewrites ambiguous or assumption-laden test cases into clear, unambiguous, automation-ready specifications.",
    color: "#38bdf8",
  },
  {
    icon: ShieldCheck,
    title: "Risk & Impact Assessment",
    description:
      "Categorizes detected issues by severity and impact, helping teams prioritize which test cases to fix first.",
    color: "#f472b6",
  },
];

/* ────────────────────────────────────────────────── */
/*  How it works steps                                */
/* ────────────────────────────────────────────────── */
const steps = [
  {
    step: "01",
    title: "Paste Your Test Case",
    description:
      "Enter a single requirement or upload a batch of test cases via CSV or manual entry.",
  },
  {
    step: "02",
    title: "AI Analyzes Quality",
    description:
      "Our NLP engine scores ambiguity, surfaces hidden assumptions, and evaluates automation readiness in seconds.",
  },
  {
    step: "03",
    title: "Review & Optimize",
    description:
      "Get actionable insights, clarifying questions, and AI-rewritten test cases ready for implementation.",
  },
];

/* ────────────────────────────────────────────────── */
/*  CTA links                                         */
/* ────────────────────────────────────────────────── */
const ctaLinks = [
  {
    href: "/analyze",
    label: "Single Analysis",
    sublabel: "Analyze one test case in depth",
    icon: Search,
  },
  {
    href: "/batch",
    label: "Batch Analysis",
    sublabel: "Process multiple test cases at once",
    icon: Layers,
  },
  {
    href: "/dashboard",
    label: "Quality Dashboard",
    sublabel: "Visualize quality trends & metrics",
    icon: LayoutDashboard,
  },
];

/* ═══════════════════════════════════════════════════ */
/*  Landing Page Component                            */
/* ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen w-full">
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Top gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#09090b] to-transparent" />
        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#09090b] to-transparent" />

        <div className="relative mx-auto w-full px-6 sm:px-10 lg:px-20 pt-28 pb-24 sm:pt-36 sm:pb-32">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-medium tracking-widest uppercase text-indigo-400 mb-5"
            >
              AI-Powered Quality Engineering
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              Find the flaws in your test cases{" "}
              <span className="gradient-text">before they find you.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl"
            >
              ReqQuality AI analyzes your test cases and requirements for
              ambiguity, hidden assumptions, and automation readiness — giving
              your QA team actionable intelligence before a single line of test
              code is written.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                Start Analyzing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-colors"
              >
                See How It Works
              </Link>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px border-t border-zinc-800"
          >
            {[
              { value: "6", label: "Analysis Dimensions" },
              { value: "< 2s", label: "Average Analysis Time" },
              { value: "3", label: "AI-Powered Features" },
              { value: "CSV", label: "Batch Import Support" },
            ].map(({ value, label }) => (
              <div key={label} className="pt-8 pr-8">
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {value}
                </p>
                <p className="mt-1 text-xs text-zinc-500 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* ── FEATURES ── */}
      <section id="features" className="w-full px-6 sm:px-10 lg:px-20 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-16"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            className="text-xs font-medium tracking-widest uppercase text-indigo-400 mb-3"
          >
            Capabilities
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Everything you need to ship robust test cases
          </motion.h2>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-4 text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed"
          >
            From individual requirement analysis to full-suite quality
            dashboards, ReqQuality AI gives your team the tools to eliminate
            ambiguity and assumptions before they become costly bugs.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="group"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
                style={{ backgroundColor: f.color + "14" }}
              >
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* ── HOW IT WORKS ── */}
      <section className="w-full px-6 sm:px-10 lg:px-20 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-16"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            className="text-xs font-medium tracking-widest uppercase text-indigo-400 mb-3"
          >
            Workflow
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Three steps to better test quality
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
            >
              <span className="text-5xl font-extrabold text-zinc-800 select-none">
                {s.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* ── CTA / GET STARTED ── */}
      <section className="w-full px-6 sm:px-10 lg:px-20 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-14"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            className="text-xs font-medium tracking-widest uppercase text-indigo-400 mb-3"
          >
            Get Started
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Choose your analysis mode
          </motion.h2>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-4 text-zinc-400 max-w-xl text-sm sm:text-base leading-relaxed"
          >
            Whether you need to verify a single requirement or audit an entire
            test suite, we have you covered.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {ctaLinks.map((c, i) => (
            <motion.div
              key={c.href}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
            >
              <Link
                href={c.href}
                className="flex items-start gap-4 p-6 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                  <c.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-white transition-colors">
                    {c.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{c.sublabel}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-zinc-800">
        <div className="px-6 sm:px-10 lg:px-20 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold gradient-text">
              ReqQuality AI
            </span>
            <span className="text-[10px] font-medium text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">
              v2.0
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Intelligent Test Case Quality Analyzer — powered by NLP & AI
          </p>
        </div>
      </footer>
    </div>
  );
}
