import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 max-w-5xl mx-auto flex flex-col gap-10">
      
      {/* Header Section */}
      <header className="neo-card bg-neo-yellow flex flex-col items-center text-center gap-4 py-16">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
          Hello, I'm 2SeungMini
        </h1>
        <p className="text-xl md:text-2xl font-bold bg-neo-white neo-border px-4 py-2 inline-block transform -rotate-2">
          FRONTEND DEVELOPER & CREATOR
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* About Section */}
        <section className="neo-card bg-neo-blue md:col-span-1 flex flex-col gap-4">
          <h2 className="text-3xl font-black border-b-4 border-black pb-2 mb-2">ABOUT ME</h2>
          <p className="text-lg font-medium leading-relaxed">
            I love building bold, interactive, and functional web experiences.
            My style is straightforward, loud, and impactful. No fluffy designs, just raw performance and aesthetics.
          </p>
        </section>

        {/* Projects Section */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-3xl font-black mb-2 bg-neo-pink neo-border inline-block px-4 py-1 self-start transform rotate-1">
            FEATURED WORK
          </h2>
          
          <div className="neo-card bg-neo-white neo-shadow-hover cursor-pointer group">
            <h3 className="text-2xl font-bold transition-colors">🚀 Project Alpha</h3>
            <p className="mt-2 text-md font-medium">A cutting-edge web application built with Next.js and brutalist design principles.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="bg-neo-green neo-border px-2 py-1 text-sm font-bold">Next.js</span>
              <span className="bg-neo-yellow neo-border px-2 py-1 text-sm font-bold">Tailwind CSS</span>
            </div>
          </div>

          <div className="neo-card bg-neo-white neo-shadow-hover cursor-pointer group">
            <h3 className="text-2xl font-bold transition-colors">⚡ Project Beta</h3>
            <p className="mt-2 text-md font-medium">High-performance dashboard with real-time data analytics.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="bg-neo-purple text-white neo-border px-2 py-1 text-sm font-bold">React</span>
              <span className="bg-neo-blue neo-border px-2 py-1 text-sm font-bold">Node.js</span>
            </div>
          </div>
        </section>
      </div>

      {/* Social Links */}
      <footer className="neo-card bg-neo-green flex flex-col md:flex-row justify-between items-center gap-6 mt-6">
        <h2 className="text-3xl font-black">LET'S CONNECT</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://github.com/2SeungMini" target="_blank" rel="noopener noreferrer" className="neo-btn bg-neo-white text-black text-decoration-none">
            GitHub
          </a>
          <a href="#" className="neo-btn bg-neo-white text-black text-decoration-none">
            LinkedIn
          </a>
          <a href="#" className="neo-btn bg-neo-white text-black text-decoration-none">
            Email Me
          </a>
        </div>
      </footer>

    </div>
  );
}
