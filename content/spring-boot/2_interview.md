# Spring Boot — Interview Prep

> **Goal of this file:** Prepare you to confidently answer technical interview questions about Spring and Spring Boot. Assumes you have completed `0_foundation.md` and `1_understand.md`, and that you already know Java — see the Java curriculum for language questions.

> **Build status:** All twelve topic groups are written. Every group in the table of contents below is complete.

---

## 📖 Master Table of Contents

1. [[#1. Spring Core & Dependency Injection]] ✅
2. [[#2. Spring Boot Fundamentals]] ✅
3. [[#3. REST APIs with Spring MVC]] ✅
4. [[#4. Backend Architecture & Layering]] ✅
5. [[#5. SQL & Relational Data Modelling]] ✅
6. [[#6. JPA & Hibernate]] ✅
7. [[#7. Transactions & Data Consistency]] ✅
8. [[#8. Spring Security & JWT]] ✅
9. [[#9. Testing Spring Applications]] ✅
10. [[#10. Caching & Messaging]] ✅
11. [[#11. Packaging, Deployment & Observability]] ✅
12. [[#12. Putting It Together: a Production Service]] ✅

---

## 1. Spring Core & Dependency Injection

### Table of Contents (this group)
- [[#1.1 What Spring Is]]
- [[#1.2 Inversion of Control]]
- [[#1.3 The ApplicationContext]]
- [[#1.4 Beans and the Bean Lifecycle]]
- [[#1.5 Component Scanning and Stereotypes]]
- [[#1.6 Dependency Injection Styles]]
- [[#1.7 Configuration Classes and @Bean]]
- [[#1.8 Bean Scopes]]
- [[#1.9 Qualifiers and Ambiguity]]
- [[#1.10 Proxies and AOP]]

---

### 1.1 What Spring Is

#### Definition
Spring is a modular Java framework whose core is a dependency-injection container; the surrounding modules add web, data access, security, messaging and testing support on top of that container.

#### Why it exists
Because building and wiring an application's objects — and wrapping them in transactions or security — had to be hand-written plumbing tied to every class. A container that owns construction removes that plumbing, and since it builds every object it can also wrap them: one mechanism, both problems solved.

#### Interview explanation
Start from the problem — every application must assemble a graph of objects and apply cross-cutting concerns to them — and present Spring as the container that does both. Say "container first, modules second": that framing explains why the same programming model appears across web, data and messaging. Then mention Spring Boot as the opinionated layer that configures those modules, and note that Spring 6 / Boot 3 requires Java 17+ and the `jakarta.*` namespace.

#### Syntax
```java
@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}
```

#### Example
```java
@Service
public class OrderService {                 // a plain class…
    private final OrderRepository repository;
    public OrderService(OrderRepository repository) { this.repository = repository; }
}
// …that the container instantiates, wires and can wrap with transactions or caching
```

#### Common interview questions
- "What is the Spring Framework?" (A modular framework built around a dependency-injection container, with modules for web, data, security and messaging layered on it.)
- "What is the difference between Spring and Spring Boot?" (Spring is the framework; Spring Boot adds auto-configuration, starter dependencies, an embedded server and sensible defaults so an application runs with almost no configuration.)
- "Why did Spring succeed over EJB?" (Plain Java objects instead of components implementing framework interfaces, no application server required, and testability without a container.)
- "What changed in Spring 6 / Boot 3?" (Java 17 baseline, `javax.*` to `jakarta.*` namespace migration, and ahead-of-time processing for native images.)

#### Follow-up questions
- "Is Spring only for web applications?" (No — the core container has nothing to do with HTTP; batch jobs, CLI tools and message consumers all use it.)
- "What is a POJO and why does it matter here?" (A plain old Java object with no framework inheritance requirements; it is what makes Spring components testable with `new`.)
- "What are the costs of using Spring?" (Startup time, a large API surface, and behaviour applied through proxies that is not visible in the source.)

#### Edge cases
- Spring Boot 3 requires Jakarta EE APIs, so libraries still on the old Java EE packages (`javax.servlet`, `javax.persistence`) fail — the package names they import simply no longer exist at runtime.
- Your classes do not need the container to exist — you can instantiate and test them directly — because Spring only assembles plain objects rather than requiring you to extend its classes.
- Native images via GraalVM break some runtime-dynamic patterns, because everything reflective or proxied must be known at build time; those cases need explicit hints.

#### Common mistakes
- Calling Spring "a web framework" in an interview.
- Confusing Spring Framework versions with Spring Boot versions.
- Assuming every Spring feature needs a running container to test.

#### Comparisons

| | Spring Framework | Spring Boot |
|---|---|---|
| Provides | Container and modules | Auto-configuration and defaults |
| Server | You provide one | Embedded, included |
| Configuration | Explicit | Convention, overridable |

#### Frequently confused with
Spring versus Spring Boot versus Spring Cloud — core framework, opinionated defaults, and distributed-systems add-ons respectively.

#### Important facts to remember
- The core is a DI container — everything else is built on the fact that it creates your objects.
- Boot 3 requires Java 17 and `jakarta.*` — the namespace moved when Java EE became Jakarta EE.
- Components are plain classes — which is why they are testable without Spring.

---

### 1.2 Inversion of Control

#### Definition
A design principle in which the framework, not your class, controls construction and flow — dependency injection being its most common form.

#### Why it exists
Because a class that builds its own collaborators is welded to one implementation and its configuration: changing the database or substituting a test double means editing the class. Moving construction outside the class breaks that weld, so the same class works with whatever it is handed.

#### Interview explanation
Open with the problem — `new JdbcOrderRepository(...)` inside a service hard-codes both the implementation and its configuration. Then define IoC as the general principle and DI as the technique. Then make the practical point: with DI you can unit-test a service by calling its constructor with fakes, no container involved — which is the reason the principle pays off.

#### Syntax
```java
public class OrderService {
    private final OrderRepository repository;
    public OrderService(OrderRepository repository) { this.repository = repository; }
}
```

#### Example
```java
// Production: Spring injects the JPA repository
// Test: you inject a fake, with no Spring at all
var service = new OrderService(new InMemoryOrderRepository());
assertThat(service.place(order)).isNotNull();
```

#### Common interview questions
- "What is inversion of control?" (The framework controls object creation and flow instead of your code; your class declares what it needs rather than building it.)
- "How is dependency injection related to IoC?" (DI is one implementation of IoC — supplying collaborators from outside.)
- "What problem does it solve?" (Tight coupling to concrete implementations, which makes code hard to change and hard to test.)
- "What are the types of dependency injection?" (Constructor, setter and field injection.)

#### Follow-up questions
- "Can you use dependency injection without a framework?" (Yes — manual wiring in `main` is dependency injection; the container only automates it.)
- "Does IoC always mean DI?" (No — template methods, event listeners and callbacks are also inversions of control.)
- "What is the downside?" (Indirection: tracing which implementation is actually injected requires knowing the container's rules.)

#### Edge cases
- Over-abstracting produces interfaces with one implementation and no benefit, because the decoupling only pays when a second implementation exists or is plausible.
- Injecting a concrete class is perfectly valid — the inversion is about who *constructs* the object, not about interfaces.
- Service location (`context.getBean`) technically uses the container but reintroduces the coupling DI removes, because the class goes back to fetching its own dependencies.

#### Common mistakes
- Treating IoC and DI as synonyms without being able to distinguish them.
- Creating an interface per class by reflex.
- Using the container as a service locator in business code.

#### Comparisons

| | Service location | Dependency injection |
|---|---|---|
| Who finds the dependency | The class itself | The container |
| Visible in the signature | No | Yes |
| Testable without the framework | Harder | Trivial |

#### Frequently confused with
IoC as a synonym for DI — DI is the subset.

#### Important facts to remember
- IoC is the principle, DI the technique.
- Constructor injection is the default — dependencies arrive before the object exists, so it is never half-built.
- DI is what makes unit tests container-free — whoever constructs the class chooses its collaborators, including a test.

---

### 1.3 The ApplicationContext

#### Definition
Spring's container: it reads configuration metadata, registers bean definitions, instantiates and wires beans, applies post-processors, and manages their lifecycle.

#### Why it exists
Because once classes stop building their own dependencies, something must know the whole graph — what exists, what needs what, and in which order to build it. Without a container, that is a hand-written `main()` full of `new` calls, reordered by hand every time a constructor changes. Holding that knowledge in one place also gives framework features a single point through which every object passes.

#### Interview explanation
Open with what it replaces — the wiring code you would otherwise write in `main()`, every `new` in the right order. Then explain the problem it solves — objects must be built in dependency order, and wiring errors should appear before traffic does. Then describe the two phases that follow from it — definitions registered first, because ordering needs the whole graph, then instances created — and name the two post-processor types, one per phase, because `BeanPostProcessor` is where proxies are created. Mention that singletons are eager by default so failures surface at startup.

#### Syntax
```java
ApplicationContext context = SpringApplication.run(App.class, args);
context.getBean(OrderService.class);
context.getBeansOfType(PaymentGateway.class);
```

#### Example
```java
@Component
class Warmup implements ApplicationListener<ApplicationReadyEvent> {
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // runs after every singleton is created and the context is refreshed
    }
}
```

#### Common interview questions
- "What is the ApplicationContext?" (Spring's container — it builds, wires and manages beans, and provides events, resource loading and internationalisation.)
- "What is the difference between BeanFactory and ApplicationContext?" (`BeanFactory` is the basic container with lazy instantiation; `ApplicationContext` extends it with eager singletons, events, AOP integration and more.)
- "When are singleton beans created?" (Eagerly, at startup, unless marked `@Lazy` — so configuration errors fail fast.)
- "What is a BeanPostProcessor?" (A hook invoked around each bean's initialisation; it can replace the bean with a proxy, which is how `@Transactional` and `@Cacheable` are applied.)

#### Follow-up questions
- "What is a BeanFactoryPostProcessor?" (It modifies bean *definitions* before any instance exists — property placeholder resolution uses it.)
- "What does the context publish?" (Lifecycle events such as `ContextRefreshedEvent` and `ApplicationReadyEvent`, plus your own events via `ApplicationEventPublisher`.)
- "What is the difference between `ContextRefreshedEvent` and `ApplicationReadyEvent`?" (The first means the container has finished building; Spring Boot publishes the second later, after `ApplicationRunner` and `CommandLineRunner` beans have run — the right signal for "the application is up".)
- "Why avoid calling `getBean` in application code?" (It is service location — it hides the dependency and couples the class to the container.)

#### Edge cases
- `@Lazy` defers creation until first use, which moves configuration errors from startup to runtime — eager creation was the only thing surfacing them early.
- A bean that fails to initialise aborts startup, and the real cause is usually several `Caused by` frames down, because each dependent bean wraps the failure of the one it needed.
- Post-processors are built before ordinary beans, so a post-processor that injects an ordinary bean forces that bean to be built early — before every `BeanPostProcessor` exists — and it can miss its proxy, leaving `@Transactional` inert. Spring logs that the bean "is not eligible for getting processed by all BeanPostProcessors". Keep post-processors free of dependencies, and declare `@Bean` methods that return a `BeanFactoryPostProcessor` as `static`.
- Multiple contexts exist in some setups — notably parent/child contexts in older Spring MVC applications — where a child can see its parent's beans but not the reverse.

#### Common mistakes
- Using the context as a service locator.
- Making beans `@Lazy` to speed startup, trading it for runtime surprises.
- Reading only the top of a startup stack trace.

#### Comparisons

| | `BeanFactory` | `ApplicationContext` |
|---|---|---|
| Instantiation | Lazy | Eager singletons |
| Events | No | Yes |
| AOP / i18n / resources | Manual | Built in |

#### Complexity
Startup cost grows with the number of bean definitions and the breadth of component scanning, not with request volume.

#### Frequently confused with
`BeanFactory` versus `ApplicationContext`. The factory is the engine — definitions in, beans out. The context wraps it with what an application needs around that engine: eager startup, events, environment and property sources, resources and messages. You use the context; the factory is inside it.

#### Important facts to remember
- It is the wiring code you would write in `main()`, automated — nothing it builds is beyond a hand-written `new`.
- Definitions first, instances second — recipes can be ordered and edited before anything exists.
- Singletons are eager by default — so wiring errors fail the startup, not a request.
- `BeanPostProcessor` creates proxies — it is the hook that sees every finished bean.

---

### 1.4 Beans and the Bean Lifecycle

#### Definition
A bean is an object instantiated, assembled and managed by the Spring container, passing through a defined sequence of creation, injection, initialisation, use and destruction.

#### Why it exists
Because some work is only possible at a specific moment: initialisation needs injected dependencies, a proxy must be in place before anyone receives the bean, and cleanup must happen before the JVM exits. A fixed sequence of stages gives each of those jobs its moment, in a predictable order.

#### Interview explanation
**In 30 seconds** — Spring creates the bean, injects its dependencies, runs its init callbacks, lets post-processors wrap it — normally in a proxy — and hands it out. On a clean shutdown it runs the destroy callbacks of its singletons. Each step sits where it does because of what it needs: init after injection, the proxy before anyone receives the bean.

**If they push deeper** — list the order — instantiate, inject, aware callbacks, post-process before init, init callbacks, post-process after init, use, destroy — and justify it: init callbacks come after injection because they need the dependencies, and the proxy normally appears in the "after initialisation" step because that is the last stop before the bean is handed out. The real requirement is that every bean ends up holding the same, final object, so a proxy must be in place before the first reference leaves the container. That is why a circular reference forces it earlier, through `getEarlyBeanReference` — which the auto-proxy creator behind `@Transactional`, `@Cacheable` and aspects implements, and `@Async`'s post-processor does not. Add that prototype beans are never destroyed by the container.

#### Syntax
```java
@PostConstruct void init() { }
@PreDestroy   void cleanup() { }

@Bean(initMethod = "start", destroyMethod = "stop")
Engine engine() { return new Engine(); }
```

#### Example
```java
@Component
public class CacheWarmer {
    private final ProductRepository repository;
    CacheWarmer(ProductRepository repository) { this.repository = repository; }

    @PostConstruct
    void warm() { repository.findTopSellers(); }   // runs after injection, before use
}
```

Predict the log of this class from startup to a clean shutdown — the questions below ask for it:

```java
@Component
class LifecycleAudit implements InitializingBean, DisposableBean {
    @Override public void destroy()            { log.info("destroy"); }
    @Override public void afterPropertiesSet() { log.info("afterPropertiesSet"); }
    @PreDestroy void stop()                    { log.info("@PreDestroy"); }
    @PostConstruct void start()                { log.info("@PostConstruct"); }
    LifecycleAudit()                           { log.info("constructor"); }
}
```

#### Common interview questions
- "What is a Spring bean?" (Any object the container creates, configures and manages.)
- "Describe the bean lifecycle." (Instantiate, inject dependencies, aware callbacks, `postProcessBeforeInitialization`, `@PostConstruct`/`afterPropertiesSet`/`initMethod`, `postProcessAfterInitialization`, in use, then `@PreDestroy`/`destroyMethod` on shutdown.)
- "Where does the proxy get created?" (Normally in `postProcessAfterInitialization` — the container swaps your instance for a proxy wrapping it. In a circular reference it is created earlier, through `getEarlyBeanReference`, because the other bean needs a reference before this one is finished — but only by post-processors that implement it, such as the auto-proxy creator behind `@Transactional`.)
- "Are prototype beans destroyed by Spring?" (No — the container does not track them after handing them out, so cleanup is the caller's responsibility.)
- "What does `LifecycleAudit` in the example log, from startup to a clean shutdown?" (constructor, @PostConstruct, afterPropertiesSet — then, on shutdown, @PreDestroy, destroy. The order in which the methods are declared is irrelevant: the lifecycle fixes it.)
- "Why is the proxy created after initialisation, rather than straight after instantiation?" (Because what matters is that it exists before anyone receives the bean, and after initialisation is the last stop before that. The target is complete by the time the proxy starts forwarding calls to it, and the init callbacks run on the plain object, outside any advice. Spring builds the proxy earlier when another bean needs a reference sooner — a circular reference.)
- "Your service pre-loads a cache in `@PostConstruct`, and new pods now take minutes to become ready during a deploy. Why — and does moving the work into an `ApplicationReadyEvent` listener fix it?" (The context is not refreshed, and the web server not started, until every singleton's init callbacks have returned, so the whole application waits for the cache. A listener runs after the server starts, so the process is live sooner — but Spring Boot reports readiness (`ACCEPTING_TRAFFIC`) only after the `ApplicationReadyEvent` listeners return, so a synchronous listener still delays readiness. Run the warm-up asynchronously, or load lazily, if traffic can be served before it finishes.)
- "A prototype-scoped bean opens a file in `@PostConstruct` and closes it in `@PreDestroy`. After a day, the process runs out of file handles. Why?" (The container runs no destroy callbacks for prototypes — it forgets each one once handed out — so `@PreDestroy` never runs and every instance leaks its file. The code that requests the prototype must close it, or the file should be owned by a singleton.)

#### Follow-up questions
Interviewers rarely stop at "Describe the bean lifecycle" — they drill down from your answer. Answer each step before opening it:

- "When exactly does `@PostConstruct` run?" (After instantiation, injection and the aware callbacks, during the before-initialisation pass: a `BeanPostProcessor` invokes it from `postProcessBeforeInitialization`. So it runs before `afterPropertiesSet` and any `initMethod`.)
- "Is the bean proxied at that point?" (Normally not — the proxy is created afterwards, in `postProcessAfterInitialization`. Even when one already exists, created early for a circular reference, `@PostConstruct` is called on the raw object, never through the proxy.)
- "So what happens if `@PostConstruct` calls the bean's own `@Transactional` method?" (It runs without a transaction: the call goes through `this`, the raw object, so no proxy intercepts it. Call it through the proxy once startup is done — from an `ApplicationReadyEvent` listener in another bean — or use `TransactionTemplate` directly.)
- "What changes if the bean is part of a circular dependency?" (With field or setter injection — a cycle made only of constructor injection cannot be resolved at all — the other bean needs a reference before this one is finished, so Spring exposes an early reference through `getEarlyBeanReference`, and the auto-proxy creator builds the proxy then, before this bean's injection and init callbacks are done. The other bean can now call it before its `@PostConstruct` has run. Spring Boot rejects circular references by default since 2.6, so this happens only once they are re-enabled.)
- "And if that bean also has an `@Async` method?" (Startup fails. `@Async`'s post-processor cannot build its proxy early, so it wraps the bean later — after the other bean has already received the raw object — and Spring refuses to let two beans hold different objects: the bean "has been injected into other beans [...] in its raw version as part of a circular reference, but has eventually been wrapped".)

Other follow-ups:

- "What are the aware interfaces?" (`BeanNameAware`, `ApplicationContextAware` and similar — callbacks giving a bean access to container infrastructure; usually a sign of unnecessary coupling.)
- "Is `@PreDestroy` guaranteed to run?" (Only on an orderly shutdown; `kill -9` or a crash skips it.)
- "How do you order initialisation between beans?" (Through dependencies — a bean is created after what it depends on — or `@DependsOn` when the relationship is not expressed by injection.)
- "Why does `@PostConstruct` run before `afterPropertiesSet()`?" (Because the container does not call it directly: a `BeanPostProcessor` invokes it during the before-initialisation pass, and the container's own `afterPropertiesSet` and `initMethod` calls come after that pass. Shutdown mirrors it — the same processor runs `@PreDestroy` before the container calls `destroy()`.)

#### Edge cases
- `@PostConstruct` runs before the context is fully refreshed, so other beans may not be ready; use `ApplicationReadyEvent` if they must be.
- `@PostConstruct` runs on the raw object — normally before the proxy exists, and `this` is never the proxy anyway — so calling your own `@Transactional` method from it starts no transaction.
- When circular references are allowed, a post-processor that can only wrap after initialisation breaks them: the other bean already holds the raw object, so Spring fails startup, reporting that the bean "has been injected into other beans [...] in its raw version as part of a circular reference, but has eventually been wrapped". `@Async` is the usual cause, because its post-processor does not take part in early references.
- Long work in `@PostConstruct` delays startup and the readiness probe, because the context is not ready until every singleton has finished initialising.
- A bean implementing `DisposableBean` *and* declaring `@PreDestroy` runs both, annotation first.
- A bean that a `BeanPostProcessor` depends on is created before the remaining processors are registered, so they never see it — its `@Transactional` or `@Cacheable` silently does nothing. Spring logs that it "is not eligible for getting processed by all BeanPostProcessors".

#### Common mistakes
- Relying on `@PreDestroy` for data integrity.
- Blocking startup with remote calls in `@PostConstruct`.
- Expecting prototype cleanup from the container.

#### Comparisons

| | `@PostConstruct` | `InitializingBean` | `initMethod` |
|---|---|---|---|
| Coupling to Spring | None (Jakarta annotation) | Interface | None |
| Order | First | Second | Third |
| Preferred | Yes | Rarely | For third-party classes |

#### Frequently confused with
Bean lifecycle versus application lifecycle events — one is per bean, the other per context.

#### Important facts to remember
- Every bean must end up holding the same, final object, so a proxy has to be in place before the first reference leaves the container — normally after initialisation, the last stop; for a circular reference, earlier through `getEarlyBeanReference`, or startup fails.
- Prototypes get no destroy callback — the container stops tracking them once handed out.
- `@PreDestroy` needs an orderly shutdown — a killed JVM runs no code at all.

---

### 1.5 Component Scanning and Stereotypes

#### Definition
Automatic discovery and registration of annotated classes as beans, starting from a base package, using `@Component` and its specialised stereotypes.

#### Why it exists
Because listing every class in configuration does not scale, while the classes already exist in your packages. Letting the framework search for marked classes turns registration into one annotation — and bounding the search to your own packages keeps it fast and avoids registering other libraries' code.

#### Interview explanation
State that `@SpringBootApplication` includes `@ComponentScan` rooted at its own package, which is why package layout matters. Then distinguish the stereotypes: all register beans, `@Repository` adds exception translation, `@Controller` is picked up by handler mapping.

#### Syntax
```java
@SpringBootApplication                       // @Configuration + @EnableAutoConfiguration + @ComponentScan
@ComponentScan(basePackages = "com.shop",
               excludeFilters = @Filter(type = ASSIGNABLE_TYPE, classes = LegacyJob.class))
public class ShopApplication { }
```

#### Example
```java
@Repository
public class JdbcOrderRepository implements OrderRepository {
    // SQLExceptions are translated into Spring's DataAccessException hierarchy
}
```

#### Common interview questions
- "What does `@SpringBootApplication` do?" (It combines `@Configuration`, `@EnableAutoConfiguration` and `@ComponentScan`.)
- "What is the difference between `@Component`, `@Service` and `@Repository`?" (All register a bean; `@Service` and `@Controller` express intent, and `@Repository` additionally enables persistence exception translation.)
- "Why does my bean say 'no qualifying bean' when the class clearly exists?" (It is outside the scanned package tree — scanning starts at the main application class's package.)
- "Can you narrow a component scan?" (Yes — `basePackages`, plus include and exclude filters by annotation, type or regex.)

#### Follow-up questions
- "What is a meta-annotation?" (An annotation annotated with another, such as `@Service` being meta-annotated `@Component` — Spring treats it as one.)
- "Is scanning expensive?" (It costs startup time proportional to the classes scanned; very broad base packages are measurably slower.)
- "How do you register a class you cannot annotate?" (A `@Bean` method in a `@Configuration` class.)

#### Edge cases
- Two scanned classes with the same simple name in different packages collide, because the default bean name is derived from the simple class name only.
- Scanning a package containing third-party classes can register beans you did not intend — scanning trusts any `@Component` it finds.
- Filters apply to scanning only; explicitly declared `@Bean` methods are unaffected, because they are not discovered by searching.

#### Common mistakes
- Main class in the wrong package.
- Treating `@Service` as functionally different from `@Component` in all respects.
- Scanning `com` or an entire organisation-wide root package.

#### Comparisons

| | `@Component` | `@Service` | `@Repository` | `@Controller` |
|---|---|---|---|---|
| Registers a bean | Yes | Yes | Yes | Yes |
| Extra behaviour | None | None | Exception translation | Web handler mapping |

#### Frequently confused with
Stereotypes as functionally distinct — three of the four differ only in meaning.

#### Important facts to remember
- Scanning starts at the main class's package — anything outside that tree is invisible.
- `@Repository` translates persistence exceptions — so callers never depend on one driver's `SQLException` codes.
- `@SpringBootApplication` bundles three annotations — configuration, auto-configuration and scanning.

---

### 1.6 Dependency Injection Styles

#### Definition
The three ways Spring supplies collaborators — constructor, setter and field injection — of which constructor injection is the recommended default.

#### Why it exists
Because *when* a dependency arrives decides whether an object can ever be seen half-built. Mandatory dependencies belong in the constructor, where they exist before the object does; genuinely optional ones can arrive later through setters.

#### Interview explanation
Argue for constructor injection on three grounds: immutability, a fully initialised object, and testability without reflection. Then mention that a single constructor needs no `@Autowired`, and that cycles fail fast — constructor cycles always, because neither object can be built first, and since Boot 2.6 field and setter cycles too.

#### Syntax
```java
// constructor — preferred, no annotation needed for a single constructor
public OrderService(OrderRepository repository) { }

@Autowired public void setGateway(PaymentGateway gateway) { }   // setter

@Autowired private AuditLog auditLog;                            // field — avoid
```

#### Example
```java
@Service
public class CheckoutService {
    private final OrderRepository orders;
    private final PaymentGateway payments;

    public CheckoutService(OrderRepository orders, PaymentGateway payments) {
        this.orders = orders;
        this.payments = payments;
    }
}
```

#### Common interview questions
- "Which injection type should you use and why?" (Constructor: the object is always fully built, fields can be `final`, dependencies are explicit, and tests can construct it directly.)
- "Is `@Autowired` required on a constructor?" (Not since Spring 4.3 when the class has exactly one constructor.)
- "What is wrong with field injection?" (It hides dependencies, prevents `final` fields, and makes the class impossible to instantiate in a plain unit test without reflection.)
- "What happens with a circular dependency?" (With constructor injection the context always fails to start — neither object can be built first. With field or setter injection plain Spring can resolve the cycle, but Spring Boot 2.6+ rejects every cycle by default.)

#### Follow-up questions
- "How do you fix a circular dependency properly?" (Extract the shared logic into a third bean, or invert one direction with an event — not by enabling the cycle workaround.)
- "How do you inject an optional dependency?" (`ObjectProvider<T>`, `Optional<T>`, or `@Autowired(required = false)` on a setter.)
- "Can you inject a collection of beans?" (Yes — `List<T>` or `Map<String, T>` receives every matching bean.)

#### Edge cases
- With several constructors, Spring needs `@Autowired` on the one to use, because it cannot know which you intended.
- Field-injected dependencies are `null` inside the constructor, because fields are populated after construction.
- `@Value` works on constructor parameters as well as fields.
- `@Lazy` on an injection point injects a proxy, which breaks an unavoidable cycle because the real bean is not needed until the first call.

#### Common mistakes
- Field injection in production code.
- Enabling `spring.main.allow-circular-references` instead of fixing the design.
- Long constructor parameter lists ignored as a design signal.

#### Comparisons

| | Constructor | Setter | Field |
|---|---|---|---|
| `final` fields | Yes | No | No |
| Fully built on construction | Yes | No | No |
| Testable with `new` | Yes | Yes | No |

#### Frequently confused with
`@Autowired` being mandatory — it is not, for a single constructor.

#### Important facts to remember
- Constructor injection by default — the object is complete the moment it exists.
- One constructor needs no annotation — there is nothing to choose between.
- Cycles fail fast in Boot 2.6+ — constructor cycles cannot be built at all, and Boot refuses the field and setter workaround by default.

---

### 1.7 Configuration Classes and @Bean

#### Definition
`@Configuration` classes declare beans programmatically through `@Bean` methods, which Spring intercepts via a CGLIB subclass so inter-method calls return the managed singleton.

#### Why it exists
Because scanning only reaches classes you can annotate, and an annotation cannot hold the code that builds an object. Third-party classes, objects needing builder-style construction, and implementations chosen at startup all need construction written as code — and that code must still yield one managed instance, which is why the class is proxied.

#### Interview explanation
Start from the tension: `@Bean` methods are plain Java, and plain Java calling a method twice builds two objects. Then contrast full mode (`@Configuration`, proxied, inter-method calls return singletons) with lite mode (`@Component` or `@Configuration(proxyBeanMethods = false)`, plain calls, new objects each time). That distinction is the question behind "why do I have two connection pools?".

#### Syntax
```java
@Configuration
public class AppConfig {
    @Bean
    public DataSource dataSource(DataSourceProperties props) { ... }

    @Bean
    @ConditionalOnMissingBean
    public Clock clock() { return Clock.systemUTC(); }
}
```

#### Example
```java
@Configuration
public class CacheConfig {
    @Bean
    CacheManager cacheManager(RedisConnectionFactory factory) {
        return RedisCacheManager.builder(factory)
            .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10)))
            .build();
    }
}
```

#### Common interview questions
- "When do you use `@Bean` instead of `@Component`?" (For classes you do not own, when construction needs arguments or a builder, or when the implementation is chosen conditionally.)
- "What is the difference between `@Configuration` and `@Component` for bean methods?" (Full mode proxies the class so calls between `@Bean` methods return the singleton; lite mode does not, so each call creates a new object.)
- "How is a bean named by default?" (After the method name — or the class name with a lowercase first letter for scanned components.)
- "What are conditional beans?" (`@ConditionalOnMissingBean`, `@ConditionalOnProperty` and similar, which let a configuration apply only when appropriate — the mechanism behind auto-configuration.)

#### Follow-up questions
- "How do you inject configuration values into a `@Bean` method?" (Take a `@ConfigurationProperties` object as a parameter, which is type-safe and testable.)
- "Can `@Bean` methods be `static`?" (Yes — needed for `BeanFactoryPostProcessor` beans, which must be created before the configuration class itself.)
- "Does order of `@Bean` methods matter?" (No — dependencies determine order, not declaration position.)

#### Edge cases
- `final` `@Configuration` classes cannot be CGLIB-proxied and fail in full mode, because the proxy is a subclass.
- `@Bean` methods must not be `private` or `final`, because the subclass must override them to intercept the call.
- A `@Bean` returning an interface type can hide the implementation from injection by the concrete class, because until the bean is created the container knows only the declared return type.

#### Common mistakes
- Using `@Component` for a class with `@Bean` methods and getting duplicate instances.
- Autowiring fields into a configuration class instead of taking parameters.
- Forgetting that `@Bean` names come from method names, so renaming a method renames a bean.

#### Comparisons

| | `@Configuration` (full) | `@Component` (lite) |
|---|---|---|
| CGLIB proxy | Yes | No |
| Inter-method call | Returns singleton | Creates a new object |
| Use for | Bean definitions | Components that happen to expose a factory |

#### Frequently confused with
Full versus lite mode — the source of duplicated beans.

#### Important facts to remember
- `@Configuration` is CGLIB-proxied — so calls between `@Bean` methods return the singleton.
- Bean name comes from the method name — renaming the method renames the bean.
- Conditionals power auto-configuration — a configuration can back off when you define your own bean.

---

### 1.8 Bean Scopes

#### Definition
A scope defines how many instances of a bean the container creates and how long each lives — singleton by default, with prototype and the web scopes as alternatives.

#### Why it exists
Because one shared instance is cheapest and perfectly safe for stateless services — but an object holding one request's or one user's data would leak it to everyone if shared. The scope matches an instance's lifetime to the lifetime of the data it holds.

#### Interview explanation
State the default clearly: one instance per container, shared across all threads — therefore singletons must be stateless. Then explain the classic trap of injecting a narrower scope into a singleton and the scoped-proxy fix.

#### Syntax
```java
@Scope("prototype")
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
```

#### Example
```java
@Service
public class ReportService {
    private final ObjectProvider<ReportBuilder> builders;   // prototype, resolved per call

    ReportService(ObjectProvider<ReportBuilder> builders) { this.builders = builders; }

    public Report build(Query query) {
        return builders.getObject().with(query).build();     // fresh instance each time
    }
}
```

#### Common interview questions
- "What is the default bean scope?" (Singleton — one instance per container, shared by every thread.)
- "Are singleton beans thread-safe?" (Not automatically. One instance serves all concurrent requests, so mutable state must be avoided or synchronised.)
- "What happens if you inject a prototype into a singleton?" (The singleton receives one instance at startup and reuses it forever; use a scoped proxy or `ObjectProvider` to get a fresh one per call.)
- "What are the web scopes?" (`request`, `session` and `application`, available in web-aware contexts.)

#### Follow-up questions
- "How does a scoped proxy work?" (The singleton holds a proxy; each method call resolves the real instance for the current request or session.)
- "Is Spring's singleton the same as the Gang of Four singleton?" (No — it is one instance per container, managed by Spring, not enforced by the class.)
- "When is prototype genuinely the right scope?" (Stateful short-lived helpers — builders, per-operation accumulators — that must not be shared.)

#### Edge cases
- Request-scoped beans fail outside a web request — in a scheduled job, say — because there is no current request to bind them to.
- Prototype beans receive no destruction callbacks, so resources leak unless closed by the caller.
- Session-scoped beans must be serialisable in clustered setups that replicate sessions, because the session travels between servers.

#### Common mistakes
- Mutable fields in `@Service` singletons.
- Expecting a prototype injected once to be new each time.
- Using session scope for data that belongs in a store.

#### Comparisons

| | Singleton | Prototype | Request |
|---|---|---|---|
| Instances | One per container | One per lookup | One per HTTP request |
| Destroyed by Spring | Yes | No | Yes |
| Safe for mutable state | No | Only if never shared | Yes |

#### Frequently confused with
Spring singleton versus the singleton design pattern.

#### Important facts to remember
- Singleton is default and shared — one instance serves every thread.
- Stateless services only — any mutable field is shared by all concurrent requests.
- Narrow scopes need proxies inside singletons — injection happens once, so only a proxy can resolve a fresh instance per call.

---

### 1.9 Qualifiers and Ambiguity

#### Definition
Mechanisms for choosing between several beans of the same type: `@Primary` sets the default, `@Qualifier` names a specific one, and collection injection takes them all.

#### Why it exists
Because injection is driven by type, and a type is not always unique — several implementations of one interface are normal. A container that guessed would wire the wrong one silently, so it demands the missing information instead and fails loudly without it.

#### Interview explanation
Walk the resolution order and justify it from specific to general — type first; then any `@Qualifier` at the injection point narrows the candidates, because the caller said exactly what it wants; then `@Primary` breaks remaining ties as the default; then a bean whose name matches the parameter name. Say what happens when it fails: `NoUniqueBeanDefinitionException` at startup. Then mention `Map<String, T>` injection as the clean way to build a strategy registry.

#### Syntax
```java
@Primary @Bean PaymentGateway stripe() { }
@Qualifier("sandbox") @Bean PaymentGateway sandbox() { }

Service(@Qualifier("sandbox") PaymentGateway gateway) { }
Service(List<PaymentGateway> all) { }
Service(Map<String, PaymentGateway> byName) { }
```

#### Example
```java
@Service
public class PaymentRouter {
    private final Map<String, PaymentGateway> gateways;      // keyed by bean name

    PaymentRouter(Map<String, PaymentGateway> gateways) { this.gateways = gateways; }

    public Receipt pay(String provider, Money amount) {
        var gateway = gateways.get(provider);
        if (gateway == null) throw new UnknownProviderException(provider);
        return gateway.charge(amount);
    }
}
```

#### Common interview questions
- "What happens when two beans match an injection point?" (Startup fails with `NoUniqueBeanDefinitionException` unless `@Primary`, a `@Qualifier` or a matching parameter name disambiguates.)
- "What is the difference between `@Primary` and `@Qualifier`?" (`@Primary` declares the default at the bean; `@Qualifier` narrows the candidates at the injection point before `@Primary` is consulted, so it wins.)
- "How do you inject all implementations of an interface?" (A `List<T>` for all of them, or a `Map<String, T>` keyed by bean name.)
- "How is list ordering determined?" (By `@Order` or `Ordered`; otherwise it is not guaranteed.)

#### Follow-up questions
- "Why prefer a custom qualifier annotation?" (It is type-checked and refactor-safe, unlike a string literal.)
- "Does parameter-name matching always work?" (For constructor and method parameters, only when compiled with `-parameters` — Boot's build plugins set it, a hand-rolled build may not.)
- "How does this interact with profiles?" (`@Profile` can make only one implementation eligible per environment, removing the ambiguity entirely.)

#### Edge cases
- Two `@Primary` beans competing for one injection point is itself an error, because a default that is not unique cannot break a tie.
- Generic types participate in resolution: `Repository<Order>` and `Repository<User>` are distinct injection targets, because Spring matches the full generic type.
- A `List<T>` constructor parameter on a single-constructor class receives an empty list when no beans match, which can silently disable a feature — "all of them" is a valid answer even when there are none. A required `@Autowired` field of the same type fails instead.

#### Common mistakes
- String qualifiers scattered through the codebase.
- Relying on parameter names.
- Marking several beans `@Primary` in different configuration classes.

#### Comparisons

| | `@Primary` | `@Qualifier` | `@Profile` |
|---|---|---|---|
| Decided at | Bean definition | Injection point | Environment |
| Scope of effect | All injection points | One | Whole context |

#### Frequently confused with
`@Qualifier` versus bean name — related, but qualifiers can be independent of names.

#### Important facts to remember
- Type, narrowed by any `@Qualifier`, then `@Primary`, then the parameter name — most specific information first.
- `Map<String, T>` gives a registry — keyed by bean name.
- Ambiguity fails at startup, not at runtime — every bean is wired before the first request.

---

### 1.10 Proxies and AOP

#### Definition
Spring applies cross-cutting behaviour by wrapping beans in proxies — JDK dynamic proxies for interfaces, CGLIB subclasses otherwise — which run advice around method calls.

#### Why it exists
Because transactions, security, caching and retries must run around hundreds of methods, and writing them into each method would bury the business logic. Since the container already creates every bean, it can hand callers a wrapper that runs the concern around each call — written once, applied everywhere.

#### Interview explanation
Explain that the annotation is honoured by the proxy, not the method, and then derive the consequences from how the proxy is made: self-invocation never reaches the proxy; a CGLIB proxy is a subclass, so `private`, `static` and `final` methods — which a subclass cannot override — are not advised, and `final` classes cannot be proxied at all. This single idea explains most "my annotation does nothing" bugs.

#### Syntax
```java
@Transactional
@Cacheable("products")
@Async
@PreAuthorize("hasRole('ADMIN')")
```

#### Example
```java
@Service
public class OrderService {
    private final OrderService self;                 // works, but a design smell

    OrderService(@Lazy OrderService self) { this.self = self; }   // @Lazy, or Boot rejects the self-reference as a cycle

    public void place(Order order) {
        save(order);          // NOT transactional — internal call
        self.save(order);     // transactional — goes through the proxy
    }

    @Transactional
    public void save(Order order) { ... }
}
```

#### Common interview questions
- "How does `@Transactional` actually work?" (A proxy around the bean begins a transaction before the method and commits or rolls back after; the annotation itself does nothing without that proxy.)
- "Why does calling an annotated method from within the same class not work?" (The internal call goes straight to `this`, bypassing the proxy and therefore the advice.)
- "What is the difference between JDK dynamic proxies and CGLIB?" (JDK proxies implement interfaces; CGLIB subclasses the class. Spring Boot uses CGLIB by default so proxying works without an interface.)
- "Which methods cannot be advised?" (`private`, `static` and `final` methods — anything a subclass cannot override — and any method on a `final` class under CGLIB.)

#### Follow-up questions
- "What are the AOP terms?" (Aspect — the concern; join point — where it can apply; pointcut — which join points; advice — the code that runs.)
- "What join points does Spring AOP support?" (Method execution on Spring beans only — it is not full AspectJ, which can weave constructors and field access.)
- "How do you fix self-invocation?" (Move the annotated method to another bean; a `@Lazy` self-reference or `AopContext.currentProxy()` work but indicate the responsibility is in the wrong class.)

#### Edge cases
- `@Transactional` on a `protected` or package-private method is honoured for CGLIB proxies since Spring Framework 6 — a subclass can override those — but ignored on interface-based JDK proxies, which only see interface methods.
- A `final` method on a proxied bean runs on the proxy instance itself, whose fields were never injected, so it can throw `NullPointerException` as well as skipping the advice.
- Proxies add frames to stack traces and can confuse naive reflection.
- Multiple advice on one method applies in `@Order` sequence, which matters for transactions versus security.

#### Common mistakes
- Expecting self-invocation to be advised.
- Making an advised method `final` during a refactor.
- Assuming AOP applies to objects created with `new`.

#### Comparisons

| | JDK dynamic proxy | CGLIB |
|---|---|---|
| Requires an interface | Yes | No |
| Mechanism | Implements interfaces | Subclasses the class |
| Blocked by `final` | No | Yes |

#### Complexity
One extra method dispatch per advised call — negligible beside the work the advice performs, such as opening a transaction.

#### Frequently confused with
Annotation on the method versus advice on the proxy.

#### Important facts to remember
- Proxies honour the annotations — the method itself does nothing with them.
- Self-invocation bypasses them — `this` is the raw object, not the proxy.
- Anything a subclass cannot override — `private`, `static`, `final` — is never advised.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 1. Next: Spring Boot Fundamentals.*

---

## 2. Spring Boot Fundamentals

### Table of Contents (this group)
- [[#2.1 Spring vs Spring Boot]]
- [[#2.2 Starters and Dependency Management]]
- [[#2.3 Auto-Configuration]]
- [[#2.4 The Embedded Server]]
- [[#2.5 External Configuration]]
- [[#2.6 Profiles]]
- [[#2.7 Type-Safe Configuration Properties]]
- [[#2.8 Project Structure and Build]]
- [[#2.9 Application Startup and Runners]]
- [[#2.10 Packaging and Running]]

---

### 2.1 Spring vs Spring Boot

#### Definition
Spring Boot is a layer over the Spring Framework providing auto-configuration, curated starter dependencies, an embedded server and externalised configuration, so an application runs as a plain process with minimal setup.

#### Why it exists
Because Spring removed hand-written object creation but not hand-written *configuration*: every application still declared the same servlet container, dispatcher servlet, data source and transaction manager, and kept library versions compatible by hand. Boot automates exactly those repeated chores — starters for versions, auto-configuration for beans, an embedded server for deployment — while letting any default be replaced.

#### Interview explanation
Start from what was still repetitive after Spring — infrastructure configuration and dependency versions. Then name the three additions — starters, auto-configuration, embedded server — and stress that the programming model is unchanged. Then make the key point: every default backs off when you define your own bean, so Boot is opinionated but never closed.

#### Syntax
```java
@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) { SpringApplication.run(ShopApplication.class, args); }
}
```

#### Example
```java
// Boot configured an ObjectMapper for you; declaring one replaces it entirely
@Bean
ObjectMapper objectMapper() {
    return JsonMapper.builder().addModule(new JavaTimeModule()).build();
}
```

#### Common interview questions
- "What is the difference between Spring and Spring Boot?" (Spring is the framework and container; Boot adds auto-configuration, starters, an embedded server and externalised configuration so the application runs with almost no setup.)
- "Does Spring Boot replace Spring?" (No — it configures it. The same annotations and container behaviour apply.)
- "How do you override a Boot default?" (Define the bean yourself, or set the corresponding property; auto-configuration backs off when a bean already exists.)
- "What does `@SpringBootApplication` consist of?" (`@Configuration`, `@EnableAutoConfiguration` and `@ComponentScan`.)

#### Follow-up questions
- "What are the downsides of Boot?" (Behaviour arrives from dependencies rather than code, dependency footprints are larger, and startup does more work.)
- "Can you use Spring without Boot?" (Yes — plenty of applications do, particularly older ones deployed as WARs.)
- "What is Spring Cloud?" (A separate set of projects for distributed systems — configuration servers, service discovery, resilience — built on Boot.)

#### Edge cases
- Adding a starter can change runtime behaviour with no code change, because auto-configuration reacts to what is on the classpath; `spring-boot-starter-security` locking down every endpoint is the classic example.
- `@SpringBootApplication(exclude = ...)` disables a specific auto-configuration when you want the dependency but not its defaults.
- Boot 3 requires Java 17+ and `jakarta.*`, so Boot 2 code does not compile unchanged — the `javax.*` packages it imports are gone.

#### Common mistakes
- Describing Boot as a separate framework.
- Overriding defaults with property sprawl instead of a bean definition.
- Adding starters for a single utility class.

#### Comparisons

| | Plain Spring | Spring Boot |
|---|---|---|
| Configuration | Explicit | Auto-configured, overridable |
| Server | External | Embedded |
| Dependency versions | You manage | Managed by the parent/BOM |
| Entry point | WAR deployment | `main()` and a jar |

#### Frequently confused with
Spring Boot versus Spring MVC — one is the configuration layer, the other the web module.

#### Important facts to remember
- Same framework, extra layer — the programming model does not change.
- Your beans always win — auto-configuration backs off when you define one.
- Boot 3 needs Java 17 and Jakarta — Spring Framework 6 raised both baselines.

---

### 2.2 Starters and Dependency Management

#### Definition
Starters are dependency aggregators for one capability; the Boot parent POM or BOM pins compatible versions for the entire ecosystem.

#### Why it exists
Because every library depends on others and only certain version combinations work; picked by hand, a mismatch compiles and then fails at runtime. Starters fix *which* libraries belong together for a job, and the parent or BOM fixes *which versions* — tested as one set.

#### Interview explanation
Start from the failure it prevents — `NoSuchMethodError` from mismatched versions. Explain that a starter is a POM with no code, and that version management comes from the parent or the imported BOM. Then mention the right way to change a version — a property — and why pinning one dependency by hand is risky.

#### Syntax
```xml
<parent>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.3.4</version>
</parent>
<!-- or, when you already have a parent -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.3.4</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

#### Example
```xml
<properties>
  <jackson-bom.version>2.17.2</jackson-bom.version>   <!-- overrides the managed version everywhere -->
</properties>
```

#### Common interview questions
- "What is a Spring Boot starter?" (A dependency whose POM pulls in a tested set of libraries for one capability — web, JPA, security — with versions managed centrally.)
- "How are dependency versions managed?" (By `spring-boot-starter-parent` or by importing the `spring-boot-dependencies` BOM; your build omits versions.)
- "How do you override a managed version?" (Set the version property Boot defines, so the change applies consistently across the tree.)
- "How do you swap Tomcat for Jetty?" (Exclude `spring-boot-starter-tomcat` from the web starter and add `spring-boot-starter-jetty`.)

#### Follow-up questions
- "What is in `spring-boot-starter-test`?" (JUnit 5, Mockito, AssertJ, Hamcrest, JSONassert, JSONPath and Spring's test support.)
- "How do you diagnose a dependency conflict?" (`mvn dependency:tree` or `gradle dependencies`, filtered to the artifact in question.)
- "Can you write your own starter?" (Yes — an auto-configuration module plus an `AutoConfiguration.imports` entry; common in companies with shared platform libraries.)

#### Edge cases
- Transitive dependencies can still conflict when a third-party library brings artifacts Boot does not manage, because Boot can only pin what is on its own list.
- `spring-boot-starter-parent` also configures plugins and resource filtering, which the BOM alone does not — a BOM carries versions, not build configuration.
- Excluding a starter's transitive dependency can break auto-configuration that assumed it was present.

#### Common mistakes
- Hardcoding versions on individual dependencies.
- Assuming a starter contains code of its own.
- Leaving unused starters in the build, enlarging the attack surface and the image.

#### Comparisons

| | Parent POM | Imported BOM |
|---|---|---|
| Dependency versions | Managed | Managed |
| Plugin configuration | Yes | No |
| Works with another parent | No | Yes |

#### Frequently confused with
Starters as libraries — they are dependency lists.

#### Important facts to remember
- Starters contain no code — they are curated dependency lists.
- Versions come from the parent or BOM — tested together as one set.
- Override via properties, not per-dependency — a property moves the whole library family together.

---

### 2.3 Auto-Configuration

#### Definition
Conditional `@Configuration` classes, listed in `AutoConfiguration.imports` and evaluated at startup, that register beans based on the classpath, existing beans and properties.

#### Why it exists
Because the configuration most applications need is predictable from facts Spring can already see — the classpath and the properties — so writing it by hand is repetition. Making each default conditional, and evaluating it after the application's own configuration, guarantees a default never overrides a deliberate choice.

#### Interview explanation
Start with the observation that makes it possible: given the classpath and the properties, most configuration is predictable. Then describe the mechanism concretely: a list of configuration classes, each guarded by `@Conditional` annotations, evaluated after your own configuration so `@ConditionalOnMissingBean` works. Mention `--debug` for the report — it shows you know how to diagnose it rather than guess.

#### Syntax
```java
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
@ConditionalOnProperty(name = "app.cache.enabled", havingValue = "true")
@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
```

#### Example
```java
// A library's auto-configuration, in miniature
@AutoConfiguration
@ConditionalOnClass(RedisConnectionFactory.class)
public class CacheAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    CacheManager cacheManager(RedisConnectionFactory factory) {
        return RedisCacheManager.create(factory);
    }
}
```

#### Common interview questions
- "How does auto-configuration work?" (Boot reads auto-configuration classes declared in each jar's `AutoConfiguration.imports`, evaluates their `@Conditional` annotations against the classpath, existing beans and properties, and applies the ones that match.)
- "How do you see what was auto-configured?" (Run with `--debug` for the condition evaluation report, or use `/actuator/conditions`.)
- "How do you disable one?" (`@SpringBootApplication(exclude = ...)` or the `spring.autoconfigure.exclude` property.)
- "Why does defining your own bean disable Boot's?" (Auto-configuration runs after user configuration and is guarded by `@ConditionalOnMissingBean`.)

#### Follow-up questions
- "What are the main conditional annotations?" (`@ConditionalOnClass`, `@ConditionalOnMissingBean`, `@ConditionalOnBean`, `@ConditionalOnProperty`, `@ConditionalOnWebApplication`.)
- "How is ordering controlled?" (`@AutoConfigureBefore`, `@AutoConfigureAfter` and `@AutoConfigureOrder`.)
- "What replaced `spring.factories` for this?" (From Boot 2.7 onward, the `AutoConfiguration.imports` file; `spring.factories` support for auto-configuration was removed in Boot 3.)

#### Edge cases
- An added dependency can enable behaviour silently — security is the usual surprise — because a class appearing on the classpath satisfies `@ConditionalOnClass`.
- `@ConditionalOnMissingBean` sees only beans registered before it is evaluated — reliable in auto-configuration, which runs after yours, but order-dependent if you use it in your own configuration classes.
- Excluding an auto-configuration that another one depends on can produce a confusing cascade of missing beans, because the dependent configuration's own conditions still match.

#### Common mistakes
- Treating auto-configuration as unexplainable magic instead of reading the report.
- Excluding an auto-configuration when defining the bean would be clearer.
- Adding dependencies without considering what they auto-configure.

#### Comparisons

| | Auto-configuration | Your `@Configuration` |
|---|---|---|
| Runs | After yours | First |
| Conditional | Yes | Usually not |
| Wins a conflict | No | Yes |

#### Complexity
Evaluation is proportional to the number of auto-configuration classes on the classpath and happens once, at startup.

#### Frequently confused with
Auto-configuration versus component scanning — one applies library defaults, the other finds your classes.

#### Important facts to remember
- Conditional configuration classes, evaluated once — ordinary `@Configuration` with conditions attached.
- Your beans take precedence — auto-configuration runs after them and checks for them.
- `--debug` prints the decisions — every condition, matched or not.

---

### 2.4 The Embedded Server

#### Definition
A servlet container — Tomcat by default — started inside the application process, so the deployable artifact is a jar rather than a WAR.

#### Why it exists
Because an externally installed application server made the runtime something operations configured separately, so production rarely matched development and every deployment depended on a shared, hand-tuned environment. Embedding the server makes it an ordinary dependency — versioned, configured and shipped with the application.

#### Interview explanation
Start from the inversion: the application used to be deployed into a server; now the server is a library inside the application. Mention the default (Tomcat), the alternatives, and most importantly the thread-per-request model with a bounded pool, because that is what determines behaviour under load. Finish with graceful shutdown, which matters for deployments.

#### Syntax
```yaml
server:
  port: 8080
  shutdown: graceful
  tomcat:
    threads:
      max: 200
    connection-timeout: 5s
```

#### Example
```java
// Programmatic customisation when properties are not enough
@Bean
WebServerFactoryCustomizer<TomcatServletWebServerFactory> customizer() {
    return factory -> factory.addConnectorCustomizers(
        connector -> connector.setProperty("relaxedQueryChars", "[]"));
}
```

#### Common interview questions
- "What is the embedded server and why does it matter?" (The servlet container runs inside the application process, so the jar is self-contained and the runtime is identical everywhere.)
- "Which servers can Spring Boot embed?" (Tomcat by default, plus Jetty — and Undertow on Boot 3.x only — for servlet stacks, and Netty for WebFlux.)
- "What is the concurrency model?" (Thread per request from a bounded pool — 200 threads by default in Tomcat — so each in-flight request holds a thread for its duration.)
- "What happens when all threads are busy?" (Accepted connections wait for a free thread; past `max-connections` — 8,192 by default — new connections wait in the OS backlog (`accept-count`, 100), and beyond that are refused. Latency rises sharply long before any error appears.)

#### Follow-up questions
- "How do you deploy as a WAR instead?" (Extend `SpringBootServletInitializer` and set the packaging to `war`; still supported but rarely needed.)
- "How is graceful shutdown configured?" (`server.shutdown=graceful` plus `spring.lifecycle.timeout-per-shutdown-phase`.)
- "When would WebFlux be a better fit?" (Very high concurrency with mostly I/O-bound work, where thread-per-request becomes the limit — at the cost of a reactive programming model throughout.)

#### Edge cases
- `server.port=0` binds a random free port, which is how integration tests avoid conflicts.
- Behind a proxy, `server.forward-headers-strategy` is required for correct scheme and host in generated URLs, because the application otherwise sees the proxy's connection rather than the client's.
- Raising the thread pool without raising the database connection pool simply moves the bottleneck — the extra threads queue for connections instead.

#### Common mistakes
- Increasing thread counts instead of fixing a missing timeout.
- Forgetting graceful shutdown and dropping in-flight requests on deploy.
- Assuming the default port is free in every environment.

#### Comparisons

| | Tomcat | Undertow (Boot 3.x only) | Netty (WebFlux) |
|---|---|---|---|
| Model | Thread per request | Thread per request | Event loop |
| Memory | Moderate | Lowest | Low |
| Programming model | Blocking | Blocking | Reactive |

#### Complexity
Maximum concurrency equals the thread-pool size; each request's cost is its own duration, so slow downstreams consume capacity directly.

#### Frequently confused with
Server threads versus connection-pool size — both bound concurrency, and the smaller one wins.

#### Important facts to remember
- Tomcat, thread per request, 200 by default — a slow call holds its thread for the whole duration.
- Enable graceful shutdown (the default from Boot 3.4) — deploys then drain in-flight requests.
- The pool is your real concurrency limit — once every thread is busy, new requests wait.

---

### 2.5 External Configuration

#### Definition
Property values supplied from files, environment variables, command-line arguments and other sources, resolved through a documented precedence order into the `Environment`.

#### Why it exists
Because an artifact rebuilt per environment is not the artifact you tested. Keeping environment-specific values outside the jar lets one build run everywhere — and since values can then come from several places, a fixed precedence order is needed so conflicts resolve predictably.

#### Interview explanation
Start from the goal — one artifact for every environment — which forces values to come from outside, from several sources. Then give the precedence order from highest to lowest — command line, Java system properties, environment variables, external profile file, external base file, packaged files — and mention relaxed binding, since environment-variable naming is what trips people up in containers.

#### Syntax
```bash
--server.port=9090                     # command-line argument
SPRING_DATASOURCE_URL=...              # environment variable (relaxed binding)
--spring.config.additional-location=/etc/app/   # add an external configuration directory
--spring.config.import=optional:configserver:
```

#### Example
```yaml
app:
  retry:
    max-attempts: ${MAX_ATTEMPTS:3}     # environment variable with a default
```

#### Common interview questions
- "Where can Spring Boot read configuration from?" (Command-line arguments, environment variables, system properties, external and packaged `application.yml`/`.properties`, profile-specific files, and imported sources such as a config server.)
- "What is the precedence order?" (Command line beats environment variables, which beat external config files, which beat packaged ones.)
- "What is relaxed binding?" (`spring.datasource.url`, `SPRING_DATASOURCE_URL` and similar spellings all bind to the same property, which is how container environment variables work.)
- "How do you find where a value came from?" (`/actuator/env` reports the effective value and its source.)

#### Follow-up questions
- "How do you supply secrets?" (Environment variables injected by the platform, a secrets manager, or `spring.config.import` from a vault — never committed files.)
- "What does `spring.config.import` add?" (Importing additional configuration — files, config servers, Kubernetes ConfigMaps — with optional prefixes to tolerate absence.)
- "YAML or properties?" (YAML for nested structures and readability; properties to avoid YAML's indentation and type-coercion surprises. Pick one per project.)

#### Edge cases
- YAML parses `yes`, `no` and `on` as booleans in some versions, because YAML 1.1 defines them as boolean literals — quote strings that look like booleans.
- A higher-priority `PropertySource` does not merge lists; it replaces them entirely, because the list is bound as one value.
- Placeholders inside placeholders resolve, which makes layered defaults possible but hard to trace.

#### Common mistakes
- Committing environment-specific values into the packaged configuration.
- Assuming a file in the jar overrides an external one.
- Expecting list properties to merge across sources.

#### Comparisons

| Source | Precedence | Typical use |
|---|---|---|
| Command-line args | Highest | One-off overrides |
| Environment variables | High | Containers, secrets |
| External config file | Medium | Per-environment settings |
| Packaged config file | Lowest | Defaults |

#### Frequently confused with
Profile files replacing the base file — they layer on top of it.

#### Important facts to remember
- Command line wins — the most deliberate, most specific source.
- Relaxed binding maps env vars — environment variable names cannot use dots, so `SPRING_DATASOURCE_URL` is the canonical spelling.
- `/actuator/env` resolves arguments — it names the winning source.

---

### 2.6 Profiles

#### Definition
Named sets of configuration and conditionally registered beans, activated per environment, that layer over the base configuration.

#### Why it exists
Because environments genuinely differ in infrastructure — endpoints, credentials, stubbed collaborators — and expressing that as conditionals would spread environment checks through the code. Naming each environment and attaching configuration to the name keeps the differences in one place and the code identical everywhere.

#### Interview explanation
Start from what must differ between environments and why `if` statements are the wrong place for it. Explain layering (profile file overrides only what it sets), activation methods, and `@Profile` on beans. Then state the discipline: profiles should change infrastructure, never business behaviour, or production runs untested paths.

#### Syntax
```java
@Profile("prod")
@Profile("!prod")
@Profile({"dev", "test"})
@ActiveProfiles("test")      // in tests
```
```bash
--spring.profiles.active=prod
SPRING_PROFILES_ACTIVE=prod,eu
```

#### Example
```yaml
spring:
  profiles:
    group:
      prod: "prod-db,prod-cache,metrics"   # one name activates several
```

#### Common interview questions
- "What are profiles for?" (Environment-specific configuration and beans, activated by name.)
- "How do you activate one?" (`spring.profiles.active` via property, environment variable or command line; `@ActiveProfiles` in tests.)
- "Does a profile-specific file replace the main one?" (No — it layers over it, overriding only the keys it defines.)
- "How do you make a bean environment-specific?" (`@Profile("prod")` on the bean or its configuration class.)

#### Follow-up questions
- "What are profile groups?" (A single activated name that enables several profiles, keeping activation simple in deployments.)
- "What is the `default` profile?" (Configuration applied when no profile is explicitly active.)
- "Can profiles be combined with expressions?" (Yes — `@Profile("prod & eu")` and negation with `!`.)

#### Edge cases
- Too many profiles makes the effective configuration hard to determine, because several overlays combine; `/actuator/env` is the reliable answer.
- A bean existing only in production means its code path is never exercised elsewhere — production becomes its first test.
- Activating profiles inside `application.yml` itself is error-prone; prefer external activation.

#### Common mistakes
- Branching business logic by profile.
- Testing with a profile set that no environment actually uses.
- Shipping a `prod` profile that was never run outside production.

#### Comparisons

| | Profile | Feature flag |
|---|---|---|
| Changes | Environment wiring | Runtime behaviour |
| Decided at | Startup | Any time |
| Appropriate for | Infrastructure | Business rollout |

#### Frequently confused with
Profiles as feature flags — different lifetimes and different risks.

#### Important facts to remember
- Profile files layer, not replace — they override only the keys they set.
- Activate from outside the jar — the environment should declare which environment it is.
- Keep business logic profile-independent — otherwise production runs code no test ran.

---

### 2.7 Type-Safe Configuration Properties

#### Definition
`@ConfigurationProperties` binds a prefixed group of properties onto a typed, optionally validated object, with automatic type conversion.

#### Why it exists
Because configuration is input typed by humans, and `@Value` injects it as scattered strings checked only for presence and type, so a value that converts but is wrong — a zero, a negative timeout — is accepted silently and surfaces wherever it is first used. Binding it once into a validated object moves every such failure to startup, in one place, with the full configuration surface visible in one class.

#### Interview explanation
Frame configuration as input that deserves parsing and validation, then contrast it with `@Value`: one typed object, validated at startup, with IDE metadata, versus individual values checked only for presence and type. Mention constructor/record binding for immutability and `@Validated` for fail-fast behaviour.

#### Syntax
```java
@Validated
@ConfigurationProperties("app.payment")
public record PaymentProperties(@NotBlank String url, @NotNull Duration timeout) { }

@EnableConfigurationProperties(PaymentProperties.class)
```

#### Example
```java
@Service
public class PaymentService {
    private final PaymentProperties properties;   // injected like any bean
    PaymentService(PaymentProperties properties) { this.properties = properties; }
}
```

#### Common interview questions
- "Why use `@ConfigurationProperties` over `@Value`?" (Type safety, grouping, startup validation, IDE metadata and testability — one object rather than scattered strings.)
- "How do you validate configuration?" (Annotate the class `@Validated` and use Jakarta Bean Validation annotations; binding failures then abort startup.)
- "How are properties converted?" (Built-in converters handle `Duration`, `DataSize`, enums, collections and nested objects; `5s` binds to a `Duration`.)
- "How do you register the properties class?" (`@EnableConfigurationProperties`, or annotate it `@ConfigurationProperties` and make it a scanned component, or use `@ConfigurationPropertiesScan`.)

#### Follow-up questions
- "What is constructor binding?" (Binding through the constructor or record components, producing an immutable configuration object — the default for records.)
- "What generates IDE auto-completion for your own properties?" (`spring-boot-configuration-processor` on the annotation processor path.)
- "How do you test a properties class?" (Construct it directly, or use `ApplicationContextRunner` with `withPropertyValues` for binding tests.)

#### Edge cases
- Unknown keys are ignored by default, so a misspelt key — `max-retry` for `max-retries` — silently leaves the field at its default; relaxed binding widens what counts as a match but does not catch typos.
- Mutable setter-bound properties can be changed at runtime by any holder — a reason to prefer records.
- Nested `Map` and `List` binding has specific syntax rules that differ between YAML and properties.

#### Common mistakes
- A dozen `@Value` fields across services with no single source of truth.
- Skipping `@Validated`, so a missing required value fails on first use instead of at startup.
- Mutable configuration beans mutated by application code.

#### Comparisons

| | `@Value` | `@ConfigurationProperties` |
|---|---|---|
| Granularity | One property | A group |
| Validation | None | Bean Validation |
| Type conversion | Basic | Rich |
| IDE metadata | No | Yes |

#### Frequently confused with
Binding failure versus missing property — an absent optional property binds to `null`, not an error.

#### Important facts to remember
- One typed object per concern — the configuration surface in one place.
- `@Validated` for fail-fast — a bad value stops startup instead of a request.
- Records give immutability — configuration should not change after startup.

---

### 2.8 Project Structure and Build

#### Definition
The conventional package layout — application class at the root, feature or layer packages beneath — plus the Maven or Gradle build that produces the executable artifact.

#### Why it exists
Because component scanning needs a starting point and takes the application class's package — so the layout decides what Spring can see. Following the convention means scanning, tooling and navigation work with no configuration at all.

#### Interview explanation
State the scanning constraint first, then compare layer packages with feature packages and say which you prefer and why. Interviewers are checking whether you have an opinion informed by maintenance, not just familiarity.

#### Syntax
```text
com.shop               ← @SpringBootApplication here
├── order/             ← feature package
├── payment/
├── config/
└── common/
```

#### Example
```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>   <!-- adds repackage -->
    </plugin>
  </plugins>
</build>
```

#### Common interview questions
- "Where should the main application class live?" (In the root package of your code, because component scanning starts there.)
- "How do you organise packages?" (By feature for anything non-trivial — all code for one capability together — or by layer for small services.)
- "What does the Spring Boot Maven plugin do?" (Repackages the jar into an executable fat jar, and can build container images.)
- "Why does my component say 'no qualifying bean'?" (It is outside the scanned package tree.)

#### Follow-up questions
- "When would you split into modules?" (When build time, startup time or team boundaries justify it — and accepting that cross-module refactoring becomes harder.)
- "Where do configuration classes belong?" (A `config` package, or alongside the feature they configure; consistency matters more than the choice.)
- "How do tests mirror this?" (Same package structure under `src/test/java`, so package-private classes are testable.)

#### Edge cases
- A main class in `com.shop.app` will not scan `com.shop.order` — a frequent and confusing failure, because the two packages are siblings, not parent and child.
- Beans in other modules are scanned like any others when their packages sit beneath the main class's package; otherwise they need an explicit `@ComponentScan` or an auto-configuration.
- Package-private beans are scanned fine; visibility affects your code, not Spring.

#### Common mistakes
- Misplacing the application class.
- Layer packages in a large codebase, scattering each feature.
- Forgetting the Boot plugin, producing a jar that will not run.

#### Comparisons

| | Package by layer | Package by feature |
|---|---|---|
| Finding a feature | Across packages | One package |
| Enforcing boundaries | Hard | Natural |
| Familiarity | Higher | Slightly lower |

#### Frequently confused with
Project structure as style — it is functional, because scanning depends on it.

#### Important facts to remember
- Scanning starts at the main class's package — so the main class goes at the root.
- Package by feature as it grows — one change, one package.
- The Boot plugin makes the jar runnable — it repackages it with a launcher.

---

### 2.9 Application Startup and Runners

#### Definition
`SpringApplication.run()` builds the environment and context, starts the server, then invokes `ApplicationRunner` and `CommandLineRunner` beans before publishing `ApplicationReadyEvent`.

#### Why it exists
Because some startup work needs the finished application — every bean built, the server listening — while constructors and `@PostConstruct` run as the context is still being assembled. Runners give that work a defined place at the very end of startup.

#### Interview explanation
Give the order and contrast runners with `@PostConstruct`: runners see a finished context and a listening server. Add the operational caveat — runners delay readiness and run on every replica.

#### Syntax
```java
@Component
class Startup implements ApplicationRunner {
    public void run(ApplicationArguments args) { }
}

@Component
class Legacy implements CommandLineRunner {
    public void run(String... args) { }
}
```

#### Example
```java
@Component
@Order(1)
class VerifyConnectivity implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    VerifyConnectivity(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public void run(ApplicationArguments args) {
        jdbc.queryForObject("SELECT 1", Integer.class);   // fail fast if the DB is unreachable
    }
}
```

#### Common interview questions
- "What is the difference between `ApplicationRunner` and `CommandLineRunner`?" (Only the argument type: `ApplicationArguments` with parsed options, versus the raw `String...`.)
- "When do runners execute?" (After the context is refreshed and the web server has started, before `ApplicationReadyEvent`.)
- "How do runners differ from `@PostConstruct`?" (`@PostConstruct` runs during that bean's creation, when other beans may not exist; a runner runs when everything is ready.)
- "What happens if a runner throws?" (The exception propagates and the application stops — which is usually the desired fail-fast behaviour.)

#### Follow-up questions
- "How do you order several runners?" (`@Order` or the `Ordered` interface.)
- "Is a runner a good place for data seeding?" (For local development yes; for schema and reference data in production, use Flyway or Liquibase, which handle locking and versioning.)
- "What events can you listen to instead?" (`ApplicationReadyEvent`, `ContextRefreshedEvent`, `ApplicationFailedEvent`.)

#### Edge cases
- Runners execute on every instance, so cluster-wide one-off work needs its own locking.
- Long-running work in a runner keeps the instance out of the load balancer, because readiness turns on only after runners finish — and becomes a restart loop if a probe that restarts pods is pointed at readiness.
- `ApplicationReadyEvent` fires once per context — test contexts included.

#### Common mistakes
- Seeding or migrating data from a runner across replicas.
- Treating a runner as a scheduler.
- Swallowing exceptions in a runner, so a broken dependency starts healthy.

#### Comparisons

| | `@PostConstruct` | `ApplicationRunner` | `ApplicationReadyEvent` |
|---|---|---|---|
| Timing | During bean creation | After context + server | After runners |
| Whole context available | No | Yes | Yes |
| Typical use | Local init | Startup tasks | Post-start hooks |

#### Frequently confused with
Runners versus scheduled tasks — one runs once, the other repeatedly.

#### Important facts to remember
- Runners run after the server starts — the application is complete by then.
- Exceptions stop the application — startup is all or nothing.
- They run on every instance — every replica performs its own startup.

---

### 2.10 Packaging and Running

#### Definition
The Boot plugin repackages the application into an executable jar with a nested-jar layout and a launcher; layered jars and buildpacks extend this for container images.

#### Why it exists
Because once the server is embedded, the application needs only a JVM — but Java cannot load classes from jars nested inside a jar. Boot's launcher solves exactly that, so one file becomes the whole deployable unit.

#### Interview explanation
Start from the obstacle — the JDK cannot load nested jars — then explain the fat-jar layout and `JarLauncher` as the fix, then layered jars as the container-friendly form — dependencies and application code in separate layers so rebuilds push only what changed. Mention `MaxRAMPercentage` as the container memory point.

#### Syntax
```bash
mvn clean package
java -jar target/app.jar --server.port=9090
java -Djarmode=tools -jar app.jar list-layers
mvn spring-boot:build-image            # OCI image via buildpacks, no Dockerfile
```

#### Example
```bash
# Container-friendly JVM flags
java -XX:MaxRAMPercentage=75 \
     -XX:+ExitOnOutOfMemoryError \
     -jar app.jar
```

#### Common interview questions
- "What is a fat jar?" (An executable jar containing your classes plus all dependencies as nested jars, launched by Boot's `JarLauncher`.)
- "Why use layered jars?" (They separate slow-changing dependencies from fast-changing application code, so container image layers cache well and rebuilds are small.)
- "How do you build a container image?" (A Dockerfile using the `tools` jar mode — formerly `layertools` — to extract the layers, or `bootBuildImage` / `spring-boot:build-image` with Cloud Native Buildpacks.)
- "How should the JVM heap be sized in a container?" (With `-XX:MaxRAMPercentage` so the heap derives from the container limit, rather than a fixed `-Xmx` that may exceed it.)

#### Follow-up questions
- "Can you still produce a WAR?" (Yes — `war` packaging plus `SpringBootServletInitializer`, for deployment to an external container.)
- "What do native images change?" (Startup drops to milliseconds and memory falls, at the cost of build time and extra configuration for reflection and proxies.)
- "Why does `java -cp app.jar com.example.App` fail?" (Your classes sit under `BOOT-INF/classes` and the libraries are nested jars that only Boot's launcher can read. Unzipped, the same files run with an ordinary classpath of `BOOT-INF/classes` plus `BOOT-INF/lib/*`.)

#### Edge cases
- `-Xmx` larger than the container limit leads to OOM kills with no JVM error, because the kernel kills the process before the JVM reaches its own limit.
- Buildpack images pick a JVM version from metadata, which can differ from your local JDK.
- Native images need hints for reflection-heavy libraries, because everything reflective must be known at build time — and some dynamic patterns simply do not work.

#### Common mistakes
- Copying the fat jar as one container layer.
- Fixed `-Xmx` in a container.
- Assuming a Boot jar behaves like an ordinary jar.

#### Comparisons

| | Fat jar | Layered jar | Native image |
|---|---|---|---|
| Startup | ~1–3 s | ~1–3 s | ~50 ms |
| Image rebuild size | Whole jar | Changed layers | Whole binary |
| Build complexity | Lowest | Low | Highest |

#### Frequently confused with
Executable jar versus plain jar — the layouts are not interchangeable.

#### Important facts to remember
- `JarLauncher` runs nested jars — the JDK on its own cannot.
- Layer for cacheable images — unchanged layers are reused.
- Size the heap by percentage in containers — the container limit, not the host, constrains memory.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 2. Next: REST APIs with Spring MVC.*

---

## 3. REST APIs with Spring MVC

### Table of Contents (this group)
- [[#3.1 HTTP and REST Fundamentals]]
- [[#3.2 The DispatcherServlet]]
- [[#3.3 Controllers and Request Mapping]]
- [[#3.4 Binding Request Data]]
- [[#3.5 Responses and Status Codes]]
- [[#3.6 JSON Serialization]]
- [[#3.7 Content Negotiation]]
- [[#3.8 Designing a CRUD API]]
- [[#3.9 Filters and Interceptors]]
- [[#3.10 Calling Other Services]]

---

### 3.1 HTTP and REST Fundamentals

#### Definition
REST is an architectural style using HTTP's uniform interface — resource URLs, standard methods, status codes, statelessness — to expose and manipulate resources.

#### Why it exists
Because independently built clients and servers need one shared vocabulary — operations, outcomes, metadata — or every pair would need a custom protocol. HTTP supplies that vocabulary, and REST's resources-plus-methods style makes an API predictable, so any HTTP-capable client can consume a service without a bespoke protocol or a shared client library.

#### Interview explanation
Define safe and idempotent precisely, then connect idempotency to retries: a timed-out `POST` cannot be retried blindly, which is why non-idempotent endpoints need idempotency keys. That link is what separates a memorised answer from an operational one.

#### Syntax
```http
GET /api/orders/42 HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
```

#### Example
```java
// Idempotent creation using a client-supplied key
@PostMapping
ResponseEntity<OrderResponse> create(
        @RequestHeader("Idempotency-Key") String key,
        @RequestBody @Valid CreateOrderRequest request) {
    return service.createOnce(key, request);     // same key returns the first result
}
```

#### Common interview questions
- "What makes an API RESTful?" (Resource-oriented URLs, standard HTTP methods with their defined semantics, statelessness, appropriate status codes and a uniform interface.)
- "What does idempotent mean, and which methods are?" (The same request repeated has the same effect as once: `GET`, `PUT`, `DELETE` and `HEAD` are; `POST` and `PATCH` generally are not.)
- "What is a safe method?" (One with no side effects — `GET` and `HEAD` — which is why caches and prefetchers may call them freely.)
- "`PUT` or `PATCH` for updates?" (`PUT` replaces the whole resource and is idempotent; `PATCH` applies a partial change and generally is not.)

#### Follow-up questions
- "How do you make a `POST` safely retryable?" (An idempotency key the server stores, returning the original result for a repeat.)
- "Is REST stateless?" (Yes — each request carries everything needed; server-side session state breaks horizontal scaling.)
- "When would you choose gRPC or GraphQL instead?" (gRPC for high-throughput internal service-to-service calls with a schema; GraphQL when clients need to shape their own responses and over-fetching is the main problem.)

#### Edge cases
- `DELETE` on a missing resource is debatable: 404 is informative, 204 makes a retry look identical to the first call. Both are idempotent — idempotency concerns the server's state, not the response code — so pick one and document it.
- `GET` with a body is not forbidden but is widely unsupported by proxies and clients, because its meaning was never defined — intermediaries may drop it.
- 201 responses should carry a `Location` header; many APIs omit it and clients then guess the URL.

#### Common mistakes
- `GET` endpoints that mutate state.
- Calling an RPC-over-HTTP API "REST" without resource semantics.
- Retrying non-idempotent calls automatically.

#### Comparisons

| | REST | gRPC | GraphQL |
|---|---|---|---|
| Transport | HTTP/1.1 or 2 | HTTP/2 | HTTP |
| Schema | Optional (OpenAPI) | Required (protobuf) | Required |
| Best for | Public and general APIs | Internal, high-throughput | Client-shaped reads |

#### Frequently confused with
`PUT` versus `PATCH`, and "RESTful" versus "JSON over HTTP".

#### Important facts to remember
- Safe: `GET`, `HEAD`. Idempotent: plus `PUT`, `DELETE` — repeating them changes nothing further.
- `POST` needs idempotency keys to be retryable — otherwise the server cannot tell a retry from a new request.
- Statelessness is what allows scaling out — any instance can serve any request.

---

### 3.2 The DispatcherServlet

#### Definition
Spring MVC's front controller: the single servlet that receives every request, selects a handler, resolves its arguments, invokes it, and writes the response.

#### Why it exists
Because every endpoint needs the same chores — routing, binding, conversion, serialisation, error translation — and repeating them in each handler multiplies code and inconsistency. One front-controller servlet performs them once, in a fixed pipeline, and calls your method only for the part that differs.

#### Interview explanation
Start from the chores every endpoint would otherwise repeat, then walk the chain that performs them — filters, dispatcher, handler mapping, interceptors, argument resolution, handler, message converter, exception resolver. Naming `HandlerMapping`, `HandlerAdapter` and `HttpMessageConverter` demonstrates you know where to extend and where to look when binding misbehaves.

#### Syntax
```yaml
spring:
  mvc:
    servlet:
      path: /            # DispatcherServlet mapping
logging:
  level:
    org.springframework.web: DEBUG
```

#### Example
```java
// A custom argument resolver: inject the current tenant from a header
@Component
class TenantArgumentResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) { return p.getParameterType() == Tenant.class; }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer m,
                                  NativeWebRequest request, WebDataBinderFactory f) {
        return new Tenant(request.getHeader("X-Tenant"));
    }
}
```

#### Common interview questions
- "What is the DispatcherServlet?" (Spring MVC's front controller — one servlet that routes every request to a handler and coordinates binding, invocation and response writing.)
- "Walk through the request lifecycle." (Filters → DispatcherServlet → HandlerMapping → interceptors `preHandle` → argument resolution → controller method → message converter → `postHandle`/`afterCompletion` → response.)
- "What is an HttpMessageConverter?" (A component that converts between Java objects and request/response bodies — Jackson's handles JSON.)
- "Where are exceptions handled?" (In `HandlerExceptionResolver`s, which is where `@ExceptionHandler` and `@ControllerAdvice` take effect.)

#### Follow-up questions
- "How do you add custom parameter types to controllers?" (Implement `HandlerMethodArgumentResolver` and register it via `WebMvcConfigurer`.)
- "How is the handler chosen?" (`RequestMappingHandlerMapping` matches path, method, headers, params and media types, preferring the most specific mapping.)
- "What is the difference between WebMvc and WebFlux here?" (WebFlux replaces the servlet stack with a reactive `DispatcherHandler` on an event loop; the annotation model is similar, the threading model is not.)

#### Edge cases
- Two identical mappings fail at startup with an ambiguous-mapping error; two *different* patterns that match a request equally well — `/{id}` and `/{code}` on one path — pass startup and fail on the first such request, because specificity can only be compared against a real URL.
- An exception thrown inside a message converter happens after the status is chosen, so the response can be partially written.
- Filters run for every request, matched or not; interceptors run only around a chosen handler — though in Boot an unmatched path usually falls through to the static-resource handler, so interceptors registered for all paths may still run there.

#### Common mistakes
- Assuming controllers are plain method calls with no machinery in between.
- Putting handler-specific logic in a filter, where the handler is unknown.
- Debugging binding without enabling web debug logging.

#### Comparisons

| | Filter | DispatcherServlet | Interceptor |
|---|---|---|---|
| Layer | Servlet | Spring MVC | Spring MVC |
| Sees unmatched requests | Yes | Yes | No |
| Knows the handler | No | Yes | Yes |

#### Complexity
A fixed amount of per-request work — mapping lookup, resolver dispatch, serialisation — dominated by whatever the handler itself does.

#### Frequently confused with
Front controller versus controller.

#### Important facts to remember
- One servlet handles everything — so the chores are solved once.
- `HandlerMapping` picks, `HandlerAdapter` invokes — finding and calling are separate steps.
- Converters write the body — your method returns objects, never bytes.

---

### 3.3 Controllers and Request Mapping

#### Definition
`@RestController` classes expose handler methods mapped to HTTP method and path by `@RequestMapping` or its shortcuts, with optional header, parameter and media-type conditions.

#### Why it exists
Because a single dispatcher needs to know which method handles which request. Declaring the mapping on the method keeps each route visible beside the code it reaches — no separate routing file to drift out of sync — and lets duplicate mappings be detected at startup.

#### Interview explanation
Cover the shortcut annotations, class-level prefixes, and `@RestController` as `@Controller` plus `@ResponseBody`. The current detail worth adding is the Spring 6 trailing-slash change, which breaks clients that previously worked.

#### Syntax
```java
@RestController
@RequestMapping("/api/orders")
class OrderController {
    @GetMapping("/{id}") OrderResponse get(@PathVariable Long id) { ... }
    @PostMapping(consumes = APPLICATION_JSON_VALUE) ResponseEntity<OrderResponse> create(...) { ... }
    @DeleteMapping("/{id}") @ResponseStatus(NO_CONTENT) void delete(@PathVariable Long id) { ... }
}
```

#### Example
```java
@GetMapping(value = "/{id}", produces = "application/vnd.shop.v2+json")
OrderResponseV2 getV2(@PathVariable Long id) { ... }     // media-type versioning
```

#### Common interview questions
- "What is the difference between `@Controller` and `@RestController`?" (`@RestController` adds `@ResponseBody` to every method, so returns are serialised into the body rather than resolved as views.)
- "How do you map an HTTP method to a handler?" (`@GetMapping`, `@PostMapping` and the rest, or `@RequestMapping(method = ...)`.)
- "What changed about trailing slashes?" (Spring 6 no longer matches them by default, so `/orders/` returns 404 unless explicitly configured.)
- "How do you avoid ambiguous mappings?" (Never declare two mappings with the same path, method and conditions, and avoid two patterns of equal specificity, such as `/{id}` and `/{code}`, on one path. A literal beside a pattern is fine — the literal is more specific and wins.)

#### Follow-up questions
- "How do you version an API?" (URL path versioning is the most common and most debuggable; media-type versioning is cleaner but harder to inspect.)
- "Can one method handle several paths?" (Yes — `@GetMapping({"/a", "/b"})` — but it usually hurts readability.)
- "How do you see all registered routes?" (`/actuator/mappings`.)

#### Edge cases
- Path variables containing dots or slashes need care; the parser treats the path strictly, because `/` separates segments and is never part of a variable by default.
- `@RequestMapping` at class level composes with method level, so a leading slash in both is fine but a missing one is confusing.
- Returning `void` with no `@ResponseStatus` yields 200 and an empty body, which is rarely what an API wants for a delete.

#### Common mistakes
- Trailing-slash assumptions carried over from Spring 5.
- Business logic in the controller instead of the service.
- Inconsistent path naming — singular here, plural there.

#### Comparisons

| | `@RequestMapping` | Shortcut annotations |
|---|---|---|
| Specifies method | Via `method =` | In the annotation name |
| Readability | Lower | Higher |
| Class-level use | Common | `@RequestMapping` only |

#### Frequently confused with
`@Controller` versus `@RestController`.

#### Important facts to remember
- `@RestController` = `@Controller` + `@ResponseBody` — return values become bodies, not view names.
- No trailing-slash matching since Spring 6 — `/orders/` and `/orders` are different paths.
- `/actuator/mappings` lists routes.

---

### 3.4 Binding Request Data

#### Definition
Annotation-driven conversion of request parts — path segments, query parameters, headers and the body — into controller method arguments, with type conversion and validation.

#### Why it exists
Because a request is text, while handlers want typed, validated values. Declaring on each parameter where its value comes from lets the framework do the cutting, converting and validating once — before business code runs.

#### Interview explanation
Map each annotation to its source, mention the `ConversionService` for types, and note that validation produces different exceptions depending on where the constraint sits — `MethodArgumentNotValidException` for a `@Valid` body, `HandlerMethodValidationException` (Spring 6.1+) for constraints on parameters — a detail that matters when writing a global error handler.

#### Syntax
```java
@PathVariable Long id
@RequestParam(defaultValue = "0") int page
@RequestParam(required = false) String filter
@RequestHeader("X-Tenant") String tenant
@RequestBody @Valid CreateOrderRequest body
@CookieValue("session") String session
```

#### Example
```java
@GetMapping
Page<OrderSummary> list(@Valid OrderQuery query, Pageable pageable) {
    // OrderQuery binds from query parameters; Pageable binds page, size and sort
    return service.search(query, pageable);
}
```

#### Common interview questions
- "How do you read a query parameter versus a path variable?" (`@RequestParam` for the query string, `@PathVariable` for a URI template segment.)
- "How do you validate a request body?" (`@Valid` on the `@RequestBody` parameter, with Bean Validation annotations on the DTO.)
- "Which exception does a validation failure throw?" (`MethodArgumentNotValidException` for a `@Valid` body; `HandlerMethodValidationException` for constraints declared directly on controller parameters, since Spring 6.1 — or `ConstraintViolationException` if the controller carries a class-level `@Validated`.)
- "How are types converted?" (By the `ConversionService` — enums, numbers and dates work out of the box, and you can register custom converters.)

#### Follow-up questions
- "How do you bind many query parameters cleanly?" (A plain object or record parameter without `@RequestBody` binds field by field.)
- "What does `-parameters` have to do with binding?" (Without it, parameter names are absent from the bytecode, so a `@RequestParam` or `@PathVariable` that relies on the parameter name fails at runtime.)
- "How do you handle a date format?" (`@DateTimeFormat`, or configure a global format; always state the expected format in the API documentation.)

#### Edge cases
- A missing `@RequestParam` without a default returns 400 before your method runs, because parameters are resolved before invocation.
- An empty request body with `@RequestBody` throws `HttpMessageNotReadableException`, not a validation error — there is no object yet to validate.
- A `List<String>` binds from repeated parameters (`?id=1&id=2`) and from a comma-separated value (`?id=1,2`), because the default conversion service splits on commas — so a single value that contains a comma is split too.

#### Common mistakes
- Required-by-default optional filters.
- Forgetting `@Valid`, so constraints on the DTO are never checked.
- Handling only one of the validation exception types.

#### Comparisons

| Annotation | Source | Required by default |
|---|---|---|
| `@PathVariable` | URI template | Yes |
| `@RequestParam` | Query or form | Yes |
| `@RequestBody` | Body | Yes |
| `@RequestHeader` | Header | Yes |

#### Frequently confused with
`MethodArgumentNotValidException` versus `HandlerMethodValidationException` — and `ConstraintViolationException`, which comes from proxy-based validation outside the MVC pipeline.

#### Important facts to remember
- One annotation per request part — it names where the value comes from.
- `@Valid` triggers Bean Validation — before the method body runs.
- Compile with `-parameters` — otherwise parameter names do not exist at runtime.

---

### 3.5 Responses and Status Codes

#### Definition
The response status, headers and body, produced by returning an object, a `ResponseEntity`, or by annotating with `@ResponseStatus`.

#### Why it exists
Because clients, caches, proxies and monitoring all act on the status code, so it carries more operational weight than the body — and none of them reads your body. A standard code lets every tool understand the outcome without understanding your API.

#### Interview explanation
Name the common codes and their triggers, insist that client errors are 4xx and server faults 5xx, and explain why 200-with-an-error-body is harmful: every dashboard and client treats it as success.

#### Syntax
```java
return ResponseEntity.ok(body);
return ResponseEntity.created(uri).body(body);
return ResponseEntity.noContent().build();
return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
@ResponseStatus(HttpStatus.CREATED)
```

#### Example
```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long id) { super("order " + id + " not found"); }
}
// Thrown from the service; Spring turns it into a 404 automatically
```

#### Common interview questions
- "When do you return 201 versus 200?" (201 for a successful creation, with a `Location` header pointing at the new resource; 200 for other successful responses with a body.)
- "What is the difference between 401 and 403?" (401 means not authenticated — credentials missing or invalid; 403 means authenticated but not allowed.)
- "When is 409 appropriate?" (A state conflict — a duplicate, or an optimistic-locking failure.)
- "Why not return 200 with an error field?" (Clients, caches and monitoring treat 2xx as success, so failures become invisible.)

#### Follow-up questions
- "What is `ProblemDetail`?" (Spring 6's implementation of RFC 9457 `application/problem+json`, giving errors a standard shape.)
- "What should a `DELETE` return?" (204 with no body is the common choice; 200 with the deleted representation is also defensible if documented.)
- "How do you set headers?" (Through `ResponseEntity`, or by injecting `HttpServletResponse` for special cases.)

#### Edge cases
- `@ResponseStatus` on an exception class is ignored when an `@ExceptionHandler` handles that exception — the handler's response wins.
- A status set after the response has started streaming cannot be changed, because the status line is the first thing written to the wire.
- 204 responses must not include a body; some clients fail if one is sent.

#### Common mistakes
- 500 for validation failures.
- Missing `Location` on 201.
- Mixing `ResponseEntity` and plain returns inconsistently across one API.

#### Comparisons

| | Plain return | `ResponseEntity` | `@ResponseStatus` |
|---|---|---|---|
| Status control | 200 only | Full | Fixed per method or exception |
| Headers | No | Yes | No |
| Readability | Highest | Lower | High |

#### Frequently confused with
401 versus 403, and 400 versus 422.

#### Important facts to remember
- 4xx is the client, 5xx is you — that split is what makes error-rate alerts meaningful.
- 201 carries `Location` — the client learns where the new resource lives.
- Never return 200 for a failure — every tool will count it as success.

---

### 3.6 JSON Serialization

#### Definition
Jackson converts controller return values into JSON and request bodies into Java objects, through message converters configured by Spring Boot.

#### Why it exists
Because objects live in memory and the network carries bytes, so every type must be converted in both directions. Doing that by convention in one configured library — with annotations only for the exceptions — removes hand-written mapping code for every class.

#### Interview explanation
Explain the auto-configured `ObjectMapper` and how to customise it without replacing it, then make the architectural point: serialise DTOs, never entities, because entity serialisation triggers lazy loading mid-response.

#### Syntax
```java
@JsonProperty("created_at") @JsonIgnore @JsonInclude(NON_NULL)
@JsonFormat(shape = STRING, pattern = "yyyy-MM-dd")
@JsonCreator @JsonValue
```

#### Example
```java
@Bean
Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
    return builder -> builder
        .serializationInclusion(JsonInclude.Include.NON_NULL)
        .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}
```

#### Common interview questions
- "How does Spring Boot serialise responses?" (Jackson, via `MappingJackson2HttpMessageConverter`, using an auto-configured `ObjectMapper`.)
- "How do you customise JSON output?" (Annotations on the DTO, `spring.jackson.*` properties, or a `Jackson2ObjectMapperBuilderCustomizer`; declaring your own `ObjectMapper` replaces Boot's entirely.)
- "Why not return JPA entities from controllers?" (Serialisation can trigger lazy loading — extra queries or `LazyInitializationException` — and it couples the wire format to the database schema.)
- "How are Java 8 dates handled?" (The JSR-310 module, included by default, serialises them as ISO-8601 strings.)

#### Follow-up questions
- "What happens with unknown JSON fields?" (Boot disables `FAIL_ON_UNKNOWN_PROPERTIES`, so they are ignored — a deliberate choice for forwards compatibility.)
- "How do records work with Jackson?" (Natively, through the canonical constructor; no setters are required.)
- "How do you serialise a sensitive field?" (Do not: `@JsonIgnore`, or keep it off the DTO entirely.)

#### Edge cases
- Bidirectional relationships serialise into infinite recursion, because each side refers back to the other, without `@JsonManagedReference`/`@JsonBackReference` — another reason to use DTOs.
- `BigDecimal` serialises as a number and can lose precision in JavaScript clients, because JavaScript numbers are 64-bit floating point; strings are safer for money.
- A custom `ObjectMapper` bean silently drops every Boot default, including the date module, because declaring the bean makes the auto-configured one back off.

#### Common mistakes
- Returning entities directly.
- Replacing the `ObjectMapper` instead of customising it.
- Serialising `Instant` without an explicit, documented format.

#### Comparisons

| | Entity as response | DTO as response |
|---|---|---|
| Lazy-loading risk | Yes | No |
| Couples DB to API | Yes | No |
| Extra code | None | A mapping step |

#### Frequently confused with
Jackson annotations on entities versus on DTOs.

#### Important facts to remember
- DTOs, not entities — the wire format and the schema change for different reasons.
- Customise, do not replace, the mapper — replacing it loses Boot's defaults.
- Unknown properties are ignored by default — so additive changes do not break readers.

---

### 3.7 Content Negotiation

#### Definition
Selecting the response representation from the client's `Accept` header, and the body parser from `Content-Type`, with `produces` and `consumes` narrowing a mapping.

#### Why it exists
Because clients differ in what they can send and read, and a format mismatch should fail with a precise status rather than an obscure parse error. Headers declare the formats; the server matches them against the converters it has.

#### Interview explanation
Start from the two headers — `Content-Type` describes what is sent, `Accept` what is wanted. Then distinguish 406 from 415 clearly — produce versus consume — because that pair is the actual interview question. Then mention media-type versioning as the advanced use.

#### Syntax
```java
@GetMapping(produces = APPLICATION_JSON_VALUE)
@PostMapping(consumes = APPLICATION_JSON_VALUE)
```
```yaml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: false
```

#### Example
```java
@GetMapping(value = "/{id}", produces = {"application/json", "application/xml"})
OrderResponse get(@PathVariable Long id) { ... }   // one handler, two representations
```

#### Common interview questions
- "What is content negotiation?" (The server choosing a response format based on the client's `Accept` header, and parsing the body according to `Content-Type`.)
- "What is the difference between 406 and 415?" (406: the server cannot produce the requested `Accept` type. 415: the server cannot consume the supplied `Content-Type`.)
- "What do `produces` and `consumes` do?" (Restrict which requests a handler matches by media type, so mismatches fail with the right status rather than inside the method.)
- "How can content negotiation version an API?" (Custom media types such as `application/vnd.shop.v2+json` in `produces`.)

#### Follow-up questions
- "Can URL extensions select a format?" (That mechanism existed but is disabled by default now, for security and predictability reasons.)
- "What if the client sends no `Accept` header?" (The server uses the first type it can produce — typically JSON.)
- "How do you add XML support?" (Add the Jackson XML module, which registers an XML message converter.)

#### Edge cases
- A missing `Content-Type` on a `POST` with a body produces 415, because the server cannot tell the body is JSON — which looks like a routing problem.
- `Accept: */*` matches anything, which is what most tooling sends.
- `produces` affects matching, not just serialisation, so a mismatch yields 406 rather than a handler invocation.

#### Common mistakes
- Debugging a handler when the answer is a missing header.
- Declaring `produces` inconsistently across endpoints.
- Assuming 415 means a malformed body.

#### Comparisons

| | `Accept` | `Content-Type` |
|---|---|---|
| Describes | What the client will accept | What the client is sending |
| Mismatch yields | 406 | 415 |

#### Frequently confused with
406 versus 415.

#### Important facts to remember
- `Accept` → produces → 406 — the server cannot write what you want.
- `Content-Type` → consumes → 415 — the server cannot read what you sent.
- Media types can carry versions.

---

### 3.8 Designing a CRUD API

#### Definition
A resource-oriented HTTP interface mapping create, read, update and delete onto `POST`, `GET`, `PUT`/`PATCH` and `DELETE`, with pagination, filtering and a consistent error contract.

#### Why it exists
Because an API is a long-lived contract with consumers you do not control. Reusing HTTP's own conventions — nouns, methods, status codes, one error shape — makes it predictable without reading documentation, and that consistency is what lets it evolve without breaking clients. Consistency and predictability matter more than cleverness.

#### Interview explanation
Sketch the route table, then raise the two things juniors omit: pagination on every collection, and one standard error shape. Mention `ProblemDetail` as the modern default.

#### Syntax
```text
GET    /api/orders?status=OPEN&page=0&size=20&sort=createdAt,desc
POST   /api/orders                → 201 + Location
GET    /api/orders/{id}           → 200 | 404
PUT    /api/orders/{id}           → 200 | 404
DELETE /api/orders/{id}           → 204
```

#### Example
```java
@GetMapping
Page<OrderSummary> list(@RequestParam(required = false) Status status,
                        @PageableDefault(size = 20) Pageable pageable) {
    return service.find(status, pageable);     // always paged
}
```

#### Common interview questions
- "How would you design a REST API for orders?" (Plural resource paths, standard methods, 201 with `Location` on create, paged collections, consistent error bodies, and sub-resources for contained entities.)
- "How do you handle actions that are not CRUD?" (A sub-resource action such as `POST /orders/{id}/cancel` — explicit and documented, rather than overloading `PATCH`.)
- "How do you paginate?" (Query parameters bound to `Pageable`, returning page metadata; never an unbounded list.)
- "What should an error response look like?" (One shape for the whole API — `ProblemDetail` / RFC 9457 with type, title, status and detail — and never a stack trace.)

#### Follow-up questions
- "How do you version an API?" (URL path versioning for simplicity; media-type versioning for purity. Decide before the first external client.)
- "How do you handle partial updates?" (`PATCH` with a sparse body, or JSON Merge Patch; be explicit about how `null` is interpreted.)
- "What about filtering and sorting?" (Query parameters with a documented whitelist of fields — never pass user input straight into a sort clause.)

#### Edge cases
- `PATCH` with `null` is ambiguous: is the field being cleared or omitted? Document the rule.
- Deep pagination with large offsets is slow, because the database still reads and discards every skipped row; keyset pagination scales better.
- Returning the created resource on 201 is convenient but increases coupling to the entity's shape.

#### Common mistakes
- Unbounded collection endpoints.
- A different error shape per endpoint.
- Verbs in URLs for ordinary CRUD.

#### Comparisons

| | Offset pagination | Keyset pagination |
|---|---|---|
| Simple | Yes | Less |
| Deep pages | Slow | Fast |
| Stable under inserts | No | Yes |

#### Frequently confused with
`PUT` versus `PATCH` semantics.

#### Important facts to remember
- Page every collection — data grows; response size must not.
- One error contract, API-wide — clients parse errors once.
- 201 plus `Location` on create — clients should never guess the URL.

---

### 3.9 Filters and Interceptors

#### Definition
Servlet filters wrap the whole dispatch; Spring MVC interceptors wrap handler invocation and know which handler was chosen.

#### Why it exists
Because some work — correlation ids, logging, authentication, timing — applies to every request, and copying it into each handler guarantees it will be missing somewhere. Filters and interceptors place it around the request instead; the essential difference is the layer — around the whole dispatcher, or around your handler.

#### Interview explanation
Contrast the two by layer and capability, then give the MDC correlation-id filter as the canonical example and flag the cleanup requirement, since thread reuse makes a missing `finally` a real bug.

#### Syntax
```java
class MyFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) { }
}

class MyInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) { return true; }
}
```

#### Example
```java
@Configuration
class WebConfig implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new TimingInterceptor()).addPathPatterns("/api/**");
    }
}
```

#### Common interview questions
- "What is the difference between a filter and an interceptor?" (A filter is servlet-level and runs around the whole dispatch without knowing the handler; an interceptor is Spring MVC-level and runs around the handler, which it can inspect.)
- "Which would you use for authentication?" (A filter — Spring Security is built as a filter chain, so it can reject before any MVC machinery runs.)
- "Why extend `OncePerRequestFilter`?" (It guarantees a single execution per request even with forwards and includes.)
- "What are the interceptor hooks?" (`preHandle` before the handler, `postHandle` after it, `afterCompletion` after the response — the last one runs even when an exception occurred.)

#### Follow-up questions
- "How do you log request bodies safely?" (Wrap the request in `ContentCachingRequestWrapper` and log `getContentAsByteArray()` after `chain.doFilter` — it records what the controller read — accepting the memory cost and redacting sensitive fields.)
- "How is ordering controlled?" (`@Order` on filters; registration order for interceptors.)
- "Why can MDC leak between requests?" (Thread pools reuse threads, so values must be cleared in a `finally` block.)

#### Edge cases
- `postHandle` does not run when the handler throws; `afterCompletion` does, provided that interceptor's `preHandle` returned `true` — which is why cleanup belongs in `afterCompletion`.
- Filters see requests that match no handler — useful for 404 logging.
- Async requests run the handler on a different thread, so `ThreadLocal`-based context must be propagated explicitly.

#### Common mistakes
- Not clearing MDC.
- Reading the body in a filter without wrapping it.
- Using an interceptor where security demands a filter.

#### Comparisons

| | Filter | Interceptor |
|---|---|---|
| Layer | Servlet | Spring MVC |
| Handler known | No | Yes |
| Can wrap request/response | Yes | No |
| Sees unmatched requests | Yes | No |

#### Frequently confused with
Interceptors versus AOP aspects — one is request-scoped, the other method-scoped.

#### Important facts to remember
- Filters are outside, interceptors inside — around the dispatcher versus around the handler.
- `OncePerRequestFilter` for safety — forwards and error dispatches would otherwise run a filter twice.
- Always clear MDC in `finally` — threads are pooled and reused.

---

### 3.10 Calling Other Services

#### Definition
Outbound HTTP via `RestClient` (synchronous), `WebClient` (reactive) or declarative `@HttpExchange` interfaces, configured once as beans with timeouts and error handling.

#### Why it exists
Because services depend on other services, and those calls need the same discipline as inbound requests: typing, timeouts, error translation and observability — plus one new risk: the other side may be slow, and a call with no timeout holds your thread for as long as it takes.

#### Interview explanation
State the current recommendation — `RestClient` for blocking code, `WebClient` for reactive — and then the two production essentials: both timeouts set explicitly, and the client built once so connections pool.

#### Syntax
```java
RestClient client = RestClient.builder().baseUrl(url).build();
client.get().uri("/orders/{id}", id).retrieve().body(Order.class);

@HttpExchange("/orders")
interface OrderApi { @GetExchange("/{id}") Order get(@PathVariable Long id); }
```

#### Example
```java
@Bean
RestClient inventoryClient(RestClient.Builder builder) {
    var http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
    var factory = new JdkClientHttpRequestFactory(http);
    factory.setReadTimeout(Duration.ofSeconds(3));
    return builder
        .baseUrl("https://inventory.internal")
        .requestFactory(factory)
        .defaultStatusHandler(HttpStatusCode::is5xxServerError,
            (req, res) -> { throw new InventoryUnavailableException(); })
        .build();
}
```

#### Common interview questions
- "Which HTTP client should you use in Spring today?" (`RestClient` for synchronous code, `WebClient` for reactive; `RestTemplate` is in maintenance mode on Spring Framework 6 and deprecated from Spring Framework 7.)
- "What must you configure on any HTTP client?" (Connect and read timeouts, error handling, and a shared instance so connections are pooled.)
- "What happens without a read timeout?" (The thread can block indefinitely — most clients' default read timeout is infinite — and under load this exhausts the server's thread pool.)
- "What are declarative HTTP interfaces?" (`@HttpExchange` interfaces from which Spring generates a client, analogous to Feign.)

#### Follow-up questions
- "How do you add retries?" (Resilience4j, Spring Framework 7's built-in `@Retryable`, or Spring Retry on older versions — only for idempotent operations, with exponential back-off and a cap.)
- "How do you propagate tracing?" (Micrometer Tracing instruments the clients, forwarding trace headers automatically when the client is a managed bean.)
- "How do you test an outbound call?" (`MockRestServiceServer` for `RestClient`/`RestTemplate`, or WireMock for a realistic HTTP double.)

#### Edge cases
- Calling `block()` on a reactive event-loop thread is refused — Reactor throws `IllegalStateException` — because blocking the thread that must complete the response would hang it.
- A client created per request exhausts ephemeral ports under load, because each new client opens new connections instead of reusing pooled ones.
- Connection-pool limits are a separate bound from timeouts and need sizing too.

#### Common mistakes
- No timeouts.
- New client per call.
- Blind retries on non-idempotent endpoints.

#### Comparisons

| | `RestClient` | `WebClient` | `RestTemplate` |
|---|---|---|---|
| Style | Synchronous, fluent | Reactive | Synchronous, legacy |
| Status | Current | Current | Maintenance in Spring 6; deprecated in Spring 7, removal planned for 8 |
| Use in MVC apps | Preferred | Possible | Existing code |

#### Frequently confused with
`RestTemplate`'s status by version — maintenance mode on Spring Framework 6 (Boot 3); documented as deprecated in Spring Framework 7 (Boot 4), with removal planned for 8.

#### Important facts to remember
- `RestClient` for new blocking code — `RestTemplate` is on its way out.
- Always set both timeouts — connect bounds reaching the server, read bounds waiting for its answer.
- Build the client once — so connections are pooled.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 3. Next: Backend Architecture & Layering.*

---

## 4. Backend Architecture & Layering

### Table of Contents (this group)
- [[#4.1 The Layered Architecture]]
- [[#4.2 The Controller Layer]]
- [[#4.3 The Service Layer]]
- [[#4.4 The Repository Layer]]
- [[#4.5 DTOs and the API Boundary]]
- [[#4.6 Mapping Between Layers]]
- [[#4.7 Bean Validation]]
- [[#4.8 Global Exception Handling]]
- [[#4.9 Domain Modelling]]
- [[#4.10 Hexagonal Architecture]]

---

### 4.1 The Layered Architecture

#### Definition
An arrangement in which controllers adapt HTTP, services hold business operations and transaction boundaries, and repositories handle persistence, with dependencies pointing downward only.

#### Why it exists
Because HTTP handling, business decisions and data access change for different reasons and at different rates. In one undivided class they collide, so a change to one ripples through the others and none can be tested or reused alone. Separate layers, with dependencies pointing one way, contain each change.

#### Interview explanation
Name each layer with its single responsibility, then say where the transaction lives and why — on the service, because the business operation is the unit of work. That one detail shows you have built something rather than read about it.

#### Syntax
```java
@RestController class OrderController { }     // HTTP
@Service        class OrderService { }        // rules + @Transactional
interface OrderRepository extends JpaRepository<Order, Long> { }   // persistence
```

#### Example
```java
@Transactional                       // service owns the unit of work
public Order place(PlaceOrderCommand command) {
    var order = Order.place(customers.require(command.customerId()), command.lines());
    return orders.save(order);
}
```

#### Common interview questions
- "Describe the layers of a typical Spring Boot application." (Controller for HTTP adaptation, service for business logic and transactions, repository for persistence; each depends only on the layer below.)
- "Why not let the controller call the repository?" (It bypasses the transaction boundary and business rules, and leaves no place for cross-cutting concerns to live.)
- "Where does `@Transactional` belong?" (On the service method, because the business operation is the atomic unit; on a repository it commits each step independently.)
- "What is an anaemic domain model?" (Entities that are only data holders with all behaviour in services — workable, but rules then scatter and drift.)

#### Follow-up questions
- "Should layers be separate modules?" (Packages suffice for most services; modules enforce boundaries mechanically at the cost of build complexity.)
- "How do you keep the service layer from growing without limit?" (Organise by use case rather than by entity, and push invariants into the domain objects.)
- "Where do DTO mappings happen?" (At the boundary each DTO belongs to — controller for API DTOs, repository for persistence shapes.)

#### Edge cases
- Read-only endpoints still benefit from going through the service, where `@Transactional(readOnly = true)` and permissions apply.
- A scheduled job and an HTTP endpoint invoking the same service is the point of the layering.
- Layer violations compile fine, which is why an architecture test is worth having.

#### Common mistakes
- Repository calls from controllers.
- `@Transactional` on controllers.
- A "service" that is only a pass-through to the repository with no rules of its own.

#### Comparisons

| Layer | Owns | Must not know about |
|---|---|---|
| Controller | HTTP, DTOs, status codes | SQL, entities |
| Service | Rules, transactions | HTTP |
| Repository | Queries, persistence | HTTP, business rules |

#### Frequently confused with
Layered architecture versus hexagonal — one orders dependencies downward, the other inward.

#### Important facts to remember
- Three layers, three reasons to change — that is the whole argument.
- Transactions belong to services — the business operation is the unit of work.
- Controllers never touch repositories — or rules and transactions get skipped.

---

### 4.2 The Controller Layer

#### Definition
The HTTP adapter: it binds and validates requests, maps DTOs, calls one service method and selects the response status.

#### Why it exists
Because if protocol details leak into business code, that code can only be reached over HTTP. Keeping everything HTTP-specific in one translating layer leaves the business logic reusable from schedulers, message consumers and tests.

#### Interview explanation
Say "thin controller" and define it concretely — bind, delegate, map, return — then name what must not appear: business conditionals, repository calls, transactions.

#### Syntax
```java
@RestController
@RequestMapping("/api/orders")
class OrderController {
    @PostMapping ResponseEntity<OrderResponse> create(@RequestBody @Valid CreateOrderRequest r) { }
    @GetMapping("/{id}") OrderResponse get(@PathVariable Long id) { }
}
```

#### Example
```java
@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
void cancel(@PathVariable Long id) {
    service.cancel(id);          // service throws OrderNotFound / AlreadyShipped
}
```

#### Common interview questions
- "What belongs in a controller?" (Request binding, validation triggering, DTO mapping, calling the service and choosing the status code — nothing else.)
- "How do you test a controller?" (`@WebMvcTest` with `MockMvc` and a mocked service: it loads only the web layer, so tests are fast and focused.)
- "How should a controller handle 'not found'?" (Let the service throw a domain exception and translate it centrally in `@RestControllerAdvice`.)
- "Why not put `@Transactional` on a controller?" (The transaction would span everything the handler does — mapping, response building, any remote call — holding a connection far longer than the business operation needs, in the wrong layer.)

#### Follow-up questions
- "How do you avoid duplicated mapping code?" (Static factories on DTOs or a mapper component, used consistently in one direction per boundary.)
- "What if an endpoint needs two service calls?" (Usually a sign the use case belongs in one service method that owns the whole operation and its transaction.)
- "Should controllers return `Optional`?" (No — translate absence to a 404 through an exception, so every endpoint behaves the same.)

#### Edge cases
- Returning an entity from a controller works and is the source of lazy-loading trouble during serialisation — extra queries while `open-in-view` is on, `LazyInitializationException` once it is off — because serialisation happens after the service's transaction has closed.
- `@WebMvcTest` does not load services or repositories, so collaborators must be mocked.
- A controller method with no return and no `@ResponseStatus` silently returns 200.

#### Common mistakes
- Business rules in controllers.
- Returning entities.
- Inconsistent status codes across endpoints.

#### Comparisons

| | Thin controller | Fat controller |
|---|---|---|
| Reusable logic | Yes, in the service | No |
| Testable without HTTP | Yes | No |
| Typical length | 3–5 lines | Dozens |

#### Frequently confused with
`@WebMvcTest` versus `@SpringBootTest` — slice versus whole application.

#### Important facts to remember
- Bind, delegate, map, return — translation only.
- No transactions, no repositories — those belong to the operation, not the protocol.
- `@WebMvcTest` for the slice.

---

### 4.3 The Service Layer

#### Definition
The layer holding business operations: it coordinates repositories and collaborators, enforces rules and defines the transaction boundary.

#### Why it exists
Because business behaviour is the application's own value and must be independent of how it is invoked or stored — and because a business operation must succeed or fail as a whole, it needs one place that defines that unit: the service method and its transaction.

#### Interview explanation
Describe one service method as one use case inside one transaction, then raise the production point interviewers like: avoid remote calls inside a transaction, because an open transaction holds a database connection across a network round trip.

#### Syntax
```java
@Service
public class OrderService {
    @Transactional public Order place(PlaceOrderCommand command) { }
    @Transactional(readOnly = true) public Order require(Long id) { }
}
```

#### Example
```java
@Transactional
public void cancel(Long id) {
    var order = orders.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    order.cancel();                                  // invariant enforced in the domain
    events.publishEvent(new OrderCancelled(id));     // listener runs after commit
}
```

#### Common interview questions
- "What goes in the service layer?" (Business operations: coordinating repositories and collaborators, enforcing rules, and defining the transaction boundary.)
- "Why should the service own the transaction?" (The business operation is what must be atomic; a transaction per repository call commits partial work.)
- "Why avoid HTTP calls inside a transaction?" (The database connection stays open for the duration of the remote call, so a slow dependency exhausts the connection pool.)
- "How do you keep services from becoming huge?" (Split by use case, push invariants into domain objects, and treat a growing service as a modelling signal.)

#### Follow-up questions
- "Where do domain events fit?" (Published from the service, consumed by listeners — ideally with `@TransactionalEventListener(AFTER_COMMIT)` so side effects only happen if the transaction succeeded.)
- "How do you test a service?" (Plain unit tests with faked repositories; add an integration test for the transactional behaviour itself.)
- "Should services call other services?" (Sparingly, and in one direction — mutual calls between services are a cycle in disguise.)

#### Edge cases
- Self-invocation inside a service bypasses `@Transactional` on the called method, because the call never passes through the proxy.
- `@Transactional(readOnly = true)` lets Hibernate skip dirty checking and some databases route to a replica.
- Publishing an event before commit means listeners can observe state that is later rolled back.

#### Common mistakes
- Remote calls inside transactions.
- Services that only delegate to repositories.
- Business rules duplicated across several services.

#### Comparisons

| | Rules in services | Rules in domain objects |
|---|---|---|
| Discoverability | Scattered | With the data |
| Duplication risk | High | Low |
| Testability | Needs mocks | Plain object tests |

#### Frequently confused with
Orchestration versus business logic — services coordinate, domain objects decide.

#### Important facts to remember
- One method, one use case, one transaction — so the operation commits or rolls back whole.
- No remote calls inside transactions — they hold a database connection across the network.
- Push invariants into the domain — so every service gets them for free.

---

### 4.4 The Repository Layer

#### Definition
The persistence boundary — in Spring, an interface extending `JpaRepository` for which Spring Data generates the implementation, with derived queries, `@Query` and projections.

#### Why it exists
Because business code containing data-access plumbing is tied to one database and untestable without it. A repository interface makes persistence a typed, substitutable dependency — and since most repositories look alike, Spring Data generates them, removing the boilerplate.

#### Interview explanation
Explain that Spring Data implements the interface at startup by parsing method names, and that `@Query` takes over when a name would be unreadable. Mention projections, since selecting fewer columns is the standard fix for slow list endpoints.

#### Syntax
```java
List<Order> findByCustomerIdAndStatusOrderByCreatedAtDesc(Long customerId, Status status);
Page<Order> findByStatus(Status status, Pageable pageable);
Optional<Order> findByReference(String reference);
@Query("select o from Order o join fetch o.lines where o.id = :id") Optional<Order> findWithLines(Long id);
@Modifying @Query("update Order o set o.status = ?1 where o.id = ?2") int setStatus(Status s, Long id);
```

#### Example
```java
public interface OrderSummaryView {       // projection: selects only these columns
    Long getId();
    String getReference();
    BigDecimal getTotal();
}
List<OrderSummaryView> findByStatus(Status status);
```

#### Common interview questions
- "How does Spring Data create repository implementations?" (It generates a proxy at startup, deriving queries from method names and using `@Query` where provided.)
- "What is a derived query?" (A query parsed from the method name — `findByCustomerIdAndStatus` becomes a where clause on two columns.)
- "When would you use `@Query` instead?" (When the derived name would be unreadable, when you need a join fetch, or when you need native SQL.)
- "What is a projection and why use one?" (An interface or record with a subset of fields, so the query selects only those columns — the usual fix for heavy list endpoints.)

#### Follow-up questions
- "How do you add custom implementation code?" (A custom fragment interface plus an `Impl` class, which Spring Data mixes into the generated repository.)
- "What does `@Modifying` do?" (Marks a query as an update or delete; it bypasses the persistence context, so entities already loaded can become stale.)
- "Why does `findAll()` worry you?" (It loads the entire table; it is correct in a test fixture and dangerous in production.)

#### Edge cases
- A derived query name Spring Data cannot parse fails at startup, not at compile time, because the compiler sees only an interface method name.
- `@Modifying` queries need `clearAutomatically` or a flush to avoid stale managed entities, because they update the database directly, bypassing the persistence context.
- Before Hibernate 6, a join-fetch query returning `List<Entity>` repeated the root entity once per joined row unless `distinct` was added; Hibernate 6 (Boot 3) de-duplicates entity results itself.

#### Common mistakes
- Unbounded `findAll()`.
- Twenty-word derived method names.
- Entity loading where a projection would do.

#### Comparisons

| | Derived query | `@Query` JPQL | Native SQL |
|---|---|---|---|
| Readability | Good when short | Good | Depends |
| Portability | Full | Full | Database-specific |
| Power | Limited | High | Highest |

#### Frequently confused with
Repository versus DAO — in Spring usage the terms overlap; repository implies an aggregate-oriented interface.

#### Important facts to remember
- Implementations are generated at startup — so a bad method name fails at startup.
- Projections cut the columns fetched — less data read, less memory used.
- `@Modifying` bypasses the persistence context — managed entities can be stale afterwards.

---

### 4.5 DTOs and the API Boundary

#### Definition
Dedicated request and response types that define the API contract independently of the persistence model.

#### Why it exists
Because the API and the schema change for different reasons, and one shared class turns every schema change into an API change. A separate type per boundary also means only intended fields cross it — in both directions.

#### Interview explanation
Give the three concrete reasons not to expose entities — lazy loading during serialisation, automatic exposure of new columns, and mass assignment on binding. Those are specific failures, not style preferences, which is what makes the answer convincing.

#### Syntax
```java
public record CreateOrderRequest(@NotNull Long customerId, @NotEmpty List<LineRequest> lines) { }
public record OrderResponse(Long id, String status, BigDecimal total) { }
```

#### Example
```java
public static OrderResponse from(Order order) {
    return new OrderResponse(order.getId(), order.getStatus().name(), order.getTotal());
}
```

#### Common interview questions
- "Why not return JPA entities from controllers?" (Lazy associations can trigger queries or exceptions during serialisation, every new column is published automatically, and the API becomes coupled to the schema.)
- "What is mass assignment?" (Binding request data straight onto an entity, letting a client set fields such as `role` or `status` that were never meant to be writable.)
- "Should request and response DTOs be the same class?" (No — they differ in which fields exist and which are required; sharing one forces everything to be optional.)
- "Is the extra mapping worth it?" (Yes at any boundary that outlives a single release — it is the difference between a schema change and a breaking API change.)

#### Follow-up questions
- "Where should DTO classes live?" (With the feature they belong to, near the controller that uses them.)
- "How do DTOs interact with OpenAPI?" (They are the documented schema; annotations on them produce the published contract.)
- "Can records be used?" (Yes — they are the natural fit: immutable, concise and supported by Jackson and Bean Validation.)

#### Edge cases
- A DTO field added without updating the mapper silently serialises as null, because nothing ever assigns it.
- Validation annotations belong on the DTO, not the entity, so failures surface as 400 at the boundary instead of as persistence errors after the business logic has run.
- Deeply nested DTOs become their own maintenance problem; flatten where the API allows.

#### Common mistakes
- Entities as request or response bodies.
- One shared DTO for create, update and read.
- Validation annotations only on entities.

#### Comparisons

| | Entity exposed | DTO |
|---|---|---|
| Schema change breaks API | Yes | No |
| Mass assignment risk | Yes | No |
| Extra code | None | Mapping |

#### Frequently confused with
DTOs versus domain objects — one crosses a boundary, the other holds behaviour.

#### Important facts to remember
- Never bind or serialise entities — binding is mass assignment; serialising leaks fields.
- Separate request and response types — different fields, different reasons to change.
- Records are the idiomatic DTO — immutable data carriers.

---

### 4.6 Mapping Between Layers

#### Definition
Explicit conversion between DTOs, domain objects and entities, written by hand or generated at compile time by a mapper such as MapStruct.

#### Why it exists
Because once each layer has its own types, something must convert between them — and the boundary is where you decide what crosses it. Making that decision explicit is the point of having boundaries.

#### Interview explanation
Compare hand-written mapping, MapStruct and reflection-based mappers on safety and speed, and state a preference with a reason: compile-time generation catches renamed fields, reflection does not.

#### Syntax
```java
@Mapper(componentModel = "spring")
interface OrderMapper {
    OrderResponse toResponse(Order order);
    Order toDomain(CreateOrderRequest request);
}
```

#### Example
```java
// Hand-written, in the DTO itself — no dependency, fully explicit
record OrderResponse(Long id, String status) {
    static OrderResponse from(Order o) { return new OrderResponse(o.getId(), o.getStatus().name()); }
}
```

#### Common interview questions
- "How do you map between DTOs and entities?" (A static factory on the DTO, a dedicated mapper class, or a compile-time generator such as MapStruct.)
- "Why avoid reflection-based mappers?" (They match by field name at runtime, so a rename produces silent nulls instead of a build-time report — and they are slower.)
- "Where should mapping happen?" (At the boundary, once per direction: controller maps DTO to command, service works in domain terms.)
- "What does MapStruct generate?" (Plain Java mapping code at compile time, so it is as fast as hand-written code and reports mismatches at build time — warnings by default, errors with `unmappedTargetPolicy = ERROR`.)

#### Follow-up questions
- "How do you handle a field that needs computing?" (`@Mapping(expression = ...)` in MapStruct, or a hand-written method where the logic is clearer.)
- "Is mapping duplication a smell?" (The structures look alike but change for different reasons — that is not duplication in the meaningful sense.)
- "How do you test mappers?" (Plain unit tests asserting every field, including nulls and edge values.)

#### Edge cases
- Bidirectional mapping of cyclic object graphs can recurse infinitely, because each side maps the other.
- Generated mappers need the annotation processor configured, or no implementation is generated and the failure surfaces only as a missing bean at startup.
- Mapping collections element by element can hide an N+1 query when the source is lazily loaded.

#### Common mistakes
- Reflection-based copying for critical paths.
- Mapping several times per request.
- Mapper classes containing business logic.

#### Comparisons

| | Hand-written | MapStruct | Reflection |
|---|---|---|---|
| Compile-time safety | Yes | Yes | No |
| Boilerplate | High | Low | None |
| Performance | Fast | Fast | Slower |

#### Frequently confused with
Mapping as duplication — same shape, different purpose.

#### Important facts to remember
- Map once per boundary — more conversions add cost, not safety.
- Prefer compile-time safety — renamed fields are reported at build time.
- Keep logic out of mappers — a mapper translates; it does not decide.

---

### 4.7 Bean Validation

#### Definition
Jakarta Bean Validation: declarative constraints on fields and parameters, enforced by Spring when a parameter is annotated `@Valid` or a class `@Validated`.

#### Why it exists
Because every input from outside can be missing, too long or malformed, and hand-written checks in each method are repetitive and easy to forget. Declaring constraints on the fields keeps each rule next to the data it describes and enforces all of them before business code runs.

#### Interview explanation
Distinguish `@NotNull`, `@NotEmpty` and `@NotBlank` precisely — that trio is the most common question — and mention that the exception depends on where the constraint sits — `MethodArgumentNotValidException` for a `@Valid` body, `HandlerMethodValidationException` for constraints on controller parameters.

#### Syntax
```java
@NotNull @NotBlank @NotEmpty
@Size(min = 1, max = 100) @Min(0) @Max(10) @Positive
@Email @Pattern(regexp = "...") @Past @Future
@Valid                 // cascade into nested objects
@Validated             // class level: validate method parameters
```

#### Example
```java
@Target(FIELD) @Retention(RUNTIME)
@Constraint(validatedBy = SkuValidator.class)
public @interface ValidSku {
    String message() default "invalid SKU";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

#### Common interview questions
- "What is the difference between `@NotNull`, `@NotEmpty` and `@NotBlank`?" (`@NotNull` only rejects null; `@NotEmpty` also rejects empty strings and collections; `@NotBlank` additionally rejects whitespace-only strings.)
- "How do you validate a request body?" (`@Valid` on the `@RequestBody` parameter, with constraints on the DTO.)
- "How do you write a custom constraint?" (An annotation plus a `ConstraintValidator` implementation; register nothing else — Spring discovers it.)
- "Which exceptions do validation failures throw?" (In controllers, `MethodArgumentNotValidException` for `@Valid` bodies and `HandlerMethodValidationException` for constraints on parameters, since Spring 6.1. In other `@Validated` beans, `ConstraintViolationException`.)

#### Follow-up questions
- "How do you validate nested objects?" (`@Valid` on the field or on the collection's element type, which cascades.)
- "What are validation groups?" (Named sets of constraints applied selectively — for example different rules on create and update.)
- "Why not validate on entities?" (Entity constraints fire when the entity is persisted or flushed, deep inside persistence, producing a confusing error at the wrong layer.)

#### Edge cases
- Before Spring 6.1, `@Valid` on a `@RequestBody List<T>` checked nothing — the list itself has no constrained properties — and the usual workaround was a class-level `@Validated`. Since 6.1, built-in method validation handles `@Valid` on lists and maps and cascades into their elements.
- Constraint messages are developer-facing by default and often unsuitable for end users.
- Cross-field rules require a class-level custom constraint, not field annotations, because a field constraint sees only its own field.

#### Common mistakes
- `@NotNull` where `@NotBlank` was meant.
- Validation only on entities.
- Handling just one of the validation exception types.

#### Comparisons

| | `@NotNull` | `@NotEmpty` | `@NotBlank` |
|---|---|---|---|
| `null` | Rejected | Rejected | Rejected |
| `""` | Allowed | Rejected | Rejected |
| `"   "` | Allowed | Allowed | Rejected |

#### Frequently confused with
The `@NotNull` / `@NotEmpty` / `@NotBlank` trio.

#### Important facts to remember
- `@NotBlank` for required strings — `@NotNull` accepts empty and whitespace-only values.
- `@Valid` cascades — into nested objects that carry it.
- Several exception types to handle — body failures versus parameter failures.

---

### 4.8 Global Exception Handling

#### Definition
`@RestControllerAdvice` classes with `@ExceptionHandler` methods that translate exceptions into HTTP responses for every controller.

#### Why it exists
Because exceptions arise everywhere, and converting them in each controller makes the API's error behaviour drift — different codes, different shapes, leaked stack traces. One central translator gives the whole API one error contract and removes repetitive try/catch blocks from controllers.

#### Interview explanation
Describe the advice plus handler mechanism, then show a `ProblemDetail` response and the catch-all that logs with a reference id but returns no internals. The reference-id detail signals operational experience.

#### Syntax
```java
@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(OrderNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ProblemDetail handle(OrderNotFoundException ex) { }
}
```

#### Example
```java
@ExceptionHandler(DataIntegrityViolationException.class)
ProblemDetail conflict(DataIntegrityViolationException ex) {
    log.warn("constraint violation", ex);                        // detail stays internal
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Resource already exists");
}
```

#### Common interview questions
- "How do you handle exceptions globally?" (A `@RestControllerAdvice` class with `@ExceptionHandler` methods per exception type, returning a consistent error body.)
- "What is `ProblemDetail`?" (Spring 6's RFC 9457 implementation — a standard error body with type, title, status, detail and instance.)
- "How do you choose the status code?" (`@ResponseStatus` on the handler or the exception class, or by returning a `ResponseEntity`/`ProblemDetail` with the status set.)
- "What should a 500 response contain?" (A generic message and a reference id — never a stack trace, SQL or class names.)

#### Follow-up questions
- "How does handler selection work?" (The most specific matching exception type wins, so a handler for `Exception` acts as the fallback.)
- "What is `ResponseEntityExceptionHandler`?" (A base class providing handlers for Spring's own exceptions — binding failures, unsupported media types — which you can extend and override.)
- "How do you handle validation errors usefully?" (Collect field errors into a map in the problem body so clients can highlight the offending inputs.)

#### Edge cases
- Exceptions thrown in filters never reach `@ControllerAdvice`, because they occur outside the dispatcher.
- Exceptions thrown while writing the response body cannot change the already-sent status, because the status line goes out first.
- `@ControllerAdvice` can be scoped to packages or annotations when one API needs different handling.

#### Common mistakes
- Returning `ex.getMessage()` to clients.
- No catch-all handler, so unexpected exceptions produce the default error page.
- Different error shapes per endpoint.

#### Comparisons

| | Per-controller try/catch | `@RestControllerAdvice` |
|---|---|---|
| Consistency | Low | High |
| Duplication | High | None |
| Visibility of handling | Local | Central |

#### Frequently confused with
`@ControllerAdvice` versus `@RestControllerAdvice` — the latter adds `@ResponseBody`.

#### Important facts to remember
- One advice, one error contract — every endpoint fails the same way.
- `ProblemDetail` is the standard body — RFC 9457, so clients already understand it.
- Log details, return a reference — internals stay private, and support can still find them.

---

### 4.9 Domain Modelling

#### Definition
Expressing the business in types — entities with identity, value objects without, aggregates enforcing invariants — with behaviour placed alongside the data it governs.

#### Why it exists
Because when entities are only field holders, each rule lives in the services that use them — re-checked in several places and forgotten in one. Putting the rule inside the object that owns the data enforces it once, on every path.

#### Interview explanation
Contrast rich and anaemic models with a concrete example: `order.cancel()` enforcing "cannot cancel a shipped order" versus that check repeated in three services. Then mention value objects as the cheapest first step.

#### Syntax
```java
record Money(BigDecimal amount, Currency currency) { }      // value object
@Entity class Order { private Status status; public void cancel() { } }   // aggregate root
```

#### Example
```java
public void addLine(Product product, int quantity) {
    if (status != Status.DRAFT) throw new OrderNotEditableException(id);
    if (quantity <= 0) throw new IllegalArgumentException("quantity must be positive");
    lines.add(new OrderLine(product.sku(), quantity, product.price()));
}
```

#### Common interview questions
- "What is an anaemic domain model?" (Entities holding only data, with all behaviour in services — rules then scatter and drift out of sync.)
- "What is a value object?" (An immutable type with no identity, equal by value — `Money`, `EmailAddress` — which can validate itself on construction.)
- "What is an aggregate root?" (The entity through which a cluster of related objects is accessed and whose invariants it enforces — the boundary of a transaction.)
- "Where should business rules live?" (With the data they constrain, so no code path can bypass them.)

#### Follow-up questions
- "Does JPA constrain domain modelling?" (Yes — no-arg constructors, mutable collections and lazy proxies pull against immutability and encapsulation; most teams compromise deliberately.)
- "How do you avoid public setters?" (Expose intention-revealing methods — `cancel()`, `addLine()` — and keep fields private with no blanket setters.)
- "Do you need full DDD?" (No — value objects and invariants in entities deliver most of the benefit without the full method and vocabulary.)

#### Edge cases
- Entity equality must not depend on values that change: a generated id goes from `null` to a value at persist time, which moves the entity to a different hash bucket in any `HashSet` already holding it. Compare by id only when it is set, with a constant `hashCode`, or use an immutable business key.
- Hibernate requires a no-argument constructor, which can be `protected` to discourage misuse, because Hibernate instantiates entities reflectively before filling their fields.
- Lazy proxies break `getClass()` comparisons — and `instanceof` checks against subtypes, so a proxy for `Animal` is never an instance of `Dog` even when the row is one — because the object you hold is a generated subclass of the declared type, not the actual class.

#### Common mistakes
- Public setters on every field.
- `BigDecimal` and `String` where a value object belongs.
- Rules duplicated across services.

#### Comparisons

| | Rich model | Anaemic model |
|---|---|---|
| Rules | In the entity | In services |
| Invariants | Enforced centrally | Re-checked per caller |
| Testing | Plain object tests | Needs mocks |

#### Frequently confused with
Entity (JPA) versus entity (domain) — the same word for a persistence mapping and a modelling concept.

#### Important facts to remember
- Rules next to the data — one place to enforce, no way around it.
- Value objects remove whole error classes — an invalid `Money` cannot be constructed.
- Aggregates define transaction boundaries — one aggregate, one consistent change.

---

### 4.10 Hexagonal Architecture

#### Definition
Ports and adapters: the application core defines interfaces for what it needs and offers, and infrastructure implements them, so dependencies point inward.

#### Why it exists
Because in plain layering the business core depends on the infrastructure beneath it, so every framework or storage change reaches into the rules. Inverting the dependency — the core declares ports, infrastructure supplies adapters — keeps the valuable, long-lived logic independent, testable and durable across technology changes.

#### Interview explanation
Explain the inward dependency rule with one example — a repository interface defined in the domain, implemented by a JPA adapter. Then be honest about the trade-off: it is justified by domain complexity, not by default.

#### Syntax
```java
// core
public interface OrderRepository { Optional<Order> findById(OrderId id); void save(Order order); }
// infrastructure
@Component class JpaOrderRepositoryAdapter implements OrderRepository { }
```

#### Example
```java
// The core use case knows only ports — no Spring, no JPA, no HTTP
public class PlaceOrder {
    private final OrderRepository orders;
    private final PaymentPort payments;

    public Order handle(PlaceOrderCommand command) { ... }
}
```

#### Common interview questions
- "What is hexagonal architecture?" (Ports and adapters: the core defines interfaces, infrastructure implements them, and all dependencies point inward toward the domain.)
- "How does it differ from layered architecture?" (Layered dependencies point downward, so the domain depends on persistence abstractions defined below it; hexagonal inverts that — the domain defines the interface and infrastructure implements it.)
- "What is the benefit?" (The core is testable with no framework, and infrastructure can be replaced by writing a new adapter.)
- "When is it not worth it?" (Simple CRUD services, where the extra interfaces and mapping add indirection without protecting anything valuable.)

#### Follow-up questions
- "How does this relate to clean or onion architecture?" (Different names for the same dependency-inversion idea with slightly different layer vocabularies.)
- "Can you adopt it partially?" (Yes — defining repository interfaces in domain terms and keeping framework annotations out of domain classes captures most of the testability benefit.)
- "Where do DTOs live in this style?" (In the adapters — each adapter maps between its own representation and the domain model.)

#### Edge cases
- JPA annotations on domain classes break the purity but save a mapping layer; teams choose one compromise and stick to it.
- A port with exactly one adapter forever is indirection with no payoff — the inversion only pays when something can actually be swapped.
- Mapping between domain and persistence models adds real code and real bugs.

#### Common mistakes
- Adopting it for a CRUD service.
- Pass-through adapters that add nothing.
- Half-applying it, paying both costs.

#### Comparisons

| | Layered | Hexagonal |
|---|---|---|
| Dependency direction | Downward | Inward |
| Domain knows persistence | Through its abstraction | Only its own port |
| Overhead | Low | Higher |
| Best for | CRUD services | Complex domains |

#### Frequently confused with
Hexagonal versus layered — the direction of the dependency is the difference.

#### Important facts to remember
- Core defines ports, infrastructure adapts.
- Dependencies point inward — the core imports nothing from frameworks.
- Justified by domain complexity — not a default for CRUD.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 4. Next: SQL & Relational Data Modelling.*

---

## 5. SQL & Relational Data Modelling

### Table of Contents (this group)
- [[#5.1 The Relational Model]]
- [[#5.2 SELECT and Filtering]]
- [[#5.3 Joins]]
- [[#5.4 Aggregation]]
- [[#5.5 Subqueries and CTEs]]
- [[#5.6 Indexes]]
- [[#5.7 Query Plans]]
- [[#5.8 Schema Design]]
- [[#5.9 Constraints]]
- [[#5.10 Schema Migrations]]

---

### 5.1 The Relational Model

#### Definition
Data organised as tables of rows and columns, with primary keys identifying rows and foreign keys expressing relationships that the engine enforces.

#### Why it exists
Because data stored in one program's shape answers only that program's questions. Storing plain facts in tables, with relationships as values, separates logical structure from physical storage — so any query can describe the result it wants and the engine decides how to produce it.

#### Interview explanation
Define keys and cardinality, then make the point that SQL is declarative: the same query may execute differently as data grows, which is why reading plans matters more than memorising syntax.

#### Syntax
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Example
```sql
-- many-to-many needs a join table
CREATE TABLE product_tags (
  product_id BIGINT NOT NULL REFERENCES products(id),
  tag_id     BIGINT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (product_id, tag_id)
);
```

#### Common interview questions
- "What is a primary key and a foreign key?" (A primary key uniquely identifies a row; a foreign key references a primary key in another table and is enforced by the database.)
- "How do you model a many-to-many relationship?" (A join table holding both foreign keys, usually with a composite primary key.)
- "Where does the foreign key go in one-to-many?" (On the many side — each order stores its customer id.)
- "What is referential integrity?" (The guarantee that a foreign key always points at an existing row, enforced on every write.)

#### Follow-up questions
- "Surrogate or natural keys?" (Surrogate keys — generated ids — are stable when business values change; natural keys avoid a join but become painful when the business redefines them.)
- "What is denormalisation?" (Deliberately duplicating data for read performance, accepting the consistency cost.)
- "When would a document store fit better?" (Hierarchical data read as a whole, variable schemas, or when joins are genuinely absent from the access pattern.)

#### Edge cases
- Composite primary keys are valid but complicate JPA mapping and foreign-key references, because every referencing table must carry all the key columns.
- A nullable foreign key means "optional relationship" — intentional, but easily accidental.
- Self-referencing foreign keys model hierarchies and need care in deletes, because a parent cannot be removed while children still point at it.

#### Common mistakes
- Mirroring Java class structure instead of data relationships.
- Omitting foreign keys "for performance".
- Natural keys on values that later change.

#### Comparisons

| | Surrogate key | Natural key |
|---|---|---|
| Stability | High | Depends on the business |
| Readability | Low | High |
| Join cost | Extra lookup | None |

#### Frequently confused with
Primary key versus unique constraint — a table has one primary key and may have many unique constraints.

#### Important facts to remember
- Foreign key on the many side — each child row holds one value pointing at its parent.
- Join table for many-to-many — neither side can hold a list in one column.
- The engine enforces integrity, not the app — every writer passes through it.

---

### 5.2 SELECT and Filtering

#### Definition
`SELECT` with `WHERE`, `ORDER BY` and `LIMIT` retrieves and shapes rows, evaluated in a defined logical order.

#### Why it exists
Because tables are large and results small: moving rows to the application only to discard them wastes network, memory and time. Filtering, sorting and limiting therefore happen where the data and the indexes are, rather than in application memory.

#### Interview explanation
Give the logical evaluation order, explain null semantics, and define sargability — a predicate that can use an index. The `WHERE lower(email) = ?` example shows why a function around a column disables the index.

#### Syntax
```sql
SELECT col_a, col_b FROM t
WHERE col_a = ? AND col_b > ? AND col_c IS NOT NULL
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;
```

#### Example
```sql
-- Not sargable: the index on email cannot be used
WHERE lower(email) = 'a@b.com'
-- Sargable alternatives: store normalised, or create an expression index
CREATE INDEX idx_users_email_lower ON users (lower(email));
```

#### Common interview questions
- "What is the logical order of SQL clauses?" (`FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT` — which is why a `SELECT` alias cannot be used in `WHERE`.)
- "Why does `WHERE column = NULL` return nothing?" (`NULL` means unknown, so the comparison is unknown rather than true; use `IS NULL`.)
- "What is a sargable predicate?" (One the engine can satisfy using an index — typically a bare column compared to a value, not wrapped in a function.)
- "Why avoid `SELECT *`?" (It fetches unnecessary columns, prevents index-only scans and breaks consumers when columns are added.)

#### Follow-up questions
- "What goes wrong with `NOT IN` and nulls?" (If the subquery returns any `NULL`, `NOT IN` yields no rows; `NOT EXISTS` behaves as expected.)
- "How do you paginate efficiently?" (Keyset pagination — `WHERE id > :lastId ORDER BY id LIMIT n` — rather than large `OFFSET` values.)
- "Does `LIMIT` make a query cheap?" (Only if the engine can stop early — with a matching index it can; with a sort over the whole table it cannot.)

#### Edge cases
- `ORDER BY` without a deterministic tiebreaker can return rows in different orders between runs, breaking pagination, because rows that compare equal have no defined order.
- String comparison depends on collation — the rules for ordering characters — so sorting differs between databases and locales.
- Implicit type conversion can silently disable an index — comparing a text column to a number is the common case.

#### Common mistakes
- Filtering in application code.
- `= NULL` instead of `IS NULL`.
- Deep `OFFSET` pagination on large tables.

#### Comparisons

| | `WHERE` | `HAVING` |
|---|---|---|
| Filters | Rows | Groups |
| Runs | Before aggregation | After |
| Can use indexes | Yes | Rarely |

#### Complexity
With a usable index, filtered reads are O(log n) plus the matching rows; without one, O(n).

#### Frequently confused with
`WHERE` versus `HAVING`.

#### Important facts to remember
- `IS NULL`, never `= NULL` — any comparison with `NULL` is unknown, not true.
- Functions on columns break index use — the index stores the column, not the function's result.
- Name your columns — `SELECT *` breaks when columns are added and prevents index-only scans.

---

### 5.3 Joins

#### Definition
Operations combining rows from two inputs on a condition, with inner, left, right, full and cross variants, executed as nested loop, hash or merge joins.

#### Why it exists
Because normalisation stores each fact once, in its own table, so almost every useful question needs facts from several tables. Joins reassemble them on demand inside the engine — splitting and joining are two halves of one design.

#### Interview explanation
Define each join type by what it keeps, then raise the `LEFT JOIN` plus `WHERE` trap — a condition on the optional side in `WHERE` silently makes it an inner join. That example is the one interviewers use to separate textbook from practical knowledge.

#### Syntax
```sql
FROM a INNER JOIN b ON b.a_id = a.id
FROM a LEFT  JOIN b ON b.a_id = a.id AND b.status = 'X'
FROM a CROSS JOIN b
```

#### Example
```sql
-- customers with no orders
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

#### Common interview questions
- "What is the difference between inner and left join?" (Inner keeps only matching pairs; left keeps every left row, filling nulls where there is no match.)
- "Why did my left join behave like an inner join?" (A condition on the right table in `WHERE` filters out the null-extended rows; it belongs in `ON`.)
- "What join algorithms exist?" (Nested loop, hash join and merge join; the optimiser picks based on sizes, indexes and sort order.)
- "How do you find rows with no match?" (Left join plus `WHERE right.id IS NULL`, or `NOT EXISTS`.)

#### Follow-up questions
- "When is a nested loop the right choice?" (When one input is small and the other has an index on the join column.)
- "What causes a Cartesian product?" (A missing or incomplete join condition — rows multiply instead of matching.)
- "How many tables can you join before it degrades?" (There is no fixed limit, but the optimiser's search space grows quickly; beyond roughly a dozen, plans become unstable.)

#### Edge cases
- Joining on a nullable column never matches nulls, since `NULL = NULL` is unknown rather than true.
- `USING (id)` merges the columns; `ON a.id = b.id` keeps both.
- Self-joins need aliases and are easy to get wrong with hierarchical data.

#### Common mistakes
- Right-side conditions in `WHERE` for outer joins.
- Forgetting a join condition entirely.
- Joining then aggregating when filtering first would be far cheaper.

#### Comparisons

| | Nested loop | Hash join | Merge join |
|---|---|---|---|
| Best when | One side small + indexed | Large unsorted inputs | Both already sorted |
| Memory | Low | High | Low |
| Complexity | O(n log m) with index | O(n + m) | O(n + m) |

#### Frequently confused with
`ON` versus `WHERE` conditions in outer joins.

#### Important facts to remember
- Conditions on the optional side go in `ON` — in `WHERE` they discard the null-extended rows.
- `LEFT JOIN ... IS NULL` finds non-matches — unmatched rows are exactly the null-extended ones.
- The optimiser picks the algorithm — based on table sizes and statistics.

---

### 5.4 Aggregation

#### Definition
Functions reducing many rows to one value, grouped by `GROUP BY` and filtered after grouping by `HAVING`; window functions aggregate without collapsing rows.

#### Why it exists
Because many questions want totals rather than rows, and computing them in the application means transferring every row just to produce a few numbers. Aggregating at the data sends only the answer.

#### Interview explanation
Separate `WHERE` from `HAVING` clearly, then introduce window functions as the answer to "aggregate and keep the detail rows", which is the question behind most reporting requirements.

#### Syntax
```sql
SELECT customer_id, count(*), sum(total_cents)
FROM orders
WHERE status = 'PAID'
GROUP BY customer_id
HAVING count(*) > 5;

SELECT id, total_cents,
       sum(total_cents) OVER (PARTITION BY customer_id) AS customer_total
FROM orders;
```

#### Example
```sql
-- Top 3 orders per customer, using a window function
SELECT * FROM (
  SELECT o.*, row_number() OVER (PARTITION BY customer_id ORDER BY total_cents DESC) AS rn
  FROM orders o
) ranked
WHERE rn <= 3;
```

#### Common interview questions
- "What is the difference between `WHERE` and `HAVING`?" (`WHERE` filters rows before grouping; `HAVING` filters groups after aggregation.)
- "What is the difference between `count(*)` and `count(column)`?" (`count(*)` counts rows; `count(column)` counts non-null values of that column.)
- "What are window functions for?" (Computing an aggregate alongside each row — running totals, rankings, per-group sums — without collapsing the result.)
- "Which columns can appear in a `SELECT` with `GROUP BY`?" (Grouped columns, aggregates, and — in SQL:1999 and PostgreSQL — columns functionally dependent on a grouped key such as the primary key; anything else is an error.)

#### Follow-up questions
- "Why is `COUNT(DISTINCT x)` slow?" (It must deduplicate, usually via a sort or hash of all values, rather than counting rows.)
- "What does `sum` return for no rows?" (`NULL`, not zero — wrap in `coalesce` when zero is meant.)
- "Can an index help aggregation?" (Yes — an index on the grouping columns can let the engine stream groups without a sort, and a covering index can avoid the table.)

#### Edge cases
- `GROUP BY` on a nullable column groups all nulls together as one group — the one place SQL treats nulls as equal.
- `avg` on integers truncates in some engines and not others — cast explicitly.
- Filtering with `HAVING` on a non-aggregate works but should have been `WHERE` — and is slower wherever the planner does not move it to `WHERE` itself, as PostgreSQL's does.

#### Common mistakes
- Counting in application code.
- `HAVING` for row-level conditions.
- Assuming `sum` of an empty set is 0.

#### Comparisons

| | `GROUP BY` | Window function |
|---|---|---|
| Rows returned | One per group | All rows |
| Detail retained | No | Yes |
| Typical use | Summaries | Rankings, running totals |

#### Complexity
O(n) with hashing or O(n log n) with sorting; `DISTINCT` aggregates cost more.

#### Frequently confused with
`WHERE` versus `HAVING`, and `count(*)` versus `count(column)`.

#### Important facts to remember
- `WHERE` before, `HAVING` after — rows are filtered, then groups.
- Window functions keep the rows — they add an aggregate beside each row instead of collapsing them.
- `sum` of nothing is `NULL` — no values means an unknown total, not zero.

---

### 5.5 Subqueries and CTEs

#### Definition
Queries nested inside other queries — in `WHERE`, in `FROM` as a derived table, or named with `WITH` as a common table expression, optionally recursive.

#### Why it exists
Because real questions are often layered — one answer is the input to the next — and a single flat query for them becomes unreadable. Subqueries and CTEs compute intermediate results the outer query consumes, as named, readable steps.

#### Interview explanation
Distinguish correlated from uncorrelated subqueries and say why it matters for cost, then give the `NOT IN` null trap and `EXISTS` as the safe alternative. Mention recursive CTEs for hierarchies.

#### Syntax
```sql
WITH recent AS (SELECT * FROM orders WHERE created_at > now() - interval '7 days')
SELECT customer_id, count(*) FROM recent GROUP BY customer_id;

SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

#### Example
```sql
-- Recursive CTE: a category tree
WITH RECURSIVE tree AS (
    SELECT id, parent_id, name FROM categories WHERE parent_id IS NULL
    UNION ALL
    SELECT c.id, c.parent_id, c.name
    FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;
```

#### Common interview questions
- "What is a correlated subquery?" (One that references the outer query's row, so it is logically evaluated per row — often rewritten as a join by the optimiser, but not always.)
- "`IN` or `EXISTS`?" (`EXISTS` stops at the first match and handles nulls predictably; `NOT IN` with a null in the subquery returns no rows.)
- "What is a CTE and is it a temporary table?" (A named subquery; whether it is materialised depends on the engine and version — since 12, PostgreSQL inlines a side-effect-free CTE referenced once.)
- "What is a recursive CTE for?" (Hierarchies and graph traversal — category trees, org charts, bill of materials.)

#### Follow-up questions
- "When does a CTE hurt performance?" (When materialisation prevents predicate push-down, so filters are applied after the whole intermediate result is built.)
- "How do you debug a slow CTE chain?" (`EXPLAIN ANALYZE` and look for the step where actual rows explode relative to estimates.)
- "Can a derived table be indexed?" (No — it is computed at runtime; if you need an index, consider a temporary or materialised view.)

#### Edge cases
- Recursive CTEs can loop forever on cyclic data without a depth guard or cycle detection, because each iteration keeps finding rows the cycle leads back to.
- A subquery in `SELECT` executes per output row and is a common hidden cost.
- CTE scoping is per statement, so the same name can mean different things in different queries.

#### Common mistakes
- `NOT IN` over a nullable column.
- Correlated subqueries where a join would do.
- Long CTE chains that hide an expensive step.

#### Comparisons

| | Subquery | CTE | Join |
|---|---|---|---|
| Readability | Lower when nested | High | High |
| Reusable in the query | No | Yes | — |
| Optimiser freedom | Usually full | Engine-dependent | Full |

#### Frequently confused with
CTEs as temporary tables.

#### Important facts to remember
- `EXISTS` over `NOT IN` — one `NULL` in the subquery makes `NOT IN` return nothing.
- Correlated means per-row — the subquery depends on the outer row.
- Recursive CTEs need a termination condition — otherwise cycles never end.

---

### 5.6 Indexes

#### Definition
Auxiliary sorted structures — usually B-trees — that let the engine locate rows without scanning the table, at the cost of write overhead and storage.

#### Why it exists
Because a full scan costs time proportional to table size, which stops being acceptable long before most tables stop growing. A sorted copy of the searched columns lets a lookup jump to the answer in logarithmic time — paid for on every write.

#### Interview explanation
Explain B-tree lookup cost, then the leftmost-prefix rule for composite indexes with a concrete example, and finish with the write cost — that trade is what makes "index everything" wrong.

#### Syntax
```sql
CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);
CREATE UNIQUE INDEX idx_orders_reference ON orders (reference);
CREATE INDEX CONCURRENTLY idx_big ON big_table (col);     -- does not block writes, PostgreSQL
CREATE INDEX idx_open ON orders (created_at) WHERE status = 'OPEN';   -- partial
```

#### Example
```sql
-- Index (customer_id, status) serves:
WHERE customer_id = 1                         -- yes, leftmost prefix
WHERE customer_id = 1 AND status = 'OPEN'     -- yes, both columns
WHERE status = 'OPEN'                         -- not efficiently: status is not leftmost
```

#### Common interview questions
- "How does an index speed up a query?" (It is a sorted structure allowing O(log n) lookup instead of an O(n) scan, and it supports range scans and ordering.)
- "Why does column order matter in a composite index?" (Leftmost-prefix: the index is sorted by the first column, then the second, so a predicate on a later column alone cannot use it efficiently — some engines can skip-scan when the first column has few distinct values.)
- "What does an index cost?" (Storage, plus maintenance on every insert, update and delete touching the indexed columns.)
- "What is a covering index?" (One containing every column the query needs, allowing an index-only scan with no table access.)

#### Follow-up questions
- "What is selectivity?" (The fraction of rows a predicate matches; a highly selective predicate benefits most, and a low-selectivity one may be ignored in favour of a scan.)
- "What is a partial index?" (An index over a subset of rows defined by a `WHERE` clause — small and effective for queries that always include that condition.)
- "Why would the optimiser ignore an index?" (Low selectivity, stale statistics, a type mismatch, or a function wrapping the column.)

#### Edge cases
- An index on a low-cardinality column (a two-value status) is often useless alone, because it narrows the search only to half the table, but valuable as part of a composite.
- On PostgreSQL, adding an index blocks writes to the table unless created `CONCURRENTLY`, because the build needs a stable snapshot of the table.
- Over-indexing degrades write throughput and bloats storage, especially on write-heavy tables.

#### Common mistakes
- One index per column rather than composites matching real queries.
- Never dropping unused indexes.
- Indexing before reading the plan.

#### Comparisons

| | B-tree | Hash | GIN/GiST |
|---|---|---|---|
| Equality | Yes | Yes | Depends |
| Range and ordering | Yes | No | Partial |
| Typical use | Almost everything | Rare | JSON, arrays, full text |

#### Complexity
Lookup O(log n); maintenance O(log n) per index per write.

#### Frequently confused with
Indexes as free speed — writes pay for every one.

#### Important facts to remember
- Leftmost prefix governs composites — the index is sorted by its first column first.
- Covering indexes avoid table access — the answer is already in the index.
- Every index slows writes — each one must be updated on every change.

---

### 5.7 Query Plans

#### Definition
The execution strategy chosen by the optimiser, revealed by `EXPLAIN` and measured by `EXPLAIN ANALYZE`.

#### Why it exists
Because SQL is declarative: the text says what you want, not how, so when a query is slow the plan is the only way to see what the engine actually decided to do.

#### Interview explanation
Describe estimate-versus-actual as the key signal, name the red flags — sequential scans on large selective queries, row estimates off by orders of magnitude — and stress using production-sized data.

#### Syntax
```sql
EXPLAIN SELECT ...;                       -- plan only
EXPLAIN ANALYZE SELECT ...;               -- plan plus actual execution
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;    -- plus I/O detail
ANALYZE orders;                           -- refresh statistics
```

#### Example
```text
Seq Scan on orders  (cost=0.00..21000.00 rows=1 width=64)
  (actual time=0.015..142.880 rows=3 loops=1)
  Filter: (reference = 'ORD-7')
  Rows Removed by Filter: 999997
→ a selective predicate doing a full scan: an index on reference is missing
```

#### Common interview questions
- "How do you diagnose a slow query?" (Run `EXPLAIN ANALYZE` on representative data, compare estimated and actual rows, and look for scans where an index should apply.)
- "What does a sequential scan indicate?" (Either no usable index, a predicate the optimiser cannot use, or a query selective enough that scanning is genuinely cheaper.)
- "Why do estimates matter?" (Plans are chosen from estimates; a large gap means stale or insufficient statistics and usually a bad plan.)
- "Why did a query get slower without a code change?" (Data growth changed the optimal plan, or statistics drifted after bulk changes.)

#### Follow-up questions
- "How are statistics maintained?" (Autovacuum and `ANALYZE` sample the data; bulk loads should be followed by an explicit analyse.)
- "What does `BUFFERS` add?" (Pages read from cache versus disk — the difference between a slow query and a slow disk.)
- "Can you force a plan?" (Core PostgreSQL deliberately offers no hints — the `pg_hint_plan` extension exists — so you influence plans through indexes, statistics and query shape.)

#### Edge cases
- `EXPLAIN ANALYZE` actually executes the query, including writes — wrap data-modifying statements in a transaction you roll back.
- Plans differ between environments because of data size and configuration — the cheapest strategy genuinely depends on how many rows there are.
- The first execution may include cache misses that dominate the timing.

#### Common mistakes
- Explaining on a small development dataset.
- Adding indexes without reading the plan.
- Comparing cost numbers between queries as if they were milliseconds.

#### Comparisons

| | `EXPLAIN` | `EXPLAIN ANALYZE` |
|---|---|---|
| Executes the query | No | Yes |
| Shows actual rows | No | Yes |
| Safe on writes | Yes | Only inside a rollback |

#### Complexity
Planning time grows with the number of joined tables; execution is whatever the plan costs.

#### Frequently confused with
Cost units as time — they are arbitrary planner units.

#### Important facts to remember
- Compare estimated versus actual rows — a large gap means the planner was misinformed.
- `EXPLAIN ANALYZE` executes — including any writes.
- Use realistic data volumes — on tiny tables every plan looks fine.

---

### 5.8 Schema Design

#### Definition
Choosing tables, columns, types and relationships, applying normalisation to store each fact once and denormalising deliberately where measurements justify it.

#### Why it exists
Because a fact stored twice eventually contradicts itself, and because the schema constrains everything built on it and outlives most of the application code. Storing each fact once makes inconsistency structurally impossible.

#### Interview explanation
Define 1NF through 3NF briefly, then be pragmatic: aim for 3NF, denormalise with evidence, and treat historical values (price at purchase) as different facts rather than duplication.

#### Syntax
```sql
CREATE TABLE order_lines (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  unit_price_cents BIGINT NOT NULL,     -- price at purchase, not a duplicate of products.price
  quantity INT NOT NULL CHECK (quantity > 0)
);
```

#### Example
```sql
-- Type choices that matter
created_at TIMESTAMPTZ NOT NULL      -- not TIMESTAMP: time zone is part of the fact
amount_cents BIGINT NOT NULL         -- not FLOAT: money is exact
status TEXT NOT NULL CHECK (status IN ('NEW','PAID','SHIPPED'))   -- not an ordinal int
```

#### Common interview questions
- "What is normalisation and why?" (Organising data so each fact is stored once, removing update anomalies and inconsistency.)
- "What is 3NF?" (Non-key columns depend on the key, the whole key, and nothing but the key.)
- "When would you denormalise?" (When a measured read pattern justifies it and you accept the consistency cost — typically precomputed aggregates or cached display values.)
- "How do you store money and timestamps?" (Integer minor units or `NUMERIC` for money; `TIMESTAMPTZ` in UTC for instants.)

#### Follow-up questions
- "Why store price on the order line?" (It records the price at purchase — a historical fact — not a copy of the product's current price.)
- "How do you model soft deletes?" (A `deleted_at` column plus partial indexes, accepting that every query must filter it — or an archive table, which keeps the main table clean.)
- "How do you handle enums?" (Constrained text or a lookup table; ordinals break when someone reorders the Java enum.)

#### Edge cases
- Over-normalisation produces queries joining six tables for one screen, because every split must be joined back at read time.
- `VARCHAR(n)` length limits are a constraint, not an optimisation, in most modern engines.
- Wide tables with many nullable columns often indicate several entities merged into one.

#### Common mistakes
- `FLOAT` for money.
- `TIMESTAMP` without time zone.
- Enum ordinals in the database.

#### Comparisons

| | Normalised | Denormalised |
|---|---|---|
| Consistency | Structural | Maintained by code |
| Read cost | Joins | Fewer joins |
| Write cost | Lower | Higher (duplicates) |

#### Frequently confused with
Historical values versus redundant duplication.

#### Important facts to remember
- 3NF by default, denormalise with evidence — correctness first, measured speed second.
- Money in minor units — floating point cannot represent most decimal amounts exactly.
- `TIMESTAMPTZ` for instants — a timestamp without a zone is ambiguous.

---

### 5.9 Constraints

#### Definition
Database-enforced rules — `NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `FOREIGN KEY`, `CHECK` — applied to every write regardless of its source.

#### Why it exists
Because the application is not the only writer, and invariants enforced only in code are eventually violated by something else — a script, a migration, another service, or two concurrent requests racing past the same check.

#### Interview explanation
Give the concurrency argument: a check-then-insert in application code races, and only a unique constraint actually prevents the duplicate. Then mention translating the resulting exception into a 409.

#### Syntax
```sql
NOT NULL
UNIQUE (order_id, sku)
PRIMARY KEY (id)
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
CHECK (quantity > 0)
```

#### Example
```java
@ExceptionHandler(DataIntegrityViolationException.class)
ProblemDetail duplicate(DataIntegrityViolationException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Resource already exists");
}
```

#### Common interview questions
- "Why enforce constraints in the database rather than the application?" (Migrations, scripts, other services and manual fixes all write too; only the database sees every write.)
- "Why can't application-level uniqueness checks work?" (Two concurrent requests both check, both find nothing, both insert — only a unique constraint prevents it.)
- "What do referential actions do?" (`CASCADE` deletes children, `RESTRICT` blocks the delete, `SET NULL` orphans them.)
- "How should a constraint violation surface in an API?" (Translated to a 409 with a clear message, not a 500.)

#### Follow-up questions
- "What is a deferrable constraint?" (One checked at commit rather than per statement, which allows temporarily inconsistent intermediate states within a transaction.)
- "Do constraints help the optimiser?" (Yes — a unique constraint tells the planner at most one row matches, which can change the plan.)
- "What is the cost of adding one to a large table?" (Validation scans the whole table and may lock it; PostgreSQL supports adding `NOT VALID` then validating separately.)

#### Edge cases
- `UNIQUE` columns allow multiple nulls in most engines, since nulls are not equal to each other.
- `ON DELETE CASCADE` can remove far more than intended through chained relationships, because each cascade can trigger the next.
- A `CHECK` constraint cannot reference other tables, because it validates one row in isolation; cross-table rules need a foreign key or a trigger.

#### Common mistakes
- Uniqueness enforced only in code.
- Unhandled integrity exceptions becoming 500s.
- Cascades configured without considering the blast radius.

#### Comparisons

| | Application check | Database constraint |
|---|---|---|
| Covers every writer | No | Yes |
| Race-safe | No | Yes |
| Error quality | Good | Needs translation |

#### Frequently confused with
Bean Validation versus database constraints — different layers, both useful.

#### Important facts to remember
- Only the database sees every write — so only it can guarantee a rule.
- Unique constraints are the race-safe answer — check and write become one step.
- Translate violations to 409 — a conflict, not a server fault.

---

### 5.10 Schema Migrations

#### Definition
Versioned, ordered schema changes applied and recorded by a tool such as Flyway or Liquibase, with a lock preventing concurrent application.

#### Why it exists
Because the schema must change alongside the code, identically in every environment, and changes applied by hand drift. Versioned, recorded scripts make every environment converge on the same schema through a reviewed, repeatable process.

#### Interview explanation
Describe the version table and locking, then explain expand-and-contract for zero-downtime changes, and finish on locking behaviour — an `ALTER TABLE` on a large table during a deploy is an outage in waiting.

#### Syntax
```text
V1__create_orders.sql
V2__add_reference_column.sql
V3__backfill_reference.sql
```
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
  jpa:
    hibernate:
      ddl-auto: validate      # never 'update' in production
```

#### Example
```sql
-- Expand: add nullable, write to both, backfill, then make it NOT NULL in a later release
ALTER TABLE orders ADD COLUMN reference TEXT;
-- in its own migration: CONCURRENTLY cannot run inside a transaction
CREATE UNIQUE INDEX CONCURRENTLY idx_orders_reference ON orders (reference);
```

#### Common interview questions
- "Why not use `ddl-auto=update`?" (It cannot express data changes or safe renames, is not reviewable, behaves differently across versions, and will eventually damage production data. Use `validate` with migrations.)
- "How do you rename a column with zero downtime?" (Expand and contract: add the new column and write to both, backfill, switch reads, stop writing the old column, and drop it in a release after that — each step must work alongside the release before it.)
- "How do migration tools prevent concurrent application?" (A lock on the schema-history table, so only one instance applies a given migration.)
- "What is the risk of an `ALTER TABLE` in a deployment?" (Most forms take an `ACCESS EXCLUSIVE` lock that blocks reads and writes for the duration — and while it waits behind a long transaction, every other query queues behind it. On a large or busy table, that is an outage.)

#### Follow-up questions
- "How do you handle rollbacks?" (In practice, roll forward: write a new migration. Down-scripts are rarely tested and often unsafe against real data.)
- "Where do backfills belong?" (In batched background jobs for large tables, not inline in a migration that blocks the deployment.)
- "Flyway or Liquibase?" (Flyway for plain SQL and simplicity; Liquibase for database-agnostic changelogs and richer rollback support.)

#### Edge cases
- On a database without transactional DDL, such as MySQL, a failed migration leaves the history table marked failed and blocks startup until repaired, because the tool cannot know how far the script got. PostgreSQL rolls the whole migration back instead.
- `CREATE INDEX CONCURRENTLY` cannot run inside a transaction, so it needs its own migration — Flyway will not mix it with transactional statements by default.
- Checksums on applied migrations mean editing a committed file breaks every environment that already ran it, because the recorded history no longer matches the file.

#### Common mistakes
- Editing an already-applied migration.
- Long-running data changes inside a deployment migration.
- `ddl-auto=update` in production.

#### Comparisons

| | `ddl-auto=update` | Migration tool |
|---|---|---|
| Reviewable | No | Yes |
| Data changes | No | Yes |
| Deterministic | No | Yes |

#### Frequently confused with
Schema generation versus schema migration.

#### Important facts to remember
- Migrations are versioned and locked — every environment applies the same changes, once.
- Expand and contract for zero downtime — old and new code must both work during a deploy.
- `ddl-auto=validate` in production — Hibernate checks the schema but never changes it.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 5. Next: JPA & Hibernate.*

---

## 6. JPA & Hibernate

### Table of Contents (this group)
- [[#6.1 JPA and Hibernate]]
- [[#6.2 Entities and Mapping]]
- [[#6.3 Identifiers and Generation]]
- [[#6.4 Relationships and Ownership]]
- [[#6.5 The Persistence Context]]
- [[#6.6 Entity Lifecycle States]]
- [[#6.7 Dirty Checking and Flushing]]
- [[#6.8 Lazy and Eager Loading]]
- [[#6.9 The N+1 Problem]]
- [[#6.10 JPQL and Queries]]
- [[#6.11 Hibernate Caching]]

---

### 6.1 JPA and Hibernate

#### Definition
JPA is the Jakarta Persistence specification — annotations, `EntityManager`, JPQL — and Hibernate is its most common implementation; Spring Data JPA generates repositories on top of both.

#### Why it exists
Because objects and rows are different shapes, and converting between them with hand-written JDBC is the same tedious code for every class. A mapping layer does the conversion from declarations — and collects a transaction's changes — while queries stay in the domain's vocabulary.

#### Interview explanation
Name the three layers and who does what, then make the point that earns credit: JPA generates ordinary SQL, and performance problems come from access patterns, not from the framework. Mention logging SQL as the first diagnostic step.

#### Syntax
```java
@Entity class Order { @Id Long id; }
interface OrderRepository extends JpaRepository<Order, Long> { }
entityManager.persist(order);
```

#### Example
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE     # parameter values
```

#### Common interview questions
- "What is the difference between JPA and Hibernate?" (JPA is the specification; Hibernate is an implementation of it. Spring Data JPA is a further layer generating repository implementations.)
- "Why do people say JPA is slow?" (Because of access patterns — N+1 queries, loading whole graphs, chatty transactions — not because the generated SQL is slow.)
- "How do you see what SQL is executed?" (Enable `org.hibernate.SQL` at DEBUG and the bind-parameter logger at TRACE.)
- "When would you not use JPA?" (Reporting and analytics, bulk data processing, or anything where SQL is the natural expression — plain JDBC or jOOQ fit better.)

#### Follow-up questions
- "What does Spring Data add over plain JPA?" (Generated repository implementations, derived queries, paging, projections and auditing.)
- "Can you mix JPA and plain SQL?" (Yes — `JdbcTemplate` or native queries alongside entities, which is common for reporting paths.)
- "What is the impedance mismatch?" (Objects have identity, inheritance and references; tables have keys, rows and foreign keys — JPA bridges the gap, imperfectly.)

#### Edge cases
- Hibernate-specific features used through JPA annotations make switching implementations harder than the specification implies, because the specification covers only the common subset.
- Entities are not DTOs; serialising them directly causes lazy-loading trouble — failures, or hidden extra queries while `open-in-view` is on — because serialisation happens after the transaction has closed.
- Second-level caching and statistics are Hibernate features, not JPA ones.

#### Common mistakes
- Never looking at the generated SQL.
- Using JPA for bulk data pipelines.
- Treating Spring Data repositories as magic.

#### Comparisons

| | JPA / Hibernate | `JdbcTemplate` | jOOQ |
|---|---|---|---|
| Mapping | Automatic | Manual | Generated |
| SQL control | Indirect | Full | Full, type-safe |
| Best for | Domain CRUD | Simple queries, bulk | Complex SQL |

#### Frequently confused with
JPA versus Hibernate versus Spring Data JPA.

#### Important facts to remember
- JPA is a spec, Hibernate an implementation.
- Slowness comes from access patterns — the generated SQL is ordinary; how much of it runs is the problem.
- Always be able to see the SQL — the Java does not show what runs.

---

### 6.2 Entities and Mapping

#### Definition
Classes annotated `@Entity` whose fields map to table columns, with `@Table`, `@Column`, `@Enumerated` and related annotations controlling the mapping.

#### Why it exists
Because automatic conversion requires the framework to know which class maps to which table and which field to which column. Declaring that mapping lets the object model and the schema each follow their own conventions while remaining connected.

#### Interview explanation
Cover the structural requirements JPA imposes — no-arg constructor, non-final class and fields — and the reason behind the non-final class: Hibernate subclasses entities to create lazy proxies. Then raise `EnumType.STRING` as the mapping mistake with permanent consequences.

#### Syntax
```java
@Entity @Table(name = "orders")
public class Order {
    @Id @GeneratedValue private Long id;
    @Column(nullable = false, length = 20) private String reference;
    @Enumerated(EnumType.STRING) private Status status;
    @Transient private BigDecimal computedTotal;      // not persisted
    @Version private long version;
    protected Order() { }
}
```

#### Example
```java
@Embeddable
public record Address(String street, String city, String postcode) { }

@Entity
public class Customer {
    @Embedded private Address address;        // columns inline in the customer table
}
```

#### Common interview questions
- "What does an entity class require?" (`@Entity`, an `@Id`, a no-argument constructor, and a non-final class with non-final persistent fields.)
- "Why must the class not be final?" (Hibernate subclasses it to create lazy proxies.)
- "Why map enums as STRING rather than ORDINAL?" (Ordinal stores the position, so reordering the enum silently changes the meaning of existing rows.)
- "What is `@Embeddable` for?" (A value object whose fields are stored inline in the owning table — an address, a money amount.)

#### Follow-up questions
- "What is `@Transient`?" (A field excluded from persistence — a computed value that lives only in memory.)
- "How are inheritance hierarchies mapped?" (`SINGLE_TABLE` with a discriminator, `JOINED` with a table per class, or `TABLE_PER_CLASS` — each trading normalisation against join cost.)
- "Where should `equals` and `hashCode` come from?" (Business key or id with care — never all fields, and never a mutable key, or collections break after persistence.)

#### Edge cases
- Lombok's `@Data` on entities generates `equals`/`hashCode` over all fields, which breaks with lazy associations — touching them can trigger queries or exceptions — and is a common production bug.
- A field added without a corresponding column fails at startup under `ddl-auto=validate` — which is the point.
- `@Column(updatable = false)` makes a field insert-only, useful for `created_at`.

#### Common mistakes
- `EnumType.ORDINAL` by default.
- Lombok `@Data` on entities.
- Entities exposed as API responses.

#### Comparisons

| Inheritance strategy | Tables | Trade-off |
|---|---|---|
| `SINGLE_TABLE` | One | Fast, but nullable columns |
| `JOINED` | One per class | Normalised, joins on read |
| `TABLE_PER_CLASS` | One per concrete class | No joins, duplicated columns |

#### Frequently confused with
`@Transient` (JPA) versus `transient` (Java serialization).

#### Important facts to remember
- Non-final class, no-arg constructor — Hibernate subclasses entities and builds them reflectively.
- Always `EnumType.STRING` — ordinals change meaning when the enum is reordered.
- `ddl-auto=validate` catches drift — at startup, without touching the schema.

---

### 6.3 Identifiers and Generation

#### Definition
`@Id` marks the primary key and `@GeneratedValue` selects how values are produced — `IDENTITY`, `SEQUENCE`, `TABLE`, `UUID` or `AUTO`.

#### Why it exists
Because the persistence context files every entity under its identity, so it needs the id as soon as an entity is persisted. The generation strategy determines *when* that id becomes known — and that timing determines whether inserts can be batched.

#### Interview explanation
The high-value point is that `IDENTITY` disables JDBC batch inserts, because Hibernate must execute each insert to obtain the id, while `SEQUENCE` with pooling allows batching. That single fact is what separates an answer from a recital.

#### Syntax
```java
@Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;

@Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "g")
@SequenceGenerator(name = "g", sequenceName = "order_seq", allocationSize = 50) Long id;

@Id @GeneratedValue(strategy = GenerationType.UUID) UUID id;
```

#### Example
```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50              # inserts batch only when ids are known first — not with IDENTITY
        order_inserts: true
        order_updates: true
```

#### Common interview questions
- "What generation strategies exist and how do they differ?" (`IDENTITY` uses an auto-increment column; `SEQUENCE` uses a database sequence and supports pooling; `TABLE` emulates a sequence in a table; `UUID` generates in the application.)
- "Why does `IDENTITY` prevent batch inserts?" (The id is assigned by the database on insert, so Hibernate must insert each row immediately to obtain it.)
- "What does `allocationSize` do?" (Reserves a block of sequence values so Hibernate can assign ids without a round trip per row — it must match the sequence's increment.)
- "Are UUID primary keys a good idea?" (They are useful in distributed systems, but random values fragment B-tree indexes and consume more space; time-ordered UUIDs mitigate this.)

#### Follow-up questions
- "What is a natural versus a surrogate key?" (A natural key is business data used as the identifier; a surrogate is a generated value with no meaning. Surrogates are preferred because business values change.)
- "How should `equals` treat a null id?" (Carefully — a transient entity has no id, so id-based equality is undefined before persistence; a business key or identity comparison avoids the trap.)
- "Can you assign ids yourself?" (Yes, with `@Id` and no `@GeneratedValue` — common with UUIDs generated in the application.)

#### Edge cases
- Mismatched `allocationSize` and sequence increment causes duplicate keys — even from a single instance — because the blocks of ids Hibernate hands out overlap; recent Hibernate versions check the increment at startup by default.
- Changing strategy after data exists requires a migration and careful sequence alignment.
- `AUTO` resolves per dialect: a sequence on PostgreSQL, but on MySQL — which has no sequences — Hibernate emulates one with a table, which is slow and contended, so MySQL projects usually choose `IDENTITY` explicitly and give up insert batching.

#### Common mistakes
- Expecting batching with `IDENTITY`.
- Default `allocationSize` against a sequence incrementing by one.
- Random UUID keys on very large, write-heavy tables.

#### Comparisons

| | `IDENTITY` | `SEQUENCE` | `UUID` |
|---|---|---|---|
| Id before insert | No | Yes | Yes |
| Batch inserts | No | Yes | Yes |
| Index locality | Good | Good | Poor (random) |

#### Complexity
`SEQUENCE` with `allocationSize = n` costs one round trip per n inserts; `IDENTITY` costs one insert statement per row.

#### Frequently confused with
`IDENTITY` and `SEQUENCE` as interchangeable.

#### Important facts to remember
- `IDENTITY` blocks batching — the id exists only after each insert.
- Pool sequence values with `allocationSize` — one round trip yields many ids.
- Surrogate keys over natural keys — business values change; ids must not.

---

### 6.4 Relationships and Ownership

#### Definition
Mappings between entities — `@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany` — where one side owns the foreign key and the other declares `mappedBy`.

#### Why it exists
Because the database stores one foreign key while the object model may hold references on both sides, and the two can disagree — so exactly one side must be authoritative for what gets written.

#### Interview explanation
State the rule — the side with the foreign key owns it, and `mappedBy` marks the inverse — then give the failure: adding to the inverse collection without setting the owning reference writes nothing. That is the question interviewers actually ask.

#### Syntax
```java
@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id") private Order order;   // owning
@OneToMany(mappedBy = "order", cascade = ALL, orphanRemoval = true) private List<OrderLine> lines;
@ManyToMany @JoinTable(name = "product_tags",
    joinColumns = @JoinColumn(name = "product_id"),
    inverseJoinColumns = @JoinColumn(name = "tag_id")) private Set<Tag> tags;
```

#### Example
```java
public void addLine(OrderLine line) {
    lines.add(line);
    line.setOrder(this);        // the owning side — without this, the foreign key is never written
}
```

#### Common interview questions
- "What is the owning side of a relationship?" (The side holding the foreign key — in a bidirectional `@ManyToOne`/`@OneToMany` pair, the many side. Hibernate writes based on it alone.)
- "What does `mappedBy` mean?" (This side is the inverse; the named field on the other entity owns the relationship.)
- "Why is my child row not linked to its parent?" (Only the inverse collection was updated; the owning reference was never set, so the foreign key was never written — the row is orphaned, rejected by a `NOT NULL` column, or, without a cascade, never inserted.)
- "What does `orphanRemoval` do?" (Deletes a child removed from the parent's collection — appropriate only when the child cannot exist independently.)

#### Follow-up questions
- "Why avoid `@ManyToMany`?" (The join table almost always gains attributes — quantity, added date — and migrating from `@ManyToMany` later is painful. Model it as an entity from the start.)
- "What are cascade types?" (`PERSIST`, `MERGE`, `REMOVE`, `REFRESH`, `DETACH`, `ALL` — propagating the operation to associated entities.)
- "Why is `@OneToOne` lazy loading unreliable?" (On the non-owning side Hibernate must know whether the row exists, so it may issue a query regardless of the fetch type.)

#### Edge cases
- `CascadeType.REMOVE` on a `@ManyToOne` can delete the parent when a child is removed — rarely intended, because cascades follow the reference in whichever direction it points.
- `List` versus `Set` changes the SQL Hibernate generates for collection updates, because an unordered list without an index column cannot identify which element changed.
- Bidirectional relationships break naive `toString` and `equals` with infinite recursion, because each side prints or compares the other.

#### Common mistakes
- Updating only the inverse side.
- `@ManyToMany` with a join table that later needs columns.
- Cascading remove across a relationship that is not a composition.

#### Comparisons

| | Owning side | Inverse side |
|---|---|---|
| Holds the FK | Yes | No |
| Writes are based on it | Yes | No |
| Declares | `@JoinColumn` | `mappedBy` |

#### Frequently confused with
Which side owns a relationship.

#### Important facts to remember
- The many side owns — it holds the foreign-key column.
- Set both sides in helper methods — the owning side is what gets written; the other keeps memory consistent.
- Prefer an explicit join entity to `@ManyToMany` — join tables tend to grow columns.

---

### 6.5 The Persistence Context

#### Definition
A first-level cache and change tracker — scoped to a transaction, or to the whole request while `open-in-view` is on — that holds one instance per database row and snapshots their loaded state.

#### Why it exists
Because two objects for the same row in one unit of work, changed differently, would make "what should be saved?" unanswerable. One instance per row guarantees identity, avoids repeated reads, and lets changes be collected and written in one batch.

#### Interview explanation
Explain the identity map and the snapshot, then connect to `open-in-view`: Boot's default keeps the context open for the whole request, which makes lazy loading work and hides N+1 problems while holding a connection. Recommending `false` with deliberate fetching is the senior answer.

#### Syntax
```java
entityManager.persist(e); entityManager.merge(e);
entityManager.detach(e);  entityManager.clear();
entityManager.flush();
```
```yaml
spring:
  jpa:
    open-in-view: false
```

#### Example
```java
@Transactional
public void batchProcess(List<Long> ids) {
    for (int i = 0; i < ids.size(); i++) {
        process(repository.findById(ids.get(i)).orElseThrow());
        if (i % 50 == 0) { entityManager.flush(); entityManager.clear(); }   // bound memory
    }
}
```

#### Common interview questions
- "What is the persistence context?" (Hibernate's working set for one unit of work — normally a transaction: a first-level cache guaranteeing one instance per row, plus snapshots for dirty checking.)
- "What is `open-in-view` and should it be enabled?" (It keeps the persistence context open for the whole HTTP request; it should generally be disabled, because it holds a connection from the first query to the end of the request and allows lazy loading during serialisation.)
- "Why does loading the same entity twice issue only one query?" (The second lookup hits the first-level cache and returns the same instance.)
- "How do you keep memory bounded in a batch job?" (Flush and clear the context periodically, or use a stateless session.)

#### Follow-up questions
- "What is the identity guarantee?" (Within one context, two lookups of the same row return the same Java object, so `==` holds.)
- "When is the context closed?" (At transaction commit, or at the end of the request when `open-in-view` is enabled.)
- "What happens to entities afterwards?" (They become detached: changes are no longer tracked and lazy associations throw on access.)

#### Edge cases
- A long-running transaction accumulates every loaded entity, which is a memory leak in disguise, because nothing leaves the context until it closes.
- `clear()` detaches everything, including entities you still intend to modify — their later changes are no longer tracked.
- Two transactions can hold different instances of the same row with different values, because identity is guaranteed only within one context.

#### Common mistakes
- Leaving `open-in-view` enabled without understanding it.
- Loading large result sets inside one transaction.
- Expecting identity to hold across transactions.

#### Comparisons

| | First-level cache | Second-level cache |
|---|---|---|
| Scope | One persistence context (normally a transaction) | Whole application |
| Enabled | Always | Opt-in |
| Invalidation | Not needed | The hard part |

#### Complexity
Dirty checking is proportional to managed entities × fields at every flush.

#### Frequently confused with
The persistence context versus the second-level cache.

#### Important facts to remember
- One instance per row, per persistence context — so `==` works only within one.
- Disable `open-in-view` deliberately — otherwise a connection is held until the request ends.
- Clear the context in batch loops — every loaded entity and its snapshot stay in memory.

---

### 6.6 Entity Lifecycle States

#### Definition
Transient, managed, detached and removed — the four states determining whether Hibernate tracks an object and persists its changes.

#### Why it exists
Because the same Java object behaves differently depending on whether a persistence context is watching it, so "what happens when I change it?" depends on its state. Naming the states makes that behaviour predictable.

#### Interview explanation
Give the four states and the transitions, then the practical consequence: a managed entity needs no `save()`, while a detached one needs `merge` — and `merge` returns the managed instance, which you must use.

#### Syntax
```java
new Order()                 // transient
repository.save(order)      // → managed
// after commit             // → detached
repository.save(detached)   // merge → returns a managed copy
repository.delete(order)    // → removed
```

#### Example
```java
Order managed = repository.save(detachedOrder);   // use the RETURNED instance
managed.setStatus(PAID);                           // tracked
detachedOrder.setStatus(CANCELLED);                // silently lost
```

#### Common interview questions
- "What are the entity lifecycle states?" (Transient, managed, detached and removed.)
- "What is the difference between `persist` and `merge`?" (`persist` makes a transient entity managed and fails on a detached one; `merge` copies state into a managed instance and returns it.)
- "Why did my change not persist?" (The entity was detached — outside a transaction or after the context closed — so nothing tracked it.)
- "Do you need to call `save()` on a managed entity?" (No — dirty checking writes the change at flush.)

#### Follow-up questions
- "What does `save()` do in Spring Data?" (It calls `persist` for a new entity and `merge` for one with an id, which is why the return value matters.)
- "What is a removed entity?" (Scheduled for deletion; the row is deleted at flush, and afterwards the object is no longer managed.)
- "Can a detached entity be reattached?" (Through `merge`, which produces a managed copy — the original stays detached.)

#### Edge cases
- `save()` on an entity with a manually assigned id performs a `merge`, triggering a select first.
- Modifying a detached entity and then merging overwrites concurrent changes unless versioning is in place, because `merge` copies every field of the stale object over the current row.
- Entities loaded in one transaction and modified in another are detached in between.

#### Common mistakes
- Using the argument to `merge` instead of its result.
- Expecting changes outside a transaction to persist.
- Calling `save()` on an already-managed entity — harmless, but a sign that dirty checking is misunderstood.

#### Comparisons

| | `persist` | `merge` |
|---|---|---|
| Input | Transient | Detached or new |
| Returns | void | The managed instance |
| On detached input | Exception | Works |

#### Frequently confused with
`persist` versus `merge` versus Spring Data's `save`.

#### Important facts to remember
- Managed entities save themselves — dirty checking writes them at flush.
- `merge` returns the managed copy — the argument stays detached.
- Detached changes are lost silently — nothing is watching them.

---

### 6.7 Dirty Checking and Flushing

#### Definition
Hibernate compares managed entities against their load-time snapshots and issues the resulting SQL at flush — automatically at commit, before affected queries, or on demand.

#### Why it exists
Because writing an `UPDATE` by hand for each changed field is tedious and error-prone, while the information needed is already available if the original state is remembered. Comparing against a snapshot lets the application simply modify objects while the framework works out which statements are needed and their order.

#### Interview explanation
Explain the snapshot comparison and write-behind batching, then make the memorable point: inside a transaction, changing a managed entity persists the change whether or not you intended it.

#### Syntax
```java
entityManager.flush();
entityManager.setFlushMode(FlushModeType.COMMIT);
```
```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc.batch_size: 50
        order_inserts: true
```

#### Example
```java
@Transactional
public BigDecimal preview(Long id) {
    var order = repository.findById(id).orElseThrow();
    order.setTotalCents(order.getTotalCents() - 100);   // "just for the preview"
    return order.getTotal();                            // persisted at commit anyway
}
```

#### Common interview questions
- "What is dirty checking?" (Hibernate compares each managed entity with its load-time snapshot at flush and writes the differences.)
- "When does a flush happen?" (At transaction commit, before a query whose results could be affected by pending changes, or on an explicit `flush()`.)
- "Do you need to call `save()` to update an entity?" (No — if it is managed, the change is detected and written.)
- "What is write-behind?" (Statements are accumulated and executed at flush, which allows batching and correct ordering.)

#### Follow-up questions
- "How do you enable JDBC batching?" (`hibernate.jdbc.batch_size`, plus `order_inserts`/`order_updates`, and a non-`IDENTITY` id strategy.)
- "What is the cost of dirty checking?" (Proportional to managed entities and their fields at each flush — significant in large batches.)
- "How do you avoid persisting a temporary modification?" (Do not modify managed entities for transient calculations — work on a copy or a projection.)

#### Edge cases
- `FlushModeType.COMMIT` means a query may not see your own uncommitted changes, because nothing is sent to the database until commit.
- Entities modified during flush callbacks can trigger additional flushes.
- Bulk `@Modifying` queries bypass dirty checking entirely and can be overwritten by it: a stale entity still in the context that is modified afterwards is flushed with all its columns, old values included.

#### Common mistakes
- Mutating managed entities for temporary calculations.
- Expecting no SQL because no `save()` was called.
- Batching configured while using `IDENTITY` ids.

#### Comparisons

| | Managed entity | Detached entity |
|---|---|---|
| Change tracked | Yes | No |
| `save()` needed | No | Yes (merge) |
| Risk | Accidental persistence | Lost updates |

#### Complexity
O(entities × fields) per flush.

#### Frequently confused with
Flush versus commit — flush sends SQL, commit ends the transaction.

#### Important facts to remember
- Managed changes are written automatically — no `save()` required, or prevented.
- Flush ≠ commit — flush sends statements; commit makes them permanent.
- Batching needs non-`IDENTITY` ids — ids must be known before the insert.

---

### 6.8 Lazy and Eager Loading

#### Definition
Fetch strategies determining whether an association is loaded with its owner (eager) or on first access (lazy, via a proxy).

#### Why it exists
Because entities form a graph, and loading everything reachable on every query would pull in far more data than any use case needs. Lazy loading defers each association until it is touched — which makes *what to fetch* a decision for each query.

#### Interview explanation
Give the defaults — `@ManyToOne` and `@OneToOne` eager, collections lazy — recommend making everything lazy explicitly, and explain that fetching belongs to the query through join fetches or entity graphs.

#### Syntax
```java
@ManyToOne(fetch = FetchType.LAZY)
@OneToMany(fetch = FetchType.LAZY)
@EntityGraph(attributePaths = {"lines", "customer"})
@Query("select o from Order o join fetch o.lines where o.id = :id")
```

#### Example
```java
// Fetch per use case, not per mapping
@EntityGraph(attributePaths = "lines")
Optional<Order> findWithLinesById(Long id);

Optional<Order> findById(Long id);     // no lines — lighter for the common case
```

#### Common interview questions
- "What are the default fetch types?" (`@ManyToOne` and `@OneToOne` are EAGER; `@OneToMany` and `@ManyToMany` are LAZY.)
- "What causes `LazyInitializationException`?" (Touching a lazy association after the persistence context has closed — typically outside the transaction or during serialisation with `open-in-view=false`.)
- "How do you fix it correctly?" (Fetch the association in the query with a join fetch or entity graph, or map to a DTO inside the transaction — not by switching to EAGER.)
- "Why is EAGER harmful as a default?" (It loads associations for every query, including those that never touch them, and nested eager mappings multiply the data fetched.)

#### Follow-up questions
- "What is a lazy proxy?" (For a to-one association, a generated subclass holding only the id; touching any other property triggers the load. Lazy collections use a Hibernate collection wrapper instead.)
- "How do proxies affect `equals` and `instanceof`?" (The runtime class is the proxy, not the entity, so `getClass()` comparisons fail, and so does `instanceof` against a subtype; compare with `instanceof` on the declared type, or use Hibernate's unproxy helper.)
- "What is `@BatchSize`?" (It loads lazy associations in batches rather than one per entity, turning N+1 into N/batch+1.)

#### Edge cases
- `@OneToOne` on the inverse side cannot be lazily proxied reliably, because Hibernate must know whether the row exists.
- Join fetching two collections at once produces a Cartesian product — and with two `List` collections Hibernate refuses with `MultipleBagFetchException`; use `@BatchSize` or separate queries.
- Before Hibernate 6, `distinct` was needed in JPQL join-fetch queries on collections to avoid duplicated parents; Hibernate 6 (Boot 3) de-duplicates the parent entities itself.

#### Common mistakes
- Changing mappings to EAGER to fix an exception.
- Serialising entities with lazy fields.
- Multiple collection join fetches in one query.

#### Comparisons

| | LAZY | EAGER |
|---|---|---|
| Loaded | On access | With the owner |
| Risk | `LazyInitializationException`, N+1 | Over-fetching everywhere |
| Recommended | Yes, everywhere | Rarely |

#### Complexity
Lazy: one extra query per association access. Eager: a larger query on every load, whether needed or not.

#### Frequently confused with
Fetch type (the mapping default) versus fetch plan (what a query actually fetches).

#### Important facts to remember
- Map lazy, fetch per query — each use case knows what it needs; the mapping cannot.
- `@ManyToOne` defaults to EAGER — override it.
- EAGER does not fix N+1 — it loads the association for every row, used or not.

---

### 6.9 The N+1 Problem

#### Definition
One query loading N entities followed by one query per entity to load an association — N+1 round trips where one or two would suffice.

#### Why it exists
Because lazy loading is transparent: the Java that triggers N extra queries looks like an ordinary field access. Inside a loop, one invisible query per item multiplies with the data while the code never changes.

#### Interview explanation
Describe the pattern, then list the fixes in order of preference: join fetch or entity graph, projections that avoid entities entirely, and `@BatchSize` as a safety net. Mention asserting query counts in tests, which is what prevents regressions.

#### Syntax
```java
@Query("select distinct o from Order o join fetch o.lines where o.status = :s")
@EntityGraph(attributePaths = "lines")
@BatchSize(size = 50)
```

#### Example
```java
// 1 + 50 queries
for (Order o : repository.findTop50ByStatus(OPEN)) { o.getLines().size(); }

// 1 query
for (Order o : repository.findTop50WithLinesByStatus(OPEN)) { o.getLines().size(); }
```

#### Common interview questions
- "What is the N+1 problem?" (A query returning N rows followed by one additional query per row to load a lazy association.)
- "How do you detect it?" (Log SQL and count queries per request; the pattern is one select followed by many identical selects differing only by id.)
- "How do you fix it?" (Join fetch, entity graph, a projection that avoids entities, or `@BatchSize` to batch the lazy loads.)
- "Why not just make the association EAGER?" (It fetches the association for every query in the application, including those that do not need it.)

#### Follow-up questions
- "Why does join fetching two collections cause problems?" (The result is a Cartesian product of both collections per parent — use `@BatchSize` or separate queries instead.)
- "Why does `distinct` appear in join-fetch queries?" (The SQL join repeats each parent once per child row; before Hibernate 6, `distinct` removed the duplicate entities. Hibernate 6 de-duplicates by itself, so in Boot 3 it is redundant but harmless.)
- "How do you prevent regressions?" (Assert the query count in integration tests — Hibernate statistics or a datasource proxy makes this straightforward.)

#### Edge cases
- `open-in-view=true` moves the N+1 into serialisation, where it is invisible in the service code.
- Pagination plus join fetch on a collection requires care: Hibernate may paginate in memory and warn about it, because a SQL `LIMIT` would cut through the middle of a parent's child rows.
- Nested associations can produce N+1 at several levels simultaneously.

#### Common mistakes
- Eager fetching as the fix.
- Not noticing because development data is tiny.
- Join fetching multiple collections in one query.

#### Comparisons

| Fix | Queries | Best when |
|---|---|---|
| Join fetch | 1 | One collection, known use case |
| Entity graph | 1 | Reusable fetch plan |
| `@BatchSize` | N/size + 1 | Many call sites, general safety net |
| Projection | 1 | Read-only views |

#### Complexity
N+1 round trips; with network latency dominating, cost grows linearly with page size.

#### Frequently confused with
N+1 as a lazy-loading flaw rather than a fetch-planning one.

#### Important facts to remember
- A loop touching associations is the signature — one query per iteration.
- Fix with fetch plans, not EAGER — fetch for the query that needs it.
- Assert query counts in tests — the Java never shows the regression.

---

### 6.10 JPQL and Queries

#### Definition
JPQL queries entities rather than tables; the Criteria API builds queries programmatically; native queries pass SQL through; projections return partial data.

#### Why it exists
Because once data is modelled as entities, writing queries in table and column names means repeating the mapping by hand in every query. JPQL expresses queries in the model's terms, while native SQL remains available for what no abstraction offers.

#### Interview explanation
Compare the options and say when each earns its place. The practical point to raise is projections: loading entities to return three fields is the most common avoidable cost in read endpoints.

#### Syntax
```java
@Query("select o from Order o where o.status = :status")
@Query(value = "select * from orders where ...", nativeQuery = true)
@Modifying @Query("update Order o set o.status = :s where o.id = :id")
List<OrderSummary> findByStatus(Status status);     // interface projection
```

#### Example
```java
public interface OrderSummary {          // closed projection: selects only these columns
    Long getId();
    String getReference();
    BigDecimal getTotal();
}

@Query("select o.id as id, o.reference as reference, o.total as total from Order o where o.status = :s")
List<OrderSummary> summaries(Status s);
```

#### Common interview questions
- "What is JPQL?" (A query language over entities and their fields, translated by the provider into SQL.)
- "When would you use a native query?" (Vendor-specific syntax such as full-text search operators, SQL the provider cannot express, or bulk operations where JPQL is insufficient. Hibernate 6's HQL reaches further than standard JPQL — window functions and CTEs included.)
- "What is a projection and why use it?" (A partial view of an entity, so the query selects fewer columns and no entities are managed — the standard fix for heavy list endpoints.)
- "What does `@Modifying` do?" (Marks an update or delete query; it executes directly in the database and bypasses the persistence context, so loaded entities can become stale.)

#### Follow-up questions
- "How do you build queries dynamically?" (Criteria API or Specifications in Spring Data; QueryDSL is a common third-party alternative.)
- "Are JPQL queries safe from injection?" (With bound parameters yes; string concatenation is as dangerous here as in SQL.)
- "What is a constructor expression?" (`select new com.example.Dto(...)` — mapping query results straight into a DTO.)

#### Edge cases
- Native queries returning entities require correct column aliasing or an explicit result-set mapping.
- `@Modifying` without `clearAutomatically` leaves stale managed entities that can overwrite the bulk change: modify one afterwards and dirty checking writes all its columns back.
- Pagination over a join-fetched collection may be performed in memory, which Hibernate warns about.

#### Common mistakes
- Loading full entities for read-only views.
- Concatenating parameters into JPQL.
- Bulk updates in the same transaction as loaded entities.

#### Comparisons

| | Derived | JPQL | Criteria | Native |
|---|---|---|---|---|
| Readability | High (short) | High | Low | Depends |
| Dynamic | No | No | Yes | With care |
| Portable | Yes | Yes | Yes | No |

#### Complexity
Determined by the generated SQL; projections reduce both transfer and persistence-context overhead.

#### Frequently confused with
JPQL versus SQL — JPQL names entities and fields, not tables and columns.

#### Important facts to remember
- Projections for read models — select only what the response needs.
- `@Modifying` bypasses the context — loaded entities become stale.
- Always bind parameters — concatenated JPQL is as injectable as SQL.

---

### 6.11 Hibernate Caching

#### Definition
A mandatory first-level cache per persistence context (normally one transaction), an optional application-wide second-level cache, and an optional query cache built on it.

#### Why it exists
Because the same rows are read repeatedly, within a transaction and across many, and every re-read repeats work whose answer has not changed. Within a transaction that cache is free and safe; across transactions it is a real cache with real staleness risk, so it is opt-in.

#### Interview explanation
Separate the two levels clearly, then be specific about when the second level pays: read-mostly reference data, enabled per entity. Mention external writes as the invalidation blind spot.

#### Syntax
```java
@Entity @Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Country { }
```
```yaml
spring:
  jpa:
    properties:
      hibernate:
        cache:
          use_second_level_cache: true
          region.factory_class: org.hibernate.cache.jcache.JCacheRegionFactory
```

#### Example
```java
// Appropriate: small, read-mostly, rarely written
@Entity @Cacheable @Cache(usage = READ_ONLY) class Currency { }

// Inappropriate: high write rate, invalidation churn exceeds the benefit
@Entity @Cacheable class OrderEvent { }
```

#### Common interview questions
- "What is the difference between first- and second-level caching?" (First level is the persistence context — mandatory, scoped to that context. Second level is optional, shared across transactions, and configured per entity.)
- "When should you enable the second-level cache?" (For read-mostly reference data; it rarely helps write-heavy entities, where invalidation costs more than it saves.)
- "What is the risk?" (Stale data when something outside Hibernate writes — another service, a migration, a SQL script — because those writes do not invalidate entries.)
- "What is the query cache and why is it risky?" (It caches query results and is invalidated by any write to the involved tables, so on write-heavy tables it can be slower than not caching.)

#### Follow-up questions
- "What are the concurrency strategies?" (`READ_ONLY`, `NONSTRICT_READ_WRITE`, `READ_WRITE` and `TRANSACTIONAL` — trading strictness against overhead.)
- "How is it distributed?" (Through a provider such as Hazelcast, Infinispan or Redis via JCache, with invalidation messages between nodes.)
- "Would you use Spring Cache instead?" (Often yes — caching at the service layer is explicit and easier to reason about than entity-level caching.)

#### Edge cases
- Collections need their own cache configuration; caching the entity does not cache its associations.
- A native update run *through* Hibernate is the opposite extreme: it cannot tell which entities raw SQL touched, so it evicts every second-level cache region — unless the affected entities are declared as query spaces.
- A clustered cache adds network latency that can exceed the database lookup it replaces.

#### Common mistakes
- Enabling the second-level cache globally.
- Caching write-heavy entities.
- Assuming external writes invalidate entries.

#### Comparisons

| | First level | Second level | Spring Cache |
|---|---|---|---|
| Scope | Persistence context | Application | Method results |
| Configuration | None | Per entity | Per method |
| Visibility | Implicit | Implicit | Explicit |

#### Complexity
Cache hits avoid a query; misses add lookup overhead; invalidation cost scales with write rate.

#### Frequently confused with
The persistence context being called "a cache" in the same sense as the second level.

#### Important facts to remember
- First level is always on, per persistence context — it *is* the persistence context.
- Second level suits read-mostly data — invalidation costs outweigh hits on busy data.
- External writes do not invalidate it — Hibernate only knows about its own writes.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 6. Next: Transactions & Data Consistency.*

---

## 7. Transactions & Data Consistency

### Table of Contents (this group)
- [[#7.1 ACID and Transactions]]
- [[#7.2 The Transactional Annotation]]
- [[#7.3 Propagation]]
- [[#7.4 Isolation Levels]]
- [[#7.5 Rollback Rules]]
- [[#7.6 Transaction Boundaries]]
- [[#7.7 Optimistic Locking]]
- [[#7.8 Pessimistic Locking]]
- [[#7.9 Connection Pooling]]
- [[#7.10 Distributed Transactions]]

---

### 7.1 ACID and Transactions

#### Definition
A transaction is a unit of work that the database executes with atomicity, consistency, isolation and durability guarantees — all of it takes effect, or none of it does.

#### Why it exists
Because business operations span several rows and statements, and a failure part-way through must not leave the data half-changed — yet a failure can strike between any two statements. Grouping them so they commit together or not at all removes every half-changed state at once.

#### Interview explanation
Define each ACID letter with the failure it prevents, then mention the write-ahead log as the mechanism behind atomicity and durability. Finish by separating what the database guarantees from what the application must still get right.

#### Syntax
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;      -- or ROLLBACK;
```

#### Example
```java
@Transactional
public void transfer(Long from, Long to, long cents) {
    accounts.findById(from).orElseThrow().debit(cents);
    accounts.findById(to).orElseThrow().credit(cents);
}   // commits both, or rolls back both
```

#### Common interview questions
- "What does ACID stand for?" (Atomicity — all or nothing; consistency — constraints hold; isolation — concurrent transactions are kept from interfering, as strictly as the isolation level says; durability — committed data survives a crash.)
- "How does a database guarantee atomicity and durability?" (A write-ahead log records changes before the data pages, so after a crash committed work can be replayed and uncommitted work undone.)
- "Does ACID guarantee my application is correct?" (No — it guarantees the database keeps its promises; a transaction that commits wrong values commits them reliably.)
- "Why not wrap everything in one big transaction?" (It holds locks and a connection for the duration and makes a single failure roll back all prior work.)

#### Follow-up questions
- "What is the C in ACID really about?" (Moving the database between valid states — partly enforced by constraints, partly the application's responsibility.)
- "What is BASE?" (Basically available, soft state, eventually consistent — the property set many distributed stores choose instead of ACID.)
- "Are single statements transactional?" (Yes — in auto-commit mode each statement is its own transaction.)

#### Edge cases
- DDL statements commit implicitly in some engines (MySQL), breaking multi-statement migration transactions, because the engine cannot roll back schema changes.
- A transaction that only reads can still take locks under higher isolation levels, because those levels must keep what was read from changing.
- Durability depends on `fsync` settings; disabling it trades safety for speed.

#### Common mistakes
- Treating transactions as a performance tool.
- Assuming ACID covers business invariants.
- Holding transactions open across user interaction.

#### Comparisons

| | ACID | BASE |
|---|---|---|
| Consistency | Immediate | Eventual |
| Availability under partition | Lower | Higher |
| Typical store | Relational databases | Many distributed NoSQL stores |

#### Frequently confused with
ACID consistency versus CAP consistency — different definitions in different contexts.

#### Important facts to remember
- All or nothing — no half-changed state is ever visible.
- WAL provides atomicity and durability — changes are logged before they are applied.
- Correct values are still your job — ACID commits wrong values just as reliably.

---

### 7.2 The Transactional Annotation

#### Definition
`@Transactional` marks a method whose invocation through Spring's proxy is wrapped in a transaction: begin before, commit after, roll back on a qualifying exception.

#### Why it exists
Because every transactional operation needs the same begin, commit, rollback and close code, and repeating it by hand in every method is error-prone. Writing it once, in a proxy, and requesting it by annotation makes transaction management declarative and consistent.

#### Interview explanation
Explain that the annotation is honoured by a proxy, list the ways it silently fails — self-invocation, and methods the proxy cannot override (`private`, `static`, `final`) — and say what `readOnly` does and does not do. That combination answers most follow-ups before they are asked.

#### Syntax
```java
@Transactional
@Transactional(readOnly = true)
@Transactional(propagation = REQUIRES_NEW, isolation = READ_COMMITTED,
               timeout = 5, rollbackFor = Exception.class)
```

#### Example
```java
@Service
public class InvoiceService {
    @Transactional
    public Invoice issue(Long orderId) {
        var order = orders.findById(orderId).orElseThrow();
        var invoice = Invoice.from(order);
        order.markInvoiced();
        return invoices.save(invoice);      // both changes commit together
    }
}
```

#### Common interview questions
- "How does `@Transactional` work?" (A proxy intercepts the call, obtains a connection, begins a transaction, invokes the method, and commits or rolls back depending on the outcome.)
- "Why does `@Transactional` not work on a method called from the same class?" (The internal call bypasses the proxy, so no interceptor runs.)
- "What does `readOnly = true` do?" (It lets Hibernate skip dirty checking and marks the connection read-only, which can route to a replica. Whether the database then refuses writes depends on the driver — PostgreSQL's does — so treat it as an optimisation, not access control.)
- "Where should the annotation go?" (On service methods that define a business operation — not on controllers, and not on individual repository calls of a multi-step operation.)

#### Follow-up questions
- "Can you put it on a class?" (Yes — it applies to every public method, with method-level annotations overriding it.)
- "What about private methods?" (They are not intercepted; the annotation is ignored.)
- "What does `timeout` do?" (It applies the remaining time as a timeout to the queries the transaction runs, so a slow query — or one issued after the deadline — fails and the transaction rolls back. It does not interrupt Java code running between queries.)

#### Edge cases
- Annotating an interface method works for JDK and CGLIB proxies since Spring 5.0, but not in AspectJ mode, because Java annotations are not inherited from interfaces — annotate the implementation.
- `@Transactional` on a test method rolls back after the test by default — Spring's test support assumes a test should leave no data behind.
- Two transaction managers in one application need `transactionManager = "..."` to choose.

#### Common mistakes
- Self-invocation expecting a transaction.
- `readOnly` relied on to block writes.
- Annotating controllers.

#### Comparisons

| | Declarative (`@Transactional`) | Programmatic (`TransactionTemplate`) |
|---|---|---|
| Boundary | Method | Arbitrary block |
| Visibility | Annotation | Explicit code |
| Self-invocation issue | Yes | No |

#### Frequently confused with
`readOnly` as a security control rather than an optimisation hint.

#### Important facts to remember
- Proxy-based — through another bean only.
- Never on `private`, `static` or `final` methods — the proxy cannot override them; public is the portable choice.
- `readOnly` is an optimisation — whether writes are refused depends on the driver, so never rely on it for safety.

---

### 7.3 Propagation

#### Definition
The rule governing how a transactional method behaves when called within an existing transaction — joining it, suspending it, nesting inside it, or refusing.

#### Why it exists
Because transactional methods call each other, and every such call must answer whether to share the caller's fate or stand alone. Different operations need different answers — an audit record must survive the caller's rollback, a sub-step must not — so the choice is declared per method.

#### Interview explanation
Give `REQUIRED` as the default and `REQUIRES_NEW` as the important alternative, with the audit-log example. Then raise the rollback-only trap, because it is the propagation question interviewers actually use to probe experience.

#### Syntax
```java
@Transactional(propagation = Propagation.REQUIRED)
@Transactional(propagation = Propagation.REQUIRES_NEW)
@Transactional(propagation = Propagation.NESTED)
@Transactional(propagation = Propagation.MANDATORY)
```

#### Example
```java
@Transactional
public void placeOrder(Order order) {
    orders.save(order);
    try {
        audit.record(order);            // REQUIRES_NEW: commits independently
    } catch (AuditException e) {
        log.warn("audit failed", e);    // order still commits
    }
}
```

#### Common interview questions
- "What is the default propagation?" (`REQUIRED` — join an existing transaction or start a new one.)
- "When would you use `REQUIRES_NEW`?" (When work must commit regardless of the caller's outcome — audit records, failure logs, sequence allocation.)
- "What is `UnexpectedRollbackException`?" (Thrown when an outer transaction tries to commit after an inner `REQUIRED` method marked it rollback-only — catching the inner exception did not undo the mark.)
- "What is the difference between `REQUIRES_NEW` and `NESTED`?" (`REQUIRES_NEW` is an independent transaction on a separate connection; `NESTED` is a savepoint in the same transaction, rolled back with the outer one.)

#### Follow-up questions
- "What does `REQUIRES_NEW` cost?" (A second connection while the outer one is suspended — under load this can exhaust the pool and deadlock.)
- "When is `MANDATORY` useful?" (To assert that a method must only be called within an existing transaction, failing fast if misused.)
- "Is `NESTED` always supported?" (No — it needs savepoint support from the driver and the transaction manager. `JpaTransactionManager` disallows it by default, because a savepoint rolls back the SQL but not the entities already changed in the persistence context.)

#### Edge cases
- `REQUIRES_NEW` called through self-invocation does nothing — the proxy is still required.
- Inner `REQUIRES_NEW` transactions that read data written by the outer one cannot see it until the outer commits, because they are separate transactions on separate connections.
- Exceptions thrown by an inner `REQUIRES_NEW` method still propagate to the outer method unless caught.

#### Common mistakes
- Expecting a caught inner exception to save the outer transaction.
- `REQUIRES_NEW` under concurrency with a small pool, deadlocking it.
- Using `NESTED` with JPA.

#### Comparisons

| | `REQUIRED` | `REQUIRES_NEW` | `NESTED` |
|---|---|---|---|
| Connection | Shared | Separate | Shared |
| Independent commit | No | Yes | No |
| Partial rollback | No | Yes | Yes (savepoint) |

#### Frequently confused with
`REQUIRES_NEW` versus `NESTED`.

#### Important facts to remember
- `REQUIRED` is default — join if one exists, start one if not.
- `REQUIRES_NEW` costs a connection — the suspended outer transaction keeps its own.
- Caught inner failures still doom `REQUIRED` — the shared transaction is already marked rollback-only.

---

### 7.4 Isolation Levels

#### Definition
Settings controlling which concurrency anomalies a transaction may observe — read uncommitted, read committed, repeatable read and serializable.

#### Why it exists
Because concurrent transactions can see each other's in-flight work, and full isolation — behaving as if they ran one at a time — costs throughput through waiting and aborts. Levels let each operation pay only for the guarantees it needs.

#### Interview explanation
Define the three anomalies concretely, map them to levels in a table, and mention that engine defaults differ — PostgreSQL `READ_COMMITTED`, MySQL `REPEATABLE_READ`. Add that `SERIALIZABLE` requires retry logic, which shows you have used it.

#### Syntax
```java
@Transactional(isolation = Isolation.READ_COMMITTED)
@Transactional(isolation = Isolation.REPEATABLE_READ)
@Transactional(isolation = Isolation.SERIALIZABLE)
```

#### Example
```java
@Retryable(retryFor = ConcurrencyFailureException.class, maxAttempts = 3)   // serialisation failures arrive as subclasses
@Transactional(isolation = Isolation.SERIALIZABLE)
public void allocateSeat(Long flightId, Long passengerId) { ... }
```

#### Common interview questions
- "What is a dirty read?" (Reading another transaction's uncommitted change, which may later be rolled back.)
- "What is a non-repeatable read versus a phantom?" (Non-repeatable: the same row returns different values on a second read. Phantom: the same query returns different rows because another transaction inserted or deleted matching ones.)
- "What is the default isolation level?" (Spring uses the database's default — `READ_COMMITTED` on PostgreSQL and Oracle, `REPEATABLE_READ` on MySQL InnoDB.)
- "Why not always use `SERIALIZABLE`?" (It reduces concurrency and causes serialisation failures that the application must catch and retry.)

#### Follow-up questions
- "What is snapshot isolation?" (Each transaction reads a consistent snapshot as of its start; PostgreSQL implements `REPEATABLE_READ` this way.)
- "Does `READ_COMMITTED` prevent lost updates?" (No — two transactions can read the same value and both write; optimistic locking or `FOR UPDATE` is needed.)
- "Can you change isolation per transaction?" (Yes, with the `isolation` attribute, if the transaction manager and driver support it.)

#### Edge cases
- Changing isolation inside an already-started transaction is not allowed by most drivers.
- Read replicas may be asynchronously behind, so isolation guarantees do not extend across them — a replica answers from an older moment.
- `SERIALIZABLE` in PostgreSQL uses predicate locks and can abort transactions that never touched the same row.

#### Common mistakes
- Raising isolation to fix lost updates.
- Assuming the same default across databases.
- `SERIALIZABLE` without retry handling.

#### Comparisons

| Level | Dirty | Non-repeatable | Phantom |
|---|---|---|---|
| Read uncommitted | Yes | Yes | Yes |
| Read committed | No | Yes | Yes |
| Repeatable read | No | No | Possible |
| Serializable | No | No | No |

#### Complexity
Higher levels cost more locking or more aborted transactions; the cost grows with contention.

#### Frequently confused with
Isolation levels versus locking — related mechanisms, different abstractions.

#### Important facts to remember
- Know your engine's default — PostgreSQL and MySQL differ.
- `READ_COMMITTED` still allows lost updates — read-modify-write races are not prevented.
- `SERIALIZABLE` needs retries — it aborts transactions rather than allowing anomalies.

---

### 7.5 Rollback Rules

#### Definition
The rules determining which exceptions cause a Spring-managed transaction to roll back — by default unchecked exceptions and errors, but not checked exceptions.

#### Why it exists
Because the framework must decide whether a failure invalidates the work done so far, and the default reflects Java's historical view, inherited from EJB: checked exceptions are expected outcomes the caller handles, so earlier work may still be valid; unchecked exceptions are unexpected failures that must undo everything.

#### Interview explanation
State the default and call it out as surprising, show `rollbackFor` as the fix, and connect to rollback-only marking from propagation. Interviewers use this to check whether you have been bitten by it.

#### Syntax
```java
@Transactional(rollbackFor = Exception.class)
@Transactional(noRollbackFor = BusinessWarningException.class)
TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
```

#### Example
```java
@Transactional(rollbackFor = PaymentException.class)    // checked, but a real failure
public void checkout(Cart cart) throws PaymentException {
    orders.save(Order.from(cart));
    payments.charge(cart.total());     // throws PaymentException → rollback
}
```

#### Common interview questions
- "Which exceptions trigger a rollback by default?" (`RuntimeException` and `Error`; checked exceptions commit.)
- "How do you roll back on a checked exception?" (`@Transactional(rollbackFor = ...)`, often `rollbackFor = Exception.class`.)
- "If I catch an exception inside the method, does the transaction roll back?" (Not unless something marked it rollback-only — the interceptor never sees a caught exception.)
- "How do you force a rollback without throwing?" (`TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`.)

#### Follow-up questions
- "Why is the default this way?" (It mirrors EJB's convention that checked exceptions are application outcomes, not system failures — a convention most teams now disagree with.)
- "What happens if the commit itself fails?" (An exception is thrown from the proxy after the method returned — the caller sees a failure even though the method body completed.)
- "Can you set the rule globally?" (Since Spring Framework 6.2, `@EnableTransactionManagement(rollbackOn = ALL_EXCEPTIONS)` rolls back on every exception. Before that, a custom annotation meta-annotated with `@Transactional(rollbackFor = Exception.class)`, used project-wide.)

#### Edge cases
- `noRollbackFor` on an inner `REQUIRED` method does not stop an outer method's own rollback rule from applying.
- Kotlin does not enforce checked exceptions, so a Kotlin method can throw a checked exception type without anyone noticing — and Spring still commits on it. Spring's documentation recommends `rollbackOn = ALL_EXCEPTIONS` for Kotlin applications.
- Exceptions thrown from `@TransactionalEventListener(AFTER_COMMIT)` cannot roll back the already-committed transaction.

#### Common mistakes
- Expecting checked exceptions to roll back.
- Catching and swallowing inside the transaction.
- Not handling `UnexpectedRollbackException`.

#### Comparisons

| Exception type | Default outcome |
|---|---|
| `RuntimeException` | Rollback |
| `Error` | Rollback |
| Checked `Exception` | **Commit** |

#### Frequently confused with
"Any exception rolls back" — only unchecked ones do by default.

#### Important facts to remember
- Checked exceptions commit by default — they are treated as planned outcomes.
- `rollbackFor` to change it.
- Caught exceptions do not roll back — the interceptor never sees them, unless they already crossed a transactional proxy and marked the transaction rollback-only.

---

### 7.6 Transaction Boundaries

#### Definition
The start and end of a transaction — in Spring, the entry and exit of the `@Transactional` method — determining atomicity, lock duration and connection hold time.

#### Why it exists
Because a transaction holds a connection and its locks from begin to commit, so its width trades correctness against concurrency — wider means more atomic and more waiting — and that choice has to be made deliberately per operation.

#### Interview explanation
Argue for narrow boundaries: load, decide, write, commit. Then give the concrete failure of a wide one — a remote call inside the transaction holding a pooled connection for its full duration — because it is the most common production consequence.

#### Syntax
```java
@Transactional public Order persist(...) { }     // narrow: only the database work
public Order place(...) {                         // orchestrates; not transactional
    var quote = pricing.quote(...);               // remote, outside
    return self.persist(...);                     // short transaction via the proxy
}
```

#### Example
```java
// Batch job: one transaction per chunk, not one for the whole run
public void reprice(List<Long> ids) {
    Lists.partition(ids, 500).forEach(chunk -> tx.executeWithoutResult(s -> repriceChunk(chunk)));
}
```

#### Common interview questions
- "Where should transaction boundaries be?" (Around the business operation in the service layer, as narrow as atomicity allows.)
- "Why keep remote calls out of transactions?" (They hold a database connection and locks for the duration of a network call, exhausting the pool under load.)
- "How do you handle large batch jobs?" (Commit in chunks, so failures roll back one chunk and locks are released regularly.)
- "What is `TransactionTemplate` for?" (Programmatic boundaries around a block of code — useful when a method needs several transactions or when self-invocation would defeat the proxy.)

#### Follow-up questions
- "How do you keep side effects consistent with the commit?" (Publish them after commit with `@TransactionalEventListener(AFTER_COMMIT)` or the outbox pattern.)
- "What about `open-in-view`?" (It extends the persistence context, not the transaction, but still holds a connection from its first query to the end of the request — disable it.)
- "How long is too long for a transaction?" (Anything that includes waiting on something other than the database; in absolute terms, seconds rather than milliseconds is a warning sign.)

#### Edge cases
- Splitting a transaction gains throughput but loses atomicity — intermediate states become visible.
- A chunked batch must be restartable, since a failure leaves earlier chunks committed.
- Read-only transactions still hold a connection, so their duration matters too.

#### Common mistakes
- Remote calls inside transactions.
- One transaction around an entire batch.
- Transactions spanning user think time.

#### Comparisons

| | Narrow transaction | Wide transaction |
|---|---|---|
| Lock duration | Short | Long |
| Atomicity | Smaller unit | Larger unit |
| Pool pressure | Low | High |

#### Frequently confused with
Persistence context scope versus transaction scope.

#### Important facts to remember
- Compute first, persist second — hold the connection only for database work.
- No remote calls inside — they hold a connection while waiting.
- Chunk batches — bounded rollback, bounded lock time.

---

### 7.7 Optimistic Locking

#### Definition
Concurrency control using a `@Version` column: updates include the expected version in the `WHERE` clause and fail if another transaction changed the row first.

#### Why it exists
Because two concurrent edits of the same row otherwise end with the second silently overwriting the first, and holding a lock between reading and writing is impossible when that gap spans HTTP requests. A version number lets the write detect the conflict instead.

#### Interview explanation
Describe the versioned update and the zero-rows-affected detection, then say how you handle the exception — retry for mechanical operations, 409 for human edits. Handling is what interviewers want to hear, not just the annotation.

#### Syntax
```java
@Version private long version;
catch (ObjectOptimisticLockingFailureException e) { ... }
```

#### Example
```java
@Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3)
@Transactional
public void incrementViews(Long articleId) {
    articles.findById(articleId).orElseThrow().incrementViews();
}
```

#### Common interview questions
- "What is optimistic locking?" (Detecting concurrent modification at write time using a version column, rather than locking at read time.)
- "How does Hibernate implement it?" (It adds `AND version = ?` to the update and increments the version; zero affected rows raises `OptimisticLockException`.)
- "What is a lost update?" (Two transactions read the same value and both write, so one overwrites the other's change without knowing it existed.)
- "How should the API respond to a conflict?" (409 Conflict, so the client can reload and reapply — or the server retries if the operation is mechanical.)

#### Follow-up questions
- "When is optimistic locking a poor choice?" (Under high contention on the same row, where repeated conflicts and retries waste more work than queueing.)
- "Can you use a timestamp instead of a number?" (Yes, but timestamps can collide within clock resolution; an integer is safer.)
- "How do you carry the version across requests?" (Return it in the response — or as an ETag — and require it on the update, so the check spans the user's edit.)

#### Edge cases
- Bulk `@Modifying` updates do not increment `@Version` unless written to, because they bypass the entity layer where versioning happens.
- Detached entities merged without their original version silently disable the check, because the comparison uses whatever version the object carries.
- Version increments on collection changes depend on mapping and can surprise.

#### Common mistakes
- Adding `@Version` without handling the exception.
- Losing the version between read and update in a stateless API.
- Using it on extremely hot rows.

#### Comparisons

| | Optimistic | Pessimistic |
|---|---|---|
| Lock held | None | Until commit |
| Conflict | Detected at write | Prevented at read |
| Best for | Low contention, long gaps | High contention, short transactions |

#### Frequently confused with
Optimistic locking as prevention rather than detection.

#### Important facts to remember
- `@Version` detects, does not prevent — the conflict still happens; you learn about it.
- Handle the exception — retry or 409.
- Carry the version through the API — otherwise the server compares against a fresh read.

---

### 7.8 Pessimistic Locking

#### Definition
Acquiring a database row lock at read time — typically `SELECT ... FOR UPDATE` — so other writers block until the transaction ends.

#### Why it exists
Because on a heavily contended row, detecting conflicts afterwards means most transactions fail and retry repeatedly. Locking the row on read makes the others wait their turn instead — cheaper and fairer when collisions are the norm.

#### Interview explanation
Show `@Lock(PESSIMISTIC_WRITE)` and explain the two operational requirements: a lock timeout, and consistent lock ordering to avoid deadlocks. Then contrast with optimistic locking by contention level.

#### Syntax
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))   // honoured where the dialect supports it
Optional<Stock> findBySku(String sku);
```

#### Example
```java
@Transactional
public void transfer(Long a, Long b, long cents) {
    var first = accounts.lockById(Math.min(a, b));      // consistent ordering prevents deadlock
    var second = accounts.lockById(Math.max(a, b));
    ...
}
```

#### Common interview questions
- "What is pessimistic locking?" (Locking a row when it is read so no other transaction can modify it until commit.)
- "When would you choose it over optimistic locking?" (When contention on a row is high and conflicts would cause many retries — stock levels, seat allocation, counters.)
- "What is a deadlock and how do you avoid it?" (Two transactions each waiting for a lock the other holds; avoid it by acquiring locks in a consistent order and using timeouts.)
- "What happens without a lock timeout?" (A blocked transaction waits indefinitely, holding its own connection and locks, which can cascade into pool exhaustion.)

#### Follow-up questions
- "What is `SKIP LOCKED`?" (A clause that skips already-locked rows — ideal for work queues where several workers take the next available item.)
- "What is the difference between `PESSIMISTIC_READ` and `PESSIMISTIC_WRITE`?" (Read takes a shared lock allowing other readers; write takes an exclusive lock.)
- "Does the database detect deadlocks?" (Yes — it aborts one transaction, which the application must be ready to retry.)

#### Edge cases
- Locks are released only at commit or rollback, so long transactions extend them.
- `FOR UPDATE` on a join can lock rows in several tables — every row the join touched.
- Some engines escalate row locks to page or table locks under pressure.

#### Common mistakes
- No lock timeout.
- Remote calls while holding a lock.
- Inconsistent lock ordering.

#### Comparisons

| | `PESSIMISTIC_READ` | `PESSIMISTIC_WRITE` |
|---|---|---|
| Lock type | Shared | Exclusive |
| Other readers | Allowed | Blocked if locking |
| Other writers | Blocked | Blocked |

#### Complexity
Throughput on the locked row becomes serial; total wait grows with contention.

#### Frequently confused with
Pessimistic locking versus serializable isolation.

#### Important facts to remember
- Always set a lock timeout — otherwise a blocked transaction waits forever, holding its own resources.
- Lock in a consistent order — opposite orders deadlock.
- `SKIP LOCKED` for queues — workers take different rows instead of waiting for the same one.

---

### 7.9 Connection Pooling

#### Definition
Maintaining a bounded set of open database connections — HikariCP in Spring Boot — lent to threads for the duration of their work.

#### Why it exists
Because opening a connection is expensive, and an unbounded number of connections would overwhelm the database — so connections are opened once and reused, and the pool's size doubles as a cap on how much load one instance can put on the database.

#### Interview explanation
Explain borrow-and-return, then sizing: small pools are usually right, and pool size times instance count must stay below the database's limit. Diagnose "connection timeout" as long-held transactions rather than a slow database — that is the experienced answer.

#### Syntax
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      connection-timeout: 3000
      max-lifetime: 1800000
      leak-detection-threshold: 20000
```

#### Example
```text
4 instances × pool 20 = 80 connections
PostgreSQL max_connections = 100
→ scaling to 6 instances (120) exhausts the database for every service
```

#### Common interview questions
- "Why use a connection pool?" (Creating connections is expensive; a pool reuses them and bounds concurrency against the database.)
- "How do you size the pool?" (Small — often 10–20 per instance — and constrained so that pool size times instances stays below the database's connection limit.)
- "What does a 'connection is not available' timeout usually mean?" (Connections are held too long — typically transactions open across slow work — not that the database is slow.)
- "What is HikariCP's leak detection?" (A warning, with a stack trace, when a connection is held longer than a threshold — the fastest way to find the code holding it.)

#### Follow-up questions
- "Why does a bigger pool sometimes make things slower?" (More concurrent queries contend for the database's CPU, I/O and locks; past its capacity, throughput falls.)
- "What is `max-lifetime` for?" (Retiring connections before a network device or the database closes them silently, avoiding errors on stale connections.)
- "How does PgBouncer change this?" (It pools at the database side, letting many application connections share fewer server connections.)

#### Edge cases
- `REQUIRES_NEW` needs a second connection while the first is held, so nested usage can deadlock a small pool.
- Autoscaling multiplies total connections, which can exceed the database limit suddenly.
- Transaction-mode external poolers break session-level features — session advisory locks, `SET` parameters, and (before PgBouncer 1.21) prepared statements — because consecutive transactions may run on different server connections.

#### Common mistakes
- Raising the pool size to fix timeouts.
- Ignoring instance count when sizing.
- No `connection-timeout`, so requests queue indefinitely.

#### Comparisons

| | Small pool | Large pool |
|---|---|---|
| Database contention | Low | High |
| Application queueing | More | Less |
| Overall throughput | Often higher | Often lower past capacity |

#### Complexity
Concurrent database work is capped at the pool size; waiting time grows when hold time per request rises.

#### Frequently confused with
Thread pool versus connection pool — two separate limits, both binding.

#### Important facts to remember
- Small pools, sized against the database — past its capacity, more connections only add contention.
- Timeouts mean long hold times — usually transactions, not slow queries.
- Pool × instances < `max_connections` — including at maximum scale.

---

### 7.10 Distributed Transactions

#### Definition
Transactions spanning several resources — databases, brokers — either coordinated with two-phase commit, or avoided through the outbox pattern and sagas.

#### Why it exists
Because business operations increasingly span systems, and a local transaction cannot make writes to two systems atomic — one can succeed while the other fails. The choice is between coordinating the systems (two-phase commit) and designing so that only one local transaction needs to be atomic (outbox, sagas).

#### Interview explanation
Explain why 2PC is avoided — blocking, coordinator failure, poor availability — then present the outbox pattern for "database write plus event" and sagas with compensations for multi-service workflows. The dual-write problem is the question underneath most of these interviews.

#### Syntax
```sql
CREATE TABLE outbox (
  id BIGSERIAL PRIMARY KEY,
  aggregate_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
```

#### Example
```java
@Transactional
public void place(Order order) {
    orders.save(order);
    outbox.save(new OutboxEvent(order.getId(), "OrderPlaced", toJson(order)));  // same tx
}
// A relay (polling or CDC with Debezium) publishes unpublished rows to Kafka.
```

#### Common interview questions
- "What is the dual-write problem?" (Writing to a database and publishing to a broker are two operations that cannot be made atomic together, so one can succeed while the other fails.)
- "How does the outbox pattern solve it?" (The event is written to an outbox table in the same database transaction; a separate relay publishes it afterwards, giving at-least-once delivery.)
- "What is a saga?" (A sequence of local transactions across services, each with a compensating action executed if a later step fails.)
- "Why avoid two-phase commit?" (It blocks participants during the commit window, depends on a coordinator that can fail, and reduces availability.)

#### Follow-up questions
- "What must consumers do with at-least-once delivery?" (Be idempotent — processing the same event twice must have the same effect as once, usually via a processed-event table or natural keys.)
- "Orchestration or choreography for sagas?" (Orchestration has a central coordinator and is easier to follow; choreography uses events between services and is more decoupled but harder to trace.)
- "What is change data capture?" (Reading the database's transaction log — Debezium does this — to publish outbox rows without polling.)

#### Edge cases
- Outbox relays must preserve ordering per aggregate if consumers depend on it, because a relay that publishes in parallel can reorder events.
- Compensations can fail too and need their own retry and alerting.
- Events published from a transaction that later rolls back are a bug the outbox prevents and direct publishing creates.

#### Common mistakes
- Publishing to Kafka inside `@Transactional` and assuming atomicity.
- Non-idempotent consumers.
- Sagas without designed compensations.

#### Comparisons

| | 2PC | Outbox | Saga |
|---|---|---|---|
| Consistency | Atomic | Eventual | Eventual |
| Coordinator | Required | None | Optional (orchestrator) |
| Failure handling | Blocking recovery | Retry publish | Compensations |

#### Frequently confused with
Sagas as distributed rollback — they are forward compensations, not undo.

#### Important facts to remember
- DB + broker writes are not atomic — no transaction spans both.
- Outbox gives at-least-once — the relay retries until the publish succeeds.
- Consumers must be idempotent — retries mean duplicates.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 7. Next: Spring Security & JWT.*

---

## 8. Spring Security & JWT

### Table of Contents (this group)
- [[#8.1 Authentication and Authorisation]]
- [[#8.2 The Security Filter Chain]]
- [[#8.3 Configuring HttpSecurity]]
- [[#8.4 Password Hashing]]
- [[#8.5 Users and Authentication Providers]]
- [[#8.6 Stateless Authentication]]
- [[#8.7 JSON Web Tokens]]
- [[#8.8 Role-Based Access Control]]
- [[#8.9 Method Security]]
- [[#8.10 OAuth2 and Resource Servers]]
- [[#8.11 CORS and CSRF]]

---

### 8.1 Authentication and Authorisation

#### Definition
Authentication verifies identity; authorisation decides whether that identity may perform an action. Spring stores the authenticated identity in a thread-bound `SecurityContext`.

#### Why it exists
Because proving who someone is and deciding what they may do are different problems with different failure responses — an unknown caller should be asked to authenticate (401), a known one refused (403) — and keeping them separate lets each change independently.

#### Interview explanation
Define both, map them to 401 and 403, and mention the `SecurityContext` and its thread-local storage — then the consequence for `@Async` and thread pools, which is where people get caught.

#### Syntax
```java
SecurityContextHolder.getContext().getAuthentication();
@AuthenticationPrincipal Jwt jwt
@AuthenticationPrincipal UserDetails user
```

#### Example
```java
@Bean
TaskDecorator securityContextPropagation() {
    return runnable -> {
        var context = SecurityContextHolder.getContext();
        return () -> {
            SecurityContextHolder.setContext(context);
            try { runnable.run(); } finally { SecurityContextHolder.clearContext(); }
        };
    };
}
```

#### Common interview questions
- "What is the difference between authentication and authorisation?" (Authentication establishes identity; authorisation decides permissions for that identity.)
- "When do you return 401 versus 403?" (401 when the request is not authenticated; 403 when it is authenticated but not permitted.)
- "Where does Spring keep the current user?" (In the `SecurityContext`, held by `SecurityContextHolder` in a `ThreadLocal` by default.)
- "Why is the user null in my `@Async` method?" (The context is thread-local and is not propagated to the executor's thread unless you configure it.)

#### Follow-up questions
- "How do you propagate the context to other threads?" (`DelegatingSecurityContextExecutor`, a `TaskDecorator`, or the `MODE_INHERITABLETHREADLOCAL` strategy for child threads.)
- "What is a principal?" (The identity of the authenticated party — a username, user object or token subject.)
- "How does this work in WebFlux?" (The context lives in the reactive `Context`, not a `ThreadLocal`, accessed via `ReactiveSecurityContextHolder`.)

#### Edge cases
- `MODE_INHERITABLETHREADLOCAL` leaks contexts into pooled threads that outlive the request, because a pooled thread keeps the context of whichever request created it.
- Anonymous users still have an `Authentication` — an `AnonymousAuthenticationToken` — so null checks are not sufficient.
- Clearing the context after the request is essential when threads are reused.

#### Common mistakes
- Confusing 401 and 403.
- Expecting the context in async code.
- Treating an anonymous token as "not logged in" by null check.

#### Comparisons

| | Authentication | Authorisation |
|---|---|---|
| Question | Who are you? | What may you do? |
| Failure status | 401 | 403 |
| Spring artefact | `Authentication` | Authorities and rules |

#### Frequently confused with
HTTP 401's name ("Unauthorized") versus its meaning (unauthenticated).

#### Important facts to remember
- 401 identity, 403 permission — "who are you?" versus "no".
- Context is thread-local — visible only on the request's thread.
- Propagate it explicitly for async work — other threads start with an empty context.

---

### 8.2 The Security Filter Chain

#### Definition
A chain of servlet filters, selected per request by `FilterChainProxy`, that performs authentication, authorisation and exception translation before the request reaches the dispatcher.

#### Why it exists
Because relying on each controller to check credentials means one forgotten check is an open endpoint that looks like a correct one. Running security as filters, before any controller, enforces it uniformly at the edge.

#### Interview explanation
Walk the path — `DelegatingFilterProxy`, `FilterChainProxy`, the selected `SecurityFilterChain`, its ordered filters — and name `ExceptionTranslationFilter` as the place 401s and 403s are produced. Mention multiple chains with `securityMatcher`.

#### Syntax
```java
@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http.securityMatcher("/api/**") /* ... */ .build();
}

@Bean @Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    return http.formLogin(Customizer.withDefaults()) /* ... */ .build();
}
```

#### Example
```java
http.exceptionHandling(e -> e
    .authenticationEntryPoint((req, res, ex) -> writeProblem(res, 401, "Authentication required"))
    .accessDeniedHandler((req, res, ex) -> writeProblem(res, 403, "Forbidden")));
```

#### Common interview questions
- "How does Spring Security intercept requests?" (A `DelegatingFilterProxy` delegates to `FilterChainProxy`, which runs the filters of the first matching `SecurityFilterChain` before the dispatcher.)
- "Where are 401 and 403 responses produced?" (`ExceptionTranslationFilter` converts authentication failures through the entry point and access denials through the access-denied handler.)
- "Can you have several security configurations?" (Yes — several `SecurityFilterChain` beans with `securityMatcher` and `@Order`; the first matching chain handles the request.)
- "How do you add a custom filter?" (`http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)` or `addFilterAfter`, positioned relative to a known filter.)

#### Follow-up questions
- "Why does `@ControllerAdvice` not catch security exceptions?" (They are thrown in filters, before the dispatcher, so MVC exception handling never sees them.)
- "How do you debug which filter rejected a request?" (Enable TRACE logging for `org.springframework.security`.)
- "What does `web.ignoring()` do and why avoid it?" (It bypasses the security chain entirely, including header protections; `permitAll()` is preferred.)

#### Edge cases
- A filter registered as a `@Component` is also added to the servlet container's main chain, running twice — or outside security entirely — because Boot registers every `Filter` bean with the container automatically.
- Static resources served through the chain incur security overhead unless deliberately excluded.
- Async dispatches re-enter the chain, which matters for custom filters.

#### Common mistakes
- Custom security filters annotated `@Component`, running twice.
- Expecting `@ControllerAdvice` to format 401s.
- Overlapping chains without explicit order.

#### Comparisons

| | `permitAll()` | `web.ignoring()` |
|---|---|---|
| Passes through the chain | Yes | No |
| Security headers applied | Yes | No |
| Recommended | Yes | Only for static assets, rarely |

#### Frequently confused with
Security filters versus MVC interceptors.

#### Important facts to remember
- First matching chain wins — later chains never see that request.
- `ExceptionTranslationFilter` makes 401/403.
- Advice cannot catch filter exceptions — filters run before the dispatcher.

---

### 8.3 Configuring HttpSecurity

#### Definition
Declaring `SecurityFilterChain` beans built from `HttpSecurity`'s lambda DSL, with `authorizeHttpRequests` rules evaluated in order.

#### Why it exists
Because rules scattered across controllers cannot be reviewed as a whole, and a forgotten rule must not mean an open endpoint. One ordered list in code, ending in a deny-by-default rule, makes the whole access policy readable and safe by default.

#### Interview explanation
Show the modern DSL, state that `WebSecurityConfigurerAdapter` and `antMatchers` are gone in Spring Security 6, and stress first-match ordering plus deny-by-default — the two properties that prevent accidental exposure.

#### Syntax
```java
http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/actuator/health").permitAll()
        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
        .anyRequest().authenticated())
    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
    .csrf(c -> c.disable());
```

#### Example
```java
// Wrong order: the broad rule shadows the specific one
.requestMatchers("/api/**").authenticated()
.requestMatchers("/api/admin/**").hasRole("ADMIN")     // never reached

// Right order
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/**").authenticated()
```

#### Common interview questions
- "How do you configure Spring Security 6?" (Declare a `SecurityFilterChain` bean and configure `HttpSecurity` with the lambda DSL.)
- "What replaced `WebSecurityConfigurerAdapter`?" (Component-based configuration — `SecurityFilterChain` beans — after deprecation in 5.7 and removal in 6.)
- "How are URL rules evaluated?" (Top to bottom; the first matching rule decides, so specific rules must precede general ones.)
- "Why end with `anyRequest().authenticated()`?" (Deny by default — any endpoint not explicitly opened requires authentication.)

#### Follow-up questions
- "What replaced `antMatchers`?" (`requestMatchers`, which picks a matcher consistent with Spring MVC's own path matching.)
- "How do you secure Actuator?" (A dedicated chain or rules for `/actuator/**`, exposing health publicly and everything else to an admin role or the internal network only.)
- "How do you test the configuration?" (`@WebMvcTest` with `MockMvc`, `@WithMockUser` or JWT post-processors, asserting 401/403/200 per endpoint and role.)

#### Edge cases
- Path matching differences mean `/api/admin` and `/api/admin/` may be treated differently.
- A missing `HttpMethod` in a matcher applies the rule to every method.
- Disabling CSRF in a chain that also uses session cookies opens a real vulnerability, because browsers attach those cookies to forged requests.

#### Common mistakes
- Broad rules above specific ones.
- `permitAll()` as the final rule.
- Copying `WebSecurityConfigurerAdapter` code from old tutorials.

#### Comparisons

| | Allow by default | Deny by default |
|---|---|---|
| Forgotten rule exposes | Endpoint | Nothing |
| Effort for public endpoints | None | Explicit `permitAll()` |
| Recommended | No | Yes |

#### Frequently confused with
`securityMatcher` (which chain) versus `requestMatchers` (which rule within the chain).

#### Important facts to remember
- `SecurityFilterChain` beans, lambda DSL.
- First match wins — so specific rules go first.
- Deny by default — a forgotten endpoint stays closed.

---

### 8.4 Password Hashing

#### Definition
Storing passwords as salted, deliberately slow one-way hashes produced by a `PasswordEncoder` such as BCrypt or Argon2.

#### Why it exists
Because databases leak, and a stored password leaks with them — including everywhere the user reused it. A salted, deliberately slow one-way hash means a leaked database does not reveal passwords, and brute-forcing the hashes is computationally impractical.

#### Interview explanation
Explain salt (defeats precomputed tables and identical-password correlation) and work factor (makes each guess expensive). Name BCrypt as Spring's default, Argon2id as the current recommendation, and say plainly that fast hashes like SHA-256 are wrong for passwords.

#### Syntax
```java
PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
String hash = encoder.encode(rawPassword);            // "{bcrypt}$2a$10$..."
boolean ok = encoder.matches(rawPassword, hash);
new BCryptPasswordEncoder(12);                         // explicit cost
```

#### Example
```java
// Upgrade hashes transparently on successful login
if (encoder.upgradeEncoding(user.getPasswordHash())) {
    user.setPasswordHash(encoder.encode(rawPassword));
}
```

#### Common interview questions
- "How should passwords be stored?" (As salted, slow, adaptive hashes — BCrypt, Argon2id, SCrypt or PBKDF2 — never encrypted and never with a fast hash.)
- "Why not SHA-256?" (It is designed to be fast; GPUs compute billions per second, making brute force feasible.)
- "What does the salt do?" (Makes each hash unique even for identical passwords, defeating rainbow tables and cross-account correlation.)
- "What is the `{bcrypt}` prefix?" (The `DelegatingPasswordEncoder`'s algorithm identifier, which allows upgrading algorithms without invalidating existing hashes.)

#### Follow-up questions
- "How do you choose a BCrypt cost?" (High enough that one hash takes a noticeable fraction of a second on your hardware — commonly 10–12 — and revisited as hardware improves.)
- "Why not encrypt passwords?" (Encryption is reversible; anyone obtaining the key recovers every password.)
- "What is a pepper?" (A secret added to passwords before hashing, stored outside the database — defence in depth if only the database leaks.)

#### Edge cases
- BCrypt uses only the first 72 bytes of input, so longer passphrases were silently truncated; recent Spring Security versions reject them instead (CVE-2025-22228).
- A high work factor makes the login endpoint a denial-of-service target without rate limiting, because every attempt costs real CPU.
- Migrating from a weak hash requires rehashing at login, since the raw password is otherwise unavailable.

#### Common mistakes
- MD5 or SHA for passwords.
- Logging raw passwords anywhere.
- No rate limiting on login.

#### Comparisons

| | BCrypt | Argon2id | SHA-256 |
|---|---|---|---|
| Deliberately slow | Yes | Yes | No |
| Memory-hard | No | Yes | No |
| Suitable for passwords | Yes | Yes (preferred) | No |

#### Complexity
Each hash costs a tunable, deliberately large amount of CPU (and memory for Argon2) — the point of the design.

#### Frequently confused with
Hashing versus encryption.

#### Important facts to remember
- Slow, salted, adaptive — slow defeats brute force, salt defeats precomputed tables, adaptive keeps pace with hardware.
- Never fast hashes — speed is exactly what an attacker wants.
- Delegating encoder allows upgrades — the stored prefix names the algorithm.

---

### 8.5 Users and Authentication Providers

#### Definition
`UserDetailsService` loads user records; `AuthenticationProvider` verifies credentials; `AuthenticationManager` coordinates providers to produce an authenticated `Authentication`.

#### Why it exists
Because users may live in a database, a directory or an external system, and credentials may be passwords, tokens or certificates. Splitting login into a coordinator, providers and a user source lets each be replaced without rewriting the rest.

#### Interview explanation
Trace a login through `ProviderManager`, `DaoAuthenticationProvider`, `UserDetailsService` and `PasswordEncoder`. Then mention user-enumeration protection, because custom login endpoints routinely break it.

#### Syntax
```java
@Bean
AuthenticationManager authenticationManager(UserDetailsService users, PasswordEncoder encoder) {
    var provider = new DaoAuthenticationProvider(encoder);
    provider.setUserDetailsService(users);
    return new ProviderManager(provider);
}
```

#### Example
```java
@PostMapping("/api/auth/login")
TokenResponse login(@RequestBody @Valid LoginRequest request) {
    var auth = authenticationManager.authenticate(
        UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password()));
    return new TokenResponse(tokens.issue(auth));      // BadCredentialsException → 401
}
```

#### Common interview questions
- "What does `UserDetailsService` do?" (Loads a user's details — username, password hash, authorities, account status — by username.)
- "What is the role of `AuthenticationManager`?" (It coordinates one or more `AuthenticationProvider`s, returning an authenticated token or throwing.)
- "How do you authenticate users from a database?" (A `UserDetailsService` backed by a repository, plus `DaoAuthenticationProvider` with a `PasswordEncoder`.)
- "What is user enumeration and how is it prevented?" (Distinguishing "no such user" from "wrong password" lets attackers discover accounts; returning the same response and timing prevents it.)

#### Follow-up questions
- "How do you support several login mechanisms?" (Several providers in one `ProviderManager`, each supporting its own `Authentication` type.)
- "How are locked or expired accounts handled?" (Through `UserDetails` flags, checked by the provider before or after the password check.)
- "Where should brute-force protection go?" (Rate limiting per account and per IP, plus temporary lockout — at the edge or in an authentication event listener.)

#### Edge cases
- `UsernameNotFoundException` is converted to `BadCredentialsException` by default — deliberately, so responses never reveal which accounts exist.
- Loading users with all relationships eagerly on every request is expensive under stateless JWT validation; usually it is not needed at all.
- Case sensitivity of usernames must match between registration and lookup.

#### Common mistakes
- Distinct error messages for unknown user and wrong password.
- No rate limiting on the login endpoint.
- Loading the full user from the database on every authenticated request.

#### Comparisons

| Component | Responsibility |
|---|---|
| `UserDetailsService` | Find the user |
| `PasswordEncoder` | Verify the password |
| `AuthenticationProvider` | Combine them for one auth type |
| `AuthenticationManager` | Coordinate providers |

#### Frequently confused with
`UserDetailsService` versus `AuthenticationProvider`.

#### Important facts to remember
- Provider manager coordinates providers — each provider handles one kind of credential.
- Same error for every credential failure — otherwise login reveals which accounts exist.
- Rate-limit login — slow hashes and password guessing both demand it.

---

### 8.6 Stateless Authentication

#### Definition
Authentication where the server keeps no session; each request carries a token — typically a bearer token — that is validated independently.

#### Why it exists
Because a session lives in one server's memory, so with many instances it needs sticky routing or a shared store. A token carried by every request lets any instance authenticate any request without shared session storage, which suits horizontally scaled services and non-browser clients.

#### Interview explanation
Compare it honestly with sessions: easier to scale, harder to revoke. Then describe the standard mitigation — short-lived access tokens plus revocable refresh tokens — because "how do you log someone out?" is the question that follows.

#### Syntax
```java
http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
```
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

#### Example
```java
@PostMapping("/api/auth/refresh")
TokenResponse refresh(@RequestBody RefreshRequest request) {
    var stored = refreshTokens.findValid(request.token())        // checked against the database
        .orElseThrow(InvalidRefreshTokenException::new);
    refreshTokens.rotate(stored);                                // one-time use
    return new TokenResponse(tokens.issueAccess(stored.user()), stored.next());
}
```

#### Common interview questions
- "What is stateless authentication?" (The server stores no session; each request presents a token the server validates on its own.)
- "How do you log out a user with JWTs?" (Short access-token lifetimes plus server-side revocation of refresh tokens; for immediate revocation, a denylist checked per request.)
- "What is a refresh token?" (A longer-lived credential, stored and revocable server-side, exchanged for new short-lived access tokens.)
- "Sessions or JWTs?" (Sessions for traditional browser applications with easy revocation; stateless tokens for APIs, mobile clients and multi-service architectures.)

#### Follow-up questions
- "What is refresh-token rotation?" (Each refresh issues a new refresh token and invalidates the old one, so a stolen token is detected when reused.)
- "Where should a browser store tokens?" (In an HttpOnly, Secure, SameSite cookie to resist XSS — which then requires CSRF protection — rather than `localStorage`.)
- "Does stateless mean no database access?" (For access-token validation, yes; refresh and revocation still need state.)

#### Edge cases
- A denylist reintroduces per-request state, partially undoing the stateless benefit — every request must consult it again.
- Clock skew between services affects `exp` and `nbf` validation, because each verifier compares the claims with its own clock.
- Tokens in URLs leak through logs and referrer headers.

#### Common mistakes
- Long-lived access tokens.
- Tokens in `localStorage` exposed to XSS.
- No refresh-token rotation.

#### Comparisons

| | Short access token | Long access token |
|---|---|---|
| Damage if leaked | Minutes | Days |
| Refresh traffic | More | Less |
| Recommended | Yes | No |

#### Frequently confused with
Stateless authentication versus no server-side state at all.

#### Important facts to remember
- Easy to scale, hard to revoke — there is nothing server-side to delete.
- Short access, revocable refresh — limits how long a stolen token works.
- Rotate refresh tokens — reuse of an old one reveals theft.

---

### 8.7 JSON Web Tokens

#### Definition
A compact, URL-safe token of base64url-encoded header, claims and signature, verifiable by anyone holding the appropriate key.

#### Why it exists
Because a stateless token must let any server verify — without calling anyone — both who the user is and that the token came from a trusted issuer unchanged. A signature over the claims provides exactly that, carrying verifiable identity between parties without a shared session store.

#### Interview explanation
Describe the structure and verification steps — signature, then `exp`, `iss`, `aud` — and explain RS256 over HS256 for multi-service systems. Close with what not to do: secrets in claims, trusting the header's algorithm.

#### Syntax
```java
JwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUri).build();
Jwt jwt = decoder.decode(token);
jwt.getSubject(); jwt.getClaimAsStringList("roles"); jwt.getExpiresAt();
```

#### Example
```java
@Bean
JwtDecoder jwtDecoder(@Value("${jwt.public-key}") RSAPublicKey key) {
    var decoder = NimbusJwtDecoder.withPublicKey(key).signatureAlgorithm(SignatureAlgorithm.RS256).build();
    var issuer = JwtValidators.createDefaultWithIssuer("https://auth.shop.example");   // also checks exp, nbf
    var audience = new JwtClaimValidator<List<String>>(JwtClaimNames.AUD,
        aud -> aud != null && aud.contains("shop-api"));
    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuer, audience));
    return decoder;
}
```

#### Common interview questions
- "What are the parts of a JWT?" (A header with the algorithm and key id, a payload of claims, and a signature over both, separated by dots.)
- "Is a JWT encrypted?" (A signed JWT (JWS) is not — the payload is readable by anyone; encryption requires JWE.)
- "HS256 or RS256?" (RS256 or ES256 when several services verify tokens, because they only need the public key; HS256 shares one secret that could also mint tokens.)
- "What must a verifier check?" (The signature with a pinned algorithm, then expiry, not-before, issuer and audience.)

#### Follow-up questions
- "What is the `alg: none` attack?" (A verifier that trusts the header accepts an unsigned token; always enforce the expected algorithm.)
- "What is a JWKS endpoint?" (A published set of public keys, identified by `kid`, allowing key rotation without redeploying verifiers.)
- "How large should a JWT be?" (Small — it travels on every request; include identity, roles and expiry, not profile data.)

#### Edge cases
- Key rotation needs overlapping validity so tokens signed with the old key remain verifiable until they expire.
- Clock skew requires a small tolerance on `exp` and `nbf`, because issuer and verifier clocks are never exactly equal.
- Tokens with many roles can exceed header size limits on proxies.

#### Common mistakes
- Secrets or personal data in claims.
- Trusting the header's algorithm.
- Not validating audience.

#### Comparisons

| | HS256 | RS256 / ES256 |
|---|---|---|
| Keys | One shared secret | Private sign, public verify |
| Verifiers can mint tokens | Yes | No |
| Key distribution | Hard | JWKS endpoint |

#### Frequently confused with
JWS (signed) versus JWE (encrypted).

#### Important facts to remember
- A signed JWT is not encrypted — anyone can read it; nobody can alter it undetected.
- Pin the algorithm; check `iss`, `aud`, `exp`.
- Asymmetric keys for many verifiers — verifiers hold only the public key, so none can mint tokens.

---

### 8.8 Role-Based Access Control

#### Definition
Authorisation by roles and permissions expressed as `GrantedAuthority` strings, checked with `hasRole` (adds `ROLE_`) or `hasAuthority` (exact match).

#### Why it exists
Because granting permissions user by user stops scaling after a few dozen people — nobody can answer who may do what. Grouping permissions into roles makes access manageable and auditable at the level the organisation thinks in.

#### Interview explanation
Explain the `ROLE_` prefix behaviour, recommend fine-grained authorities assigned to roles, and say what RBAC cannot do — ownership checks — which leads naturally into method security.

#### Syntax
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.POST, "/api/orders/*/refund").hasAuthority("orders:refund")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
```

#### Example
```java
// Roles map to permissions; checks name the permission
enum Role {
    SUPPORT(Set.of("orders:read")),
    ADMIN(Set.of("orders:read", "orders:refund", "users:manage"));
    final Set<String> permissions;
    Role(Set<String> p) { this.permissions = p; }
}
```

#### Common interview questions
- "What is the difference between `hasRole` and `hasAuthority`?" (`hasRole("X")` checks for `ROLE_X`; `hasAuthority("X")` checks the exact string.)
- "How do you get roles from a JWT into Spring?" (A `JwtAuthenticationConverter` with a `JwtGrantedAuthoritiesConverter` reading the roles claim and applying the prefix.)
- "Roles or permissions?" (Permissions in checks, roles as named bundles of permissions — it avoids role explosion as requirements grow.)
- "What can RBAC not express?" (Data-dependent rules such as ownership — those need method-level or domain checks.)

#### Follow-up questions
- "What is role hierarchy?" (`RoleHierarchy` declares that `ADMIN` implies `USER`, so checks need not list both.)
- "What is ABAC?" (Attribute-based access control — decisions using attributes of the user, resource and context, for rules RBAC cannot express.)
- "How do you audit permissions?" (Keep roles and permissions in data or a single enum, so the mapping is reviewable in one place.)

#### Edge cases
- `hasRole("ROLE_ADMIN")` is rejected at startup in the URL DSL, because `hasRole` adds the prefix itself; `hasAuthority("ROLE_ADMIN")` states the full string.
- Roles embedded in a long-lived JWT do not reflect revocation until the token expires, because the token is never re-checked against current data.
- Authority strings are case-sensitive.

#### Common mistakes
- Prefix confusion.
- Role checks hardcoded throughout controllers.
- RBAC used where ownership is the real rule.

#### Comparisons

| | RBAC | ABAC |
|---|---|---|
| Decides by | Role membership | Attributes of user, resource, context |
| Expresses ownership | No | Yes |
| Complexity | Low | Higher |

#### Frequently confused with
`hasRole` versus `hasAuthority`.

#### Important facts to remember
- `hasRole` adds `ROLE_` — pass the bare name, or use `hasAuthority` for the full string.
- Check permissions, bundle into roles — permissions stay stable while roles change.
- Ownership needs more than RBAC — it depends on the data, not the role.

---

### 8.9 Method Security

#### Definition
Annotation-driven authorisation on methods — `@PreAuthorize`, `@PostAuthorize`, `@PreFilter`, `@PostFilter` — enabled by `@EnableMethodSecurity` and implemented with AOP proxies.

#### Why it exists
Because a URL rule protects one entry point while an operation can be reached through several, and because rules such as "only the owner" depend on data no URL contains. Attaching the rule to the method protects the operation wherever it is invoked.

#### Interview explanation
Show an ownership check through a bean reference, note that `@EnableMethodSecurity` (added in Spring Security 5.6, standard in 6) replaces the deprecated `@EnableGlobalMethodSecurity`, and mention the proxy limitation — self-invocation skips the check.

#### Syntax
```java
@EnableMethodSecurity
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("#userId == authentication.name")
@PreAuthorize("@access.canEdit(#id, authentication)")
@PostAuthorize("returnObject.ownerId == authentication.name")
```

#### Example
```java
@PreAuthorize("@orderAccess.isOwner(#orderId, authentication) or hasRole('SUPPORT')")
public OrderDetail detail(Long orderId) { ... }
```

#### Common interview questions
- "What is method security for?" (Protecting service operations regardless of entry point, and expressing rules that depend on arguments or data.)
- "How do you check that a user owns a resource?" (`@PreAuthorize` referencing a bean method that queries ownership, using the method arguments and `authentication`.)
- "What is the difference between `@PreAuthorize` and `@PostAuthorize`?" (`@Pre` checks before execution; `@Post` checks after, against the returned object — suitable only for side-effect-free reads.)
- "Why might `@PreAuthorize` not apply?" (Self-invocation bypasses the proxy, and private methods are not intercepted.)

#### Follow-up questions
- "What is IDOR?" (Insecure direct object reference — accessing another user's resource by changing an id — which ownership checks prevent.)
- "How do you test method security?" (Call the service through the Spring context with `@WithMockUser` or a custom security context factory, asserting `AccessDeniedException`.)
- "What does `@PreFilter` do?" (Filters a collection argument before the method runs, keeping only elements the expression allows.)

#### Edge cases
- SpEL errors surface at runtime, on first call, not at startup, because expressions are strings parsed when first evaluated.
- Parameter names in expressions (`#orderId`) require `-parameters` or `@P` annotations, because otherwise the names do not exist at runtime.
- `@PostFilter` on large collections loads everything before discarding most of it.

#### Common mistakes
- Relying on URL rules only.
- Long, untested SpEL expressions.
- `@PostAuthorize` on methods with side effects.

#### Comparisons

| | URL rules | Method security |
|---|---|---|
| Protects | HTTP endpoints | Operations anywhere |
| Data-dependent rules | No | Yes |
| Proxy limitations | No | Yes |

#### Frequently confused with
`@EnableMethodSecurity` versus the deprecated `@EnableGlobalMethodSecurity`.

#### Important facts to remember
- Guards the operation, not the URL — every entry point gets the check.
- Ownership via bean references — typed, testable logic instead of long SpEL.
- Self-invocation bypasses it — it is a proxy, like `@Transactional`.

---

### 8.10 OAuth2 and Resource Servers

#### Definition
OAuth2 delegates authorisation: an authorisation server issues tokens, clients obtain them, and resource servers — APIs — validate them; OpenID Connect adds authentication on top.

#### Why it exists
Because every application implementing its own login means every application storing passwords and issuing tokens, each with its own mistakes. Centralising login, credential storage and token issuance in one trusted service lets every API simply verify tokens.

#### Interview explanation
Name the roles, explain that a resource server validates JWTs locally using the issuer's JWKS, list the grant types that remain current (authorisation code with PKCE, client credentials), and say when you would build your own token issuance versus use an identity provider.

#### Syntax
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://idp.example.com/realms/shop
          audiences: shop-api
```

#### Example
```java
// Service-to-service call with client credentials, via Spring's OAuth2 client support
@Bean
RestClient inventoryClient(RestClient.Builder builder, OAuth2AuthorizedClientManager manager) {
    var interceptor = new OAuth2ClientHttpRequestInterceptor(manager);
    interceptor.setClientRegistrationIdResolver(request -> "inventory");
    return builder.requestInterceptor(interceptor).build();
}
```

#### Common interview questions
- "What are the OAuth2 roles?" (Resource owner, client, authorisation server and resource server.)
- "What is a resource server?" (An API that accepts access tokens and validates them — locally for JWTs using the issuer's public keys, or by introspection for opaque tokens.)
- "Which grant types should be used today?" (Authorization Code with PKCE for user-facing apps, Client Credentials for service-to-service; Implicit and Password are deprecated.)
- "What is the difference between OAuth2 and OpenID Connect?" (OAuth2 delegates authorisation; OIDC adds an identity layer with an ID token describing the authenticated user.)

#### Follow-up questions
- "JWT or opaque tokens?" (JWTs validate locally and scale well; opaque tokens require introspection but can be revoked immediately.)
- "What is PKCE?" (Proof Key for Code Exchange — a per-request secret that prevents an intercepted authorisation code from being redeemed.)
- "Why validate the audience?" (So a token issued for another API cannot be replayed against yours.)

#### Edge cases
- The resource server fetches keys at startup or first use; an unreachable issuer at that moment fails authentication, because there are no keys yet to verify with.
- Key rotation at the issuer is handled automatically through JWKS caching and `kid` lookup.
- Multi-tenant setups need several issuers, configured with a custom `AuthenticationManagerResolver`.

#### Common mistakes
- Missing audience validation.
- Using the Password grant in new code.
- Implementing a custom authorisation server for a simple need.

#### Comparisons

| | JWT access token | Opaque access token |
|---|---|---|
| Validation | Local, signature | Introspection call |
| Immediate revocation | No | Yes |
| Latency | Lowest | Extra round trip |

#### Frequently confused with
OAuth2 as authentication — OIDC is the authentication layer.

#### Important facts to remember
- Resource server validates, never issues.
- Code + PKCE, Client Credentials — the grants still recommended today.
- Always check `aud` — otherwise tokens meant for other APIs work on yours.

---

### 8.11 CORS and CSRF

#### Definition
CORS is the browser mechanism by which a server permits cross-origin JavaScript to read its responses; CSRF protection prevents forged state-changing requests that ride on a user's cookies.

#### Why it exists
Because browsers attach cookies automatically, so other sites could otherwise read sensitive responses or trigger actions as the user.

#### Interview explanation
Separate them clearly — CORS controls reading, CSRF controls forging — and then state when CSRF may be disabled: stateless APIs authenticated by an `Authorization` header and no cookies. Emphasise that CORS is not a server-side security boundary.

#### Syntax
```java
http.cors(Customizer.withDefaults())      // uses a CorsConfigurationSource bean
    .csrf(c -> c.disable());              // only for header-authenticated stateless APIs

http.csrf(c -> c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));  // SPA + cookies; since Spring Security 6 also needs a SPA-aware token request handler
```

#### Example
```java
config.setAllowedOrigins(List.of("https://shop.example", "https://admin.shop.example"));
config.setAllowCredentials(true);
config.setMaxAge(Duration.ofHours(1));      // cache preflight responses
```

#### Common interview questions
- "What is CORS?" (A browser mechanism where the server's `Access-Control-Allow-*` headers decide whether JavaScript from another origin may read the response.)
- "What is CSRF?" (An attack where another site causes the victim's browser to send an authenticated, state-changing request using its cookies.)
- "When can CSRF protection be disabled?" (For APIs authenticated solely by headers such as `Authorization: Bearer`, with no cookie-based authentication.)
- "Does CORS protect the API from attackers?" (No — it is enforced by browsers only; any non-browser client ignores it.)

#### Follow-up questions
- "What is a preflight request?" (An `OPTIONS` request the browser sends before non-simple cross-origin requests to check permissions.)
- "What do SameSite cookies change?" (`SameSite=Lax` or `Strict` stop browsers sending cookies on most cross-site requests, reducing CSRF risk — complementary to tokens, not a full replacement.)
- "Why can't you use `*` with credentials?" (Browsers forbid it; a wildcard with credentials would let any site make authenticated requests.)

#### Edge cases
- Preflight requests must be permitted through the security chain, or every cross-origin call fails, because the browser sends the preflight without credentials.
- Reflecting the request `Origin` header unconditionally is equivalent to a wildcard with credentials.
- Storing a JWT in a cookie brings CSRF exposure back, because the browser then attaches it automatically.

#### Common mistakes
- Disabling CSRF while using cookie authentication.
- `allowedOrigins("*")` in production.
- Treating CORS as access control.

#### Comparisons

| | CORS | CSRF protection |
|---|---|---|
| Stops | Cross-origin reading | Forged writes |
| Enforced by | Browser | Server |
| Needed for header-auth APIs | If browser clients exist | No |

#### Frequently confused with
CORS and CSRF as the same protection.

#### Important facts to remember
- CORS: who may read. CSRF: who may write with your cookies.
- Disable CSRF only without cookies — no automatic credentials, nothing to forge.
- Never `*` with credentials — that trusts every website with your users' sessions.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 8. Next: Testing Spring Applications.*

---

## 9. Testing Spring Applications

### Table of Contents (this group)
- [[#9.1 The Testing Pyramid]]
- [[#9.2 Unit Tests with JUnit 5]]
- [[#9.3 Mocking with Mockito]]
- [[#9.4 Test Slices]]
- [[#9.5 Testing Controllers with MockMvc]]
- [[#9.6 Testing Repositories]]
- [[#9.7 Full Integration Tests]]
- [[#9.8 Testcontainers]]
- [[#9.9 Testing Security]]
- [[#9.10 Testing External Calls]]

---

### 9.1 The Testing Pyramid

#### Definition
A model for proportioning tests: many fast unit tests, fewer slice and integration tests, and few end-to-end tests.

#### Why it exists
Because test levels trade speed and precision against realism — no single level is both fast and fully convincing — so a suite needs enough of each to be both fast and trustworthy.

#### Interview explanation
Describe the levels including Spring's slices as the middle tier, then show judgement: the pyramid is a heuristic, and a database-heavy service may legitimately lean on slice and integration tests rather than heavily mocked unit tests.

#### Syntax
```java
class PriceCalculatorTest { }                 // unit
@WebMvcTest(OrderController.class) class ... { }   // slice
@DataJpaTest class ... { }                    // slice
@SpringBootTest(webEnvironment = RANDOM_PORT) class ... { }   // integration
```

#### Example
```text
Typical healthy proportions for a Spring service:
  ~70% unit tests        (domain rules, mappers, utilities)
  ~25% slice tests       (controllers, repositories, JSON)
  ~5%  integration tests (critical end-to-end paths)
```

#### Common interview questions
- "What is the testing pyramid?" (A guideline for many fast unit tests, fewer integration tests and very few end-to-end tests, balancing speed against confidence.)
- "What are Spring test slices?" (Annotations like `@WebMvcTest` and `@DataJpaTest` that load only one layer of the application for fast, focused tests.)
- "When are unit tests not the best choice?" (When the behaviour lives in framework or database interaction — queries, mappings, JSON — which mocks cannot exercise.)
- "How do you keep a test suite fast?" (Test at the lowest effective level, share Spring contexts through consistent configuration, and reserve full integration tests for critical paths.)

#### Follow-up questions
- "What is the testing trophy?" (An alternative shape emphasising integration tests, argued for applications where most logic is wiring rather than computation.)
- "How do you measure test quality?" (Mutation testing — PIT — reveals tests that pass even when the code is changed, which coverage alone cannot.)
- "Is 100% coverage a goal?" (No — coverage shows what ran, not what was asserted; high coverage with weak assertions is false confidence.)

#### Edge cases
- Integration-heavy suites need parallelisation and data isolation to stay usable, because each test is slow and they share infrastructure.
- Context caching makes ten integration tests with one configuration far cheaper than ten with different ones.
- End-to-end tests against shared environments are prone to flakiness from other teams' changes.

#### Common mistakes
- `@SpringBootTest` for everything.
- Treating coverage as quality.
- Mocking frameworks' own behaviour instead of testing it with slices.

#### Comparisons

| Level | Speed | Failure precision | Realism |
|---|---|---|---|
| Unit | ms | High | Low |
| Slice | 100s of ms | Medium | Medium |
| Integration | Seconds | Low | High |

#### Frequently confused with
Integration tests versus end-to-end tests — one assembles your application, the other drives the deployed system.

#### Important facts to remember
- Test at the lowest level that can see the behaviour.
- Slices are Spring's middle tier — real framework behaviour, one layer.
- Coverage is not quality — executed lines are not verified behaviour.

---

### 9.2 Unit Tests with JUnit 5

#### Definition
Tests of a single class in isolation, written with JUnit Jupiter and typically AssertJ, running in milliseconds with no framework or infrastructure.

#### Why it exists
Because business rules have many cases, and checking each by starting the application would be slow and vague. Testing one class directly verifies them quickly and precisely, with failures that point straight at the broken behaviour.

#### Interview explanation
Mention JUnit 5's features — `@ParameterizedTest`, `@Nested`, lifecycle hooks — and AssertJ for readable assertions. Then name what makes unit tests reliable: no time, randomness or ordering dependencies.

#### Syntax
```java
@Test void name() { }
@BeforeEach void setUp() { }
@ParameterizedTest @ValueSource(ints = {1, 2, 3}) void each(int n) { }
@Nested class WhenShipped { }
assertThat(actual).isEqualTo(expected);
assertThatThrownBy(() -> ...).isInstanceOf(X.class);
```

#### Example
```java
class DiscountPolicyTest {
    private final Clock fixed = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
    private final DiscountPolicy policy = new DiscountPolicy(fixed);   // injected clock

    @Test
    void appliesNewYearDiscountOnJanuaryFirst() {
        assertThat(policy.discountFor(Money.eur("100.00"))).isEqualTo(Money.eur("10.00"));
    }
}
```

#### Common interview questions
- "What changed from JUnit 4 to JUnit 5?" (A modular architecture — Platform, Jupiter, Vintage — with extensions replacing runners and rules, parameterised tests built in, and `@Nested` test classes.)
- "How do you test time-dependent code?" (Inject a `java.time.Clock` and use `Clock.fixed` in tests rather than calling `Instant.now()` directly.)
- "What is a parameterised test?" (One test method run over many inputs — `@ValueSource`, `@CsvSource`, `@MethodSource` — each reported separately.)
- "What makes a unit test good?" (One behaviour, a descriptive name, independence from other tests, and determinism.)

#### Follow-up questions
- "Why AssertJ over JUnit assertions?" (Fluent, discoverable API and much more informative failure messages, especially for collections.)
- "What is a test fixture?" (Reusable setup — builders or factory methods producing valid test objects — that keeps tests short and intention-revealing.)
- "How do JUnit 5 extensions work?" (`@ExtendWith` registers callbacks into the test lifecycle — Mockito and Spring both integrate this way.)

#### Edge cases
- JUnit 5 creates a new test instance per method by default; `@TestInstance(PER_CLASS)` changes that and makes shared state possible — and risky.
- Test execution order is deterministic but deliberately non-obvious, so tests relying on it break when methods are added or renamed — which surfaces hidden dependencies between tests instead of hiding them.
- `assertThrows` returns the exception, which should be asserted further rather than ignored.

#### Common mistakes
- Calling `Instant.now()` in code under test.
- Shared mutable state between tests.
- Tests with no assertions.

#### Comparisons

| | JUnit 4 | JUnit 5 |
|---|---|---|
| Extension model | Runners and rules | Extensions |
| Parameterised tests | External runner | Built in |
| Nested tests | No | `@Nested` |

#### Frequently confused with
JUnit Platform (the launcher) versus JUnit Jupiter (the programming model).

#### Important facts to remember
- Inject the clock — otherwise results depend on when the test runs.
- One behaviour per test — a failure then names one broken rule.
- AssertJ for readable failures — the message says exactly what differed.

---

### 9.3 Mocking with Mockito

#### Definition
Creating stand-in collaborators whose responses are scripted and whose calls are recorded, so a class can be tested without its real dependencies.

#### Why it exists
To isolate a unit from slow, non-deterministic or external collaborators, and to observe interactions that have no other visible effect.

#### Interview explanation
Distinguish stubbing (`when`) from verification (`verify`), name the four kinds of test double, and give the judgement call: mock boundaries such as gateways and clients, not value objects or simple collaborators.

#### Syntax
```java
@ExtendWith(MockitoExtension.class)
@Mock PaymentGateway gateway;
@InjectMocks CheckoutService service;
when(gateway.charge(any())).thenReturn(receipt);
when(gateway.charge(any())).thenThrow(new PaymentDeclinedException());
verify(gateway).charge(argThat(c -> c.amount() > 0));
verify(repository, never()).save(any());
```

#### Example
```java
@Test
void doesNotSaveWhenPaymentIsDeclined() {
    when(payments.charge(any())).thenThrow(new PaymentDeclinedException());

    assertThatThrownBy(() -> service.checkout(cart)).isInstanceOf(PaymentDeclinedException.class);
    verify(orders, never()).save(any());           // the interaction is the behaviour
}
```

#### Common interview questions
- "What is the difference between a mock and a stub?" (A stub provides canned answers; a mock also records calls so the test can verify interactions.)
- "What does `@InjectMocks` do?" (Creates the class under test and injects the `@Mock` fields into it via constructor, setter or field.)
- "When should you not mock?" (Value objects, simple collaborators and anything an in-memory fake handles well — over-mocking couples tests to implementation.)
- "What is a spy?" (A real object with selected methods stubbed — useful sparingly, and often a sign the class should be split.)

#### Follow-up questions
- "What are strict stubs?" (Mockito's default with `MockitoExtension`: unused stubs fail the test, exposing tests that no longer exercise what they claim.)
- "How do you capture an argument?" (`ArgumentCaptor`, then assert on the captured value — clearer than complex `argThat` matchers.)
- "Can Mockito mock final classes and static methods?" (Yes — the inline mock maker, default since Mockito 5, supports final classes and `mockStatic`.)

#### Edge cases
- Mixing raw values and matchers in one call (`when(f(any(), 5))`) throws `InvalidUseOfMatchersException`, because Mockito matches the arguments of a call either all by matcher or all by value.
- `@InjectMocks` silently skips injection it cannot resolve, leaving null fields — it tries constructor, setter and field injection in turn, and gives up quietly.
- Mocks of `equals` and `hashCode` behave unexpectedly when objects are used in collections.

#### Common mistakes
- Verifying every call, so any refactor breaks tests.
- Mocking types you own when a fake would be clearer.
- Mocking value objects.

#### Comparisons

| | Mock | Fake |
|---|---|---|
| Behaviour | Scripted per test | Real, simplified |
| Verifies interactions | Yes | No |
| Brittleness | Higher | Lower |

#### Frequently confused with
Mocks versus stubs versus fakes.

#### Important facts to remember
- Mock boundaries, not internals — mocking internals tests the implementation, not the behaviour.
- `when` stubs, `verify` checks.
- Strict stubs catch dead setup — an unused stub usually means a mismatched argument.

---

### 9.4 Test Slices

#### Definition
Annotations — `@WebMvcTest`, `@DataJpaTest`, `@JsonTest`, `@RestClientTest` and others — that start only the Spring infrastructure relevant to one layer.

#### Why it exists
Because starting the whole application per test is slow, while plain unit tests cannot exercise Spring's own behaviour — mapping, serialisation, queries. A slice starts just one layer's worth of Spring: real framework behaviour, without paying for the entire application context.

#### Interview explanation
Name the main slices and what each loads, mention `@MockitoBean` as the current way to replace beans (with `@MockBean` deprecated in Boot 3.4), and explain context caching — the hidden cost of inconsistent test configuration.

#### Syntax
```java
@WebMvcTest(OrderController.class)
@DataJpaTest
@JsonTest
@RestClientTest(PaymentClient.class)
@MockitoBean OrderService service;
@MockitoSpyBean Clock clock;
```

#### Example
```java
@JsonTest
class OrderResponseJsonTest {
    @Autowired JacksonTester<OrderResponse> json;

    @Test
    void serialisesMoneyAsAString() throws Exception {
        assertThat(json.write(OrderFixtures.response()))
            .extractingJsonPathStringValue("$.total").isEqualTo("19.99");
    }
}
```

#### Common interview questions
- "What is a test slice?" (A Spring Boot test annotation that loads only the components and auto-configuration for one layer.)
- "What does `@WebMvcTest` load?" (Controllers, `@ControllerAdvice`, filters, `WebMvcConfigurer`s, Jackson and Spring Security's auto-configuration — but not your own `@Configuration` classes, so a custom `SecurityFilterChain` must be imported — and not services or repositories.)
- "What replaced `@MockBean`?" (`@MockitoBean` from Spring Framework 6.2; Boot 3.4 deprecated `@MockBean` and `@SpyBean`.)
- "Why can many test classes slow a suite dramatically?" (Each distinct context configuration — including different mock sets — creates a new context instead of reusing a cached one.)

#### Follow-up questions
- "How does context caching work?" (Spring keys cached contexts by their configuration; identical configurations share one context across test classes.)
- "What does `@DirtiesContext` do?" (Discards the cached context after the test, forcing a rebuild — expensive and usually a sign of shared mutable state.)
- "Can you add beans to a slice?" (Yes — `@Import` specific configuration or components the slice does not include by default.)

#### Edge cases
- `@WebMvcTest` does not load `@Component`s that controllers depend on unless imported or mocked, because its scan is limited to web-layer beans.
- Custom `@Configuration` classes scanned from the main application can leak into slices unexpectedly.
- Slice tests do not start an embedded server; real servlet-container behaviour is not exercised.

#### Common mistakes
- Using `@SpringBootTest` where a slice suffices.
- Unique `@MockitoBean` sets per test class, defeating caching.
- Overusing `@DirtiesContext`.

#### Comparisons

| | Slice | `@SpringBootTest` |
|---|---|---|
| Context | Partial | Full |
| Start-up | Fast | Slow |
| Catches wiring errors | Within the layer | Across the application |

#### Frequently confused with
`@MockitoBean` (replaces a bean in a context) versus `@Mock` (plain Mockito, no context).

#### Important facts to remember
- One layer, real framework behaviour.
- `@MockitoBean` is current — `@MockBean` is deprecated since Boot 3.4.
- Consistent config preserves caching — each distinct configuration is a new context.

---

### 9.5 Testing Controllers with MockMvc

#### Definition
Driving the real `DispatcherServlet` with mock requests and asserting on the response, usually within `@WebMvcTest`.

#### Why it exists
Because most controller bugs live in the web plumbing, which a direct method call never runs. MockMvc pushes requests through the real dispatcher — mapping, binding, validation, serialisation, errors and security — without the cost of starting a server.

#### Interview explanation
Show a test asserting status, content type and body, with the service mocked. Mention that MockMvc runs your real filters and advice, and that `MockMvcTester` (Spring 6.2) offers an AssertJ alternative.

#### Syntax
```java
mockMvc.perform(post("/api/orders")
            .contentType(APPLICATION_JSON)
            .content(json)
            .with(jwt()))
       .andExpect(status().isCreated())
       .andExpect(header().string("Location", startsWith("/api/orders/")))
       .andExpect(jsonPath("$.status").value("NEW"));
```

#### Example
```java
@Autowired MockMvcTester mvc;       // Spring Framework 6.2

@Test
void getsAnOrder() {
    when(service.require(1L)).thenReturn(OrderFixtures.order(1L));
    assertThat(mvc.get().uri("/api/orders/1").with(jwt()))
        .hasStatusOk()
        .bodyJson().extractingPath("$.id").isEqualTo(1);
}
```

#### Common interview questions
- "How do you test a REST controller?" (`@WebMvcTest` with MockMvc and the service mocked, asserting status, headers and JSON body.)
- "Does MockMvc start a server?" (No — it calls the `DispatcherServlet` directly with mock request and response objects.)
- "What should controller tests assert?" (The contract: status codes, error bodies, JSON field names and formats, and headers — not business logic.)
- "How do you test validation errors?" (Send an invalid body and assert 400 plus the error structure listing the offending fields.)

#### Follow-up questions
- "MockMvc or a real HTTP client?" (MockMvc for fast web-layer tests; a real client with `RANDOM_PORT` when servlet-container behaviour or the full stack matters.)
- "How do you include authentication?" (Request post-processors from `spring-security-test` such as `jwt()`, `user()` or `httpBasic()`.)
- "How do you print the request and response when debugging?" (`.andDo(print())`.)

#### Edge cases
- Filters registered as servlet filters outside Spring may not run under MockMvc, because MockMvc applies only the filters it is configured with.
- Asynchronous controller methods require `asyncDispatch` to assert the final result.
- Default security rules apply unless your configuration is loaded, producing unexpected 401s, because the slice falls back to Boot's default chain.

#### Common mistakes
- Asserting only status codes.
- Re-testing business logic through controller tests.
- Forgetting authentication, then disabling security in tests.

#### Comparisons

| | MockMvc | `TestRestTemplate` |
|---|---|---|
| Server | None | Real, random port |
| Speed | Fast | Slower |
| Full stack | Web layer | Everything |

#### Frequently confused with
`@WebMvcTest` versus `@AutoConfigureMockMvc` with `@SpringBootTest` — the latter loads the whole context.

#### Important facts to remember
- Real dispatcher, no server — everything but the network.
- Assert the full contract — status, headers and body.
- Security post-processors, not disabled security — otherwise the rules go untested.

---

### 9.6 Testing Repositories

#### Definition
`@DataJpaTest` tests of repositories and mappings with JPA configured, each test rolled back, ideally against the production database engine via Testcontainers.

#### Why it exists
Because queries, mappings, constraints and fetch plans can only be verified by actually running them against a database.

#### Interview explanation
Explain the embedded-database replacement — the default before Boot 3.4, and still applied to non-test data sources — and why to avoid it, then the flush-and-clear technique that forces queries to hit the database. Those two details distinguish real repository testing from tests that only appear to work.

#### Syntax
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Autowired TestEntityManager em;
em.persistAndFlush(entity); em.clear();
```

#### Example
```java
@Test
void enforcesUniqueReference() {
    em.persistAndFlush(OrderFixtures.withReference("ORD-1"));
    assertThatThrownBy(() -> em.persistAndFlush(OrderFixtures.withReference("ORD-1")))
        .isInstanceOf(PersistenceException.class);      // the unique constraint, surfaced by Hibernate
}
```

#### Common interview questions
- "How do you test a Spring Data repository?" (`@DataJpaTest`, ideally against a Testcontainers instance of the production database, asserting query results.)
- "Why not test against H2?" (H2's dialect, constraint enforcement and query planning differ from PostgreSQL or MySQL, so passing tests prove little.)
- "Why flush and clear in repository tests?" (Otherwise reads may be served from the persistence context and the query under test never executes.)
- "Do `@DataJpaTest` changes persist between tests?" (No — each test runs in a transaction rolled back at the end.)

#### Follow-up questions
- "How do you test for N+1 queries?" (Count statements with Hibernate statistics or a datasource proxy and assert an upper bound.)
- "What does rollback hide?" (Commit-time behaviour — deferred constraints, flush-time errors and anything after the transaction ends.)
- "How do you test migrations?" (Run Flyway against a Testcontainers database at start-up and let `ddl-auto=validate` check the mapping.)

#### Edge cases
- Derived queries are validated at context start-up, so a mistyped method name fails every repository test.
- `@Transactional` rollback means sequences still advance, so tests must not assume specific id values, because sequences are deliberately non-transactional.
- Native queries using engine-specific SQL fail on an embedded database.

#### Common mistakes
- Testing on H2 only.
- Not clearing the persistence context.
- Asserting on generated ids.

#### Comparisons

| | Embedded DB | Testcontainers |
|---|---|---|
| Same engine as production | No | Yes |
| Start-up | Fastest | Seconds |
| Confidence | Low | High |

#### Frequently confused with
`@DataJpaTest` versus `@SpringBootTest` with a database — slice versus full context.

#### Important facts to remember
- Avoid the embedded replacement — `NON_TEST` (Boot 3.4+) or an explicit `NONE`.
- Flush and clear before reading — or the persistence context answers instead of the database.
- Assert query counts for N+1 — results can be right while the query count is wrong.

---

### 9.7 Full Integration Tests

#### Definition
`@SpringBootTest` tests that start the complete application context, optionally with a real server on a random port, exercising the assembled system.

#### Why it exists
To prove configuration, wiring, security, transactions and serialisation work together — failures invisible to unit and slice tests.

#### Interview explanation
Describe `RANDOM_PORT` plus a real HTTP client and Testcontainers, then the two operational concerns: test-data cleanup (the server's transaction is not rolled back) and context caching (avoid `@DirtiesContext`).

#### Syntax
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc               // alternatively: full context + MockMvc
@ActiveProfiles("test")
@Autowired TestRestTemplate rest;
@LocalServerPort int port;
```

#### Example
```java
@Test
void orderLifecycle() {
    var created = rest.postForEntity("/api/orders", request, OrderResponse.class);
    var id = created.getBody().id();
    rest.postForEntity("/api/orders/" + id + "/pay", payment, Void.class);
    assertThat(rest.getForObject("/api/orders/" + id, OrderResponse.class).status()).isEqualTo("PAID");
}
```

#### Common interview questions
- "When do you write a `@SpringBootTest`?" (For critical end-to-end paths where wiring, configuration, security and persistence must be proven together.)
- "Why does data persist between integration tests?" (With a real server, requests run in the server's own transactions, which the test cannot roll back.)
- "How do you keep integration tests fast?" (Share one context configuration across classes, reuse containers, and isolate data rather than resetting it.)
- "What does `@DirtiesContext` cost?" (A full context rebuild for the next test — often seconds — and it usually masks shared state that should be fixed.)

#### Follow-up questions
- "MockMvc or a real port in `@SpringBootTest`?" (MockMvc is faster and can roll back; a real port exercises the servlet container and HTTP client behaviour.)
- "How do you test scheduled jobs?" (Call the job's method directly in an integration test, or use Awaitility to wait for its effect.)
- "How do you test asynchronous outcomes?" (Awaitility — poll for the expected state with a timeout rather than sleeping.)

#### Edge cases
- `Thread.sleep` in tests makes them slow and flaky, because the right duration differs between machines; polling with a timeout is reliable.
- Shared containers across classes require data isolation by unique keys.
- `RANDOM_PORT` tests cannot use `@Transactional` rollback for cleanup, because the server handles requests on its own threads, in its own transactions.

#### Common mistakes
- Too many integration tests.
- `Thread.sleep` for async behaviour.
- `@DirtiesContext` as a fix for interference.

#### Comparisons

| | `MOCK` (default) | `RANDOM_PORT` |
|---|---|---|
| Real server | No | Yes |
| Test transaction rollback | Possible | No |
| Client | MockMvc | `TestRestTemplate`, `WebTestClient` |

#### Frequently confused with
`@SpringBootTest` default (`MOCK`) versus `RANDOM_PORT`.

#### Important facts to remember
- Few, for critical paths — they are slow and broad.
- Clean up or isolate data — the server's commits are real.
- Awaitility, not sleep — wait for the condition, not a guess.

---

### 9.8 Testcontainers

#### Definition
A library that starts real dependencies in Docker containers for tests, integrated with Spring Boot through `@ServiceConnection`.

#### Why it exists
Because in-memory substitutes differ from real engines in dialect, constraints, locking and ordering, and shared test servers drift and collide. Disposable containers let every run test against the same engines and versions as production.

#### Interview explanation
Show `@ServiceConnection` removing manual property wiring, explain container reuse through static fields or shared configuration, and stress pinned image versions matching production.

#### Syntax
```java
@Testcontainers
@Container @ServiceConnection
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

@DynamicPropertySource       // pre-3.1 alternative
static void props(DynamicPropertyRegistry r) { r.add("spring.datasource.url", postgres::getJdbcUrl); }
```

#### Example
```java
// src/test/java/.../TestShopApplication.java — run the app locally against containers
public static void main(String[] args) {
    SpringApplication.from(ShopApplication::main).with(TestcontainersConfig.class).run(args);
}
```

#### Common interview questions
- "What is Testcontainers?" (A library that runs real dependencies — databases, brokers, caches — in Docker containers during tests.)
- "What does `@ServiceConnection` do?" (Lets Spring Boot derive connection details from the container automatically, replacing manual property registration.)
- "Why prefer it over H2 or embedded Kafka?" (Real engines expose dialect, constraint, locking and protocol behaviour that substitutes do not.)
- "How do you keep it fast?" (Static or shared containers started once per context, plus Spring context caching, so the whole suite shares one container.)

#### Follow-up questions
- "What does Testcontainers need in CI?" (A Docker-compatible runtime available to the build agent, or Testcontainers Cloud.)
- "What is container reuse?" (An opt-in mode that keeps containers alive between runs for faster local iteration — not for CI.)
- "How did you configure it before Boot 3.1?" (`@DynamicPropertySource` registering the container's URL and credentials as properties.)

#### Edge cases
- Docker unavailable on a developer machine fails every container-backed test.
- ARM machines need images with ARM variants.
- Containers started per test class rather than shared multiply start-up time.

#### Common mistakes
- `latest` tags.
- Containers per test method.
- Version drift between test images and production.

#### Comparisons

| | Testcontainers | Embedded substitute | Shared test environment |
|---|---|---|---|
| Fidelity | High | Low | High |
| Isolation | Per run | Per run | Shared, flaky |
| Setup | Docker | None | Coordination |

#### Frequently confused with
`@ServiceConnection` versus `@DynamicPropertySource`.

#### Important facts to remember
- Real engines, pinned versions — test the exact engine production runs.
- `@ServiceConnection` wires automatically — host, port and credentials come from the container.
- Share containers across the suite — start-up is the dominant cost.

---

### 9.9 Testing Security

#### Definition
Verifying authentication and authorisation rules with `spring-security-test` — `@WithMockUser`, `jwt()` and related post-processors — against your real security configuration.

#### Why it exists
Because access rules are code, and their failures are silent until exploited — a missing rule makes an endpoint work perfectly for everyone, so happy-path tests can never notice it. Only tests that try to get in without permission do.

#### Interview explanation
Describe the three-test pattern per endpoint (401, 403, 2xx) and the importance of loading your real `SecurityFilterChain` in slices. Mention ownership tests with two users, which catch IDOR.

#### Syntax
```java
@WithMockUser(roles = "ADMIN")
mockMvc.perform(get(url).with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
mockMvc.perform(get(url).with(user("alice").roles("USER")))
mockMvc.perform(post(url).with(csrf()))
```

#### Example
```java
@Test
void userCannotReadAnotherUsersOrder() throws Exception {
    when(service.detail(42L)).thenThrow(new AccessDeniedException("not owner"));
    mockMvc.perform(get("/api/orders/42").with(jwt().jwt(j -> j.subject("bob"))))
           .andExpect(status().isForbidden());
}
```

#### Common interview questions
- "How do you test secured endpoints?" (With `spring-security-test` — `@WithMockUser` or `jwt()` post-processors — asserting 401, 403 and success for each protected endpoint.)
- "Why might a security test pass while the endpoint is open?" (The slice loaded default security instead of your configuration, or only the permitted case was tested.)
- "How do you test method security?" (Call the service through the Spring context with a security context established, asserting `AccessDeniedException` for disallowed users.)
- "How do you test CSRF-protected endpoints?" (Add `.with(csrf())`; and test that the request without it is rejected.)

#### Follow-up questions
- "How do you test a custom JWT claim mapping?" (Use `jwt().jwt(builder -> builder.claim(...))` so your converter runs, rather than `@WithMockUser`, which bypasses it.)
- "How do you create a reusable custom user?" (A custom annotation with `@WithSecurityContext` and a factory building the principal.)
- "How do you find unprotected endpoints?" (A test that enumerates all handler mappings and asserts each is explicitly public or rejects anonymous requests.)

#### Edge cases
- `@WithMockUser` skips token parsing, so token-specific bugs need `jwt()`-based tests.
- Security configuration excluded from a slice makes every test pass with default rules.
- Ownership bugs require two distinct identities to detect, because with one user every record is that user's own.

#### Common mistakes
- Only testing the allowed case.
- Disabling security in test profiles.
- Not loading the real security configuration.

#### Comparisons

| | `@WithMockUser` | `jwt()` post-processor |
|---|---|---|
| Token parsing | Bypassed | Exercised via converter |
| Claims | Username and roles | Any claims |
| Best for | Simple role checks | JWT resource servers |

#### Frequently confused with
Testing that an endpoint works versus testing that it is protected.

#### Important facts to remember
- 401, 403, 2xx per endpoint — two of the three are negative tests.
- Load your real security config — the default chain is not yours.
- Two users to catch IDOR.

---

### 9.10 Testing External Calls

#### Definition
Testing HTTP clients against fake servers — `MockRestServiceServer` or WireMock — including error responses, timeouts and malformed payloads.

#### Why it exists
To verify how code handles a dependency's failures, which real dependencies rarely produce on demand.

#### Interview explanation
Argue for stubbing at the HTTP level rather than mocking the client interface, list the failure cases worth testing, and mention contract testing as the defence against stubs drifting from reality.

#### Syntax
```java
@RestClientTest(PaymentClient.class)
@Autowired MockRestServiceServer server;
server.expect(requestTo("/charges")).andRespond(withServerError());

stubFor(get("/rates").willReturn(okJson("{\"eur\": 1.0}")));
stubFor(get("/rates").willReturn(aResponse().withFixedDelay(5000)));
```

#### Example
```java
@Test
void retriesOnceThenFails() {
    stubFor(post("/charges").willReturn(aResponse().withStatus(503)));
    assertThatThrownBy(() -> client.charge(request)).isInstanceOf(PaymentUnavailableException.class);
    verify(2, postRequestedFor(urlEqualTo("/charges")));     // original + one retry
}
```

#### Common interview questions
- "How do you test code that calls an external API?" (Against a fake HTTP server — WireMock or `MockRestServiceServer` — returning prepared responses, including failures.)
- "Why stub at the HTTP level rather than mocking the client?" (Serialisation, status handling and timeouts are exercised only by real HTTP; mocking the interface skips the parts most likely to be wrong.)
- "Which scenarios should be tested?" (Success, 4xx, 5xx, timeouts, malformed bodies, connection failures, and retry and circuit-breaker behaviour.)
- "What is contract testing?" (Verifying that a consumer's expectations match the provider's actual behaviour — Pact or Spring Cloud Contract — so stubs cannot silently drift.)

#### Follow-up questions
- "WireMock or `MockRestServiceServer`?" (`MockRestServiceServer` is lighter and in-process for Spring clients; WireMock is a real server, client-agnostic, and exercises real network behaviour.)
- "How do you test a circuit breaker?" (Stub repeated failures, assert the breaker opens and short-circuits further calls, then stub success and assert it recovers.)
- "How do you avoid port conflicts?" (Dynamic ports with WireMock's JUnit extension, injected into the client's base URL.)

#### Edge cases
- `MockRestServiceServer` only intercepts clients built from the test's builder, because it works by replacing that builder's request factory.
- Timeout tests are slow by nature; keep configured timeouts short in the test profile.
- Recorded stubs go stale as the real API evolves.

#### Common mistakes
- Testing only success responses.
- Mocking the client interface.
- No contract tests between teams.

#### Comparisons

| | `MockRestServiceServer` | WireMock |
|---|---|---|
| Real HTTP | No | Yes |
| Client support | Spring clients | Any |
| Network faults | Limited | Delays, resets, faults |

#### Frequently confused with
Stubbing an API versus contract-testing it.

#### Important facts to remember
- Stub the network, not the client — serialisation and timeouts live in between.
- Test failures and timeouts — the cases the real service rarely produces.
- Contracts prevent stub drift — the provider verifies them too.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 9. Next: Caching & Messaging.*

---

## 10. Caching & Messaging

### Table of Contents (this group)
- [[#10.1 Why Cache]]
- [[#10.2 The Spring Cache Abstraction]]
- [[#10.3 Redis]]
- [[#10.4 Caching Patterns]]
- [[#10.5 Expiry and Invalidation]]
- [[#10.6 Event-Driven Architecture]]
- [[#10.7 Kafka Fundamentals]]
- [[#10.8 Producing Messages]]
- [[#10.9 Consumers and Consumer Groups]]
- [[#10.10 Delivery Semantics and Idempotency]]
- [[#10.11 Retries and Dead-Letter Topics]]

---

### 10.1 Why Cache

#### Definition
Storing copies of data in a faster-to-reach location so repeated reads avoid the cost of the original source.

#### Why it exists
Because many reads repeat the same question, and every repeat makes the source redo work whose answer has not changed. Keeping the answer somewhere faster reduces latency and source load for data read far more often than it changes — at the price of sometimes being out of date.

#### Interview explanation
Frame caching as a trade — speed for staleness and complexity — and say when it pays: read-heavy, expensive, staleness-tolerant data. Then name the cache levels, from in-process to CDN, because the right level depends on the access pattern.

#### Syntax
```java
@EnableCaching
@Cacheable("products")
```
```http
Cache-Control: public, max-age=300
```

#### Example
```text
Product page: 10,000 reads/minute, product changes ~once/day
→ cache hit ratio ≈ 99.99%, database load drops by four orders of magnitude

Shopping cart: read and written per user, rarely re-read by others
→ caching adds complexity for almost no hits
```

#### Common interview questions
- "When should you cache?" (When data is read far more often than it changes, is expensive to produce, and can tolerate brief staleness.)
- "What is a cache hit ratio and why does it matter?" (The fraction of reads served by the cache; it determines whether the cache saves more than it costs.)
- "In-process or distributed cache?" (In-process for tiny, hot, per-instance data with the lowest latency; distributed when instances must share entries or survive restarts.)
- "What are the risks of caching?" (Stale reads, memory pressure, invalidation bugs, and a new failure mode when the cache is unavailable.)

#### Follow-up questions
- "How do you use both levels?" (A two-level cache — Caffeine in front of Redis — for the hottest keys, accepting harder invalidation.)
- "What happens when the cache goes down?" (A cache-aside design degrades to database reads; you must ensure the database can survive that load.)
- "Can HTTP caching replace application caching?" (For public, cacheable responses, a CDN avoids the request entirely — often the biggest win available.)

#### Edge cases
- A cold cache after a deploy can send a thundering herd to the database, because the source was sized for the cached hit ratio.
- Caching per-user data with a shared key leaks data between users, because the cache returns whatever is stored under the key.
- Negative caching (caching "not found") prevents repeated misses but delays visibility of new records.

#### Common mistakes
- Caching without measuring the hit ratio.
- Caching to hide a slow query.
- Including user-specific data under a shared key.

#### Comparisons

| | In-process | Distributed |
|---|---|---|
| Latency | Nanoseconds | Sub-millisecond |
| Shared across instances | No | Yes |
| Survives restart | No | Yes |

#### Frequently confused with
Caching versus memoisation — memoisation is caching a pure function's results by its arguments.

#### Important facts to remember
- Hit ratio decides the value — a question rarely repeated gains nothing.
- Every cache adds staleness — a copy can lag its source.
- Plan for the cache being down — the source must survive the misses.

---

### 10.2 The Spring Cache Abstraction

#### Definition
Annotation-based caching — `@Cacheable`, `@CachePut`, `@CacheEvict`, `@Caching` — applied by a proxy over a pluggable `CacheManager`.

#### Why it exists
Because caching by hand repeats the same key-lookup-store code in every method and ties it to one cache product. An annotation applied by a proxy declares caching on methods without that code, and keeps the cache provider replaceable.

#### Interview explanation
Describe the proxy flow for `@Cacheable`, contrast `@CachePut` (always executes, updates) with `@Cacheable` (skips on hit), and mention `sync = true` for stampede protection plus the inherited proxy limitations.

#### Syntax
```java
@Cacheable(cacheNames = "users", key = "#id", unless = "#result == null")
@CachePut(cacheNames = "users", key = "#user.id")
@CacheEvict(cacheNames = "users", key = "#id")
@CacheEvict(cacheNames = "users", allEntries = true)
@Cacheable(cacheNames = "rates", sync = true)
```

#### Example
```java
@Caching(evict = {
    @CacheEvict(cacheNames = "products", key = "#product.id"),
    @CacheEvict(cacheNames = "productLists", allEntries = true)
})
public Product update(Product product) { ... }
```

#### Common interview questions
- "How does `@Cacheable` work?" (A proxy computes a key from the arguments, returns the cached value on a hit without calling the method, and stores the result on a miss.)
- "What is the difference between `@Cacheable` and `@CachePut`?" (`@Cacheable` skips the method on a hit; `@CachePut` always runs it and updates the cache with the result.)
- "Why might caching not work?" (Self-invocation bypassing the proxy, `private` or `final` methods the proxy cannot override, missing `@EnableCaching`, or keys that differ due to argument `equals`/`hashCode`.)
- "What does `sync = true` do?" (Ensures only one thread per instance computes a missing entry while others wait — local stampede protection.)

#### Follow-up questions
- "How are keys generated by default?" (`SimpleKeyGenerator` combines all arguments; explicit SpEL keys are clearer and safer.)
- "Can you cache conditionally?" (Yes — `condition` decides whether to use the cache at all, `unless` whether to store the result.)
- "Is `@Cacheable` transactional?" (Not by default — a rolled-back transaction can leave a cached value behind. A transaction-aware cache manager, such as `RedisCacheManager` built with `transactionAware()`, defers puts and evictions until the commit.)

#### Edge cases
- Caching mutable objects with an in-process provider shares the instance across callers, so one caller's change alters what every later caller receives.
- `allEntries = true` on a distributed cache can be expensive on large caches.
- Null results are cached unless excluded, which may or may not be desirable.

#### Common mistakes
- Expecting caching on internal calls.
- Mutable cached objects modified by callers.
- Evicting inside a transaction that later rolls back.

#### Comparisons

| | `@Cacheable` | `@CachePut` | `@CacheEvict` |
|---|---|---|---|
| Method runs on hit | No | Yes | Yes |
| Effect | Read-through | Update entry | Remove entry |

#### Frequently confused with
`@Cacheable` versus `@CachePut`.

#### Important facts to remember
- Proxy-based — external calls, on methods the proxy can override.
- `sync` guards one instance only — other instances still load concurrently.
- Explicit keys beat defaults — the default key depends on every argument's `equals`.

---

### 10.3 Redis

#### Definition
An in-memory, single-threaded-execution data store with rich data structures, used as a distributed cache, session store, rate limiter and lightweight broker.

#### Why it exists
To give every instance of a service a shared, very fast store that outlives individual application restarts.

#### Interview explanation
Mention the data structures and their uses, explain why single-threaded command execution makes commands atomic, and raise the two operational must-knows: a memory limit with an eviction policy, and JSON rather than JDK serialisation for cached values.

#### Syntax
```text
SET key value EX 600       GET key           INCR counter
HSET user:42 name Ada      ZADD board 100 a  EXPIRE key 60
SET lock:order:42 token NX PX 30000         # simple lock primitive
```

#### Example
```java
// Fixed-window rate limiter with an atomic increment
public boolean allow(String clientId) {
    var key = "rate:" + clientId + ":" + Instant.now().getEpochSecond() / 60;
    var count = redis.opsForValue().increment(key);
    if (count == 1) redis.expire(key, Duration.ofMinutes(1));
    return count <= 100;
}
```

#### Common interview questions
- "Why is Redis fast?" (Data lives in memory, commands execute on a single thread without locking overhead, and the protocol is simple and efficient.)
- "What data structures does Redis offer?" (Strings, hashes, lists, sets, sorted sets, streams, plus bitmaps and HyperLogLog.)
- "What happens when Redis runs out of memory?" (With `maxmemory` set, the eviction policy removes keys — such as `allkeys-lru`; with `noeviction`, writes fail.)
- "Is Redis durable?" (Optionally — RDB snapshots and AOF logs persist data, but as a cache it should be treated as losable.)

#### Follow-up questions
- "How do you implement a distributed lock with Redis?" (`SET key token NX PX ttl`, releasing only if the token matches; for correctness-critical locking, prefer the database or a consensus system.)
- "Why avoid `KEYS *`?" (It scans the whole keyspace on the single thread, blocking all clients; use `SCAN`.)
- "Why configure JSON serialisation?" (JDK serialisation binds cached values to Java class versions and breaks on refactors; JSON is version-tolerant and readable.)

#### Edge cases
- A single large value or a slow command blocks every other client on the instance, because commands execute one at a time.
- Replication is asynchronous, so a failover can lose recent writes.
- Keys without TTLs accumulate until memory fills.

#### Common mistakes
- No `maxmemory` or eviction policy.
- JDK serialisation of cached values.
- Treating Redis as the system of record.

#### Comparisons

| | Redis | Memcached |
|---|---|---|
| Data structures | Rich | Strings only |
| Persistence | Optional | None |
| Replication | Yes | No (client-side) |

#### Complexity
Most commands are O(1) or O(log n); multi-key operations such as `KEYS` are O(n) and block.

#### Frequently confused with
Redis as a database versus as a cache — same software, different durability expectations.

#### Important facts to remember
- In memory, single-threaded execution — every command atomic; one slow command blocks all.
- Set `maxmemory` and an eviction policy — with no limit Redis grows until the host runs out of memory; with a limit but `noeviction`, writes fail.
- Serialise as JSON — readable, and independent of Java class changes.

---

### 10.4 Caching Patterns

#### Definition
Strategies for coordinating cache and source: cache-aside, read-through, write-through and write-behind.

#### Why it exists
Because a cache beside a database raises one question on every read and write — who fills it, and who keeps it in step with the source? — and different workloads need different trade-offs between freshness, write cost and failure behaviour.

#### Interview explanation
Describe cache-aside as the default and explain why writes should evict rather than update the cache. Then describe the race that remains even with eviction and how a TTL bounds it — that detail shows real understanding.

#### Syntax
```java
// cache-aside, by hand
var cached = cache.get(key);
if (cached != null) return cached;
var value = repository.load(key);
cache.put(key, value, ttl);
return value;
```

#### Example
```java
@Transactional
public void rename(Long id, String name) {
    products.findById(id).orElseThrow().rename(name);
    // evict after commit, not before — see @TransactionalEventListener
    events.publishEvent(new ProductChanged(id));
}
```

#### Common interview questions
- "What is cache-aside?" (The application reads the cache, loads from the source on a miss and stores the result; on write it updates the source and evicts the entry.)
- "Why evict instead of updating the cache on write?" (Concurrent writers updating the cache can interleave and leave the older value; eviction forces the next read to load current data.)
- "What is write-behind and its risk?" (Writes go to the cache and are persisted asynchronously; acknowledged writes are lost if the cache fails first.)
- "Which pattern would you choose by default?" (Cache-aside with eviction on write and a TTL — simple, resilient, and degrades to the source if the cache fails.)

#### Follow-up questions
- "What race remains in cache-aside?" (A reader loads an old value, a writer updates and evicts, then the reader stores the old value — stale until the TTL expires.)
- "What is read-through?" (The cache itself loads missing entries through a configured loader, hiding the miss handling from the application.)
- "When is write-through worth it?" (When reads must almost always hit and writes can afford the extra latency of updating both synchronously.)

#### Edge cases
- Evicting before commit lets a concurrent reader re-cache the old value, because the database still holds it until the commit.
- Caching list queries makes invalidation hard: one changed item invalidates many lists.
- Write-through doubles write latency and couples write success to cache availability.

#### Common mistakes
- Updating the cache rather than evicting.
- Evicting inside the transaction.
- No TTL as a backstop.

#### Comparisons

| | Cache-aside | Write-through | Write-behind |
|---|---|---|---|
| Write cost | Low | Higher | Lowest |
| Read freshness | Eventually | High | High |
| Data-loss risk | None | None | Yes |

#### Frequently confused with
Read-through versus cache-aside — who performs the load on a miss.

#### Important facts to remember
- Cache-aside by default — simplest, and it survives the cache failing.
- Evict on write, after commit — forgetting cannot arrive out of order.
- Always keep a TTL — the safety net for missed evictions.

---

### 10.5 Expiry and Invalidation

#### Definition
Removing cache entries by time (TTL) or by event (invalidation when the source changes), usually combined.

#### Why it exists
Because a cache keeps serving what it stored after the source changes, and usually cannot see the change happen. Expiry and invalidation bound how long it can serve data that is no longer true.

#### Interview explanation
Present TTLs as a staleness bound and invalidation as a freshness improvement, then cover stampedes and their mitigations — `sync`, locks, jitter, refresh-ahead. Interviewers frequently probe the stampede.

#### Syntax
```java
RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10));
@CacheEvict(cacheNames = "products", key = "#id")
@TransactionalEventListener(phase = AFTER_COMMIT)
```

#### Example
```java
// TTL jitter: spread expiries so entries do not all expire together
Duration ttl = Duration.ofMinutes(10).plusSeconds(ThreadLocalRandom.current().nextInt(0, 120));
```

#### Common interview questions
- "How do you keep a cache fresh?" (Invalidate on change where possible, and keep a TTL as an upper bound on staleness in case invalidation misses.)
- "What is a cache stampede?" (Many requests missing on the same expired key simultaneously and all loading it from the source.)
- "How do you prevent a stampede?" (Single-flight loading — `sync = true` or a distributed lock — TTL jitter, and refreshing hot entries before expiry.)
- "How do you invalidate across instances with in-process caches?" (Broadcast evictions through pub/sub or a message topic, or use a shared distributed cache.)

#### Follow-up questions
- "How do you choose a TTL?" (From the business tolerance for staleness — exchange rates might tolerate a minute, permissions far less.)
- "What is refresh-ahead?" (Refreshing an entry asynchronously before it expires, so readers never see a miss on hot keys.)
- "Why evict after commit?" (Evicting before commit lets a concurrent read reload and re-cache the pre-commit value.)

#### Edge cases
- Lost invalidation messages leave entries stale until TTL — which is why the TTL stays as a backstop.
- Very short TTLs reduce staleness but also the hit ratio, sometimes to the point of uselessness.
- Negative-cached "not found" entries hide newly created records until expiry.

#### Common mistakes
- No TTL because "we invalidate".
- Identical TTLs on bulk-loaded entries.
- Invalidating before the transaction commits.

#### Comparisons

| | TTL | Event invalidation |
|---|---|---|
| Staleness bound | Fixed | Near-zero when it works |
| Coordination | None | Required |
| Failure mode | Stale until expiry | Stale until TTL backstop |

#### Frequently confused with
Eviction (removing due to memory pressure) versus invalidation (removing due to change).

#### Important facts to remember
- TTL bounds staleness — the maximum time you accept being wrong.
- Invalidate after commit — before it, readers can re-cache the old value.
- Jitter and single-flight against stampedes — spread the expiries, load each key once.

---

### 10.6 Event-Driven Architecture

#### Definition
An architecture in which services publish events about facts that occurred and other services react asynchronously, decoupled through a broker.

#### Why it exists
To decouple services in time and knowledge, so producers need not know consumers and consumers can be offline without losing work.

#### Interview explanation
Distinguish events from commands, list the gains (decoupling, buffering, extensibility) and the costs (eventual consistency, debugging, idempotency, schema coupling). A balanced answer is the senior answer here.

#### Syntax
```java
public record OrderPlaced(UUID eventId, Long orderId, Long customerId, Instant occurredAt) { }
kafka.send("orders.events", orderId.toString(), new OrderPlaced(...));
```

#### Example
```text
Synchronous chain:  Order → Billing → Inventory → Email   (one slow service slows all)
Event-driven:       Order → "OrderPlaced" → {Billing, Inventory, Email} independently
```

#### Common interview questions
- "What is the difference between an event and a command?" (An event states something happened and may have many consumers; a command requests an action from one specific handler.)
- "What are the benefits of event-driven architecture?" (Loose coupling, independent scaling and deployment, buffering of load spikes, and tolerance of consumer downtime.)
- "What are the costs?" (Eventual consistency, harder end-to-end debugging, duplicate handling, and schema evolution across teams.)
- "When would you not use events?" (When the caller needs an immediate answer, or when strong consistency across the operation is required.)

#### Follow-up questions
- "How do you trace a flow across services?" (Propagate trace context in message headers so distributed tracing links the producer and every consumer.)
- "How do you evolve event schemas?" (Additive, backwards-compatible changes enforced by a schema registry; breaking changes become a new event type or version.)
- "What is event sourcing?" (Storing state as the sequence of events that produced it — a different and larger commitment than merely publishing events.)

#### Edge cases
- Events published before commit can describe changes that were rolled back.
- Consumers receiving events out of order across keys must not assume global ordering, because ordering exists only within a partition.
- Fat events (full state) ease consumers but couple them to the producer's model.

#### Common mistakes
- Using events for request/response.
- Publishing before commit.
- Breaking schema changes without versioning.

#### Comparisons

| | Synchronous calls | Events |
|---|---|---|
| Coupling | Runtime | Schema |
| Consistency | Immediate | Eventual |
| Failure isolation | Low | High |

#### Frequently confused with
Event-driven architecture versus event sourcing.

#### Important facts to remember
- Events are facts, commands are requests — past tense versus imperative.
- Expect eventual consistency — consumers catch up later.
- Version event schemas — consumers upgrade on their own schedule.

---

### 10.7 Kafka Fundamentals

#### Definition
A distributed, replicated, append-only log organised into topics and partitions, where consumers track their own offsets and records persist according to retention, not consumption.

#### Why it exists
Because events need a home that is durable, fast and readable by many independent consumers at their own pace — including ones added later that want to replay history. An append-only log that is read rather than consumed provides high-throughput, replayable streams for exactly that.

#### Interview explanation
Explain topic, partition, offset and consumer group, then the key guarantee — ordering per partition only — and why the key decides it. Mention replication with `acks=all` and `min.insync.replicas`, and KRaft replacing ZooKeeper.

#### Syntax
```bash
kafka-topics.sh --create --topic orders --partitions 12 --replication-factor 3
kafka-consumer-groups.sh --describe --group billing      # lag per partition
```

#### Example
```text
Topic "orders", 3 partitions, key = orderId
  order 42 events → always partition hash(42) % 3 → ordered relative to each other
  order 42 vs order 43 → possibly different partitions → no relative ordering
```

#### Common interview questions
- "What is the difference between Kafka and a traditional message queue?" (Kafka is a durable log: records are retained after reading, consumers track offsets and can replay, and many groups read the same data independently.)
- "What ordering does Kafka guarantee?" (Order within a partition only; same-key records go to the same partition, so per-key order holds.)
- "What is a partition and why does it matter?" (A shard of a topic — the unit of ordering, parallelism and replication; consumer parallelism is capped at the partition count.)
- "What is an offset?" (A record's sequential position in a partition; consumer groups commit offsets to record progress.)

#### Follow-up questions
- "How does replication ensure durability?" (Each partition has a leader and followers; with `acks=all` and `min.insync.replicas=2`, writes are acknowledged only once replicated.)
- "What replaced ZooKeeper?" (KRaft, Kafka's built-in Raft-based metadata quorum; ZooKeeper mode was removed in Kafka 4.0.)
- "What is log compaction?" (A retention mode keeping only the latest record per key — useful for changelog topics representing current state.)

#### Edge cases
- Increasing partitions changes key-to-partition mapping, breaking ordering for affected keys, because the partition is chosen by hashing the key over the partition count.
- A partition leader failure triggers election; unclean leader election can lose data.
- Retention deletes data regardless of whether every consumer has read it.

#### Common mistakes
- Too few partitions.
- Assuming global ordering.
- Treating Kafka as a work queue with per-message acknowledgement.

#### Comparisons

| | Kafka | RabbitMQ |
|---|---|---|
| Model | Distributed log | Message broker / queues |
| Replay | Yes | Not by default |
| Ordering | Per partition | Per queue |
| Best for | Event streams, high throughput | Task queues, routing |

#### Frequently confused with
Partitions versus replicas — parallelism versus redundancy.

#### Important facts to remember
- Order per partition, chosen by key.
- Partitions cap consumer parallelism — one consumer per partition per group.
- KRaft, no ZooKeeper, from 4.0.

---

### 10.8 Producing Messages

#### Definition
Publishing records to a topic — in Spring with `KafkaTemplate` — choosing a key for partitioning and configuring acknowledgements, idempotence, batching and serialisation.

#### Why it exists
Because producer settings determine durability, ordering and compatibility for every downstream consumer.

#### Interview explanation
Cover the key as the ordering decision, `acks=all` plus idempotence for durability without duplicates, and the asynchronous nature of `send` — the future must be handled or failures vanish.

#### Syntax
```yaml
spring:
  kafka:
    producer:
      acks: all
      properties:
        enable.idempotence: true
        linger.ms: 5
        compression.type: zstd
```
```java
kafka.send("orders", key, event).whenComplete((r, ex) -> { ... });
```

#### Example
```java
// Synchronous send when the caller must know it was stored
kafka.send("audit", key, event).get(5, TimeUnit.SECONDS);   // blocks; use sparingly
```

#### Common interview questions
- "How does Kafka decide the partition for a record?" (By hashing the key; records without a key are spread across partitions.)
- "What does `acks=all` mean?" (The leader waits for all in-sync replicas to persist the record before acknowledging.)
- "What is an idempotent producer?" (The broker deduplicates retried sends using producer ids and sequence numbers, preventing duplicates from producer retries; enabled by default since Kafka 3.0.)
- "Is `KafkaTemplate.send` synchronous?" (No — it returns a future; failures surface only through it.)

#### Follow-up questions
- "How do you publish atomically with a database write?" (The outbox pattern — Kafka transactions do not include your database.)
- "Why use a schema registry?" (To enforce compatible schema evolution so producers cannot break existing consumers.)
- "How do batching settings affect latency?" (`linger.ms` waits briefly to fill batches, trading milliseconds of latency for much higher throughput.)

#### Edge cases
- Idempotence prevents duplicates from producer retries, not from your application sending twice, because each `send` call is a new record to the broker.
- A full producer buffer blocks `send` for `max.block.ms`, then throws.
- Large records beyond `max.request.size` are rejected entirely.

#### Common mistakes
- Ignoring the send future.
- No key for order-sensitive events.
- `acks=1` for data that must not be lost.

#### Comparisons

| `acks` | Durability | Latency |
|---|---|---|
| `0` | None | Lowest |
| `1` | Leader only | Low |
| `all` | All in-sync replicas | Higher |

#### Frequently confused with
Producer idempotence versus consumer idempotency.

#### Important facts to remember
- Key decides partition and order.
- `acks=all` + idempotence — durable writes, no retry duplicates.
- Handle the future — a send can fail after the call returns.

---

### 10.9 Consumers and Consumer Groups

#### Definition
Processes reading topics — `@KafkaListener` in Spring — coordinated into groups that divide partitions among members and track progress through committed offsets.

#### Why it exists
To scale processing horizontally and fail over automatically, while letting independent applications each read the full stream.

#### Interview explanation
Explain partition assignment and the partition cap on parallelism, offset commits and why crashes cause redelivery, and rebalances triggered by slow processing. Consumer lag as the key metric rounds it out.

#### Syntax
```java
@KafkaListener(topics = "orders", groupId = "billing", concurrency = "4")
void listen(OrderPlaced event) { }

@KafkaListener(topics = "orders", groupId = "billing", batch = "true")
void listenBatch(List<OrderPlaced> events) { }
```

#### Example
```yaml
spring:
  kafka:
    consumer:
      group-id: billing
      auto-offset-reset: earliest
      properties:
        max.poll.interval.ms: 300000
        partition.assignment.strategy: org.apache.kafka.clients.consumer.CooperativeStickyAssignor
```

#### Common interview questions
- "What is a consumer group?" (A set of consumers sharing a group id among which a topic's partitions are divided, so each record is processed by one member.)
- "What limits a group's parallelism?" (The number of partitions — extra consumers beyond that are idle.)
- "What is a rebalance and what triggers it?" (Reassignment of partitions when members join, leave or are considered dead — for example by exceeding `max.poll.interval.ms`.)
- "What is consumer lag?" (The difference between the latest offset and the group's committed offset — how far behind processing is.)

#### Follow-up questions
- "What does `auto-offset-reset` control?" (Where a group with no committed offset starts — `earliest` reads history, `latest` only new records.)
- "How do you reduce rebalance impact?" (Cooperative sticky assignment, static membership with `group.instance.id`, and keeping processing well within the poll interval.)
- "When would you use batch listeners?" (When records can be processed more efficiently together — bulk database writes — accepting more complex error handling.)

#### Edge cases
- A crash after processing but before commit redelivers records, because the committed offset still points before them.
- `concurrency` above the partition count creates idle threads.
- Rebalances during long processing can cause the same record to be processed by two consumers.

#### Common mistakes
- Slow remote calls per record causing rebalance storms.
- More consumers than partitions.
- Not monitoring lag.

#### Comparisons

| | Same group | Different groups |
|---|---|---|
| Records divided | Yes | No — each group gets all |
| Use | Scaling one application | Several applications reading the stream |

#### Frequently confused with
Consumer concurrency versus partition count.

#### Important facts to remember
- Partitions cap parallelism.
- Crashes cause redelivery — from the last committed offset.
- Lag is the key metric — it shows whether consumers keep up.

---

### 10.10 Delivery Semantics and Idempotency

#### Definition
The guarantees on how many times a message is processed — at most once, at least once, exactly once — and the idempotency consumers need under at-least-once.

#### Why it exists
Because failures between processing and acknowledgement make loss or duplication unavoidable without careful design.

#### Interview explanation
Tie each guarantee to commit timing, explain that Kafka's exactly-once is limited to Kafka-to-Kafka processing, and show an idempotent consumer with a processed-event table in the same transaction as the side effect.

#### Syntax
```yaml
spring:
  kafka:
    producer:
      transaction-id-prefix: tx-        # enables Kafka transactions
    consumer:
      isolation-level: read_committed
```

#### Example
```sql
CREATE TABLE processed_events (event_id UUID PRIMARY KEY, processed_at TIMESTAMPTZ NOT NULL);
-- insert in the same transaction as the side effect; a duplicate violates the key
```

#### Common interview questions
- "What delivery guarantee does Kafka give by default?" (At-least-once when offsets are committed after processing — so duplicates are possible after failures.)
- "What is an idempotent consumer?" (One whose processing of a duplicate message has no additional effect, typically via deduplication by event id or naturally idempotent writes.)
- "Does exactly-once mean my database is updated exactly once?" (No — Kafka's exactly-once covers read-process-write within Kafka; external side effects still need idempotency.)
- "How do you deduplicate?" (Record processed event ids in the same database transaction as the effect, or use upserts and unique constraints keyed by business identity.)

#### Follow-up questions
- "When is at-most-once acceptable?" (For data where loss is tolerable and duplicates are worse — some metrics and telemetry.)
- "How long do you keep deduplication records?" (Longer than the maximum redelivery window; then prune them on a schedule.)
- "What are naturally idempotent operations?" ("Set status to PAID" or an upsert is idempotent; "add 10 to balance" is not.)

#### Edge cases
- Deduplication outside the effect's transaction can mark an event processed when the effect rolled back.
- Event ids must be generated by the producer, not the consumer, to be stable across redeliveries.
- Rebalances can deliver the same record to two consumers concurrently, so deduplication must be concurrency-safe.

#### Common mistakes
- Non-idempotent increments in consumers.
- Deduplication in a separate transaction.
- Assuming exactly-once covers external systems.

#### Comparisons

| | At most once | At least once | Exactly once (Kafka) |
|---|---|---|---|
| Loss | Possible | No | No |
| Duplicates | No | Possible | No, within Kafka |
| Cost | Lowest | Low | Highest |

#### Frequently confused with
Producer idempotence (broker deduplicates retries) versus consumer idempotency (your code tolerates duplicates).

#### Important facts to remember
- At-least-once is the practical default — commit after processing.
- Make consumers idempotent — the second delivery must change nothing.
- Exactly-once stops at Kafka's edge — external side effects are outside its transactions.

---

### 10.11 Retries and Dead-Letter Topics

#### Definition
Handling failed records by retrying with back-off and, when retries are exhausted or the failure is permanent, publishing them to a dead-letter topic for inspection and replay.

#### Why it exists
So a single failing record cannot block a partition indefinitely, while transient failures still recover automatically.

#### Interview explanation
Contrast blocking retries (order preserved, partition held) with non-blocking `@RetryableTopic` (partition freed, order lost), classify exceptions as retryable or not, and mention poison pills and `ErrorHandlingDeserializer`.

#### Syntax
```java
@RetryableTopic(attempts = "4", backoff = @Backoff(delay = 1000, multiplier = 2.0),
                exclude = ValidationException.class)
@KafkaListener(topics = "orders")
void listen(OrderPlaced event) { }

@DltHandler
void deadLetter(OrderPlaced event, @Header(KafkaHeaders.EXCEPTION_MESSAGE) String error) { }
```

#### Example
```yaml
spring:
  kafka:
    consumer:
      key-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JsonDeserializer
```

#### Common interview questions
- "What is a dead-letter topic?" (A topic receiving records that could not be processed after retries, with failure details in headers, so they can be inspected and replayed.)
- "What is a poison pill?" (A record that always fails — often undeserialisable — which can block its partition indefinitely without proper error handling.)
- "What is the difference between blocking and non-blocking retries?" (Blocking retries hold the partition and preserve order; non-blocking retries via retry topics free the partition but break per-key ordering.)
- "Which failures should not be retried?" (Permanent ones — validation errors, deserialisation failures, business rule violations — which go straight to the dead-letter topic.)

#### Follow-up questions
- "How do you replay dead-lettered records?" (A tool or job that republishes them to the original topic after the cause is fixed, preserving ordering concerns.)
- "How do you know something went to the DLT?" (Alert on dead-letter topic message rate — a non-empty DLT is an incident signal.)
- "Why is ordering a concern with retry topics?" (A retried record is processed after later records for the same key, so consumers relying on order may apply them in the wrong sequence.)

#### Edge cases
- Retrying non-idempotent processing can apply effects more than once.
- Infinite retries on a permanent error stall the partition indefinitely, because every later record waits behind it.
- DLT records need the original key to preserve partitioning on replay.

#### Common mistakes
- No `ErrorHandlingDeserializer`.
- Retrying permanent failures.
- An unmonitored DLT.

#### Comparisons

| | Blocking retry | `@RetryableTopic` |
|---|---|---|
| Partition held | Yes | No |
| Ordering preserved | Yes | No |
| Throughput during failures | Reduced | Maintained |

#### Frequently confused with
Retry topics versus the dead-letter topic.

#### Important facts to remember
- Classify retryable versus permanent — retrying a bad message only delays the inevitable.
- Guard against poison pills — `ErrorHandlingDeserializer`.
- Alert on the DLT — every record there is work that did not happen.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 10. Next: Packaging, Deployment & Observability.*

---

## 11. Packaging, Deployment & Observability

### Table of Contents (this group)
- [[#11.1 Containerising the Application]]
- [[#11.2 Docker Compose for Local Environments]]
- [[#11.3 API Documentation with OpenAPI]]
- [[#11.4 API Versioning]]
- [[#11.5 Pagination, Sorting and Filtering]]
- [[#11.6 Logging]]
- [[#11.7 Spring Boot Actuator]]
- [[#11.8 Health Checks and Probes]]
- [[#11.9 Metrics with Micrometer]]
- [[#11.10 Distributed Tracing]]
- [[#11.11 Configuration and Secrets]]

---

### 11.1 Containerising the Application

#### Definition
Packaging a Spring Boot application and its Java runtime into an OCI container image, configured so the JVM respects container limits and shuts down cleanly.

#### Why it exists
Because an application's behaviour depends on its runtime as well as its code, and differing machines make the same build behave differently. An image ships both together as one immutable artifact that behaves identically across environments — and that container platforms can schedule, scale and replace.

#### Interview explanation
Cover three things: how the image is built (layered Dockerfile or buildpacks, multi-stage, small JRE base, non-root), how the JVM behaves in a container (memory percentage, CPU limits), and how the process stops (exec-form entrypoint so `SIGTERM` reaches Java, graceful shutdown bounded by a timeout shorter than the platform's grace period).

#### Syntax
```dockerfile
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "application.jar"]
```
```bash
java -Djarmode=tools -jar app.jar extract --layers --destination extracted
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=shop/orders:1.4.2
```
```yaml
server:
  shutdown: graceful                     # default from Boot 3.4
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s      # below Kubernetes' 30s grace period
```

#### Example
```text
Container limit: 1 GiB
Default JVM max heap: 256 MiB (25%)   → most of the paid memory unused
-XX:MaxRAMPercentage=75: 768 MiB heap → ~256 MiB left for metaspace, threads, buffers
-Xmx1g: heap alone may reach the limit → kernel OOM kill, exit code 137
```

#### Common interview questions
- "How do you write a good Dockerfile for Spring Boot?" (Multi-stage, a JRE base, the jar extracted into layers ordered by change frequency, a non-root user, and an exec-form entrypoint with memory flags.)
- "Why split the jar into layers?" (Dependencies rarely change, so their layer is cached and reused; a code change rebuilds and pushes only the small application layer.)
- "How does the JVM size its heap in a container?" (It reads the cgroup memory limit and defaults the maximum heap to 25% of it; `MaxRAMPercentage` adjusts that.)
- "What happens when Kubernetes stops a pod?" (It sends `SIGTERM`, waits the grace period — 30 seconds by default — then sends `SIGKILL`; graceful shutdown must finish within that window.)

#### Follow-up questions
- "What is exit code 137?" (128 plus signal 9: the process was killed with `SIGKILL`, typically by the kernel's OOM killer or after the grace period expired.)
- "Why does the shell form of `ENTRYPOINT` cause problems?" (`sh` becomes PID 1 and may not forward `SIGTERM`, so the JVM is killed abruptly when the grace period ends.)
- "Buildpacks or Dockerfile?" (Buildpacks give a well-configured layered image with no Dockerfile to maintain; a Dockerfile gives full control for unusual requirements.)

#### Edge cases
- A CPU limit below one core leaves the JVM with a single GC thread and a tiny common pool, because the JVM sizes its thread pools from the CPUs it is allowed to use.
- `-Xmx` and `MaxRAMPercentage` together: an explicit `-Xmx` wins.
- Native images start fast but lose some dynamic features unless reachability metadata is supplied, because everything reflective must be known at build time.

#### Common mistakes
- Running as root.
- Using a full JDK base image for runtime.
- Setting the heap equal to the container limit.

#### Comparisons

| | Fat jar in one layer | Layered jar | Native image |
|---|---|---|---|
| Rebuild after code change | Whole jar | Application layer only | Full native compile |
| Start-up | Seconds | Seconds | Milliseconds |
| Peak throughput | Full JIT | Full JIT | Usually lower |

#### Frequently confused with
Container memory limit versus JVM heap — the heap is only one part of the process's memory.

#### Important facts to remember
- Default max heap is 25% of the container limit — most of the box goes unused without `MaxRAMPercentage`.
- Exec-form entrypoint so Java receives `SIGTERM`.
- Graceful shutdown is the default from Boot 3.4.

---

### 11.2 Docker Compose for Local Environments

#### Definition
Spring Boot's Docker Compose support (Boot 3.1+) starts the services in `compose.yaml` when the application starts and wires connection details to them automatically.

#### Why it exists
Because every developer otherwise installs and wires the database, cache and broker by hand, slightly differently. One checked-in file and one command give everyone the same local infrastructure, without hand-written connection properties.

#### Interview explanation
Explain the flow — find the compose file, `docker compose up`, recognise known images, create `ConnectionDetails` beans that override connection properties — then contrast it with Testcontainers at development time and stress that the module is a development-only dependency.

#### Syntax
```yaml
spring:
  docker:
    compose:
      file: infra/compose.yaml
      lifecycle-management: start-only     # leave containers running between restarts
```
```yaml
services:
  legacy-db:
    image: postgres:16-alpine
    labels:
      org.springframework.boot.ignore: true  # do not create a connection for this one
```

#### Example
```java
// Testcontainers alternative, in src/test/java
@TestConfiguration(proxyBeanMethods = false)
class LocalContainers {
    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgres() { return new PostgreSQLContainer<>("postgres:16-alpine"); }
}

public class TestOrdersApplication {
    public static void main(String[] args) {
        SpringApplication.from(OrdersApplication::main).with(LocalContainers.class).run(args);
    }
}
```

#### Common interview questions
- "How do you run a Spring Boot app locally with its dependencies?" (Docker Compose support with a `compose.yaml`, or Testcontainers through a test-scoped `main` method — both create service connections automatically.)
- "How does Boot know how to connect to the containers?" (It recognises well-known images and creates `ConnectionDetails` beans with the mapped host and port, which take precedence over connection properties.)
- "Should Compose support be in the production jar?" (No — declare it optional or `developmentOnly` so it is not packaged; the Maven plugin also excludes it by default.)
- "Why pin image versions?" (So every developer and CI run the same versions, matching production as closely as possible.)

#### Follow-up questions
- "What about a custom image Boot does not recognise?" (Label it with `org.springframework.boot.service-connection` naming the service type it is compatible with.)
- "Does it run during tests?" (Skipped by default; tests use Testcontainers or slices instead.)
- "Compose or Testcontainers for local development?" (Either; Testcontainers shares container definitions with integration tests, which avoids maintaining two descriptions.)

#### Edge cases
- Ports declared without a host port get random host ports, which Boot discovers — no collisions between projects.
- `start-only` leaves containers running after the app stops, which speeds restarts but accumulates containers.
- Containers that need initialisation scripts must finish before the app connects; healthchecks in Compose help.

#### Common mistakes
- `latest` tags.
- Packaging the module in production builds.
- Duplicating connection properties that Compose support already provides.

#### Comparisons

| | Docker Compose support | Testcontainers dev-time |
|---|---|---|
| Definition | YAML | Java |
| Reused in tests | No | Yes |
| Requires | Docker Compose CLI | Docker |

#### Frequently confused with
Docker Compose support versus deploying with Compose — the Boot feature is for local development, not a production deployment mechanism.

#### Important facts to remember
- Boot 3.1+.
- Development-only dependency — it must never start containers in production.
- `ConnectionDetails` beans override connection properties.

---

### 11.3 API Documentation with OpenAPI

#### Definition
OpenAPI is a language-neutral specification for describing HTTP APIs; springdoc-openapi generates that description from Spring MVC or WebFlux controllers and serves Swagger UI.

#### Why it exists
Because hand-written API documentation drifts from the code it describes. Generating a machine-readable description from the code keeps it accurate — and the same source enables interactive exploration, generated clients and contract tests.

#### Interview explanation
Say what springdoc does — reads mappings, types and validation annotations to produce `/v3/api-docs` — then discuss code-first versus contract-first, the role of annotations for what code cannot express, and how the document is used beyond documentation: client generation and breaking-change detection in CI.

#### Syntax
```java
@Operation(summary = "Get an order", description = "Returns 404 if the order does not exist")
@ApiResponse(responseCode = "200", description = "Found")
@ApiResponse(responseCode = "404", description = "Not found")
@Parameter(name = "id", description = "Order id", example = "42")
@Schema(description = "Order total in minor units", example = "12999")
```
```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    enabled: false        # e.g. in production profiles
```

#### Example
```java
@Bean
OpenAPI ordersApi() {
    return new OpenAPI()
        .info(new Info().title("Orders API").version("v1"))
        .components(new Components().addSecuritySchemes("bearer",
            new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
        .addSecurityItem(new SecurityRequirement().addList("bearer"));
}
```

#### Common interview questions
- "How do you document a Spring Boot REST API?" (springdoc-openapi generates an OpenAPI 3 document from the controllers, enriched with `@Operation`, `@ApiResponse` and `@Schema` where needed, and serves Swagger UI.)
- "What is the difference between OpenAPI and Swagger?" (OpenAPI is the specification; Swagger is the tooling family — Swagger UI, Swagger Editor — originally behind it.)
- "Code-first or contract-first?" (Code-first is quicker for internal APIs; contract-first suits public or cross-team APIs where the contract must be designed and reviewed before implementation.)
- "How do you document JWT authentication?" (Declare a bearer security scheme in an `OpenAPI` bean and apply it globally or per operation.)

#### Follow-up questions
- "How do you detect breaking API changes?" (Generate the document in CI and compare it with the previous release using an OpenAPI diff tool, failing the build on breaking changes.)
- "Does springdoc understand Bean Validation?" (Yes — constraints such as `@NotNull` and `@Size` are reflected as required fields and length limits in the schema.)
- "Should Swagger UI be enabled in production?" (For public APIs a published portal is better; for internal APIs it is commonly disabled or secured.)

#### Edge cases
- Generic or `Object` return types produce empty schemas.
- Polymorphic types need `@Schema(oneOf = ...)` or Jackson subtype annotations to document correctly.
- Endpoints behind security still appear in the document unless filtered.

#### Common mistakes
- Using Springfox with Boot 3.
- Returning `Map<String, Object>` and expecting useful documentation.
- Hand-maintaining documentation separate from the code.

#### Comparisons

| | springdoc-openapi | Springfox |
|---|---|---|
| Spring Boot 3 support | Yes | No |
| OpenAPI version | 3.x | Mainly 2.0 |
| Maintained | Yes | No |

#### Frequently confused with
API documentation versus API contract testing — documentation describes; contract tests verify that the implementation honours the description.

#### Important facts to remember
- `/v3/api-docs` and `/swagger-ui.html`.
- springdoc 2.x for Boot 3.x.
- Springfox is dead.

---

### 11.4 API Versioning

#### Definition
A scheme for running multiple incompatible versions of an API contract side by side so clients can migrate on their own schedule.

#### Why it exists
Because breaking changes are sometimes unavoidable, and clients — mobile apps especially — cannot all upgrade at the moment the server does. So incompatible contracts must coexist for a while, and retiring one must be a deliberate, announced step.

#### Interview explanation
Start by distinguishing breaking from non-breaking changes, because most changes should not need a new version. Then compare strategies — path, header, media type — and say how Spring supports them: by hand through path prefixes and mapping conditions in Boot 3.x, natively through the `version` mapping attribute from Spring Framework 7. Finish with the deprecation lifecycle: announce, signal with headers, monitor usage, remove.

#### Syntax
```java
// Spring Framework 6 / Boot 3.x: mapping conditions
@GetMapping(path = "/orders/{id}", headers = "X-API-Version=2")
@GetMapping(path = "/orders/{id}", produces = "application/vnd.shop.v2+json")
```
```java
// Spring Framework 7 / Boot 4: first-class versioning
@GetMapping(path = "/orders/{id}", version = "2")
```

#### Example
```http
HTTP/1.1 200 OK
Deprecation: @1767225600
Sunset: Fri, 01 Jan 2027 00:00:00 GMT
Link: </api/v2/orders>; rel="successor-version"
```

#### Common interview questions
- "How do you version a REST API?" (Usually in the URL path for simplicity and visibility, or via a header or media type; version only for breaking changes and keep the versioning at the controller and DTO layer.)
- "What counts as a breaking change?" (Removing or renaming fields, changing types or semantics, new required inputs, and changed status codes or error formats.)
- "How do you retire an old version?" (Announce a date, send deprecation and sunset headers, track traffic per version, contact remaining clients, then remove it.)
- "Does Spring support API versioning?" (Natively from Spring Framework 7 and Boot 4; on Boot 3.x it is done with path prefixes or `headers`/`produces` mapping conditions.)

#### Follow-up questions
- "How do you avoid duplicating logic across versions?" (Separate controllers and DTOs per version mapping onto one service and domain model.)
- "Why should clients ignore unknown fields?" (So additive changes are non-breaking — the tolerant reader principle; Boot's Jackson setup does not fail on unknown properties by default.)
- "How long do you keep old versions?" (As long as the published policy promises — often six to twelve months for external clients — informed by real usage metrics.)

#### Edge cases
- Mobile clients may never upgrade, so some versions live far longer than planned.
- A header-versioned API needs a defined default when the header is absent, because older clients never send it.
- Caches and CDNs must vary on the version header if it selects the response, or one version's response is served to another version's clients.

#### Common mistakes
- Versioning every change.
- Copying the whole service layer per version.
- Removing a version without measuring who still uses it.

#### Comparisons

| | Path | Header | Media type |
|---|---|---|---|
| Visible in URLs and logs | Yes | No | No |
| Easy for browsers and curl | Yes | Moderate | Awkward |
| Caching | Simple | Needs `Vary` | Needs `Vary` |

#### Frequently confused with
API versioning versus artifact versioning — the API version is the contract clients see; the application's release version changes far more often.

#### Important facts to remember
- Additive changes need no new version — tolerant readers ignore unknown fields.
- Version at the edge, not the domain.
- Native support arrives with Spring Framework 7.

---

### 11.5 Pagination, Sorting and Filtering

#### Definition
Techniques for returning bounded, ordered and narrowed subsets of a collection, supported in Spring Data through `Pageable`, `Sort`, `Page`, `Slice`, keyset scrolling and `Specification`s.

#### Why it exists
Because an endpoint returning every row is fine with a hundred rows and an outage with a million, while its code never changes. Paging, sorting and filtering in the database keep response size, memory and query cost bounded regardless of how large the data grows.

#### Interview explanation
Explain `Pageable` binding and what `Page` costs (the count query), contrast offset with keyset pagination and explain why offset degrades with depth, mention stable ordering with a unique tie-breaker, and describe how dynamic filters are built safely with `Specification`s.

#### Syntax
```java
Page<Order> findByStatus(OrderStatus status, Pageable pageable);
Slice<Order> findByCustomerId(Long customerId, Pageable pageable);
Window<Order> findFirst20ByStatusOrderByCreatedAtDescIdDesc(OrderStatus status, ScrollPosition position);
```
```yaml
spring:
  data:
    web:
      pageable:
        default-page-size: 20
        max-page-size: 100
```

#### Example
```java
// keyset scrolling (Spring Data 3.1+)
Window<Order> first = repository.findFirst20ByStatusOrderByCreatedAtDescIdDesc(
        OrderStatus.PLACED, ScrollPosition.keyset());
Window<Order> next = repository.findFirst20ByStatusOrderByCreatedAtDescIdDesc(
        OrderStatus.PLACED, first.positionAt(first.size() - 1));
```

#### Common interview questions
- "How do you paginate in Spring Data?" (Accept a `Pageable` in the controller and repository method; return `Page` when a total is needed or `Slice` when only "has next" matters.)
- "Why is offset pagination slow for deep pages?" (The database must read and discard every row before the offset, so cost grows with page depth.)
- "What is keyset pagination?" (Paging by the last seen sort key — `WHERE (created_at, id) < (?, ?)` — so the database seeks via an index regardless of depth.)
- "How do you implement dynamic filters?" (Compose JPA `Specification`s or Querydsl predicates, adding only the conditions that are present.)

#### Follow-up questions
- "Why add `id` to the sort?" (A non-unique sort key gives an unstable order, so rows can repeat or disappear across pages.)
- "How do you avoid the `COUNT` query?" (Return `Slice` or a keyset `Window`, or cache or approximate the total.)
- "Can `Pageable` be combined with fetch joins?" (Collection fetch joins with pagination make Hibernate paginate in memory and warn; fetch ids first or use entity graphs carefully.)

#### Edge cases
- Without a max page size, `?size=1000000` loads the table.
- Concurrent inserts shift offset pages; keyset pages stay stable — offsets count positions, keysets anchor to rows.
- Keyset pagination cannot jump to an arbitrary page number.

#### Common mistakes
- Unbounded `findAll()` endpoints.
- Sorting on unindexed columns.
- Serialising `PageImpl` directly as the API contract.

#### Comparisons

| | Offset | Keyset |
|---|---|---|
| Jump to page N | Yes | No |
| Cost at depth | Grows linearly | Constant with an index |
| Stable under inserts | No | Yes |

#### Complexity
Offset pagination costs roughly O(offset + size) rows read; keyset pagination with a matching index costs O(log n + size).

#### Frequently confused with
`Page` versus `Slice` — both page, but only `Page` runs a count query to know the total.

#### Important facts to remember
- Cap the page size.
- Unique tie-breaker in every sort — equal values otherwise have no defined order.
- Keyset for deep or large data sets.

---

### 11.6 Logging

#### Definition
Recording application events through the SLF4J facade, implemented by Logback by default in Spring Boot, with levels, appenders and patterns configured externally.

#### Why it exists
Because nobody can attach a debugger to production: what the application wrote down while running is the only record of what it did. Logging makes behaviour observable after the fact — for debugging, auditing and incident investigation.

#### Interview explanation
Explain the facade and backend split, level inheritance by package, parameterised messages, and logging exceptions with the throwable as the last argument. Then cover production concerns: structured JSON output (built in from Boot 3.4), correlation through the MDC and trace ids, runtime level changes through actuator, and never logging secrets or unnecessary personal data.

#### Syntax
```java
private static final Logger log = LoggerFactory.getLogger(OrderService.class);
log.debug("pricing order={} lines={}", id, lines.size());
log.error("refund failed orderId={}", id, ex);
MDC.put("tenantId", tenantId);
```
```yaml
logging:
  level:
    com.example: INFO
  structured:
    format:
      console: ecs           # ecs, logstash or gelf (Boot 3.4+)
```

#### Example
```json
{"@timestamp":"2026-03-01T10:15:30.120Z","log.level":"INFO","message":"order placed orderId=42","log.logger":"com.example.orders.OrderService","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","spanId":"00f067aa0ba902b7","service.name":"orders"}
```

#### Common interview questions
- "What is SLF4J and why use it?" (A logging facade: code depends on its API while the backend — Logback, Log4j2 — is chosen at deployment, and Boot routes every common logging API into that one backend.)
- "Why use `{}` placeholders instead of concatenation?" (The message is only formatted if the level is enabled, avoiding wasted work, and it keeps message templates consistent.)
- "How do you correlate logs across a request?" (Put request identifiers in the MDC; with Micrometer Tracing, Boot adds trace and span ids automatically.)
- "How do you change log levels in production without a restart?" (POST to the actuator `loggers` endpoint, if exposed and secured.)

#### Follow-up questions
- "Why structured logging?" (Fields such as order id and trace id become searchable and aggregatable instead of being parsed out of free text.)
- "How does the MDC behave with thread pools?" (It is thread-local, so values must be copied to worker threads — for example with a `TaskDecorator` — and cleared afterwards to avoid leaking into the next task.)
- "How do you keep logging from slowing the application?" (Sensible levels, async appenders for heavy output, and avoiding expensive argument computation on hot paths.)

#### Edge cases
- `log.error("msg {}", id, ex)` logs the stack trace because a trailing throwable without a placeholder is treated as the exception.
- MDC values left on a pooled thread appear in unrelated requests.
- `logback-spring.xml` supports `<springProfile>`; plain `logback.xml` is loaded too early to use Spring features.

#### Common mistakes
- Logging passwords, tokens or full request bodies.
- Logging and rethrowing the same exception at every layer.
- Writing log files inside containers instead of to stdout.

#### Comparisons

| | Logback | Log4j2 |
|---|---|---|
| Boot default | Yes | Via `spring-boot-starter-log4j2` |
| Async logging | Async appender | Async loggers, very fast |
| Config file | `logback-spring.xml` | `log4j2-spring.xml` |

#### Frequently confused with
Logs versus metrics — logs record individual events; metrics aggregate measurements over time and are far cheaper for trends and alerts.

#### Important facts to remember
- SLF4J facade, Logback default.
- Throwable last.
- Structured logging built in from Boot 3.4.

---

### 11.7 Spring Boot Actuator

#### Definition
A Spring Boot module that adds production-ready endpoints for health, metrics, configuration, logging levels and diagnostics.

#### Why it exists
Because every production service needs the same operational answers — health, metrics, configuration, log levels — and building them by hand in each service is wasted and inconsistent. Actuator gives every Boot service a consistent, built-in operational interface for monitoring systems and operators.

#### Interview explanation
Describe the enable-versus-expose model — only `health` is exposed over HTTP by default — then name the important endpoints, flag the sensitive ones (`env`, `configprops`, `heapdump`, `loggers`), and explain hardening: a separate management port, minimal exposure, and a dedicated `SecurityFilterChain` using `EndpointRequest`.

#### Syntax
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, prometheus, loggers
  endpoint:
    env:
      show-values: when-authorized
  info:
    git:
      mode: simple
```

#### Example
```java
@Component
@Endpoint(id = "feature-flags")
class FeatureFlagsEndpoint {
    private final FeatureFlags flags;

    FeatureFlagsEndpoint(FeatureFlags flags) { this.flags = flags; }

    @ReadOperation
    Map<String, Boolean> flags() { return flags.all(); }

    @WriteOperation
    void set(@Selector String name, boolean enabled) { flags.set(name, enabled); }
}
```

#### Common interview questions
- "What is Spring Boot Actuator?" (A module providing operational endpoints — health, metrics, info, loggers, env and more — for monitoring and managing a running application.)
- "Which endpoints are exposed by default?" (Over HTTP, only `health`; others must be listed in `management.endpoints.web.exposure.include`.)
- "How do you secure actuator?" (Expose the minimum, run it on a separate internal port, and protect it with a `SecurityFilterChain` matched by `EndpointRequest.toAnyEndpoint()`.)
- "Why is `heapdump` dangerous?" (A heap dump contains everything in memory — credentials, tokens, personal data.)

#### Follow-up questions
- "How does Boot protect values in `env`?" (Since Boot 3.0 all values are masked by default; `show-values` can reveal them always or only to authorised users.)
- "How do you add build and Git info?" (Generate `build-info` with the Boot build plugin and `git.properties` with a Git plugin; the `info` endpoint picks them up.)
- "Can you write a custom endpoint?" (Yes — `@Endpoint` with `@ReadOperation`, `@WriteOperation` and `@DeleteOperation` methods, exposed through the same configuration.)

#### Edge cases
- The `shutdown` endpoint exists but is disabled by default.
- A separate management port means a separate embedded server; Boot applies the same Spring Security filter chain to it, so actuator rules still belong in a `SecurityFilterChain`, matched with `EndpointRequest`.
- Some endpoints, such as `httpexchanges`, need an extra bean before they return anything.

#### Common mistakes
- `include: "*"` in production.
- Actuator on the public port without dedicated security.
- Forgetting that `loggers` accepts writes.

#### Comparisons

| | Enabled | Exposed |
|---|---|---|
| Meaning | The endpoint bean exists | Reachable over HTTP or JMX |
| Default for most endpoints | Yes | No, over HTTP |
| Property | `management.endpoint.<id>.access` (Boot 3.4+, replacing `.enabled`) | `management.endpoints.web.exposure.include` |

#### Frequently confused with
Actuator versus a monitoring system — actuator exposes data; Prometheus, Grafana and similar systems collect, store and alert on it.

#### Important facts to remember
- Only `health` exposed over HTTP by default.
- Values in `env` masked since Boot 3.0.
- `heapdump` must never be public.

---

### 11.8 Health Checks and Probes

#### Definition
Health indicators report component status through `/actuator/health`; liveness and readiness health groups map Boot's availability states onto container-platform probes.

#### Why it exists
Because a platform running many instances must keep deciding which should receive traffic and which should be restarted, and it cannot see inside the process. Health endpoints answer those two questions, so traffic reaches only instances able to serve it and broken ones are replaced automatically.

#### Interview explanation
Separate the three probes by the action the platform takes on failure — restart, remove from load balancing, keep waiting — and argue from that what each should check. Liveness checks only the process itself; readiness reflects whether this instance can serve; external dependencies belong in neither by default, because a shared dependency failing would take every instance out at once.

#### Syntax
```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true                  # automatic on Kubernetes
        add-additional-paths: true     # /livez and /readyz on the main port
      group:
        readiness:
          include: readinessState, db   # a deliberate choice — see the edge cases below
```
```java
@Component
class PaymentGatewayHealth implements HealthIndicator {
    public Health health() {
        return gateway.ping() ? Health.up().build()
                              : Health.down().withDetail("gateway", "unreachable").build();
    }
}
```

#### Example
```text
Database outage, db included in liveness:
  every pod fails liveness → every pod restarts → restart storm, slow start-up, still no database

Database outage, liveness internal only:
  pods stay up, return errors or degraded responses, recover the moment the database returns
```

#### Common interview questions
- "What is the difference between liveness and readiness?" (Liveness failure restarts the container; readiness failure only stops traffic to it. Liveness asks whether the process is broken, readiness whether it can serve now.)
- "Should a liveness probe check the database?" (No — a restart cannot fix the database, and every instance would restart at once.)
- "What does a startup probe add?" (It suspends liveness checks until start-up completes, so slow-starting applications are not killed during boot.)
- "How does Boot expose probes?" (As `/actuator/health/liveness` and `/actuator/health/readiness` health groups, enabled automatically on Kubernetes.)

#### Follow-up questions
- "When does readiness change during shutdown?" (Graceful shutdown sets `REFUSING_TRAFFIC` so the platform stops sending new requests while in-flight ones finish.)
- "How do you write a custom health indicator?" (Implement `HealthIndicator` or `AbstractHealthIndicator`; the bean name minus the `HealthIndicator` suffix becomes the component name.)
- "Should health details be public?" (No — show details only when authorised; they reveal infrastructure.)

#### Edge cases
- A slow health indicator makes the probe time out and fail even when the app is fine.
- Readiness including a shared dependency removes all instances simultaneously, because they all depend on the same failing thing.
- Probes on a separate management port can pass while the main server is unresponsive.

#### Common mistakes
- External dependencies in liveness.
- No startup probe for slow-starting services.
- Expensive checks running on every probe.

#### Comparisons

| | Liveness | Readiness | Startup |
|---|---|---|---|
| Failure action | Restart | Stop routing | Restart after threshold |
| Boot state | `LivenessState` | `ReadinessState` | Uses liveness |
| Includes dependencies | Never | Rarely, deliberately | Never |

#### Frequently confused with
Health checks versus monitoring — probes drive automated platform actions; monitoring alerts humans about trends and symptoms.

#### Important facts to remember
- Liveness is about the process only.
- Readiness flips to refusing at shutdown.
- Health groups at `/actuator/health/liveness` and `/readiness`.

---

### 11.9 Metrics with Micrometer

#### Definition
Micrometer is a vendor-neutral metrics facade; Spring Boot auto-configures a `MeterRegistry` and instruments the framework, and applications add their own counters, timers and gauges.

#### Why it exists
Because most operational questions are about trends — rates, latencies, saturation — which logs answer slowly and expensively. Metrics measure them cheaply and consistently, and a vendor-neutral facade exports them to any monitoring system without lock-in.

#### Interview explanation
Name the meter types and when each fits, explain tags and the cardinality rule, describe what Boot instruments automatically (`http.server.requests`, JVM, HikariCP), and explain why percentiles should come from histograms aggregated server-side. Mention the Observation API as the shared foundation of metrics and tracing since Boot 3.

#### Syntax
```java
registry.counter("orders.placed", "channel", "web").increment();
Timer.builder("payment.authorise").publishPercentileHistogram().register(registry).record(() -> pay());
Gauge.builder("outbox.pending", outbox, Outbox::pendingCount).register(registry);
```
```text
# PromQL: p99 latency per endpoint, aggregated across every instance
histogram_quantile(0.99, sum by (le, uri) (rate(http_server_requests_seconds_bucket[5m])))
```

#### Example
```java
@Observed(name = "pricing.quote", contextualName = "price-order")
public Quote price(Order order) { ... }   // timer + span, given an ObservedAspect bean
```

#### Common interview questions
- "What is Micrometer?" (A metrics facade — like SLF4J for metrics — with registries for Prometheus, OTLP, Datadog and others; Spring Boot's metrics are built on it.)
- "Counter versus gauge versus timer?" (A counter only increases, a gauge samples a current value, a timer records count, total and distribution of durations.)
- "What is cardinality and why does it matter?" (The number of distinct tag-value combinations; each is a separate time series, so unbounded values such as user ids explode storage and cost.)
- "Why not average latency?" (Averages hide the tail; percentiles from histograms show what slow users experience and aggregate correctly across instances.)

#### Follow-up questions
- "Why use the URI template as a tag?" (Boot tags `http.server.requests` with `/orders/{id}`, not `/orders/42`, precisely to keep cardinality bounded.)
- "Client-side percentiles or histograms?" (Client-side percentiles cannot be combined across instances; histogram buckets can, at the cost of more series.)
- "What is the RED method?" (Rate, Errors, Duration — the three metrics to watch for every request-driven service.)

#### Edge cases
- Gauges hold a weak reference to their object; if it is garbage-collected, the gauge reports `NaN`.
- `@Timed` and `@Observed` need their aspect beans and only work on proxied calls.
- Meter names are dotted in code and converted to the target system's convention, such as `http_server_requests_seconds` in Prometheus.

#### Common mistakes
- Unbounded tag values.
- Alerting on averages.
- Creating meters per request instead of once.

#### Comparisons

| | Metrics | Logs | Traces |
|---|---|---|---|
| Unit | Aggregated numbers | Individual events | Individual requests |
| Cost at volume | Low | High | High, so sampled |
| Best for | Alerting, trends | Detail of one event | Where time went |

#### Frequently confused with
Micrometer versus Prometheus — Micrometer is the instrumentation library; Prometheus is one backend that scrapes and stores the data.

#### Important facts to remember
- Tags must be low cardinality.
- Percentiles from histograms.
- Observation API underlies metrics and tracing since Boot 3.

---

### 11.10 Distributed Tracing

#### Definition
Recording the path and timing of a request across services as a trace of spans linked by a propagated trace context; in Boot 3 implemented with Micrometer Tracing over OpenTelemetry or Brave.

#### Why it exists
Because in a distributed system no single service's logs show the whole request, so latency and failures cannot be located from any one of them. A trace id carried across every hop stitches the pieces into one timeline.

#### Interview explanation
Define trace, span and context propagation (W3C `traceparent` by default), explain how Boot instruments HTTP servers and clients and messaging through the Observation API, then cover the practical issues — sampling and its cost, instrumentation gaps from hand-built clients, context lost across threads — and link traces to logs through the MDC.

#### Syntax
```yaml
management:
  tracing:
    sampling:
      probability: 0.1
    propagation:
      type: w3c
spring:
  kafka:
    template:
      observation-enabled: true
    listener:
      observation-enabled: true
```
```http
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

#### Example
```java
@Bean
RestClient paymentsClient(RestClient.Builder builder) {   // Boot's builder: instrumented
    return builder.baseUrl("http://payments").build();
}

@Bean
ThreadPoolTaskExecutor workExecutor() {
    var executor = new ThreadPoolTaskExecutor();
    executor.setTaskDecorator(new ContextPropagatingTaskDecorator());   // keep trace context
    return executor;
}
```

#### Common interview questions
- "What is distributed tracing?" (Following one request across services as a tree of timed spans sharing a trace id, propagated in request headers.)
- "What replaced Spring Cloud Sleuth?" (Micrometer Tracing, with OpenTelemetry or Brave bridges, from Spring Boot 3.)
- "Why might a trace be broken?" (A client not built from Boot's instrumented builder, work moved to a thread without context propagation, or a messaging hop without observation enabled.)
- "What is sampling?" (Recording only a fraction of traces — Boot defaults to 10% — to control cost; tail sampling in a collector can keep all errors and slow requests.)

#### Follow-up questions
- "How do traces connect to logs?" (The trace and span ids are placed in the MDC and printed in log lines, so a trace id finds every log line of the request.)
- "What is the `traceparent` format?" (Version, 16-byte trace id, 8-byte parent span id and flags, hex-encoded and dash-separated, per W3C Trace Context.)
- "What is baggage?" (Key-value context propagated with the trace across services, such as a tenant id, configured explicitly because it travels on every call.)

#### Edge cases
- Head-based sampling decides at the first service, so a later error in an unsampled request is not traced.
- Asynchronous messaging produces long traces with large gaps between spans.
- Baggage values travel to every downstream service and may leak data.

#### Common mistakes
- 100% sampling in high-traffic production.
- `new RestTemplate()` in code that should be traced.
- Putting sensitive data in span tags or baggage.

#### Comparisons

| | Head sampling | Tail sampling |
|---|---|---|
| Decided | At the start of the trace | After it completes |
| Keeps all errors | No | Yes |
| Where | In the application | In a collector |

#### Frequently confused with
Trace id versus correlation id — a trace id comes from the tracing system and identifies spans; a correlation id is often a business-level identifier passed by convention.

#### Important facts to remember
- Micrometer Tracing replaced Sleuth.
- W3C `traceparent` by default.
- Default sampling probability 0.1.

---

### 11.11 Configuration and Secrets

#### Definition
Supplying environment-specific settings and sensitive credentials to an application at deployment time, from outside the image, through Spring Boot's externalised configuration.

#### Why it exists
Because one artifact must run in every environment, so environment-specific values cannot be built in — and secrets that reach code, images or logs are effectively public. External configuration and dedicated secret delivery keep credentials controlled, audited and rotatable.

#### Interview explanation
Separate ordinary configuration from secrets. Describe the delivery mechanisms — environment variables with relaxed binding, config trees from mounted files, `spring.config.import` from Vault or cloud secret managers — and the hygiene around them: validated `@ConfigurationProperties`, masking in actuator, no secrets in logs or images, and rotation designed in.

#### Syntax
```yaml
spring:
  config:
    import:
      - "optional:configtree:/etc/secrets/"
      - "optional:vault://"
```
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/orders java -jar app.jar
```

#### Example
```java
@Validated
@ConfigurationProperties(prefix = "payments")
public record PaymentsProperties(
        @NotNull URI baseUrl,
        @NotBlank String apiKey,
        @NotNull Duration timeout) { }
```

#### Common interview questions
- "How do you manage secrets in Spring Boot?" (Keep them out of the repository and image; inject them at runtime from mounted secret files via config trees, environment variables, or a secret manager such as Vault through `spring.config.import`.)
- "How does an environment variable map to a property?" (Relaxed binding: uppercase, dots and dashes become underscores — `SPRING_DATASOURCE_URL` sets `spring.datasource.url`.)
- "Are Kubernetes Secrets secure?" (They are base64-encoded, not encrypted, by default; security depends on etcd encryption at rest and RBAC.)
- "How do you fail fast on bad configuration?" (Bind to `@ConfigurationProperties` with `@Validated` constraints so start-up fails with a clear error.)

#### Follow-up questions
- "Files or environment variables for secrets?" (Files are generally preferred: environment variables are inherited by child processes and easily exposed in diagnostics.)
- "How do you rotate a database password without downtime?" (Support two valid credentials during the switch, or use dynamic short-lived credentials from Vault, and refresh the connection pool.)
- "What happens if a secret is committed to Git?" (Treat it as leaked: rotate it immediately; deleting the commit does not remove it from clones and history.)

#### Edge cases
- `optional:` imports silently skip a missing source — convenient locally, dangerous if production depends on it.
- Config-tree names follow the directory structure, so `/etc/secrets/db/password` becomes the property `db.password`.
- Properties set with `@Value` are read once at start-up; a changed source has no effect until restart unless refresh is designed in.

#### Common mistakes
- Secrets in `application.yml` committed to the repository.
- Secrets baked into image layers.
- Logging the full configuration at start-up.

#### Comparisons

| | Environment variables | Mounted files | Secret manager |
|---|---|---|---|
| Rotation without redeploy | No | Possible | Yes |
| Exposure risk | Process inspection, child processes | File permissions | API access control |
| Audit trail | Weak | Weak | Strong |

#### Frequently confused with
Configuration versus secrets — both are external values, but secrets need encryption, access control, auditing and rotation.

#### Important facts to remember
- `configtree:` reads mounted files.
- Kubernetes Secrets are not encrypted by default.
- A committed secret is a leaked secret.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 11. Next: Putting It Together: a Production Service.*

---

## 12. Putting It Together: a Production Service

### Table of Contents (this group)
- [[#12.1 The Reference Architecture]]
- [[#12.2 Designing the Domain and API]]
- [[#12.3 Timeouts, Retries and Circuit Breakers]]
- [[#12.4 Rate Limiting and Backpressure]]
- [[#12.5 Idempotent APIs]]
- [[#12.6 Performance and Load Testing]]
- [[#12.7 Zero-Downtime Deployment]]
- [[#12.8 Feature Flags and Safe Releases]]
- [[#12.9 Operating the Service]]
- [[#12.10 Upgrading Spring Boot]]
- [[#12.11 Explaining the System in an Interview]]

---

### 12.1 The Reference Architecture

#### Definition
A worked design of a complete Spring Boot service — an order service with REST, PostgreSQL, Redis, Kafka, an external payment dependency, JWT security and full observability — used to connect every earlier topic.

#### Why it exists
Because interviews and real projects test integration: how the pieces interact, where consistency boundaries lie and how the whole behaves when one part fails.

#### Interview explanation
Present it as a modular monolith with explicit boundaries. Walk through one request — authenticate, validate, apply domain rules in a short transaction, write the outbox row, return — then the asynchronous tail: relay to Kafka, idempotent consumers downstream. Explain why each technology is there and what failure each design choice guards against.

#### Syntax
```text
Ingress → SecurityFilterChain → Controller → Service (@Transactional) → Repository → PostgreSQL
                                                 ├─ RestClient (timeouts, breaker) → Payments
                                                 └─ Outbox row → Relay → Kafka → Consumers
```

#### Example
```java
@Transactional
public OrderResponse place(PlaceOrderCommand command) {
    Order order = Order.place(command.customerId(), catalogue.price(command.lines()));
    orders.save(order);
    outbox.save(OutboxEvent.of("OrderPlaced", order.id(), OrderPlaced.from(order)));
    return OrderResponse.from(order);   // payment authorised asynchronously from the event
}
```

#### Common interview questions
- "Design an order service in Spring Boot." (A modular monolith: REST controllers, a transactional service layer, JPA over PostgreSQL with Flyway, Redis cache-aside for the catalogue, an outbox to Kafka for events, a resilient payment client, JWT resource-server security, and Actuator with Micrometer and OpenTelemetry.)
- "Why not microservices from the start?" (Network calls, distributed data and operational overhead cost more than they return until scale or team structure demands it; clear module boundaries keep extraction possible.)
- "How do you keep the database and Kafka consistent?" (A transactional outbox: the event row is committed with the business change, and a relay publishes it afterwards, giving at-least-once delivery.)
- "Where does caching fit?" (Read-heavy, change-tolerant data such as the product catalogue, with cache-aside and TTLs, never the order state itself.)

#### Follow-up questions
- "What happens if Redis is down?" (Cache-aside degrades to database reads; the database must be sized to survive it, possibly with a local fallback cache.)
- "What if the payment service is slow?" (Timeouts and a circuit breaker bound the impact; the order stays pending and payment completes asynchronously.)
- "How would you split it later?" (Extract a module whose boundary is already clean, give it its own database, and replace in-process calls with events or APIs.)

#### Edge cases
- The outbox relay can publish an event twice after a crash, so consumers must be idempotent.
- A cache entry may be stale for up to its TTL after a catalogue change.
- A pending payment needs a timeout process so orders do not wait forever.

#### Common mistakes
- Publishing events inside the transaction.
- Sharing the order database with other services.
- Choosing technologies before understanding the requirements.

#### Comparisons

| | Modular monolith | Microservices |
|---|---|---|
| Deployment | One unit | Many units |
| Consistency | Local transactions | Sagas, eventual consistency |
| Operational cost | Low | High |
| Independent scaling | No | Yes |

#### Frequently confused with
A modular monolith versus a big ball of mud — both deploy as one unit, but the modular one enforces internal boundaries.

#### Important facts to remember
- Outbox for database-plus-event consistency.
- Consumers must be idempotent.
- Start modular, split on evidence.

---

### 12.2 Designing the Domain and API

#### Definition
Modelling the business domain as aggregates with enforced invariants and explicit state transitions, and exposing it through a stable, resource- and command-oriented HTTP API separate from the persistence model.

#### Why it exists
Because the domain model and API contract are the hardest parts of a service to change, and errors in them propagate into the schema, the events and every client.

#### Interview explanation
Describe the aggregate — `Order` owning its lines, enforcing rules such as "cannot cancel once shipped" — and the state machine. Then describe API decisions: DTOs instead of entities, opaque ids, money as minor units, `ProblemDetail` errors, pagination, idempotency keys and explicit action endpoints for state changes.

#### Syntax
```java
public record PlaceOrderRequest(
        @NotNull UUID customerId,
        @NotEmpty List<@Valid OrderLineRequest> lines) { }

public record Money(long amountMinor, String currency) { }
```
```http
POST /api/orders/7f3c.../cancel HTTP/1.1
```

#### Example
```json
{
  "type": "https://api.shop.example/problems/order-already-shipped",
  "title": "Order already shipped",
  "status": 409,
  "detail": "Order 7f3c... was shipped and can no longer be cancelled",
  "instance": "/api/orders/7f3c.../cancel"
}
```

#### Common interview questions
- "Where do business rules belong?" (In the domain model and service layer — the aggregate enforces its own invariants — never in controllers or clients.)
- "Why not expose JPA entities directly?" (It couples the API to the schema, leaks internal fields, and risks lazy-loading and serialisation failures.)
- "How do you represent money?" (As integer minor units with a currency code, or `BigDecimal`, never `double`, which cannot represent most decimal fractions exactly.)
- "How do you model state changes in REST?" (Explicit command endpoints such as `POST /orders/{id}/cancel`, letting the domain enforce valid transitions.)

#### Follow-up questions
- "Why opaque ids rather than database keys?" (Sequential keys reveal volume and invite enumeration; UUIDs or other opaque ids decouple the API from storage.)
- "How do you report validation versus business errors?" (`400` with field errors for malformed input; `409` or `422` with a specific problem type for rule violations.)
- "How do you keep the API stable as the domain evolves?" (Version DTOs at the edge, evolve additively, and map onto one evolving domain model.)

#### Edge cases
- Concurrent cancellation and shipping need optimistic locking on the aggregate.
- Currency arithmetic must define rounding rules explicitly.
- Enum states stored as ordinals break when a value is inserted; store names.

#### Common mistakes
- Anaemic entities with all rules scattered across services.
- Generic `PATCH` endpoints for status changes.
- `double` for prices.

#### Comparisons

| | Action endpoint | Generic status update |
|---|---|---|
| Who decides validity | Server domain | Client |
| Illegal transitions | Rejected by design | Possible |
| Semantics | Explicit | Implicit |

#### Frequently confused with
Domain model versus persistence model — they can be the same JPA classes in simpler services, but they serve different purposes and can diverge.

#### Important facts to remember
- Aggregates enforce invariants.
- DTOs at the boundary.
- RFC 9457 problem details for errors.

---

### 12.3 Timeouts, Retries and Circuit Breakers

#### Definition
Resilience patterns for remote calls: timeouts bound waiting, retries repeat transient failures with back-off, and circuit breakers stop calling a failing dependency until it shows signs of recovery.

#### Why it exists
Because in a distributed system a slow or failing dependency is normal, and a caller that waits patiently exhausts its own threads and connections — cascading the failure upstream. Bounding the wait, forgiving brief faults and failing fast during outages keep one sick service from making its callers sick.

#### Interview explanation
Start with timeouts, since every remote call needs one and the defaults are often infinite or very long. Explain retries with exponential back-off and jitter, only for transient errors and idempotent operations. Then explain the circuit breaker's closed, open and half-open states and its sliding window. Finish with how they compose — and how retry amplification across layers causes outages.

#### Syntax
```java
@Retry(name = "payments", fallbackMethod = "fallback")   // fallback on the outermost layer
@CircuitBreaker(name = "payments")
@Bulkhead(name = "payments")
public PaymentResult authorise(PaymentRequest request) { ... }
```
```java
// Spring Framework 7 core resilience, enabled with @EnableResilientMethods
@Retryable              // attributes tune attempts, delay, jitter and back-off multiplier
@ConcurrencyLimit(10)
public PaymentResult authorise(PaymentRequest request) { ... }
```

#### Example
```text
Payment service degrades: p99 rises from 200 ms to 20 s.

No timeout:  200 Tomcat threads all wait 20 s → order service stops answering everything.
Timeout 2 s: threads freed quickly, but every request still waits 2 s and fails.
+ breaker:   after 20 failures the breaker opens → calls fail in microseconds,
             orders go to PENDING, payments retried later; half-open probes detect recovery.
```

#### Common interview questions
- "Why does every remote call need a timeout?" (Without one, a hung dependency holds the caller's thread and connection indefinitely, and the caller's capacity drains away.)
- "When should you retry?" (For transient failures — timeouts, connection resets, `503` — on idempotent operations, with capped exponential back-off and jitter.)
- "Explain the circuit breaker states." (Closed passes calls and counts failures; open rejects calls immediately for a wait period; half-open allows trial calls and closes on success or reopens on failure.)
- "What is retry amplification?" (Retries at several layers multiply — three attempts at three layers gives twenty-seven calls — overwhelming a dependency that is already struggling.)

#### Follow-up questions
- "Why add jitter?" (Without it, many clients retry in lockstep and hit the recovering service in synchronised waves.)
- "What should a fallback return?" (Something honest and safe — a pending state, cached data, a degraded response — never a fake success.)
- "How do you choose the timeout value?" (From the dependency's observed latency percentiles and the caller's own deadline, so the inner timeout is shorter than the outer.)

#### Edge cases
- A read timeout after the server has acted means the outcome is unknown, so only idempotent requests are safe to retry.
- A breaker with too small a minimum number of calls opens on a handful of errors at low traffic.
- `@TimeLimiter` in Resilience4j only applies to asynchronous return types.
- A fallback on the inner `@CircuitBreaker` turns every failure into a normal return, so the outer `@Retry` never fires — put the fallback on the outermost annotation.

#### Common mistakes
- No timeout on HTTP clients or database queries.
- Retrying non-idempotent `POST` requests without an idempotency key.
- Fallbacks that hide outages from monitoring.

#### Comparisons

| | Timeout | Retry | Circuit breaker | Bulkhead |
|---|---|---|---|---|
| Protects against | Hanging calls | Transient faults | Persistent failure | Resource exhaustion |
| Cost | A failed slow call | Extra load | Rejected calls while open | Rejected calls when full |

#### Frequently confused with
Circuit breaker versus rate limiter — a breaker reacts to the *dependency's* failures; a rate limiter caps *callers'* request rate regardless of health.

#### Important facts to remember
- Every remote call needs a timeout.
- Retry only idempotent operations, with jitter.
- Retry wraps the breaker in Resilience4j's default order.

---

### 12.4 Rate Limiting and Backpressure

#### Definition
Rate limiting restricts the number of requests a client may make per time window; backpressure is the broader practice of bounding queues and pools so that overload produces fast rejection rather than collapse.

#### Why it exists
Because capacity is finite, and a service that accepts unlimited work exhausts threads, connections or memory and fails for everyone. Refusing excess early keeps it within capacity, protects it from abusive or buggy clients, and keeps latency predictable for accepted work.

#### Interview explanation
Explain the token bucket and the alternatives, where limits are enforced (gateway, filter, per dependency), and the HTTP semantics — `429` with `Retry-After`. Then widen to backpressure: every pool in a Boot application is a queue with a limit — Tomcat threads, Hikari connections — and timeouts on waiting matter as much as sizes. Mention that virtual threads remove the thread pool as an implicit limit.

#### Syntax
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```
```yaml
server:
  tomcat:
    threads:
      max: 200
    accept-count: 100
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      connection-timeout: 2s
```

#### Example
```text
Token bucket: capacity 100, refill 100 per minute
t=0s   burst of 100 requests → all allowed, bucket empty
t=1s   request → rejected (429)
t=30s  ~50 tokens refilled → next 50 requests allowed
```

#### Common interview questions
- "How would you implement rate limiting?" (A token bucket per client key — in a servlet filter with Bucket4j for one instance, or backed by Redis or an API gateway for a fleet-wide limit — returning `429` with `Retry-After`.)
- "Token bucket versus fixed window?" (Fixed windows allow double bursts at window boundaries; token buckets smooth the rate while permitting bounded bursts.)
- "What is backpressure?" (Signalling or enforcing that a component cannot accept more work — bounded queues, rejection, or slowing the producer — instead of buffering without limit.)
- "What happens when the Hikari pool is exhausted?" (Threads wait up to `connection-timeout` for a connection, then fail; latency rises sharply long before errors appear.)

#### Follow-up questions
- "How do virtual threads affect this?" (They remove the thread-pool ceiling, so far more concurrent requests reach downstream pools; explicit concurrency limits must replace the implicit one.)
- "Where should rate limiting live?" (Coarse limits at the gateway, finer per-user or per-endpoint limits in the application, and bulkheads around each dependency.)
- "How do Kafka consumers handle backpressure?" (Naturally — they pull at their own pace, and lag grows instead of the consumer being overwhelmed.)

#### Edge cases
- Per-instance limits multiply with instance count unless coordinated.
- Clients behind a shared NAT appear as one IP address.
- Health and metrics endpoints should be exempt from user rate limits.

#### Common mistakes
- Unbounded in-memory queues.
- Pool wait timeouts longer than client timeouts.
- Raising pool sizes instead of finding the slow query.

#### Comparisons

| | Token bucket | Fixed window | Sliding window |
|---|---|---|---|
| Bursts | Allowed up to capacity | Up to twice the limit at edges | Smoothed |
| State per key | Tokens and timestamp | Counter | Counters or log |
| Accuracy | Good | Coarse | Best |

#### Complexity
Token bucket and fixed-window checks are O(1) per request; a sliding-window log is O(n) in the requests retained per key.

#### Frequently confused with
Rate limiting versus throttling — often used interchangeably; throttling sometimes means slowing requests rather than rejecting them.

#### Important facts to remember
- `429` plus `Retry-After`.
- Every pool is a queue; bound it and time out.
- Virtual threads need explicit concurrency limits.

---

### 12.5 Idempotent APIs

#### Definition
APIs where repeating a request produces the same effect as a single request, achieved for non-idempotent operations such as `POST` through client-supplied idempotency keys and stored responses.

#### Why it exists
Because clients cannot distinguish "the request failed" from "the response was lost", so safe retries require the server to recognise repeats.

#### Interview explanation
Start from HTTP semantics — `GET`, `PUT` and `DELETE` are idempotent by definition, `POST` is not required to be. Then describe the idempotency-key protocol: client-generated key per operation, stored server-side with a request hash and response, unique constraint to resolve races, same transaction as the effect, `409` for in-progress repeats, and expiry after a retention window.

#### Syntax
```http
POST /api/orders HTTP/1.1
Idempotency-Key: 4f9d7b52-1c1e-4e0b-9a43-2f6c1c7d9e10
Content-Type: application/json
```

#### Example
```java
@Transactional
public StoredResponse placeOnce(String key, PlaceOrderRequest request) {
    String hash = sha256(request);
    return keys.findById(key)
            .map(existing -> replay(existing, hash))           // completed: same response
            .orElseGet(() -> {
                keys.saveAndFlush(IdempotencyKey.inProgress(key, hash));   // PK enforces the race
                OrderResponse response = orders.place(request);
                return keys.complete(key, 201, response);
            });
}
```

#### Common interview questions
- "What does idempotent mean for an HTTP API?" (Repeating the request has the same effect on server state as making it once; responses may differ, effects may not.)
- "How do you make `POST /orders` safe to retry?" (Require an `Idempotency-Key`, store it with the request hash and response, and return the stored response for repeats.)
- "How do you handle two concurrent requests with the same key?" (A unique constraint lets only one insert succeed; the other receives `409` or waits and then replays the stored result.)
- "Why not deduplicate by request content?" (Two identical orders can both be intentional; only the client knows whether a request is a retry.)

#### Follow-up questions
- "How long do you keep keys?" (Longer than any realistic client retry window — commonly 24 hours or more — then delete them on a schedule.)
- "What if the same key arrives with a different body?" (Reject it — typically `422` — because the client is misusing the key.)
- "How does this relate to Kafka consumers?" (Same principle: a processed-events table keyed by event id makes redelivery harmless — see [[#10.10 Delivery Semantics and Idempotency]].)

#### Edge cases
- A crash after the order commits but before the response reaches the client: the retry replays the stored response — correct.
- An in-progress record left by a crashed instance needs a timeout to become retryable.
- Calls to downstream services from inside the operation need their own idempotency keys.

#### Common mistakes
- Recording the key after the effect, outside the transaction.
- Keys generated server-side, which cannot identify client retries.
- Never expiring keys.

#### Comparisons

| Method | Idempotent | Safe, no side effects |
|---|---|---|
| `GET` | Yes | Yes |
| `PUT` | Yes | No |
| `DELETE` | Yes | No |
| `POST` | No | No |
| `PATCH` | Not necessarily | No |

#### Frequently confused with
Idempotent versus safe — safe methods do not change state; idempotent methods may change it, but repeating them changes nothing further.

#### Important facts to remember
- Client generates the key.
- Unique constraint resolves races.
- Store the response in the same transaction as the effect.

---

### 12.6 Performance and Load Testing

#### Definition
Measuring a service's throughput, latency and resource use under controlled, realistic load — load, stress, soak and spike tests — and profiling to find the bottleneck.

#### Why it exists
Because concurrency-dependent problems — contention, pool exhaustion, slow queries at scale, leaks — are invisible in functional tests, and production is an expensive place to discover them.

#### Interview explanation
State the question first (capacity per instance within the SLO, or the breaking point), choose the test type, use realistic data and an open workload model, and watch percentiles and saturation rather than averages. Then describe finding the bottleneck: metrics first (pool usage, GC, CPU throttling), then profiling with JFR or async-profiler, then database query plans.

#### Syntax
```bash
java -XX:StartFlightRecording=duration=120s,filename=orders.jfr -jar app.jar
jcmd <pid> JFR.start duration=60s filename=hot.jfr
```

#### Example
```text
Target: 400 req/s at p99 < 300 ms per instance

Result: p99 fine up to 250 req/s, then climbs steeply
Hikari: active = 10/10, pending rising
JFR: request threads parked waiting for a connection
DB: one query doing a sequential scan on order_lines

Fix: add index on order_lines(order_id) → p99 < 300 ms at 450 req/s with the same pool
```

#### Common interview questions
- "How would you load test a Spring Boot service?" (Production-like environment and data, a tool such as Gatling, k6 or JMeter with an open workload model, SLO-based pass criteria, and monitoring of percentiles, errors and saturation.)
- "What is the difference between load, stress and soak tests?" (Load verifies expected peak, stress finds the breaking point, soak runs for hours to expose leaks and slow degradation.)
- "Why percentiles rather than averages?" (Averages hide the slow tail that real users experience; p95 and p99 show it.)
- "How do you find a performance bottleneck?" (Check saturation metrics to find the constrained resource, profile with JFR or async-profiler, and inspect query plans for slow SQL.)

#### Follow-up questions
- "What is coordinated omission?" (A closed load generator waits for slow responses before sending more, so it under-samples exactly the slow periods and reports misleadingly good latency.)
- "What does Little's Law tell you?" (Concurrency equals throughput times latency, which sizes thread and connection pools and checks test results for consistency.)
- "How do you microbenchmark a method?" (With JMH, which handles JIT warm-up, dead-code elimination and measurement pitfalls that naive timing gets wrong.)

#### Edge cases
- JIT warm-up makes the first minutes unrepresentative; discard them.
- Load generators can become the bottleneck themselves.
- Caches warm during a test, so first-run and steady-state results differ.

#### Common mistakes
- Testing with empty or tiny databases.
- Reporting averages.
- Testing once before launch and never again.

#### Comparisons

| | Gatling | k6 | JMeter |
|---|---|---|---|
| Scripts | Java, Kotlin, Scala DSL | JavaScript or TypeScript | GUI and XML plans |
| Model | Open and closed | Open and closed | Mostly thread-based, closed |
| Fit for Java teams | Excellent | Good | Familiar, heavier |

#### Complexity
Little's Law: L = λ × W — concurrent requests equal arrival rate times time in system.

#### Frequently confused with
Load testing versus benchmarking — load tests measure a deployed system under traffic; benchmarks measure isolated code paths.

#### Important facts to remember
- Realistic data and open workloads.
- Percentiles and saturation, not averages.
- JFR is built into the JDK.

---

### 12.7 Zero-Downtime Deployment

#### Definition
Releasing a new version without failed requests or unavailability, using rolling, blue-green or canary strategies plus graceful shutdown, readiness gating and backward-compatible changes.

#### Why it exists
Because frequent deployment is only sustainable if each deployment is invisible to users — and during every rollout old and new versions run side by side, so invisibility depends on draining instances cleanly and keeping every change compatible with the previous version.

#### Interview explanation
Cover the mechanics — readiness gates new pods, a `preStop` delay covers endpoint propagation, graceful shutdown drains in-flight work within the grace period — and then the harder part: compatibility. During a rollout two versions share the database, topics and caches, so schema changes use expand-and-contract and event and API changes are additive.

#### Syntax
```yaml
strategy:
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 0
terminationGracePeriodSeconds: 45
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 10"]
```

#### Example
```text
Renaming orders.customer_ref → orders.customer_id without downtime

Release 1: add customer_id; write both columns; read customer_ref
Backfill:  copy customer_ref → customer_id in batches
Release 2: read customer_id; still write both
Release 3: stop writing customer_ref
Release 4: drop customer_ref
```

#### Common interview questions
- "How do you deploy without downtime?" (Rolling or canary deployment with readiness probes, a `preStop` delay, graceful shutdown inside the grace period, and backward-compatible schema, API and event changes.)
- "How do you handle database migrations with zero downtime?" (Expand and contract: additive changes first, migrate data, switch reads, then remove old structures in a later release.)
- "Blue-green or canary?" (Blue-green gives instant full switch and rollback at double capacity; canary limits blast radius by exposing a small share of traffic first.)
- "Why do requests fail during a rolling deploy even with graceful shutdown?" (Endpoint removal and `SIGTERM` happen concurrently, so traffic still arrives at a terminating pod unless a `preStop` delay is added.)

#### Follow-up questions
- "How do you roll back a release with a migration?" (Design migrations so the previous version still works with the new schema; then rollback is just redeploying the old image.)
- "What about Kafka event schema changes?" (Additive, backward-compatible changes with a schema registry, so old and new consumers can read both versions.)
- "What about in-memory sessions?" (Keep the service stateless — tokens or an external session store — so any instance can serve any request.)

#### Edge cases
- Long-running requests, such as uploads or streaming, may exceed the grace period.
- Scheduled jobs can run on both versions at once during rollout; use a lock such as ShedLock.
- Cache entries serialised by the new version may not deserialise in the old one.

#### Common mistakes
- Destructive migrations in the same release as the code change.
- Grace period shorter than the shutdown timeout plus `preStop`.
- No readiness probe, so traffic reaches pods still starting.

#### Comparisons

| | Rolling | Blue-green | Canary |
|---|---|---|---|
| Extra capacity | Small surge | 100% briefly | Small |
| Rollback speed | Gradual | Instant | Fast |
| Exposure of a bad release | Grows during rollout | All at once after switch | Limited and measured |

#### Frequently confused with
Zero-downtime versus zero-risk — zero-downtime removes the outage window; canaries and flags reduce the risk of the change itself.

#### Important facts to remember
- `preStop` delay covers endpoint propagation.
- Expand and contract for schema changes.
- Two versions always overlap during a rollout.

---

### 12.8 Feature Flags and Safe Releases

#### Definition
Runtime switches that enable or disable code paths per request context without redeployment, used for progressive delivery, kill switches, experiments and entitlements.

#### Why it exists
Because once code is deployed everyone gets it, and undoing it takes another deployment. Moving the decision about who sees new behaviour to run time separates deploying code from releasing behaviour — allowing gradual exposure, instant rollback and trunk-based development.

#### Interview explanation
Name the flag types and their lifetimes, describe progressive rollout with monitoring at each step, mention vendor-neutral evaluation through OpenFeature with providers such as Unleash, LaunchDarkly or flagd, and close with the costs: testing both paths, flag debt, and the flag system becoming a runtime dependency that needs safe defaults.

#### Syntax
```java
boolean enabled = client.getBooleanValue("new-pricing-engine", false, context);
String variant = client.getStringValue("checkout-layout", "control", context);
```

#### Example
```text
Rollout of new pricing engine
day 1   deploy, flag off everywhere
day 2   on for internal staff        → compare quotes with legacy engine
day 3   1% of customers              → error rate, conversion, latency
day 5   10% → 50%                     → no regression
day 7   100%
day 21  remove flag and legacy engine from the code
```

#### Common interview questions
- "What are feature flags for?" (Releasing features gradually and reversibly, separating deployment from release, and providing kill switches for risky or expensive functionality.)
- "What is the difference between deploying and releasing?" (Deploying puts code in production; releasing exposes behaviour to users — flags let the two happen at different times.)
- "What are the risks of feature flags?" (Untested flag combinations, accumulated stale flags, and a dependency on the flag service whose failure must fall back to safe defaults.)
- "How do you roll out to a percentage of users consistently?" (Hash a stable identifier such as the user id into buckets, so each user sees the same variant on every request.)

#### Follow-up questions
- "How do you avoid flag debt?" (Give release flags an owner and an expiry date, track them, and remove them as part of finishing the feature.)
- "What should happen if the flag service is down?" (Evaluate to a cached value or a safe default supplied at the call site.)
- "Flags or branches?" (Flags keep everyone on trunk with small merges; long-lived branches defer integration pain.)

#### Edge cases
- A flag that changes mid-request can produce inconsistent behaviour; evaluate once per request.
- Database schema changes cannot be hidden behind a flag; they still need expand and contract.
- Flags evaluated in batch jobs need a context too, or they default silently.

#### Common mistakes
- Never removing release flags.
- Testing only the "on" path.
- Nested flags creating untestable combinations.

#### Comparisons

| | Feature flag | Configuration property |
|---|---|---|
| Changes at runtime | Yes | Usually needs restart |
| Per-user targeting | Yes | No |
| Typical lifetime | Short for release flags | Long |

#### Frequently confused with
Feature flags versus canary deployments — canaries route traffic to a different *version*; flags switch behaviour inside the same version.

#### Important facts to remember
- Deploy is not release.
- Remove release flags promptly.
- Safe defaults if evaluation fails.

---

### 12.9 Operating the Service

#### Definition
Running a service reliably through SLIs, SLOs and error budgets, symptom-based alerting, dashboards, runbooks, incident response and blameless post-incident learning.

#### Why it exists
Because reliability must be defined in user terms and managed deliberately, or teams either over-invest in it or discover its absence from customers.

#### Interview explanation
Define SLI, SLO and error budget with an example, explain why alerts should be on SLO burn rate and user-facing symptoms, name the golden signals, and describe incident handling: mitigate first, communicate, diagnose, then run a blameless review with concrete follow-up actions.

#### Syntax
```text
SLI:  good requests / valid requests, where good = status < 500 and latency < 300 ms
SLO:  99.9% over a rolling 30 days
Budget: 0.1% ≈ 43 minutes of full outage per 30 days
```

#### Example
```text
Alert: fast burn — 14.4× budget burn over 1 h (confirmed over 5 min)   → page
Alert: slow burn — 1× budget burn over 3 days                          → ticket

Incident: deploy at 14:02, error rate 4% at 14:05, page at 14:09
14:11 rollback started → 14:16 error rate normal
Review: missing contract test for payment API change; canary step added to pipeline
```

#### Common interview questions
- "What is an SLO?" (A target for a service level indicator over a time window — for example, 99.9% of requests succeed within 300 ms over 30 days.)
- "What is an error budget used for?" (It quantifies acceptable unreliability, so a team can spend it on releases and experiments and slow down when it is nearly exhausted.)
- "What should you alert on?" (User-visible symptoms and SLO burn rate, not every internal cause; causes are for diagnosis.)
- "What do you do first in an incident?" (Mitigate — roll back, disable a flag, shed load — before root-causing, and communicate status.)

#### Follow-up questions
- "What are the four golden signals?" (Latency, traffic, errors and saturation.)
- "What is a blameless post-mortem?" (A review that treats failure as a property of the system and process rather than individual fault, so people share facts openly and fixes target causes.)
- "What belongs in a runbook?" (Symptoms, dashboards to check, likely causes, safe mitigation steps and escalation contacts.)

#### Edge cases
- Low-traffic services make percentage SLIs noisy; use longer windows or synthetic traffic.
- Dependencies' SLOs bound your own; you cannot promise more than your weakest synchronous dependency allows.
- Planned maintenance still consumes budget if users are affected.

#### Common mistakes
- 100% targets.
- Alerts nobody acts on.
- Post-mortems without owned follow-up actions.

#### Comparisons

| | SLI | SLO | SLA |
|---|---|---|---|
| What | A measurement | An internal target | A contractual promise |
| Audience | Engineers | Team and stakeholders | Customers |
| On breach | — | Slow releases, fix reliability | Financial penalties |

#### Frequently confused with
SLO versus SLA — the SLA is the external contract, normally looser than the internal SLO to leave a safety margin.

#### Important facts to remember
- 99.9% over 30 days ≈ 43 minutes of budget.
- Alert on burn rate and symptoms.
- Mitigate first, diagnose second.

---

### 12.10 Upgrading Spring Boot

#### Definition
Moving an application to newer Spring Boot minor and major versions to stay within the supported window, using a stepwise path, deprecation clean-up and migration tooling.

#### Why it exists
Because each minor version's free support is limited, and unsupported versions stop receiving security fixes — while the longer an upgrade waits, the larger and riskier it becomes.

#### Interview explanation
Describe the cadence — minor releases every six months, each with a limited OSS support window — and the approach: keep current on patches, move one minor at a time, eliminate deprecation warnings before a major, use `spring-boot-properties-migrator` and OpenRewrite recipes, and lean on a strong test suite. Give one concrete major upgrade as an example: 2.x to 3.0 (`javax` to `jakarta`, Java 17, Hibernate 6, Security 6) or 3.x to 4.0 (Spring Framework 7, Jakarta EE 11, Jackson 3).

#### Syntax
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.0</version>   <!-- only once the build is clean on the latest 3.5.x -->
</parent>
```
```bash
./mvnw -U org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:RELEASE \
  -Drewrite.activeRecipes=org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_5
```

#### Example
```text
3.2.x app, goal 4.0
1. 3.2.latest  → green build
2. 3.3 → 3.4 → 3.5, one at a time; run properties migrator; fix deprecations each step
   (e.g. @MockBean → @MockitoBean, deprecated in 3.4)
3. 3.5.latest with zero deprecation warnings
4. 4.0 via OpenRewrite recipe + manual fixes; full test suite, staging soak, canary
```

#### Common interview questions
- "How do you upgrade Spring Boot safely?" (One minor at a time, starting from the latest patch, fixing deprecations at each step, using the properties migrator and OpenRewrite, with a strong test suite and a canary release.)
- "What changed in the Spring Boot 3 migration?" (Java 17 baseline, `javax.*` to `jakarta.*`, Spring Framework 6, Hibernate 6, Spring Security 6 configuration with `SecurityFilterChain`, and Micrometer Tracing replacing Sleuth.)
- "What is new in Spring Boot 4?" (It is built on Spring Framework 7 and Jakarta EE 11, keeps a Java 17 minimum, uses Jackson 3 by default, modularises auto-configuration and adds native API versioning and core resilience annotations.)
- "Why do deprecation warnings matter?" (Deprecated APIs are removed in the next major version; clearing them first makes the major upgrade a small step.)

#### Follow-up questions
- "What does `spring-boot-properties-migrator` do?" (At start-up it reports renamed or removed properties and temporarily maps old names, so configuration can be updated safely; remove it afterwards.)
- "What if a library does not support the new major yet?" (Wait or replace it; forcing incompatible versions produces runtime failures that tests may not catch.)
- "How long is a Boot minor supported?" (A limited OSS window of around a year, published on the Spring support timeline; commercial support extends it.)

#### Edge cases
- Dependency management changes transitive library versions even when your code is untouched.
- Default behaviours change between minors — for example graceful shutdown became the default in 3.4.
- Native-image and AOT builds can break on upgrades that JVM builds survive.

#### Common mistakes
- Skipping several versions at once.
- Overriding Boot-managed dependency versions without need.
- Upgrading without a test suite that exercises the integration points.

#### Comparisons

| | Spring Boot 2.x | Spring Boot 3.x | Spring Boot 4.x |
|---|---|---|---|
| Spring Framework | 5 | 6 | 7 |
| Java minimum | 8 | 17 | 17 |
| Jakarta EE | `javax` (EE 8) | 9 to 10 | 11 |

#### Frequently confused with
Upgrading Spring Boot versus upgrading Spring Framework — Boot pins a compatible Framework version; upgrade Boot and let it bring the matching Framework.

#### Important facts to remember
- One minor at a time.
- Deprecated in one major, removed in the next.
- Boot 4.0 arrived in November 2025 on Spring Framework 7.

---

### 12.11 Explaining the System in an Interview

#### Definition
A structured walkthrough of a system you designed or worked on: problem, architecture, key flow, consistency, failure handling, operations, trade-offs and reflection.

#### Why it exists
Because "tell me about a system you built" tests depth, judgement and honesty in one question, and an unstructured answer wastes the opportunity.

#### Interview explanation
Open with the problem and its scale in two sentences. Sketch the architecture and justify each component. Walk one request end to end. Then go to the parts that show seniority: consistency boundaries, what happens when a dependency fails, how you know the system is healthy, the trade-offs you accepted and what you would change. Pause to let the interviewer steer.

#### Syntax
```text
Problem (30s) → Architecture (2 min) → Key flow (2 min) → Failure & consistency (2 min)
→ Operations (1 min) → Trade-offs & what I'd change (1 min) → questions
```

#### Example
```text
"The order service takes about 200 orders a second at peak. It's a Spring Boot modular
monolith on PostgreSQL. Placing an order is one local transaction that also writes an
outbox row, so the OrderPlaced event can't be lost or published for a rolled-back order.
Payment is called with a 2-second timeout behind a circuit breaker; if it's unavailable
the order stays pending and is settled from the event. The trade-off is that shipping
sees orders a second or two later — fine for the business. If I did it again, I'd add
keyset pagination from the start; offset paging hurt our export jobs."
```

#### Common interview questions
- "Walk me through a system you built." (Problem and scale, architecture with reasons, one key flow end to end, failure handling and consistency, observability, trade-offs and what you would change.)
- "What was the hardest problem you solved in it?" (A specific incident or design challenge, what you tried, what worked, and the measurable outcome.)
- "How does it scale?" (Name the current bottleneck, how you know it from metrics, and the next step — more instances, read replicas, caching, partitioning — with its cost.)
- "What would you do differently?" (One or two concrete, honest changes and why, showing you learned from operating it.)

#### Follow-up questions
- "What happens if the database fails over?" (Connections drop, in-flight transactions fail and are retried by clients with idempotency keys, and the pool reconnects to the new primary.)
- "How do you know it is working right now?" (SLO dashboards, burn-rate alerts, traces across the event flow and consumer-lag monitoring.)
- "Why did you choose Kafka over a simple queue?" (Replayability, multiple independent consumers and ordering per key — or, honestly, if a simpler queue would have done, say so.)

#### Edge cases
- Under NDA, describe the architecture generically and omit names and figures you cannot share.
- With only junior experience, describe your part in depth and the surrounding system as you understood it.
- If asked about a technology you did not use, say so and reason from first principles.

#### Common mistakes
- Listing technologies instead of decisions.
- Claiming everything went perfectly.
- Talking for ten minutes without checking in.

#### Comparisons

| | Weak answer | Strong answer |
|---|---|---|
| Focus | Tools used | Problems and decisions |
| Failure | Not mentioned | Explicit, with handling |
| Trade-offs | None | Named and justified |
| Numbers | None or invented | Approximate and real |

#### Frequently confused with
System walkthrough versus system design interview — the walkthrough describes something real you built; system design asks you to design something new on the spot. The same arc serves both.

#### Important facts to remember
- Decisions and reasons, not inventory.
- Name failure modes and trade-offs.
- Leave room for the interviewer to steer.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Where to Go Next

You can now answer interview questions across the full Spring Boot backend surface — the container, web layer, persistence, transactions, security, testing, messaging and production operations — including the edge cases and follow-ups that separate reading from experience.

Continue to **`3_production.md`**, the final iteration: how professionals actually run this — best practices, the bugs that reach incident reviews, performance and security implications, monitoring, and the modern-versus-deprecated split.
