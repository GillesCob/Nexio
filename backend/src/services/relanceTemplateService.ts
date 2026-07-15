import { suggestTemplate } from './templateService'

export async function suggestRelance(userId: string, contactId: string): Promise<string> {
  return suggestTemplate(userId, contactId)
}
