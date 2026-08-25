export default function ErrorBanner({ message = "Không thể tải dữ liệu. Vui lòng thử lại.", onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-red-400">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 min-h-11 px-3 rounded-lg border border-red-500/40 font-semibold hover:bg-red-500/10 transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
