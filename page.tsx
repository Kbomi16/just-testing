import Image from 'next/image'
import Link from 'next/link'
import CacheLab from './_components/CacheLab'

type KeyPart = {
  value: string
  meaning: string
}

type StatusNote = {
  name: string
  meaning: string
  src: string
  alt: string
  caption: string
}

type WalkthroughStep = {
  title: string
  detail: string
  queryKey: string
  src: string
  alt: string
  caption: string
}

type DevtoolsFigureProps = {
  src: string
  alt: string
  caption: string
  width?: number
  height?: number
  priority?: boolean
}

const PANEL_WIDTH = 1003
const PANEL_HEIGHT = 500

const queryKeyParts: KeyPart[] = [
  {
    value: 'react-query-lab',
    meaning: '이 실험실 전체의 이름입니다. 다른 기능의 캐시와 섞이지 않게 맨 앞에 둡니다.',
  },
  {
    value: 'items',
    meaning: '목록 데이터라는 뜻입니다. 상세 페이지라면 detail처럼 다른 단어를 씁니다.',
  },
  {
    value: '1',
    meaning: '지금 보고 있는 페이지 번호입니다. 2페이지로 가면 여기가 2가 됩니다.',
  },
]

const statusNotes: StatusNote[] = [
  {
    name: 'Fresh',
    meaning:
      '방금 받아 온 캐시입니다. 같은 키를 다시 써도 서버에 요청하지 않습니다.',
    src: '/images/react-query/query-fresh.png',
    alt: 'TanStack Query Devtools에서 Fresh 1, 쿼리 키 page 1이 초록으로 표시된 화면',
    caption: 'Fresh 1. staleTime 10초 동안 이 상태가 유지됩니다.',
  },
  {
    name: 'Fetching',
    meaning:
      '지금 서버에 다녀오는 중입니다. 처음 불러올 때와 오래된 캐시를 다시 받을 때 모두 여기가 1이 됩니다.',
    src: '/images/react-query/query-fetching.png',
    alt: 'TanStack Query Devtools에서 Fetching 1로 표시된 화면',
    caption: 'Fetching 1. 파란 숫자가 요청이 끝나기 전까지 유지됩니다.',
  },
  {
    name: 'Stale',
    meaning:
      '캐시는 남아 있지만, 오래됐을 수 있다고 표시합니다. 지워진 것이 아닙니다.',
    src: '/images/react-query/query-stale.png',
    alt: 'TanStack Query Devtools에서 Stale 1, 쿼리 키 page 1이 노란 줄로 표시된 화면',
    caption:
      'Stale 1. staleTime이 지나도 줄은 그대로 있고, 색깔만 노란색으로 바뀝니다.',
  },
  {
    name: 'Inactive',
    meaning:
      '화면에서 쓰지 않는 캐시입니다. 2페이지를 보면 1페이지 줄이 회색 Inactive가 됩니다.',
    src: '/images/react-query/query-inactive.png',
    alt: 'TanStack Query Devtools에서 2페이지는 Fresh, 1페이지는 Inactive인 화면',
    caption:
      'Fresh 1 · Inactive 1. 위 줄은 보고 있는 2페이지, 아래 줄은 아직 남아 있는 1페이지입니다.',
  },
]

const walkthrough: WalkthroughStep[] = [
  {
    title: '1페이지를 연다',
    detail:
      '서버에서 목록을 받아 캐시에 넣습니다. Devtools에 줄이 하나 생기고, 키의 세 번째 값이 1입니다.',
    queryKey: '["react-query-lab", "items", 1]',
    src: '/images/react-query/query-fresh.png',
    alt: '1페이지를 막 불러온 뒤 Fresh 상태인 Devtools',
    caption: '요청이 끝나면 Fresh 1이 됩니다.',
  },
  {
    title: '2페이지로 이동한다',
    detail:
      '키가 달라서 1페이지 캐시를 덮어쓰지 않습니다. 1페이지 줄은 Inactive가 되고, 2페이지 줄이 새로 생깁니다.',
    queryKey: '["react-query-lab", "items", 2]',
    src: '/images/react-query/query-inactive.png',
    alt: '2페이지 Fresh와 1페이지 Inactive가 함께 보이는 Devtools',
    caption: '같은 목록이 아니라, 이름이 다른 서랍 두 개입니다.',
  },
  {
    title: '10초를 기다린다',
    detail:
      'staleTime이 지나면 노란 Stale이 됩니다. 캐시가 지워진 것은 아닙니다.',
    queryKey: 'Stale 1 · Inactive 0',
    src: '/images/react-query/query-stale.png',
    alt: 'staleTime이 지나 Stale이 된 1페이지 쿼리',
    caption: '노란 줄은 오래됐을 수 있다는 표시일 뿐입니다.',
  },
  {
    title: '다시 요청이 나가면 Fetching이 된다',
    detail:
      'stale인 키를 다시 쓰거나 수동 재요청을 누르면, 기존 목록을 먼저 보여 주고 백그라운드에서 다시 받습니다.',
    queryKey: '기존 목록을 먼저 표시 → Fetching 1',
    src: '/images/react-query/query-fetching.png',
    alt: '백그라운드 재요청 중 Fetching 1인 Devtools',
    caption: 'Fetching이 끝나야 requestId가 바뀝니다.',
  },
  {
    title: '구독을 끄고 30초를 기다린다',
    detail:
      'gcTime이 지나면 Devtools에서 그 줄이 사라집니다. 다시 열면 초기 로딩부터 시작합니다.',
    queryKey: '줄이 없음 = 캐시 삭제 완료',
    src: '/images/react-query/query-gc.png',
    alt: 'gcTime이 지나 쿼리 줄이 모두 사라진 Devtools',
    caption: 'Fresh 0 · Stale 0 · Inactive 0. 서랍 자체가 없어진 상태입니다.',
  },
]

const checklist = [
  '우측 하단 TanStack Query Devtools를 연다.',
  '1페이지를 불러와 키의 세 번째 값이 1인지 확인한다.',
  '2페이지로 바꿔 키가 2로 바뀌고, 1페이지 줄이 Inactive가 되는지 본다.',
  '10초를 기다려 노란 Stale이 되는지 확인한다.',
  '1페이지로 돌아와 목록이 먼저 보이고, 로그에 서버 요청이 생기는지 본다.',
  '구독을 해제한 뒤 30초가 지나면 줄이 사라지는지 확인한다.',
]

type ProviderOption = {
  name: string
  meaning: string
}

const providerOptions: ProviderOption[] = [
  {
    name: 'staleTime: 60 * 1000',
    meaning:
      '1분 동안은 최신으로 봅니다. 같은 키를 다시 써도 서버에 가지 않습니다. 라이브러리 기본값은 0이라, 앱에서는 보통 이렇게 올립니다.',
  },
  {
    name: 'gcTime: 5 * 60 * 1000',
    meaning:
      '화면에서 쓰지 않게 된 캐시를 5분 동안 메모리에 남깁니다. 그 안에 같은 키로 돌아오면 기존 값을 다시 씁니다.',
  },
  {
    name: 'retry: 1',
    meaning: '조회가 실패하면 한 번만 다시 시도합니다. 무한 재시도를 막습니다.',
  },
  {
    name: 'refetchOnWindowFocus: false',
    meaning:
      '브라우저 탭을 다시 활성화해도 자동으로 재요청하지 않습니다. 탭 전환이 잦은 관리 화면에서 요청이 폭주하는 것을 막습니다.',
  },
  {
    name: 'refetchOnReconnect: true',
    meaning: '인터넷이 끊겼다가 다시 연결되면, stale인 쿼리만 다시 받습니다.',
  },
  {
    name: 'refetchOnMount: true',
    meaning:
      '컴포넌트가 다시 마운트됐을 때 stale이면 캐시를 먼저 보여주고 백그라운드에서 갱신합니다.',
  },
  {
    name: 'mutations.retry: 0',
    meaning:
      '생성·수정·삭제는 실패해도 자동으로 다시 보내지 않습니다. 같은 요청이 두 번 나가면 데이터가 꼬일 수 있습니다.',
  },
]

const providerSnippet = `'use client'

import type { ReactNode } from 'react'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: 0,
      },
    },
  })

let browserQueryClient: QueryClient | undefined

const getQueryClient = () => {
  if (isServer) {
    return createQueryClient()
  }

  browserQueryClient ??= createQueryClient()

  return browserQueryClient
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}`

export const metadata = {
  title: 'TanStack Query 캐시 타이밍',
  description:
    'queryKey, staleTime, gcTime을 Devtools 화면과 함께 초보자 기준으로 정리한 실험 노트',
}

function DevtoolsFigure({
  src,
  alt,
  caption,
  width = PANEL_WIDTH,
  height = PANEL_HEIGHT,
  priority = false,
}: DevtoolsFigureProps) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
        priority={priority}
      />
      <figcaption className="border-t border-zinc-200 px-4 py-3 text-sm leading-6 text-zinc-600">
        {caption}
      </figcaption>
    </figure>
  )
}

export default function ReactQueryExperimentPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-12 sm:px-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← 목록으로
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            TanStack Query 캐시 타이밍
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            패키지 이름은 `@tanstack/react-query`이고, 제품 이름은 TanStack
            Query입니다. 예전에는 React Query라고 불렀습니다. 처음이면
            QueryProvider 정석과 Devtools의 쿼리 키부터 보면 됩니다. 캐시는
            이름이 있는 서랍이고, `staleTime`은 그 서랍을 최신으로 보는 시간,
            `gcTime`은 안 쓰는 서랍을 버리는 시간입니다.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">1. QueryProvider 정석</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
              >
                기본값 문서
              </a>
              <a
                href="https://tanstack.com/query/latest/docs/framework/react/guides/query-keys"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
              >
                쿼리 키 문서
              </a>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-600">
            Next.js App Router에서는 Provider를 클라이언트 컴포넌트로 두고,
            이 실험 레이아웃처럼 트리 상단에 한 번만 감쌉니다. 서버에서는
            요청마다 새 `QueryClient`를 만들고, 브라우저에서는 하나를 재사용해
            캐시가 리렌더마다 날아가지 않게 합니다.
          </p>
          <pre className="overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6 text-zinc-800">
            <code>{providerSnippet}</code>
          </pre>
          <div className="flex flex-col gap-2">
            {providerOptions.map((option) => (
              <article
                key={option.name}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <p className="font-mono text-sm font-semibold text-zinc-900">
                  {option.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {option.meaning}
                </p>
              </article>
            ))}
          </div>
          <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
            위 값이 앱 전체 기본값입니다. 아래 실습 목록 쿼리만 staleTime
            10초, gcTime 30초로 덮어써서 상태가 바뀌는 순간을 바로 볼 수
            있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">2. 쿼리 키는 캐시의 이름입니다</h2>
          <p className="text-sm leading-6 text-zinc-600">
            TanStack Query는 서버 응답을 메모리에 넣어 둡니다. 그 한 줄을 찾는
            이름이 쿼리 키입니다. 아래는 1페이지를 막 받아 온 직후 Devtools
            화면입니다.
          </p>
          <DevtoolsFigure
            src="/images/react-query/query-fresh.png"
            alt="TanStack Query Devtools에서 ['react-query-lab', 'items', 1] 키가 Fresh로 표시된 화면"
            caption="초록 줄이 캐시 한 개입니다. 키가 ['react-query-lab', 'items', 1]이면 1페이지 목록이라는 뜻입니다."
            priority
          />
          <div className="flex flex-col gap-2">
            {queryKeyParts.map((part) => (
              <article
                key={part.value}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <p className="font-mono text-sm font-semibold text-zinc-900">
                  {part.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {part.meaning}
                </p>
              </article>
            ))}
          </div>
          <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
            2페이지는 세 번째 값만 다릅니다.{' '}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-xs">
              ["react-query-lab", "items", 2]
            </code>
            . 키가 다르면 완전히 다른 캐시입니다. 2페이지로 이동해도 1페이지
            데이터가 덮어씌워지지 않습니다.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">3. 위쪽 숫자가 상태입니다</h2>
          <p className="text-sm leading-6 text-zinc-600">
            같은 Devtools를 상태마다 찍어 두었습니다. 줄의 색깔과 오른쪽 위
            숫자를 같이 보면 됩니다.
          </p>
          <div className="flex flex-col gap-8">
            {statusNotes.map((status) => (
              <article key={status.name} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-semibold">
                    {status.name}
                  </h3>
                  <p className="text-sm leading-6 text-zinc-600">
                    {status.meaning}
                  </p>
                </div>
                <DevtoolsFigure
                  src={status.src}
                  alt={status.alt}
                  caption={status.caption}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">4. staleTime은 언제 다시 물을지입니다</h2>
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700">
            staleTime: 60 * 1000 // 정석 1분 · 이 실험 목록은 10초
          </p>
          <p className="text-sm leading-6 text-zinc-600">
            아래 두 장은 같은 키입니다. 캐시가 없어진 게 아니라, 최신으로 보는
            시간이 끝났는지가 다릅니다.
          </p>
          <div className="flex flex-col gap-6">
            <article className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">시간 안 · Fresh</h3>
              <p className="text-sm leading-6 text-zinc-600">
                같은 키를 다시 써도 서버에 가지 않습니다. 서랍에 있는 값을 바로
                보여 줍니다.
              </p>
              <DevtoolsFigure
                src="/images/react-query/query-fresh.png"
                alt="staleTime 안의 Fresh 상태"
                caption="Fresh 1. 아직 다시 묻지 않습니다."
              />
            </article>
            <article className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">시간 후 · Stale</h3>
              <p className="text-sm leading-6 text-zinc-600">
                서랍은 그대로입니다. 화면에는 기존 값을 먼저 보여주고, 필요할
                때만 백그라운드에서 다시 요청합니다.
              </p>
              <DevtoolsFigure
                src="/images/react-query/query-stale.png"
                alt="staleTime이 지나 Stale이 된 상태"
                caption="Stale 1. 줄이 남아 있는 것이 핵심입니다."
              />
            </article>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">5. gcTime은 안 쓰는 캐시를 언제 버릴지입니다</h2>
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700">
            gcTime: 5 * 60 * 1000 // 정석 5분 · 이 실험 목록은 30초
          </p>
          <p className="text-sm leading-6 text-zinc-600">
            2페이지를 보는 동안 1페이지 컴포넌트는 사라집니다. 그때 1페이지
            키는 Inactive가 되지만, 바로 삭제되지는 않습니다.
          </p>
          <div className="flex flex-col gap-6">
            <article className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Inactive가 되어도 바로 삭제되지 않습니다</h3>
              <p className="text-sm leading-6 text-zinc-600">
                `gcTime` 동안은 Devtools에 줄이 남아 있습니다. 그 안에 같은
                키로 돌아오면 기존 캐시를 다시 씁니다.
              </p>
              <DevtoolsFigure
                src="/images/react-query/query-inactive.png"
                alt="1페이지가 Inactive로 남아 있는 화면"
                caption="아래 회색 줄이 1페이지입니다. 아직 서랍은 있습니다."
              />
            </article>
            <article className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">gcTime이 지나면 줄이 사라집니다</h3>
              <p className="text-sm leading-6 text-zinc-600">
                그때부터는 캐시가 없습니다. 다시 열면 로딩부터 시작하고 서버에
                새로 요청합니다.
              </p>
              <DevtoolsFigure
                src="/images/react-query/query-gc.png"
                alt="gcTime 이후 쿼리가 모두 사라진 화면"
                caption="숫자가 전부 0이면 캐시가 비어 있는 것입니다."
              />
            </article>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">6. 페이지를 오갈 때 키가 하는 일</h2>
          <p className="text-sm leading-6 text-zinc-600">
            정석 Provider는 1분 / 5분입니다. 아래 실습 목록은 10초 / 30초로
            덮어써서 같은 순서를 더 빨리 볼 수 있습니다.
          </p>
          <ol className="flex flex-col gap-8">
            {walkthrough.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs text-zinc-400">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-sm font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    {step.detail}
                  </p>
                  <p className="mt-2 font-mono text-xs leading-5 text-zinc-500">
                    {step.queryKey}
                  </p>
                </div>
                <DevtoolsFigure
                  src={step.src}
                  alt={step.alt}
                  caption={step.caption}
                />
              </li>
            ))}
          </ol>
          <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-600">
            한 줄로 보면 `staleTime`은 언제 다시 요청할지, `gcTime`은 사용하지
            않는 캐시를 언제 삭제할지입니다. 둘 다 쿼리 키 한 줄에 붙습니다.
          </p>
        </section>

        <CacheLab />

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">따라 해보기</h2>
          <p className="text-sm leading-6 text-zinc-600">
            실습 영역에서 우측 하단 꽃 모양 TanStack Query Devtools를 열고
            아래 순서대로 확인하세요.
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-6 text-zinc-600">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
