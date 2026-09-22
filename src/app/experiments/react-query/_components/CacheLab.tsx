'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import type { MutableRefObject } from 'react'
import {
  formatClock,
  formatDuration,
  formatIsoTime,
  GC_TIME,
  getLabQueryKey,
  QUERY_LAB_ROOT_KEY,
  STALE_TIME,
  type LabLog,
  type LabLogTone,
  type LabPage,
  type LabPagePayload,
  type PushLabLog,
} from '../_lib/queryLab'

type CachePhase = 'missing' | 'loading' | 'fresh' | 'stale' | 'refetching' | 'inactive'

type LabQueryViewProps = {
  page: LabPage
  failNextRef: MutableRefObject<boolean>
  logRef: MutableRefObject<PushLabLog>
  onConsumeFailFlag: () => void
}

const PHASE_LABELS: Record<CachePhase, string> = {
  missing: '없음',
  loading: '로딩',
  fresh: 'fresh',
  stale: 'stale',
  refetching: '재요청 중',
  inactive: 'inactive',
}

const PHASE_STYLES: Record<CachePhase, string> = {
  missing: 'bg-zinc-100 text-zinc-600',
  loading: 'bg-sky-100 text-sky-800',
  fresh: 'bg-emerald-100 text-emerald-800',
  stale: 'bg-amber-100 text-amber-800',
  refetching: 'bg-teal-100 text-teal-800',
  inactive: 'bg-violet-100 text-violet-800',
}

const LOG_STYLES: Record<LabLogTone, string> = {
  fetch: 'text-teal-700',
  cache: 'text-emerald-700',
  gc: 'text-violet-700',
  error: 'text-rose-700',
  info: 'text-zinc-600',
}

const getCachePhase = ({
  query,
  now,
  staleTime,
}: {
  query?: Query
  now: number
  staleTime: number
}): CachePhase => {
  if (!query) return 'missing'

  const hasData = query.state.data !== undefined
  const isFetching = query.state.fetchStatus === 'fetching'

  if (isFetching && !hasData) return 'loading'
  if (query.getObserversCount() === 0 && hasData) return 'inactive'
  if (isFetching && hasData) return 'refetching'
  if (!hasData) return 'missing'

  return now - query.state.dataUpdatedAt < staleTime ? 'fresh' : 'stale'
}

const getQueryPage = (query: Query) => {
  const page = query.queryKey[2]

  return page === 2 ? 2 : 1
}

export default function CacheLab() {
  const [page, setPage] = useState<LabPage>(1)
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [failNext, setFailNext] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [logs, setLogs] = useState<LabLog[]>([])

  const logIdRef = useRef(0)
  const failNextRef = useRef(false)
  const inactiveAtRef = useRef<Record<string, number>>({})
  const logRef = useRef<PushLabLog>(() => undefined)

  const queryClient = useQueryClient()

  const queryKey = getLabQueryKey(page)
  const cacheQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [QUERY_LAB_ROOT_KEY] })
  const activeQuery = queryClient
    .getQueryCache()
    .find({ queryKey: [...queryKey] })
  const activePhase = getCachePhase({
    query: activeQuery,
    now,
    staleTime: STALE_TIME,
  })

  failNextRef.current = failNext

  const pushLog: PushLabLog = (tone, title, detail) => {
    logIdRef.current += 1
    const entry: LabLog = {
      id: logIdRef.current,
      at: Date.now(),
      tone,
      title,
      detail,
    }

    console.info(`[react-query-lab] ${title} — ${detail}`)
    queueMicrotask(() => {
      setLogs((current) => [entry, ...current].slice(0, 80))
    })
  }

  logRef.current = pushLog

  const handleSelectPage = (nextPage: LabPage) => {
    if (nextPage === page) return

    pushLog(
      'info',
      `${nextPage}페이지로 이동`,
      `${page}페이지 쿼리는 구독이 끊기면 inactive가 됩니다.`,
    )
    setPage(nextPage)
  }

  const handleToggleSubscribed = () => {
    const nextSubscribed = !isSubscribed

    pushLog(
      'info',
      nextSubscribed ? '쿼리 구독 재개' : '쿼리 구독 해제',
      nextSubscribed
        ? '컴포넌트가 다시 마운트됩니다.'
        : '화면에서 쿼리를 쓰지 않으므로 gcTime 카운트다운이 시작됩니다.',
    )
    setIsSubscribed(nextSubscribed)
  }

  const handleToggleFailNext = () => {
    setFailNext((current) => !current)
  }

  const handleConsumeFailFlag = () => {
    setFailNext(false)
  }

  const handleRefetch = () => {
    pushLog('info', '수동 재요청', JSON.stringify(queryKey))
    void queryClient.refetchQueries({ queryKey: [...queryKey] })
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const handleRemoveCache = () => {
    queryClient.removeQueries({ queryKey: [QUERY_LAB_ROOT_KEY] })
    inactiveAtRef.current = {}
    pushLog('gc', '캐시 수동 삭제', '다음 조회는 초기 로딩부터 시작합니다.')
  }

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    const queryCache = queryClient.getQueryCache()

    return queryCache.subscribe((event) => {
      if (event.query.queryKey[0] !== QUERY_LAB_ROOT_KEY) return

      const cacheKey = JSON.stringify(event.query.queryKey)
      const observers = event.query.getObserversCount()

      if (event.type === 'added') {
        logRef.current('cache', '캐시 엔트리 생성', cacheKey)
      }

      if (event.type === 'removed') {
        delete inactiveAtRef.current[cacheKey]
        logRef.current(
          'gc',
          '캐시 삭제 완료',
          `${cacheKey} — gcTime이 지나 메모리에서 제거됐습니다.`,
        )
        return
      }

      if (observers === 0 && event.query.state.data !== undefined) {
        if (!inactiveAtRef.current[cacheKey]) {
          inactiveAtRef.current[cacheKey] = Date.now()
          logRef.current(
            'info',
            '쿼리 inactive',
            `${cacheKey} — 구독자가 없어 GC 타이머가 시작됩니다.`,
          )
        }
      }

      if (observers > 0 && inactiveAtRef.current[cacheKey]) {
        delete inactiveAtRef.current[cacheKey]
        logRef.current(
          'cache',
          '쿼리 재활성화',
          `${cacheKey} — 남아 있던 캐시를 다시 사용합니다.`,
        )
      }
    })
  }, [queryClient])

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">7. 실습</h2>
        <p className="text-sm leading-6 text-zinc-600">
          1페이지와 2페이지를 오가며, 우측 하단 Devtools의 쿼리 키가 `1`에서
          `2`로 바뀌는지 먼저 보세요. 그다음 fresh·stale·GC를 로그와
          콘솔(`react-query-lab`)에서 맞춥니다.
        </p>
        <p className="text-xs text-zinc-500">
          staleTime {formatDuration(STALE_TIME)} · gcTime{' '}
          {formatDuration(GC_TIME)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="flex flex-wrap gap-2">
              {([1, 2] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={page === item}
                  onClick={() => handleSelectPage(item)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    page === item
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {item}페이지
                </button>
              ))}
              <button
                type="button"
                aria-pressed={!isSubscribed}
                onClick={handleToggleSubscribed}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200"
              >
                {isSubscribed ? '구독 해제' : '구독 재개'}
              </button>
              <button
                type="button"
                onClick={handleRefetch}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200"
              >
                수동 재요청
              </button>
              <button
                type="button"
                onClick={handleRemoveCache}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200"
              >
                캐시 비우기
              </button>
            </div>

            <button
              type="button"
              aria-pressed={failNext}
              onClick={handleToggleFailNext}
              className={`mt-3 rounded-lg px-3 py-1.5 text-sm ${
                failNext
                  ? 'bg-rose-700 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {failNext ? '다음 요청 실패 ON' : '다음 요청 실패시키기'}
            </button>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              실패해도 기존 캐시가 있으면 화면 데이터는 유지됩니다.
            </p>
          </div>

          {isSubscribed ? (
            <LabQueryView
              page={page}
              failNextRef={failNextRef}
              logRef={logRef}
              onConsumeFailFlag={handleConsumeFailFlag}
            />
          ) : (
            <article className="rounded-xl border border-dashed border-zinc-300 p-4">
              <h3 className="text-sm font-medium">쿼리 구독 해제됨</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                컴포넌트가 사라진 것과 같습니다. 캐시는 gcTime 동안 메모리에
                남고, 카운트다운이 끝나면 로그에 삭제 기록이 뜹니다.
              </p>
            </article>
          )}

          <article className="rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">{page}페이지 캐시 상태</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_STYLES[activePhase]}`}
              >
                {PHASE_LABELS[activePhase]}
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-zinc-400">
              {JSON.stringify(queryKey)}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {activePhase === 'fresh' &&
                '아직 최신으로 봅니다. 다시 들어와도 서버 요청이 없습니다.'}
              {activePhase === 'stale' &&
                '캐시는 남아 있지만 오래됐다고 판단합니다. 다시 마운트되거나 수동 재요청하면 백그라운드에서 갱신합니다.'}
              {activePhase === 'refetching' &&
                '기존 캐시를 보여 주면서 서버에서 최신 값을 가져오는 중입니다.'}
              {activePhase === 'inactive' &&
                '화면에서는 쓰지 않지만, gcTime이 지나기 전에는 메모리에 남아 있습니다.'}
              {activePhase === 'loading' &&
                '캐시가 없어 초기 로딩부터 시작합니다.'}
              {activePhase === 'missing' &&
                '이 queryKey의 캐시가 없습니다. 구독을 켜면 새로 요청합니다.'}
            </p>
          </article>
        </div>

        <div className="flex flex-col gap-4">
          <article className="rounded-xl border border-zinc-200 p-4">
            <h3 className="text-sm font-medium">메모리에 남은 쿼리</h3>
            {cacheQueries.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                아직 캐시가 없습니다. 1페이지를 구독한 뒤 요청이 끝나면 여기에
                나타납니다.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {cacheQueries.map((query) => {
                  const cacheKey = JSON.stringify(query.queryKey)
                  const phase = getCachePhase({
                    query,
                    now,
                    staleTime: STALE_TIME,
                  })
                  const staleRemaining = Math.max(
                    0,
                    query.state.dataUpdatedAt + STALE_TIME - now,
                  )
                  const inactiveAt = inactiveAtRef.current[cacheKey]
                  const gcRemaining =
                    inactiveAt !== undefined
                      ? Math.max(0, inactiveAt + GC_TIME - now)
                      : null

                  return (
                    <div
                      key={cacheKey}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {getQueryPage(query)}페이지
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${PHASE_STYLES[phase]}`}
                        >
                          {PHASE_LABELS[phase]}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-zinc-400">
                        observers {query.getObserversCount()} · updated{' '}
                        {query.state.dataUpdatedAt
                          ? formatClock(query.state.dataUpdatedAt)
                          : '-'}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {phase === 'inactive'
                          ? `GC까지 ${formatDuration(gcRemaining ?? 0)}`
                          : `stale까지 ${formatDuration(staleRemaining)}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          <EventLog logs={logs} onClear={handleClearLogs} />
        </div>
      </div>
    </section>
  )
}

function LabQueryView({
  page,
  failNextRef,
  logRef,
  onConsumeFailFlag,
}: LabQueryViewProps) {
  // ! [GET] 실험실 목록 조회
  const itemsQuery = useQuery({
    queryKey: getLabQueryKey(page),
    queryFn: async () => {
      const shouldFail = failNextRef.current

      if (shouldFail) {
        failNextRef.current = false
        onConsumeFailFlag()
      }

      logRef.current(
        'fetch',
        '서버 요청 시작',
        `page=${page}, fail=${shouldFail}`,
      )

      const startedAt = Date.now()
      const response = await fetch(
        `/api/experiments/react-query/items?page=${page}${shouldFail ? '&fail=1' : ''}`,
      )
      const elapsed = Date.now() - startedAt

      if (!response.ok) {
        logRef.current(
          'error',
          '서버 요청 실패',
          `HTTP ${response.status}, ${elapsed}ms`,
        )
        throw new Error(`목록 요청이 실패했습니다. (${response.status})`)
      }

      const payload = (await response.json()) as LabPagePayload

      logRef.current(
        'fetch',
        '서버 응답',
        `requestId=${payload.requestId}, fetchedAt=${formatIsoTime(payload.fetchedAt)}, ${elapsed}ms`,
      )

      return payload
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 0,
  })

  if (itemsQuery.isPending) {
    return (
      <article className="rounded-xl border border-zinc-200 p-4">
        <h3 className="text-sm font-medium">{page}페이지 불러오는 중</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          캐시가 없을 때의 초기 로딩입니다. 응답까지 약 0.8초가 걸립니다.
        </p>
      </article>
    )
  }

  if (itemsQuery.isError && !itemsQuery.data) {
    return (
      <article className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <h3 className="text-sm font-medium text-rose-900">
          캐시 없이 요청 실패
        </h3>
        <p className="mt-2 text-sm leading-6 text-rose-800">
          {itemsQuery.error.message}
        </p>
      </article>
    )
  }

  const payload = itemsQuery.data

  if (!payload) return null

  return (
    <article className="rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">서버 응답 · {payload.page}페이지</h3>
        {itemsQuery.isFetching ? (
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
            백그라운드 요청 중
          </span>
        ) : null}
      </div>

      {itemsQuery.isError ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          최신 요청은 실패했지만 기존 캐시 데이터는 그대로 보여 줍니다.
        </p>
      ) : null}

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-zinc-400">fetchedAt</dt>
          <dd className="mt-0.5 font-mono text-sm text-zinc-800">
            {formatIsoTime(payload.fetchedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">requestId</dt>
          <dd className="mt-0.5 truncate font-mono text-sm text-zinc-800">
            {payload.requestId}
          </dd>
        </div>
      </dl>

      <ul className="mt-3 flex flex-col gap-1.5">
        {payload.items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800"
          >
            {item.title}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">{payload.note}</p>
    </article>
  )
}

function EventLog({
  logs,
  onClear,
}: {
  logs: LabLog[]
  onClear: () => void
}) {
  return (
    <article className="rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">이벤트 로그</h3>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-zinc-300"
        >
          지우기
        </button>
      </div>
      <div
        aria-live="polite"
        className="mt-3 max-h-72 space-y-3 overflow-y-auto"
      >
        {logs.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-500">
            아직 기록이 없습니다. 페이지를 바꾸거나 구독을 해제하면 여기에
            남습니다.
          </p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-t border-zinc-100 pt-3">
              <p className="font-mono text-xs text-zinc-400">
                {formatClock(log.at)}
              </p>
              <p className={`mt-0.5 text-sm font-medium ${LOG_STYLES[log.tone]}`}>
                {log.title}
              </p>
              <p className="mt-0.5 font-mono text-xs leading-5 text-zinc-500">
                {log.detail}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  )
}
