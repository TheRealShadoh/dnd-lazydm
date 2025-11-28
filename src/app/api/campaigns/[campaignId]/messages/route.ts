import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-options'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import {
  CampaignMessage,
  MessageRecipient,
  processMessageForPlayer,
  PlayerLanguageProfile,
} from '@/types/messaging'

// Get path to messages file
function getMessagesPath(campaignId: string): string {
  return path.join(process.cwd(), 'data', 'campaigns', campaignId, 'messages.json')
}

// Get path to player languages file
function getPlayerLanguagesPath(campaignId: string): string {
  return path.join(process.cwd(), 'data', 'campaigns', campaignId, 'player-languages.json')
}

// Ensure data directory exists
async function ensureDataDir(campaignId: string): Promise<void> {
  const dir = path.join(process.cwd(), 'data', 'campaigns', campaignId)
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // Directory may already exist
  }
}

// Load messages
async function loadMessages(campaignId: string): Promise<CampaignMessage[]> {
  try {
    const content = await fs.readFile(getMessagesPath(campaignId), 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

// Save messages
async function saveMessages(campaignId: string, messages: CampaignMessage[]): Promise<void> {
  await ensureDataDir(campaignId)
  await fs.writeFile(getMessagesPath(campaignId), JSON.stringify(messages, null, 2))
}

// Load player languages
async function loadPlayerLanguages(campaignId: string): Promise<PlayerLanguageProfile[]> {
  try {
    const content = await fs.readFile(getPlayerLanguagesPath(campaignId), 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

// Check if user is DM for campaign
async function isDMForCampaign(campaignId: string, userId: string): Promise<boolean> {
  try {
    const metadataPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'campaign.json'
    )
    const content = await fs.readFile(metadataPath, 'utf-8')
    const campaign = JSON.parse(content)
    return (
      campaign.access?.ownerId === userId ||
      campaign.access?.dmIds?.includes(userId)
    )
  } catch {
    return false
  }
}

// GET - Retrieve messages for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await params
    const isDM = await isDMForCampaign(campaignId, session.user.id)

    const messages = await loadMessages(campaignId)

    if (isDM) {
      // DM sees all messages with original text
      return NextResponse.json({
        messages,
        isDM: true,
      })
    }

    // Player sees processed messages based on their languages
    const playerLanguages = await loadPlayerLanguages(campaignId)
    const playerProfile = playerLanguages.find((p) => p.playerId === session.user.id)
    const languages = playerProfile?.languages || ['Common']

    // Filter messages for this player
    const playerMessages = messages
      .filter((msg) => {
        if (msg.recipients.type === 'all') return true
        if (msg.recipients.type === 'player') {
          return msg.recipients.playerId === session.user.id
        }
        if (msg.recipients.type === 'players') {
          return msg.recipients.playerIds.includes(session.user.id)
        }
        return false
      })
      .map((msg) => processMessageForPlayer(msg, languages))

    return NextResponse.json({
      messages: playerMessages,
      isDM: false,
      languages,
    })
  } catch (error) {
    console.error('Error loading messages:', error)
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    )
  }
}

// POST - Send a new message (DM only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await params
    const isDM = await isDMForCampaign(campaignId, session.user.id)

    if (!isDM) {
      return NextResponse.json(
        { error: 'Only the DM can send messages' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { recipients, language, message: messageText } = body

    if (!recipients || !language || !messageText) {
      return NextResponse.json(
        { error: 'Missing required fields: recipients, language, message' },
        { status: 400 }
      )
    }

    // Create the message
    const newMessage: CampaignMessage = {
      id: randomUUID(),
      campaignId,
      senderId: session.user.id,
      senderName: session.user.name || 'DM',
      recipients: recipients as MessageRecipient,
      language,
      originalText: messageText,
      timestamp: new Date().toISOString(),
      read: {},
    }

    // Load existing messages and add new one
    const messages = await loadMessages(campaignId)
    messages.unshift(newMessage)

    // Keep only last 500 messages
    const trimmedMessages = messages.slice(0, 500)
    await saveMessages(campaignId, trimmedMessages)

    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// DELETE - Clear messages (DM only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await params
    const isDM = await isDMForCampaign(campaignId, session.user.id)

    if (!isDM) {
      return NextResponse.json(
        { error: 'Only the DM can clear messages' },
        { status: 403 }
      )
    }

    await saveMessages(campaignId, [])

    return NextResponse.json({
      success: true,
      message: 'Messages cleared',
    })
  } catch (error) {
    console.error('Error clearing messages:', error)
    return NextResponse.json(
      { error: 'Failed to clear messages' },
      { status: 500 }
    )
  }
}
