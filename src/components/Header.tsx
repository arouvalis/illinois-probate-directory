"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-navy-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold text-white leading-tight">
              Illinois Probate<br className="hidden sm:block" />
              <span className="text-blue-300"> Directory</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-blue-300 transition-colors">
              Home
            </Link>
            <div className="relative group">
              <button className="hover:text-blue-300 transition-colors flex items-center gap-1">
                Counties
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white text-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {[
                  ["Cook County", "/county/cook-county"],
                  ["Lake County", "/county/lake-county"],
                  ["Will County", "/county/will-county"],
                  ["Kane County", "/county/kane-county"],
                  ["McHenry County", "/county/mchenry-county"],
                  ["DuPage County", "/county/dupage-county"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-4 py-2 hover:bg-navy-50 hover:text-navy-800 text-sm"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/resources/how-probate-works-illinois"
              className="hover:text-blue-300 transition-colors"
            >
              How Probate Works
            </Link>
            <Link
              href="/resources/selling-inherited-property-illinois"
              className="hover:text-blue-300 transition-colors"
            >
              Selling Inherited Property
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded hover:bg-navy-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-navy-700 pt-3 space-y-2 text-sm">
            <Link href="/" className="block px-2 py-1.5 hover:text-blue-300" onClick={() => setMenuOpen(false)}>Home</Link>
            <p className="px-2 py-1 text-xs text-gray-400 uppercase tracking-wider">Counties</p>
            {[
              ["Cook County", "/county/cook-county"],
              ["Lake County", "/county/lake-county"],
              ["Will County", "/county/will-county"],
              ["Kane County", "/county/kane-county"],
              ["McHenry County", "/county/mchenry-county"],
              ["DuPage County", "/county/dupage-county"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="block px-4 py-1.5 hover:text-blue-300" onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/resources/how-probate-works-illinois" className="block px-2 py-1.5 hover:text-blue-300" onClick={() => setMenuOpen(false)}>How Probate Works</Link>
            <Link href="/resources/selling-inherited-property-illinois" className="block px-2 py-1.5 hover:text-blue-300" onClick={() => setMenuOpen(false)}>Selling Inherited Property</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
