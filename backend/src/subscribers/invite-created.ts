import { INotificationModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL } from '../lib/constants'

export default async function userInviteHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  const invite = await userModuleService.retrieveInvite(data.id)

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: process.env.SENDGRID_INVITE_TEMPLATE_ID || 'invite-user',
      data: {
        inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
      }
    })
  } catch (error) {
    console.error('Notification error:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}