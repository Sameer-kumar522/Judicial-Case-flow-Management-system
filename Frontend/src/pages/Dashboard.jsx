
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import api from "../services/api";

const COLORS = ["#172554", "#b69b5d", "#64748b", "#0f766e", "#a1a1aa"];

function toArray(response, keys = []) {
  const data = response?.data ?? response;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function label(item, keys, fallback) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return String(item[key]);
    }
  }

  return fallback;
}

function amount(item) {
  return Number(
    item?.count ??
    item?.activeCasesCount ??
    item?.totalFiled ??
    item?.totalCases ??
    item?.avgDaysToDispose ??
    item?.total ??
    item?.value ??
    item?.caseCount ??
    item?.disposedCount ??
    0
  ) || 0;
}

function EmptyChart({ loading }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
      {loading ? "Loading chart data..." : "No chart data available"}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-4 h-72">{children}</div>
    </article>
  );
}

function BenchmarkCard({ title, result }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-800">{title}</h3>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <p>
          Stage: <strong>{result?.stage ?? "N/A"}</strong>
        </p>
        <p>
          Execution Time: <strong>{result?.executionTimeMillis ?? "N/A"} ms</strong>
        </p>
        <p>
          Documents Examined: <strong>{result?.totalDocsExamined ?? "N/A"}</strong>
        </p>
        <p>
          Keys Examined: <strong>{result?.totalKeysExamined ?? "N/A"}</strong>
        </p>
        <p>
          Documents Returned: <strong>{result?.docsReturned ?? "N/A"}</strong>
        </p>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    cases: [],
    hearings: [],
    courts: [],
    judges: [],
    status: [],
    monthly: [],
    workload: [],
    benches: [],
    resolution: [],
    benchmark: null,
  });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        api.get("/cases"),
        api.get("/hearings"),
        api.get("/courts"),
        api.get("/judges"),
        api.get("/analytics/status-distribution"),
        api.get("/analytics/monthly-filing-trend"),
        api.get("/analytics/judge-workload"),
        api.get("/analytics/bench-caseload"),
        api.get("/analytics/resolution-time"),
        api.get("/analytics/indexing-demo"),
      ]);

      if (!active) return;

      const read = (index, keys = []) =>
        results[index].status === "fulfilled"
          ? toArray(results[index].value, keys)
          : [];

      setData({
        cases: read(0, ["cases"]),
        hearings: read(1, ["hearings"]),
        courts: read(2, ["courts"]),
        judges: read(3, ["judges"]),
        status: read(4),
        monthly: read(5),
        workload: read(6),
        benches: read(7),
        resolution: read(8),
        benchmark:
          results[9].status === "fulfilled"
            ? results[9].value?.data?.benchmark ?? null
            : null,
      });

      const failedCoreRequests = results
        .slice(0, 4)
        .every((result) => result.status === "rejected");

      if (failedCoreRequests) {
        setError(
          "Dashboard data could not be loaded. Check the backend connection and your login."
        );
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  // 1. Case Status Distribution
  const statusData = useMemo(
    () =>
      data.status.map((item, i) => ({
        name: label(
          item,
          ["status", "_id", "name", "caseStatus"],
          `Status ${i + 1}`
        ),
        value: amount(item),
      })),
    [data.status]
  );

  // 2. Monthly Case Filings
  const monthlyData = useMemo(
    () =>
      data.monthly.map((item, i) => ({
        month:
          item?.year && item?.month
            ? `${item.month}/${item.year}`
            : label(
                item,
                ["monthName", "month", "label", "_id"],
                `Month ${i + 1}`
              ),
        cases: amount(item),
      })),
    [data.monthly]
  );

  // 3. Judge Workload
  const workloadData = useMemo(
    () =>
      data.workload.map((item, i) => ({
        judge: label(
          item,
          ["judgeName", "fullName", "name", "_id"],
          `Judge ${i + 1}`
        ),
        cases: amount(item),
      })),
    [data.workload]
  );

  // 4. Court-wise Case Load
  const benchData = useMemo(
    () =>
      data.benches.map((item, i) => ({
        court: label(
          item,
          ["benchName", "courtName", "benchLocation", "name", "_id"],
          `Court ${i + 1}`
        ),
        cases: amount(item),
      })),
    [data.benches]
  );

  // 5. Average Case Resolution Time
  const resolutionData = useMemo(
    () =>
      data.resolution.map((item, i) => ({
        caseType: label(
          item,
          ["caseType", "_id"],
          `Type ${i + 1}`
        ),
        days: Number(
          item?.avgDaysToDispose ??
          item?.averageDays ??
          item?.avgResolutionDays ??
          item?.averageResolutionTime ??
          0
        ),
      })),
    [data.resolution]
  );

  const stats = [
    ["Total Cases", data.cases.length],
    ["Total Hearings", data.hearings.length],
    ["Courts", data.courts.length],
    ["Judges", data.judges.length],
  ];

  const benchmarkComparison = data.benchmark?.comparison;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Sindh High Court
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Executive Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of cases, hearings, courts, and judicial workload.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Dashboard Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([title, value]) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{title}</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : value}
              </p>
            </article>
          ))}
        </section>

        {/* Analytics Charts */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* 1. Status Distribution */}
          <ChartCard
            title="Case Status Distribution"
            subtitle="Cases grouped by current status."
          >
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    label
                  >
                    {statusData.map((entry, i) => (
                      <Cell
                        key={`${entry.name}-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart loading={loading} />
            )}
          </ChartCard>

          {/* 2. Monthly Filing Trend */}
          <ChartCard
            title="Monthly Case Filings"
            subtitle="New cases filed over time."
          >
            {monthlyData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#172554"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart loading={loading} />
            )}
          </ChartCard>

          {/* 3. Judge Workload */}
          <ChartCard
            title="Judge Workload"
            subtitle="Number of cases assigned to each judge."
          >
            {workloadData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="judge" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="cases"
                    fill="#b69b5d"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart loading={loading} />
            )}
          </ChartCard>

          {/* 4. Court-wise Caseload */}
          <ChartCard
            title="Court-wise Case Load"
            subtitle="Cases distributed across court benches."
          >
            {benchData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="court" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="cases"
                    fill="#0f766e"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart loading={loading} />
            )}
          </ChartCard>

          {/* 5. Resolution Time */}
          <ChartCard
            title="Average Case Resolution Time"
            subtitle="Average days taken to dispose cases by case type."
          >
            {resolutionData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="caseType" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="days"
                    name="Average Days"
                    fill="#64748b"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart loading={loading} />
            )}
          </ChartCard>

        </section>

        {/* 6. Database Index Performance */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Database Index Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Comparison between collection scan and compound index scan.
          </p>

          {benchmarkComparison ? (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <BenchmarkCard
                title="Without Index"
                result={benchmarkComparison.withoutIndex}
              />

              <BenchmarkCard
                title="With Compound Index"
                result={benchmarkComparison.withCompoundIndex}
              />
            </div>
          ) : (
            <div className="mt-5 h-40">
              <EmptyChart loading={loading} />
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
