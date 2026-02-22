import { useState } from 'react'
import { createCompetitor } from '../api'
import { useToast } from '../context/ToastContext'

const COMMON_TAGS = ['SaaS', 'Startup', 'Enterprise', 'Pricing', 'Docs', 'Tool', 'Competitor']

const initialForm = {
    name: '',
    urls: { pricing: '', docs: '', changelog: '' },
    tags: [],
    alertEmail: '',
    alertOnChangeScore: 0,
}

export default function AddCompetitorModal({ onClose, onAdded }) {
    const { show } = useToast()
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [tagInput, setTagInput] = useState('')

    const setUrl = (type, val) =>
        setForm((f) => ({ ...f, urls: { ...f.urls, [type]: val } }))

    const toggleTag = (tag) =>
        setForm((f) => ({
            ...f,
            tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
        }))

    const addCustomTag = () => {
        const t = tagInput.trim()
        if (t && !form.tags.includes(t)) {
            setForm((f) => ({ ...f, tags: [...f.tags, t] }))
        }
        setTagInput('')
    }

    const validate = () => {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Name is required'
        if (!form.urls.pricing && !form.urls.docs && !form.urls.changelog) {
            errs.urls = 'At least one URL is required'
        }
        const urlCheck = (url, field) => {
            if (!url) return
            try { new URL(url) } catch { errs[field] = 'Must be a valid URL (include https://)' }
        }
        urlCheck(form.urls.pricing, 'pricing')
        urlCheck(form.urls.docs, 'docs')
        urlCheck(form.urls.changelog, 'changelog')
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            const created = await createCompetitor(form)
            show(`${form.name} added!`, 'success')
            onAdded(created.data)
            onClose()
        } catch (err) {
            show(err.message, 'error')
            setErrors({ submit: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.1rem' }}>➕ Add Competitor</h2>
                    <button className="btn btn-icon" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Competitor Name *</label>
                            <input
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="e.g. Stripe, Notion, Vercel"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>

                        {errors.urls && (
                            <div style={{ padding: '10px 14px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                ⚠️ {errors.urls}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">💰 Pricing Page URL</label>
                            <input
                                className={`form-input ${errors.pricing ? 'error' : ''}`}
                                placeholder="https://example.com/pricing"
                                value={form.urls.pricing}
                                onChange={(e) => setUrl('pricing', e.target.value)}
                            />
                            {errors.pricing && <span className="form-error">{errors.pricing}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">📖 Docs Page URL</label>
                            <input
                                className={`form-input ${errors.docs ? 'error' : ''}`}
                                placeholder="https://docs.example.com"
                                value={form.urls.docs}
                                onChange={(e) => setUrl('docs', e.target.value)}
                            />
                            {errors.docs && <span className="form-error">{errors.docs}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">📋 Changelog URL</label>
                            <input
                                className={`form-input ${errors.changelog ? 'error' : ''}`}
                                placeholder="https://example.com/changelog"
                                value={form.urls.changelog}
                                onChange={(e) => setUrl('changelog', e.target.value)}
                            />
                            {errors.changelog && <span className="form-error">{errors.changelog}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">🏷️ Tags</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                {COMMON_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`badge ${form.tags.includes(tag) ? 'badge-cyan' : 'badge-gray'}`}
                                        style={{ cursor: 'pointer', border: form.tags.includes(tag) ? undefined : '1px solid var(--border)' }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="form-input"
                                    placeholder="Custom tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                                    style={{ flex: 1 }}
                                />
                                <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomTag}>Add</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">🔔 Alert Email (optional)</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="you@email.com"
                                value={form.alertEmail}
                                onChange={(e) => setForm((f) => ({ ...f, alertEmail: e.target.value }))}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Alert when change score exceeds:&nbsp;
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.alertOnChangeScore}
                                    onChange={(e) => setForm((f) => ({ ...f, alertOnChangeScore: Number(e.target.value) }))}
                                    style={{ width: '50px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', padding: '2px 6px', fontSize: '0.75rem' }}
                                />
                                %
                            </p>
                        </div>

                        {errors.submit && (
                            <div style={{ padding: '10px 14px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--accent-red)' }}>
                                {errors.submit}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Adding...</> : '➕ Add Competitor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
