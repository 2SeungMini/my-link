"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { addLink, updateLink, deleteLink, LinkItem } from "@/lib/db";

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  
  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Firestore 실시간 데이터 리스너 연동
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
      console.error("Firestore loading error:", error);
      setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 링크 추가 제출 핸들러
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setErrorMessage("제목과 URL을 모두 입력해 주세요.");
      return;
    }
    try {
      setErrorMessage("");
      await addLink(title, url);
      setTitle("");
      setUrl("");
    } catch (error) {
      console.error("Error adding link:", error);
      setErrorMessage("링크를 추가하는 데 실패했습니다.");
    }
  };

  // 링크 수정 모드 진입
  const startEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  // 링크 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  // 링크 수정 저장 제출 핸들러
  const handleEditSubmit = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      setErrorMessage("수정할 제목과 URL을 입력해 주세요.");
      return;
    }
    try {
      setErrorMessage("");
      await updateLink(id, editTitle, editUrl);
      setEditingId(null);
      setEditTitle("");
      setEditUrl("");
    } catch (error) {
      console.error("Error updating link:", error);
      setErrorMessage("링크를 수정하는 데 실패했습니다.");
    }
  };

  // 링크 삭제 처리 핸들러
  const handleDeleteClick = async (id: string) => {
    if (confirm("정말 이 링크를 삭제하시겠습니까?")) {
      try {
        setErrorMessage("");
        await deleteLink(id);
      } catch (error) {
        console.error("Error deleting link:", error);
        setErrorMessage("링크를 삭제하는 데 실패했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 bg-[#f4f4f0]">
      {/* HEADER */}
      <header className="w-full max-w-4xl flex justify-between items-center py-6 border-b-4 border-black mb-10">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight bg-neo-yellow neo-border px-4 py-2 transform -rotate-1">
          ✨ MyLink Admin
        </h1>
        <a href="/" className="neo-btn bg-neo-white text-md font-bold px-4 py-2">
          방문자 뷰 보기 →
        </a>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 링크 추가 / 수정 폼 */}
        <section className="flex flex-col gap-6">
          <div className="neo-card bg-neo-blue flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase mb-4">
                {editingId ? "✏️ 링크 수정하기" : "➕ 새 링크 추가하기"}
              </h2>
              {errorMessage && (
                <div className="bg-red-200 border-2 border-red-600 p-2 mb-4 font-bold text-red-800 text-sm">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={editingId ? (e) => { e.preventDefault(); handleEditSubmit(editingId); } : handleAddSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-sm">링크 제목 (Title)</label>
                  <input
                    type="text"
                    value={editingId ? editTitle : title}
                    onChange={(e) => editingId ? setEditTitle(e.target.value) : setTitle(e.target.value)}
                    placeholder="예: 내 기술 블로그"
                    className="border-2 border-black p-3 bg-white font-bold neo-shadow-sm focus:outline-none text-black"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-sm">연결할 URL</label>
                  <input
                    type="text"
                    value={editingId ? editUrl : url}
                    onChange={(e) => editingId ? setEditUrl(e.target.value) : setUrl(e.target.value)}
                    placeholder="예: https://blog.example.com"
                    className="border-2 border-black p-3 bg-white font-bold neo-shadow-sm focus:outline-none text-black"
                    required
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button type="submit" className="neo-btn bg-neo-yellow w-full text-lg text-black">
                    {editingId ? "수정 완료" : "링크 추가하기"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="neo-btn bg-neo-white text-lg text-black">
                      취소
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* 내 링크 목록 */}
        <section className="flex flex-col gap-6">
          <div className="neo-card bg-neo-white flex flex-col min-h-[450px]">
            <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black">
              🔗 내 링크 목록 ({links.length})
            </h2>

            {loading ? (
              <div className="flex flex-grow items-center justify-center font-bold text-lg text-black">
                불러오는 중...
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-grow items-center justify-center text-center p-8 border-4 border-dashed border-black font-bold text-black">
                아직 등록된 링크가 없습니다.<br />왼쪽 폼에서 첫 번째 링크를 추가해보세요!
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
                {links.map((link) => (
                  <div key={link.id} className="border-4 border-black p-4 bg-white neo-shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* 파비콘 아이콘 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={link.faviconUrl} 
                        alt="favicon" 
                        className="w-8 h-8 border-2 border-black p-1 bg-white flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=github.com&sz=64";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-black text-lg truncate leading-tight text-black">{link.title}</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 truncate hover:underline block">
                          {link.url}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => startEdit(link)} 
                        className="border-2 border-black bg-neo-green font-bold text-xs p-2 hover:bg-black hover:text-white transition-colors text-black"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(link.id)} 
                        className="border-2 border-black bg-neo-pink font-bold text-xs p-2 hover:bg-black hover:text-white transition-colors text-black"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <footer className="mt-20 font-bold text-sm text-black">
        Powered by MyLink © 2026
      </footer>
    </div>
  );
}
