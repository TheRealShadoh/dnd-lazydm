import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  CampaignMessage,
  PlayerMessage,
  PlayerLanguageProfile,
  processMessageForPlayer,
} from '@/types/messaging'

interface MessageState {
  // DM-side: all messages sent
  sentMessages: Record<string, CampaignMessage[]> // campaignId -> messages

  // Player-side: received messages
  receivedMessages: Record<string, PlayerMessage[]> // campaignId -> messages

  // Player language profiles for the current user
  playerLanguages: string[]

  // Unread count per campaign
  unreadCounts: Record<string, number>

  // Popup visibility
  showMessagePopup: boolean
  currentPopupMessage: PlayerMessage | null

  // Actions
  addSentMessage: (message: CampaignMessage) => void
  addReceivedMessage: (campaignId: string, message: PlayerMessage) => void
  processIncomingMessage: (message: CampaignMessage, playerLanguages: string[]) => void
  markAsRead: (campaignId: string, messageId: string) => void
  markAllAsRead: (campaignId: string) => void
  setPlayerLanguages: (languages: string[]) => void
  showPopup: (message: PlayerMessage) => void
  hidePopup: () => void
  clearMessages: (campaignId: string) => void
  getMessagesForCampaign: (campaignId: string, isDM: boolean) => CampaignMessage[] | PlayerMessage[]
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      sentMessages: {},
      receivedMessages: {},
      playerLanguages: ['Common'],
      unreadCounts: {},
      showMessagePopup: false,
      currentPopupMessage: null,

      addSentMessage: (message) =>
        set((state) => {
          const campaignMessages = state.sentMessages[message.campaignId] || []
          return {
            sentMessages: {
              ...state.sentMessages,
              [message.campaignId]: [message, ...campaignMessages].slice(0, 100),
            },
          }
        }),

      addReceivedMessage: (campaignId, message) =>
        set((state) => {
          const campaignMessages = state.receivedMessages[campaignId] || []
          const unreadCount = (state.unreadCounts[campaignId] || 0) + (message.read ? 0 : 1)
          return {
            receivedMessages: {
              ...state.receivedMessages,
              [campaignId]: [message, ...campaignMessages].slice(0, 100),
            },
            unreadCounts: {
              ...state.unreadCounts,
              [campaignId]: unreadCount,
            },
          }
        }),

      processIncomingMessage: (message, playerLanguages) => {
        const processed = processMessageForPlayer(message, playerLanguages)
        get().addReceivedMessage(message.campaignId, processed)
        // Show popup for new messages
        get().showPopup(processed)
      },

      markAsRead: (campaignId, messageId) =>
        set((state) => {
          const messages = state.receivedMessages[campaignId] || []
          const wasUnread = messages.find((m) => m.id === messageId && !m.read)
          const updatedMessages = messages.map((m) =>
            m.id === messageId ? { ...m, read: true } : m
          )
          return {
            receivedMessages: {
              ...state.receivedMessages,
              [campaignId]: updatedMessages,
            },
            unreadCounts: {
              ...state.unreadCounts,
              [campaignId]: Math.max(0, (state.unreadCounts[campaignId] || 0) - (wasUnread ? 1 : 0)),
            },
          }
        }),

      markAllAsRead: (campaignId) =>
        set((state) => {
          const messages = state.receivedMessages[campaignId] || []
          return {
            receivedMessages: {
              ...state.receivedMessages,
              [campaignId]: messages.map((m) => ({ ...m, read: true })),
            },
            unreadCounts: {
              ...state.unreadCounts,
              [campaignId]: 0,
            },
          }
        }),

      setPlayerLanguages: (languages) =>
        set({ playerLanguages: languages }),

      showPopup: (message) =>
        set({
          showMessagePopup: true,
          currentPopupMessage: message,
        }),

      hidePopup: () =>
        set({
          showMessagePopup: false,
          currentPopupMessage: null,
        }),

      clearMessages: (campaignId) =>
        set((state) => {
          const { [campaignId]: _, ...restSent } = state.sentMessages
          const { [campaignId]: __, ...restReceived } = state.receivedMessages
          const { [campaignId]: ___, ...restUnread } = state.unreadCounts
          return {
            sentMessages: restSent,
            receivedMessages: restReceived,
            unreadCounts: restUnread,
          }
        }),

      getMessagesForCampaign: (campaignId, isDM) => {
        const state = get()
        return isDM
          ? state.sentMessages[campaignId] || []
          : state.receivedMessages[campaignId] || []
      },
    }),
    {
      name: 'dnd-message-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sentMessages: state.sentMessages,
        receivedMessages: state.receivedMessages,
        playerLanguages: state.playerLanguages,
        unreadCounts: state.unreadCounts,
      }),
    }
  )
)
