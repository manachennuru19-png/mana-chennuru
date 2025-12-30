# MANA CHENNURU HUB - Project Structure Analysis

## 📋 Project Overview

**Project Name**: MANA CHENNURU (మన చెన్నూరు)  
**Type**: Village Community Portal / Digital Village Hub  
**Tech Stack**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase  
**Platform**: Web Application (SPA)

---

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM 6.30.1
- **State Management**: 
  - TanStack Query (React Query) 5.83.0 for server state
  - React Hooks for local state
  - LocalStorage for authentication persistence
- **Backend Integration**: Supabase 2.87.0 (configured but currently empty schema)
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76

### Development Tools
- **Language**: TypeScript 5.8.3
- **Linting**: ESLint 9.32.0
- **CSS Processing**: PostCSS + Autoprefixer
- **Package Manager**: npm (package-lock.json present) + bun.lockb

---

## 📁 Directory Structure

```
mana-chennuru-hub-main/
│
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/                         # Source code
│   ├── assets/                  # Images and media files
│   │   ├── hero-village.jpg
│   │   └── section-*.jpg        # 14 section images
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui component library (50+ components)
│   │   ├── AddEditModal.tsx
│   │   ├── ChennuruTemplesSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── NavLink.tsx
│   │   ├── SectionCard.tsx
│   │   └── SectionHeader.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useAuth.ts           # Authentication hook (localStorage-based)
│   │
│   ├── integrations/            # Third-party integrations
│   │   └── supabase/
│   │       ├── client.ts        # Supabase client configuration
│   │       └── types.ts         # Database type definitions (empty schema)
│   │
│   ├── lib/                     # Utility functions
│   │   └── utils.ts             # Common utilities (cn, etc.)
│   │
│   ├── pages/                   # Route pages/components
│   │   ├── Culture.tsx
│   │   ├── Index.tsx            # Homepage
│   │   ├── Login.tsx
│   │   ├── News.tsx
│   │   ├── NotFound.tsx
│   │   └── Shops.tsx
│   │
│   ├── App.tsx                  # Main app component with routing
│   ├── App.css
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles + design system
│   └── vite-env.d.ts            # Vite type definitions
│
├── supabase/                    # Supabase configuration
│   └── config.toml              # Project ID configuration
│
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── package-lock.json
├── bun.lockb
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript root config
├── tsconfig.app.json            # App-specific TS config
├── tsconfig.node.json           # Node-specific TS config
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── components.json              # shadcn/ui configuration
├── eslint.config.js             # ESLint configuration
└── README.md                    # Project documentation
```

---

## 🎨 Design System

### Color Palette
The project uses a custom village-themed color scheme (HSL values):

- **Primary**: `hsl(144 21% 31%)` - Deep forest green (#3E5F44)
- **Secondary**: `hsl(138 24% 45%)` - Medium sage (#5E936C)
- **Accent**: `hsl(126 68% 71%)` - Fresh mint (#93DA97)
- **Background**: `hsl(95 100% 92%)` - Light lime (#E8FFD7)

### Status Colors
- **Open**: `hsl(126 68% 71%)` - Green
- **Closed**: `hsl(0 70% 88%)` - Light red

### Typography & Spacing
- Uses Tailwind's default spacing scale
- Border radius: `0.75rem` (12px)
- Custom shadows defined in CSS variables

---

## 🛣️ Routing Structure

### Current Routes
1. **`/`** → `Index.tsx` (Homepage)
2. **`/shops`** → `Shops.tsx` (Shops Directory)
3. **`/news`** → `News.tsx` (Village News)
4. **`/culture`** → `Culture.tsx` (Culture & Temples)
5. **`/login`** → `Login.tsx` (Authentication)
6. **`*`** → `NotFound.tsx` (404 page)

### Planned Routes (referenced in Index.tsx but not yet implemented)
- `/rentals` - Rental Houses
- `/schemes` - Government Schemes
- `/complaints` - Report Problems
- `/contacts` - Government Contacts
- `/emergency` - Emergency Services
- `/education` - Education Info
- `/transport` - Transport Info
- `/agriculture` - Agriculture Zone
- `/gallery` - Gallery
- `/lost-found` - Lost & Found
- `/donations` - Help & Donations

---

## 🧩 Key Features

### 1. Homepage (Index.tsx)
- Hero section with village image and stats
- 14 service sections (cards with images and descriptions)
- Quick actions section (Emergency, Open Shops, Latest Update)

### 2. Shops Directory (Shops.tsx)
- Displays local businesses
- Filter by: All / Open / Closed
- Shop details: Name, Category, Address, Contact, Hours, Status
- Currently uses hardcoded data (6 sample shops)

### 3. Authentication (useAuth.ts)
- Simple localStorage-based authentication
- No backend integration yet
- Stores user name in `localStorage` as `manaUser`
- Login page with email/password form (currently just demo)

### 4. Header Component
- Sticky navigation bar
- Logo with "MC" initials
- Bilingual support (Telugu/English) - language toggle
- Search functionality (UI only, not functional)
- Responsive mobile menu button

### 5. Supabase Integration
- Client configured and ready
- Database schema currently empty (no tables defined)
- Environment variables required:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 📦 Dependencies Analysis

### Core Dependencies
- **react**: 18.3.1 - UI framework
- **react-dom**: 18.3.1 - React DOM rendering
- **react-router-dom**: 6.30.1 - Client-side routing
- **@supabase/supabase-js**: 2.87.0 - Backend as a Service

### UI/UX Libraries
- **@radix-ui/react-*** (50+ packages) - Headless UI primitives
- **lucide-react**: 0.462.0 - Icon library
- **tailwindcss**: 3.4.17 - Utility-first CSS
- **tailwindcss-animate**: 1.0.7 - Animation utilities
- **next-themes**: 0.3.0 - Theme management (dark mode support)

### Form & Data
- **react-hook-form**: 7.61.1 - Form state management
- **zod**: 3.25.76 - Schema validation
- **@hookform/resolvers**: 3.10.0 - Form validation resolvers
- **@tanstack/react-query**: 5.83.0 - Server state management

### Utilities
- **clsx**: 2.1.1 - Conditional classNames
- **tailwind-merge**: 2.6.0 - Merge Tailwind classes
- **class-variance-authority**: 0.7.1 - Component variants
- **date-fns**: 3.6.0 - Date manipulation
- **sonner**: 1.7.4 - Toast notifications

### Development Dependencies
- **vite**: 5.4.19 - Build tool
- **@vitejs/plugin-react-swc**: 3.11.0 - Fast React refresh
- **typescript**: 5.8.3 - Type checking
- **eslint**: 9.32.0 - Code linting
- **autoprefixer**: 10.4.21 - CSS vendor prefixes
- **postcss**: 8.5.6 - CSS processing
- **lovable-tagger**: 1.1.11 - Development tool

---

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
- Port: 8080
- Host: `::` (all interfaces)
- Path alias: `@` → `./src`
- React plugin with SWC for fast refresh
- Lovable tagger plugin (dev mode only)

### TypeScript Configuration
- **tsconfig.json**: Root config with path aliases
- **tsconfig.app.json**: Application-specific config
- **tsconfig.node.json**: Node/build tools config
- Path alias: `@/*` → `./src/*`
- Relaxed strict mode settings (allows JS, no strict null checks)

### Tailwind Configuration (`tailwind.config.ts`)
- Dark mode: class-based
- Custom colors from CSS variables
- Custom status colors (open/closed)
- Border radius customization
- Accordion animations
- Typography plugin enabled

### ESLint Configuration (`eslint.config.js`)
- Modern flat config format
- React hooks rules
- React refresh rules

---

## 🔐 Authentication System

### Current Implementation
- **Type**: Client-side only (localStorage)
- **Storage Key**: `manaUser`
- **User Data**: `{ name: string }`
- **Hook**: `useAuth()` in `src/hooks/useAuth.ts`
- **Methods**:
  - `login(name?: string)` - Sets user in localStorage
  - `logout()` - Removes user from localStorage
  - `isAuthenticated` - Boolean flag
  - `user` - Current user object

### Future Enhancement
- Supabase Auth integration ready but not implemented
- Login page exists but currently just sets demo user

---

## 🗄️ Database Schema (Supabase)

### Current Status
- **Database**: Configured but empty
- **Project ID**: `fjndzyfkolxqmdegikdq`
- **Tables**: None defined
- **Types**: Generated types file exists but is empty

### Expected Tables (based on features)
The application likely needs tables for:
- `shops` - Shop directory data
- `news` - News articles/announcements
- `temples` - Temple information
- `rentals` - Rental property listings
- `complaints` - User complaints/issues
- `contacts` - Government/official contacts
- `gallery` - Image/video metadata
- `lost_found` - Lost and found items
- `users` - User profiles (if using Supabase Auth)

---

## 🎯 Component Architecture

### Layout Components
- **Header** - Navigation bar with search and language toggle
- **Footer** - Page footer (needs review)
- **Hero** - Landing page hero section

### Feature Components
- **SectionCard** - Reusable card for service sections
- **SectionHeader** - Section title component
- **ChennuruTemplesSection** - Temple listing component
- **AddEditModal** - Generic add/edit modal (likely for CRUD operations)

### UI Component Library
50+ shadcn/ui components in `src/components/ui/`:
- Form controls (Button, Input, Select, Checkbox, etc.)
- Layout (Card, Separator, ScrollArea, etc.)
- Navigation (Breadcrumb, NavigationMenu, Pagination, etc.)
- Overlays (Dialog, Popover, Tooltip, Sheet, etc.)
- Feedback (Alert, Toast, Progress, Skeleton, etc.)
- Data display (Table, Chart, Calendar, etc.)

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl (Tailwind defaults)
- Sticky header for navigation
- Mobile search bar
- Responsive grid layouts
- Touch-friendly interactive elements

---

## 🌐 Internationalization (i18n)

### Current Support
- **Languages**: Telugu (te) / English (en)
- **Implementation**: Simple useState toggle in Header
- **Scope**: Limited to header text currently
- **Future**: Needs proper i18n library for full implementation

---

## 🚀 Scripts & Commands

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## 📊 Current State Assessment

### ✅ Completed Features
- Project setup and configuration
- Homepage with hero and service sections
- Shops directory page (with hardcoded data)
- Basic routing structure
- UI component library setup
- Design system implementation
- Header with language toggle
- Authentication hook (localStorage)
- Login page UI

### 🚧 In Progress / Partially Complete
- News page (route exists, implementation needs review)
- Culture page (route exists, implementation needs review)
- Supabase integration (client configured, no schema)

### ❌ Not Implemented
- Database schema and tables
- Backend API integration
- Real authentication (Supabase Auth)
- 10+ planned routes (rentals, schemes, complaints, etc.)
- Search functionality
- Image uploads
- Real-time features
- Admin panel
- Content management

---

## 🔍 Key Observations

1. **Well-Structured**: Clean separation of concerns, organized folder structure
2. **Modern Stack**: Uses latest React patterns and modern tooling
3. **Design System**: Comprehensive custom design system with village theme
4. **Component Library**: Extensive UI component library (shadcn/ui)
5. **Scalable Architecture**: Ready for backend integration
6. **Type Safety**: TypeScript throughout (though some strictness relaxed)
7. **Development Ready**: Full development environment configured
8. **Production Ready**: Build configuration in place

---

## 📝 Recommendations

### Immediate Priorities
1. Set up Supabase database schema
2. Implement real authentication
3. Connect Shops page to database
4. Implement remaining route pages
5. Add environment variable template (.env.example)

### Future Enhancements
1. Implement full i18n solution (react-i18next or similar)
2. Add real-time features (Supabase Realtime)
3. Implement image uploads (Supabase Storage)
4. Add admin panel for content management
5. Implement search functionality
6. Add analytics
7. Set up CI/CD pipeline
8. Add error boundaries
9. Implement loading states and error handling
10. Add unit and integration tests

---

## 📞 Contact & Resources

- **Lovable Project**: https://lovable.dev/projects/396cf14b-3c64-417e-9746-cf03f2d21530
- **Supabase Project ID**: fjndzyfkolxqmdegikdq

---

*Last Updated: Based on current codebase analysis*

