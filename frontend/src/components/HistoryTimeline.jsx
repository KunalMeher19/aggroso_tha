import { useState } from 'react'
import DiffViewer from './DiffViewer'
import LLMSummary from './LLMSummary'

const URL_TYPE_LABELS = {
    pricing: '💰 Pricing',
    docs: '📖 Docs',
    changelog: '📋 Changelog',
}

function HistoryEntryDetail({ item }) {
    const [open, setOpen] = useState(false)
    return (
        <div>
            <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '8px' }}
                onClick={() => setOpen((v) => !v)}
            >
                {open ? '▲ Hide details' : '▼ Show diff & summary'}
            </button>
            {open && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <DiffViewer
                        diffData={item.diffData}
                        changeScore={item.changeScore}
                        isFirstCheck={item.isFirstCheck}
                    />
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

                return (
                    <div key={item._id} className="timeline-item">
                        <div className="timeline-dot" style={{ background: scoreColor }} />
                        <div className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <span className="badge badge-gray" style={{ marginRight: '8px' }}>
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
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </span>
                            </div>

                            {item.llmStatus === 'no_changes' && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    No significant changes detected
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
