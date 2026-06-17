const STYLES = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
};

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            STYLES[toast.type] || STYLES.success
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => onDismiss(toast.id)} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
