'use client'

import { useState, useEffect } from 'react'

interface Note {
  id: number
  title: string
  content: string
  tags: string
  color: string
  isPinned: boolean
  createdAt: string
}

const colorClasses = {
  yellow: 'bg-yellow-100 border-yellow-200',
  pink: 'bg-pink-100 border-pink-200',
  blue: 'bg-blue-100 border-blue-200',
  green: 'bg-green-100 border-green-200'
}

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

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      fetchNotes()
      setIsModalOpen(false)
      setEditingNote(null)
      setFormData({ title: '', content: '', tags: '', color: 'yellow' })
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">QuickNotes</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Filter by tags (comma-separated)..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Note
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-2 ${colorClasses[note.color as keyof typeof colorClasses]} relative`}
            >
              {note.isPinned && (
                <div className="absolute top-2 right-2 text-yellow-500">📌</div>
              )}
              <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
              <p className="text-gray-700 mb-2 line-clamp-3">{note.content}</p>
              {note.tags && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => togglePin(note)}
                  className="text-sm text-gray-500 hover:text-yellow-500"
                >
                  {note.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-2 border rounded h-32"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="yellow">Yellow</option>
                    <option value="pink">Pink</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingNote(null)
                      setFormData({ title: '', content: '', tags: '', color: 'yellow' })
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingNote ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
