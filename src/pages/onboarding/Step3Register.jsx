import { useApp } from '../../context/AppContext'

export default function Step3Register({ data, update, next, back }) {
  const { t } = useApp()
  const ob = t.onboarding.register

  const allFilled = data.firstName && data.lastName && data.birthDate && data.email && data.password?.length >= 8

  return (
    <div className="ob-step" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="step-header">
        <button className="step-back" onClick={back}>← {t.ui.back.replace('← ', '')}</button>
        <div className="step-num">{ob.stepNum}</div>
        <div className="step-title">{ob.title}</div>
        <div className="step-sub">{ob.sub}</div>
      </div>

      <div className="ob-body">
        <div className="form-row">
          <div className="form-group">
            <label>{ob.firstName}</label>
            <input type="text" value={data.firstName} onChange={e => update({ firstName: e.target.value })} placeholder="Emma" autoComplete="given-name" />
          </div>
          <div className="form-group">
            <label>{ob.lastName}</label>
            <input type="text" value={data.lastName} onChange={e => update({ lastName: e.target.value })} placeholder="Müller" autoComplete="family-name" />
          </div>
        </div>

        <div className="form-group">
          <label>{ob.birthDate}</label>
          <input type="date" value={data.birthDate} onChange={e => update({ birthDate: e.target.value })} />
        </div>

        <div className="form-group">
          <label>{ob.email}</label>
          <input type="email" value={data.email} onChange={e => update({ email: e.target.value })} placeholder="eltern@email.com" autoComplete="email" />
        </div>

        <div className="form-group">
          <label>{ob.password}</label>
          <input type="password" value={data.password} onChange={e => update({ password: e.target.value })} placeholder="Min. 8 Zeichen" autoComplete="new-password" />
        </div>
      </div>

      <div className="ob-bottom">
        <button className="btn btn-primary btn-full btn-lg" onClick={next} disabled={!allFilled}>
          {ob.next}
        </button>
      </div>
    </div>
  )
}
