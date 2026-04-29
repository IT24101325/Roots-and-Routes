import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const AnalyticsReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/admin/analytics');
                const result = await response.json();
                if (result.success) {
                    setData(result);
                } else {
                    setError('Failed to load analytics');
                }
            } catch (err) {
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const handleExportCSV = () => {
        if (!data) return;

        const csvContent = [
            ["Analytics Report"],
            [],
            ["Metric", "Value", "Trend"],
            ...data.summary.map(s => [s.label, s.value, s.trend]),
            [],
            ["Monthly Revenue"],
            ["Month", "Value"],
            ...data.monthlyRevenue.map(m => [m.label, m.value]),
            [],
            ["Top Categories"],
            ["Category", "Percentage"],
            ...data.topCategories.map(c => [c.name, `${c.pct}%`])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading real-time analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto', borderColor: 'var(--danger)' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    // Default to last 12 months for chart heights
    const maxRevenue = Math.max(...(data.monthlyRevenue.map(m => m.value) || [1]), 100);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Analytics & Reports</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-control" defaultValue="Last 30 Days">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>This Year</option>
                    </select>
                    <button className="btn btn-outline" onClick={handleExportCSV}>Export CSV</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {data.summary.map((s, i) => (
                    <div key={i} className="card animate-tile" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: s.up ? 'var(--success)' : 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {s.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {s.trend} vs last period
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card animate-tile" style={{ animationDelay: '0.4s' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Revenue Overview (Last 12 Months)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '220px', padding: '0 0.5rem' }}>
                        {data.monthlyRevenue.length > 0 ? (
                            data.monthlyRevenue.map((m, i) => {
                                const height = (m.value / maxRevenue) * 100;
                                const isCurrentMonth = i === data.monthlyRevenue.length - 1;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                                        <div 
                                            className="revenue-bar"
                                            title={`${m.label}: LKR ${m.value.toLocaleString()}`}
                                            style={{ 
                                                width: '100%', 
                                                height: `${Math.max(height, 5)}%`, 
                                                backgroundColor: isCurrentMonth ? 'var(--primary)' : 'var(--secondary)', 
                                                opacity: isCurrentMonth ? 1 : 0.6, 
                                                borderRadius: '4px 4px 0 0', 
                                                transition: 'all 0.5s ease-out',
                                                cursor: 'pointer'
                                            }}
                                        ></div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{m.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                                No revenue data for the selected period
                            </div>
                        )}
                    </div>
                </div>

                <div className="card animate-tile" style={{ animationDelay: '0.5s' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Top Categories</h3>
                    {data.topCategories.length > 0 ? (
                        data.topCategories.map((c, i) => (
                            <div key={i} style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.pct}%</span>
                                </div>
                                <div style={{ height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div 
                                        style={{ 
                                            height: '100%', 
                                            width: `${c.pct}%`, 
                                            background: 'linear-gradient(90deg, var(--primary), var(--primary-hover))', 
                                            borderRadius: '99px',
                                            transition: 'width 1s ease-in-out'
                                        }} 
                                    ></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No category data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsReports;
