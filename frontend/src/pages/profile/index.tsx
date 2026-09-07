import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile, useChangePassword } from '@/hooks/useAuth'
import { extractErrors } from '@/lib/utils'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  const [name, setName] = useState(user?.name ?? '')
  const [businessName, setBusinessName] = useState(user?.businessName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const { mutate: updateProfile, isPending: isProfilePending, error: profileError } = useUpdateProfile()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const { mutate: changePassword, isPending: isPasswordPending, error: passwordError } = useChangePassword()

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    updateProfile(
      { name, businessName, phone },
      {
        onSuccess: () => toast.success('Profile updated successfully'),
        onError: (err) => {
          const { generalMessage } = extractErrors(err, 'Could not update profile. Please try again.')
          toast.error(generalMessage)
        },
      },
    )
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password changed successfully')
          setCurrentPassword('')
          setNewPassword('')
        },
        onError: (err) => {
          const { generalMessage } = extractErrors(err, 'Could not change password. Please try again.')
          toast.error(generalMessage)
        },
      },
    )
  }

  const { fieldErrors: profileFieldErrors } = extractErrors(profileError, 'Could not update profile.')
  const { fieldErrors: passwordFieldErrors } = extractErrors(passwordError, 'Could not change password.')

  return (
    <PageWrapper>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
        Account
      </p>
      <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight">Profile</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-lg font-normal tracking-tight">Profile details</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-black/55">
            Update your name, business, and contact details.
          </p>

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4 border-t border-black pt-5">
            <div>
              <label htmlFor="email" className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Email
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={user?.email ?? ''}
                className="mt-2 w-full cursor-not-allowed border border-black/10 bg-black/[0.03] px-3.5 py-2.5 text-sm text-black/50"
              />
            </div>

            <div>
              <label htmlFor="name" className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Full name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
              {profileFieldErrors.name && (
                <p className="mt-1 text-[11px] text-red-600">{profileFieldErrors.name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessName" className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Business name
              </label>
              <input
                id="businessName"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
              {profileFieldErrors.businessName && (
                <p className="mt-1 text-[11px] text-red-600">{profileFieldErrors.businessName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Phone
              </label>
              <input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
              {profileFieldErrors.phone && (
                <p className="mt-1 text-[11px] text-red-600">{profileFieldErrors.phone[0]}</p>
              )}
            </div>

            <Button type="submit" disabled={isProfilePending}>
              {isProfilePending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="font-serif text-lg font-normal tracking-tight">Change password</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-black/55">
            Enter your current password to set a new one.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4 border-t border-black pt-5">
            <div>
              <label htmlFor="currentPassword" className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Current password
              </label>
              <div className="relative mt-2">
                <input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-black/20 bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((s) => !s)}
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-black/35 transition-colors hover:text-black"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                </button>
              </div>
              {passwordFieldErrors.currentPassword && (
                <p className="mt-1 text-[11px] text-red-600">{passwordFieldErrors.currentPassword[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                New password
              </label>
              <input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
              {passwordFieldErrors.newPassword && (
                <ul className="mt-1 space-y-0.5">
                  {passwordFieldErrors.newPassword.map((msg, i) => (
                    <li key={i} className="text-[11px] text-red-600">
                      • {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button type="submit" disabled={isPasswordPending}>
              {isPasswordPending ? 'Changing…' : 'Change password'}
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
