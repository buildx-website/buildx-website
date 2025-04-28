export function BuildLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 relative">
          <div className="w-8 h-8 rounded-full border-2 border-t-zinc-200 border-r-zinc-200 border-b-zinc-600 border-l-zinc-600 animate-spin" />
        </div>
        <p className="text-zinc-400 text-sm">Building your application...</p>
      </div>
    </div>
  );
}