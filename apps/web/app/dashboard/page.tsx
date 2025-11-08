'use client'

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { ChevronRight, Rocket, Layers, FileText, Package2, Share2, BarChart3, Clock3, Flame, Plus, CalendarDays, Zap, CheckCircle2 } from "lucide-react";

/**
 * Content Multiplier Dashboard — Redesigned
 * -------------------------------------------------------------
 * Goals addressed:
 * 1) Clear information hierarchy (KPI snapshot on top)
 * 2) Actionable workflow tracking with progress + next actions
 * 3) Deeper analytics with trends and top‑performers
 * 4) Interactive tools grid with quick actions
 * 5) Recent activity with status affordances
 *
 * Notes:
 * - Uses Tailwind + shadcn/ui + lucide-react + recharts
 * - Drop this into a Next.js/React app with shadcn/ui installed
 */

// --- Mock Data -------------------------------------------------
const kpi = {
    ideas: 24,
    briefs: 12,
    packs: 8,
    reach: 45200,
    engagementRate: 3.8,
};

const kpiTrend = [
    { d: "Mon", ideas: 3, reach: 5.1 },
    { d: "Tue", ideas: 6, reach: 6.2 },
    { d: "Wed", ideas: 4, reach: 7.4 },
    { d: "Thu", ideas: 5, reach: 8.3 },
    { d: "Fri", ideas: 2, reach: 7.9 },
    { d: "Sat", ideas: 3, reach: 9.1 },
    { d: "Sun", ideas: 1, reach: 10.2 },
];

const topChannels = [
    { channel: "Twitter", reach: 18000 },
    { channel: "LinkedIn", reach: 14500 },
    { channel: "Blog", reach: 9200 },
    { channel: "YouTube", reach: 3500 },
];

const workflow = [
    { id: 1, stage: "Ideate", label: "AI Trends 2025 content pack", progress: 100, status: "done", due: "Today" },
    { id: 2, stage: "Research", label: "Marketing Guide brief", progress: 65, status: "in_progress", due: "Tomorrow" },
    { id: 3, stage: "Create", label: "LinkedIn carousel for FRSPP", progress: 40, status: "in_progress", due: "Wed" },
    { id: 4, stage: "Optimize", label: "Twitter thread variations", progress: 15, status: "queued", due: "Fri" },
    { id: 5, stage: "Publish", label: "Q2 recap to 5 platforms", progress: 0, status: "queued", due: "—" },
];

const recent = [
    { time: "2h", text: "Published 'AI Trends 2024' to 5 platforms", type: "publish" },
    { time: "5h", text: "Generated 10 content variations for 'Marketing Guide'", type: "optimize" },
    { time: "1d", text: "Created research brief for 'Social Media Strategy'", type: "research" },
];

const toolCards = [
    { title: "Content Ideas", desc: "Generate AI‑powered ideas tailored to audience", icon: Rocket, stat: kpi.ideas, cta: "New Idea" },
    { title: "Research Briefs", desc: "Create comprehensive research briefs with citations", icon: FileText, stat: kpi.briefs, cta: "New Brief" },
    { title: "Content Packs", desc: "Draft and manage collections", icon: Package2, stat: kpi.packs, cta: "New Pack" },
    { title: "Multi‑Platform Publishing", desc: "Distribute everywhere", icon: Share2, stat: 5, cta: "Connect" },
    { title: "Twitter Bot", desc: "Automate presence with AI", icon: Zap, stat: 3, cta: "Open Bot" },
    { title: "Analytics", desc: "Track performance & optimize", icon: BarChart3, stat: kpi.reach, cta: "View Analytics" },
];

// --- Helper UI -------------------------------------------------
const StatCard = ({ title, value, suffix = "", deltaLabel, chartKey }) => (
    <Card className="overflow-hidden">
        <CardHeader className="pb-2">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-3xl">{value}{suffix || ""}</CardTitle>
            {deltaLabel && (
                <div className="text-xs text-muted-foreground mt-1">{deltaLabel}</div>
            )}
        </CardHeader>
        <CardContent className="h-24">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiTrend} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey={chartKey} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const ToolCard = ({ title, desc, icon: Icon, stat, cta }) => (
    <Card className="group transition hover:shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-full">{stat}</Badge>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Icon className="h-5 w-5" />
                <span className="text-sm">Quick actions available</span>
            </div>
            <Button variant="default" size="sm" className="group-hover:translate-x-0.5 transition">{cta} <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </CardContent>
    </Card>
);

// --- Main Component -------------------------------------------
export default function ContentMultiplierDashboardV2() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white p-6">
            {/* Header */}
            <div className="mx-auto max-w-7xl">
                <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-6 text-white shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold">Content Multiplier — Mission Control</h1>
                            <p className="text-white/90 mt-1 max-w-2xl">Plan, create, and distribute multi‑platform content with AI. Track progress, performance, and next actions in one place.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select defaultValue="7d">
                                <SelectTrigger className="w-[160px] bg-white text-indigo-700">
                                    <SelectValue placeholder="Timeframe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">Last 7 days</SelectItem>
                                    <SelectItem value="30d">Last 30 days</SelectItem>
                                    <SelectItem value="90d">Last 90 days</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="secondary" className="text-indigo-700">
                                <Plus className="mr-2 h-4 w-4" /> Start New Content Pack
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KPI Snapshot */}
                <div className="grid md:grid-cols-5 gap-4 mt-6">
                    <StatCard title="Active Ideas" value={kpi.ideas} deltaLabel="↑ 12% vs last week" chartKey="ideas" />
                    <StatCard title="Research Briefs" value={kpi.briefs} deltaLabel="↑ 8%" chartKey="ideas" />
                    <StatCard title="Content Packs" value={kpi.packs} deltaLabel="—" chartKey="ideas" />
                    <StatCard title="Total Reach" value={(kpi.reach / 1000).toFixed(1)} suffix="K" deltaLabel="↑ 9%" chartKey="reach" />
                    <StatCard title="Engagement Rate" value={kpi.engagementRate} suffix="%" deltaLabel="Best on Tue 9am" chartKey="reach" />
                </div>

                {/* Workflow + Tasks */}
                <div className="grid lg:grid-cols-3 gap-6 mt-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Content Creation Workflow</CardTitle>
                            <CardDescription>Track stage progress and jump to the next action.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {workflow.map(item => (
                                <div key={item.id} className="rounded-xl border p-3 flex items-center gap-4">
                                    <Badge variant={item.status === "done" ? "default" : item.status === "in_progress" ? "secondary" : "outline"} className="shrink-0">{item.stage}</Badge>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{item.label}</div>
                                        <Progress value={item.progress} className="h-2 mt-2" />
                                        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
                                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Due: {item.due}</span>
                                            {item.status === "done" ? (
                                                <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /> Completed</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {item.progress}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Next Action <ChevronRight className="ml-1 h-4 w-4" /></Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Channel Performance</CardTitle>
                            <CardDescription>Where your audience is growing.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topChannels}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="channel" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="reach" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tools Grid */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Your Content Tools</h2>
                        <div className="flex items-center gap-2">
                            <Input placeholder="Quick search tools…" className="w-56" />
                            <Tabs defaultValue="all">
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="create">Create</TabsTrigger>
                                    <TabsTrigger value="distribute">Distribute</TabsTrigger>
                                    <TabsTrigger value="analyze">Analyze</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {toolCards.map((t) => (
                            <ToolCard key={t.title} {...t} />
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Recent Workflow Activity</CardTitle>
                        <CardDescription>Latest actions across creation, optimization, and publishing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recent.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 border rounded-xl p-3">
                                <Badge variant="outline" className="shrink-0">{r.time} ago</Badge>
                                <div className="text-sm flex-1">{r.text}</div>
                                <div className="text-xs text-muted-foreground">{r.type}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Footer tip */}
                <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    <span>Tip: Peak engagement for your audience is usually <b>Tue 9:00–11:00</b>. Schedule posts to maximize reach.</span>
                </div>
            </div>
        </div>
    );
}
