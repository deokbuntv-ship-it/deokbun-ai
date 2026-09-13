# 부록 C — `app.json` diff (오너가 직접 반영)

> `app.json` 은 이 레포의 **보호 파일**입니다. 권한 계층이 편집을 거부하고, SHA 불변이
> 규율입니다. 그래서 필요한 변경을 **diff 로만** 남깁니다.
>
> 현재 SHA (앞 16자): `a326af8bfe02c782` — 이번 묶음 시작·끝 모두 같습니다.

---

## C-1. `expo-iap` 플러그인 — **넣어야 결제가 열립니다** (CTO 판정 C4)

`npx expo install expo-iap` 가 자동으로 넣은 줄이고, 보호 파일 규칙에 따라 되돌렸습니다.

파일: `C:\Development\owner_inputs\app.json.expo-iap.diff`

```diff
--- a/app.json
+++ b/app.json
@@ -41,7 +41,8 @@
         {
           "color": "#208AEF"
         }
-      ]
+      ],
+      "expo-iap"
     ],
     "experiments": {
       "typedRoutes": true,
```

**반영 후 `plugins` 전체 모습**:

```json
"plugins": [
  "expo-router",
  [
    "expo-splash-screen",
    {
      "backgroundColor": "#208AEF",
      "image": "./assets/images/splash-icon.png",
      "imageWidth": 76
    }
  ],
  [
    "expo-notifications",
    {
      "color": "#208AEF"
    }
  ],
  "expo-iap"
]
```

**넣지 않으면**: 네이티브 결제 모듈이 빌드에 들어가지 않고, 앱은 그것을 알고
**"준비 중" 을 그대로 보입니다.** 크래시도 가짜 성공도 없습니다.

**넣은 뒤**: `--profile internal` (또는 `production`) 으로 다시 빌드해야 반영됩니다.

---

## C-2. `expo-image` 플러그인 — **넣지 않는 것으로 결론** (CTO 판정 C5)

지난 묶음에서 승인됐던 항목이지만, 이번에 **플러그인 원천을 읽고 판정을 바꿨습니다.**

`node_modules/expo-image/plugin/build/withExpoImage.js` 전문:

```js
const withExpoImage = (config, props) => {
    const disableLibdav1d = props?.disableLibdav1d ?? false;
    return withPodfileProperties(config, (config) => {
        config.modResults['expo-image.disable-libdav1d'] = disableLibdav1d ? 'true' : 'false';
        return config;
    });
};
```

**이 한 줄이 하는 일은 iOS Podfile 속성 하나를 기본값으로 쓰는 것뿐입니다.**

- **Android 에는 아무 영향이 없습니다**
- 기본값(`false`)은 플러그인이 없을 때와 **같습니다**
- 의미가 생기는 것은 `disableLibdav1d: true` 로 **끄고 싶을 때뿐**입니다
  (iOS 바이너리 축소, AVIF 디코딩 포기)

**→ 지금 넣을 이유가 없습니다.** `npx expo install --check` 가 권하는 것은 기능 요구가 아니라
위생 권고입니다.

그래도 넣기로 정하시면:

```diff
--- a/app.json
+++ b/app.json
@@ -41,7 +41,8 @@
         {
           "color": "#208AEF"
         }
-      ]
+      ],
+      "expo-image"
     ],
```

⚠ C-1 과 함께 넣으시려면 배열 끝에 둘 다 넣으십시오:

```json
      ],
      "expo-image",
      "expo-iap"
    ],
```

---

## C-3. `expo-build-properties` — **target API 확인 뒤에만** (CTO 판정 C6)

⚠ **아직 필요한지 모릅니다.** 현재 targetSdk 값을 확인하지 못했습니다
(managed 워크플로라 레포에 설정 원천이 없고, EAS 빌드가 큐에 남았습니다).

빌드 로그에서 `targetSdkVersion` 을 확인하십시오:
`https://expo.dev/accounts/deokbuni/projects/DeokbunAI/builds/f20ebc13-c19b-45cf-825a-32cdc33001ec`

**36 이상이면 아무것도 하지 않습니다.**

36 미만이면 (2026-08-31 부터 신규 제출은 API 36 이상):

```bash
npx expo install expo-build-properties
```

```diff
--- a/app.json
+++ b/app.json
@@ -41,7 +41,16 @@
         {
           "color": "#208AEF"
         }
-      ]
+      ],
+      [
+        "expo-build-properties",
+        {
+          "android": {
+            "targetSdkVersion": 36,
+            "compileSdkVersion": 36
+          }
+        }
+      ]
     ],
```

⚠ 이것은 **네이티브 빌드 설정을 바꾸는 변경**입니다. 넣은 뒤 반드시 실기기에서
설치·로그인·상담까지 한 번 돌려 보십시오 — targetSdk 상향은 권한·백그라운드 동작에
영향을 줄 수 있습니다.
