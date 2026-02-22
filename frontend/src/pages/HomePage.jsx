import { Link } from 'react-router-dom'

const steps = [
    {
        num: '01',
        icon: '🔗',
        title: 'Add Competitors',
        desc: 'Add competitor links — pricing page, docs, and changelog. Organize them with tags.',
        color: 'var(--accent-cyan)',
    },
    {
        num: '02',
        icon: '🔍',
        title: 'Check Now',
        desc: 'Click "Check Now" to fetch live content and store a snapshot in the database.',
        color: 'var(--accent-purple)',
    },
    {
        num: '03',
        icon: '📊',
        title: 'See What Changed',
        desc: 'View line-by-line diffs: green for additions, red for removals. See the change score.',
        color: 'var(--accent-green)',
    },
    {
        num: '04',
        icon: '🤖',
        title: 'AI Summary',
        desc: 'Gemini AI summarizes changes, highlights business-critical updates, and cites snippets.',
        color: 'var(--accent-amber)',
    },
]

export default function HomePage() {
    return (
        <div>
            {/* Hero */}
            <div style={{ padding: '60px 0 40px', textAlign: 'center' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--accent-cyan-dim)',
                        border: '1px solid var(--border-accent)',
                        borderRadius: '100px',
                        padding: '6px 16px',
                        fontSize: '0.78rem',
                        color: 'var(--accent-cyan)',
                        marginBottom: '24px',
                    }}
                >
                    <span>✨</span> Powered by Google Gemini 1.5-flash
                </div>

                <h1
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        background: 'linear-gradient(135deg, #f0f4ff 20%, var(--accent-cyan) 60%, var(--accent-purple) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '20px',
                    }}
                >
                    Track Competitors.<br />Know What Changed.
                </h1>

                <p
                    style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '560px',
                        margin: '0 auto 40px',
                        lineHeight: 1.7,
                    }}
                >
                    Monitor competitor pricing pages, docs, and changelogs. Get instant diffs and AI-powered summaries of what matters.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                        🚀 Open Dashboard
                    </Link>
                    <Link to="/status" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                        🟢 System Status
                    </Link>
                </div>
            </div>

            {/* Feature grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
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
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '-16px',
                                right: '-8px',
                                fontSize: '5rem',
                                opacity: 0.04,
                                fontWeight: 900,
                            }}
                        >
                            {step.num}
                        </div>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{step.icon}</div>
                        <h3
                            style={{
                                fontSize: '1rem',
                                color: step.color,
                                marginBottom: '8px',
                            }}
                        >
                            {step.title}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Feature highlights */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    ✦ Everything you need to stay ahead
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {[
                        ['🏷️', 'Tags & Filters', 'Organize by category'],
                        ['📅', 'History', 'Last 5 checks per URL'],
                        ['⚡', 'Change Score', 'See % content change'],
                        ['🎯', "Matters Filter", 'Business-critical only'],
                        ['🔒', 'Secure', 'No keys in code'],
                        ['🐳', 'Docker Ready', 'One-command deploy'],
                    ].map(([icon, title, desc]) => (
                        <div
                            key={title}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
