import { Link } from 'react-router-dom'

const steps = [
    {
        num: '01',
        icon: '🔗',
        title: 'Add Competitors',
        desc: 'Add competitor links — pricing page, docs, and changelog. Organize them with tags.',
        color: 'var(--accent-silver)',
    },
    {
        num: '02',
        icon: '🔎',
        title: 'Check Now',
        desc: 'Click "Check Now" to fetch live content and store a snapshot in the database.',
        color: '#888888',
    },
    {
        num: '03',
        icon: '📋',
        title: 'See What Changed',
        desc: 'View line-by-line diffs: green for additions, red for removals. See the change score.',
        color: 'var(--accent-green)',
    },
    {
        num: '04',
        icon: '🤖',
        title: 'AI Summary',
        desc: 'AI summarizes changes, highlights business-critical updates, and cites snippets.',
        color: 'var(--accent-amber)',
    },
]

export default function HomePage() {
    return (
        <div>
            {/* Hero */}
            <div style={{ padding: '64px 0 44px', textAlign: 'center' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '100px',
                        padding: '6px 18px',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '28px',
                        letterSpacing: '0.02em',
                    }}
                >
                    <span>◈</span> Powered by OpenRouter AI — Free Tier
                </div>

                <h1
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: 'var(--text-primary)',
                        marginBottom: '20px',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Track Competitors.<br />Know What Changed.
                </h1>

                <p
                    style={{
                        fontSize: '1.05rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '520px',
                        margin: '0 auto 44px',
                        lineHeight: 1.75,
                    }}
                >
                    Monitor competitor pricing pages, docs, and changelogs. Get instant diffs and AI-powered summaries of what matters.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 30px' }}>
                        ▶ Open Dashboard
                    </Link>
                    <Link to="/status" className="btn btn-secondary" style={{ fontSize: '0.95rem', padding: '13px 30px' }}>
                        ◎ System Status
                    </Link>
                </div>
            </div>

            {/* Feature grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '18px',
                    margin: '40px 0',
                }}
            >
                {steps.map((step) => (
                    <div
                        key={step.num}
                        className="card"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderTop: `2px solid ${step.color}22`,
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '-12px',
                                right: '-4px',
                                fontSize: '4.5rem',
                                opacity: 0.04,
                                fontWeight: 900,
                                color: 'white',
                            }}
                        >
                            {step.num}
                        </div>
                        <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>{step.icon}</div>
                        <h3
                            style={{
                                fontSize: '0.95rem',
                                color: step.color,
                                marginBottom: '8px',
                                fontWeight: 700,
                            }}
                        >
                            {step.title}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Feature highlights */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '0.95rem', marginBottom: '20px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    ◈ Everything you need to stay ahead
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {[
                        ['🏷', 'Tags & Filters', 'Organize by category'],
                        ['📂', 'History', 'Last 5 checks per URL'],
                        ['◉', 'Change Score', 'See % content change'],
                        ['◎', 'Smart Filter', 'Business-critical only'],
                        ['🔒', 'Secure', 'No keys in code'],
                        ['🐳', 'Docker Ready', 'One-command deploy'],
                    ].map(([icon, title, desc]) => (
                        <div
                            key={title}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            <span style={{ fontSize: '1.15rem', opacity: 0.8 }}>{icon}</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{title}</div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
