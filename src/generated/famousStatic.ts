// GENERATED — do not edit by hand. Written by `node scripts/generate-static-routes.mjs`.
//
// WHY THIS FILE EXISTS. `app.json` sets `web.output: "static"`, so every route is rendered ONCE at
// build time. A screen that fetches in `useEffect` therefore ships an empty shell: measured
// 2026-09-06, `dist/famous/[slug].html` contained 91 characters of chrome and the words
// "불러오는 중…" — no name, no description, no canonical, no JSON-LD. Crawlers see only that.
//
// So the data has to exist BEFORE the render. This module is that data. The generator queries the
// SAME public RPCs the site uses (`public_list_famous` / `public_get_famous`), so drafts can never
// leak — the RPC itself filters `status='published' AND is_public=true`.
//
// THE COMMITTED VERSION IS EMPTY ON PURPOSE. A build that skips the generator produces zero famous
// pages rather than a broken build or stale people. `tsc` and jest always have a real module to
// import. Running the generator overwrites this file.
//
// Pattern borrowed from `scripts/generate-sitemap.mjs`, which already queries Supabase at build
// time. Separate script because the skip conditions differ: the sitemap SKIPS without
// EXPO_PUBLIC_PUBLIC_BASE_URL (it must not invent a domain), while static routes must still be
// generated — a page with no canonical is fine, a missing page is not.

export type FamousStaticEntry = {
  slug: string;
  name: string;
  category: string | null;
  occupation: string | null;
  shortDescription: string | null;
  bio: string | null;
  birthSource: string | null;
  birthSourceNote: string | null;
  chart: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  indexPolicy: 'index' | 'noindex';
  publishedAt: string | null;
  related: { slug: string; name: string; category: string | null }[];
};

/** Published famous profiles captured at build time. Empty when the generator has not run. */
export const FAMOUS_STATIC: FamousStaticEntry[] = [
  {
    "slug": "sample-autumn-1788486478466",
    "name": "목 일간 · 금이 강한 가을 (시각 정확)",
    "category": "saju",
    "occupation": null,
    "shortDescription": "기(己) 일간에 유(酉) 월지. 이런 명식의 구조를 하나씩 읽어 봅니다.",
    "bio": "## 일간은 무엇으로 서 있나 — 통근\n\n통근(통근: 천간이 지지 속에 같은 오행의 뿌리를 두는 것)과 일간의 서 있음을 먼저 봅니다. 이 명식의 일간 기는 일간 기로 표기되어 있습니다. (근거: 일간 기) 일간 기는 년지 오와 일지 축 두 곳에 뿌리를 두고 있어 바닥에 발을 붙이고 있습니다. (근거: 일간 기는 년지 오·일지 축에 통근 O) 년간 무는 통근이 없어 뜬 글자입니다. (근거: 년간 무는 통근 X) 이 사실은 천간들 가운데 뿌리가 있는 쪽과 없는 쪽을 구분해 읽어야 한다는 점을 뜻합니다. (근거: 통근 표에서 년간 무 통근 X·월간 신 통근 O·일간 기 통근 O·시간 정 통근 O)\n\n## 계절이 정하는 것 — 월령\n\n월령(월령: 일간의 계절과 계절 단계가 어떤지 보여 주는 것) 관점에서 계절의 작용을 봅니다. 이 명식에서 월지는 유 금으로 가을에 속하고, 일간은 휴 단계에 있어 일간이 계절을 생하는 쪽입니다. (근거: 월지 유·계절 가을·일간 단계 휴·생극 방향: 일간이 계절을 생함) 그러나 일간은 실령(실령: 계절의 힘을 얻지 못한 상태) 상태라 계절의 힘을 충분히 얻지 못하고 있습니다. (근거: 실령) 따라서 월령이 주는 기대와 실제로 일간이 얻는 힘 사이에 거리감이 존재합니다. (근거: 월지 유·일간 휴·실령)\n\n## 무엇이 많고 무엇이 없나 — 십성 분포\n\n십성(십성: 일간을 기준으로 나눈 열 가지 관계)의 분포를 먼저 셉니다. 이 명식에서는 식상 네 개가 가장 많고 재성은 한 개뿐입니다. (근거: 십성 분포 식상 4·재성 1) 비겁은 셋으로 비교적 눈에 띄고, 일지 축의 지장간이 편재가 아니라 숨은 상태임으로 겉에서 보이는 재는 적습니다. (근거: 비겁 3·일지 지장간 계는 여기·편재로 숨음) 일지 축은 일간 기(비견)와 계(편재)와 신(식신)을 같이 품고 있어 일간과 가장 직접적으로 맞닿은 십성 자리가 됩니다. (근거: 일지 축의 지장간 계·신·기)\n\n## 속에 있는 것과 드러난 것 — 지장간과 투간\n\n지장간(지장간: 지지 속에 숨어 있는 글자들의 모임)과 투간(투간: 지장간의 글자가 천간 자리로 올라오는 현상)을 보면 겉과 속의 차이를 읽을 수 있습니다. 년지 오의 지장간 기가 일간으로 투간되었습니다. (근거: 년지 지장간 기 → 일간 투간되었습니다) 년지 오의 정이 시간 정으로 투간되었습니다. (근거: 년지 지장간 정 → 시간 투간되었습니다) 월지 유의 신이 월간으로 투간되었고 일지 축의 신과 기도 각각 월간과 일간으로 투간되었습니다. (근거: 월지 지장간 신 → 월간 투간되었습니다·일지 지장간 신 → 월간 투간되었습니다·일지 지장간 기 → 일간 투간되었습니다) 반대로 아직 숨은 채로 남은 지장간들도 있어 속에 남은 성분과 겉으로 드러난 성분이 섞여 있습니다. (근거: 숨은 채 년지 병·월지 경·일지 계·시지 갑·시지 을)\n\n## 글자끼리 어떻게 맞물리나 — 합·충·형\n\n글자 관계는 참여 글자와 함께 읽어야 합니다. 년지 오와 일지 축 사이에 해(害)가 있어 두 지지가 서로의 합을 방해하는 관계입니다. (근거: 해 오·축 [년·일주 사이]) 년지 오와 시지 묘 사이에는 파(破)가 있어 두 지지가 짜임을 흩는 관계입니다. (근거: 파 오·묘 [년·시주 사이]) 월지 유와 일지 축 사이에는 반합(半合)이 있어 세 글자 축·유·오 중 둘만 모인 완성되지 않은 묶음의 상태가 있습니다. (근거: 반합 유·축 [월·일주 사이]·국 오행 금) 월지 유와 시지 묘 사이에는 충(沖)이 있어 정면으로 부딪히는 구조가 존재합니다. (근거: 충 유·묘 [월·시주 사이]) 위에 적히지 않은 다른 관계는 이 명식에 없습니다. (근거: 글자 관계 목록)\n\n## 이 명식을 읽는 법\n\n먼저 볼 것은 통근과 투간입니다. 통근으로 어떤 천간이 지지에 뿌리를 두었는지를 확인하면 그 글자가 바닥에 서 있는지 뜬 글자인지를 바로 알 수 있습니다. (근거: 통근 표에서 년간 무 통근 X·월간 신 통근 O·일간 기 통근 O·시간 정 통근 O) 같은 일간이라도 통근 여부나 투간의 유무에 따라 판정이 달라집니다. 이 명식은 일간 기가 두 곳에 뿌리를 두고 있으나 년간 무는 통근이 없어 해석의 초점이 다릅니다. (근거: 일간 기는 년지 오·일지 축에 통근 O·년간 무 통근 X) 다른 명식을 읽을 때에도 먼저 천간별 통근과 지장간의 투간을 확인하고, 그다음에 글자 관계로 안정·변화의 구조를 보는 순서를 권합니다. (근거: 이 글에서 강조한 통근·투간·글자 관계의 반복적 관측)",
    "birthSource": "reported",
    "birthSourceNote": "가상의 예시입니다. 실존 인물이 아닙니다.",
    "chart": {
      "v": 3,
      "pillars": {
        "day": {
          "stem": {
            "hanja": "己",
            "hangul": "기",
            "tenGod": null,
            "element": "토",
            "yinYang": "음"
          },
          "branch": {
            "hanja": "丑",
            "hangul": "축",
            "element": "토",
            "yinYang": "음",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "癸",
                "hangul": "계",
                "tenGod": "편재",
                "element": "수"
              },
              {
                "role": "중기",
                "hanja": "辛",
                "hangul": "신",
                "tenGod": "식신",
                "element": "금"
              },
              {
                "role": "정기",
                "hanja": "己",
                "hangul": "기",
                "tenGod": "비견",
                "element": "토"
              }
            ]
          },
          "position": "일"
        },
        "hour": {
          "stem": {
            "hanja": "丁",
            "hangul": "정",
            "tenGod": "편인",
            "element": "화",
            "yinYang": "음"
          },
          "branch": {
            "hanja": "卯",
            "hangul": "묘",
            "element": "목",
            "yinYang": "음",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "甲",
                "hangul": "갑",
                "tenGod": "정관",
                "element": "목"
              },
              {
                "role": "정기",
                "hanja": "乙",
                "hangul": "을",
                "tenGod": "편관",
                "element": "목"
              }
            ]
          },
          "position": "시"
        },
        "year": {
          "stem": {
            "hanja": "戊",
            "hangul": "무",
            "tenGod": "겁재",
            "element": "토",
            "yinYang": "양"
          },
          "branch": {
            "hanja": "午",
            "hangul": "오",
            "element": "화",
            "yinYang": "양",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "丙",
                "hangul": "병",
                "tenGod": "정인",
                "element": "화"
              },
              {
                "role": "중기",
                "hanja": "己",
                "hangul": "기",
                "tenGod": "비견",
                "element": "토"
              },
              {
                "role": "정기",
                "hanja": "丁",
                "hangul": "정",
                "tenGod": "편인",
                "element": "화"
              }
            ]
          },
          "position": "년"
        },
        "month": {
          "stem": {
            "hanja": "辛",
            "hangul": "신",
            "tenGod": "식신",
            "element": "금",
            "yinYang": "음"
          },
          "branch": {
            "hanja": "酉",
            "hangul": "유",
            "element": "금",
            "yinYang": "음",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "庚",
                "hangul": "경",
                "tenGod": "상관",
                "element": "금"
              },
              {
                "role": "정기",
                "hanja": "辛",
                "hangul": "신",
                "tenGod": "식신",
                "element": "금"
              }
            ]
          },
          "position": "월"
        }
      },
      "rooting": [
        {
          "stem": "무",
          "roots": [],
          "rooted": false,
          "position": "년"
        },
        {
          "stem": "신",
          "roots": [
            "월지 유",
            "일지 축"
          ],
          "rooted": true,
          "position": "월"
        },
        {
          "stem": "기",
          "roots": [
            "년지 오",
            "일지 축"
          ],
          "rooted": true,
          "position": "일"
        },
        {
          "stem": "정",
          "roots": [
            "년지 오"
          ],
          "rooted": true,
          "position": "시"
        }
      ],
      "revealed": [
        {
          "role": "중기",
          "hiddenStem": "기",
          "revealedAt": [
            "일간"
          ],
          "branchPosition": "년"
        },
        {
          "role": "정기",
          "hiddenStem": "정",
          "revealedAt": [
            "시간"
          ],
          "branchPosition": "년"
        },
        {
          "role": "정기",
          "hiddenStem": "신",
          "revealedAt": [
            "월간"
          ],
          "branchPosition": "월"
        },
        {
          "role": "중기",
          "hiddenStem": "신",
          "revealedAt": [
            "월간"
          ],
          "branchPosition": "일"
        },
        {
          "role": "정기",
          "hiddenStem": "기",
          "revealedAt": [
            "일간"
          ],
          "branchPosition": "일"
        }
      ],
      "dayMaster": {
        "hanja": "己",
        "hangul": "기",
        "element": "토",
        "yinYang": "음"
      },
      "hourKnown": true,
      "relations": [
        {
          "name": "해(害)",
          "element": null,
          "meaning": "두 지지가 서로의 합을 방해하는 관계. 끼어듦이기도 하고 견제이기도 합니다",
          "members": [
            "오",
            "축"
          ],
          "positions": [
            "년",
            "일"
          ]
        },
        {
          "name": "파(破)",
          "element": null,
          "meaning": "두 지지가 서로의 짜임을 흩는 관계. 굳은 틀이 풀리기도 하고, 자리가 헐거워지기도 합니다",
          "members": [
            "오",
            "묘"
          ],
          "positions": [
            "년",
            "시"
          ]
        },
        {
          "name": "반합(半合)",
          "element": "금",
          "meaning": "삼합 세 글자 중 둘만 모인 관계. 방향이 잡히기도 하고, 아직 완성되지 않은 상태이기도 합니다",
          "members": [
            "유",
            "축"
          ],
          "positions": [
            "월",
            "일"
          ]
        },
        {
          "name": "충(沖)",
          "element": null,
          "meaning": "두 지지가 정면으로 부딪히는 관계. 변화·이동의 계기가 되기도 하고 불안정의 원인이 되기도 합니다",
          "members": [
            "유",
            "묘"
          ],
          "positions": [
            "월",
            "시"
          ]
        }
      ],
      "monthBranch": {
        "hanja": "酉",
        "hangul": "유",
        "element": "금"
      },
      "elementSlots": [
        {
          "slot": "년간",
          "element": "토"
        },
        {
          "slot": "년지",
          "element": "화"
        },
        {
          "slot": "월간",
          "element": "금"
        },
        {
          "slot": "월지",
          "element": "금"
        },
        {
          "slot": "일간",
          "element": "토"
        },
        {
          "slot": "일지",
          "element": "토"
        },
        {
          "slot": "시간",
          "element": "화"
        },
        {
          "slot": "시지",
          "element": "목"
        }
      ],
      "monthCommand": {
        "phase": "휴(休)",
        "season": "가을",
        "direction": "DAY_GENERATES_SEASON",
        "inCommand": false,
        "phaseMeaning": "일간이 계절을 생함 — 내보내는 쪽이라 힘을 씁니다"
      },
      "tenGodGroups": [
        {
          "count": 3,
          "group": "비겁",
          "members": [
            "겁재",
            "비견"
          ]
        },
        {
          "count": 4,
          "group": "식상",
          "members": [
            "상관",
            "식신"
          ]
        },
        {
          "count": 1,
          "group": "재성",
          "members": [
            "편재"
          ]
        },
        {
          "count": 2,
          "group": "관성",
          "members": [
            "정관",
            "편관"
          ]
        },
        {
          "count": 3,
          "group": "인성",
          "members": [
            "정인",
            "편인"
          ]
        }
      ],
      "elementCounts": [
        {
          "count": 1,
          "element": "목"
        },
        {
          "count": 2,
          "element": "화"
        },
        {
          "count": 3,
          "element": "토"
        },
        {
          "count": 2,
          "element": "금"
        },
        {
          "count": 0,
          "element": "수"
        }
      ],
      "engineVersion": null,
      "observedSlots": 8,
      "ruleSetVersion": "deokbunai.saju-derived-facts.v1"
    },
    "seoTitle": "목 일간이 가을 금을 만난 명식 — 어떻게 읽나",
    "seoDescription": "일간·월지·일지·오행 분포를 차례로 읽습니다.",
    "canonicalUrl": null,
    "indexPolicy": "index",
    "publishedAt": "2026-09-04T01:48:06.967371+00:00",
    "related": [
      {
        "slug": "sample-nohour-1788485118984",
        "name": "경금 일간 · 시각 미상",
        "category": "saju"
      },
      {
        "slug": "sample-exact-1788485118984",
        "name": "병화 일간 · 오화 월지 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "byeonghwa-ilgan-summer",
        "name": "병화 일간, 오화 월지",
        "category": "saju"
      },
      {
        "slug": "gyeongsang-ilgan-water",
        "name": "경금 일간, 자수 월지",
        "category": "saju"
      }
    ]
  },
  {
    "slug": "sample-nohour-1788485118984",
    "name": "경금 일간 · 시각 미상",
    "category": "saju",
    "occupation": null,
    "shortDescription": "계(癸) 일간에 자(子) 월지. 이런 명식의 구조를 하나씩 읽어 봅니다.",
    "bio": "## 일간은 무엇으로 서 있나 — 통근\n\n통근(通根, 천간이 지지 속에 같은 오행의 뿌리를 두는 것)과 일간 개념을 먼저 봅니다. 일간 계는 년지 자와 월지 자에 뿌리를 두고 있어 통근이 있습니다. (근거: 일간 계 통근 O — 년지 자, 월지 자) 일간 계는 계절 단계에서 득령(得令, 계절의 힘을 얻은 상태) 상태인 왕에 놓여 있습니다. (근거: 일간의 계절 단계 왕 · 득령) 천간 자리들 가운데 년간 갑과 월간 병은 지지에 뿌리를 두지 못해 뜬 글자입니다. (근거: 년간 갑 통근 X · 월간 병 통근 X) 시주가 없어 시간 판단은 할 수 없습니다. (근거: 시주 없음, 관측 6칸)\n\n## 계절이 정하는 것 — 월령\n\n월령(月令, 해당 달의 계절 기운) 개념은 일간이 달의 기운을 얻었는지 보는 것입니다. 이 명식에서 월지 자의 계절은 겨울이고, 일간 계는 그 계절과 같은 오행이어서 계절이 일간을 그대로 밀어 주는 상태입니다. (근거: 월지 자 계절 겨울 · 일간의 계절 단계 왕 · 계절과 일간 같은 오행) 따라서 일간은 월령의 힘을 받아 득령 상태로 서 있습니다. (근거: 득령) 생극 방향은 계절과 일간이 같은 오행이라 생극이 발생하지 않습니다. (근거: 생극 방향 계절과 일간이 같은 오행 생극 없음)\n\n## 무엇이 많고 무엇이 없나 — 십성 분포\n\n십성(十性: 비겁·식상·재성·관성·인성 등)의 분포를 봅니다. 이 명식에서는 비겁이 4로 가장 많고, 식상 2·재성 2·관성 1이며 인성은 하나도 없습니다. (근거: 비겁 4 · 식상 2 · 재성 2 · 관성 1 · 인성 0) 십성 용어 예시로 비겁(일간과 같은 오행), 식상(일간이 생하는 것), 재성(일간이 극하는 것), 관성(일간을 극하는 것), 인성(일간을 생하는 것)을 이 글에서 이렇게 씁니다. (근거: 무리의 뜻 줄기) 일지 미의 십성은 일간을 기준으로 편재(일지의 정이 드러남)와 식신이 지장간에 있어 겉으로 드러난 십성과 속의 십성이 섞여 있습니다. (근거: 일지 지장간 정·을·기 중 정 편재 · 을 식신 및 투간 현황)\n\n## 속에 있는 것과 드러난 것 — 지장간과 투간\n\n지장간(地藏干, 지지 속에 숨은 글자)과 투간(투간되었습니다, 지장간 글자가 천간으로 드러나는 것) 개념을 봅니다. 년지 자의 지장간 계가 일간으로 투간되었습니다. (근거: 년지 지장간 계 → 일간 투간되었습니다) 월지 자의 지장간 계도 일간으로 투간되었습니다. (근거: 월지 지장간 계 → 일간 투간되었습니다) 반면 년지 임과 월지 임, 일지 정·을·기는 아직 지장간으로 남아 있어 겉으로 드러난 것과 속에 남은 것이 차이를 만듭니다. (근거: 남은 지장간 년지 임 · 월지 임 · 일지 정 · 일지 을 · 일지 기)\n\n## 글자끼리 어떻게 맞물리나 — 합·충·형\n\n글자 관계는 관측된 것만 적습니다. 년주(年)와 일주(日) 사이의 해(害)는 자와 미 사이에 있습니다. (근거: 해: 자 · 미 [년·일주 사이]) 월주(月)와 일주(日) 사이의 해(害)도 자와 미 사이입니다. (근거: 해: 자 · 미 [월·일주 사이]) 그외의 충·합·형 등은 이 명식에 없습니다. (근거: 글자 관계로 위 두 항목만 관측됨)\n\n## 이 명식을 읽는 법\n\n먼저 볼 것은 통근과 월령입니다. 통근이 어느 글자에 있는지 먼저 확인하면 뜬 천간과 뿌리 있는 천간을 구분할 수 있습니다. (근거: 일간 계 통근 O — 년지 자, 월지 자 · 년간 갑 통근 X · 월간 병 통근 X) 같은 일간이라도 통근 여부와 지장간의 투간으로 결론이 달라집니다 — 이 명식은 일간 계가 통근하며 월지 자의 계가 일간으로 투간된 점에서 겉으로 읽히는 수의 힘이 큽니다. (근거: 일간 계 통근 O · 년지 계 → 일간 투간 · 월지 계 → 일간 투간) 다른 명식을 볼 때는 1) 통근 있는 천간과 없는 천간을 먼저 가르고, 2) 월령의 득령·실령을 확인하고, 3) 지장간의 투간 여부로 겉과 속의 십성을 나누어 읽으십시오. (근거: 통근·월령·투간 관측 항목들)",
    "birthSource": "reported",
    "birthSourceNote": null,
    "chart": {
      "v": 3,
      "pillars": {
        "day": {
          "stem": {
            "hanja": "癸",
            "hangul": "계",
            "tenGod": null,
            "element": "수",
            "yinYang": "음"
          },
          "branch": {
            "hanja": "未",
            "hangul": "미",
            "element": "토",
            "yinYang": "음",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "丁",
                "hangul": "정",
                "tenGod": "편재",
                "element": "화"
              },
              {
                "role": "중기",
                "hanja": "乙",
                "hangul": "을",
                "tenGod": "식신",
                "element": "목"
              },
              {
                "role": "정기",
                "hanja": "己",
                "hangul": "기",
                "tenGod": "편관",
                "element": "토"
              }
            ]
          },
          "position": "일"
        },
        "hour": null,
        "year": {
          "stem": {
            "hanja": "甲",
            "hangul": "갑",
            "tenGod": "상관",
            "element": "목",
            "yinYang": "양"
          },
          "branch": {
            "hanja": "子",
            "hangul": "자",
            "element": "수",
            "yinYang": "양",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "壬",
                "hangul": "임",
                "tenGod": "겁재",
                "element": "수"
              },
              {
                "role": "정기",
                "hanja": "癸",
                "hangul": "계",
                "tenGod": "비견",
                "element": "수"
              }
            ]
          },
          "position": "년"
        },
        "month": {
          "stem": {
            "hanja": "丙",
            "hangul": "병",
            "tenGod": "정재",
            "element": "화",
            "yinYang": "양"
          },
          "branch": {
            "hanja": "子",
            "hangul": "자",
            "element": "수",
            "yinYang": "양",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "壬",
                "hangul": "임",
                "tenGod": "겁재",
                "element": "수"
              },
              {
                "role": "정기",
                "hanja": "癸",
                "hangul": "계",
                "tenGod": "비견",
                "element": "수"
              }
            ]
          },
          "position": "월"
        }
      },
      "rooting": [
        {
          "stem": "갑",
          "roots": [],
          "rooted": false,
          "position": "년"
        },
        {
          "stem": "병",
          "roots": [],
          "rooted": false,
          "position": "월"
        },
        {
          "stem": "계",
          "roots": [
            "년지 자",
            "월지 자"
          ],
          "rooted": true,
          "position": "일"
        }
      ],
      "revealed": [
        {
          "role": "정기",
          "hiddenStem": "계",
          "revealedAt": [
            "일간"
          ],
          "branchPosition": "년"
        },
        {
          "role": "정기",
          "hiddenStem": "계",
          "revealedAt": [
            "일간"
          ],
          "branchPosition": "월"
        }
      ],
      "dayMaster": {
        "hanja": "癸",
        "hangul": "계",
        "element": "수",
        "yinYang": "음"
      },
      "hourKnown": false,
      "relations": [
        {
          "name": "해(害)",
          "element": null,
          "meaning": "두 지지가 서로의 합을 방해하는 관계. 끼어듦이기도 하고 견제이기도 합니다",
          "members": [
            "자",
            "미"
          ],
          "positions": [
            "년",
            "일"
          ]
        },
        {
          "name": "해(害)",
          "element": null,
          "meaning": "두 지지가 서로의 합을 방해하는 관계. 끼어듦이기도 하고 견제이기도 합니다",
          "members": [
            "자",
            "미"
          ],
          "positions": [
            "월",
            "일"
          ]
        }
      ],
      "monthBranch": {
        "hanja": "子",
        "hangul": "자",
        "element": "수"
      },
      "elementSlots": [
        {
          "slot": "년간",
          "element": "목"
        },
        {
          "slot": "년지",
          "element": "수"
        },
        {
          "slot": "월간",
          "element": "화"
        },
        {
          "slot": "월지",
          "element": "수"
        },
        {
          "slot": "일간",
          "element": "수"
        },
        {
          "slot": "일지",
          "element": "토"
        }
      ],
      "monthCommand": {
        "phase": "왕(旺)",
        "season": "겨울",
        "direction": "SAME",
        "inCommand": true,
        "phaseMeaning": "계절과 일간이 같은 오행 — 계절이 일간을 그대로 밀어 줍니다"
      },
      "tenGodGroups": [
        {
          "count": 4,
          "group": "비겁",
          "members": [
            "겁재",
            "비견"
          ]
        },
        {
          "count": 2,
          "group": "식상",
          "members": [
            "상관",
            "식신"
          ]
        },
        {
          "count": 2,
          "group": "재성",
          "members": [
            "정재",
            "편재"
          ]
        },
        {
          "count": 1,
          "group": "관성",
          "members": [
            "편관"
          ]
        },
        {
          "count": 0,
          "group": "인성",
          "members": []
        }
      ],
      "elementCounts": [
        {
          "count": 1,
          "element": "목"
        },
        {
          "count": 1,
          "element": "화"
        },
        {
          "count": 1,
          "element": "토"
        },
        {
          "count": 0,
          "element": "금"
        },
        {
          "count": 3,
          "element": "수"
        }
      ],
      "engineVersion": null,
      "observedSlots": 6,
      "ruleSetVersion": "deokbunai.saju-derived-facts.v1"
    },
    "seoTitle": "경금 일간 · 시각 미상 — 이런 명식은 어떤 특징이 있나",
    "seoDescription": "계 일간이 자 월지를 만난 명식. 일간·월지·일지·오행 분포를 차례로 읽습니다.",
    "canonicalUrl": null,
    "indexPolicy": "index",
    "publishedAt": "2026-09-04T01:25:39.379578+00:00",
    "related": [
      {
        "slug": "sample-autumn-1788486478466",
        "name": "목 일간 · 금이 강한 가을 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "sample-exact-1788485118984",
        "name": "병화 일간 · 오화 월지 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "byeonghwa-ilgan-summer",
        "name": "병화 일간, 오화 월지",
        "category": "saju"
      },
      {
        "slug": "gyeongsang-ilgan-water",
        "name": "경금 일간, 자수 월지",
        "category": "saju"
      }
    ]
  },
  {
    "slug": "sample-exact-1788485118984",
    "name": "병화 일간 · 오화 월지 (시각 정확)",
    "category": "saju",
    "occupation": null,
    "shortDescription": "정(丁) 일간에 오(午) 월지. 이런 명식의 구조를 하나씩 읽어 봅니다.",
    "bio": "## 일간은 무엇으로 서 있나 — 통근\n\n통근(通根, 천간이 지지 속에 같은 오행의 뿌리를 두는 것)와 일간의 서있는 상태를 먼저 봅니다. (근거: 일간 정) 일간 정은 뿌리를 가진 글자입니다. (근거: 일간 정은 년지 오·월지 오·시지 미 세 곳에 뿌리를 둠) 통근을 먼저 보는 이유는 같은 천간이라도 뿌리를 가진 것과 뜬 글자가 다르게 읽히기 때문입니다. (근거: 월간 임은 통근 X, 일간 정은 통근 O)\n\n## 계절이 정하는 것 — 월령\n\n월령(月令, 한 달의 계절적 기운)이란 일간이 그 달의 계절과 맞닿아 어느 단계에 있는지를 보는 개념입니다. 이 명식에서는 월지가 오로 계절이 여름이고, 일간 정이 그 계절과 같은 오행이라 득령(得令, 계절의 힘을 얻은 상태)입니다. (근거: 월지 오·계절 여름·일간의 계절 단계 왕) 계절이 일간과 같은 오행인 경우 생극 방향은 없습니다. (근거: 계절과 일간이 같은 오행(생극 없음)) 득령이라는 사실은 일간이 그 계절의 기운을 받고 있다는 뜻으로 읽힙니다. (근거: 득령 표기 — 계절의 힘을 얻음)\n\n## 무엇이 많고 무엇이 없나 — 십성 분포\n\n십성(十神)은 일간을 기준으로 천간과 지장간의 십성을 모두 세어 보는 개념입니다. 비겁(비견·겁재, 일간과 같은 오행)·식상(식신·상관, 일간이 생하는 것)·재성(정재·편재, 일간이 극하는 것)·관성(정관·편관, 일간을 극하는 것)·인성(정인·편인, 일간을 생하는 것)이라는 분류를 씁니다. (근거: 무리의 뜻 줄에 적힌 십성 정의) 이 명식에서는 비겁이 상대적으로 많고 식상과 재성은 적습니다. (근거: 비겁 7·식상 4·재성 2·관성 1·인성 1) 일지 사(巳) 속의 지장간 가운데 일간과 가장 가까운 십성은 무에 해당하는 상관입니다. (근거: 일지 사의 지장간 무(여기·상관))\n\n## 속에 있는 것과 드러난 것 — 지장간과 투간\n\n지장간(地藏干, 지지 속에 숨어 있는 글자)과 투간(地藏干의 글자가 천간으로 올라오는 것)은 속의 기운이 겉으로 어떻게 드러나는지를 보여 주는 개념입니다. 년지 오의 지장간 정이 일간과 시간으로 투간되었습니다. (근거: 년지 지장간 정 → 일간·시간으로 투간되었습니다) 월지 오의 지장간 정이 일간과 시간으로 투간되었습니다. (근거: 월지 지장간 정 → 일간·시간으로 투간되었습니다) 시지 미의 지장간 정이 일간과 시간으로 투간되었고, 일지 사의 지장간 경이 년간으로 투간되었습니다. (근거: 시지 지장간 정 → 일간·시간 투간됨·일지 지장간 경 → 년간 투간) 남아 있는 많은 지장간 글자들은 아직 숨은 채로 남아 있습니다. (근거: 숨은 채로 남은 지장간 목록 여럿)\n\n## 글자끼리 어떻게 맞물리나 — 합·충·형\n\n이 명식의 글자 관계는 자료에 적힌 것만 확인합니다. 년·월주 사이에 같은 글자 오가 겹친 자형(自刑)이 있습니다. (근거: 자형 오·오 [년·월주 사이]) 년지 오와 시지 미, 그리고 월지 오와 시지 미 사이에 육합(六合)이 있어 두 지지가 한 쌍으로 묶입니다. (근거: 육합 오·미 [년·시주 사이]·육합 오·미 [월·시주 사이]) 년주와 월주 사이에 같은 천간 임과 정의 천간합(合)이 있고, 월주와 시주 사이에도 임·정의 천간합이 있습니다. (근거: 천간합 임·정 [월·일주 사이]·천간합 임·정 [월·시주 사이]) 사·오·미가 한데 모인 방합(方合)이 있어 한 계절로 묶이는 구조가 보입니다. (근거: 방합 사·오·미·국 오행 화)\n\n## 이 명식을 읽는 법\n\n먼저 보는 것은 통근과 투간을 통해 어느 글자가 겉에서 서 있고 어느 글자가 속에 남아 있는지입니다. 이 명식에서는 일간 정이 세 곳에 뿌리를 두어 바닥에 발을 붙이고 있고 월간 임은 뿌리가 없어 뜬 글자입니다. (근거: 일간 정은 년지 오·월지 오·시지 미에 뿌리, 월간 임은 통근 X) 같은 일간이라도 통근이 있느냐 없느냐에 따라 읽는 방향이 달라집니다. (근거: 일간 정 통근 O·월간 임 통근 X) 다른 명식을 볼 때는 먼저 통근(누가 뿌리를 가졌는가)과 월령(일간이 득령인지 실령인지)을 확인한 뒤, 지장간의 투간으로 속과 겉의 차이를 짚으십시오. (근거: 통근과 월령·투간 관련 관측들)",
    "birthSource": "confirmed",
    "birthSourceNote": null,
    "chart": {
      "v": 3,
      "pillars": {
        "day": {
          "stem": {
            "hanja": "丁",
            "hangul": "정",
            "tenGod": null,
            "element": "화",
            "yinYang": "음"
          },
          "branch": {
            "hanja": "巳",
            "hangul": "사",
            "element": "화",
            "yinYang": "음",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "戊",
                "hangul": "무",
                "tenGod": "상관",
                "element": "토"
              },
              {
                "role": "중기",
                "hanja": "庚",
                "hangul": "경",
                "tenGod": "정재",
                "element": "금"
              },
              {
                "role": "정기",
                "hanja": "丙",
                "hangul": "병",
                "tenGod": "겁재",
                "element": "화"
              }
            ]
          },
          "position": "일"
        },
        "hour": {
          "stem": {
            "hanja": "丁",
            "hangul": "정",
            "tenGod": "비견",
            "element": "화",
            "yinYang": "음"
          },
          "branch": {
            "hanja": "未",
            "hangul": "미",
            "element": "토",
            "yinYang": "음",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "丁",
                "hangul": "정",
                "tenGod": "비견",
                "element": "화"
              },
              {
                "role": "중기",
                "hanja": "乙",
                "hangul": "을",
                "tenGod": "편인",
                "element": "목"
              },
              {
                "role": "정기",
                "hanja": "己",
                "hangul": "기",
                "tenGod": "식신",
                "element": "토"
              }
            ]
          },
          "position": "시"
        },
        "year": {
          "stem": {
            "hanja": "庚",
            "hangul": "경",
            "tenGod": "정재",
            "element": "금",
            "yinYang": "양"
          },
          "branch": {
            "hanja": "午",
            "hangul": "오",
            "element": "화",
            "yinYang": "양",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "丙",
                "hangul": "병",
                "tenGod": "겁재",
                "element": "화"
              },
              {
                "role": "중기",
                "hanja": "己",
                "hangul": "기",
                "tenGod": "식신",
                "element": "토"
              },
              {
                "role": "정기",
                "hanja": "丁",
                "hangul": "정",
                "tenGod": "비견",
                "element": "화"
              }
            ]
          },
          "position": "년"
        },
        "month": {
          "stem": {
            "hanja": "壬",
            "hangul": "임",
            "tenGod": "정관",
            "element": "수",
            "yinYang": "양"
          },
          "branch": {
            "hanja": "午",
            "hangul": "오",
            "element": "화",
            "yinYang": "양",
            "hiddenStems": [
              {
                "role": "여기",
                "hanja": "丙",
                "hangul": "병",
                "tenGod": "겁재",
                "element": "화"
              },
              {
                "role": "중기",
                "hanja": "己",
                "hangul": "기",
                "tenGod": "식신",
                "element": "토"
              },
              {
                "role": "정기",
                "hanja": "丁",
                "hangul": "정",
                "tenGod": "비견",
                "element": "화"
              }
            ]
          },
          "position": "월"
        }
      },
      "rooting": [
        {
          "stem": "경",
          "roots": [
            "일지 사"
          ],
          "rooted": true,
          "position": "년"
        },
        {
          "stem": "임",
          "roots": [],
          "rooted": false,
          "position": "월"
        },
        {
          "stem": "정",
          "roots": [
            "년지 오",
            "월지 오",
            "시지 미"
          ],
          "rooted": true,
          "position": "일"
        },
        {
          "stem": "정",
          "roots": [
            "년지 오",
            "월지 오",
            "시지 미"
          ],
          "rooted": true,
          "position": "시"
        }
      ],
      "revealed": [
        {
          "role": "정기",
          "hiddenStem": "정",
          "revealedAt": [
            "일간",
            "시간"
          ],
          "branchPosition": "년"
        },
        {
          "role": "정기",
          "hiddenStem": "정",
          "revealedAt": [
            "일간",
            "시간"
          ],
          "branchPosition": "월"
        },
        {
          "role": "중기",
          "hiddenStem": "경",
          "revealedAt": [
            "년간"
          ],
          "branchPosition": "일"
        },
        {
          "role": "여기",
          "hiddenStem": "정",
          "revealedAt": [
            "일간",
            "시간"
          ],
          "branchPosition": "시"
        }
      ],
      "dayMaster": {
        "hanja": "丁",
        "hangul": "정",
        "element": "화",
        "yinYang": "음"
      },
      "hourKnown": true,
      "relations": [
        {
          "name": "천간합(合)",
          "element": "목",
          "meaning": "두 천간이 짝을 이루는 관계. 묶여서 안정되기도 하고, 묶여서 제 일을 못 하기도 합니다",
          "members": [
            "임",
            "정"
          ],
          "positions": [
            "월",
            "일"
          ]
        },
        {
          "name": "천간합(合)",
          "element": "목",
          "meaning": "두 천간이 짝을 이루는 관계. 묶여서 안정되기도 하고, 묶여서 제 일을 못 하기도 합니다",
          "members": [
            "임",
            "정"
          ],
          "positions": [
            "월",
            "시"
          ]
        },
        {
          "name": "자형(自刑)",
          "element": null,
          "meaning": "같은 지지가 겹친 관계. 같은 기운이 두터워지기도 하고, 같은 성질끼리 안에서 맞물리기도 합니다",
          "members": [
            "오",
            "오"
          ],
          "positions": [
            "년",
            "월"
          ]
        },
        {
          "name": "육합(六合)",
          "element": null,
          "meaning": "두 지지가 하나로 묶이는 관계. 결속이기도 하고 정체이기도 합니다",
          "members": [
            "오",
            "미"
          ],
          "positions": [
            "년",
            "시"
          ]
        },
        {
          "name": "육합(六合)",
          "element": null,
          "meaning": "두 지지가 하나로 묶이는 관계. 결속이기도 하고 정체이기도 합니다",
          "members": [
            "오",
            "미"
          ],
          "positions": [
            "월",
            "시"
          ]
        },
        {
          "name": "방합(方合)",
          "element": "화",
          "meaning": "한 계절의 세 지지가 모인 관계. 그 계절 기운이 두터워지기도 하고, 한 계절에 치우치기도 합니다",
          "members": [
            "사",
            "오",
            "미"
          ],
          "positions": []
        }
      ],
      "monthBranch": {
        "hanja": "午",
        "hangul": "오",
        "element": "화"
      },
      "elementSlots": [
        {
          "slot": "년간",
          "element": "금"
        },
        {
          "slot": "년지",
          "element": "화"
        },
        {
          "slot": "월간",
          "element": "수"
        },
        {
          "slot": "월지",
          "element": "화"
        },
        {
          "slot": "일간",
          "element": "화"
        },
        {
          "slot": "일지",
          "element": "화"
        },
        {
          "slot": "시간",
          "element": "화"
        },
        {
          "slot": "시지",
          "element": "토"
        }
      ],
      "monthCommand": {
        "phase": "왕(旺)",
        "season": "여름",
        "direction": "SAME",
        "inCommand": true,
        "phaseMeaning": "계절과 일간이 같은 오행 — 계절이 일간을 그대로 밀어 줍니다"
      },
      "tenGodGroups": [
        {
          "count": 7,
          "group": "비겁",
          "members": [
            "겁재",
            "비견"
          ]
        },
        {
          "count": 4,
          "group": "식상",
          "members": [
            "상관",
            "식신"
          ]
        },
        {
          "count": 2,
          "group": "재성",
          "members": [
            "정재"
          ]
        },
        {
          "count": 1,
          "group": "관성",
          "members": [
            "정관"
          ]
        },
        {
          "count": 1,
          "group": "인성",
          "members": [
            "편인"
          ]
        }
      ],
      "elementCounts": [
        {
          "count": 0,
          "element": "목"
        },
        {
          "count": 5,
          "element": "화"
        },
        {
          "count": 1,
          "element": "토"
        },
        {
          "count": 1,
          "element": "금"
        },
        {
          "count": 1,
          "element": "수"
        }
      ],
      "engineVersion": null,
      "observedSlots": 8,
      "ruleSetVersion": "deokbunai.saju-derived-facts.v1"
    },
    "seoTitle": "병화 일간 · 오화 월지 (시각 정확) — 이런 명식은 어떤 특징이 있나",
    "seoDescription": "정 일간이 오 월지를 만난 명식. 일간·월지·일지·오행 분포를 차례로 읽습니다.",
    "canonicalUrl": null,
    "indexPolicy": "index",
    "publishedAt": "2026-09-04T01:25:31.382238+00:00",
    "related": [
      {
        "slug": "sample-autumn-1788486478466",
        "name": "목 일간 · 금이 강한 가을 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "sample-nohour-1788485118984",
        "name": "경금 일간 · 시각 미상",
        "category": "saju"
      },
      {
        "slug": "byeonghwa-ilgan-summer",
        "name": "병화 일간, 오화 월지",
        "category": "saju"
      },
      {
        "slug": "gyeongsang-ilgan-water",
        "name": "경금 일간, 자수 월지",
        "category": "saju"
      }
    ]
  },
  {
    "slug": "byeonghwa-ilgan-summer",
    "name": "병화 일간, 오화 월지",
    "category": "saju",
    "occupation": null,
    "shortDescription": "여름 태양은 밝은 만큼 마릅니다. 병화 일간이 오화 월지를 만난 명식이 무엇을 반기고 무엇을 조심하는지 봅니다.",
    "bio": "## 이 명식이 말하는 것\n\n병화(丙火)는 태양입니다. 스스로 빛나고 감추지 않습니다.\n그 일간이 오화(午火) 월지를 만나면 득령(得令) — 계절이 자기 편인 구조입니다.\n\n## 이런 명식의 일반적 특징\n\n- **드러나는 것을 두려워하지 않습니다.** 비겁이 왕하면 자기 색이 분명합니다.\n- **과하면 마릅니다.** 화가 지나치면 수(水)로 균형을 찾는 경우가 많습니다.\n- **속도가 빠릅니다.** 시작은 쉽고 마무리에서 갈립니다.\n\n## 주의해서 볼 곳\n\n득령했다는 것은 강하다는 뜻이지 좋다는 뜻이 아닙니다.\n**태어난 시각을 모르면 시주가 비어** 결론의 절반이 사라집니다 — 그 경우 이 글은 참고 범위가 좁아집니다.",
    "birthSource": "estimated",
    "birthSourceNote": null,
    "chart": null,
    "seoTitle": "병화 일간 오화 월지 — 여름 태양 명식의 특징",
    "seoDescription": "병화 일간이 오화 월지에서 득령한 명식. 비겁이 왕한 구조의 일반적 특징과 조후로 수를 반기는 이유, 그리고 시각을 모를 때 좁아지는 해석 범위를 설명합니다.",
    "canonicalUrl": null,
    "indexPolicy": "index",
    "publishedAt": "2026-09-04T00:27:03.969545+00:00",
    "related": [
      {
        "slug": "sample-autumn-1788486478466",
        "name": "목 일간 · 금이 강한 가을 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "sample-nohour-1788485118984",
        "name": "경금 일간 · 시각 미상",
        "category": "saju"
      },
      {
        "slug": "sample-exact-1788485118984",
        "name": "병화 일간 · 오화 월지 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "gyeongsang-ilgan-water",
        "name": "경금 일간, 자수 월지",
        "category": "saju"
      }
    ]
  },
  {
    "slug": "gyeongsang-ilgan-water",
    "name": "경금 일간, 자수 월지",
    "category": "saju",
    "occupation": null,
    "shortDescription": "금이 물을 만나면 날이 서는 대신 흐름을 얻습니다. 경금 일간이 자수 월지를 만난 명식의 특징을 예시로 풀어봅니다.",
    "bio": "## 이 명식이 말하는 것\n\n경금(庚金)은 제련되지 않은 쇠입니다. 단단하지만 아직 쓰임이 정해지지 않았습니다.\n그 일간이 자수(子水) 월지 위에 서면 금생수(金生水) — 자기 기운을 밖으로 내보내는 구조가 됩니다.\n\n## 이런 명식의 일반적 특징\n\n- **말과 판단이 빠릅니다.** 식상이 왕한 구조라 생각이 밖으로 먼저 나갑니다.\n- **틀을 싫어합니다.** 관성이 약하면 규칙보다 자기 기준을 따릅니다.\n- **겨울 금은 차갑습니다.** 조후(調候)로 화(火)를 반기는 경우가 많습니다.\n\n## 주의해서 볼 곳\n\n같은 경금 일간이라도 시주와 대운이 다르면 결론이 달라집니다.\n위 특징은 **월지 하나로 좁힌 일반론**이며, 특정 인물의 성격이나 성취를 단정하지 않습니다.",
    "birthSource": "estimated",
    "birthSourceNote": null,
    "chart": null,
    "seoTitle": "경금 일간 자수 월지 — 이런 명식은 어떤 특징이 있나",
    "seoDescription": "경금 일간이 자수 월지를 만나면 금생수로 기운이 밖으로 흐릅니다. 식상이 왕한 구조의 일반적 특징과, 같은 일간이라도 결론이 갈리는 지점을 예시로 설명합니다.",
    "canonicalUrl": null,
    "indexPolicy": "index",
    "publishedAt": "2026-09-04T00:27:03.847644+00:00",
    "related": [
      {
        "slug": "sample-autumn-1788486478466",
        "name": "목 일간 · 금이 강한 가을 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "sample-nohour-1788485118984",
        "name": "경금 일간 · 시각 미상",
        "category": "saju"
      },
      {
        "slug": "sample-exact-1788485118984",
        "name": "병화 일간 · 오화 월지 (시각 정확)",
        "category": "saju"
      },
      {
        "slug": "byeonghwa-ilgan-summer",
        "name": "병화 일간, 오화 월지",
        "category": "saju"
      }
    ]
  }
];

/** Build stamp — null when this is the committed fallback. */
export const FAMOUS_STATIC_GENERATED_AT: string | null = "2026-09-10T10:41:46.251Z";

export function famousStaticBySlug(slug: string): FamousStaticEntry | null {
  return FAMOUS_STATIC.find((e) => e.slug === slug) ?? null;
}
