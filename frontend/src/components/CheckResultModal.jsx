import { useState } from 'react'
import { Link } from 'react-router-dom'
import DiffViewer from './DiffViewer'

const URL_LABELS = { pricing: '💰 Pricing', docs: '📖 Docs', changelog: '📋 Changelog' }

function ScrapeBadge({ status }) {
    if (status === 'success')
        return <span className="badge badge-green">✓ Scraped OK</span>
    if (status === 'first_check')
        return <span className="badge badge-cyan">◈ First Check</span>
    return <span className="badge badge-red">✗ {status}</span>
}

function AISummaryPanel({ summary, status }) {
    const [expanded, setExpanded] = useState(false)

    if (!status || status === 'skipped') {
        return (
            <div
                style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>🤖</span>
                    <span className="llm-badge">AI Summary</span>
                    <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>Skipped</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    AI summary is generated only when significant changes are detected.
                    {status === 'skipped' && ' This is the first baseline snapshot.'}
                </p>
            </div>
        )
    }

    if (status === 'no_changes') {
        return (
            <div
                style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: 'rgba(76,175,125,0.05)',
                    border: '1px solid rgba(76,175,125,0.2)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>🤖</span>
                    <span className="llm-badge">AI Summary</span>
                    <span className="badge badge-green" style={{ marginLeft: 'auto' }}>No Changes</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Content is identical to the previous check — no AI analysis needed.
                </p>
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div
                style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: 'rgba(224,82,82,0.05)',
                    border: '1px solid rgba(224,82,82,0.2)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>🤖</span>
                    <span className="llm-badge">AI Summary</span>
                    <span className="badge badge-red" style={{ marginLeft: 'auto' }}>Failed</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {summary || 'AI service unavailable — check System Status page.'}
                </p>
            </div>
        )
    }

    // success
    const preview = summary?.slice(0, 280)
    const hasMore = summary?.length > 280

    return (
        <div
            style={{
                marginTop: '12px',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1rem' }}>🤖</span>
                <span className="llm-badge">AI Summary</span>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>✓ Generated</span>
            </div>
            <div
                style={{
                    fontSize: '0.82rem',
                    lineHeight: 1.75,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {expanded ? summary : preview}
                {hasMore && !expanded && '…'}
            </div>
            {hasMore && (
                <button
                    onClick={() => setExpanded((e) => !e)}
                    style={{
                        marginTop: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-silver)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit',
                    }}
                >
                    {expanded ? '▲ Collapse' : '▼ Read full summary'}
                </button>
            )}
        </div>
    )
}

function UrlResult({ result }) {
    const { urlType, status: settledStatus, data, error } = result

    if (settledStatus === 'rejected' || error) {
        return (
            <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {URL_LABELS[urlType] || urlType}
                    </span>
                    <span className="badge badge-red">✗ Error</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-red)' }}>{error}</p>
            </div>
        )
    }

    if (!data) return null

    const { diffData, changeScore, llmSummary, llmStatus, isFirstCheck } = data
    const scrapeStatus = isFirstCheck ? 'first_check' : data.snapshotId ? 'success' : 'failed'
    const addedLines = diffData?.added?.length || 0
    const removedLines = diffData?.removed?.length || 0

    return (
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            {/* URL type header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {URL_LABELS[urlType] || urlType}
                </span>
                <ScrapeBadge status={scrapeStatus} />
                {!isFirstCheck && changeScore !== undefined && (
                    <span
                        className="badge"
                        style={{
                            background: changeScore === 0
                                ? 'rgba(76,175,125,0.1)'
                                : changeScore < 30
                                    ? 'rgba(200,161,74,0.1)'
                                    : 'rgba(224,82,82,0.1)',
                            color: changeScore === 0
                                ? 'var(--accent-green)'
                                : changeScore < 30
                                    ? 'var(--accent-amber)'
                                    : 'var(--accent-red)',
                            border: '1px solid currentColor',
                        }}
                    >
                        {changeScore}% change
                    </span>
                )}
            </div>

            {/* Stats row */}
            {isFirstCheck ? (
                <div
                    style={{
                        padding: '10px 14px',
                        background: 'rgba(200,200,200,0.04)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <strong style={{ color: 'var(--text-primary)' }}>◈ Baseline captured</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {addedLines} lines stored
                    </span>
                    <p style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        Run Check Now again to start seeing diffs.
                    </p>
                </div>
            ) : (
                <>
                    {/* Stats summary row */}
                    {(addedLines > 0 || removedLines > 0) && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '0.8rem' }}>
                            {addedLines > 0 && (
                                <span style={{ color: 'var(--accent-green)' }}>+{addedLines} lines added</span>
                            )}
                            {removedLines > 0 && (
                                <span style={{ color: 'var(--accent-red)' }}>−{removedLines} lines removed</span>
                            )}
                        </div>
                    )}

                    {/* Diff viewer (capped) */}
                    <DiffViewer
                        diffData={diffData}
                        changeScore={changeScore}
                        isFirstCheck={false}
                    />
                </>
            )}

            {/* AI Summary */}
            <AISummaryPanel summary={llmSummary} status={llmStatus} />
        </div>
    )
}

export default function CheckResultModal({ competitor, results, onClose }) {
    const [activeTab, setActiveTab] = useState(0)

    // Filter only results that have data or errored
    const validResults = results.filter(
        (r) => r.data !== null || r.status === 'rejected'
    )

    const activeResult = validResults[activeTab] || validResults[0]

    const overallScore = Math.max(
        0,
        ...validResults.filter((r) => r.data).map((r) => r.data.changeScore || 0)
    )
    const allFirstCheck = validResults.every((r) => r.data?.isFirstCheck)
    const anyAI = validResults.some((r) => r.data?.llmStatus === 'success')

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: '680px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="modal-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                                Check Complete — {competitor.name}
                            </h2>
                            {allFirstCheck ? (
                                <span className="badge badge-cyan">◈ First Snapshot</span>
                            ) : anyAI ? (
                                <span className="badge badge-green">🤖 AI Analysed</span>
                            ) : overallScore === 0 ? (
                                <span className="badge badge-green">✓ No Changes</span>
                            ) : (
                                <span className="badge badge-amber">△ Changed</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {validResults.length} URL{validResults.length !== 1 ? 's' : ''} checked
                            {!allFirstCheck && ` · max change score: ${overallScore}%`}
                        </p>
                    </div>
                    <button
                        className="btn btn-icon"
                        onClick={onClose}
                        style={{ flexShrink: 0 }}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* URL type tabs */}
                {validResults.length > 1 && (
                    <div style={{ padding: '0 24px', display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)' }}>
                        {validResults.map((r, i) => (
                            <button
                                key={r.urlType}
                                className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {URL_LABELS[r.urlType] || r.urlType}
                                {r.data?.changeScore > 0 && (
                                    <span
                                        style={{
                                            marginLeft: '6px',
                                            display: 'inline-block',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-amber)',
                                            verticalAlign: 'middle',
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {validResults.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                            No URLs were configured to check.
                        </p>
                    ) : (
                        <UrlResult result={activeResult} />
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Full diff history available on the detail page
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>
                            Close
                        </button>
                        <Link
                            to={`/competitor/${competitor._id}`}
                            className="btn btn-primary btn-sm"
                            onClick={onClose}
                        >
                            View Full Details →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
