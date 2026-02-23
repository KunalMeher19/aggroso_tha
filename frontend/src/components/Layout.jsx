import { NavLink } from 'react-router-dom'

const navItems = [
    { path: '/', label: 'Home', icon: '🌑', exact: true },
    { path: '/dashboard', label: 'Dashboard', icon: '▦', exact: false },
    { path: '/status', label: 'System Status', icon: '◎' },
]

export default function Layout({ children }) {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-text">◈ CompTracker</div>
                    <div className="logo-sub">Intelligence Platform</div>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        by Ardhendu Meher
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Powered by OpenRouter AI
                    </p>
                </div>
            </aside>
            <main className="main-content">{children}</main>
        </div>
    )
}
