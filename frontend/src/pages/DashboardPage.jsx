import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCompetitors, deleteCompetitor, checkNow } from '../api'
import { useToast } from '../context/ToastContext'
import AddCompetitorModal from '../components/AddCompetitorModal'

const TAG_COLORS = ['badge-cyan', 'badge-purple', 'badge-green', 'badge-amber']

function getScoreColor(score) {
    if (score === 0) return 'var(--text-muted)'
    if (score < 10) return 'var(--accent-green)'
    if (score < 40) return 'var(--accent-amber)'
    return 'var(--accent-red)'
}

function ChangeBar({ score }) {
    const color = getScoreColor(score)
    return (
        <div className="change-bar" style={{ marginTop: '8px' }}>
            <div
                className="change-bar-fill"
                style={{ width: `${score}%`, background: color }}
            />
        </div>
    )
}

function CompetitorCard({ competitor, onDeleted, onChecked }) {
    const { show } = useToast()
    const [checking, setChecking] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleCheck = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setChecking(true)
        try {
            await checkNow(competitor._id)
            show(`${competitor.name} checked!`, 'success')
            onChecked(competitor._id)
        } catch (err) {
            show(err.message, 'error')
        } finally {
            setChecking(false)
        }
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm(`Delete ${competitor.name} and all its data?`)) return
        setDeleting(true)
        try {
            await deleteCompetitor(competitor._id)
            show(`${competitor.name} deleted`, 'info')
            onDeleted(competitor._id)
        } catch (err) {
            show(err.message, 'error')
        } finally {
            setDeleting(false)
        }
    }

    const urlCount = Object.values(competitor.urls || {}).filter(Boolean).length
    const score = competitor.lastChangeScore || 0

    return (
        <Link to={`/competitor/${competitor._id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{competitor.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {urlCount} URL{urlCount !== 1 ? 's' : ''} tracked
                        </span>
                    </div>
                    <button
                        className="btn btn-icon btn-sm"
                        onClick={handleDelete}
                        disabled={deleting}
                        title="Delete competitor"
                        style={{ flexShrink: 0 }}
                    >
                        {deleting ? '...' : '🗑️'}
                    </button>
                </div>

                {/* Tags */}
                {competitor.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                        {competitor.tags.map((tag, i) => (
                            <span key={tag} className={`badge ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Change score */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Last change score</span>
                        <span style={{ color: getScoreColor(score), fontWeight: 700 }}>{score}%</span>
                    </div>
                    <ChangeBar score={score} />
                </div>

                {/* Last checked */}
                <div style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {competitor.lastCheckedAt
                            ? `Checked ${new Date(competitor.lastCheckedAt).toLocaleString()}`
                            : 'Never checked'}
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={handleCheck}
                        disabled={checking}
                    >
                        {checking ? (
                            <><span className="spinner" style={{ width: 14, height: 14 }} /> Checking...</>
                        ) : '⚡ Check Now'}
                    </button>
                </div>
            </div>
        </Link>
    )
}

export default function DashboardPage() {
    const { show } = useToast()
    const [competitors, setCompetitors] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [filterTag, setFilterTag] = useState('')

    const load = useCallback(async () => {
        try {
            const res = await getCompetitors(filterTag || undefined)
            setCompetitors(res.data || [])
        } catch (err) {
            show(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }, [filterTag])

    useEffect(() => { load() }, [load])

    // Collect all unique tags
    const allTags = [...new Set(competitors.flatMap((c) => c.tags || []))]

    const handleAdded = (newComp) => setCompetitors((prev) => [newComp, ...prev])
    const handleDeleted = (id) => setCompetitors((prev) => prev.filter((c) => c._id !== id))
    const handleChecked = () => load()

    return (
        <div>
            <div className="flex-between mb-24">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">
                        {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Add Competitor
                </button>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <button
                        className={`badge ${!filterTag ? 'badge-cyan' : 'badge-gray'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFilterTag('')}
                    >
                        All
                    </button>
                    {allTags.map((tag, i) => (
                        <button
                            key={tag}
                            className={`badge ${filterTag === tag ? TAG_COLORS[i % TAG_COLORS.length] : 'badge-gray'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card">
                            <div className="skeleton" style={{ height: '16px', marginBottom: '8px', width: '60%' }} />
                            <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '20px' }} />
                            <div className="skeleton" style={{ height: '4px', marginBottom: '16px' }} />
                            <div className="skeleton" style={{ height: '36px', borderRadius: '8px' }} />
                        </div>
                    ))}
                </div>
            ) : competitors.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔭</div>
                    <h3>No competitors yet</h3>
                    <p>Click "Add Competitor" to start tracking</p>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowModal(true)}>
                        ➕ Add Your First Competitor
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {competitors.map((comp) => (
                        <CompetitorCard
                            key={comp._id}
                            competitor={comp}
                            onDeleted={handleDeleted}
                            onChecked={handleChecked}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <AddCompetitorModal
                    onClose={() => setShowModal(false)}
                    onAdded={handleAdded}
                />
            )}
        </div>
    )
}
