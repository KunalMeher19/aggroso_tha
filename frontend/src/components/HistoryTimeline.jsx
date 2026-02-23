import { useState } from 'react'
import DiffViewer from './DiffViewer'
import LLMSummary from './LLMSummary'

const URL_TYPE_LABELS = {
    pricing: '💰 Pricing',
    docs: '📖 Docs',
    changelog: '📋 Changelog',
}

function ContentPreview({ snapshotId }) {
    const [open, setOpen] = useState(false)
    const content = snapshotId?.cleanedContent
    if (!content) return null
    const lineCount = content.split('\n').filter(Boolean).length
    return (
        <div
            style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
            }}
        >
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: 'none',
                    borderBottom: open ? '1px solid var(--border)' : 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '9px 14px',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <span>{open ? '▲' : '▼'}</span>
                <span>Fetched content</span>
                <span style={{ opacity: 0.55 }}>({lineCount} lines)</span>
            </button>
            {open && (
                <pre
                    style={{
                        margin: 0,
                        padding: '12px 14px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '420px',
                        overflowY: 'auto',
                        lineHeight: 1.65,
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        background: '#0d0d0d',
                    }}
                >
                    {content}
                </pre>
            )}
        </div>
    )
}

function HistoryEntryDetail({ item }) {
    const [open, setOpen] = useState(false)
    const addedLines = item.diffData?.added?.length || 0
    const removedLines = item.diffData?.removed?.length || 0
    const hasChanges = addedLines > 0 || removedLines > 0

    return (
        <div>
            <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '8px' }}
                onClick={() => setOpen((v) => !v)}
            >
                {open ? '▲ Hide details' : '▼ Show details'}
            </button>

            {open && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Diff section */}
                    {item.isFirstCheck ? (
                        <div
                            style={{
                                padding: '12px 16px',
                                background: 'rgba(200,200,200,0.04)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            <strong style={{ color: 'var(--text-primary)' }}>Baseline snapshot</strong>
                            {item.snapshotId?.cleanedContent && (
                                <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.78rem' }}>
                                    ({item.snapshotId.cleanedContent.split('\n').filter(Boolean).length} lines captured)
                                </span>
                            )}
                            <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                No diff available — this is the initial snapshot.
                            </p>
                        </div>
                    ) : (
                        <>
                            {hasChanges && (
                                <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem' }}>
                                    {addedLines > 0 && (
                                        <span style={{ color: 'var(--accent-green)' }}>+{addedLines} lines added</span>
                                    )}
                                    {removedLines > 0 && (
                                        <span style={{ color: 'var(--accent-red)' }}>-{removedLines} lines removed</span>
                                    )}
                                </div>
                            )}
                            <DiffViewer
                                diffData={item.diffData}
                                changeScore={item.changeScore}
                                isFirstCheck={false}
                            />
                        </>
                    )}

                    {/* Snapshot content */}
                    <ContentPreview snapshotId={item.snapshotId} />

                    {/* AI summary */}
                    <LLMSummary summary={item.llmSummary} status={item.llmStatus} />
                </div>
            )}
        </div>
    )
}

export default function HistoryTimeline({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No history yet</h3>
                <p>Run a check to start building history</p>
            </div>
        )
    }

    return (
        <div className="timeline">
            {history.map((item) => {
                const scoreColor =
                    item.changeScore === 0
                        ? 'var(--text-muted)'
                        : item.changeScore < 10
                            ? 'var(--accent-green)'
                            : item.changeScore < 40
                                ? 'var(--accent-amber)'
                                : 'var(--accent-red)'

                const fetchOk = item.snapshotId?.fetchStatus === 'success'

                return (
                    <div key={item._id} className="timeline-item">
                        <div className="timeline-dot" style={{ background: scoreColor }} />
                        <div className="card" style={{ padding: '16px' }}>
                            {/* Header row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                    <span className="badge badge-gray">
                                        {URL_TYPE_LABELS[item.urlType] || item.urlType}
                                    </span>
                                    {item.isFirstCheck && <span className="badge badge-purple">First Check</span>}
                                    {item.changeScore > 0 && !item.isFirstCheck && (
                                        <span
                                            className="badge"
                                            style={{
                                                background: `${scoreColor}20`,
                                                color: scoreColor,
                                                border: `1px solid ${scoreColor}40`,
                                            }}
                                        >
                                            {item.changeScore}% changed
                                        </span>
                                    )}
                                    {fetchOk ? (
                                        <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>OK Scraped</span>
                                    ) : item.snapshotId?.fetchStatus ? (
                                        <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>
                                            {item.snapshotId.fetchStatus}
                                        </span>
                                    ) : null}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </span>
                            </div>

                            {/* Quick summary line */}
                            {!item.isFirstCheck && item.llmStatus === 'no_changes' && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Content identical to previous check
                                </p>
                            )}
                            {item.isFirstCheck && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Baseline captured
                                    {item.snapshotId?.cleanedContent && (
                                        <> &mdash; {item.snapshotId.cleanedContent.split('\n').filter(Boolean).length} lines</>
                                    )}
                                </p>
                            )}

                            <HistoryEntryDetail item={item} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
