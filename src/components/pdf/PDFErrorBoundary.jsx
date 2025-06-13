"use client"

import React from "react"
import { AlertTriangle, RefreshCw, FileText } from "lucide-react"
import Button from "@/components/ui/Button"

class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // Log error to console for debugging
    console.error("PDF Processing Error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Processing Error</h2>

              <p className="text-gray-600 mb-6">
                An unexpected error occurred while processing your PDF. This might be due to:
              </p>

              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Corrupted or unsupported PDF format</li>
                  <li>• Browser compatibility issues with PDF processing</li>
                  <li>• Insufficient memory for large PDF files</li>
                  <li>• Network connectivity problems</li>
                </ul>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button onClick={this.handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button onClick={() => window.location.reload()} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Use Manual Mode
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                If the problem persists, try using the manual question entry mode or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default PDFErrorBoundary
