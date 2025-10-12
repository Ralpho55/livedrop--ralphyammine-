import { describe, it, expect } from 'vitest'
import { getAssistantResponse } from './engine'

describe('Assistant Engine', () => {
  it('returns correct answer for known question', async () => {
    const result = await getAssistantResponse('What is your return policy?')
    
    expect(result.response).toContain('[Q')
    expect(result.response.toLowerCase()).toContain('return')
  })

  it('refuses unknown questions', async () => {
    const result = await getAssistantResponse('Who is your CEO?')
    
    expect(result.response.toLowerCase()).toContain('sorry')
  })

  it('handles order ID queries correctly', async () => {
    const result = await getAssistantResponse('What is the status of ORDER-1234567890-abc123?')
    
    expect(result.response).toContain('order')
    expect(result.response).toContain('ORDER-1234567890-abc123')
  })
})
