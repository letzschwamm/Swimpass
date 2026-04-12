import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Helper: extract real error message from a Supabase FunctionsHttpError
async function extractFnError(err) {
  if (!err) return null
  // Try to read the body from context (the raw Response object)
  try {
    if (err.context && typeof err.context.json === 'function') {
      const body = await err.context.clone().json()
      console.error('[FN Error body]', body)
      if (body?.error) return body.error
      if (body?.message) return body.message
    }
  } catch (e) {
    console.warn('[FN Error] body parse failed:', e)
  }
  // Try text fallback
  try {
    if (err.context && typeof err.context.text === 'function') {
      const text = await err.context.clone().text()
      console.error('[FN Error text]', text)
      if (text) return text
    }
  } catch (_) {}
  return err.message || 'Unbekannter Fehler'
}

export default function Step4Payment({ data, update, next, back, stripeCanceled, onStripeRetry }) {
  const { t } = useApp()
  const navigate = useNavigate()
  const ob = t.onboarding.payment
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState('')
  const [error, setError]     = useState('')

  // Auto-create account and skip Stripe immediately when in test mode
  useEffect(() => {
    if (data.isTest) {
      handlePay()
    }
  }, [])

  async function handlePay() {
    setLoading(true)
    setError('')

    const payload = {
      email:      data.email,
      password:   data.password,
      schoolId:   data.school?.id,
      classId:    data.classInfo?.id ?? null,
      firstName:  data.firstName,
      lastName:   data.lastName,
      birthDate:  data.birthDate || null,
      level:      data.isTest ? 'seepferdchen' : (data.classInfo?.level || 'junior'),
      avatar:     data.avatar || '👦',
    }

    // ── Validation ────────────────────────────────────────────────
    if (!payload.schoolId) {
      setError('Schulcode fehlt. Bitte gehe zurück und gib den Code erneut ein.')
      setLoading(false)
      return
    }
    if (!payload.email || !payload.password) {
      setError('E-Mail oder Passwort fehlt. Bitte gehe zurück zu Schritt 3.')
      setLoading(false)
      return
    }

    try {
      // ── Schritt 1: User + Profil + Kind via service_role Edge Function ──
      setStep('Konto wird erstellt…')
      const { data: regData, error: regError } = await supabase.functions.invoke('register-parent', {
        body: data.isTest ? { ...payload, isTest: true } : payload,
      })

      console.log('[Step4] register-parent response:', { regData, regError })

      if (regError) {
        const msg = await extractFnError(regError)
        throw new Error(msg)
      }
      if (regData?.error === 'EMAIL_EXISTS') {
        throw new Error('Diese E-Mail ist bereits registriert. Bitte gehen Sie zur Anmeldeseite und loggen Sie sich ein.')
      }
      if (regData?.error) throw new Error(regData.error)

      const { userId, childId } = regData
      console.log('[Step4] Got userId:', userId, 'childId:', childId)
      update({ childId })

      // ── Schritt 2: Einloggen damit Session gesetzt ist ──────────────────
      setStep('Anmeldung wird verifiziert…')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email:    data.email,
        password: data.password,
      })
      if (signInError) throw signInError

      // ── Test-Modus: Stripe überspringen → RootRedirect leitet weiter ─────
      if (data.isTest) {
        navigate('/')
        return
      }

      // ── Schritt 3: Stripe Checkout Session erstellen ────────────────────
      setStep('Weiterleitung zu Stripe…')
      const checkoutPayload = {
        childId,
        parentId:   userId,
        schoolId:   data.school?.id,
        successUrl: `${window.location.origin}/onboarding?step=5`,
        cancelUrl:  `${window.location.origin}/onboarding?step=4`,
      }
      console.log('[Step4] create-checkout payload:', checkoutPayload)

      const { data: checkoutData, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: checkoutPayload,
      })

      console.log('[Step4] create-checkout response:', { checkoutData, fnError })

      if (fnError) {
        const msg = await extractFnError(fnError)
        throw new Error(msg)
      }
      if (checkoutData?.error) throw new Error(checkoutData.error)

      // ── Schritt 4: Zu Stripe weiterleiten ──────────────────────────────
      // Save data so we can restore it after Stripe redirect
      sessionStorage.setItem('swimpass_onboarding', JSON.stringify({ ...data, childId }))

      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: checkoutData.sessionId,
      })
      if (stripeError) throw stripeError

    } catch (err) {
      console.error('[Step4] Caught error:', err)
      setError(err.message || t.toast.error)
      setLoading(false)
      setStep('')
    }
  }

  return (
    <div className="ob-step" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="step-header">
        <button className="step-back" onClick={back}>← {t.ui.back.replace('← ', '')}</button>
        <div className="step-num">{ob.stepNum}</div>
        <div className="step-title">{ob.title}</div>
        <div className="step-sub">{ob.sub}</div>
      </div>

      <div className="ob-body">
        <div className="plan-card">
          <div className="plan-name">{ob.planName}</div>
          <div className="plan-price">56,63 <span>€</span></div>
          <div className="plan-period">{ob.period}</div>

          {/* TVA Aufschlüsselung */}
          <div style={{ borderTop: '1px solid rgba(144,220,240,.2)', marginTop: 12, paddingTop: 10, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
              <span>Prix HT</span><span>48,40 €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
              <span>TVA (17%)</span><span>8,23 €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--aqua)' }}>
              <span>Total TTC</span><span>56,63 €</span>
            </div>
          </div>

          <div className="plan-features" style={{ marginTop: 10 }}>
            {ob.features.map((f, i) => (
              <div key={i} className="plan-feat">{f}</div>
            ))}
          </div>
        </div>

        <div className="stripe-badge">🔒 <span>{ob.secure}</span></div>

        <div style={{
          background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 12,
          fontSize: 13, color: 'var(--muted)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>💳</div>
          Sie werden sicher zu Stripe weitergeleitet.<br />
          Alle gängigen Karten & Apple/Google Pay werden akzeptiert.
        </div>

        {/* Stripe canceled notice */}
        {stripeCanceled && (
          <div style={{
            background: 'rgba(244,165,26,.12)', border: '1px solid rgba(244,165,26,.35)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 12, fontSize: 13,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--gold)', marginBottom: 4 }}>Zahlung abgebrochen</div>
            <div style={{ color: 'var(--muted)' }}>Ihr Konto wurde bereits erstellt. Sie können die Zahlung jetzt erneut starten.</div>
          </div>
        )}

        {/* Warning if schoolId missing */}
        {!data.school?.id && (
          <div className="error-msg">
            ⚠️ Kein Schulcode erkannt. Bitte gehe zurück zu Schritt 2 und gib den Code erneut ein.
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
          {ob.terms}
        </div>
      </div>

      <div className="ob-bottom">
        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handlePay}
          disabled={loading || !data.school?.id}
        >
          {loading
            ? <><span className="spinner" /><span style={{ marginLeft: 8 }}>{step}</span></>
            : ob.pay}
        </button>
      </div>
    </div>
  )
}
