import { useState, useEffect } from 'react'
import { getStatus } from '../api'

function ServiceCard({ name, icon, status, message }) {
    const isOk = status === 'ok'
    const isError = status === 'error'

    return (
        <div
            className="card"
            style={{
                borderLeft: `4px solid ${isOk
                        ? 'var(--accent-green)'
                        : isError
                            ? 'var(--accent-red)'
                            : 'var(--accent-amber)'
                    }`,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <div>
                    <div style={{ fontWeight: 700 }}>{name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span className={`status-dot ${isOk ? 'ok' : isError ? 'error' : 'unknown'} ${!isOk ? '' : 'pulse'}`} />
                        <span style={{ fontSize: '0.78rem', color: isOk ? 'var(--accent-green)' : isError ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                            {status?.toUpperCase() || 'CHECKING...'}
                        </span>
                    </div>
                </div>
            </div>
            {message && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{message}</p>
            )}
        </div>
    )
}

export default function StatusPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState(null)

    const fetch = async () => {
        try {
            const res = await getStatus()
            setData(res)
            setLastRefresh(new Date())
        } catch (err) {
            setData({
                overall: 'error',
                services: {
                    backend: { status: 'error', message: err.message },
                    database: { status: 'unknown' },
                    llm: { status: 'unknown' },
                },
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch()
        const interval = setInterval(fetch, 30000) // auto-refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const services = data?.services || {}
    const overallOk = data?.overall === 'ok'

    return (
        <div>
            <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">System Status</h1>
                    <p className="page-sub">
                        {lastRefresh ? `Last refreshed: ${lastRefresh.toLocaleTimeString()}` : 'Checking...'}
                        <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            (auto-refreshes every 30s)
                        </span>
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!loading && (
                        <span
                            className={`badge ${overallOk ? 'badge-green' : 'badge-red'}`}
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        >
                            {overallOk ? '✓ All Systems Operational' : '⚠ Degraded Service'}
                        </span>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={fetch}>↺ Refresh</button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
                    <ServiceCard
                        name="Backend API"
                        icon="🖥️"
                        status={services.backend?.status}
                        message={`Uptime: ${Math.floor((services.backend?.uptime || 0) / 60)}m ${(services.backend?.uptime || 0) % 60}s`}
                    />
                    <ServiceCard
                        name="MongoDB Database"
                        icon="🗄️"
                        status={services.database?.status}
                        message={services.database?.message}
                    />
                    <ServiceCard
                        name="Gemini 1.5-flash (LLM)"
                        icon="🤖"
                        status={services.llm?.status}
                        message={services.llm?.message}
                    />
                </div>
            )}

            {data?.responseTime && (
                <p style={{ marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Status check took: {data.responseTime}
                </p>
            )}

            <div className="card" style={{ marginTop: '32px', maxWidth: '640px' }}>
                <h3 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>🛠 Tech Stack</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        ['Backend', 'Node.js + Express'],
                        ['Database', 'MongoDB (Mongoose)'],
                        ['AI Provider', 'Google Gemini 1.5-flash'],
                        ['Scraping', 'Axios + Cheerio (3-retry + UA rotation)'],
                        ['Diff Engine', 'npm diff (line-level)'],
                        ['Frontend', 'React + Vite'],
                    ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', gap: '12px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)', width: '100px', flexShrink: 0 }}>{label}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
