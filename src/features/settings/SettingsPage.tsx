import { Link } from 'react-router-dom'
import { ShieldCheck, BellRing, Linkedin, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'

export function SettingsPage() {
  const role = useAuthStore((s) => s.user?.role)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          No generic platform-config or feature-flag backend exists — this is a hub to the settings
          that are real, not an invented System Settings form.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {role === 'SUPERADMIN' && (
          <Link to="/access-levels">
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Access Levels</p>
                  <p className="text-sm text-muted-foreground">Manage the 4-boolean capability model for staff users.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}

        <Link to="/notifications">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Notification Preferences</p>
                <p className="text-sm text-muted-foreground">Your own push/marketing/alert opt-ins (Notifications → Preferences tab).</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/linkedin">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">LinkedIn</p>
                <p className="text-sm text-muted-foreground">Connect a Company Page for automatic article sharing.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
