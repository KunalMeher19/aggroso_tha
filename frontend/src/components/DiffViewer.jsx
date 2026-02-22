export default function DiffViewer({ diffData, changeScore, isFirstCheck }) {
    if (!diffData) return null

    const { added = [], removed = [], stats = {} } = diffData
    const { addedCount = 0, removedCount = 0 } = stats

    if (isFirstCheck) {
        return (
            <div className="diff-container">
                <div className="diff-header">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📸 First snapshot captured — no previous content to compare</span>
                </div>
                <div style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <p>Baseline stored. Run another check to see diffs.</p>
                    <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                        Content captured: {added.length} lines
                    </p>
                </div>
            </div>
        )
    }

    if (addedCount === 0 && removedCount === 0) {
        return (
            <div className="diff-container">
                <div className="diff-header">
                    <span className="badge badge-green">✓ No Changes</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Content identical to last check</span>
                </div>
            </div>
        )
    }

    const scoreColor =
        changeScore < 10
            ? 'var(--accent-green)'
            : changeScore < 40
                ? 'var(--accent-amber)'
                : 'var(--accent-red)'

    const MAX_DISPLAY = 60

    return (
        <div className="diff-container">
            <div className="diff-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {addedCount > 0 && (
                    <span className="badge badge-green">+{addedCount} added</span>
                )}
                {removedCount > 0 && (
                    <span className="badge badge-red">-{removedCount} removed</span>
                )}
                <span
                    className="badge"
                    style={{ background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
                >
                    {changeScore}% changed
                </span>
                {added.length > MAX_DISPLAY || removed.length > MAX_DISPLAY ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        (showing first {MAX_DISPLAY} lines)
                    </span>
                ) : null}
            </div>
            <div className="diff-body">
                {removed.slice(0, MAX_DISPLAY).map((line, i) => (
                    <div key={`r-${i}`} className="diff-line removed">
                        <span className="diff-prefix">-</span>
                        <span className="diff-text">{line}</span>
                    </div>
                ))}
                {added.slice(0, MAX_DISPLAY).map((line, i) => (
                    <div key={`a-${i}`} className="diff-line added">
                        <span className="diff-prefix">+</span>
                        <span className="diff-text">{line}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
