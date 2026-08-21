# 회원가입 · 로그인 구현 가이드 (피드백)

> 대상 API
> - `POST /api/customers` — ID·비밀번호로 가입, 초기 포인트 지급
> - `POST /api/customers/login` — 로그인 성공 시 인증 확인 (JWT는 생략)
>
> 이 문서는 정답 코드를 그대로 주는 게 아니라, **지금까지 작성한 코드(User/UserDto/UserRepository/UserService)를 기준으로** 무엇을 고치고 무엇을 채워야 하는지 단계별로 안내합니다. 빈칸(`// TODO`)은 직접 채워보세요.

---

## 0. 범위 재확인

- **안 해도 됨**: JWT 발급/검증, Docker
- **자유 선택**: Actuator, AOP, Frontend
- **채점 기준**: 추가 구현보다 **필수 기능의 가독성·정확성**이 우선

JWT를 안 쓴다는 건, 로그인 이후 "이 요청을 보낸 사람이 누구인지"를 토큰으로 식별할 수 없다는 뜻이에요. 지금 당장은 회원가입/로그인만 구현하면 되니 큰 문제는 아니지만, 나중에 주문 API(`/api/customers/order`)를 만들 때는 **요청 body에 `customerId`를 직접 받는 방식**으로 단순화하는 게 현실적입니다. (참고만 해두세요, 지금 할 일은 아닙니다.)

---

## 1. 가장 먼저 정할 것: `User`로 갈지 `Customer`로 갈지

과제 PDF의 스펙(3~4페이지)을 보면 엔티티는 이렇게 정의되어 있어요.

| 속성 | 타입 |
|---|---|
| customerId | **String** (PK, 자동증가 아님!) |
| customerPassword | String |
| customerPoint | Double |

그런데 지금 작성하신 `User.java`는:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;          // ← PK가 숫자 자동증가

private String username;  // customerId 역할을 하는 것으로 보임
private String password;
private String email;     // 스펙에는 없는 필드
private Integer quantity; // Product 복붙 잔재로 보임 (용도 불명)
```

**왜 이 차이가 중요하냐면**: API 요청 JSON은 이렇게 옵니다.

```json
{ "customerId": "skala01", "customerPassword": "pw1234" }
```

지금 구조대로면 `username`을 그대로 회원 식별자로 쓰되, PK는 별도의 `Long id`가 됩니다. **이것도 동작은 하지만**, 이후 `GET /api/customers/{customerId}` 처럼 문자열 ID로 직접 조회하는 API를 만들 때 PK(Long)와 조회키(String)가 분리되어 있어서 매번 `findByUsername`을 거쳐야 하는 번거로움이 생겨요.

**직접 판단해보세요** — 질문에 답하면서 결정하면 됩니다:
1. 로그인/주문 시 고객을 찾을 때 `id`(숫자)로 찾고 싶은가요, `customerId`(문자열)로 찾고 싶은가요?
2. `@Id`로 문자열을 직접 쓰면(`@GeneratedValue` 없이) `INSERT` 시 PK를 내가 직접 정해줘야 하는데, 회원가입 시 사용자가 입력한 `customerId`를 그대로 넣으면 되지 않을까요?

**추천**: 스펙과 동일하게 `customerId`(String)를 `@Id`로 직접 쓰는 구조로 바꾸는 걸 권장합니다. 아래는 참고용 스켈레톤이고, 필드명·클래스명은 본인이 정하세요 (User를 유지해도 되고, Customer로 바꿔도 됩니다 — 다만 API 경로가 `/api/customers`이니 도메인 용어를 Customer로 통일하면 나중에 헷갈릴 일이 적습니다).

```java
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
public class User { // 또는 Customer로 리네이밍
    @Id
    private String customerId;      // 자동생성 아님 — 가입 시 사용자가 준 값을 그대로 PK로

    @Column(nullable = false)
    private String customerPassword;

    @Column(nullable = false)
    private Double customerPoint;

    // TODO: customerId, 초기 포인트를 받는 생성자 추가
}
```

> `orderItems` 리스트 필드는 **지우는 걸 권장**합니다. 지금 `User`(29~31행)와 `OrderItem`(17행) 양쪽에서 같은 `user_id` 컬럼을 각자 `@JoinColumn`으로 선언하고 있는데, `mappedBy` 없이 이렇게 양방향처럼 두면 Hibernate가 두 개의 독립된 단방향 관계로 착각해서 저장 시 데이터가 꼬일 수 있어요. 스펙에도 Customer 엔티티에 주문 목록 필드는 없습니다 — 필요할 때 `OrderItemRepository.findByCustomer_CustomerId(...)`로 조회하면 됩니다 (2-3단계에서 다룰 내용).

---

## 2. 지금 코드에서 컴파일이 안 되는 이유 (버그 2개)

### (1) `UserService.java:16`
```java
public createUser(User user){
```
반환 타입이 없고 `User` import도 없어서 컴파일 자체가 안 됩니다.
**생각해볼 것**: 이 메서드가 호출한 쪽(컨트롤러)에게 뭘 돌려줘야 할까요? 성공 여부만? 생성된 고객 정보(비밀번호 제외)? → 반환 타입을 정하고 나면 시그니처가 자연스럽게 나옵니다.

### (2) `UserRepository.java:13`, `ProductRepository.java:13` — 둘 다 동일한 버그
```java
User findById(Long id);
```
`JpaRepository`가 이미 `Optional<User> findById(Long id)`를 정의합니다. 반환 타입만 다르게 재정의하면 자바에서 **오버라이드 충돌**로 컴파일 에러가 나요. 두 파일 모두 이 줄을 **삭제**하세요 — `JpaRepository`가 상속으로 이미 제공합니다 (`Optional<User>` 형태로).

같은 이유로 `findByUsername`, `findByEmail`도 `User`가 아니라 `Optional<User>`로 바꾸는 걸 추천합니다. 지금처럼 `User`를 직접 반환하면, 없는 아이디를 조회했을 때 `null`이 돌아오고 그걸 모르고 `.getPassword()`를 호출하면 `NullPointerException`이 터집니다. `Optional`로 받으면 서비스 코드에서 `.isPresent()` / `.orElseThrow(...)`로 "없을 때 뭘 할지"를 명시적으로 강제할 수 있어요.

```java
Optional<User> findByCustomerId(String customerId); // 예시 (필드명 바꾼 경우)
```

---

## 3. 예외 처리 최소 뼈대가 필요한 이유

PDF 4페이지 "비즈니스 규칙"을 보면:
- 중복 아이디 가입 → `DATA_DUPLICATED`
- 없는 고객/상품 조회 → `DATA_NOT_FOUND`
- 필수값 검증 실패 → `ParameterException`
- 로그인 실패(비번 불일치) → `NOT_AUTHENTICATED`

지금은 서비스 메서드가 "성공 케이스"만 가정하고 있는데, 실패 케이스를 표현할 방법이 없어요. 이것 없이 회원가입을 구현하면 `if (중복이면) return null;` 같은 코드가 되기 쉽고, 컨트롤러에서 `null` 체크를 매번 반복하게 됩니다.

**최소한만** 만들어두면 됩니다 (완벽하게 만들 필요 없음, 지금 단계에 필요한 만큼만):

```java
// exception/Error.java
public enum Error {
    DATA_NOT_FOUND,
    DATA_DUPLICATED,
    NOT_AUTHENTICATED
    // 필요할 때 INSUFFICIENT_FUNDS 등 추가
}
```

```java
// exception/ResponseException.java
public class ResponseException extends RuntimeException {
    private final Error error;

    public ResponseException(Error error) {
        super(error.name());
        this.error = error;
    }
    // TODO: getter
}
```

```java
// exception/ParameterException.java
public class ParameterException extends RuntimeException {
    public ParameterException(String... fields) {
        super("필수 파라미터 누락: " + String.join(", ", fields));
    }
}
```

이걸 만들어두면 서비스 코드가 이렇게 **읽기 쉬워집니다**:

```java
if (customerId == null || customerId.isBlank()) {
    throw new ParameterException("customerId", "customerPassword");
}
if (userRepository.findByCustomerId(customerId).isPresent()) {
    throw new ResponseException(Error.DATA_DUPLICATED);
}
```

> `@RestControllerAdvice`로 전역 예외 처리(`GlobalExceptionHandler`)까지 만들면 컨트롤러마다 try-catch를 반복 안 해도 되지만, 지금 단계에서는 필수는 아니에요. 일단 서비스 로직부터 완성하고, 나중에 여유 있으면 추가하세요.

---

## 4. 회원가입 구현 — 단계별로 채워보기

### 4-1. 요청/응답 DTO부터 분리

지금 `UserDto`는 `password`까지 포함한 하나의 record라서, 이걸 응답에도 그대로 쓰면 **비밀번호가 API 응답에 노출**됩니다. 최소 2개로 나누세요.

```java
// dto/SignupRequest.java
public record SignupRequest(String customerId, String customerPassword) {}
```

```java
// dto/CustomerResponse.java  (비밀번호 없음!)
@Builder
public record CustomerResponse(String customerId, Double customerPoint) {}
```

**생각해볼 것**: 기존 `UserDto`는 지워도 되고, 다른 용도(수정용 등)로 남겨둬도 됩니다. 다만 회원가입 응답에는 절대 비밀번호 필드를 넣지 마세요.

### 4-2. Repository — 중복 체크용 메서드

```java
public interface UserRepository extends JpaRepository<User, String> { // PK가 String이 됐다면 여기도 String
    Optional<User> findByCustomerId(String customerId); // PK가 String이면 findById()로 충분할 수도 있음 — 생각해보기
}
```

> 힌트: PK를 `customerId`로 바꾸면, `JpaRepository<User, String>`이 제공하는 `findById(String)`이 곧 "customerId로 찾기"가 됩니다. 별도 메서드가 필요 없을 수도 있어요.

### 4-3. Service — 로직 순서 (의사코드 + 빈칸)

```java
@Service
@RequiredArgsConstructor   // final 필드 생성자 자동 생성 (지금처럼 직접 생성자 안 써도 됨)
public class UserService {
    private final UserRepository userRepository;

    private static final double INITIAL_POINT = 1_000_000; // TODO: 값은 본인이 정하기 (과제 예시 흐름 참고)

    public CustomerResponse createCustomer(SignupRequest request) {
        // 1) 입력값 검증
        //    customerId나 customerPassword가 비어있으면?
        //    → throw new ParameterException("customerId", "customerPassword");

        // 2) 중복 아이디 체크
        //    userRepository.findById(request.customerId())가 이미 있으면?
        //    → throw new ResponseException(Error.DATA_DUPLICATED);

        // 3) User(또는 Customer) 엔티티 생성
        //    PK, 비밀번호, 초기 포인트(INITIAL_POINT) 세팅

        // 4) 저장
        //    userRepository.save(...)

        // 5) 응답 DTO로 변환해서 반환 (비밀번호는 절대 포함하지 않기)
        return null; // TODO
    }
}
```

**막힐 만한 지점 미리 짚기**:
- "저장은 어떻게?" → `userRepository.save(user)`는 저장 후 **저장된 엔티티를 반환**합니다. 그 반환값을 그대로 DTO로 변환하면 됩니다.
- "비밀번호도 그대로 저장해도 되나?" → 보안상으로는 해시(BCrypt)해서 저장하는 게 맞지만, 이번 과제에서 Spring Security 없이 진행하기로 했다면 평문 저장도 기능적으로는 동작합니다. **평문으로 갈 경우, 로그인 시 비교도 단순 `equals()`면 됩니다.** (보안 관점에서 아쉬운 부분이라는 것만 인지하고 넘어가면 됩니다 — 필수 요구사항은 아님)

---

## 5. 로그인 구현 — 단계별로 채워보기

JWT가 없으니 "로그인 성공 시 뭘 돌려줄 것인가"만 결정하면 됩니다. 가장 단순한 방법: **성공 여부 + 고객 정보(포인트 포함)를 그대로 응답**하고, 이후 주문 API는 body에 `customerId`를 직접 받는 방식으로 갑니다.

### 5-1. 요청 DTO

```java
public record LoginRequest(String customerId, String customerPassword) {}
```

### 5-2. Service 로직 (의사코드)

```java
public CustomerResponse login(LoginRequest request) {
    // 1) 입력값 검증 (비어있으면 ParameterException)

    // 2) customerId로 조회
    //    없으면 → throw new ResponseException(Error.DATA_NOT_FOUND);
    User user = userRepository.findById(request.customerId())
            .orElseThrow(() -> new ResponseException(Error.DATA_NOT_FOUND));

    // 3) 비밀번호 비교
    //    user.getCustomerPassword().equals(request.customerPassword()) 가 false면
    //    → throw new ResponseException(Error.NOT_AUTHENTICATED);

    // 4) 성공 시 CustomerResponse로 변환해서 반환
    return null; // TODO
}
```

**질문**: `createCustomer`와 `login` 둘 다 "User → CustomerResponse 변환"을 하고 있죠? 이 변환 로직을 별도 `private` 메서드나 `CustomerResponse`의 정적 팩토리 메서드(`CustomerResponse.from(user)`)로 뽑아내면 중복이 줄어듭니다. 한번 시도해보세요.

---

## 6. 컨트롤러 — 여기는 거의 그대로 연결만 하면 됩니다

```java
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    public CustomerResponse createCustomer(@RequestBody SignupRequest request) {
        return userService.createCustomer(request);
    }

    @PostMapping("/login")
    public CustomerResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }
}
```

> 지금은 컨트롤러가 아예 없는 상태라, 위 두 메서드만 있어도 API 자체는 살아납니다. 예외가 터졌을 때 어떤 HTTP 상태 코드로 응답할지(400? 404? 409?)는 `GlobalExceptionHandler`를 만들 때 정하면 되고, 지금은 일단 예외가 스프링 기본 에러 응답(500)으로라도 나가는 걸 먼저 확인하세요.

---

## 7. 직접 테스트해보기 (Postman / curl)

```bash
# 회원가입
curl -X POST localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{"customerId":"skala01","customerPassword":"pw1234"}'

# 같은 아이디로 다시 가입 시도 → DATA_DUPLICATED 나는지 확인
curl -X POST localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{"customerId":"skala01","customerPassword":"pw1234"}'

# 로그인 (성공)
curl -X POST localhost:8080/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"customerId":"skala01","customerPassword":"pw1234"}'

# 로그인 (비번 틀림) → NOT_AUTHENTICATED 나는지 확인
curl -X POST localhost:8080/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"customerId":"skala01","customerPassword":"wrong"}'
```

## 8. 셀프 체크리스트

- [ ] `UserRepository`/`ProductRepository`의 `findById` 중복 선언 삭제했는가
- [ ] `UserService.createUser` 컴파일 에러 해결했는가
- [ ] 응답 DTO에 비밀번호가 안 담기는가
- [ ] 중복 아이디로 가입 시도하면 명확한 에러가 나는가
- [ ] 빈 값(`""`)으로 가입/로그인 시도하면 `ParameterException`이 나는가
- [ ] 로그인 성공 시 `customerPoint`가 응답에 잘 담기는가
- [ ] `User.orderItems` 필드(양방향 매핑 충돌 우려) 정리했는가

---

이 정도가 회원가입/로그인 두 API를 완성하는 데 필요한 전부입니다. 막히는 부분이 생기면 어느 단계(4-3, 5-2 등)에서 막혔는지 알려주시면 그 지점만 더 구체적으로 짚어드릴게요.
