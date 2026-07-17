import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { productsAPI } from '../../api/products'
import { categoriesAPI } from '../../api/categories'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const BLANK = { title: '', description: '', category: '', price: '', discountPrice: '', brand: '', stock: '', featured: 'false', specifications: '' }

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [images, setImages] = useState([])
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const params = { page, limit: 15, ...(search && { search }) }
      const res = await productsAPI.getAll(params)
      return res.data.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesAPI.getAll()
      return res.data.data.categories
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const openAdd = () => { setForm(BLANK); setImages([]); setEditProduct(null); setShowModal(true) }
  const openEdit = (p) => {
    setForm({
      title: p.title, description: p.description, category: p.category?._id || p.category,
      price: p.price, discountPrice: p.discountPrice || '', brand: p.brand,
      stock: p.stock, featured: String(p.featured), specifications: JSON.stringify(p.specifications || []),
    })
    setImages([])
    setEditProduct(p)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      images.forEach((img) => fd.append('images', img))
      if (editProduct) {
        await productsAPI.update(editProduct._id, fd)
        toast.success('Product updated')
      } else {
        await productsAPI.create(fd)
        toast.success('Product created')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Products</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input className="form-input" placeholder="Search products..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 220 }} />
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {isLoading ? <Spinner center /> : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
                    {['Product', 'Brand', 'Category', 'Price', 'Stock', 'Featured', ''].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.products?.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--gray-100)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <img src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=?'} alt=""
                            style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ maxWidth: 200 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>{p.brand}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>{p.category?.name || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        ₹{(p.discountPrice || p.price).toLocaleString()}
                        {p.discountPrice && <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', marginLeft: '0.375rem', fontWeight: 400 }}>₹{p.price.toLocaleString()}</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{p.stock}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {p.featured ? <span className="badge badge-warning">Yes</span> : <span className="badge badge-gray">No</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openEdit(p)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                            onClick={() => { if (confirm('Delete product?')) deleteMutation.mutate(p._id) }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700 }}>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="grid grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Brand *</label>
                  <input className="form-input" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category *</label>
                  <select className="form-select" style={{ width: '100%' }} required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Featured</label>
                  <select className="form-select" style={{ width: '100%' }} value={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.value })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Price (₹)</label>
                  <input className="form-input" type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={3} required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Specifications (JSON array)</label>
                <textarea className="form-input" rows={2} placeholder='[{"key":"RAM","value":"8GB"}]'
                  value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.78rem' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Images {!editProduct && '*'}</label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem',
                  border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--gray-500)',
                }}>
                  <Upload size={16} />
                  {images.length > 0 ? `${images.length} file(s) selected` : 'Click to upload images (max 10)'}
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => setImages([...e.target.files].slice(0, 10))} />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner spinner-sm" /> : null}
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
