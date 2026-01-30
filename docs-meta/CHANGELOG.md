# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Performance monitoring with Web Vitals (FCP, LCP, CLS, TTFB)
- Enhanced ErrorBoundary with error classification and Umami reporting
- Theme transition animations for smoother dark/light mode switching
- Intersection Observer based lazy image loading
- Multi-CDN image optimization support (Cloudinary, Imgix, Pexels)

### Changed
- ESLint configuration now includes Astro plugin
- Centralized ThemeOption type definition in home.ts
- ErrorBoundary uses AbortController for proper cleanup

### Fixed
- Memory leak in ErrorBoundary component
- Unused variable warnings in ImageCompare component
- Triple-slash reference error in env.d.ts

---

## [1.0.0] - 2026-01-08

### Added
- Initial Starlight documentation site
- PWA support with offline access
- Umami Analytics integration
- Multi-theme color schemes (经典橙, 电竞蓝, 赛道红, 科技紫, 极速绿)
- Responsive design for mobile and desktop
- SEO optimization with Open Graph and Twitter Cards
- Image optimization utilities
- Global error handling system
- Component initialization manager

### Components
- Hero section with animated background
- Season showcase carousel
- Achievement cards
- Sponsor section
- News section
- Theme switcher
- Image lightbox
- Breadcrumb navigation
- Reading progress indicator
- Image comparison slider

### Documentation
- Getting started guide
- MDX writing guidelines
- Asset management guide
- Code style guide

---

## [0.1.0] - 2025-12-01

### Added
- Project initialization with Astro + Starlight
- Basic documentation structure
- GitHub repository setup
