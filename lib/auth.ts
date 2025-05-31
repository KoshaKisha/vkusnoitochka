import jwt from "jsonwebtoken"

export function getEmployeeIdFromToken(token?: string | null): number | null {
  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    return payload.id
  } catch {
    return null
  }
}
