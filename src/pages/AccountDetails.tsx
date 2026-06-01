import { useState } from 'react'
import { AccountShell } from '@/components/AccountShell'
import { api } from '@/lib/api'
import { getStoredUser, saveUser } from '@/lib/auth'

export function AccountDetails() {
  const user = getStoredUser()
  const [name, setName] = useState(user?.name || '')
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })

  async function updateProfile(event: React.FormEvent) {
    event.preventDefault()
    try {
      const nextUser = await api.account.updateProfile(name)
      saveUser(nextUser)
      setProfileMessage('Profile updated.')
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : 'Could not update profile.')
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault()
    try {
      await api.account.updatePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setPasswordMessage('Password updated.')
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : 'Could not update password.')
    }
  }

  return (
    <AccountShell title="Account Details" subtitle="Edit your profile and password" back>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <form onSubmit={updateProfile} className="space-y-4 rounded-2xl border border-ink-200 p-6">
          <h2 className="font-semibold text-ink-900">Profile</h2>
          <label className="block text-sm text-ink-700">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3" />
          </label>
          <label className="block text-sm text-ink-700">
            Email
            <input value={user?.email || ''} disabled className="mt-2 w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-ink-500" />
          </label>
          {profileMessage && <p className="text-sm text-ink-600">{profileMessage}</p>}
          <button type="submit" className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white">Save profile</button>
        </form>

        <form onSubmit={updatePassword} className="space-y-4 rounded-2xl border border-ink-200 p-6">
          <h2 className="font-semibold text-ink-900">Change password</h2>
          <input type="password" required placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full rounded-xl border border-ink-200 px-4 py-3" />
          <input type="password" required minLength={6} placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full rounded-xl border border-ink-200 px-4 py-3" />
          {passwordMessage && <p className="text-sm text-ink-600">{passwordMessage}</p>}
          <button type="submit" className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white">Update password</button>
        </form>
      </div>
    </AccountShell>
  )
}
