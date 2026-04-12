import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

export default function Step2Code({ data, update, next, back }) {
  const { t } = useApp()
  const ob = t.onboarding.code
  const [code, setCode]       = useState(data.school?.code || '')
  const [found, setFound]     = useState(!!data.school)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Track in-flight requests to avoid race conditions
  const reqIdRef = useRef(0)

  async function checkCode(value) {
    const val = value.toUpperCase().trim()
    setCode(val)
    setErrorMsg('')
    setFound(false)

    if (val.length < 6) {
      update({ school: null, classInfo: null, isTest: false })
      return
    }

    const myReqId = ++reqIdRef.current
    setLoading(true)

    // ── Test code path ────────────────────────────────────────
    if (val.startsWith('TEST-') && val.length >= 9) {
      const { data: testCode } = await supabase
        .from('test_codes').select('*').eq('code', val).eq('active', true).maybeSingle()

      if (myReqId !== reqIdRef.current) return
      setLoading(false)

      if (testCode) {
        update({
          school: { id: testCode.school_id, name: testCode.school_name || 'Schwimmschule', code: val },
          classInfo: null,
          isTest: true,
        })
        setFound(true)
      } else {
        update({ school: null, classInfo: null, isTest: false })
      }
      return
    }

    // ── Normal school code path ───────────────────────────────
    const { data: school, error } = await supabase.rpc('lookup_school_by_code', { school_code: val })

    if (myReqId !== reqIdRef.current) return
    setLoading(false)

    if (error) {
      setErrorMsg('Verbindungsfehler. Bitte versuche es erneut.')
      update({ school: null, classInfo: null, isTest: false })
      return
    }

    if (school?.id) {
      const cls = school.classes?.[0] ?? null
      update({ school, classInfo: cls, isTest: false })
      setFound(true)
    } else {
      update({ school: null, classInfo: null, isTest: false })
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
        <div className="code-input-wrap">
          <input
            className="code-input"
            placeholder="z.B. LETZSCHWAMM000001"
            value={code}
            onChange={e => checkCode(e.target.value)}
            maxLength={30}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <div className="code-check">
            {loading ? '⏳' : found ? '✅' : code.length >= 6 ? '❌' : ''}
          </div>
        </div>

        {errorMsg && (
          <div className="error-msg" style={{ marginTop: 8 }}>{errorMsg}</div>
        )}

        <div className="code-hint">
          <strong>{ob.hintTitle}</strong><br />
          {ob.hintText}
        </div>

        {found && data.school && (
          <div className="code-found">
            <div className="cf-title">
              {data.isTest ? '🧪 Test-Modus aktiv' : ob.found}
            </div>
            <div className="cf-detail">
              {data.isTest
                ? <><span style={{ color: 'var(--gold)', fontWeight: 600 }}>TEST</span> · {data.school.name} · Zahlung wird übersprungen</>
                : data.classInfo
                  ? <>
                      <span>{data.classInfo.name}</span> · <span>{data.classInfo.day} {data.classInfo.time}</span><br />
                      {ob.teacherLabel} <span>{data.classInfo.profiles?.name || '—'}</span>
                    </>
                  : <span>{data.school.name}</span>
              }
            </div>
          </div>
        )}
      </div>

      <div className="ob-bottom">
        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={() => {
            console.log('[Step2] Next clicked — data.school:', data.school)
            next()
          }}
          disabled={!found || !data.school?.id}
        >
          {ob.next}
        </button>
      </div>
    </div>
  )
}
