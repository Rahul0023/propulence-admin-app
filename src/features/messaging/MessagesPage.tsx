import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageLogsTab } from '@/features/messaging/MessageLogsTab'
import { MessagingConsentTab } from '@/features/messaging/MessagingConsentTab'

export function MessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Transactional SMS/WhatsApp sends (apps.messaging) — first-time login, listing
          approval/rejection, team invites, and team reminders. Superadmin only.
        </p>
      </div>

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
        </TabsList>
        <TabsContent value="logs">
          <MessageLogsTab />
        </TabsContent>
        <TabsContent value="consent">
          <MessagingConsentTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
