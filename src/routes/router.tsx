import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/layout/AppShell'
import { RequireAuth, RequireSuperAdminRole } from '@/routes/RequireAuth'
import { LoginPage } from '@/features/auth/LoginPage'

// Route-level code splitting — each feature is its own chunk, loaded on first visit rather than
// bundled into the ~640KB main chunk `vite build` was flagging. AppShell renders a single
// <Suspense> boundary around <Outlet/> (layout/AppShell.tsx) so these don't each need their own.
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const PropertiesPage = lazy(() => import('@/features/properties/PropertiesPage').then((m) => ({ default: m.PropertiesPage })))
const PropertyFormPage = lazy(() => import('@/features/properties/PropertyFormPage').then((m) => ({ default: m.PropertyFormPage })))
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })))
const ProjectFormPage = lazy(() => import('@/features/projects/ProjectFormPage').then((m) => ({ default: m.ProjectFormPage })))
const SpotlightProjectsPage = lazy(() =>
  import('@/features/spotlight-projects/SpotlightProjectsPage').then((m) => ({ default: m.SpotlightProjectsPage })),
)
const SpotlightProjectFormPage = lazy(() =>
  import('@/features/spotlight-projects/SpotlightProjectFormPage').then((m) => ({ default: m.SpotlightProjectFormPage })),
)
const HeroBannersPage = lazy(() =>
  import('@/features/hero-banners/HeroBannersPage').then((m) => ({ default: m.HeroBannersPage })),
)
const HeroBannerFormPage = lazy(() =>
  import('@/features/hero-banners/HeroBannerFormPage').then((m) => ({ default: m.HeroBannerFormPage })),
)
const BlogPage = lazy(() => import('@/features/blog/BlogPage').then((m) => ({ default: m.BlogPage })))
const PostFormPage = lazy(() => import('@/features/blog/PostFormPage').then((m) => ({ default: m.PostFormPage })))
const DevelopersPage = lazy(() => import('@/features/developers/DevelopersPage').then((m) => ({ default: m.DevelopersPage })))
const DeveloperFormPage = lazy(() => import('@/features/developers/DeveloperFormPage').then((m) => ({ default: m.DeveloperFormPage })))
const BusinessProfilesPage = lazy(() => import('@/features/business-profiles/BusinessProfilesPage').then((m) => ({ default: m.BusinessProfilesPage })))
const BusinessProfileFormPage = lazy(() => import('@/features/business-profiles/BusinessProfileFormPage').then((m) => ({ default: m.BusinessProfileFormPage })))
const UsersPage = lazy(() => import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage })))
const AccessLevelsPage = lazy(() => import('@/features/settings/AccessLevelsPage').then((m) => ({ default: m.AccessLevelsPage })))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const MessagesPage = lazy(() => import('@/features/messaging/MessagesPage').then((m) => ({ default: m.MessagesPage })))
const AgentApplicationsPage = lazy(() =>
  import('@/features/agent-applications/AgentApplicationsPage').then((m) => ({ default: m.AgentApplicationsPage })),
)
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const LinkedInPage = lazy(() => import('@/features/linkedin/LinkedInPage').then((m) => ({ default: m.LinkedInPage })))

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/properties', element: <PropertiesPage /> },
          { path: '/properties/new', element: <PropertyFormPage /> },
          { path: '/properties/:id/edit', element: <PropertyFormPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/new', element: <ProjectFormPage /> },
          { path: '/projects/:id/edit', element: <ProjectFormPage /> },
          { path: '/spotlight-projects', element: <SpotlightProjectsPage /> },
          { path: '/spotlight-projects/new', element: <SpotlightProjectFormPage /> },
          { path: '/spotlight-projects/:id/edit', element: <SpotlightProjectFormPage /> },
          { path: '/hero-banners', element: <HeroBannersPage /> },
          { path: '/hero-banners/new', element: <HeroBannerFormPage /> },
          { path: '/hero-banners/:id/edit', element: <HeroBannerFormPage /> },
          { path: '/blog', element: <BlogPage /> },
          { path: '/blog/posts/new', element: <PostFormPage /> },
          { path: '/blog/posts/:id/edit', element: <PostFormPage /> },
          { path: '/developers', element: <DevelopersPage /> },
          { path: '/developers/new', element: <DeveloperFormPage /> },
          { path: '/developers/:slug/edit', element: <DeveloperFormPage /> },
          { path: '/business-profiles', element: <BusinessProfilesPage /> },
          { path: '/business-profiles/new', element: <BusinessProfileFormPage /> },
          { path: '/business-profiles/:id/edit', element: <BusinessProfileFormPage /> },
          { path: '/agent-applications', element: <AgentApplicationsPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/linkedin', element: <LinkedInPage /> },
          {
            element: <RequireSuperAdminRole />,
            children: [
              { path: '/users', element: <UsersPage /> },
              { path: '/access-levels', element: <AccessLevelsPage /> },
              { path: '/messages', element: <MessagesPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
