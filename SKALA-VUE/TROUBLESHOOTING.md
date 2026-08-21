# 트러블슈팅 기록

Weather 상세보기 / 단위 변환 / API 연동 기능을 만들면서 겪은 실수와 해결 과정 기록.

## 1. 상세보기(Detail) 라우팅 연결

### 1-1. 라우터 인스턴스 중복 선언
- **증상**: 빌드/린트 에러 (`Identifier 'router' has already been declared`)
- **원인**: `import router from '../router/index.js'`와 `const router = useRouter()`를 동시에 선언해서 이름 충돌
- **해결**: `useRouter()` composable 하나만 사용, default import 제거

### 1-2. computed에서 `.value` 누락/오사용
- **증상**: 검색어가 비어있을 때 지역 목록이 안 보임
- **원인**: `configStore.weatherList.value`처럼 store 인스턴스에서 이미 언랩된 값에 `.value`를 또 붙임 (배열엔 `.value` 프로퍼티가 없어 `undefined` 반환)
- **해결**: store 인스턴스에서 직접 꺼낸 값은 `.value` 없이 사용 (`configStore.weatherList`)

### 1-3. route params 이름 불일치
- **증상**: 상세 페이지에 항상 "정보 없음"만 뜸
- **원인**: 라우터는 `/weather/:id`로 등록했는데 컴포넌트에서는 `route.params.cityId`를 읽음 (실제 파라미터명은 `id`)
- **해결**: `route.params.id`로 수정

### 1-4. 배열 인덱스 접근으로 도시 조회
- **증상**: `id`가 있는데도 도시를 못 찾음
- **원인**: `configStore.weatherList[id]`처럼 문자열(`"city_01"`)을 배열 인덱스로 사용 — 배열 인덱스는 숫자여야 함
- **해결**: store에 이미 만들어둔 `getCityById(id)`(내부에서 `.find()`로 조회) 사용

### 1-5. 조회 결과를 변수에 대입하지 않음
- **증상**: `getCityById`를 호출은 하는데도 화면엔 계속 "정보 없음"
- **원인**: `configStore.getCityById(id)`만 호출하고 반환값을 `cityData.value`에 대입하지 않음
- **해결**: `cityData.value = configStore.getCityById(id)`

### 1-6. null 가드 없이 템플릿에서 바로 접근
- **증상**: 첫 렌더링 시 `Cannot read properties of null` 에러
- **원인**: `cityData = ref(null)`인데 `onMounted`(렌더링 이후 실행)가 값을 채우기 전에 템플릿이 `cityData.name`을 먼저 읽으려 함
- **해결**: `v-if="cityData"` / `v-else`로 감싸서 값이 있을 때만 렌더링

### 1-7. configStore 최초 작성 시 문법 오류
- **증상**: 스토어 파일 자체가 파싱 실패
- **원인**: `const weatherList = ref([...]),` 뒤에 콤마만 있고 아무 것도 없이 `})`로 닫힘 + `return`문 누락 (setup 스토어는 노출할 값을 직접 `return` 해야 함)
- **해결**: 콤마 제거, `return { weatherList, getCityById }` 추가

## 2. 화씨/섭씨 단위 변환 기능

### 2-1. `defineProps`/`defineEmits`를 일반 함수처럼 오용
- **증상**: 문법 오류
- **원인**: 컴파일러 매크로인 `defineProps`/`defineEmits`를 `import`해서 재할당(`defineProps = (...)`)하려 함
- **해결**: `const props = defineProps({...})`, `const emit = defineEmits([...])` 형태로 호출

### 2-2. 화살표 함수 문법 누락
- **증상**: 문법 오류
- **원인**: `const changeTemp = () { ... }`처럼 `=>` 빠짐
- **해결**: `const changeTemp = () => { ... }`

### 2-3. prop과 로컬 변수 이름 충돌
- **증상**: 변수 재선언 에러
- **원인**: prop으로 `isFahrenheit`를 받으면서 동시에 `const isFahrenheit = ref(false)`로 같은 이름을 로컬에 또 선언
- **해결**: 상태는 store가 소유하도록 컴포넌트에서는 로컬 상태를 만들지 않음 (UnitToggler는 상태 없는 버튼으로 단순화)

### 2-4. ref를 `.value` 없이 통째로 재할당
- **증상**: "Assignment to constant variable" 런타임 에러, 버튼 눌러도 아무 반응 없음
- **원인**: `isFahrenheit = !isFahrenheit` (const로 선언된 ref 바인딩 자체를 덮어쓰려 함)
- **해결**: `isFahrenheit.value = !isFahrenheit.value`

### 2-5. 존재하지 않는 변수 참조
- **증상**: `ReferenceError: rawTemp is not defined`
- **원인**: `displayTemp` computed 안에서 선언된 적 없는 `rawTemp` 참조 (애초에 도시마다 온도가 다른데 단일 변수로 처리하려 한 설계 오류)
- **해결**: 도시별 온도 변환은 각 도시 객체 단위로 처리하도록 설계 변경

### 2-6. setup 스토어 안에서 `this` 사용
- **증상**: `toggleUnit` 클릭해도 무반응, `getCityById`/`toFahrenheit` 호출 시 `Cannot read properties of undefined` 에러
- **원인**: `defineStore('config', () => {...})`(setup 스토어, 함수 기반)에서는 `this`가 스토어 인스턴스를 가리키지 않음. `this.isFahrenheit`, `this.weatherList` 등은 전부 `this`가 `undefined`라 실패
- **해결**: 클로저 스코프에 이미 있는 로컬 변수를 직접 참조 (`isFahrenheit.value`, `weatherList.value`)로 수정

### 2-7. `toFahrenheit`가 인자를 안 받음
- **증상**: 화씨 변환값이 항상 이상하게 나옴/에러
- **원인**: 호출부(`configStore.toFahrenheit(city.temp)`)는 섭씨 값을 인자로 넘기는데, 함수 정의는 매개변수 없이 `this.weatherList.temp`(배열엔 없는 프로퍼티)를 읽으려 함
- **해결**: `const toFahrenheit = (celsius) => Math.round((celsius * 9) / 5 + 32)`로 인자를 받아 변환

### 2-8. 템플릿이 정의되지 않은 변수 참조
- **증상**: 단위 라벨이 항상 "섭씨"로 고정
- **원인**: UnitToggler 템플릿의 `v-if="isFahrenheit"`가 스크립트에 없는 로컬 변수를 참조 (store 값을 안 씀)
- **해결**: `v-if="configStore.isFahrenheit"`로 store 참조

## 3. OpenWeatherMap API(axios) 연동

### 3-1. API 키 하드코딩
- **증상**: (에러는 아님) 보안 이슈
- **원인**: API 키를 소스 코드에 문자열로 직접 작성
- **참고**: `.env`에 `VITE_` 접두사로 넣고 `import.meta.env.VITE_...`로 읽는 방식 권장 (아직 미적용, 커밋 전에 정리 필요)

### 3-2. `await` 뒤에 잘못된 점(dot) 문법
- **증상**: 앱 전체가 백지로 렌더링 안 됨 (모듈 파싱 실패)
- **원인**: `const response = await.axios.get(url)` — `await` 뒤에 `.`은 문법적으로 불가능
- **해결**: `const response = await axios.get(URL)`

### 3-3. axios import 누락
- **증상**: `axios is not defined`
- **원인**: configStore.js에 `axios` import 문 자체가 없었음
- **해결**: `import axios from 'axios'` 추가

### 3-4. 변수명 대소문자 불일치
- **증상**: `url is not defined`
- **원인**: URL을 담은 변수는 `URL`(대문자)로 선언했는데 호출부에서는 `url`(소문자)을 참조
- **해결**: 선언한 변수명 그대로 `URL` 사용

### 3-5. 요청 URL이 도시별 파라미터를 안 씀
- **증상**: 10개 도시 전부 같은 위치(초기 검증에 쓰던 좌표) 날씨만 받아옴
- **원인**: URL 템플릿이 여전히 하드코딩된 위도/경도를 사용, 새로 만든 `city.q`를 반영 안 함
- **해결**: `?lat=...&lon=...` → `?q=${city.q}`로 변경

---

## 배운 점 요약
- Pinia **setup 스토어**(함수형)에서는 `this`를 쓰면 안 되고, 클로저에 있는 로컬 변수를 직접 참조해야 한다.
- `ref` 값은 항상 `.value`로 읽고 쓴다. 단, **store 인스턴스**에서 꺼낸 top-level ref는 Pinia가 자동 언랩해주므로 `.value` 없이 쓴다. (스토어 내부 vs 스토어 바깥에서 관례가 다름)
- `router.push` → 라우터가 URL 패턴 매칭 → `<RouterView>` 위치에 해당 컴포넌트 렌더 → 그 컴포넌트가 `useRoute().params`로 URL 파라미터를 읽는 흐름을 기억할 것.
- 비동기 데이터를 쓰는 화면은 값이 아직 없는 초기 상태(`null`/`undefined`)를 항상 템플릿에서 가드(`v-if`)해야 한다.
- `forEach` 안에서 `async` 함수를 호출하면 각 호출이 서로 기다려주지 않고 병렬로 진행된다 — 순서 보장이 필요하면 다른 방식(`for...of` + `await`, `Promise.all`)이 필요하다.
