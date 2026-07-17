import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, ShieldCheck, User } from 'lucide-react'
import { adminAPI } from '../../api/admin'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const res = await adminAPI.getUsers(search || undefined)
      return res.data.data.users
    },
    staleTime: 30000,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminAPI.updateUserRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated') },
    onError: () => toast.error('Failed to update role'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted') },
    onError: () => toast.error('Failed to delete user'),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Users</h1>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem', width: 240 }} />
        </div>
      </div>

      {isLoading ? <Spinner center /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
                  {['User', 'Email', 'Phone', 'Role', 'Verified', 'Joined', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-100)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                          background: 'var(--primary)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.875rem',
                        }}>
                          {u.profileImage?.url
                            ? <img src={u.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : u.name?.[0]?.toUpperCase()
                          }
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
                        {u.role === 'admin' ? <ShieldCheck size={11} style={{ display: 'inline', marginRight: 2 }} /> : <User size={11} style={{ display: 'inline', marginRight: 2 }} />}
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>{u.isVerified ? 'Yes' : 'No'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: u.role === 'admin' ? 'var(--warning)' : 'var(--primary)' }}
                          onClick={() => roleMutation.mutate({ id: u._id, role: u.role === 'admin' ? 'user' : 'admin' })}
                          disabled={roleMutation.isPending}
                          title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.3rem', color: 'var(--danger)' }}
                          onClick={() => { if (confirm(`Delete user ${u.name}?`)) deleteMutation.mutate(u._id) }}
                        >
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
      )}
    </div>
  )
}
