"use client"

export default function SubmitConfirmationModal({ isOpen, isSubmitting, onConfirm, onCancel }) {
  if (!isOpen) return null

  const handleCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("🚫 Cancel button clicked")
    if (!isSubmitting) {
      onCancel()
    }
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("✅ Confirm button clicked")
    if (!isSubmitting) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full rounded-2xl p-8 border border-slate-700/50 shadow-2xl animate-scale-in">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 glow-accent">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gradient-primary mb-3">Submit Test?</h3>

          {/* Description */}
          <p className="text-slate-400 mb-8 leading-relaxed">
            Are you sure you want to submit your test? Once submitted, you won't be able to make any changes to your
            answers.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={`
                flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform
                ${
                  isSubmitting
                    ? "bg-slate-600 cursor-not-allowed opacity-50 text-slate-400"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-200 hover:scale-105 active:scale-95"
                }
              `}
            >
              Cancel
            </button>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`
                flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform
                ${
                  isSubmitting
                    ? "bg-slate-600 cursor-not-allowed opacity-50 text-slate-400"
                    : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white hover:scale-105 active:scale-95 glow-accent"
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Test"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
