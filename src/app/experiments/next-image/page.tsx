import Image from 'next/image'
import Link from 'next/link'

type PropNote = {
  name: string
  summary: string
  useWhen: string
}

type WarningNote = {
  message: string
  cause: string
  fix: string
}

type GoodExample = {
  title: string
  bestFor: string
  code: string
}

type ResolutionExample = {
  title: string
  summary: string
  code: string
}

const experimentImageSrc = '/images/next-image/next_image_01.png'
const experimentImageAlt = '실험실에서 플라스크를 들고 있는 연구원 캐릭터'
const experimentImageWidth = 1408
const experimentImageHeight = 768

const propNotes: PropNote[] = [
  {
    name: 'src',
    summary:
      '이미지 경로입니다. public 경로, static import, 허용된 원격 URL을 사용할 수 있습니다.',
    useWhen:
      '원격 URL은 next.config의 images.remotePatterns 실험에서 별도로 다룹니다.',
  },
  {
    name: 'alt',
    summary:
      '스크린 리더와 이미지 실패 시 대체 텍스트로 쓰이는 필수 접근성 속성입니다.',
    useWhen:
      '장식 이미지는 빈 문자열, 의미 있는 이미지는 페이지 문맥을 대체할 수 있는 문장을 씁니다.',
  },
  {
    name: 'width / height',
    summary:
      '브라우저가 비율을 미리 계산해 레이아웃 시프트를 줄이도록 돕는 intrinsic size입니다.',
    useWhen:
      'static import 또는 fill이 아니라면 둘 다 제공하는 것을 기본값으로 둡니다.',
  },
  {
    name: 'fill',
    summary:
      '부모 박스를 기준으로 이미지를 채웁니다. 부모는 position: relative가 필요합니다.',
    useWhen:
      '정확한 원본 크기를 모르거나 카드/히어로처럼 반응형 박스에 맞출 때 사용합니다.',
  },
  {
    name: 'sizes',
    summary:
      '브라우저가 srcset 후보 중 어떤 크기를 받을지 결정하는 힌트입니다.',
    useWhen:
      'fill 또는 CSS로 반응형 렌더 크기를 만들 때 거의 항상 함께 씁니다.',
  },
  {
    name: 'loading',
    summary: '이미지를 언제 요청할지 제어합니다. 기본값은 lazy입니다.',
    useWhen:
      'above the fold 또는 LCP 후보 이미지는 loading="eager"를 검토합니다.',
  },
  {
    name: 'preload',
    summary:
      'head에 preload hint를 넣어 중요한 이미지를 더 빨리 발견하게 합니다.',
    useWhen: '단일 hero 이미지처럼 LCP가 명확할 때만 제한적으로 비교합니다.',
  },
  {
    name: 'fetchPriority',
    summary: '브라우저의 fetch 우선순위 힌트입니다.',
    useWhen:
      'LCP 이미지를 빨리 가져오되 preload까지는 필요하지 않은 케이스와 비교합니다.',
  },
  {
    name: 'placeholder / blurDataURL',
    summary: '로드 전 시각적 placeholder를 제공합니다.',
    useWhen:
      '체감 로딩 개선이 필요할 때 쓰며, blur는 blurDataURL 조건을 함께 확인합니다.',
  },
  {
    name: 'quality',
    summary: 'Next 이미지 최적화 결과물의 압축 품질을 조절합니다.',
    useWhen:
      '해상도 부족이 아니라 압축으로 디테일이 뭉개질 때만 제한적으로 올립니다.',
  },
]

const warningNotes: WarningNote[] = [
  {
    message:
      'Image with src "..." was detected as the Largest Contentful Paint (LCP). Please add the loading="eager" property if this image is above the fold.',
    cause:
      '브라우저가 해당 이미지를 LCP 요소로 판단했는데 lazy 로딩 상태라 초기 렌더링에 늦게 참여할 수 있습니다.',
    fix: 'above the fold라면 loading="eager" 또는 fetchPriority="high"를 비교하고, 단일 hero 이미지라면 preload도 실험합니다.',
  },
  {
    message: 'Image with src "..." has fill but is missing sizes prop.',
    cause:
      'fill 이미지는 렌더링 폭이 CSS에 의해 결정되므로, sizes가 없으면 브라우저가 100vw로 가정할 수 있습니다.',
    fix: '실제 레이아웃 폭에 맞춰 sizes="(max-width: 768px) 100vw, 50vw"처럼 작성합니다.',
  },
  {
    message: 'Image is missing required width or height property.',
    cause:
      '정적 import나 fill이 아닌데 intrinsic size가 없어 이미지 비율을 미리 예약할 수 없습니다.',
    fix: 'width와 height를 둘 다 제공하고, CSS로 너비를 바꿀 때는 height: auto 패턴을 확인합니다.',
  },
  {
    message:
      '"hostname" is not configured under images in your next.config.js.',
    cause:
      '외부 이미지를 next/image로 최적화하려는데 해당 원격 호스트가 허용 목록에 없습니다.',
    fix: 'next.config에 images.remotePatterns를 명시합니다.',
  },
]

const checklist = [
  '동일 이미지에 loading="lazy"와 loading="eager"를 바꿔 LCP 경고 변화를 확인한다.',
  'fill 이미지에서 sizes 제거/추가 시 dev console 경고와 네트워크 요청 크기를 비교한다.',
  'width/height가 있는 fixed 이미지와 fill 이미지의 레이아웃 시프트 차이를 확인한다.',
  '작은 width 값을 크게 렌더링했을 때와 원본 크기에 가까운 width 값을 썼을 때 선명도를 비교한다.',
  'preload, fetchPriority="high", loading="eager"를 동시에 쓰지 않고 케이스별로 하나씩 비교한다.',
]

const goodExamples: GoodExample[] = [
  {
    title: 'public 이미지 기본형',
    bestFor:
      '이미지의 실제 크기를 알고 있고, 카드/본문 이미지처럼 레이아웃 크기가 비교적 명확한 경우',
    code: `<Image
  src="/images/next-image/next_image_01.png"
  alt="실험실에서 플라스크를 들고 있는 연구원 캐릭터"
  width={1408}
  height={768}
/>`,
  },
  {
    title: '반응형 카드 이미지',
    bestFor:
      '부모 박스 비율에 맞춰 꽉 채우는 썸네일, 카드 커버, 섹션 배경 이미지',
    code: `<div className="relative aspect-video overflow-hidden rounded-2xl">
  <Image
    src="/images/next-image/next_image_01.png"
    alt="실험실에서 플라스크를 들고 있는 연구원 캐릭터"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
  />
</div>`,
  },
  {
    title: '첫 화면 LCP 후보 이미지',
    bestFor:
      '페이지 진입 직후 보이는 hero 이미지처럼 LCP가 될 가능성이 높은 이미지',
    code: `<Image
  src="/images/next-image/next_image_01.png"
  alt="실험실에서 플라스크를 들고 있는 연구원 캐릭터"
  width={1408}
  height={768}
  loading="eager"
  fetchPriority="high"
/>`,
  },
  {
    title: '장식용 이미지',
    bestFor:
      '텍스트 의미를 보충하지 않는 패턴, 아이콘, 배경 장식처럼 스크린 리더가 읽지 않아도 되는 이미지',
    code: `<Image
  src="/images/next-image/next_image_01.png"
  alt=""
  aria-hidden="true"
  width={320}
  height={175}
/>`,
  },
]

const resolutionExamples: ResolutionExample[] = [
  {
    title: '흐려질 수 있는 예시',
    summary:
      '작은 intrinsic width를 주고 CSS로 크게 렌더링하면 브라우저가 작은 후보 이미지를 확대해서 보여줄 수 있습니다.',
    code: `<Image
  src="/images/next-image/next_image_01.png"
  alt="작은 후보 이미지를 크게 렌더링한 예시"
  width={360}
  height={196}
  className="h-auto w-full"
/>`,
  },
  {
    title: '더 선명한 예시',
    summary:
      '실제 렌더링 크기와 고해상도 디스플레이를 고려해 충분히 큰 width/height를 주면 더 큰 srcset 후보를 받을 수 있습니다.',
    code: `<Image
  src="/images/next-image/next_image_01.png"
  alt="충분한 해상도 후보를 제공한 예시"
  width={1408}
  height={768}
  className="h-auto w-full"
/>`,
  },
  {
    title: '압축 품질 조정 예시',
    summary:
      '픽셀 수는 충분한데 색 경계나 질감이 뭉개지면 quality를 올려 압축 손실을 줄입니다.',
    code: `<Image
  src="/images/next-image/next_image_01.png"
  alt="압축 품질을 올린 예시"
  width={1408}
  height={768}
  quality={90}
/>`,
  },
]

export const metadata = {
  title: 'Next.js Image 컴포넌트',
  description: 'Next.js Image 컴포넌트 props와 경고 메시지 실험 노트',
}

export default function NextImageExperimentPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-12 sm:px-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← 목록으로
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Next.js Image 컴포넌트
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            LCP, sizes, width/height 관련 경고를 props 기준과 함께 정리합니다.
            아래 실험 이미지로 dev 서버 터미널 또는 브라우저 콘솔 경고를
            확인하세요.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">경고 확인</h2>
          <p className="text-sm leading-6 text-zinc-600">
            일부러 권장 속성을 빼둔 케이스입니다. 콘솔 메시지를 확인한 뒤 아래
            정석 예시와 비교하세요.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-medium text-zinc-900">
                LCP 후보 + lazy 기본값
              </h3>
              <Image
                src={experimentImageSrc}
                alt="loading eager가 빠진 LCP 후보 이미지"
                width={experimentImageWidth}
                height={experimentImageHeight}
                className="mt-3 rounded-xl border border-zinc-200"
              />
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                첫 영역에서 가장 큰 이미지가 되면 LCP 관련 경고가 뜰 수
                있습니다.
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-medium text-zinc-900">
                fill + sizes 누락
              </h3>
              <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-zinc-200">
                <Image
                  src={experimentImageSrc}
                  alt="sizes가 빠진 fill 이미지"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                fill을 쓰면서 sizes를 생략해 sizes 누락 경고를 관찰합니다.
              </p>
            </article>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">확인 순서</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-6 text-zinc-600">
            <li>이 이미지가 화면 첫 영역(LCP 후보)인지 확인합니다.</li>
            <li>width/height 또는 fill+부모 비율로 공간을 미리 예약했는지 봅니다.</li>
            <li>반응형이면 sizes가 srcset 선택에 맞게 작성됐는지 확인합니다.</li>
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">주요 props</h2>
            <a
              href="https://nextjs.org/docs/app/api-reference/components/image"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
            >
              Next.js Image 문서
            </a>
          </div>
          <div className="flex flex-col gap-3">
            {propNotes.map((prop) => (
              <article
                key={prop.name}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <h3 className="font-mono text-sm font-semibold">{prop.name}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {prop.summary}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {prop.useWhen}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">해상도와 width</h2>
          <p className="text-sm leading-6 text-zinc-600">
            width와 height는 CSS 크기가 아니라 Next가 어떤 해상도의 최적화
            이미지를 만들지 판단하는 기준입니다. 작은 후보를 크게 늘리면
            흐려질 수 있고, 실제 렌더링 크기의 1x–2x 정도를 기준으로 sizes와
            함께 조정합니다.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-medium">작은 후보 → 크게 렌더</h3>
              <Image
                src={experimentImageSrc}
                alt="작은 후보 이미지를 크게 렌더링한 예시"
                width={360}
                height={196}
                className="mt-3 h-auto w-full rounded-xl border border-zinc-200"
              />
            </article>
            <article className="rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-medium">원본에 가까운 후보</h3>
              <Image
                src={experimentImageSrc}
                alt="충분한 해상도 후보를 제공한 예시"
                width={experimentImageWidth}
                height={experimentImageHeight}
                className="mt-3 h-auto w-full rounded-xl border border-zinc-200"
              />
            </article>
          </div>
          <div className="flex flex-col gap-3">
            {resolutionExamples.map((example) => (
              <article
                key={example.title}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <h3 className="text-sm font-medium">{example.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {example.summary}
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-6 text-zinc-800">
                  <code>{example.code}</code>
                </pre>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">정석 예시</h2>
          <div className="flex flex-col gap-3">
            {goodExamples.map((example) => (
              <article
                key={example.title}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <h3 className="text-sm font-medium">{example.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {example.bestFor}
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-6 text-zinc-800">
                  <code>{example.code}</code>
                </pre>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">자주 보는 경고</h2>
          <div className="flex flex-col gap-3">
            {warningNotes.map((warning) => (
              <article
                key={warning.message}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <p className="font-mono text-xs leading-5 text-rose-700">
                  {warning.message}
                </p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">원인</dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-600">
                      {warning.cause}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">해결</dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-600">
                      {warning.fix}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">확인 체크리스트</h2>
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
