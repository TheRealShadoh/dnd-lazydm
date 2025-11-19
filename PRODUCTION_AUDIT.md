# Production Readiness Audit - D&D LazyDM

**Audit Date:** 2025-11-19
**Auditor:** Principal Developer
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Executive Summary

This D&D Campaign Manager is a feature-rich Next.js application with impressive functionality including:
- Campaign management with MDX-based content
- Virtual Tabletop (VTT) with token management
- D&D Beyond integration
- Dice roller system
- Image lightbox and editor components

However, **this application is NOT production-ready** and has **17 critical security vulnerabilities**, performance issues, and accessibility gaps that must be addressed before deployment.

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. **NO AUTHENTICATION/AUTHORIZATION** ⚠️ SEVERITY: CRITICAL
**Impact:** Anyone can access, modify, or delete all campaigns, characters, and content.

**Affected Endpoints (All 18):**
- `/api/campaigns` - Create/list campaigns
- `/api/campaigns/[id]/characters` - Manage characters
- `/api/campaigns/[id]/scenes` - Create/edit scenes
- `/api/campaigns/[id]/monsters` - Add monsters
- `/api/dndbeyond/character/[id]` - Fetch D&D Beyond data

**Risk:**
- Data theft
- Content vandalism
- Unauthorized campaign access
- D&D Beyond token leakage

**Fix Required:**
```typescript
// Implement NextAuth.js or similar
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... rest of endpoint
}
```

---

### 2. **PATH TRAVERSAL VULNERABILITIES** ⚠️ SEVERITY: CRITICAL
**Impact:** Attackers can read/write arbitrary files on the server.

**Affected Endpoints:**
- `/api/campaigns/route.ts:11` - `slug` parameter
- `/api/campaigns/[campaignId]/scenes/route.ts:16` - `slug` parameter
- `/api/campaigns/[campaignId]/scenes/[sceneSlug]/route.ts:8` - `sceneSlug` parameter
- All endpoints using `campaignId` parameter

**Example Attack:**
```bash
POST /api/campaigns
{
  "slug": "../../../etc/passwd",
  "name": "Evil Campaign"
}
# Creates files outside intended directory
```

**Fix Required:**
```typescript
import path from 'path'

function sanitizeSlug(slug: string): string {
  // Remove path traversal attempts
  const sanitized = slug.replace(/\.\./g, '').replace(/\//g, '-')
  // Only allow alphanumeric and hyphens
  return sanitized.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
}

const campaignPath = path.join(
  process.cwd(),
  'src',
  'app',
  'campaigns',
  sanitizeSlug(slug) // Always sanitize!
)
```

---

### 3. **MISSING INPUT VALIDATION** ⚠️ SEVERITY: CRITICAL
**Impact:** Malformed data, XSS attacks, application crashes.

**Affected Areas:**
- All API endpoints accept arbitrary JSON without schema validation
- No file size limits on PDF uploads
- No validation of D&D Beyond character data structure
- Template literals inject user input without escaping

**Fix Required:**
```bash
npm install zod
```

```typescript
import { z } from 'zod'

const CampaignSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500),
  level: z.string().optional(),
  players: z.string().optional(),
  // ... etc
})

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate
  const result = CampaignSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error },
      { status: 400 }
    )
  }

  const data = result.data // Now type-safe and validated
  // ... proceed
}
```

---

### 4. **FILE UPLOAD VULNERABILITIES** ⚠️ SEVERITY: CRITICAL
**Location:** `/api/campaigns/[campaignId]/characters/import-pdf/route.ts`

**Issues:**
- No file size limits (could upload GB-sized files)
- No file type validation (could upload malware)
- PDF parsing could cause DoS with malformed files
- No rate limiting (spam uploads)

**Fix Required:**
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('pdf') as File

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 10MB" },
      { status: 413 }
    )
  }

  // Validate MIME type
  if (file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: "Invalid file type. PDF only" },
      { status: 400 }
    )
  }

  // ... proceed with parsing
}
```

---

### 5. **REACT COMPONENT PERFORMANCE BUGS** ⚠️ SEVERITY: HIGH
**Impact:** Infinite render loops, poor performance, browser crashes.

**Bug 1:** `CharacterWidget.tsx:24`
```typescript
// WRONG - missing campaignId in deps
useEffect(() => {
  loadCharacters() // Uses campaignId but it's not in deps!
}, []) // eslint-disable-next-line react-hooks/exhaustive-deps

// FIX
useEffect(() => {
  loadCharacters()
}, [campaignId]) // Add missing dependency
```

**Bug 2:** `TokenControls.tsx:67`
```typescript
// WRONG - could cause infinite loop
useEffect(() => {
  if (campaignImages.length === 0) {
    loadCampaignImages() // Sets campaignImages state
  }
}, [campaignImages.length]) // Depends on what it sets!

// FIX
const [hasLoadedImages, setHasLoadedImages] = useState(false)
useEffect(() => {
  if (!hasLoadedImages) {
    loadCampaignImages()
    setHasLoadedImages(true)
  }
}, [hasLoadedImages])
```

**Bug 3:** `VTTCanvas.tsx:308`
```typescript
// WRONG - tokenImages Map causes re-renders on every change
useEffect(() => {
  // Load images...
}, [tokens, tokenImages, gridSettings, ...]) // tokenImages is unstable!

// FIX
useEffect(() => {
  // Load images...
}, [tokens, gridSettings, ...]) // Remove tokenImages from deps
```

---

### 6. **DNDBEYOND TOKEN EXPOSURE** ⚠️ SEVERITY: HIGH
**Location:** `.env.example`, `/api/dndbeyond/character/[characterId]/route.ts`

**Issues:**
- CobaltSession cookie forwarded to external API
- Could be logged in server logs
- Exposed in error messages
- No validation if token is still valid

**Fix Required:**
```typescript
// Add token encryption
import { encrypt, decrypt } from '@/lib/crypto'

// Never log raw tokens
console.log('[DnDBeyond] Fetching character...') // ✅ Good
console.log('[DnDBeyond] Token:', token) // ❌ Never do this!

// Validate token format
const COBALT_TOKEN_REGEX = /^[a-zA-Z0-9-_]+$/
if (!token || !COBALT_TOKEN_REGEX.test(token)) {
  return NextResponse.json(
    { error: "Invalid token format" },
    { status: 400 }
  )
}
```

---

## 🟠 HIGH PRIORITY ISSUES

### 7. **NO ERROR BOUNDARIES**
React components can crash the entire app. Add error boundaries:

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Something went wrong!
        </h2>
        <button onClick={reset} className="px-4 py-2 bg-purple-500 rounded">
          Try again
        </button>
      </div>
    </div>
  )
}
```

---

### 8. **NO RATE LIMITING**
Attackers can spam API endpoints. Add rate limiting:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    )
  }
  // ... proceed
}
```

---

### 9. **ACCESSIBILITY ISSUES** (11/12 Components)
**Missing:**
- ARIA labels on interactive elements
- Keyboard navigation for context menus
- Screen reader announcements for toasts
- Focus indicators on custom buttons
- Alt text validation on images
- Semantic HTML structure

**Example Fixes:**
```tsx
// DiceNotation.tsx - Add keyboard support
<span
  role="button"
  tabIndex={0}
  aria-label={`Roll ${value}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleRoll()
    }
  }}
>
  {value}
</span>

// RollToast.tsx - Add announcements
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  {/* Toast content */}
</div>
```

---

### 10. **NO TESTS**
**Status:** Zero test files found.

**Required:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom jest
```

Create tests for:
- API endpoints (integration tests)
- React components (unit tests)
- Dice rolling logic (unit tests)
- Character parsing (unit tests)

---

## 🟡 MEDIUM PRIORITY ISSUES

### 11. **Docker Configuration Issues**
**Location:** `Dockerfile`, `docker-compose.yml`

**Issues:**
- No health check endpoint
- No graceful shutdown handling
- Volumes mount source code (defeats Docker purpose)
- No multi-stage build optimization
- No security scanning

**Fix:**
```dockerfile
# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

Create health check endpoint:
```typescript
// app/api/health/route.ts
export async function GET() {
  return NextResponse.json({ status: 'healthy', timestamp: Date.now() })
}
```

---

### 12. **Environment Variable Management**
**Issues:**
- `.env` in gitignore but `.env.example` has poor documentation
- No validation of required env vars at startup
- No type-safe env var access

**Fix:**
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DNDBEYOND_COBALT_SESSION: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

---

### 13. **No Logging Strategy**
**Current:** `console.log()` everywhere, no structured logging.

**Fix:**
```bash
npm install pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
})

// Usage
logger.info({ campaignId }, 'Campaign created')
logger.error({ error }, 'Failed to load characters')
```

---

### 14. **Performance Optimizations Needed**
- **Images:** Not optimized - missing `next/image` in some places
- **Bundle size:** No bundle analyzer configured
- **Code splitting:** Could use dynamic imports for VTT
- **Memoization:** Missing `useMemo`/`useCallback` in components

**Fixes:**
```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### 15. **Documentation Gaps**
- No API documentation (Swagger/OpenAPI)
- No component Storybook
- No architecture diagrams
- No contributing guidelines

### 16. **No CI/CD Pipeline**
- No GitHub Actions for tests
- No automated security scanning
- No automatic deployments

### 17. **Monitoring/Observability**
- No error tracking (Sentry)
- No analytics
- No performance monitoring

---

## Recommended Implementation Order

### Phase 1: Security (Week 1) 🔴
1. Add authentication (NextAuth.js)
2. Sanitize all path parameters
3. Add input validation (Zod)
4. Fix file upload vulnerabilities
5. Add rate limiting

### Phase 2: Stability (Week 2) 🟠
6. Fix React component bugs
7. Add error boundaries
8. Add comprehensive error handling
9. Add logging infrastructure
10. Create health check endpoint

### Phase 3: Quality (Week 3) 🟡
11. Add accessibility improvements
12. Write critical tests (80% coverage target)
13. Optimize performance
14. Improve Docker configuration
15. Add environment validation

### Phase 4: Production (Week 4) 🟢
16. Add monitoring/observability
17. Create CI/CD pipeline
18. Write production deployment guide
19. Security audit with tools
20. Load testing

---

## Production Deployment Checklist

- [ ] Authentication implemented and tested
- [ ] All path traversal vulnerabilities fixed
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] HTTPS enforced (in production)
- [ ] Environment variables secured
- [ ] Error boundaries added
- [ ] Logging configured
- [ ] Health check endpoint created
- [ ] Database backups configured (if using DB)
- [ ] CDN configured for static assets
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Tests passing (minimum 80% coverage)
- [ ] Load testing completed
- [ ] Penetration testing completed
- [ ] Documentation complete
- [ ] Runbook for operations team
- [ ] Rollback plan documented

---

## Conclusion

This application has excellent features and UX, but **requires significant security hardening** before production deployment. The critical issues (authentication, path traversal, input validation) must be addressed immediately.

**Estimated effort:** 4 weeks (1 developer)
**Risk if deployed as-is:** HIGH - Data breach, content vandalism, server compromise

**Recommendation:** Do not deploy to production until Phase 1 & 2 are complete.
