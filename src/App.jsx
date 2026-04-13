import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'

import Login from './pages/Login'
import OnboardingFlow from './pages/onboarding/OnboardingFlow'
import Datenschutz from './pages/Datenschutz'
import Layout from './components/Layout'
import CookieBanner from './components/CookieBanner'
import Dashboard from './pages/admin/Dashboard'
import Children from './pages/admin/Children'
import ChildDetail from './pages/admin/ChildDetail'
import Classes from './pages/admin/Classes'
import ChildPass from './pages/admin/ChildPass'
import Sauvetage from './pages/admin/Sauvetage'
import SauvetageDetail from './pages/admin/SauvetageDetail'
import Instructors from './pages/admin/Instructors'
import InstructorOnboarding from './pages/onboarding/InstructorOnboarding'
import InstructorPaymentWall from './pages/onboarding/InstructorPaymentWall'
import ParticipantOnboarding from './pages/onboarding/ParticipantOnboarding'
import ParticipantStatus from './pages/ParticipantStatus'
import MyStatus from './pages/participant/MyStatus'
import MyClasses from './pages/teacher/MyClasses'
import AllChildren from './pages/teacher/AllChildren'
import MyChild from './pages/parent/MyChild'
import InstructorLevels from './pages/instructor/InstructorLevels'
import InstructorSwimCourses from './pages/instructor/InstructorSwimCourses'
import InstructorSettings from './pages/instructor/InstructorSettings'
import InstructorChat from './pages/instructor/InstructorChat'
import ParentChat from './pages/parent/ParentChat'
import ParticipantChat from './pages/participant/ParticipantChat'
import RainEffect from './components/RainEffect'
import WelcomeBack from './components/WelcomeBack'

function ProtectedRoute({ children, roles }) {
  const { session, profile, loading } = useAuth()

  if (loading) return (
    <div className="loading-overlay">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <img src="/swimpass_icon_final.png" alt="" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 16, background: 'transparent' }} />
        </div>
        <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32, borderWidth: 3 }} />
      </div>
    </div>
  )

  if (!session) return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />
  // Instructors without an active subscription hit the payment wall
  if (profile?.role === 'instructor' && profile?.subscription_status !== 'active') {
    return <Navigate to="/instructor/payment" replace />
  }
  return children
}

function RootRedirect() {
  const { session, profile, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return null  // session exists, profile still loading — wait
  switch (profile.role) {
    case 'admin':      return <Navigate to="/admin" replace />
    case 'teacher':    return <Navigate to="/teacher" replace />
    case 'parent':     return <Navigate to="/parent" replace />
    case 'instructor':  return <Navigate to="/instructor" replace />
    case 'participant': return <Navigate to="/participant" replace />
    default:            return <Navigate to="/login" replace />
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/onboarding/instructor" element={<InstructorOnboarding />} />
      <Route path="/onboarding/participant" element={<ParticipantOnboarding />} />
      <Route path="/instructor/payment" element={<InstructorPaymentWall />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/p/:token" element={<ParticipantStatus />} />

      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <Layout role="admin" />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="children" element={<Children />} />
        <Route path="children/:id" element={<ChildDetail />} />
        <Route path="children/:id/pass" element={<ChildPass />} />
        <Route path="classes" element={<Classes />} />
        <Route path="sauvetage" element={<Sauvetage />} />
        <Route path="sauvetage/:id" element={<SauvetageDetail />} />
        <Route path="instructors" element={<Instructors />} />
      </Route>

      <Route path="/teacher" element={
        <ProtectedRoute roles={['teacher', 'admin']}>
          <Layout role="teacher" />
        </ProtectedRoute>
      }>
        <Route index element={<MyClasses />} />
        <Route path="children" element={<AllChildren />} />
        <Route path="children/:id" element={<ChildDetail />} />
        <Route path="children/:id/pass" element={<ChildPass />} />
        <Route path="chat" element={<InstructorChat />} />
      </Route>

      <Route path="/instructor" element={
        <ProtectedRoute roles={['instructor', 'admin']}>
          <Layout role="instructor" />
        </ProtectedRoute>
      }>
        <Route index element={<Sauvetage />} />
        <Route path="sauvetage" element={<Sauvetage />} />
        <Route path="sauvetage/:id" element={<SauvetageDetail />} />
        <Route path="swim" element={<InstructorSwimCourses />} />
        <Route path="levels" element={<InstructorLevels />} />
        <Route path="settings" element={<InstructorSettings />} />
        <Route path="chat" element={<InstructorChat />} />
      </Route>

      <Route path="/parent" element={
        <ProtectedRoute roles={['parent']}>
          <Layout role="parent" />
        </ProtectedRoute>
      }>
        <Route index element={<MyChild />} />
        <Route path="chat" element={<ParentChat />} />
      </Route>

      <Route path="/participant" element={
        <ProtectedRoute roles={['participant']}>
          <Layout role="participant" />
        </ProtectedRoute>
      }>
        <Route index element={<MyStatus />} />
        <Route path="chat" element={<ParticipantChat />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <RainEffect />
          <WelcomeBack />
          <AppRoutes />
          <CookieBanner />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
