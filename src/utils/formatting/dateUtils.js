export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }

  return new Date(dateString).toLocaleDateString("en-IN", defaultOptions)
}

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export const getTimeRemaining = (endDate) => {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const difference = end - now

  if (difference <= 0) {
    return { expired: true, timeLeft: 0 }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return {
    expired: false,
    timeLeft: difference,
    days,
    hours,
    minutes,
    seconds,
  }
}
