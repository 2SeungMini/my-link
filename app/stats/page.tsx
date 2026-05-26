"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@base-ui/react/button";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { ensureUserProfile, type LinkItem } from "@/lib/db";
import { auth, db } from "@/lib/firebase";

export default function StatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setLinks([]);
      setErrorMessage("");
      setLoading(Boolean(currentUser));

      if (currentUser) {
        void ensureUserProfile(currentUser.uid, {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        }).catch((error) => {
          console.error("User profile setup error:", error);
          setErrorMessage("프로필 정보를 확인하지 못했습니다.");
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const linksQuery = query(
      collection(db, "users", user.uid, "links"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      linksQuery,
      (snapshot) => {
        setLinks(
          snapshot.docs.map((linkDoc) => ({
            id: linkDoc.id,
            ...linkDoc.data(),
          })) as LinkItem[],
        );
        setLoading(false);
      },
      (error) => {
        console.error("Stats loading error:", error);
        setErrorMessage("통계를 불러오지 못했습니다.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const rankedLinks = [...links].sort(
      (first, second) => (second.clickCount ?? 0) - (first.clickCount ?? 0),
    );
    const totalClickCount = rankedLinks.reduce(
      (total, link) => total + (link.clickCount ?? 0),
      0,
    );
    const maxClickCount = Math.max(
      1,
      ...rankedLinks.map((link) => link.clickCount ?? 0),
    );
    const topLink = rankedLinks[0] ?? null;
    const activeLinks = rankedLinks.filter((link) => (link.clickCount ?? 0) > 0);

    return { activeLinks, maxClickCount, rankedLinks, topLink, totalClickCount };
  }, [links]);

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f8] px-5 text-[#111827]">
        <p className="text-lg font-black text-[#6b7280]">통계 준비 중...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f8] px-5 text-center text-[#111827]">
        <section>
          <h1 className="text-3xl font-black">로그인이 필요합니다.</h1>
          <p className="mt-3 text-base font-semibold text-[#6b7280]">
            내 링크 통계는 로그인 후 확인할 수 있습니다.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center border border-[#1636c5] bg-[#2448e8] px-6 font-black text-white shadow-[0_4px_0_#162fb0] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#162fb0]"
          >
            홈으로
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f8] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex w-full max-w-[1120px] items-start justify-between gap-4 px-5 py-9 sm:px-8 sm:py-12">
          <div>
            <Link
              href="/"
              className="text-lg font-black text-[#6b7280] transition hover:text-[#1557ff]"
            >
              MyLink
            </Link>
            <h1 className="mt-6 text-[34px] font-black leading-tight text-[#1557ff] sm:text-[46px]">
              통계 대시보드
            </h1>
            <p className="mt-4 text-base font-semibold text-[#6b7280] sm:text-lg">
              링크들의 성과를 한눈에 확인하세요.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="h-11 flex-shrink-0 border border-[#dcdfe4] bg-white px-4 text-sm font-black text-[#4b5563] transition hover:bg-[#f3f4f6]"
          >
            마이페이지
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1120px] gap-6 px-5 py-8 sm:px-8 sm:py-10">
        {errorMessage && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="border border-[#dcdfe4] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#6b7280]">총 클릭수</p>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef4ff] text-lg">
                *
              </span>
            </div>
            <p className="mt-8 text-[32px] font-black leading-none text-[#111827]">
              {stats.totalClickCount.toLocaleString("ko-KR")}
            </p>
            <p className="mt-3 text-sm font-bold text-[#9ca3af]">
              전체 링크 누적 클릭
            </p>
          </article>

          <article className="border border-[#dcdfe4] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#6b7280]">
                가장 인기 있는 링크
              </p>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff7e8] text-lg">
                #
              </span>
            </div>
            <p className="mt-8 truncate text-[26px] font-black leading-tight text-[#111827]">
              {stats.topLink?.title || "-"}
            </p>
            <p className="mt-3 text-sm font-bold text-[#9ca3af]">
              {(stats.topLink?.clickCount ?? 0).toLocaleString("ko-KR")} 클릭
            </p>
          </article>

          <article className="border border-[#dcdfe4] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#6b7280]">활성 링크 수</p>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eafff4] text-lg">
                +
              </span>
            </div>
            <p className="mt-8 text-[32px] font-black leading-none text-[#111827]">
              {stats.activeLinks.length.toLocaleString("ko-KR")}
            </p>
            <p className="mt-3 text-sm font-bold text-[#9ca3af]">
              클릭이 발생한 링크
            </p>
          </article>
        </section>

        <section className="border border-[#dcdfe4] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-black">링크별 클릭 분석</h2>
              <p className="mt-2 text-sm font-bold text-[#6b7280]">
                어떤 링크가 가장 많은 관심을 받고 있는지 확인해보세요.
              </p>
            </div>
            <span className="text-sm font-black text-[#6b7280]">
              {links.length}개 링크
            </span>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="border border-dashed border-[#cfd4dc] bg-[#fbfbfc] px-4 py-12 text-center text-sm font-bold text-[#6b7280]">
                통계를 불러오는 중...
              </div>
            ) : stats.rankedLinks.length === 0 ? (
              <div className="border border-dashed border-[#cfd4dc] bg-[#fbfbfc] px-4 py-12 text-center text-sm font-bold text-[#6b7280]">
                아직 집계할 링크가 없습니다.
              </div>
            ) : (
              <div className="grid gap-7">
                <div className="flex h-[280px] items-end gap-4 overflow-x-auto border-b border-l border-[#e5e7eb] px-4 pb-0 pt-8">
                  {stats.rankedLinks.slice(0, 8).map((link) => {
                    const clickCount = link.clickCount ?? 0;
                    const height = Math.max(
                      10,
                      Math.round((clickCount / stats.maxClickCount) * 220),
                    );

                    return (
                      <div
                        key={link.id}
                        className="flex min-w-[88px] flex-1 flex-col items-center justify-end gap-3"
                      >
                        <span className="text-xs font-black text-[#6b7280]">
                          {clickCount.toLocaleString("ko-KR")}
                        </span>
                        <div
                          className="w-full max-w-[72px] rounded-t-md bg-[#8fa0b8]"
                          style={{ height }}
                        />
                        <span className="w-full truncate text-center text-xs font-bold text-[#6b7280]">
                          {link.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3">
                  {stats.rankedLinks.map((link, index) => {
                    const clickCount = link.clickCount ?? 0;
                    const percentage = Math.max(
                      4,
                      Math.round((clickCount / stats.maxClickCount) * 100),
                    );

                    return (
                      <article
                        key={link.id}
                        className="border border-[#e5e7eb] bg-[#fbfbfc] p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-8 w-8 flex-shrink-0 place-items-center bg-[#111827] text-xs font-black text-white">
                              {index + 1}
                            </span>
                            <span className="truncate text-sm font-black text-[#111827] sm:text-base">
                              {link.title}
                            </span>
                          </div>
                          <span className="flex-shrink-0 text-sm font-black text-[#2448e8] sm:text-base">
                            {clickCount.toLocaleString("ko-KR")} 클릭
                          </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden bg-[#e5e7eb]">
                          <div
                            className="h-full bg-[#2448e8]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
