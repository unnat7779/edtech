export default function AutoSaveIndicator({ status }) {
  if (status === "idle") return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {status === "saving" && (
        <div className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          <span className="text-sm">Saving...</span>
        </div>
      )}
      {status === "saved" && (
        <div className="flex items-center bg-green-500 text-white px-3 py-2 rounded-full shadow-lg">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">Saved</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-sm">Save Error</span>
        </div>
      )}
    </div>
  )
}
