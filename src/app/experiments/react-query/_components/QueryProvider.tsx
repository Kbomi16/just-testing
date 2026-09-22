'use client'

import type { ReactNode } from 'react'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

type QueryProviderProps = {
  children: ReactNode
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * 1분 동안 데이터를 fresh 상태로 유지합니다.
         *
         * 같은 queryKey를 다시 사용해도
         * 1분 이내라면 네트워크 요청 없이 캐시를 사용합니다.
         */
        staleTime: 60 * 1000,

        /**
         * 쿼리가 inactive 상태가 된 후
         * 5분 동안 캐시를 메모리에 유지합니다.
         */
        gcTime: 5 * 60 * 1000,

        /**
         * 쿼리 요청 실패 시 한 번 재시도합니다.
         */
        retry: 1,

        /**
         * 브라우저 창을 다시 활성화해도
         * 자동으로 재요청하지 않습니다.
         */
        refetchOnWindowFocus: false,

        /**
         * 인터넷 연결이 복구됐을 때
         * stale 상태라면 다시 요청합니다.
         */
        refetchOnReconnect: true,

        /**
         * 컴포넌트가 다시 마운트됐을 때
         * stale 상태라면 백그라운드에서 갱신합니다.
         */
        refetchOnMount: true,
      },

      mutations: {
        /**
         * 생성·수정·삭제 요청은
         * 실패하더라도 자동 재시도하지 않습니다.
         */
        retry: 0,
      },
    },
  })

/**
 * 브라우저에서 재사용할 QueryClient입니다.
 *
 * 모듈 범위에 저장해 React Suspense 등으로
 * 초기 렌더링이 다시 시작되어도 동일한 캐시를 유지합니다.
 */
let browserQueryClient: QueryClient | undefined

const getQueryClient = () => {
  if (isServer) {
    /**
     * 서버에서는 요청 간 캐시가 공유되지 않도록
     * 매번 새로운 QueryClient를 생성합니다.
     */
    return createQueryClient()
  }

  /**
   * 브라우저에서는 하나의 QueryClient를 계속 재사용합니다.
   */
  browserQueryClient ??= createQueryClient()

  return browserQueryClient
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
