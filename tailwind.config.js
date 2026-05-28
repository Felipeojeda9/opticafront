/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Marca · Rojo Zeus
        zeus: {
          50:  'var(--zeus-50)',
          100: 'var(--zeus-100)',
          200: 'var(--zeus-200)',
          300: 'var(--zeus-300)',
          400: 'var(--zeus-400)',
          500: 'var(--zeus-500)',
          600: 'var(--zeus-600)',
          700: 'var(--zeus-700)',
          800: 'var(--zeus-800)',
          DEFAULT: 'var(--zeus-500)',
        },
        // Neutros cálidos
        bone: {
          bg:      'var(--bone-bg)',
          surface: 'var(--bone-surface)',
          border:  'var(--bone-border)',
          muted:   'var(--bone-muted)',
        },
        ink: {
          0: 'var(--ink-0)',
          1: 'var(--ink-1)',
          2: 'var(--ink-2)',
        },
        // Estados
        state: {
          'pending-bg':     'var(--state-pending-bg)',
          'pending-text':   'var(--state-pending-text)',
          'pending-line':   'var(--state-pending-line)',
          'confirmed-bg':   'var(--state-confirmed-bg)',
          'confirmed-text': 'var(--state-confirmed-text)',
          'confirmed-line': 'var(--state-confirmed-line)',
          'cancelled-bg':   'var(--state-cancelled-bg)',
          'cancelled-text': 'var(--state-cancelled-text)',
          'cancelled-line': 'var(--state-cancelled-line)',
          'info-bg':        'var(--state-info-bg)',
          'info-text':      'var(--state-info-text)',
          'info-line':      'var(--state-info-line)',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        'zeus-sm': 'var(--shadow-sm)',
        'zeus-md': 'var(--shadow-md)',
        'zeus-lg': 'var(--shadow-lg)',
      },
      spacing: {
        sidebar: 'var(--sidebar-width)',
        header:  'var(--header-height)',
      },
      letterSpacing: {
        eyebrow: '1.5px',
      },
    },
  },
  plugins: [],
}