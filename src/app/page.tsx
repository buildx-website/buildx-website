import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";

export default function Home() {
  return (
    <div className="h-[40rem] grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.15] relative overflow-hidden">
      <Spotlight />
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-4 items-center sm:items-start">
          <h1 className="text-5xl font-bold text-center sm:text-left">What do you want to build today?</h1>
          <p className="text-lg text-center mx-auto text-gray-300 sm:text-left max-w-[400px]">Build your MVP withing minutes!</p>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Textarea className="w-full h-40 p-4 text-lg rounded-lg resize-none focus:outline-none m-3 border-8 border-primary-500" placeholder="Write your idea here..."></Textarea>
          <div className="flex justify-end w-full">
            <Button size={'lg'} className="text-lg inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              Create Project
            </Button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}

      