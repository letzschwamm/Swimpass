import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toastMsg, toastType, toastVisible } = useApp()
  return (
    <div className={`toast${toastType === 'error' ? ' error' : ''}${toastVisible ? ' show' : ''}`}>
      {toastMsg}
    </div>
  )
}
