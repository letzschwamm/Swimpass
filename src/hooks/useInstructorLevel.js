import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export const INSTRUCTOR_LEVELS = [
  { level: 1, emoji: '🐟', name: 'Goldfisch', min: 0,  max: 2,  color: '#48CAE4', bg: 'rgba(72,202,228,.12)'  },
  { level: 2, emoji: '🐬', name: 'Delfin',    min: 3,  max: 7,  color: '#0096C7', bg: 'rgba(0,150,199,.14)'  },
  { level: 3, emoji: '🦈', name: 'Hai',       min: 8,  max: 15, color: '#3A86FF', bg: 'rgba(58,134,255,.14)' },
  { level: 4, emoji: '🐋', name: 'Wal',       min: 16, max: Infinity, color: '#F4A51A', bg: 'rgba(244,165,26,.14)' },
]

export function getCurrentLevel(count) {
  for (let i = INSTRUCTOR_LEVELS.length - 1; i >= 0; i--) {
    if (count >= INSTRUCTOR_LEVELS[i].min) return INSTRUCTOR_LEVELS[i]
  }
  return INSTRUCTOR_LEVELS[0]
}

export function useInstructorLevel() {
  const { profile } = useAuth()
  const [count, setCount]           = useState(0)
  const [totalCourses, setTotal]    = useState(0)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!profile) return
    if (profile.role !== 'instructor') { setLoading(false); return }

    async function load() {
      const { data: courses } = await supabase
        .from('sauvetage_courses')
        .select('id, status')
        .eq('instructor_id', profile.id)

      if (!courses?.length) { setCount(0); setTotal(0); setLoading(false); return }

      setTotal(courses.length)

      // Count courses that are completed OR have at least one passed participant
      const { data: passed } = await supabase
        .from('sauvetage_participants')
        .select('course_id')
        .in('status', ['passed_junior', 'passed_lifesaver'])
        .in('course_id', courses.map(c => c.id))

      const passedIds = new Set(passed?.map(p => p.course_id) || [])
      const done = courses.filter(c => c.status === 'completed' || passedIds.has(c.id)).length
      setCount(done)
      setLoading(false)
    }
    load()
  }, [profile])

  const current   = getCurrentLevel(count)
  const nextLevel = INSTRUCTOR_LEVELS.find(l => l.level === current.level + 1) || null
  const progressToNext = nextLevel
    ? Math.round(((count - current.min) / (nextLevel.min - current.min)) * 100)
    : 100

  return { count, totalCourses, loading, current, nextLevel, progressToNext, levels: INSTRUCTOR_LEVELS }
}
