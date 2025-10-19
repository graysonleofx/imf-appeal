import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="h-[60vh] md:h-[72vh] relative overflow-hidden">
        <Image
          src="/imfc-am2025.jpg"
          alt="IMF style hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-transparent" />
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
              IMF Grant Access — Apply, Track and Manage
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl absolute drop-shadow-lg">
              Access grant resources, submit appeals and receive timely updates on your application status.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#actions" className="inline-block bg-[#cba135] hover:scale-[1.02] transition-all px-6 py-3 rounded-md font-semibold text-slate-800 shadow">
                Get Access
              </a>
              <a href="#contact" className="inline-block border border-white/30 text-white px-5 py-3 rounded-md hover:bg-white/5 transition all">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}