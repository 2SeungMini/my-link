"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { LinkItem } from "@/lib/db";

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore 실시간 링크 리스트 조회
  useEffect(() => {
    const linksCol = collection(db, "users", "anonymous", "links");
    const q = query(linksCol, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks: LinkItem[] = [];
      snapshot.forEach((doc) => {
        fetchedLinks.push({
          id: doc.id,
          ...doc.data()
        } as LinkItem);
      });
      setLinks(fetchedLinks);
      setLoading(false);
    }, (error) => {
      console.error("Error loading links for home:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#f4f4f0] text-black">
      
      {/* 
        HERO SECTION - 데스크탑에 꽉 차는 풀 랜딩 스타일
      */}
      <section className="w-full min-h-[90vh] flex flex-col justify-center px-4 md:px-12 lg:px-24 py-20 relative overflow-hidden bg-neo-yellow neo-border border-b-8 border-t-0 border-l-0 border-r-0">
        <div className="max-w-[1400px] mx-auto w-full relative z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl md:text-3xl font-bold mb-4 bg-neo-white neo-border inline-block px-4 py-2 transform -rotate-2 text-black">
              PORTFOLIO 2026
            </h2>
            {/* 어드민 바로가기 플로팅 버튼 느낌 */}
            <a href="/admin" className="neo-btn bg-black text-white text-sm md:text-md py-2 px-4 hover:bg-neo-pink hover:text-black">
              ⚙️ 대시보드 바로가기
            </a>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-none mb-8 text-black">
            <span className="block">HELLO,</span>
            <span className="block">I'M 2SEUNGMINI</span>
          </h1>
          <p className="text-2xl md:text-4xl font-bold max-w-3xl leading-snug bg-neo-pink text-white neo-border p-4 inline-block transform rotate-1">
            Building unapologetic, bold, and scalable web experiences.
          </p>
        </div>
        
        {/* 장식용 절대 위치 요소 */}
        <div className="absolute right-10 bottom-20 hidden lg:block neo-card bg-neo-blue transform rotate-12 neo-shadow-hover">
          <p className="text-4xl font-black text-black">↓ SCROLL</p>
        </div>
      </section>
      
      {/* 
        MARQUEE BANNER
      */}
      <div className="w-full bg-black text-white py-4 border-b-4 border-black marquee-container flex items-center text-2xl md:text-4xl font-black uppercase tracking-widest overflow-hidden">
        <div className="animate-marquee">
          MYLINK PORTFOLIO PLATFORM ✦ DYNAMIC FIRESTORE LINKS ✦ NEOBRUTALISM ART ✦ DEVELOPER COMMUNITY ✦&nbsp;
        </div>
        <div className="animate-marquee">
          MYLINK PORTFOLIO PLATFORM ✦ DYNAMIC FIRESTORE LINKS ✦ NEOBRUTALISM ART ✦ DEVELOPER COMMUNITY ✦&nbsp;
        </div>
      </div>

      {/* 
        MAIN CONTENT GRID (Bento Box Style)
      */}
      <section className="w-full max-w-[1600px] px-4 md:px-12 lg:px-24 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* ABOUT ME - 큰 박스로 강조 */}
          <div className="neo-card bg-neo-blue lg:col-span-2 flex flex-col justify-between min-h-[400px]">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase text-black">About Me</h2>
              <p className="text-xl md:text-2xl font-bold leading-relaxed max-w-3xl text-black">
                I don't just write code; I design solutions. I specialize in modern web technologies, performance optimization, and creating interfaces that leave a lasting impression. No fluffy designs, just raw performance and raw aesthetics.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {['JavaScript', 'TypeScript', 'React', 'Next.js', 'Firebase', 'Firestore', 'Tailwind'].map(skill => (
                <span key={skill} className="bg-neo-white neo-border px-4 py-2 text-lg font-bold text-black">{skill}</span>
              ))}
            </div>
          </div>

          {/* DYNAMIC FIRESTORE LINKS - 실시간 마이그레이션된 링크 영역 */}
          <div className="neo-card bg-neo-white neo-shadow-hover lg:col-span-1 flex flex-col justify-between min-h-[400px]">
            <div>
              <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black">
                🔗 My Links
              </h2>
              
              {loading ? (
                <div className="py-12 text-center font-bold text-lg animate-pulse text-black">
                  동기화 중...
                </div>
              ) : links.length === 0 ? (
                <div className="py-12 text-center font-bold text-gray-500">
                  등록된 동적 링크가 없습니다.<br />
                  <a href="/admin" className="text-blue-600 underline hover:text-neo-pink">대시보드</a>에서 링크를 추가해 보세요!
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-4 border-black p-3 bg-neo-yellow neo-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 font-bold group text-black"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={link.faviconUrl}
                        alt="icon"
                        className="w-6 h-6 border-2 border-black p-0.5 bg-white flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=github.com&sz=64";
                        }}
                      />
                      <span className="truncate group-hover:underline">{link.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <a 
                href="/admin" 
                className="w-full text-center neo-btn bg-neo-pink text-black text-lg py-3 block hover:bg-black hover:text-white"
              >
                + 링크 관리/추가하기
              </a>
            </div>
          </div>

          {/* PROJECT 1 (정적 콘텐츠 보조) */}
          <div className="neo-card bg-neo-pink neo-shadow-hover cursor-pointer group flex flex-col justify-between min-h-[400px]">
            <div>
              <span className="bg-neo-white text-black font-black px-3 py-1 neo-border text-sm inline-block mb-4">PROJECT 01</span>
              <h3 className="text-4xl lg:text-5xl font-black uppercase mb-4 group-hover:underline text-black">Project Alpha</h3>
              <p className="text-lg font-bold text-black">A cutting-edge web application built with Next.js and brutalist design principles.</p>
            </div>
            <div className="mt-8">
              <div className="w-full h-32 bg-neo-white neo-border flex items-center justify-center font-black text-2xl group-hover:bg-neo-yellow transition-colors text-black">
                [ VIEW PROJECT ]
              </div>
            </div>
          </div>

          {/* EXTRA CARD (Stats / Fun Fact) */}
          <div className="neo-card bg-neo-green lg:col-span-2 flex flex-col md:flex-row items-center justify-between min-h-[300px] gap-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase max-w-lg leading-none text-black">
              Let's Build Something Crazy
            </h2>
            <a href="/admin" className="neo-btn bg-neo-white text-3xl py-6 px-10 transform -rotate-3 hover:rotate-0 text-black">
              ADD YOUR LINK →
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
