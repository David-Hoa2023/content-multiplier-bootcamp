'use client'

interface ActionBarProps {
  onSaveDraft?: () => void
  onGenerateDerivatives?: () => void
  onPublish?: () => void
  isLoading?: boolean
  className?: string
}

export default function ActionBar({
  onSaveDraft,
  onGenerateDerivatives,
  onPublish,
  isLoading = false,
  className = '',
}: ActionBarProps) {
  return (
    <div
      className={`sticky bottom-0 z-20 backdrop-blur-sm bg-white/80 shadow-lg border-t border-gray-200 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-end gap-3">
          {/* Save Draft Button */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Lưu bản nháp
          </button>

          {/* Generate Derivatives Button */}
          <button
            type="button"
            onClick={onGenerateDerivatives}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Tạo biến thể
          </button>

          {/* Publish Button - Gradient, Larger, Shadow */}
          <button
            type="button"
            onClick={onPublish}
            disabled={isLoading}
            className="px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            Xuất bản
          </button>
        </div>
      </div>
    </div>
  )
}

