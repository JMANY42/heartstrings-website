// VITE_DEV_API_URL lets scripts/test-worktree.sh point a worktree's frontend at
// the backend it started on another port. Unset in a normal `npm run dev`.
const API_BASE_URL = import.meta.env.MODE === 'production'
        ? '/api'
        : (import.meta.env.VITE_DEV_API_URL ?? 'http://localhost:5003/api');

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
  /** The GroupMe invite link is served by the backend rather than written
      into the bundle, so scrapers reading the page source never see it. */
  async getGroupMeLink(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/join/groupme`)
    const data = await response.json()

    if (!response.ok || typeof data.url !== 'string') {
      throw new Error(data.message || 'Could not load the GroupMe link.')
    }

    return data.url
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
