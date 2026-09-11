import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Landmark,
  Users,
  ShieldCheck,
  BarChart3,
  Bell,
  UserCircle,
  Settings,
  Contact,
  Sparkles,
  Image,
  Newspaper,
  MessageSquare,
  UserCheck,
  Linkedin,
  Video,
  Pin,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Client-side role gate on top of the base "authenticated" requirement. */
  requiresSuperAdminRole?: boolean
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Properties', to: '/properties', icon: Building2 },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Spotlight Projects', to: '/spotlight-projects', icon: Sparkles },
  { label: 'Hero Banners', to: '/hero-banners', icon: Image },
  { label: 'Blog', to: '/blog', icon: Newspaper },
  { label: 'LinkedIn', to: '/linkedin', icon: Linkedin },
  { label: 'Pinterest Account', to: '/pinterest/account', icon: Pin },
  { label: 'Pinterest Pins', to: '/pinterest/pins', icon: Video },
  { label: 'Developers', to: '/developers', icon: Landmark },
  { label: 'Business Profiles', to: '/business-profiles', icon: Contact },
  { label: 'Agent Applications', to: '/agent-applications', icon: UserCheck },
  { label: 'Users', to: '/users', icon: Users, requiresSuperAdminRole: true },
  { label: 'Access Levels', to: '/access-levels', icon: ShieldCheck, requiresSuperAdminRole: true },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Messages', to: '/messages', icon: MessageSquare, requiresSuperAdminRole: true },
  { label: 'Profile', to: '/profile', icon: UserCircle },
  { label: 'Settings', to: '/settings', icon: Settings },
]
