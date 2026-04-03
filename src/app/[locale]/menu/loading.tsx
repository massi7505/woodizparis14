export default function MenuLoading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm" style={{ height: 60 }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-3">
          <div className="w-32 h-8 skeleton" />
          <div className="flex-1 max-w-sm h-9 skeleton" />
          <div className="w-24 h-8 skeleton hidden sm:block" />
        </div>
      </div>
      <div style={{ height: 60 }} className="hidden sm:block" />
      <div style={{ height: 142 }} className="sm:hidden" />

      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Hero skeleton */}
        <div className="pt-4 mb-8">
          <div className="w-full aspect-[4/3] sm:aspect-video md:aspect-[5/2] lg:aspect-[3/1] skeleton rounded-2xl md:rounded-3xl" />
        </div>

        {/* Category tabs skeleton */}
        <div className="flex gap-2 mb-6 overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-shrink-0 w-20 h-10 skeleton rounded-full" />
          ))}
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="w-full aspect-square skeleton rounded-none" />
              <div className="p-3 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
                <div className="h-5 skeleton rounded w-1/3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
