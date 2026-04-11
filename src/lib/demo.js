// Demo data — used when logged in with a demo account (no Supabase needed)

// Runtime store for persons added during the demo session
const _extra = []
export function addDemoChild(child) { _extra.push(child) }
export function addDemoPerson(person) { _extra.push(person) }
export function getAllDemoChildren() { return [...DEMO_CHILDREN_BASE, ...DEMO_ADULTS, ..._extra] }

export const DEMO_SCHOOL_ID = '00000000-0000-0000-0000-000000000001'

export const DEMO_CLASSES = [
  { id: 'cls-1', school_id: DEMO_SCHOOL_ID, name: 'Junior Lifesaver A', day: 'Wednesday', time: '17:00', level: 'junior',    teacher_id: 'demo-teacher', profiles: { name: 'Ana' } },
  { id: 'cls-2', school_id: DEMO_SCHOOL_ID, name: 'Lifesaver Pro',       day: 'Friday',    time: '16:00', level: 'lifesaver', teacher_id: 'demo-teacher', profiles: { name: 'Ana' } },
  { id: 'cls-3', school_id: DEMO_SCHOOL_ID, name: 'Junior Lifesaver B',  day: 'Saturday',  time: '10:00', level: 'junior',    teacher_id: 'demo-admin',   profiles: { name: 'Andy' } },
]

export const DEMO_CHILDREN_BASE = [
  {
    id: 'child-1', school_id: DEMO_SCHOOL_ID, class_id: 'cls-1', parent_id: 'demo-parent',
    first_name: 'Luca', last_name: 'M.', birth_date: '2013-04-12', level: 'junior', avatar: '👦',
    progress: [
      { criteria_key: 'jl_swim_1' },
    ],
  },
  {
    id: 'child-2', school_id: DEMO_SCHOOL_ID, class_id: 'cls-2', parent_id: null,
    first_name: 'Emma', last_name: 'K.', birth_date: '2012-09-03', level: 'lifesaver', avatar: '👧',
    progress: [
      { criteria_key: 'ls_swim_1' },
      { criteria_key: 'ls_swim_2' },
      { criteria_key: 'ls_swim_3' },
      { criteria_key: 'ls_rescue_1' },
    ],
  },
  {
    id: 'child-3', school_id: DEMO_SCHOOL_ID, class_id: 'cls-3', parent_id: null,
    first_name: 'Noah', last_name: 'B.', birth_date: '2013-11-22', level: 'junior', avatar: '🧒',
    progress: [
      { criteria_key: 'jl_swim_1' },
      { criteria_key: 'jl_swim_2' },
      { criteria_key: 'jl_rescue_1' },
      { criteria_key: 'jl_rescue_2' },
      { criteria_key: 'jl_theory_1' },
    ],
  },
  {
    id: 'child-4', school_id: DEMO_SCHOOL_ID, class_id: 'cls-1', parent_id: null,
    first_name: 'Sara', last_name: 'L.', birth_date: '2014-02-15', level: 'junior', avatar: '👧',
    progress: [],
  },
]

// Backwards-compatible alias
export const DEMO_CHILDREN = DEMO_CHILDREN_BASE

export const DEMO_ADULTS = [
  {
    id: 'adult-1', school_id: DEMO_SCHOOL_ID, class_id: null, parent_id: null,
    first_name: 'Marie', last_name: 'Hoffmann', birth_date: '1985-06-20', level: 'lifesaver',
    person_type: 'adult', contact_email: 'marie.h@example.com', progress: [],
  },
  {
    id: 'adult-2', school_id: DEMO_SCHOOL_ID, class_id: null, parent_id: null,
    first_name: 'Thomas', last_name: 'Weber', birth_date: '1990-03-14', level: 'junior',
    person_type: 'adult', contact_email: 'thomas.w@example.com', progress: [],
  },
]

export const DEMO_ACTIVITIES = [
  { id: 'act-1', school_id: DEMO_SCHOOL_ID, text: 'Emma K. hat <b>Tieftauchen</b> bestanden ✅', type: 'blue',  created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'act-2', school_id: DEMO_SCHOOL_ID, text: 'Luca M. — Notiz von Ana: "Braucht Hilfe beim Schleppen"', type: 'gold',  created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: 'act-3', school_id: DEMO_SCHOOL_ID, text: 'Noah B. — Eltern wurden benachrichtigt 📱', type: 'green', created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'act-4', school_id: DEMO_SCHOOL_ID, text: 'Neues Kind hinzugefügt: <b>Sara L.</b>', type: 'blue',  created_at: new Date(Date.now() - 25 * 3600000).toISOString() },
]

export const DEMO_NOTES = {
  'child-1': [{ id: 'n1', child_id: 'child-1', teacher_id: 'demo-teacher', content: 'Luca macht gute Fortschritte beim Tauchen. Braucht noch etwas Übung beim Schleppen.', created_at: new Date(Date.now() - 3600000).toISOString(), profiles: { name: 'Ana' } }],
  'child-2': [{ id: 'n2', child_id: 'child-2', teacher_id: 'demo-teacher', content: 'Emma ist sehr motiviert und hat diese Woche alle Schwimmkriterien bestanden!', created_at: new Date(Date.now() - 7200000).toISOString(), profiles: { name: 'Ana' } }],
  'child-3': [],
  'child-4': [],
}

export const DEMO_PROGRESS = {
  'child-1': ['jl_swim_1'],
  'child-2': ['ls_swim_1', 'ls_swim_2', 'ls_swim_3', 'ls_rescue_1'],
  'child-3': ['jl_swim_1', 'jl_swim_2', 'jl_rescue_1', 'jl_rescue_2', 'jl_theory_1'],
  'child-4': [],
}
