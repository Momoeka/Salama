'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const LandingPage = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
        {/* Header with Logo */}
        <header className="flex items-center justify-between py-6 sm:py-8">
          {/* Premium Logo */}
          <div className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity duration-300">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              {/* Animated Logo Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl sm:rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all duration-300 group-hover:blur-md" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg animate-pulse">
                ✨
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SALAMA
              </span>
              <span className="text-xs sm:text-sm text-purple-300 font-medium">Share Your World</span>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSignIn(false)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-purple-100 hover:text-white transition-colors duration-200 border border-purple-400/30 hover:border-purple-300/60 rounded-lg hover:bg-purple-500/10"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowSignIn(true)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Main Content - Single Viewport (No Scroll) */}
        <main className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full max-w-6xl items-center">
            {/* Left Side - Hero Content */}
            <div className="flex flex-col gap-6 sm:gap-8 text-center lg:text-left">
              {/* Hero Text */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                  Share Your{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    World
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-purple-200 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Connect with friends, share your moments, and discover amazing stories. Your community awaits.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                {['🚀 Fast', '🛡️ Secure', '🎨 Beautiful'].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-purple-400/30 rounded-full text-xs sm:text-sm text-purple-100 backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  onClick={() => setShowSignIn(true)}
                  className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  Start Sharing
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6 sm:p-8 shadow-2xl hover:border-purple-400/40 transition-all duration-300">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  {showSignIn ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-purple-200 text-sm mb-6">
                  {showSignIn ? 'Join SALAMA today' : 'Sign in to your account'}
                </p>

                {/* Form */}
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {showSignIn && (
                    <div>
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full px-4 py-3 pr-10 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {!showSignIn && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 rounded border-purple-400/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="remember" className="text-sm text-purple-200">
                        Remember me
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg mt-6"
                  >
                    {showSignIn ? 'Create Account' : 'Sign In'}
                  </button>
                </form>

                {/* Toggle */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowSignIn(!showSignIn)}
                    className="text-sm text-purple-300 hover:text-purple-100 transition-colors"
                  >
                    {showSignIn ? 'Already have an account?' : "Don't have an account?"}
                    <span className="ml-1 font-semibold text-purple-200">{showSignIn ? 'Sign In' : 'Sign Up'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 sm:py-6 border-t border-purple-400/10 text-xs sm:text-sm text-purple-300">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">✨</span>
            <span>Powered by SALAMA AI</span>
          </div>
          <div className="text-center sm:text-right">© 2026 SALAMA. Built with heart & AI.</div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;