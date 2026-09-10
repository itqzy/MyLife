> SpringBoot一路2.x升级到了写这个文章时的4.x。从刚接触SpringBoot框架的时候2.x，到宣布不再支持2.x和jdk8，最低支持jdk17，当时还给了我一点小小的震撼，不是说好了你发任你发，我用Java8吗？ 但是2.x整个不再支持的情况下还是乖乖升级吧。Spring 团队在加速推进现代化，该废弃的废弃，该移除的移除。下面就简单记录下一些曾经的标准写法到现在的不推荐或者直接移除的用法吧。

## 代码层

### @Autowired 字段注入 → 构造器注入

```java
@Controller
public class UserController {
    @Autowired 
    private UserService userSerive;// 无法加 final，测试难搞
}
```

这是体验感影响最大的一个，当时学习Spring的时候所有教程都是所有@Autowired当时觉得真的方便极了，面试还有控制反转和依赖注入的八股文😂 现在变成了不推荐的用法，IDEA中现在也会报红提示不再推荐使用。Spring 官方现在只认可两种注入方式：**构造器注入**和 **Setter 注入**。字段注入已经不作为正式的 DI 选项了。

```java
@Service
public class UserService {
    private final UserMapper userMapper;
    // Spring 4.3 起，单一构造器无需 @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
```

- **过时原因**：字段注入导致 NPE 风险（无法实例化）、对象不可变（`final`）被破坏、隐藏类间依赖、单元测试必须启动容器。

- 推荐构造器注入（配合 Lombok `@RequiredArgsConstructor` 更简洁）。


 ```java
 @RestController
 @RequiredArgsConstructor  // 生成构造器
 public class UserController {
     private final UserService userService; // 不可变，安全
 }
 ```

### @Value散落配置→ @ConfigurationProperties

一直觉得@Value这个注解不好用，自从知道了@ConfigurationProperties注解后我是再也不喜欢用它了，特别是微服务项目有人在代码中写N个这玩意看到就火大😤 再加上nacos中的N个配置文件，人都找麻了。

```java
@Service
public class MailService {
    @Value("${mail.host}")
    private String host;
    @Value("${mail.port}")
    private int port; // 若配置写错，启动不报错，运行时抛异常
}
```



- **过时原因**：配置散落各处难维护，拼写错误只能运行时发现，无类型安全（如端口转 int 需手动转）。

- **替代方案**：

  - 使用 `@ConfigurationProperties` 绑定配置前缀，支持校验和 IDE 补全。

  java

  ```
  @ConfigurationProperties(prefix = "app")
  @Component
  public class AppProperties {
      @NotBlank
      private String name;
      
      @Min(1) @Max(65535)
      private int port;
      
      @NotNull
      private int timeout;
      // getters / setters
  }
  ```

### @Transactional 常见误用

- **过时/错误原因**：只读操作未优化数据库连接；`private` 方法失效；吞掉 `Exception` 导致不回滚（默认只回滚 `RuntimeException`）。

- **旧写法（有坑）**：

  ```java
  @Service
  public class OrderService {
      @Transactional // 没指定 rollbackFor
      public void createOrder() throws Exception {
          // 如果抛出 Exception（非Runtime），不会回滚！
          throw new Exception("error");
      }
      @Transactional // 只读查询不加 readOnly，浪费连接
      public List<Order> getList() { ... }
  }
  ```

  

- **新写法（最佳实践）**：

  java

  ```java
  @Service
  public class OrderService {
      // 增删改：明确指定 rollbackFor
      @Transactional(rollbackFor = Exception.class)
      public void createOrder() throws Exception { ... }
      
      // 查询：明确标注 readOnly，性能优化
      @Transactional(readOnly = true)
      public List<Order> getList() { ... }
  }
  ```



###  System.out.println → SLF4J +  @Slf4j

经典问题，到底是什么神人会在生产代码里留下这玩意啊！

- **过时原因**：无日志级别控制、无法按环境开关、同步阻塞 I/O、脱离 ELK 等日志收集体系。

- **旧写法**：

  ```java
  public class PaymentService {
      public void pay() {
          System.out.println("支付金额：" + amount); // 生产环境无法关闭
      }
  }
  ```

- **新写法**：

  ```java
  import lombok.extern.slf4j.Slf4j;
  @Slf4j
  public class PaymentService {
      public void pay(BigDecimal amount) {
          log.info("支付金额：{}", amount); // 占位符，避免字符串拼接
      }
  }
  ```

###  @Resource  / @Inject 包路径迁移

- **过时原因**：Jakarta EE 9+ 替换 Java EE，`javax` 包名改为 `jakarta`，否则注入完全失效。

-  **旧写法**：

  ```java
  import javax.annotation.Resource;
  @Resource
  private CacheManager cacheManager;
  ```

- **新写法**：

  ```java
  import jakarta.annotation.Resource; // 包名改变
  @Resource
  private CacheManager cacheManager;
  ```

###  Spring  Assert 工具类方法重载移除

这个好多人都没用过，其实就是官方小工具，我让AI总结了一下效果如下：

> Spring Assert 是 Spring Framework 中位于 `org.springframework.util` 包下的一个轻量级断言工具类，主要用于在业务代码中进行‌**防御性参数校验**‌。它通过简洁的静态方法替代繁琐的 `if-throw` 代码块，当条件不满足时抛出运行时异常（通常是 `IllegalArgumentException` 或 `IllegalStateException`），从而提升代码的可读性和整洁度。
>
> 与 JUnit 的断言不同，Spring Assert 始终生效，无需 JVM 参数开启，专为生产环境的参数校验设计，是线上代码的第一道防线。
>
> **核心常用方法**
>
> 1. ‌**非空与内容检查**‌
>    - `notNull(Object object, String message)`：检查对象是否为 `null`，否则抛出异常。
>    - `hasText(String text, String message)`：检查字符串是否不为 `null` 且包含非空白字符（即 trim 后长度大于 0）。
>    - `hasLength(String text, String message)`：检查字符串是否不为 `null` 且长度大于 0（允许纯空格）。
>    - `notEmpty(Collection/Map/Array, String message)`：检查集合、映射或数组是否不为 `null` 且至少包含一个元素。
> 2. ‌**布尔条件与状态检查**‌
>    - `isTrue(boolean expression, String message)`：检查表达式是否为 `true`，常用于复杂逻辑校验。
>    - `state(boolean expression, String message)`：功能类似 `isTrue`，但抛出 `IllegalStateException`，语义上更适用于对象状态不符合预期的场景。
> 3. ‌**类型与元素检查**‌
>    - `isInstanceOf(Class clazz, Object obj, String message)`：检查对象是否为指定类的实例。
>    - `noNullElements(Collection/Array, String message)`：遍历集合或数组，确保其中不包含 `null` 元素。
>
>  **代码对比示例**
>
> 使用 Assert 可以显著简化传统的参数校验逻辑：
>
> ```
> java// 传统写法
> public void register(String username, Integer age) {
>     if (username == null || username.trim().isEmpty()) {
>         throw new IllegalArgumentException("用户名不能为空");
>     }
>     if (age == null || age < 0) {
>         throw new IllegalArgumentException("年龄必须大于等于 0");
>     }
>     // 业务逻辑...
> }
> 
> // 使用 Spring Assert 重构
> public void register(String username, Integer age) {
>     Assert.hasText(username, "用户名不能为空");
>     Assert.isTrue(age != null && age >= 0, "年龄必须大于等于 0");
>     // 业务逻辑...
> }
> ```
>
> **高级特性与最佳实践**
>
> - ‌**延迟消息构建**‌：Spring 5.0+ 版本支持传入 `Supplier<String>` 作为消息参数。仅在断言失败时才生成消息字符串，避免在正常路径下产生不必要的性能开销。
> - ‌**统一异常处理**‌：Assert 抛出的 `IllegalArgumentException` 可配合全局异常处理器（如 `@RestControllerAdvice`），统一转换为标准的 HTTP 400 错误响应，便于前端处理。
> - ‌**适用场景**‌：最适合在公共方法入口处进行快速失败（Fail-fast）校验；对于复杂的跨字段校验或数据库校验，仍需结合自定义逻辑，但可用 `isTrue` 作为最终断言。

- **过时原因**：Spring 6.0 移除了不带 `message` 参数的断言方法，必须显式提供异常信息。

- **旧写法**：

  ```java
  import org.springframework.util.Assert;
  Assert.notNull(obj); // 编译报错
  ```

- **新写法**：

  ```java
  Assert.notNull(obj, "对象不能为空");
  ```

### Joda-Time 支持完全移除

无人在意的路边。

- **过时原因**：Java 8 已内置 `java.time` (JSR-310)，Joda-Time 历史使命完成。

-  **旧写法**：

  ```java
  import org.joda.time.DateTime;
  DateTime now = new DateTime();
  ```

- **新写法**：

  ```java
  import java.time.LocalDateTime;
  LocalDateTime now = LocalDateTime.now();
  ```

###  @MockBean / @SpyBean  逐步废弃

无人在意的路边。

- **过时原因**：Spring Boot 3.4 标记废弃，推荐使用 Spring Boot 自带的 `@MockitoBean` 或原生 Mockito。

-  **旧写法**：

  ```java
  @SpringBootTest
  public class UserServiceTest {
      @MockBean
      private UserDao userDao; // 已废弃
  }
  ```

  

- **新写法**（Spring Boot 3.4+）：

  ```java
  @SpringBootTest
  public class UserServiceTest {
      @MockitoBean // 替代 @MockBean
      private UserDao userDao;
  }
  ```

## 框架层

### WebSecurityConfigurerAdapter 继承 →  SecurityFilterChain Bean

Spring Security这个是真在用，也真要改。这是 Spring Security 最大的 API 变更。如果你从 Spring Boot 2.x 升级到 3.x，代码里还继承 `WebSecurityConfigurerAdapter`，编译都过不了。

注意配套的 API 也全换了：`antMatchers()` → `requestMatchers()`，`authorizeRequests()` → `authorizeHttpRequests()`。这些是跟着 `WebSecurityConfigurerAdapter` 一起被清理的。

- **过时原因**：Spring Security 5.7 废弃，6.0 直接移除（因组件化设计不再需要继承适配器）。

-  **旧写法**：

  ```java
  @Configuration
  public class SecurityConfig extends WebSecurityConfigurerAdapter {
      @Override
      protected void configure(HttpSecurity http) throws Exception {
          http.authorizeRequests().antMatchers("/**").permitAll();
      }
  }
  ```

-  **新写法**（Lambda 风格 + 新 API）：

  ```java
  @Configuration
  public class SecurityConfig {
      @Bean
      public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          http.authorizeHttpRequests(auth -> auth
              .requestMatchers("/public").permitAll()  // antMatchers → requestMatchers
              .anyRequest().authenticated()
          );
          return http.build();
      }
  }
  ```

### RestTemplate → RestClient（同步）

无人在意的路边。如果你需要响应式场景，请用 **WebClient**。

- **过时原因**：官方计划 Spring Framework 7.1 废弃、8.0 移除，`RestClient` 更 fluent、更易测试。

- **旧写法**：

  ```java
  RestTemplate restTemplate = new RestTemplate();
  String res = restTemplate.getForObject("http://api.com", String.class);
  ```

- **新写法**：

  ```java
  RestClient restClient = RestClient.create();
  String res = restClient.get()
      .uri("http://api.com")
      .retrieve()
      .body(String.class);
  ```



###  WebMvcConfigurerAdapter  继承 → 直接实现接口

- **过时原因**：Java 8 接口支持默认方法，适配器类已无存在必要（Spring 5.0 废弃）。

-  **旧写法**：

  ```java
  @Configuration
  public class WebConfig extends WebMvcConfigurerAdapter { ... }
  ```

  

- **新写法**：

  ```java
  @Configuration
  public class WebConfig implements WebMvcConfigurer { ... } // 直接实现
  ```

- **⚠️ 特别注意**：不要误用 `WebMvcConfigurationSupport` 或 `@EnableWebMvc`，否则会覆盖 Spring Boot 的自动配置，导致静态资源等失效。

### URL 路径尾部斜杠匹配变更

Spring Framework 6.0 中，尾部斜杠匹配配置选项已废弃，默认值设为 `false`。这意味着 `/users` 和 `/users/` 不再默认视为相同路径。我看谁还在路由后面写斜杠！！！

- **过时原因**：Spring 6.0 默认禁止尾部斜杠匹配（`/users` 不再默认匹配 `/users/`），防止歧义和缓存污染。

-  **旧行为（依赖默认匹配）**：访问 `/users/` 自动转发到 `/users`。

-  **新配置（如需开启，现需显式声明）**：

  ```properties
  # application.yml
  spring:
    mvc:
      pathmatch:
        matching-strategy: ANT_PATH_MATCHER # 但官方更推荐严格匹配
  ```

  或直接规范前端请求路径，避免使用尾部斜杠。

### RPC 远程调用支持（Hessian / HTTP Invoker）已移除

无人在意的路边。

- **过时原因**：Spring Framework 6.0 彻底移除多年废弃的 RPC 风格支持（Hessian、JMS Invoker、JAX-WS）。
- **旧写法**（已无法编译）：原引入 HessianProxyFactoryBean 等
- **新写法**：改用`WebClient` 或 gRPC/Feign 等现代方案。

### Ehcache 2.x 缓存支持移除

用过几次，还是用Redis吧。

- **过时原因**：Spring 6.0 移除了 `org.springframework.cache.ehcache` 包。

-  **旧写法**（依赖 `net.sf.ehcache:ehcache`）：

  ```xml
  <dependency>
      <groupId>net.sf.ehcache</groupId>
      <artifactId>ehcache</artifactId>
  </dependency>
  ```

  

- **新写法**：迁移至 **Caffeine**（推荐）或 Ehcache 3（通过 JCache API）。

  ```xml
  <dependency>
      <groupId>com.github.ben-manes.caffeine</groupId>
      <artifactId>caffeine</artifactId>
  </dependency>
  ```

### Actuator Endpoint 访问控制属性重构

- **过时原因**：Spring Boot 3.4 废弃 `enabled-by-default`，使用更细粒度的 `access` 模型（`none`/`read-only`/`unrestricted`）。

-  **旧写法**：

  ```properties
  management.endpoints.enabled-by-default=true
  management.endpoint.health.enabled=true
  ```

-  **新写法**：

  ```properties
  management.endpoints.access.default=read-only
  management.endpoint.health.access=unrestricted
  ```

## 生态层

### javax.* 全面迁移至  jakarta.*

> Spring Boot 3.0 把所有 `javax.*` 包迁移到 `jakarta.*`。这个必须改，不改就编译不通过。
>
> 受影响的包包括：`javax.servlet` → `jakarta.servlet`，`javax.persistence` → `jakarta.persistence`，`javax.validation` → `jakarta.validation`，`javax.annotation` → `jakarta.annotation`，`javax.transaction` → `jakarta.transaction`，`javax.mail` → `jakarta.mail`。
>
> 迁移手段很简单，IDE 全局搜索替换 import 语句就行。如果项目大，可以用 **OpenRewrite** 做自动化重构。但要特别注意，第三方依赖也必须升级到 Jakarta EE 9+ 兼容版本，否则会类冲突。

这个当时网上骂声一片，我持中立态度，影响还好。

- **过时原因**：Oracle 将 Java EE 移交 Eclipse 基金会，Jakarta EE 9+ 强制改名，涉及所有 Servlet、JPA、Bean Validation 等。

- **旧写法**：

  ```java
  import javax.servlet.http.HttpServletRequest;
  import javax.persistence.Entity;
  import javax.validation.Valid;
  ```

-  **新写法**（全局替换）：

  ```java
  import jakarta.servlet.http.HttpServletRequest;
  import jakarta.persistence.Entity;
  import jakarta.validation.Valid;
  ```

### JUnit 4 @RunWith(SpringRunner.class) → JUnit 5 单一注解

省流：省事了。

- **过时原因**：JUnit 5 的 `@SpringBootTest` 已内置了 `SpringExtension`，无需额外注册。

-  **旧写法**：

  ```java
  @RunWith(SpringRunner.class)
  @SpringBootTest
  public class AppTest { ... }
  ```

- **新写法**：

  ```java
  @SpringBootTest // 单独使用即可
  public class AppTest { ... }
  ```

### 异常处理 → 标准化  ProblemDetail（RFC 7807）

这就是Java，连返回值都定义了标准，它真的我哭死😭

- **过时原因**：传统返回自定义 Map 非标准，前端需反复适配；Spring 6 内置 `ProblemDetail` 提供通用标准。

-  **旧写法**：

  ```java
  @ControllerAdvice
  public class GlobalHandler {
      @ExceptionHandler(Exception.class)
      @ResponseBody
      public Map<String, Object> handle() {
          Map<String, Object> map = new HashMap<>();
          map.put("code", 500);
          map.put("msg", "error");
          return map;
      }
  }
  ```

- **新写法**：

  ```java
  @ControllerAdvice
  public class GlobalHandler {
      @ExceptionHandler(Exception.class)
      public ProblemDetail handle(Exception ex) {
          ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
          pd.setTitle("系统异常");
          pd.setDetail(ex.getMessage());
          pd.setProperty("timestamp", Instant.now()); // 可扩展自定义字段
          return pd;
      }
  }
  ```

### JAXB API 依赖冲突（必须移除）

- **过时原因**：Spring Boot 3 使用 Jakarta EE，若项目中为了 Java 9+ 兼容而手动添加了 `javax.xml.bind:jaxb-api`，会引发类冲突。

- **旧依赖（需删除）**：

  ```xml
  <dependency>
      <groupId>javax.xml.bind</groupId>
      <artifactId>jaxb-api</artifactId>
  </dependency>
  ```

  

- **新方案**：直接移除该依赖，Spring Boot 3 会自动引入 `jakarta.xml.bind` 的兼容实现。

### JDK 基线强制升级（构建配置变更）

- **过时原因**：Spring Boot 3.x 要求 JDK 17+，不再支持 Java 8/11。

-  **旧 `pom.xml` 配置**：

  ```xml
  <properties>
      <java.version>1.8</java.version>
  </properties>
  ```

- **新配置**：

  ```xml
  <properties>
      <java.version>17</java.version> <!-- 或 21、25 -->
  </properties>
  ```

### org.codehaus.groovy 包迁移至 org.apache.groovy

- **过时原因**：Groovy 项目捐赠给 Apache，groupId 变更。

-  **旧依赖**：

  ```xml
  <groupId>org.codehaus.groovy</groupId>
  ```

- **新依赖**：

  ```xml
  <groupId>org.apache.groovy</groupId>
  ```

  

### Testcontainers 动态属性注入方式变更

- **过时原因**：Spring Boot 3.4 废弃直接注入 `DynamicPropertyRegistry`，避免 bean 污染。

- **旧写法**：

  ```java
  @Container
  static PostgreSQLContainer<?> postgres = ...;
  @DynamicPropertySource
  static void props(DynamicPropertyRegistry registry) {
      registry.add("spring.datasource.url", postgres::getJdbcUrl);
  }
  ```

  

- **新写法**（返回 `DynamicPropertyRegistrar` Bean）：

  ```java
  @Bean
  public DynamicPropertyRegistrar postgresProperties() {
      return registry -> registry.add("spring.datasource.url", postgres::getJdbcUrl);
  }
  ```

  