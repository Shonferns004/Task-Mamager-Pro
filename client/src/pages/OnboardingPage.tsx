import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react'

export function OnboardingPage() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const defaultName = profile?.email ? profile.email.split('@')[0] : ''
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState(defaultName)
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (password !== confirmPw) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setSaving(true)
    try {
      if (displayName.trim()) await api.updateUser({ name: displayName.trim(), onboarded: true })
      if (password) {
        try { await api.setPassword(password) } catch (e: any) {
          console.error('Password update failed:', e)
        }
      }
      await refreshProfile()
      navigate('/tasks')
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Something went wrong')
      setSaving(false)
    }
  }

  const nextStep = () => {
    if (!displayName.trim()) { setError('Please enter your name'); return }
    setError('')
    setStep(2)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <div className="w-full max-w-md space-y-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              step >= 1 ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            }`}>1</div>
            <div className={`h-0.5 w-12 rounded transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              step >= 2 ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            }`}>2</div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? 'Welcome to UCS' : 'Set a Password'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {step === 1 ? "Let's get to know you" : 'Secure your account'}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">What should we call you?</label>
                <div>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name" autoFocus
                    className="w-full rounded-xl border border-gray-300 bg-white/80 py-3 pl-3 pr-3 text-sm backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-100" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={nextStep} className="w-full">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Create a password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters" autoFocus
                    className="w-full rounded-xl border border-gray-300 bg-white/80 py-3 pl-3 pr-10 text-sm backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-100" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
                <div>
                  <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-gray-300 bg-white/80 py-3 pl-3 pr-3 text-sm backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-100" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button onClick={handleSubmit} loading={saving} className="flex-1">
                  Finish <Check className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">Step {step} of 2</p>
        </div>
    </div>
  )
}
