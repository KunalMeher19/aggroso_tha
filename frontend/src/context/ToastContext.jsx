import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be inside ToastProvider')
    return ctx
}

let idCounter = 0

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const show = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++idCounter
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }, [])

    const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

    const icons = { success: '✅', error: '❌', info: 'ℹ️' }

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        <span>{icons[t.type]}</span>
                        <span className="toast-msg">{t.message}</span>
                        <button
                            onClick={() => remove(t.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
