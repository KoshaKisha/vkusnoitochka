import { NextResponse } from "next/server"
import { getEmployeeIdFromToken } from "@/lib/auth"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]
  const id = getEmployeeIdFromToken(token)

  if (!id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  return NextResponse.json({ id })
}
