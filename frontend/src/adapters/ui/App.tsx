import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, LineChart, Line, ReferenceLine, Cell } from 'recharts';
import { Ship, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle, Anchor, Info } from 'lucide-react';
import { useRoutes, useComparison, useSetBaseline, useCB, useBankSurplus, useCreatePool } from '../../core/application/Queries';

const TARGET_GHG = 89.3368;

/* ──────────── Custom Tooltip for Charts ──────────── */
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div role="tooltip" className="bg-slate-800 border border-white/20 rounded-lg p-3 shadow-xl text-sm">
            <p className="text-white font-semibold mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-slate-300" style={{ color: p.color }}>
                    {p.name}: <span className="font-mono font-bold">{p.value?.toFixed(2)}</span>
                </p>
            ))}
        </div>
    );
}

/* ──────────── Routes Tab ──────────── */
function RoutesTab() {
    const { data: routes, isLoading } = useRoutes();
    const { mutate: setBaseline, isPending } = useSetBaseline();

    if (isLoading) return <Loader />;

    const compliant = routes?.filter(r => r.ghg_intensity <= TARGET_GHG).length ?? 0;
    const nonCompliant = routes?.filter(r => r.ghg_intensity > TARGET_GHG).length ?? 0;

    return (
        <section aria-label="Routes overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <StatCard label="Total Routes" value={routes?.length ?? 0} icon={<Ship size={20} aria-hidden="true" />} color="blue" />
                <StatCard label="Compliant Routes" value={compliant} icon={<CheckCircle size={20} aria-hidden="true" />} color="green" />
                <StatCard label="Non-Compliant" value={nonCompliant} icon={<AlertTriangle size={20} aria-hidden="true" />} color="red" />
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10" role="region" aria-label="Routes data table">
                <table className="w-full text-left" aria-label="Maritime routes">
                    <thead>
                        <tr className="bg-white/5 text-slate-400 text-xs sm:text-sm uppercase tracking-wide">
                            <th scope="col" className="px-4 py-3">Route</th>
                            <th scope="col" className="px-4 py-3">Vessel Type</th>
                            <th scope="col" className="px-4 py-3">Fuel</th>
                            <th scope="col" className="px-4 py-3">GHG (gCO₂/MJ)</th>
                            <th scope="col" className="px-4 py-3">Year</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Baseline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes?.map(r => (
                            <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-semibold text-white">{r.route_id}</td>
                                <td className="px-4 py-3 text-slate-300">{r.vessel_type}</td>
                                <td className="px-4 py-3 text-slate-300">{r.fuel_type}</td>
                                <td className="px-4 py-3">
                                    <span className={`font-mono font-bold ${r.ghg_intensity <= TARGET_GHG ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {r.ghg_intensity.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{r.year}</td>
                                <td className="px-4 py-3">
                                    {r.ghg_intensity <= TARGET_GHG
                                        ? <Badge color="green">Compliant</Badge>
                                        : <Badge color="red">Non-Compliant</Badge>}
                                </td>
                                <td className="px-4 py-3">
                                    {r.is_baseline
                                        ? <Badge color="blue">Baseline</Badge>
                                        : <button
                                            onClick={() => setBaseline(r.id)}
                                            disabled={isPending}
                                            aria-label={`Set ${r.route_id} as baseline`}
                                            className="text-xs px-3 py-1 rounded-full border border-slate-500 text-slate-400 hover:border-blue-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-950 transition-colors disabled:opacity-40"
                                        >
                                            Set Baseline
                                        </button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3" role="list" aria-label="Routes list">
                {routes?.map(r => (
                    <div key={r.id} role="listitem" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-lg">{r.route_id}</span>
                            {r.ghg_intensity <= TARGET_GHG
                                ? <Badge color="green">Compliant</Badge>
                                : <Badge color="red">Non-Compliant</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-slate-500 text-xs uppercase">Vessel</span>
                                <p className="text-slate-300">{r.vessel_type}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 text-xs uppercase">Fuel</span>
                                <p className="text-slate-300">{r.fuel_type}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 text-xs uppercase">GHG Intensity</span>
                                <p className={`font-mono font-bold ${r.ghg_intensity <= TARGET_GHG ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {r.ghg_intensity.toFixed(2)} <span className="text-slate-500 font-normal text-xs">gCO₂/MJ</span>
                                </p>
                            </div>
                            <div>
                                <span className="text-slate-500 text-xs uppercase">Year</span>
                                <p className="text-slate-400">{r.year}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                            {r.is_baseline
                                ? <Badge color="blue">Active Baseline</Badge>
                                : <button
                                    onClick={() => setBaseline(r.id)}
                                    disabled={isPending}
                                    aria-label={`Set ${r.route_id} as baseline`}
                                    className="w-full text-xs py-2 rounded-lg border border-slate-600 text-slate-400 hover:border-blue-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-40"
                                >
                                    Set as Baseline
                                </button>
                            }
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ──────────── Compare Tab ──────────── */
function CompareTab() {
    const { data: comp, isLoading } = useComparison();

    if (isLoading) return <Loader />;

    return (
        <section aria-label="Route comparison" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-2">
                <StatCard label="Compliant Routes" value={comp?.filter(c => c.compliant).length ?? 0} icon={<CheckCircle size={20} aria-hidden="true" />} color="green" />
                <StatCard label="Non-Compliant" value={comp?.filter(c => !c.compliant).length ?? 0} icon={<AlertTriangle size={20} aria-hidden="true" />} color="red" />
            </div>

            <Card title="GHG Intensity vs. Baseline">
                <p className="text-slate-500 text-xs mb-3 flex items-center gap-1">
                    <Info size={12} aria-hidden="true" />
                    Bars show baseline (blue) vs actual route (colored by compliance). Dashed line = target.
                </p>
                <div className="h-56 sm:h-72" role="img" aria-label="Bar chart comparing GHG intensity of routes against the baseline">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comp} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="route" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[80, 100]} unit=" " />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '8px' }} />
                            <ReferenceLine y={TARGET_GHG} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2}
                                label={{ value: `Target: ${TARGET_GHG}`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }} />
                            <Bar dataKey="baseline_ghg" fill="#3b82f6" name="Baseline GHG" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="comparison_ghg" name="Route GHG" radius={[4, 4, 0, 0]}>
                                {comp?.map((entry, index) => (
                                    <Cell key={index} fill={entry.compliant ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="% Difference from Baseline">
                <p className="text-slate-500 text-xs mb-3 flex items-center gap-1">
                    <Info size={12} aria-hidden="true" />
                    Values below 0% indicate the route outperforms the baseline.
                </p>
                <div className="h-44 sm:h-56" role="img" aria-label="Line chart showing percentage difference from baseline for each route">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comp} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="route" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={0} stroke="#64748b" strokeWidth={2} />
                            <Line type="monotone" dataKey="percent_diff" stroke="#06b6d4" dot={{ fill: '#06b6d4', r: 5 }} activeDot={{ r: 7, stroke: '#06b6d4', strokeWidth: 2 }} name="% Diff" strokeWidth={2.5} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Desktop comparison table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10" role="region" aria-label="Comparison data table">
                <table className="w-full text-left" aria-label="Route comparison details">
                    <thead>
                        <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wide">
                            <th scope="col" className="px-4 py-3">Route</th>
                            <th scope="col" className="px-4 py-3">Baseline GHG</th>
                            <th scope="col" className="px-4 py-3">Route GHG</th>
                            <th scope="col" className="px-4 py-3">% Diff</th>
                            <th scope="col" className="px-4 py-3">Compliant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comp?.map((c, i) => (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-semibold text-white">{c.route}</td>
                                <td className="px-4 py-3 text-slate-300 font-mono">{c.baseline_ghg.toFixed(2)}</td>
                                <td className="px-4 py-3 font-mono">
                                    <span className={c.comparison_ghg <= TARGET_GHG ? 'text-emerald-400' : 'text-red-400'}>
                                        {c.comparison_ghg.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono">
                                    <span className={c.percent_diff <= 0 ? 'text-emerald-400' : 'text-orange-400'}>
                                        {c.percent_diff > 0 ? '+' : ''}{c.percent_diff.toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {c.compliant
                                        ? <span className="text-emerald-400" aria-label="Compliant">✓ Yes</span>
                                        : <span className="text-red-400" aria-label="Non-compliant">✗ No</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile comparison cards */}
            <div className="sm:hidden space-y-3" role="list" aria-label="Comparison list">
                {comp?.map((c, i) => (
                    <div key={i} role="listitem" className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold">{c.route}</span>
                            {c.compliant
                                ? <Badge color="green">Compliant</Badge>
                                : <Badge color="red">Non-Compliant</Badge>}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <span className="text-slate-500 uppercase">Baseline</span>
                                <p className="text-slate-300 font-mono">{c.baseline_ghg.toFixed(2)}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 uppercase">Route</span>
                                <p className={`font-mono font-bold ${c.comparison_ghg <= TARGET_GHG ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {c.comparison_ghg.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <span className="text-slate-500 uppercase">% Diff</span>
                                <p className={`font-mono font-bold ${c.percent_diff <= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {c.percent_diff > 0 ? '+' : ''}{c.percent_diff.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ──────────── Banking Tab ──────────── */
function BankingTab() {
    const [shipId, setShipId] = useState('R002');
    const [year, setYear] = useState(2024);
    const { data: cb, refetch, isLoading } = useCB(shipId, year);
    const { mutate: bankSurplus, isPending, isSuccess, isError, error } = useBankSurplus();

    const handleBank = () => {
        bankSurplus({ shipId, year }, { onSuccess: () => refetch() });
    };

    const cbValue = cb ?? 0;
    const isPositive = cbValue > 0;

    return (
        <section aria-label="Banking and compliance balance" className="space-y-4 sm:space-y-6">
            <Card title="Compliance Balance (CB) Calculator">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <div>
                        <label htmlFor="ship-select" className="block text-slate-400 text-sm mb-2">Ship / Route ID</label>
                        <select
                            id="ship-select"
                            value={shipId}
                            onChange={e => setShipId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        >
                            {['R001', 'R002', 'R003', 'R004', 'R005'].map(r => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="year-select" className="block text-slate-400 text-sm mb-2">Year</label>
                        <select
                            id="year-select"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        >
                            <option value={2024} className="bg-slate-800">2024</option>
                            <option value={2025} className="bg-slate-800">2025</option>
                        </select>
                    </div>
                </div>

                <div
                    className={`rounded-xl p-4 sm:p-6 mb-6 text-center ${isPositive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
                    role="status"
                    aria-live="polite"
                    aria-label={`Compliance balance: ${cbValue.toLocaleString()} gCO2eq, ${isPositive ? 'surplus' : 'deficit'}`}
                >
                    {isLoading ? (
                        <div className="text-slate-400">Calculating...</div>
                    ) : (
                        <>
                            <div className="text-xs sm:text-sm text-slate-400 mb-1">Adjusted Compliance Balance</div>
                            <div className={`text-2xl sm:text-4xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {cbValue.toLocaleString('en', { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-slate-500 text-xs sm:text-sm mt-1">gCO₂eq</div>
                            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isPositive ? '✓ Surplus — Can be banked' : '✗ Deficit — Need banking or pooling'}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={handleBank}
                    disabled={!isPositive || isPending}
                    aria-label={isPending ? 'Banking surplus in progress' : 'Bank surplus compliance balance'}
                    className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                    {isPending ? 'Banking...' : '💰 Bank Surplus'}
                </button>

                {isSuccess && (
                    <div role="alert" className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm text-center">
                        Surplus successfully banked! ✓
                    </div>
                )}
                {isError && (
                    <div role="alert" className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                        {(error as Error)?.message}
                    </div>
                )}
            </Card>

            <Card title="How Banking Works">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-2xl mb-2" aria-hidden="true">📊</div>
                        <div className="text-white font-semibold text-sm">Calculate CB</div>
                        <div className="text-slate-400 text-xs mt-1">CB = (Target − Actual GHG) × Energy</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-2xl mb-2" aria-hidden="true">🏦</div>
                        <div className="text-white font-semibold text-sm">Bank Surplus</div>
                        <div className="text-slate-400 text-xs mt-1">Store positive CB for future use</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-2xl mb-2" aria-hidden="true">💳</div>
                        <div className="text-white font-semibold text-sm">Apply to Deficit</div>
                        <div className="text-slate-400 text-xs mt-1">Cover negative CB from banked pool</div>
                    </div>
                </div>
            </Card>
        </section>
    );
}

/* ──────────── Pooling Tab ──────────── */
function PoolingTab() {
    const [year, setYear] = useState(2024);
    const [members, setMembers] = useState([
        { ship_id: 'R001', cb_current: 500000 },
        { ship_id: 'R003', cb_current: -200000 }
    ]);
    const [newShip, setNewShip] = useState('');
    const [newCb, setNewCb] = useState('');
    const [poolResult, setPoolResult] = useState<any[]>([]);
    const { mutate: createPool, isPending, isSuccess, isError, error } = useCreatePool();

    const sum = members.reduce((a, b) => a + b.cb_current, 0);
    const isValid = sum >= 0;

    const addMember = () => {
        if (newShip && newCb) {
            setMembers([...members, { ship_id: newShip, cb_current: Number(newCb) }]);
            setNewShip(''); setNewCb('');
        }
    };

    const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));

    const handlePool = () => {
        createPool({ year, members }, {
            onSuccess: (data) => setPoolResult(Array.isArray(data) ? data : [])
        });
    };

    return (
        <section aria-label="Pool management" className="space-y-4 sm:space-y-6">
            <Card title="Pool Configuration">
                <div className="mb-4">
                    <label htmlFor="pool-year" className="block text-slate-400 text-sm mb-2">Year</label>
                    <select id="pool-year" value={year} onChange={e => setYear(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors">
                        <option value={2024} className="bg-slate-800">2024</option>
                        <option value={2025} className="bg-slate-800">2025</option>
                    </select>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4" role="list" aria-label="Pool members">
                    {members.map((m, i) => (
                        <div key={i} role="listitem" className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-white/5">
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-sm sm:text-base truncate">{m.ship_id}</div>
                                <div className={`text-xs sm:text-sm font-mono ${m.cb_current >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {m.cb_current.toLocaleString()} gCO₂eq
                                </div>
                            </div>
                            <Badge color={m.cb_current >= 0 ? 'green' : 'red'}>
                                {m.cb_current >= 0 ? 'Surplus' : 'Deficit'}
                            </Badge>
                            <button
                                onClick={() => removeMember(i)}
                                aria-label={`Remove ${m.ship_id} from pool`}
                                className="text-slate-500 hover:text-red-400 focus:outline-none focus:text-red-400 transition-colors text-lg p-1"
                            >×</button>
                        </div>
                    ))}
                </div>

                <fieldset className="mb-4">
                    <legend className="sr-only">Add new pool member</legend>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            value={newShip}
                            onChange={e => setNewShip(e.target.value)}
                            placeholder="Ship ID"
                            aria-label="Ship ID for new pool member"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        />
                        <input
                            type="number"
                            value={newCb}
                            onChange={e => setNewCb(e.target.value)}
                            placeholder="CB value"
                            aria-label="Compliance balance value for new pool member"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        />
                        <button
                            onClick={addMember}
                            aria-label="Add member to pool"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                        >Add</button>
                    </div>
                </fieldset>

                <div
                    className={`p-4 rounded-lg mb-4 flex justify-between items-center ${isValid ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
                    role="status"
                    aria-live="polite"
                >
                    <div>
                        <div className="text-slate-400 text-xs sm:text-sm">Pool Net Sum</div>
                        <div className={`text-xl sm:text-2xl font-bold font-mono ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                            {sum.toLocaleString()} gCO₂eq
                        </div>
                    </div>
                    <div className="text-2xl" aria-hidden="true">{isValid ? '✅' : '❌'}</div>
                </div>

                <button onClick={handlePool} disabled={!isValid || isPending}
                    aria-label={isPending ? 'Executing pool allocation' : 'Execute pool allocation'}
                    className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white shadow-lg shadow-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950">
                    {isPending ? 'Executing Pool...' : '🔄 Execute Pool Allocation'}
                </button>

                {!isValid && (
                    <p role="alert" className="mt-3 text-red-400 text-sm text-center">Pool net sum must be ≥ 0 to proceed</p>
                )}
                {isError && (
                    <div role="alert" className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                        {(error as Error)?.message}
                    </div>
                )}
            </Card>

            {isSuccess && poolResult.length > 0 && (
                <Card title="Pool Allocation Result">
                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10" role="region" aria-label="Pool allocation results table">
                        <table className="w-full text-left" aria-label="Pool allocation results">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wide">
                                    <th scope="col" className="px-4 py-3">Ship</th>
                                    <th scope="col" className="px-4 py-3">CB Before</th>
                                    <th scope="col" className="px-4 py-3">CB After</th>
                                    <th scope="col" className="px-4 py-3">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {poolResult.map((r: any, i: number) => (
                                    <tr key={i} className="border-t border-white/5">
                                        <td className="px-4 py-3 font-semibold text-white">{r.ship_id}</td>
                                        <td className={`px-4 py-3 font-mono ${r.cb_before >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {r.cb_before.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 font-mono ${r.cb_after >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {r.cb_after.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-cyan-400">
                                            {r.cb_after > r.cb_before ? '+' : ''}{(r.cb_after - r.cb_before).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="sm:hidden space-y-3" role="list" aria-label="Pool allocation results">
                        {poolResult.map((r: any, i: number) => (
                            <div key={i} role="listitem" className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <div className="text-white font-bold mb-2">{r.ship_id}</div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-500 uppercase">Before</span>
                                        <p className={`font-mono ${r.cb_before >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.cb_before.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 uppercase">After</span>
                                        <p className={`font-mono ${r.cb_after >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.cb_after.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 uppercase">Change</span>
                                        <p className="font-mono text-cyan-400">{r.cb_after > r.cb_before ? '+' : ''}{(r.cb_after - r.cb_before).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </section>
    );
}

/* ──────────── Shared Components ──────────── */
function Loader() {
    return (
        <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="sr-only">Loading...</span>
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">{title}</h3>
            {children}
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: 'blue' | 'green' | 'red' }) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
        green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400'
    };
    return (
        <div className={`rounded-xl border p-3 sm:p-4 bg-gradient-to-br ${colors[color]}`} role="status" aria-label={`${label}: ${value}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-slate-400 text-xs sm:text-sm">{label}</div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{value}</div>
                </div>
                <div className={colors[color]}>{icon}</div>
            </div>
        </div>
    );
}

function Badge({ color, children }: { color: 'blue' | 'green' | 'red'; children: React.ReactNode }) {
    const colors = {
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold whitespace-nowrap ${colors[color]}`}>
            {children}
        </span>
    );
}

/* ──────────── Main App ──────────── */
const tabs = [
    { label: 'Routes', icon: <Ship size={16} aria-hidden="true" /> },
    { label: 'Compare', icon: <TrendingUp size={16} aria-hidden="true" /> },
    { label: 'Banking', icon: <DollarSign size={16} aria-hidden="true" /> },
    { label: 'Pooling', icon: <Users size={16} aria-hidden="true" /> }
];

export default function App() {
    const [tab, setTab] = useState(0);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" aria-hidden="true">
                        <Anchor size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-base sm:text-lg leading-tight">FuelEU Maritime</h1>
                        <p className="text-slate-400 text-xs hidden sm:block">Compliance Platform</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
                        <span className="text-slate-400 text-xs hidden sm:inline">Target: {TARGET_GHG} gCO₂/MJ</span>
                        <span className="text-slate-400 text-xs sm:hidden">{TARGET_GHG}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Tab Navigation */}
                <nav aria-label="Dashboard navigation" className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide">
                    {tabs.map((t, i) => (
                        <button
                            key={t.label}
                            onClick={() => setTab(i)}
                            aria-selected={tab === i}
                            aria-controls={`tab-panel-${i}`}
                            role="tab"
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 ${tab === i
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </nav>

                {/* Tab Content */}
                <div className="animate-fade-in" role="tabpanel" id={`tab-panel-${tab}`} aria-label={tabs[tab].label}>
                    {tab === 0 && <RoutesTab />}
                    {tab === 1 && <CompareTab />}
                    {tab === 2 && <BankingTab />}
                    {tab === 3 && <PoolingTab />}
                </div>
            </main>

            {/* Skip to content link for keyboard users */}
            <a href="#tab-panel-0" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
                Skip to content
            </a>
        </div>
    );
}
