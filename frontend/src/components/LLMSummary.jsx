export default function LLMSummary({ summary, status }) {
    if (!summary || status === 'skipped') {
        return (
            <div className="llm-summary" style={{ opacity: 0.6 }}>
                <div className="llm-summary-header">
                    <span>🤖</span>
                    <span className="llm-badge">AI Summary</span>
                    <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>Skipped</span>
                </div>
                <p className="llm-content" style={{ color: 'var(--text-muted)' }}>
                    Not enough changes to generate a summary (or this was the first check).
                </p>
            </div>
        )
    }

    const statusBadge = status === 'success'
        ? <span className="badge badge-green">✓ AI</span>
        : status === 'failed'
            ? <span className="badge badge-red">⚠ Failed</span>
            : status === 'no_changes'
                ? <span className="badge badge-gray">No Changes</span>
                : null

    return (
        <div className="llm-summary">
            <div className="llm-summary-header">
                <span>🤖</span>
                <span className="llm-badge">AI Summary</span>
                {statusBadge && <span style={{ marginLeft: 'auto' }}>{statusBadge}</span>}
            </div>
            <div className="llm-content">{summary}</div>
        </div>
    )
}
