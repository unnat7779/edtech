import { getAuthCookie, verifyToken } from "@/lib/auth-cookies"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export const authenticate = async (request) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = await getAuthCookie()

    if (!token) {
      const authHeader = request.headers.get("authorization")
      token = authHeader?.replace("Bearer ", "")
    }

    if (!token) {
      return { error: "No token provided" }
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return { error: "Invalid token" }
    }

    await connectDB()
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return { error: "User not found" }
    }

    return { user }
  } catch (error) {
    console.error("Authentication error:", error)
    return { error: "Authentication failed" }
  }
}

export const requireAdmin = async (request) => {
  const auth = await authenticate(request)
  if (auth.error) {
    return auth
  }

  if (auth.user.role !== "admin") {
    return { error: "Admin access required" }
  }

  return auth
}
