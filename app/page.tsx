"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { profile } from "@/data/profile";
import { addLink, deleteLink, type LinkItem, updateLink } from "@/lib/db";
import { db } from "@/lib/firebase";

type FormMode = "add" | "edit";

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const linksQuery = query(
      collection(db, "users", "anonymous", "links"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      linksQuery,
      (snapshot) => {
        setLinks(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as LinkItem[],
        );
        setLoading(false);
      },
      (error) => {
        console.error("Firestore loading error:", error);
        setErrorMessage("링크를 불러오지 못했습니다.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const formTitle = useMemo(
    () => (formMode === "add" ? "새 링크 추가" : "링크 수정"),
    [formMode],
  );

  function openAddForm() {
    setFormMode("add");
    setEditingId(null);
    setTitle("");
    setUrl("");
    setErrorMessage("");
    setFormOpen((open) => !open || formMode === "edit");
  }

  function openEditForm(link: LinkItem) {
    setFormMode("edit");
    setEditingId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    setErrorMessage("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setTitle("");
    setUrl("");
    setErrorMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !url.trim()) {
      setErrorMessage("제목과 URL을 모두 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (formMode === "edit" && editingId) {
        await updateLink(editingId, title, url);
      } else {
        await addLink(title, url);
      }

      closeForm();
    } catch (error) {
      console.error("Error saving link:", error);
      setErrorMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(link: LinkItem) {
    if (!confirm(`"${link.title}" 링크를 삭제할까요?`)) return;

    try {
      setErrorMessage("");
      await deleteLink(link.id);
      if (editingId === link.id) closeForm();
    } catch (error) {
      console.error("Error deleting link:", error);
      setErrorMessage("삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f8] px-5 py-14 text-[#111827] sm:px-8">
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-center">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-6 grid h-[108px] w-[108px] place-items-center overflow-hidden rounded-full border border-[#d6d9de] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.14)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={`${profile.name} profile`}
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="text-[28px] font-black leading-tight tracking-normal text-[#090d16] sm:text-[32px]">
            {profile.name}
          </h1>
          <p className="mt-2 text-[17px] font-bold text-[#6b7280]">
            {profile.handle}
          </p>
          <p className="mt-4 max-w-[430px] text-[18px] font-medium leading-8 text-[#374151] sm:text-[20px]">
            {profile.role} <span className="mx-2">|</span> {profile.tagline}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="mb-5 h-14 w-full border border-[#1636c5] bg-[#2448e8] text-[19px] font-black text-white shadow-[0_4px_0_#162fb0] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#162fb0] active:translate-y-1 active:shadow-none sm:text-[21px]"
        >
          + 새로운 링크 추가하기
        </button>

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-5 w-full border border-[#dcdfe4] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">{formTitle}</h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-sm font-bold text-[#6b7280] hover:text-[#111827]"
              >
                닫기
              </button>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-[#4b5563]">
                링크 이름
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="구글"
                  className="h-12 border border-[#dcdfe4] bg-[#fbfbfc] px-4 text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8] focus:bg-white"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-[#4b5563]">
                URL
                <input
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://google.com"
                  className="h-12 border border-[#dcdfe4] bg-[#fbfbfc] px-4 text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8] focus:bg-white"
                />
              </label>
            </div>

            {errorMessage && (
              <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 h-12 w-full bg-[#111827] text-base font-black text-white transition hover:bg-[#2448e8] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
            >
              {saving ? "저장 중..." : formMode === "add" ? "추가하기" : "수정 완료"}
            </button>
          </form>
        )}

        <div className="flex w-full flex-col gap-4">
          {loading ? (
            <div className="grid h-[120px] place-items-center border border-[#dcdfe4] bg-white text-lg font-bold text-[#6b7280]">
              링크를 불러오는 중...
            </div>
          ) : links.length === 0 ? (
            <div className="grid min-h-[120px] place-items-center border border-dashed border-[#cfd4dc] bg-white px-6 text-center text-base font-bold leading-7 text-[#6b7280]">
              아직 등록된 링크가 없습니다.
              <br />
              위 버튼으로 첫 링크를 추가해보세요.
            </div>
          ) : (
            links.map((link) => (
              <article
                key={link.id}
                className="group flex min-h-[120px] items-center border border-[#dcdfe4] bg-white px-5 transition hover:border-[#2448e8] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-7"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-6"
                >
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-[#f3f4f6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={link.faviconUrl}
                      alt=""
                      className="h-8 w-8"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://www.google.com/s2/favicons?domain=github.com&sz=64";
                      }}
                    />
                  </span>
                  <span className="truncate text-center text-[18px] font-bold text-[#111827] sm:text-[20px]">
                    {link.title}
                  </span>
                </a>

                <div className="ml-4 flex flex-shrink-0 items-center gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEditForm(link)}
                    className="h-9 px-3 text-sm font-black text-[#2448e8] hover:bg-[#eef2ff]"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(link)}
                    className="h-9 px-3 text-sm font-black text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
