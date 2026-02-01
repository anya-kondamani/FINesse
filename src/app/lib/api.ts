import type { FinancialData } from '../types'

type UploadResponse =
  | { success: true; data: FinancialData }
  | { success: false; error: string }

type GenerateAnswerResponse =
  | { success: true; answer: string }
  | { success: false; error: string }

type QueryResponse =
  | { success: true; response: string }
  | { success: false; error: string }

export async function upload10k(file: File): Promise<FinancialData> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const json = (await res.json()) as UploadResponse

  if (!res.ok || !json.success) {
    throw new Error(!json.success ? json.error : 'Upload failed')
  }
  return json.data
}

export async function generateAnswer(params: {
  company_id: string
  question: string
  context?: string
}): Promise<string> {
  const res = await fetch('/api/generate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const json = (await res.json()) as GenerateAnswerResponse

  if (!res.ok || !json.success) {
    throw new Error(!json.success ? json.error : 'Answer generation failed')
  }
  return json.answer
}

export async function queryDoc(params: {
  company_id: string
  query: string
}): Promise<string> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const json = (await res.json()) as QueryResponse

  if (!res.ok || !json.success) {
    throw new Error(!json.success ? json.error : 'Query failed')
  }
  return json.response
}