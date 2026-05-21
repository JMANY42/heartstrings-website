const API_BASE_URL = import.meta.env.MODE === 'production'
        ? '/api'
        : 'http://localhost:5003/api';

export type JoinFormData = {
  name: string
  email: string
  instrument: string
  experienceLevel: string
}

export type CollaborateFormData = {
  name: string
  organization: string
  email: string
  message: string
}

type ApiResponse = {
  message: string
  success?: boolean
}

async function handleApiResponse(response: Response): Promise<ApiResponse> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred')
  }

  return data
}

export const api = {
  async submitJoinForm(data: JoinFormData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return handleApiResponse(response)
  },

  async submitCollaborateForm(data: CollaborateFormData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return handleApiResponse(response)
  },
}
