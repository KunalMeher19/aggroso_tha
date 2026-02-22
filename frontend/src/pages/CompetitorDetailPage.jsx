import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCompetitor, checkNow, getHistory, deleteCompetitor } from '../api'
import { useToast } from '../context/ToastContext'
import DiffViewer from '../components/DiffViewer'
import LLMSummary from '../components/LLMSummary'
import HistoryTimeline from '../components/HistoryTimeline'

const URL_TYPES = ['pricing', 'docs', 'changelog']
const URL_LABELS = { pricing: '💰 Pricing', docs: '📖 Docs', changelog: '📋 Changelog' }

export default function CompetitorDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { show } = useToast()

    const [competitor, setCompetitor] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [activeUrlType, setActiveUrlType] = useState('pricing')
    const [latestResult, setLatestResult] = useState(null)

    const load = useCallback(async () => {
        try {
            const [compRes, histRes] = await Promise.all([
                getCompetitor(id),
                getHistory(id),
            ])
            setCompetitor(compRes.data)
            const hist = histRes.data || []
            setHistory(hist)
            // Show the latest result for the active urlType
            setLatestResult(hist.find((h) => h.urlType === activeUrlType) || null)
        } catch (err) {
            show(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }, [id, activeUrlType])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        if (history.length > 0) {
            setLatestResult(history.find((h) => h.urlType === activeUrlType) || null)
        }
    }, [activeUrlType, history])

    const handleCheck = async () => {
        setChecking(true)
        try {
            await checkNow(id)
            show('Check complete!', 'success')
            await load()
        } catch (err) {
            show(err.message, 'error')
        } finally {
            setChecking(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Delete ${competitor?.name} and all its data?`)) return
        try {
            await deleteCompetitor(id)
            show(`${competitor.name} deleted`, 'info')
            navigate('/dashboard')
        } catch (err) {
            show(err.message, 'error')
        }
    }

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '200px', borderRadius: '12px' }} />
            </div>
        )
    }

    if (!competitor) {
        return (
            <div className="empty-state">
                <div className="empty-icon">❓</div>
                <h3>Competitor not found</h3>
                <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>
                    ← Back to Dashboard
                </Link>
            </div>
        )
    }

    const trackedUrls = URL_TYPES.filter((t) => competitor.urls?.[t])
    const historyByType = URL_TYPES.reduce((acc, t) => {
        acc[t] = history.filter((h) => h.urlType === t)
        return acc
    }, {})

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <Link to="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ← Dashboard
                    </Link>
                    <h1 className="page-title" style={{ marginTop: '4px' }}>{competitor.name}</h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {competitor.tags?.map((tag) => (
                            <span key={tag} className="badge badge-gray">{tag}</span>
                        ))}
                        {competitor.lastCheckedAt && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                Last checked: {new Date(competitor.lastCheckedAt).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Delete</button>
                    <button className="btn btn-primary" onClick={handleCheck} disabled={checking}>
                        {checking ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Checking...</> : '⚡ Check Now'}
                    </button>
                </div>
            </div>

            {/* URLs info */}
            <div className="card mb-24" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px 20px' }}>
                {URL_TYPES.map((t) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{URL_LABELS[t]}:</span>
                        {competitor.urls?.[t] ? (
                            <a
                                href={competitor.urls[t]}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                                {competitor.urls[t]}
                            </a>
                        ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not set</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    📊 Latest Results
                </button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    📅 History
                </button>
            </div>

            {activeTab === 'overview' && (
                <div>
                    {/* URL type selector */}
                    {trackedUrls.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            {trackedUrls.map((t) => (
                                <button
                                    key={t}
                                    className={`btn btn-sm ${activeUrlType === t ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setActiveUrlType(t)}
                                >
                                    {URL_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    )}

                    {!competitor.lastCheckedAt ? (
                        <div className="empty-state">
                            <div className="empty-icon">⚡</div>
                            <h3>No data yet</h3>
                            <p>Click "Check Now" to fetch content and see changes</p>
                            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleCheck} disabled={checking}>
                                {checking ? 'Checking...' : '⚡ Run First Check'}
                            </button>
                        </div>
                    ) : latestResult ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <DiffViewer
                                diffData={latestResult.diffData}
                                changeScore={latestResult.changeScore}
                                isFirstCheck={latestResult.isFirstCheck}
                            />
                            <LLMSummary summary={latestResult.llmSummary} status={latestResult.llmStatus} />
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No results for {URL_LABELS[activeUrlType]}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button
                            className={`btn btn-sm ${activeUrlType === '' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveUrlType('')}
                        >
                            All
                        </button>
                        {trackedUrls.map((t) => (
                            <button
                                key={t}
                                className={`btn btn-sm ${activeUrlType === t ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveUrlType(t)}
                            >
                                {URL_LABELS[t]}
                            </button>
                        ))}
                    </div>
                    <HistoryTimeline
                        history={activeUrlType ? historyByType[activeUrlType] : history}
                    />
                </div>
            )}
        </div>
    )
}
