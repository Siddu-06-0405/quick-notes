'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface Note {
  id: number
  title: string
  content: string
  tags: string
  color: string
  isPinned: boolean
  createdAt: string
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const PinIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76v-5a3 3 0 0 0-6 0v5z"></path>
  </svg>
)

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const TitleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"></polyline>
    <line x1="9" y1="20" x2="15" y2="20"></line>
    <line x1="12" y1="4" x2="12" y2="20"></line>
  </svg>
)

const ContentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="14" y1="18" x2="3" y2="18"></line>
  </svg>
)

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: 'yellow'
  })

  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const fetchNotes = async () => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (tagFilter) params.append('tags', tagFilter)

    const response = await fetch(`/api/notes?${params}`)
    const data = await response.json()
    setNotes(data)
  }

  useEffect(() => {
    fetchNotes()
  }, [search, tagFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingNote ? 'PUT' : 'POST'
    const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes'

    const bodyData = editingNote ? { ...formData, isPinned: editingNote.isPinned } : formData

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })

    if (response.ok) {
      fetchNotes()
      closeModal()
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
      color: note.color
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      fetchNotes()
    }
  }

  const togglePin = async (note: Note) => {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...note, isPinned: !note.isPinned })
    })
    fetchNotes()
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
    setFormData({ title: '', content: '', tags: '', color: 'yellow' })
  }

  const getCardColorClass = (color: string) => {
    switch (color) {
      case 'pink': return styles.cardPink
      case 'blue': return styles.cardBlue
      case 'green': return styles.cardGreen
      case 'yellow':
      default: return styles.cardYellow
    }
  }

  // Sorting: Pinned notes first, then by date descending
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return a.isPinned ? -1 : 1
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>QuickNotes</h1>
        <p className={styles.subtitle}>Capture your ideas, organized and beautifully.</p>
      </header>

      {/* Search and Filters */}
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <div className={styles.iconPrefix}><SearchIcon /></div>
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
           <div className={styles.iconPrefix}><TagIcon /></div>
          <input
            type="text"
            placeholder="Filter by tags (comma-separated)..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className={styles.input}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <PlusIcon /> New Note
        </button>
      </div>

      {/* Notes Grid */}
      <div className={styles.grid}>
        {sortedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No notes found. Create your first note!</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`${styles.card} ${getCardColorClass(note.color)} ${note.isPinned ? styles.cardPinned : ''}`}
            >
              <button 
                onClick={() => togglePin(note)}
                className={`${styles.pinBtn} ${note.isPinned ? styles.isPinned : ''}`}
                title={note.isPinned ? "Unpin note" : "Pin note"}
              >
                <PinIcon filled={note.isPinned} />
              </button>
              
              <h3 className={styles.cardTitle}>{note.title}</h3>
              <p className={`${styles.cardContent} custom-scrollbar`}>{note.content}</p>
              
              {note.tags && (
                <div className={styles.tags}>
                  {note.tags.split(',').filter(t => t.trim()).map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              <div className={styles.cardActions}>
                 <span className={styles.date}>{formatDate(note.createdAt)}</span>
                <div className={styles.actionGroup}>
                  <button
                    onClick={() => handleEdit(note)}
                    className={`${styles.actionBtn} ${styles.primary}`}
                    title="Edit Note"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className={`${styles.actionBtn} ${styles.danger}`}
                    title="Delete Note"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
               <h2 className={styles.modalTitle}>
                 {editingNote ? 'Edit Note' : 'Create New Note'}
               </h2>
               <button onClick={closeModal} className={styles.closeBtn}>
                 <div style={{ transform: 'rotate(45deg)', display: 'flex' }}>
                   <PlusIcon />
                 </div>
                 <span style={{ display: 'none' }}>Close</span>
               </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <TitleIcon /> Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.formInput}
                  placeholder="What's this about?"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <ContentIcon /> Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`${styles.formInput} ${styles.textarea} custom-scrollbar`}
                  placeholder="Write your thoughts here..."
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <TagIcon /> Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={styles.formInput}
                  placeholder="e.g. work, personal, ideas"
                />
              </div>
              
              <div className={`${styles.formGroup} ${styles.colorSection}`}>
                <label className={styles.label}>Note Color</label>
                <div className={styles.colorPicker}>
                  {['yellow', 'pink', 'blue', 'green'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`${styles.colorOption} ${styles[`bg${color.charAt(0).toUpperCase() + color.slice(1)}` as keyof typeof styles]} ${formData.color === color ? styles.active : ''}`}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`${styles.btn} ${styles.btnGhost}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
