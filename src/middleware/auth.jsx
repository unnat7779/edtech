import jwt from "jsonwebtoken"

export async function authenticate(request) {
  try {
    console.log("🔍 Authentication middleware called")

    // Get token from multiple sources
    let token = null

    // 1. Check Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
      console.log("✅ Token found in Authorization header")
    }

    // 2. Check cookies as fallback
    if (!token) {
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=")
          acc[key] = value
          return acc
        }, {})
        token = cookies.token
        if (token) {
          console.log("✅ Token found in cookies")
        }
      }
    }

    if (!token) {
      console.log("❌ No token provided")
      return { error: "No token provided" }
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET environment variable is not set")
      return { error: "Server configuration error" }
    }

    console.log("🔍 Attempting to verify token...")
    console.log("Token length:", token.length)
    console.log("JWT_SECRET length:", process.env.JWT_SECRET.length)

    // Verify token with explicit algorithm
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    })

    console.log("✅ Token verified successfully")
    console.log("Decoded payload:", {
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      email: decoded.email,
      exp: new Date(decoded.exp * 1000).toISOString(),
    })

    return {
      success: true,
      user: {
        id: decoded.userId || decoded.id,
        _id: decoded.userId || decoded.id,
        role: decoded.role || "student",
        email: decoded.email,
        name: decoded.name,
        ...decoded,
      },
    }
  } catch (error) {
    console.error("❌ Authentication error:", error.message)
    console.error("Error type:", error.name)

    if (error.name === "TokenExpiredError") {
      return { error: "Token expired" }
    }
    if (error.name === "JsonWebTokenError") {
      return { error: "Invalid token" }
    }
    if (error.name === "NotBeforeError") {
      return { error: "Token not active" }
    }

    return { error: "Authentication failed" }
  }
}

export async function verifyToken(request) {
  return authenticate(request)
}

// Default export for compatibility
export default {
  authenticate,
  verifyToken,
}
