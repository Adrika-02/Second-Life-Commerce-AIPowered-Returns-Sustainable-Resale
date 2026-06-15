import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Page render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto mt-12 bg-white border border-red-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">⚠️</p>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message || 'An unexpected error occurred loading this page.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-sm font-semibold bg-amz-yellow text-amz-text border border-[#FFA41C] px-4 py-2 rounded-full hover:bg-amz-yellow-hover transition-colors"
            >
              Try again
            </button>
            <Link
              to="/"
              className="text-sm font-semibold text-amz-teal hover:underline flex items-center"
            >
              Go home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
