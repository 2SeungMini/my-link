import Link from "next/link";

export default function PublicProfileNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f8] px-5 text-center text-[#111827]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#2448e8]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black">페이지를 찾을 수 없습니다.</h1>
        <p className="mt-4 text-base font-semibold text-[#6b7280]">
          username이 바뀌었거나 아직 생성되지 않은 페이지입니다.
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
