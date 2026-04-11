import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Step1Welcome from './Step1Welcome'
import Step2Code from './Step2Code'
import Step3Register from './Step3Register'
import Step4Payment from './Step4Payment'
import Step5Success from './Step5Success'

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [step, setStep] = useState(1)
  const [stripeCanceled, setStripeCanceled] = useState(false)
  const [data, setData] = useState({
    school: null,
    classInfo: null,
    avatar: '👦',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    childId: null,
  })

  // Handle Stripe redirect back (success or cancel)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const targetStep = params.get('step')
    if (!targetStep) return

    const saved = sessionStorage.getItem('swimpass_onboarding')
    if (saved) {
      try { setData(JSON.parse(saved)) } catch (_) {}
      sessionStorage.removeItem('swimpass_onboarding')
    }

    if (targetStep === '5') {
      setStep(5)
    } else if (targetStep === '4') {
      setStep(4)
      setStripeCanceled(true)
    }
    window.history.replaceState({}, '', '/onboarding')
  }, [])

  function update(patch) {
    console.log('[OnboardingFlow] update called with:', patch)
    setData(prev => {
      const next = { ...prev, ...patch }
      console.log('[OnboardingFlow] new data:', { school: next.school?.id, classInfo: next.classInfo?.id, email: next.email, step })
      return next
    })
  }

  function next() {
    console.log('[OnboardingFlow] → next from step', step, '| current data.school:', data.school?.id)
    setStep(s => s + 1)
  }
  function back() { setStep(s => s - 1) }

  const steps = [Step1Welcome, Step2Code, Step3Register, Step4Payment, Step5Success]
  const StepComponent = steps[step - 1]

  return (
    <div className="ob-bg">
      <div className="ob-wave" />
      <div className="ob-container">
        {step > 1 && step < 5 && (
          <div className="ob-dots">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`ob-dot${step === i + 1 ? ' active' : i + 1 < step ? ' done' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="ob-screen">
          <StepComponent
            data={data}
            update={update}
            next={next}
            back={back}
            onDone={() => navigate('/login')}
            stripeCanceled={stripeCanceled}
            onStripeRetry={() => setStripeCanceled(false)}
          />
        </div>
      </div>
    </div>
  )
}
