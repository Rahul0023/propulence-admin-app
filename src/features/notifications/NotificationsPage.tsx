import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InboxTab } from '@/features/notifications/InboxTab'
import { TemplatesTab } from '@/features/notifications/TemplatesTab'
import { CampaignsTab } from '@/features/notifications/CampaignsTab'
import { AiRulesTab } from '@/features/notifications/AiRulesTab'
import { PreferencesTab } from '@/features/notifications/PreferencesTab'
import { SendTab } from '@/features/notifications/SendTab'
import { NotificationAnalyticsTab } from '@/features/notifications/NotificationAnalyticsTab'

export function NotificationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Fully real backend — templates, campaigns, AI rules, preferences, admin send, and delivery
          analytics. Templates/campaigns/AI rules/send/analytics require the backend's IsAdminUser
          (is_staff), separate from the SUPERADMIN role gate used on Users/Access Levels.
        </p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="flex-wrap">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="ai-rules">AI Rules</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox"><InboxTab /></TabsContent>
        <TabsContent value="templates"><TemplatesTab /></TabsContent>
        <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
        <TabsContent value="ai-rules"><AiRulesTab /></TabsContent>
        <TabsContent value="preferences"><PreferencesTab /></TabsContent>
        <TabsContent value="send"><SendTab /></TabsContent>
        <TabsContent value="analytics"><NotificationAnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
