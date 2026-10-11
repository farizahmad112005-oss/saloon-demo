import { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarDays, CheckCircle2, Wallet } from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import StatCard from '../../components/admin/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { AdminAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { formatPKR, formatTimeLabel, STATUS_COLORS, STATUS_LABELS } from '../../utils/format';

const now = new Date();

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [yearlyChart, setYearlyChart] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [monthlyLabel, setMonthlyLabel] = useState('');
  const [inProgress, setInProgress] = useState([]);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [chartMode, setChartMode] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [s, annual, monthly, progress] = await Promise.all([
        AdminAPI.stats(),
        AdminAPI.chart(year),
        AdminAPI.monthlyChart(year, month),
        AdminAPI.inProgress(25),
      ]);
      setStats(s.data.data);
      setYearlyChart(annual.data.data.months);
      setMonthlyChart(monthly.data.data.days);
      setMonthlyLabel(monthly.data.data.label);
      setInProgress(progress.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year, month]);

  useEffect(() => {
    if (!socket) return undefined;
    const onCreated = (appt) => {
      toast.info(`New booking: ${appt.client_name}`);
      load();
    };
    const onStatus = () => load();
    socket.on('appointment:created', onCreated);
    socket.on('appointment:statusChanged', onStatus);
    return () => {
      socket.off('appointment:created', onCreated);
      socket.off('appointment:statusChanged', onStatus);
    };
  }, [socket]);

  if (loading && !stats) return <LoadingSpinner />;

  const chartData = chartMode === 'monthly' ? monthlyChart : yearlyChart;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Appointments" value={stats?.total_appointments} icon={CalendarDays} />
        <StatCard title="Today’s Appointments" value={stats?.today_appointments} icon={CalendarCheck2} />
        <StatCard title="Completed" value={stats?.completed_appointments} icon={CheckCircle2} />
        <StatCard title="Total Revenue" value={stats?.total_revenue} icon={Wallet} prefix="Rs. " />
      </div>

      <section className="rounded-[28px] bg-blush p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">Performance</p>
            <h2 className="font-display text-3xl text-burgundy">
              {chartMode === 'monthly' ? 'Monthly chart' : 'Annual chart'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {chartMode === 'monthly'
                ? `${monthlyLabel} — completed appointments & revenue per day`
                : `${year} — completed appointments & revenue per month`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-blush/40 p-1 text-sm">
              <button
                type="button"
                onClick={() => setChartMode('monthly')}
                className={`rounded-full px-3 py-1.5 ${chartMode === 'monthly' ? 'bg-burgundy text-ivory' : 'text-burgundy'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setChartMode('annual')}
                className={`rounded-full px-3 py-1.5 ${chartMode === 'annual' ? 'bg-burgundy text-ivory' : 'text-burgundy'}`}
              >
                Annual
              </button>
            </div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-full border border-blush/50 bg-ivory px-4 py-2 text-sm"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {chartMode === 'monthly' ? (
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-full border border-blush/50 bg-ivory px-4 py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('en', { month: 'long' })}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </div>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={chartMode === 'monthly' ? 1 : 0} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v, name) => (String(name).includes('Revenue') ? formatPKR(v) : v)} />
              <Legend />
              <Bar yAxisId="left" dataKey="completed_appointments" name="Completed Appointments" fill="#C97B84" radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="total_revenue" name="Total Revenue" stroke="#6B2D3C" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-[28px] bg-blush p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Live queue</p>
          <h2 className="font-display text-3xl text-burgundy">In-progress appointments</h2>
          <p className="mt-1 text-sm text-muted">Pending and confirmed bookings awaiting completion</p>
        </div>
        {!inProgress.length ? (
          <EmptyState title="No in-progress appointments" description="New bookings will appear here in real time." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-blush/40 text-muted">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {inProgress.map((a) => (
                  <tr key={a.id} className="border-b border-blush/20">
                    <td className="px-3 py-3 font-medium">{a.appointment_code}</td>
                    <td className="px-3 py-3">
                      {a.client_name}
                      <div className="text-xs text-muted">{a.client_phone}</div>
                    </td>
                    <td className="px-3 py-3">{a.service_name || a.package_name}</td>
                    <td className="px-3 py-3">{a.appointment_date}</td>
                    <td className="px-3 py-3">{formatTimeLabel(a.appointment_time)}</td>
                    <td className="px-3 py-3">{formatPKR(a.final_price)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
