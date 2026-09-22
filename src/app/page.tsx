import Link from "next/link";

type ExperimentPage = {
  title: string;
  description: string;
  href: string;
  tags: string[];
};

const experimentPages: ExperimentPage[] = [
  {
    title: "Next.js Image 컴포넌트",
    description:
      "props, LCP 경고, sizes 누락, loading·preload 선택 기준을 한 페이지에서 정리하고 확인합니다.",
    href: "/experiments/next-image",
    tags: ["next/image", "LCP", "sizes", "loading"],
  },
  {
    title: "TanStack Query 캐시 타이밍",
    description:
      "staleTime과 gcTime이 fresh, stale, inactive, 삭제까지 어떻게 이어지는지 로그로 확인합니다.",
    href: "/experiments/react-query",
    tags: ["TanStack Query", "staleTime", "gcTime"],
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16 sm:px-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-500">프론트엔드 실험실</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            실험 목록
          </h1>
          <p className="max-w-lg text-base leading-7 text-zinc-600">
            Next.js와 TanStack Query 동작을 직접 확인하는 페이지입니다. 아래
            항목을 선택해 실험을 시작하세요.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {experimentPages.map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {page.title}
                  </h2>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-700"
                  >
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {page.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {page.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-zinc-400">
          현재 {experimentPages.length}개의 실험 페이지가 준비되어 있습니다.
        </p>
      </main>
    </div>
  );
}
