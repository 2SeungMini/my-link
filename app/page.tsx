"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { profile as defaultProfile } from "@/data/profile";
import {
  addLink,
  deleteLink,
  ensureUserProfile,
  getProfileDocRef,
  getProfileRouteKey,
  recordLinkClick,
  type LinkItem,
  type UserProfile,
  updateDisplayName,
  updateLink,
  updateUserBio,
} from "@/lib/db";
import { auth, db } from "@/lib/firebase";

type TimestampLike = {
  toDate: () => Date;
};

function formatUpdatedAt(value: unknown) {
  if (!value) return null;

  const date =
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as TimestampLike).toDate === "function"
      ? (value as TimestampLike).toDate()
      : value instanceof Date
        ? value
        : null;

  if (!date) return null;

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getFallbackDisplayName(user: User) {
  return user.displayName || user.email?.split("@")[0] || "사용자";
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [bioEditing, setBioEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LinkItem | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayName =
    userProfile?.displayName || (user ? getFallbackDisplayName(user) : "");
  const routeKey =
    userProfile?.routeKey || (user ? getProfileRouteKey(displayName, user.uid) : "");
  const handle = routeKey ? `@${routeKey}` : "";
  const avatarUrl = userProfile?.photoURL || user?.photoURL || defaultProfile.avatarUrl;
  const visibleBio = userProfile?.bio || "한 줄 자기소개를 입력해주세요.";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setAddFormOpen(false);
      setEditingId(null);
      setDeleteTarget(null);
      setErrorMessage("");
      setStatusMessage("");
      setNameEditing(false);
      setNameDraft("");
      setBioEditing(false);
      setBioDraft("");
      setUserProfile(null);
      setLinks([]);
      setLoading(Boolean(currentUser));

      if (currentUser) {
        void ensureUserProfile(currentUser.uid, {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        }).catch((error) => {
          console.error("User profile setup error:", error);
          setErrorMessage(
            "공개 페이지 연결 정보를 만들지 못했습니다. Firestore Rules를 확인해주세요.",
          );
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      getProfileDocRef(user.uid),
      (snapshot) => {
        setUserProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
      },
      (error) => {
        console.error("User profile loading error:", error);
        setErrorMessage("프로필 정보를 불러오지 못했습니다.");
      },
    );

    return () => unsubscribe();
  }, [user]);

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
        console.error("Firestore loading error:", error);
        setErrorMessage("링크를 불러오지 못했습니다.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  async function handleGoogleLogin() {
    try {
      setErrorMessage("");
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("Google 로그인에 실패했습니다.");
    }
  }

  async function handleLogout() {
    try {
      setErrorMessage("");
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      setErrorMessage("로그아웃에 실패했습니다.");
    }
  }

  async function copyMyPageLink() {
    if (!routeKey) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${encodeURIComponent(routeKey)}`,
      );
      setErrorMessage("");
      setStatusMessage("내 페이지 링크를 복사했습니다.");
    } catch (error) {
      console.error("Copy link error:", error);
      setStatusMessage("");
      setErrorMessage("링크 복사에 실패했습니다.");
    }
  }

  function startBioEdit() {
    setBioDraft(userProfile?.bio || "");
    setBioEditing(true);
    setErrorMessage("");
    setStatusMessage("");
  }

  function startNameEdit() {
    setNameDraft(displayName);
    setNameEditing(true);
    setErrorMessage("");
    setStatusMessage("");
  }

  function cancelNameEdit() {
    setNameEditing(false);
    setNameDraft("");
    setErrorMessage("");
  }

  async function saveName() {
    if (!user) return;

    try {
      setNameSaving(true);
      setErrorMessage("");
      setStatusMessage("");
      await updateDisplayName(user.uid, nameDraft);
      setNameEditing(false);
      setStatusMessage("이름을 저장했습니다.");
    } catch (error) {
      console.error("Display name save error:", error);
      setErrorMessage("이름을 저장하지 못했습니다.");
    } finally {
      setNameSaving(false);
    }
  }

  function cancelBioEdit() {
    setBioEditing(false);
    setBioDraft("");
    setErrorMessage("");
  }

  async function saveBio() {
    if (!user) return;

    try {
      setBioSaving(true);
      setErrorMessage("");
      setStatusMessage("");
      await updateUserBio(user.uid, bioDraft);
      setBioEditing(false);
      setStatusMessage("자기소개를 저장했습니다.");
    } catch (error) {
      console.error("Bio save error:", error);
      setErrorMessage("자기소개를 저장하지 못했습니다.");
    } finally {
      setBioSaving(false);
    }
  }

  function toggleAddForm() {
    setAddFormOpen((open) => !open);
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
    setErrorMessage("");
    setStatusMessage("");
  }

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    if (!newTitle.trim() || !newUrl.trim()) {
      setErrorMessage("제목과 주소를 모두 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setStatusMessage("");
      await addLink(user.uid, newTitle, newUrl);
      setNewTitle("");
      setNewUrl("");
      setAddFormOpen(false);
    } catch (error) {
      console.error("Error adding link:", error);
      setErrorMessage("링크를 추가하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function startInlineEdit(link: LinkItem) {
    setAddFormOpen(false);
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setErrorMessage("");
    setStatusMessage("");
  }

  function cancelInlineEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
    setErrorMessage("");
  }

  async function saveInlineEdit(id: string) {
    if (!user) return;

    if (!editTitle.trim() || !editUrl.trim()) {
      setErrorMessage("수정할 제목과 주소를 모두 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setStatusMessage("");
      await updateLink(user.uid, id, editTitle, editUrl);
      cancelInlineEdit();
    } catch (error) {
      console.error("Error updating link:", error);
      setErrorMessage("링크를 수정하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function openDeleteModal(link: LinkItem) {
    setDeleteTarget(link);
    setErrorMessage("");
    setStatusMessage("");
  }

  function closeDeleteModal() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!user || !deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");
      setStatusMessage("");
      await deleteLink(user.uid, deleteTarget.id);
      if (editingId === deleteTarget.id) cancelInlineEdit();
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting link:", error);
      setErrorMessage("링크를 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  function handleLinkClick(linkId: string) {
    if (!user) return;

    void recordLinkClick(user.uid, linkId).catch((error) => {
      console.error("Link click count error:", error);
    });
  }

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f8] px-5 text-[#111827]">
        <p className="text-lg font-black text-[#6b7280]">MyLink 준비 중...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#f7f8f8] text-[#111827]">
        <header className="flex h-14 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 sm:px-6">
          <Link
            href="/"
            className="font-mono text-xl font-black text-[#1648e8] underline decoration-2"
          >
            Link
          </Link>
          <Button
            type="button"
            onClick={() => void handleGoogleLogin()}
            className="h-9 border border-[#1636c5] bg-[#2448e8] px-4 text-sm font-black text-white shadow-[0_3px_0_#162fb0] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#162fb0]"
          >
            로그인
          </Button>
        </header>

        <section className="mx-auto flex max-w-[920px] flex-col items-center px-5 pt-20 text-center sm:pt-24">
          <h1 className="font-mono text-[48px] font-black leading-[1.05] tracking-normal text-[#111827] sm:text-[72px]">
            Development in <span className="text-[#1557ff]">One</span>
            <br />
            <span className="text-[#1557ff]">Link</span>.
          </h1>
          <p className="mt-8 font-mono text-xl leading-9 text-[#374151] sm:text-2xl">
            GitHub, 블로그, 포트폴리오까지.
            <br />
            개발자를 위한 모든 링크를 한 페이지에 담아보세요.
          </p>

          {errorMessage && (
            <p className="mt-8 w-full max-w-[520px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
          )}

          <Button
            type="button"
            onClick={() => void handleGoogleLogin()}
            className="mt-12 h-14 w-full max-w-[520px] border border-[#1636c5] bg-[#2448e8] font-mono text-lg font-black text-white shadow-[0_5px_0_#162fb0] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#162fb0] active:translate-y-1 active:shadow-none"
          >
            G&nbsp;&nbsp;Google로 시작하기
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f8] px-5 py-6 text-[#111827] sm:px-8 sm:py-8">
      <header className="mx-auto mb-10 flex w-full max-w-[960px] items-center justify-between gap-3">
        <Link
          href="/"
          className="text-lg font-black text-[#6b7280] transition hover:text-[#2448e8]"
        >
          MyLink
        </Link>

        <Menu.Root>
          <Menu.Trigger className="flex min-w-0 items-center gap-3 border border-transparent bg-transparent px-3 py-2 text-left transition hover:border-[#dcdfe4] hover:bg-white">
            <span className="hidden max-w-[180px] truncate text-base font-black text-[#111827] sm:block">
              {displayName}
            </span>
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#dcdfe4] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`${displayName} profile`}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-sm font-black text-[#6b7280]">v</span>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={8} align="end">
              <Menu.Popup className="z-50 w-72 border border-[#dcdfe4] bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                <div className="border-b border-[#e5e7eb] px-3 py-3">
                  <p className="truncate text-sm font-black text-[#111827]">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-[#6b7280]">
                    {user.email}
                  </p>
                </div>
                <Menu.Item
                  onClick={() => void copyMyPageLink()}
                  className="mt-2 block w-full px-3 py-2 text-left text-sm font-bold text-[#4b5563] outline-none data-[highlighted]:bg-[#f3f4f6]"
                >
                  내 페이지 링크 복사
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    window.location.href = "/stats";
                  }}
                  className="block w-full px-3 py-2 text-left text-sm font-bold text-[#4b5563] outline-none data-[highlighted]:bg-[#f3f4f6]"
                >
                  통계
                </Menu.Item>
                <Menu.Separator className="my-2 h-px bg-[#e5e7eb]" />
                <Menu.Item
                  onClick={() => void handleLogout()}
                  className="block w-full px-3 py-2 text-left text-sm font-black text-red-600 outline-none data-[highlighted]:bg-red-50"
                >
                  로그아웃
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </header>

      <section className="mx-auto flex w-full max-w-[640px] flex-col items-center">
        <div className="mb-7 flex w-full flex-col items-center text-center">
          <div className="mb-6 grid h-[108px] w-[108px] place-items-center overflow-hidden rounded-full border border-[#d6d9de] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.14)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={`${displayName} profile`}
              className="h-full w-full object-cover"
            />
          </div>

          {nameEditing ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveName();
              }}
              className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="표시 이름"
                maxLength={40}
                className="h-12 min-w-0 flex-1 border border-[#dcdfe4] bg-white px-4 text-center text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8]"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  type="submit"
                  disabled={nameSaving}
                  className="h-12 bg-[#2448e8] px-4 text-sm font-black text-white transition hover:bg-[#1636c5] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                >
                  {nameSaving ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  onClick={cancelNameEdit}
                  disabled={nameSaving}
                  className="h-12 border border-[#dcdfe4] bg-white px-4 text-sm font-black text-[#4b5563] transition hover:bg-[#f3f4f6]"
                >
                  취소
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={startNameEdit}
              className="text-[28px] font-black leading-tight tracking-normal text-[#090d16] transition hover:text-[#2448e8] sm:text-[32px]"
            >
              {displayName}
            </button>
          )}
          <p className="mt-2 text-[17px] font-bold text-[#6b7280]">{handle}</p>

          {bioEditing ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveBio();
              }}
              className="mt-4 flex w-full max-w-[520px] flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={bioDraft}
                onChange={(event) => setBioDraft(event.target.value)}
                placeholder="한 줄 자기소개를 입력해주세요."
                maxLength={80}
                className="h-12 min-w-0 flex-1 border border-[#dcdfe4] bg-white px-4 text-center text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8]"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  type="submit"
                  disabled={bioSaving}
                  className="h-12 bg-[#2448e8] px-4 text-sm font-black text-white transition hover:bg-[#1636c5] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                >
                  {bioSaving ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  onClick={cancelBioEdit}
                  disabled={bioSaving}
                  className="h-12 border border-[#dcdfe4] bg-white px-4 text-sm font-black text-[#4b5563] transition hover:bg-[#f3f4f6]"
                >
                  취소
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={startBioEdit}
              className="mt-4 max-w-[520px] text-center text-[18px] font-medium leading-8 text-[#374151] transition hover:text-[#2448e8] sm:text-[20px]"
            >
              {visibleBio}
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={toggleAddForm}
          className="mb-5 h-14 w-full border border-[#1636c5] bg-[#2448e8] text-[19px] font-black text-white shadow-[0_4px_0_#162fb0] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#162fb0] active:translate-y-1 active:shadow-none sm:text-[21px]"
        >
          + 새로운 링크 추가하기
        </Button>

        {statusMessage && (
          <p className="mb-5 w-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mb-5 w-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        {addFormOpen && (
          <form
            onSubmit={handleAddSubmit}
            className="mb-5 w-full border border-[#dcdfe4] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">새 링크 추가</h2>
              <Button
                type="button"
                onClick={toggleAddForm}
                className="text-sm font-bold text-[#6b7280] hover:text-[#111827]"
              >
                취소
              </Button>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-[#4b5563]">
                제목
                <input
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="구글"
                  className="h-12 border border-[#dcdfe4] bg-[#fbfbfc] px-4 text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8] focus:bg-white"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-[#4b5563]">
                주소
                <input
                  type="text"
                  value={newUrl}
                  onChange={(event) => setNewUrl(event.target.value)}
                  placeholder="https://google.com"
                  className="h-12 border border-[#dcdfe4] bg-[#fbfbfc] px-4 text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8] focus:bg-white"
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="mt-4 h-12 w-full bg-[#111827] text-base font-black text-white transition hover:bg-[#2448e8] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
            >
              {saving ? "저장 중..." : "추가하기"}
            </Button>
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
              <br />위 버튼으로 첫 링크를 추가해보세요.
            </div>
          ) : (
            links.map((link) => {
              const isEditing = editingId === link.id;
              const updatedAt = formatUpdatedAt(link.updatedAt);

              return (
                <article
                  key={link.id}
                  className="group min-h-[120px] border border-[#dcdfe4] bg-white px-5 py-5 transition hover:border-[#2448e8] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-7"
                >
                  {isEditing ? (
                    <div className="grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-[1fr_1.3fr]">
                        <label className="grid gap-1 text-sm font-bold text-[#4b5563]">
                          제목
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            className="h-11 border border-[#dcdfe4] bg-[#fbfbfc] px-3 text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8] focus:bg-white"
                          />
                        </label>

                        <label className="grid gap-1 text-sm font-bold text-[#4b5563]">
                          주소
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(event) => setEditUrl(event.target.value)}
                            className="h-11 border border-[#dcdfe4] bg-[#fbfbfc] px-3 text-base font-semibold text-[#111827] outline-none transition focus:border-[#2448e8] focus:bg-white"
                          />
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => void saveInlineEdit(link.id)}
                          disabled={saving}
                          className="h-10 bg-[#2448e8] px-4 text-sm font-black text-white transition hover:bg-[#1636c5] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                        >
                          저장
                        </Button>
                        <Button
                          type="button"
                          onClick={cancelInlineEdit}
                          disabled={saving}
                          className="h-10 border border-[#dcdfe4] bg-white px-4 text-sm font-black text-[#4b5563] transition hover:bg-[#f3f4f6]"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLinkClick(link.id)}
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
                        <span className="min-w-0">
                          <span className="block truncate text-[18px] font-bold text-[#111827] sm:text-[20px]">
                            {link.title}
                          </span>
                          {updatedAt && (
                            <span className="mt-1 block truncate text-xs font-bold text-[#6b7280]">
                              마지막 수정: {updatedAt}
                            </span>
                          )}
                          <span className="mt-1 block truncate text-xs font-bold text-[#6b7280]">
                            클릭 {link.clickCount ?? 0}회
                          </span>
                        </span>
                      </a>

                      <div className="ml-4 flex flex-shrink-0 items-center gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                        <Button
                          type="button"
                          onClick={() => startInlineEdit(link)}
                          className="grid h-9 min-w-12 place-items-center text-sm font-black transition hover:bg-[#eef2ff]"
                          aria-label={`${link.title} 수정`}
                          title="수정"
                        >
                          수정
                        </Button>
                        <Button
                          type="button"
                          onClick={() => openDeleteModal(link)}
                          className="grid h-9 min-w-12 place-items-center text-sm font-black transition hover:bg-red-50"
                          aria-label={`${link.title} 삭제`}
                          title="삭제"
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

      </section>

      <AlertDialog.Root
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) closeDeleteModal();
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/45" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2.5rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 border border-[#dcdfe4] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
            <AlertDialog.Title className="text-xl font-black text-[#111827]">
              정말 삭제하시겠습니까?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-3 text-base font-semibold leading-7 text-[#4b5563]">
              <span>&quot;{deleteTarget?.title}&quot;</span> 링크가 삭제됩니다.
            </AlertDialog.Description>
            <p className="mt-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black text-amber-800">
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="h-12 border border-[#dcdfe4] bg-white text-base font-black text-[#4b5563] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="h-12 bg-red-600 text-base font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleting ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </main>
  );
}
