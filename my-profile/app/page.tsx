import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      
      {/* 
        HERO SECTION - 데스크탑에 꽉 차는 풀 랜딩 스타일
        - 데스크탑: 100vh 활용, 거대한 타이포그래피
        - 태블릿: 약간 줄어든 타이포
        - 모바일: 화면에 맞게 조정
      */}
      <section className="w-full min-h-[90vh] flex flex-col justify-center px-4 md:px-12 lg:px-24 py-20 relative overflow-hidden bg-neo-yellow neo-border border-b-8 border-t-0 border-l-0 border-r-0">
        <div className="max-w-[1400px] mx-auto w-full relative z-10">
          <h2 className="text-xl md:text-3xl font-bold mb-4 bg-neo-white neo-border inline-block px-4 py-2 transform -rotate-2">
            PORTFOLIO 2026
          </h2>
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-none mb-8">
            <span className="block">HELLO,</span>
            <span className="block">I'M 2SEUNGMINI</span>
          </h1>
          <p className="text-2xl md:text-4xl font-bold max-w-3xl leading-snug bg-neo-pink text-white neo-border p-4 inline-block transform rotate-1">
            Building unapologetic, bold, and scalable web experiences.
          </p>
        </div>
        
        {/* 장식용 절대 위치 요소 (데스크탑에서 더 잘 보임) */}
        <div className="absolute right-10 bottom-20 hidden lg:block neo-card bg-neo-blue transform rotate-12 neo-shadow-hover">
          <p className="text-4xl font-black">↓ SCROLL</p>
        </div>
      </section>

      {/* 
        MARQUEE BANNER
      */}
      <div className="w-full bg-black text-white py-4 border-b-4 border-black marquee-container flex items-center text-2xl md:text-4xl font-black uppercase tracking-widest overflow-hidden">
        <div className="animate-marquee">
          FRONTEND DEVELOPER & CREATOR ✦ FRONTEND DEVELOPER & CREATOR ✦ FRONTEND DEVELOPER & CREATOR ✦ FRONTEND DEVELOPER & CREATOR ✦&nbsp;
        </div>
        <div className="animate-marquee">
          FRONTEND DEVELOPER & CREATOR ✦ FRONTEND DEVELOPER & CREATOR ✦ FRONTEND DEVELOPER & CREATOR ✦ FRONTEND DEVELOPER & CREATOR ✦&nbsp;
        </div>
      </div>

      {/* 
        MAIN CONTENT GRID (Bento Box Style)
        - 데스크탑: 3열/4열 그리드로 복잡한 랜딩 페이지 레이아웃
        - 태블릿: 2열 그리드
        - 모바일: 1열
      */}
      <section className="w-full max-w-[1600px] px-4 md:px-12 lg:px-24 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* ABOUT ME - 큰 박스로 강조 */}
          <div className="neo-card bg-neo-blue lg:col-span-2 flex flex-col justify-between min-h-[400px]">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase">About Me</h2>
              <p className="text-xl md:text-2xl font-bold leading-relaxed max-w-3xl">
                I don't just write code; I design solutions. I specialize in modern web technologies, performance optimization, and creating interfaces that leave a lasting impression. No fluffy designs, just raw performance and raw aesthetics.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind', 'Node.js'].map(skill => (
                <span key={skill} className="bg-neo-white neo-border px-4 py-2 text-lg font-bold">{skill}</span>
              ))}
            </div>
          </div>

          {/* PROJECT 1 */}
          <div className="neo-card bg-neo-pink neo-shadow-hover cursor-pointer group flex flex-col justify-between min-h-[400px]">
            <div>
              <span className="bg-neo-white text-black font-black px-3 py-1 neo-border text-sm inline-block mb-4">FEATURED 01</span>
              <h3 className="text-4xl lg:text-5xl font-black uppercase mb-4 group-hover:underline">Project Alpha</h3>
              <p className="text-lg font-bold">A cutting-edge web application built with Next.js and brutalist design principles.</p>
            </div>
            <div className="mt-8">
              <div className="w-full h-32 bg-neo-white neo-border flex items-center justify-center font-black text-2xl group-hover:bg-neo-yellow transition-colors">
                [ VIEW PROJECT ]
              </div>
            </div>
          </div>

          {/* PROJECT 2 */}
          <div className="neo-card bg-neo-white neo-shadow-hover cursor-pointer group flex flex-col justify-between min-h-[400px]">
            <div>
              <span className="bg-neo-yellow text-black font-black px-3 py-1 neo-border text-sm inline-block mb-4">FEATURED 02</span>
              <h3 className="text-4xl lg:text-5xl font-black uppercase mb-4 group-hover:text-neo-blue">Project Beta</h3>
              <p className="text-lg font-bold">High-performance dashboard with real-time data analytics and interactive charts.</p>
            </div>
            <div className="mt-8">
              <div className="w-full h-32 bg-neo-blue text-white neo-border flex items-center justify-center font-black text-2xl group-hover:bg-black transition-colors">
                [ VIEW PROJECT ]
              </div>
            </div>
          </div>

          {/* EXTRA CARD (Stats / Fun Fact) */}
          <div className="neo-card bg-neo-green lg:col-span-2 flex flex-col md:flex-row items-center justify-between min-h-[300px] gap-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase max-w-lg leading-none">
              Let's Build Something Crazy
            </h2>
            <a href="#" className="neo-btn bg-neo-white text-3xl py-6 px-10 transform -rotate-3 hover:rotate-0">
              START NOW →
            </a>
          </div>

        </div>
      </section>

      {/* 
        FOOTER / CONTACT 
      */}
      <footer className="w-full bg-black text-white py-24 border-t-8 border-black">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-24 flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
          <div>
            <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase">Let's Connect</h2>
            <p className="text-2xl font-bold text-gray-300">Open for new opportunities and collaborations.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <a href="https://github.com/2SeungMini" target="_blank" rel="noopener noreferrer" className="neo-btn bg-neo-yellow text-black text-2xl md:text-3xl">
              GITHUB
            </a>
            <a href="#" className="neo-btn bg-neo-pink text-black text-2xl md:text-3xl">
              LINKEDIN
            </a>
            <a href="#" className="neo-btn bg-neo-blue text-black text-2xl md:text-3xl">
              EMAIL
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
