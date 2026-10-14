import { NavLink, Route, Routes } from 'react-router-dom'
import { CalendarDays, Layers } from 'lucide-react'
import { cn } from './lib/cn'
import { DemoPage } from './pages/DemoPage'
import { TimetablePage } from './pages/TimetablePage'

const NAV = [
  { to: '/', label: 'Timetable', icon: CalendarDays },
  { to: '/demo', label: 'Reusability demo', icon: Layers },
]

export default function App() {
  return (
    <div className="min-h-dvh bg-slate-100/70">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <div className="flex min-h-dvh w-full flex-col lg:flex-row">
        <header className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2 px-5 py-4">
            <span className="flex size-8 items-center justify-center bg-slate-900 text-sm font-semibold text-white">
              R
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Rezerv Studio</p>
              <p className="text-xs text-slate-500">Operations</p>
            </div>
          </div>

          <nav aria-label="Main" className="flex gap-1 px-3 pb-3 lg:flex-col">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors motion-reduce:transition-none',
                    'focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        {}
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Routes>
            <Route path="/" element={<TimetablePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="*" element={<TimetablePage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
