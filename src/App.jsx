import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm run dev')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Decorative Gradient Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20 text-lg">
              H
            </div>
            <span className="font-semibold text-lg tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Hackathon Starter
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active LTS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              React + Vite + Tailwind v3
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col justify-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Tech Badges */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            {/* Vite Logo */}
            <a href="https://vite.dev" target="_blank" rel="noreferrer" className="group relative p-3 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-violet-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-xl hover:shadow-violet-500/10">
              <svg className="w-12 h-12 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 410 404" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M399.7 75.9L221.7 387.6C218.4 393.4 212.2 397 205.5 397C198.8 397 192.6 393.4 189.3 387.6L11.3 75.9C8.3 70.7 8.5 64.3 11.9 59.3C15.3 54.3 21 51.3 27.1 51.3H148.9L205.5 161.4L262.1 51.3H383.9C390 51.3 395.7 54.3 399.1 59.3C402.5 64.3 402.7 70.7 399.7 75.9Z" fill="url(#vite-grad)"/>
                <path d="M263.1 19.3L205.5 131.2L147.9 19.3C144.6 13 138 9 130.8 9H31.9C20.6 9 12.8 20.2 16.5 30.8L112.5 306.9C114.7 313.2 120.7 317.5 127.4 317.5H283.6C290.3 317.5 296.3 313.2 298.5 306.9L394.5 30.8C398.2 20.2 390.4 9 379.1 9H280.2C273 9 266.4 13 263.1 19.3Z" fill="url(#vite-lightning-grad)"/>
                <defs>
                  <linearGradient id="vite-grad" x1="19.3" y1="51.3" x2="397.7" y2="385.7" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#41D1FF"/>
                    <stop offset="1" stopColor="#BD34FE"/>
                  </linearGradient>
                  <linearGradient id="vite-lightning-grad" x1="120" y1="9" x2="330" y2="317.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF8008"/>
                    <stop offset="1" stopColor="#FFC837"/>
                  </linearGradient>
                </defs>
              </svg>
            </a>
            
            {/* Plus sign */}
            <span className="text-2xl font-semibold text-slate-700">+</span>
            
            {/* React Logo */}
            <a href="https://react.dev" target="_blank" rel="noreferrer" className="group relative p-3 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-sky-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-xl hover:shadow-sky-500/10">
              <svg className="w-12 h-12 animate-[spin_20s_linear_infinite] group-hover:scale-110 transition-transform duration-500" viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
                <g stroke="#61dafb" strokeWidth="1" fill="none">
                  <ellipse rx="11" ry="4.2"/>
                  <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                  <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
                </g>
              </svg>
            </a>

            {/* Plus sign */}
            <span className="text-2xl font-semibold text-slate-700">+</span>

            {/* Tailwind CSS Logo */}
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="group relative p-3 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-400/50 hover:bg-slate-900/80 transition-all duration-300 shadow-xl hover:shadow-cyan-400/10">
              <svg className="w-12 h-12 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 54 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M27 0C34.2 0 38.7 3.6 40.5 10.8C47.7 10.8 52.2 14.4 54 21.6C54 28.8 49.5 32.4 40.5 32.4C33.3 32.4 28.8 28.8 27 21.6C19.8 21.6 15.3 25.2 13.5 32.4C13.5 25.2 18 21.6 27 21.6C27 14.4 22.5 10.8 13.5 10.8C20.7 10.8 25.2 7.2 27 0Z" fill="#38BDF8"/>
              </svg>
            </a>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Scaffolded &amp; Ready for the
            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Next Big Hackathon
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Your React Vite workspace is successfully initialized with Tailwind CSS v3.
            Build lightweight, blazing fast, and visually spectacular interfaces.
          </p>
        </div>

        {/* Counter and CLI Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16 w-full">
          {/* Interactive State Button */}
          <button
            onClick={() => setCount(count + 1)}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>React State Demo:</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm group-hover:scale-105 transition-transform">
              {count}
            </span>
          </button>

          {/* Quick CLI Start Command */}
          <button 
            onClick={copyToClipboard}
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-4 font-mono text-sm hover:text-slate-200 transition-all text-slate-400 group"
          >
            <span>npm run dev</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700/50 group-hover:bg-slate-700 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          
          {/* Box 1: Core Scaffolding */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="p-3 bg-violet-500/10 rounded-xl w-fit text-violet-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">Modern Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Scaffolded with Vite's super fast Hot Module Replacement (HMR). Edit components in real time and see changes instantly.
            </p>
          </div>

          {/* Box 2: Style Ready */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="p-3 bg-indigo-500/10 rounded-xl w-fit text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">Tailwind CSS Preset</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Tailwind CSS v3 is fully configured with PostCSS. All utility classes are compiled on the fly. Simply use them in your JSX.
            </p>
          </div>

          {/* Box 3: Quick Start */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="p-3 bg-fuchsia-500/10 rounded-xl w-fit text-fuchsia-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">Hackathon Guidelines</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Create reusable layout templates, import assets easily, and design highly interactive user flows to impress judges.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Sejong University Web Programming Hackathon. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-slate-400">
            <a href="https://vite.dev" target="_blank" rel="noreferrer" className="hover:text-violet-400 transition-colors">Vite Docs</a>
            <a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">React Docs</a>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Tailwind CSS</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
