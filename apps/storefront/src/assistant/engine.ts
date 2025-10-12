import groundTruth from './ground-truth.json'
import { getOrderStatus } from '../lib/api'

interface QAEntry {
  qid: number
  category: string
  question: string
  answer: string
}

interface AssistantResponse {
  response: string
  citation?: string
  confidence?: number
}

// Extract keywords from text (remove common words and convert to lowercase)
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'i', 'you', 'my', 'your', 'me', 'we',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'or',
    'and', 'but', 'if', 'so', 'what', 'how', 'when', 'where', 'why', 'who'
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
}

// Calculate keyword overlap score between input and Q&A
// Questions are weighted at 80%, answers at 20%
function calculateScore(inputKeywords: string[], qaEntry: QAEntry): number {
  const questionKeywords = extractKeywords(qaEntry.question)
  const answerKeywords = extractKeywords(qaEntry.answer)

  if (inputKeywords.length === 0) return 0

  // Count exact matches in question (weighted 80%)
  const questionMatches = inputKeywords.filter(keyword => 
    questionKeywords.includes(keyword)
  ).length

  // Count exact matches in answer (weighted 20%)
  const answerMatches = inputKeywords.filter(keyword => 
    answerKeywords.includes(keyword)
  ).length

  // Calculate weighted score
  const questionScore = (questionMatches / inputKeywords.length) * 0.8
  const answerScore = (answerMatches / inputKeywords.length) * 0.2

  return questionScore + answerScore
}

// Detect order ID pattern (ORDER-timestamp-randomstring)
function detectOrderId(input: string): string | null {
  const orderIdPattern = /ORDER-\d+-[a-z0-9]+/i
  const match = input.match(orderIdPattern)
  return match ? match[0] : null
}

export async function getAssistantResponse(input: string): Promise<AssistantResponse> {
  // Check for order ID in input
  const orderId = detectOrderId(input)
  if (orderId) {
    try {
      const orderStatus = await getOrderStatus(orderId)
      
      let response = `Your order ${orderId} is currently: **${orderStatus.status}**.\n\n`
      
      if (orderStatus.status.toLowerCase() === 'shipped' || orderStatus.status.toLowerCase() === 'delivered') {
        response += `**Carrier:** ${orderStatus.carrier}\n`
        response += `**${orderStatus.status.toLowerCase() === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}:** ${orderStatus.eta}`
      } else {
        response += 'Your order is being processed. You will receive tracking information once it ships.'
      }
      
      return { response }
    } catch (error) {
      return {
        response: `I couldn't find information for order ${orderId}. Please verify the order ID is correct or contact customer support.`
      }
    }
  }

  // Extract keywords from user input
  const inputKeywords = extractKeywords(input)

  if (inputKeywords.length === 0) {
    return {
      response: "I'm here to help! Could you please provide more details about what you need assistance with?"
    }
  }

  // Score all Q&A entries
  const scoredEntries = (groundTruth as QAEntry[]).map(qa => ({
    qa,
    score: calculateScore(inputKeywords, qa)
  }))

  // Sort by score descending
  scoredEntries.sort((a, b) => b.score - a.score)

  const bestMatch = scoredEntries[0]
  const minConfidence = 0.4

  // Return best answer if confidence threshold is met
  if (bestMatch && bestMatch.score >= minConfidence) {
    return {
      response: `${bestMatch.qa.answer}\n\n[Q${bestMatch.qa.qid}]`,
      citation: `Q${bestMatch.qa.qid}`,
      confidence: bestMatch.score
    }
  }

  // Politely refuse if no good match found
  return {
    response: "Sorry, I don't have information on that. Please contact support at support@storefront.com or call 1-800-555-0123 (Mon-Fri 9am-6pm EST).",
    confidence: bestMatch?.score || 0
  }

}


