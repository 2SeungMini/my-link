"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { profile as defaultProfile } from "@/data/profile";
import {
  findProfileByRoute,
  recordLinkClick,
  type LinkItem,
  type UserProfile,
} from "@/lib/db";
import { db } from "@/lib/firebase";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const routeKey = params.username;
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPublicProfile() {
      try {
        setLoading(true);
        setNotFound(false);
        setErrorMessage("");

        const found = await findProfileByRoute(routeKey);
        if (!found) {
          if (!ignore) {
            setUserId("");
            setProfile(null);
            setLinks([]);
            setNotFound(true);
          }
          return;
        }

        const linksSnapshot = await getDocs(
          query(
            collection(db, "users", found.userId, "links"),
            orderBy("createdAt", "desc"),
          ),
        );
        const nextLinks = linksSnapshot.docs.map((linkDoc) => ({
          id: linkDoc.id,
          ...linkDoc.data(),
        })) as LinkItem[];

        if (!ignore) {
          setUserId(found.userId);
          setProfile(found.profile);
          setLinks(nextLinks);
        }
      } catch (error) {
        console.error("Public profile loading error:", error);
        if (!ignore) {
          setErrorMessage("페이지를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadPublicProfile();

    return () => {
      ignore = true;
    };
  }, [routeKey]);

  function handleLinkClick(linkId: string) {
    if (!userId) return;

    void recordLinkClick(userId, linkId).catch((error) => {
      console.error("Link click count error:", error);
    });
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f8] px-5 text-[#111827]">
        <p className="text-lg font-black text-[#6b7280]">페이지를 불러오는 중...</p>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f8] px-5 text-center text-[#111827]">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#2448e8]">
            404
          </p>
          <h1 className="mt-3 text-3xl font-black">페이지를 찾을 수 없습니다.</h1>
          <p className="mt-4 text-base font-semibold text-[#6b7280]">
            프로필 링크가 바뀌었거나 아직 생성되지 않은 페이지입니다.
          </p>
        </section>
      </main>
    );
  }

  const avatarUrl = profile.photoURL || defaultProfile.avatarUrl;

  return (
    <main className="min-h-screen bg-[#f7f8f8] px-5 py-12 text-[#111827] sm:px-8">
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-center">
        <div className="mb-8 flex w-full flex-col items-center text-center">
          <div className="mb-6 grid h-[108px] w-[108px] place-items-center overflow-hidden rounded-full border border-[#d6d9de] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.14)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={`${profile.displayName} profile`}
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="text-[28px] font-black leading-tight tracking-normal text-[#090d16] sm:text-[32px]">
            {profile.displayName}
          </h1>
          <p className="mt-2 text-[17px] font-bold text-[#6b7280]">
            @{profile.routeKey}
          </p>
          <p className="mt-4 max-w-[520px] text-center text-[18px] font-medium leading-8 text-[#374151] sm:text-[20px]">
            {profile.bio || "한 줄 자기소개를 입력해주세요."}
          </p>
        </div>

        {errorMessage && (
          <p className="mb-5 w-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex w-full flex-col gap-4">
          {links.length === 0 ? (
            <div className="grid min-h-[120px] place-items-center border border-dashed border-[#cfd4dc] bg-white px-6 text-center text-base font-bold leading-7 text-[#6b7280]">
              아직 공개된 링크가 없습니다.
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                className="flex min-h-[120px] items-center gap-6 border border-[#dcdfe4] bg-white px-5 py-5 transition hover:border-[#2448e8] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-7"
              >
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-[#f3f4f6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={link.faviconUrl} alt="" className="h-8 w-8" />
                </span>
                <span className="block min-w-0 truncate text-[18px] font-bold text-[#111827] sm:text-[20px]">
                  {link.title}
                </span>
              </a>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
