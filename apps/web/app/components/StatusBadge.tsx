'use client'

interface StatusBadgeProps {
    status: string
    icon?: string
    size?: 'small' | 'medium' | 'large'
}

const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
    draft: { color: '#f59e0b', icon: '📝', label: 'Draft' },
    ready_for_review: { color: '#3b82f6', icon: '👀', label: 'Ready for Review' },
    published: { color: '#10b981', icon: '✅', label: 'Published' },
    selected: { color: '#28a745', icon: '⭐', label: 'Selected' },
    pending: { color: '#ffc107', icon: '⏳', label: 'Pending' },
    failed: { color: '#ef4444', icon: '❌', label: 'Failed' },
    in_progress: { color: '#6366f1', icon: '🔄', label: 'In Progress' }
}

export default function StatusBadge({ status, icon, size = 'medium' }: StatusBadgeProps) {
    const config = statusConfig[status] || { 
        color: '#6b7280', 
        icon: icon || '❓', 
        label: status.replace(/_/g, ' ') 
    }

    const sizes = {
        small: { padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '10px' },
        medium: { padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '12px' },
        large: { padding: '0.35rem 1rem', fontSize: '0.9rem', borderRadius: '14px' }
    }

    return (
        <span style={{
            background: config.color,
            color: 'white',
            ...sizes[size],
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
        }}>
            {(icon || config.icon)} {config.label}
        </span>
    )
}