export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-primary animate-spin"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-r-8 border-l-8 border-transparent animate-pulse"></div>
      </div>
      <p className="mt-4 text-xl font-medium">جاري التحميل...</p>
    </div>
  )
}

