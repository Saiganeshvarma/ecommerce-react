import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { categoriesAPI } from '../../api/categories'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesAPI.getAll()
      return res.data.data.categories
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const openAdd = () => { setName(''); setImageFile(null); setEditCat(null); setShowModal(true) }
  const openEdit = (c) => { setName(c.name); setImageFile(null); setEditCat(c); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      if (imageFile) fd.append('image', imageFile)
      if (editCat) {
        await categoriesAPI.update(editCat._id, fd)
        toast.success('Category updated')
      } else {
        await categoriesAPI.create(fd)
        toast.success('Category created')
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Categories</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      {isLoading ? <Spinner center /> : (
        <div className="grid grid-4">
          {categories?.map((cat) => (
            <div key={cat._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/9', background: 'var(--gray-100)' }}>
                <img
                  src={cat.image?.url || `https://placehold.co/320x180?text=${cat.name}`}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '0.875rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '0.75rem' }}>/{cat.slug}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(cat)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                    onClick={() => { if (confirm('Delete category?')) deleteMutation.mutate(cat._id) }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 420 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700 }}>{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Name *</label>
                <input className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electronics" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Image</label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem',
                  border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--gray-500)',
                }}>
                  <Upload size={16} />
                  {imageFile ? imageFile.name : 'Click to upload image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files[0])} />
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner spinner-sm" /> : null}
                  {saving ? 'Saving...' : editCat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
