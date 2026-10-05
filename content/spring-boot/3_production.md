# Spring Boot — Production

> **Goal of this file:** Show how professionals actually run Spring Boot services. After reading, you should be able to say *"I can build and operate this correctly."* Best practices, the bugs that reach incident reviews, performance, security, debugging and the modern-versus-deprecated split.

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

**Best practices:** Pin the Spring Boot version through its parent POM or BOM and let it manage every Spring dependency version. Mixing module versions by hand is the fastest route to `NoSuchMethodError` at runtime rather than a build failure.

**Common production bugs:** Upgrade incidents caused by the `javax.*` to `jakarta.*` migration in Boot 3 — a library that still compiles against the old namespace fails at runtime with `NoClassDefFoundError`, often only on the code path that uses it.

**Maintainability:** Keep framework code at the edges. Business logic in classes that do not import anything from `org.springframework` stays testable, portable and understandable long after the framework version has moved on.

**Modern recommendations:** Run a Spring Boot line that still receives open-source support, on Java 17 or later. This curriculum is written against Spring Boot 3.x, the generation built on Spring Framework 6; Spring Boot 4, built on Spring Framework 7, followed in November 2025, so new projects should start on 4.x and 3.x applications should plan the upgrade — see the upgrade concept in Group 12. Each minor line gets roughly a year of open-source support, so an annual upgrade cadence is the cheapest schedule; falling several versions behind turns a routine bump into a project.

**Anti-pattern:** Adding a Spring module because it exists. Every starter brings auto-configuration, properties and failure modes you now own — reach for one when the problem is real, not pre-emptively.

---

### 1.2 Inversion of Control

**Best practices:** Inject collaborators, never look them up. A class should be constructible in a test with ordinary Java, which is the practical test of whether its dependencies are honest.

**Common production bugs:** Static holders and singletons reintroduced alongside Spring — a `DataSourceHolder.get()` or a static `ObjectMapper` configured differently from the container's — so two code paths behave differently and only one is covered by tests.

**Testing advice:** If testing a class requires starting the context, its dependencies are implicit. Constructor injection plus plain fakes gives tests that run in milliseconds and fail with clear messages.

**Maintainability:** Dependencies in the constructor are the class's documented requirements. When that list grows past four or five, treat it as evidence the class has accumulated responsibilities, not as a reason to switch to field injection.

**Anti-pattern:** Using `ApplicationContext` as a service locator inside business code. It compiles, it works, and it makes every consumer of that class depend on a running container.

---

### 1.3 The ApplicationContext

**Best practices:** Let the context fail fast. Keep singletons eager, validate configuration at startup with `@ConfigurationProperties` validation, and prefer a crash at boot over a `NullPointerException` on the first request at 3 a.m.

**Common production bugs:** A context that starts in staging and fails in production because a profile-specific bean is missing. Running the same startup validation in every environment — including a smoke test that boots the context in CI — catches it before deploy.

**Performance considerations:** Startup time is dominated by bean count, component-scan breadth and auto-configuration evaluation. `spring.main.lazy-initialization=true` can cut it dramatically, but it defers failures to runtime — acceptable for local development, risky in production.

**Debugging tips:** Read Spring Boot's failure analysis block first — it names the missing bean or conflicting property in plain English. For deeper problems, `--debug` prints the auto-configuration report showing what matched and why, and `/actuator/beans` lists every bean the context holds and what each depends on — the graph itself. An INFO line saying a bean "is not eligible for getting processed by all BeanPostProcessors" means it was built before the proxy-makers existed, usually because a post-processor depends on it — so its `@Transactional` or `@Cacheable` does nothing.

**Monitoring:** A context that fails to start throws out of `SpringApplication.run()` and the process exits, so the orchestrator sees a crash-loop — alert on restarts rather than letting them retry silently. For an instance that is still starting, readiness does the work: Spring Boot reports `ACCEPTING_TRAFFIC` only after `ApplicationReadyEvent`, so exposing the readiness and liveness groups of `/actuator/health` and pointing the readiness probe at `/actuator/health/readiness` keeps traffic away from a half-started process. Startup failures should be visible as crash-loops, not as silent 500s.

---

### 1.4 Beans and the Bean Lifecycle

**Best practices:** Keep `@PostConstruct` fast and local — validate configuration, build in-memory structures. Anything requiring the network belongs behind `ApplicationReadyEvent` or a scheduled warm-up, so the process becomes live quickly.

**Common production bugs:** Slow startup caused by cache pre-loading in `@PostConstruct`. The web server starts only after every bean is built, so the pod is unreachable meanwhile — and if a startup or liveness probe gives up before then, the orchestrator kills and restarts it in a loop.

**Real-world use case:** Graceful shutdown. With `server.shutdown=graceful`, Spring stops accepting new requests, lets in-flight ones finish within a timeout, then runs destroy callbacks — which is what makes rolling deploys invisible to users.

**Debugging tips:** When shutdown hangs, a non-daemon thread started in a bean is usually holding the JVM open. Name your threads and dump them with `jstack` — the name tells you which bean created it.

**Anti-pattern:** Treating `@PreDestroy` as a durability mechanism. It does not run on `kill -9`, OOM kills or hardware failure, so anything that must survive belongs in a store before the method returns, not in a shutdown hook.

---

### 1.5 Component Scanning and Stereotypes

**Best practices:** Put the application class in the root package of your code and nothing above it. Keep the scanned tree to your own packages, and register third-party objects with explicit `@Bean` methods rather than widening the scan.

**Common production bugs:** A refactor moves a package out of the scanned tree, so a `@Component` silently stops being registered. The failure surfaces as a missing bean at startup — or worse, as a feature that quietly does nothing if the dependency was optional.

**Performance considerations:** Broad base packages slow startup, and in large codebases the effect is measurable in seconds. Narrow the scan or split the application before reaching for lazy initialisation.

**Debugging tips:** `/actuator/beans` lists every registered bean with its type and dependencies — the fastest way to confirm whether a class was scanned at all, and which instance won when there were several.

**Maintainability:** Use `@Repository` on data-access classes deliberately. Exception translation turns the persistence provider's runtime exceptions — a Hibernate constraint violation, say — into Spring's `DataAccessException` hierarchy, so switching provider or database does not ripple into service-layer catch blocks.

---

### 1.6 Dependency Injection Styles

**Best practices:** Constructor injection everywhere, `final` fields, no `@Autowired` on single-constructor classes. Make the rule a lint check so it does not depend on review attention.

**Common production bugs:** A field-injected class constructed with `new` somewhere — a test, a factory, a static helper — where nothing fills the fields, so the `NullPointerException` appears only on that path. Constructor injection makes that construction impossible without the dependencies.

**Testing advice:** A test that needs `@SpringBootTest` to construct one service is telling you the wiring is implicit. Constructor-injected classes are instantiated directly, so unit tests stay fast and the failure points at your code rather than at context startup.

**Maintainability:** Resist `spring.main.allow-circular-references=true`. The cycle is a design statement — two classes that need each other are usually one concept split badly, or are missing a third collaborator.

**Anti-pattern:** `@Autowired` on fields in production code combined with reflection-based test setup. It works, it is fragile, and it hides the exact information a reader needs most.

---

### 1.7 Configuration Classes and @Bean

**Best practices:** Group related beans into small, named configuration classes — `CacheConfig`, `HttpClientConfig`, `SecurityConfig` — and take `@ConfigurationProperties` objects as method parameters so configuration is typed and validated.

**Common production bugs:** A bean-producing class annotated `@Component` instead of `@Configuration`, so inter-method calls create duplicates. Two connection pools or two caches appear, each half-sized, and the symptom is intermittent exhaustion under load.

**Real-world use case:** Environment-specific implementations — a real payment gateway in production, a stub in development — selected by `@ConditionalOnProperty` or `@Profile` in one configuration class rather than by branching inside the service.

**Security implications:** Never hardcode credentials in a configuration class. Bind them from the environment or a secrets manager, and keep them out of `toString()` and the `/actuator/configprops` output — Boot 3 masks every value there by default, but enabling `show-values` re-exposes all of them.

**Modern recommendations:** Prefer `@ConfigurationProperties` records over scattered `@Value` fields. One typed object, validated at startup, beats a dozen string injections discovered to be misspelled at runtime.

> ⚠️ **Warning:** Marking a `@Configuration` class or its `@Bean` methods `final` breaks CGLIB proxying, so in full mode Spring refuses it at startup. The silent version of the same bug is a `@Component` — or `@Configuration(proxyBeanMethods = false)` — whose `@Bean` methods call each other: no error, just duplicate objects.

---

### 1.8 Bean Scopes

**Best practices:** Keep every `@Service`, `@Repository` and `@Component` stateless. Pass state as parameters, return it as values, and store anything longer-lived in a database or cache rather than in a field.

**Common production bugs:** A mutable field on a singleton service — a cached "current tenant", an accumulating list — shared across concurrent requests. Under load, users see each other's data, and the bug is invisible in single-user testing.

**Security implications:** This is the classic cross-request data-leak vector in Spring applications. Treat any mutable instance field on a singleton as a security finding, not just a correctness one, and enforce it in review.

**Performance considerations:** Request-scoped beans with scoped proxies add a resolution step per call. For simple per-request values, a `ThreadLocal`-backed context or passing the value explicitly is cheaper and easier to reason about.

**Testing advice:** Write a concurrency test for any service you suspect of holding state: hit it from several threads with distinct inputs and assert each caller got its own result. It takes ten lines and catches the whole class of bug.

---

### 1.9 Qualifiers and Ambiguity

**Best practices:** Use custom qualifier annotations rather than string literals, mark exactly one implementation `@Primary`, and prefer `Map<String, T>` injection when the set of implementations is genuinely open.

**Common production bugs:** A newly added second implementation of an existing interface breaks startup across unrelated services that injected it by type. The fix is trivial; the surprise is that adding a class broke something that previously compiled and ran.

**Real-world use case:** Strategy registries — payment providers, export formats, notification channels — assembled by injecting a map keyed by bean name, so adding a provider is a new class and nothing else.

**Maintainability:** String qualifiers are invisible to refactoring tools and to compile-time checking. A custom `@Sandbox` annotation meta-annotated with `@Qualifier` is found by your IDE and fails the build when removed.

**Testing advice:** When a test context defines a test double of a production type, mark the double `@Primary` in the test configuration rather than excluding the real bean. It keeps the production wiring intact and the override explicit.

---

### 1.10 Proxies and AOP

**Best practices:** Put `@Transactional`, `@Cacheable` and `@PreAuthorize` on public methods called from other beans. If a method needs the behaviour and is called internally, move it to a collaborator — that is the design the proxy model expects.

**Common production bugs:** The self-invocation trap. A refactor turns a call to another bean into a call on `this`, the call stops passing through the proxy, the transaction silently disappears, and a multi-step operation starts committing partially. Nothing fails loudly; the data is simply inconsistent afterwards.

**Debugging tips:** When an annotation seems ignored, check three things in order, each a way of missing the proxy: is the call coming from another bean rather than `this`, can a subclass override the method (it cannot if it is `private`, `static` or `final`), and is the class itself `final`. `AopUtils.isAopProxy(bean)` confirms whether the instance you hold is proxied at all.

**Performance considerations:** Proxy overhead is one extra dispatch and is irrelevant next to the advice's own work. What does matter is accidental stacking — security, transactions, caching and retry on the same method each add a layer, and their `@Order` determines whether a retry happens inside or outside the transaction.

**Anti-pattern:** Writing custom aspects for business logic. Cross-cutting infrastructure is a good fit; business rules hidden in an aspect are invisible at the call site and routinely surprise the next person to read the method.

> 💡 **Tip:** Put `@Transactional` on the service method that defines the unit of work, never on the repository. The repository is one step; the business operation is the boundary that must commit or roll back as a whole.

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

**Best practices:** Treat Boot's defaults as the baseline and override by declaring beans, not by accumulating property overrides. A single `@Bean` method states intent far better than four properties that approximate it.

**Common production bugs:** A dependency added for one helper class activates its auto-configuration and changes runtime behaviour. Adding `spring-boot-starter-security` without configuring it locks every endpoint behind a login — a form for browsers, HTTP Basic for other clients — with a generated password: a surprise outage on deploy.

**Maintainability:** Keep an explicit list of the auto-configurations you rely on in architecture notes. The implicit ones are fine until an upgrade changes a default and nobody knows which behaviour was deliberate.

**Modern recommendations:** Stay on a Spring Boot line that still receives support and upgrade minor versions at least annually. Boot's open-source support windows are short by enterprise standards — the 3.x generation has already been succeeded by Boot 4 — and the `javax`-to-`jakarta` migration showed what deferred upgrades cost.

**Anti-pattern:** Disabling auto-configurations one by one to regain control. If you are excluding several, the honest move is to define the configuration explicitly and stop depending on inference.

---

### 2.2 Starters and Dependency Management

**Best practices:** Inherit from the parent POM or import the BOM, declare dependencies without versions, and change a managed version only through its property. Audit the dependency tree when upgrading major Boot versions.

**Common production bugs:** A hand-pinned library version that diverges from the managed set, producing `NoSuchMethodError` or `NoClassDefFoundError` at runtime on a code path that tests never exercised.

**Security implications:** Starters bring transitive dependencies you did not choose, so they are part of your attack surface. Run a dependency vulnerability scan in CI, and remove starters that are no longer used rather than leaving them "just in case".

**Performance considerations:** Every starter adds classes to scan and auto-configurations to evaluate at startup. Trimming unused starters is one of the cheapest startup-time improvements available.

**Debugging tips:** `mvn dependency:tree -Dincludes=<group>` answers which version is winning and who requested it. For Gradle, `gradle dependencyInsight --dependency <name>` does the same.

---

### 2.3 Auto-Configuration

**Best practices:** Know how to read the condition evaluation report, and prefer defining a bean to excluding an auto-configuration. Pin behaviour you depend on explicitly so an upgrade cannot change it silently.

**Common production bugs:** An upgrade changes a default — a connection-pool size, a Jackson setting, a security default — and behaviour shifts with no code change. Release notes list these; reading them is the only reliable defence.

**Debugging tips:** `/actuator/conditions` shows positive and negative matches at runtime, which is more convenient than `--debug` in a deployed environment. It is the fastest way to answer "why is this bean not what I expected?".

**Maintainability:** Write your own auto-configuration only for genuinely shared platform concerns across many services. For a single application, ordinary `@Configuration` is clearer and easier to follow.

**Anti-pattern:** Relying on auto-configuration for anything security-relevant without reading what it does. Defaults are chosen for getting started, not for your threat model.

---

### 2.4 The Embedded Server

**Best practices:** Enable graceful shutdown, set a connection timeout, and size the thread pool against your slowest downstream dependency rather than upward until errors stop. Put a timeout on every outbound call so a thread is never held indefinitely.

**Common production bugs:** Thread-pool exhaustion caused by a downstream service that slowed rather than failed. Every worker thread blocks on it, the service stops responding entirely, and the dependency's own dashboard looks merely "slow".

**Scalability concerns:** Maximum concurrency is the thread-pool size, and the database connection pool is usually smaller. Raising one without the other just moves the queue. Scale horizontally once a single instance is saturated at a healthy latency.

**Monitoring:** Export `tomcat.threads.busy`, `tomcat.threads.config.max` (they need `server.tomcat.mbeanregistry.enabled=true`) and the connection-pool gauges. Busy threads approaching the maximum is the earliest reliable warning of saturation — well before error rates move.

**Modern recommendations:** On Java 21, virtual threads (`spring.threads.virtual.enabled=true`) remove the thread-per-request ceiling for blocking I/O workloads. Benchmark it rather than assuming: on JDK 21–23 a `synchronized` block pins a virtual thread to its carrier thread (JDK 24 removed that limitation), and native calls still pin, either of which can negate the benefit.

> ⚠️ **Warning:** A missing timeout on an outbound call is the single most common cause of a Spring MVC service becoming unresponsive. The thread pool is finite; a call with no timeout can hold a thread indefinitely.

---

### 2.5 External Configuration

**Best practices:** Package only defaults; supply every environment-specific value from outside. Keep secrets in a secrets manager or injected environment variables, and never in a file inside the artifact.

**Common production bugs:** A stray environment variable silently overriding a reviewed configuration file, because environment variables outrank files. The value in the repository looks right and is not what is running.

**Security implications:** `/actuator/env` and `/actuator/configprops` expose configuration. Secure the actuator endpoints. Since Boot 3.0 their values are masked by default; keep it that way (`show-values: never` or `when-authorized`), because once values are shown, nothing distinguishes a password under an unusual key name from any other string.

**Debugging tips:** When a value is not what you expect, `/actuator/env` names the winning `PropertySource`. That single view settles most "but the file says…" discussions in minutes.

**Monitoring:** Log the active profiles and a small set of non-secret configuration values at startup. When behaviour differs between two instances, the startup log is the first place to compare.

---

### 2.6 Profiles

**Best practices:** Keep the profile set small — typically `dev`, `test`, `prod` — and limit differences to infrastructure. Use profile groups when a deployment needs several, so activation stays a single value.

**Common production bugs:** Code behind `@Profile("prod")` that no other environment runs, so its first real execution is in production. Anything production-only should be exercised by at least one automated test with that profile active.

**Testing advice:** Run integration tests with a profile that matches production wiring as closely as possible — real database via Testcontainers, real security filter chain — rather than a permissive `test` profile that bypasses the components most likely to break.

**Maintainability:** Document what each profile means in the README. Profiles accumulate; six months later nobody remembers whether `staging` implies `prod` wiring with different URLs or something else entirely.

**Anti-pattern:** Feature flags implemented as profiles. Profiles are startup-time environment selection; rolling a feature out gradually needs runtime flags with their own tooling.

---

### 2.7 Type-Safe Configuration Properties

**Best practices:** One properties record per concern, `@Validated` with Bean Validation constraints, injected into the `@Bean` methods and services that need it. Add the configuration processor so your properties are documented in the IDE.

**Common production bugs:** A missing required property failing at first use rather than at startup — typically on a code path that runs hours after deploy. Validation turns that into a startup failure the deployment pipeline catches.

**Security implications:** Keep secrets out of `toString()`. Records generate one that includes every component, so a logged properties object can leak credentials; override it or keep secrets in a separate holder.

**Testing advice:** Test binding with `ApplicationContextRunner` and `withPropertyValues`, including the invalid cases — a negative timeout, a malformed URL — to prove validation fires rather than assuming it does.

**Maintainability:** A properties class is the documented configuration surface of your service. Keeping it current is cheaper than maintaining a separate configuration document that drifts.

---

### 2.8 Project Structure and Build

**Best practices:** Application class at the root, packages by feature, a `config` package for cross-cutting configuration, and tests mirroring the main tree. Keep the build reproducible — pinned plugin versions, no dynamic dependency ranges.

**Common production bugs:** A refactor moves code outside the scanned tree, so a component silently stops being registered. With an optional dependency, the application starts and the feature simply never runs.

**Maintainability:** Package boundaries are the cheapest architectural control available. Feature packages make cross-feature dependencies visible in imports, which is where creeping coupling first appears.

**Scalability concerns:** A single module eventually makes builds and startup slow. Split by bounded context when that happens, accepting that cross-module changes become multi-step — which is itself a useful constraint.

**Testing advice:** Enforce package rules with an architecture test (ArchUnit): controllers must not import repositories, domain must not import framework packages. It catches drift that review misses.

---

### 2.9 Application Startup and Runners

**Best practices:** Use runners for fail-fast verification — connectivity checks, configuration assertions — and keep them fast. Anything slow belongs behind readiness, not in front of it.

**Common production bugs:** Runner work that takes minutes. Readiness turns on only after runners finish, so the pod stays out of rotation and rolling deployments stall waiting for it; and where a startup or liveness probe is pointed at the readiness endpoint, the orchestrator kills the pod before it ever becomes ready — a crash-loop that looks like an application failure.

**Real-world use case:** Verifying at startup that required secrets are present and the database is reachable. Failing immediately on deploy is far better than serving errors once traffic arrives.

**Monitoring:** Record application startup time as a metric — Boot publishes `application.started.time` and `application.ready.time` through Actuator. Regressions there predict deployment problems before they cause them.

**Anti-pattern:** Data seeding or schema changes from a runner. Across replicas they race; use a migration tool that takes a lock and records versions.

---

### 2.10 Packaging and Running

**Best practices:** Build layered images, run as a non-root user, set `MaxRAMPercentage`, and add `-XX:+ExitOnOutOfMemoryError` so an OOM kills the process and lets the orchestrator replace it instead of leaving it degraded.

**Common production bugs:** Fixed `-Xmx` exceeding the container memory limit, so the container is OOM-killed by the kernel with no JVM diagnostics — the heap dump you want is never written.

**Security implications:** Keep the base image minimal and current, run as non-root, and scan images in CI. A JRE base image rather than a full JDK removes compilers and tooling an attacker could use.

**Performance considerations:** Startup time matters for autoscaling and serverless. Class data sharing, lazy initialisation and — where the trade-offs suit — native images each reduce it; measure the effect on your own application before committing.

**Modern recommendations:** Buildpacks (`spring-boot:build-image`) produce reasonable images without a Dockerfile and keep base images patched. A hand-written layered Dockerfile is still the right choice when you need precise control.

> 💡 **Tip:** Add `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` and mount a volume for it. The first OOM in production is the one chance to capture what was actually in the heap.

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

**Best practices:** Keep methods semantically correct — `GET` never mutates, `PUT` and `DELETE` stay idempotent — and give non-idempotent creation endpoints an idempotency key so clients can retry safely after a timeout.

**Common production bugs:** Duplicate orders created when a client retried a timed-out `POST`. The server completed the first request; only the response was lost. Without an idempotency key there is no way for the server to tell the two apart.

**Scalability concerns:** Statelessness is what lets you run many instances behind a load balancer. Any server-side session state — an in-memory cache keyed by user, a sticky conversation — turns horizontal scaling into a distributed-state problem.

**Security implications:** Never place secrets, tokens or personal identifiers in a URL. Query strings are logged by proxies, load balancers and browsers, and appear in referrer headers. They belong in headers or the body.

**Monitoring:** Track request rate, latency percentiles and error rate per endpoint and per status class. A rising 4xx rate is usually a client or contract problem; a rising 5xx rate is yours.

---

### 3.2 The DispatcherServlet

**Best practices:** Keep controllers thin — bind, delegate, return. Anything you are tempted to add to the dispatch pipeline is usually better as a filter, an interceptor or a `@ControllerAdvice`.

**Common production bugs:** A custom message converter or argument resolver registered in a way that replaces Boot's defaults, so every other endpoint quietly loses JSON handling. Add to the list; do not substitute it.

**Debugging tips:** `logging.level.org.springframework.web=DEBUG` reveals which handler matched and which converter ran — the fastest path from "the parameter is null" to the cause. Turn it off again before deploying; it is extremely verbose.

**Performance considerations:** Dispatch overhead is small and constant. Where request handling actually costs is serialisation of large payloads and whatever the handler does — profile there, not in the framework.

**Monitoring:** `/actuator/mappings` in a running service answers "is this route even registered?", which is the first question when a deployment returns unexpected 404s.

---

### 3.3 Controllers and Request Mapping

**Best practices:** One controller per resource, a class-level base path, shortcut mapping annotations, and no business logic. Controllers are an adapter between HTTP and your service layer.

**Common production bugs:** The Spring 6 trailing-slash change breaking existing clients after an upgrade — `/api/orders/` returns 404 where it previously worked. Either fix the clients or restore the behaviour deliberately, with a comment explaining why.

**Maintainability:** Keep paths consistent — plural nouns, lower case, hyphens — across every controller. Inconsistency is invisible to the compiler and permanently visible to every consumer of the API.

**Testing advice:** Test controllers with `@WebMvcTest` and `MockMvc`: it loads the web layer only, so tests are fast and failures point at mapping, binding, serialisation or status rather than at business logic.

**Anti-pattern:** Controllers that call repositories directly. It skips the service layer where transactions and business rules belong, and it leaks persistence concerns into the HTTP layer.

---

### 3.4 Binding Request Data

**Best practices:** Validate at the boundary with `@Valid`, give optional parameters defaults, and bind groups of query parameters into a record rather than growing the signature.

**Common production bugs:** A build without `-parameters`, so binding that relies on parameter names fails at runtime while working in an IDE that compiled with the flag. Boot's parent POM and Gradle plugin set it; a hand-rolled build may not.

**Security implications:** Bind to purpose-built request DTOs, never to entities. Binding directly to an entity is mass assignment — a client can set `role`, `status` or `price` fields you never intended to expose.

**Testing advice:** Test the binding failures as well as the successes: missing required parameter, wrong type, malformed body, constraint violation. Each produces a different exception and a different response, and clients depend on all of them.

**Debugging tips:** A 400 with an unhelpful message usually means binding failed before your code ran. Enable web debug logging to see which resolver rejected the request and why.

---

### 3.5 Responses and Status Codes

**Best practices:** Choose codes deliberately, return `Location` on 201, use 204 for deletes, and keep 5xx for genuine server faults so alerting on it stays meaningful.

**Common production bugs:** Business failures returned as 500, which drowns the error-rate alert in noise until nobody trusts it. Validation and conflict are 4xx; only unexpected faults are 5xx.

**Security implications:** Error bodies must not leak internals. Stack traces, SQL fragments and class names in a response give an attacker a map of the system. Log the detail, return a reference id.

**Monitoring:** Alert on 5xx rate and on latency percentiles, not on average latency. Averages hide the tail, and the tail is what users experience during an incident.

**Maintainability:** Document the full set of status codes each endpoint can return, in OpenAPI. Clients code against that contract, and undocumented codes are what break integrations.

> ⚠️ **Warning:** Returning 200 with an error payload makes every dashboard, load balancer health check and client retry policy believe the request succeeded. It is the single most damaging status-code mistake.

---

### 3.6 JSON Serialization

**Best practices:** Dedicated request and response DTOs, explicit date formats in UTC, money as a string or integer minor units, and `@JsonInclude(NON_NULL)` only where an absent field genuinely means "unset".

**Common production bugs:** Serialising an entity with a lazy association, which either issues extra queries during serialisation or throws `LazyInitializationException` while the response is being written — and once the body has started streaming, the status is already 200, so the client receives truncated JSON with a success code.

**Security implications:** Serialising entities exposes every field, including ones added later. A `passwordHash` or `internalNotes` column added next year silently appears in the API. DTOs make exposure a deliberate act.

**Performance considerations:** Large JSON payloads dominate response time. Page results, project only the fields needed, and consider streaming for exports — not doing the work beats doing it faster.

**Testing advice:** Assert on the serialised JSON, not just the object — with `MockMvc` and JSONPath — so a renamed field or a changed date format fails a test rather than a client.

---

### 3.7 Content Negotiation

**Best practices:** Standardise on JSON, declare `produces` and `consumes` explicitly on endpoints that matter, and document the expected media types. Support additional formats only when a consumer genuinely needs them.

**Common production bugs:** A client omitting `Content-Type` and receiving 415, with the team debugging the controller rather than the request. Logging the rejected media type turns this into a thirty-second diagnosis.

**Debugging tips:** Reproduce with `curl -v` and inspect the request headers. 406 and 415 are header problems by definition, so the fix is almost never in the handler.

**Maintainability:** Media-type versioning is elegant but hard to debug and poorly supported by simple clients. URL versioning is uglier and far easier to operate — choose based on who consumes the API.

**Anti-pattern:** Supporting several response formats "for flexibility" with no consumer asking for them. Each one doubles the serialisation surface you must test and keep consistent.

---

### 3.8 Designing a CRUD API

**Best practices:** Page every collection with a maximum page size, filter through a documented whitelist, use one error contract, and version from the first external release rather than retrofitting.

**Common production bugs:** An unbounded list endpoint that worked for two years and then timed out when a tenant grew past a hundred thousand rows — returning a huge payload and holding a thread for the duration.

**Scalability concerns:** Deep offset pagination degrades badly, because the database must skip every preceding row. Keyset pagination — "give me the next page after this id" — stays constant-time and is stable while rows are inserted.

**Security implications:** Never pass user input into a sort or filter expression unchecked. Spring Data will happily sort by a field you did not intend to expose, which is both an information leak and a denial-of-service vector on unindexed columns.

**Maintainability:** An API is harder to change than the code behind it. Treat breaking changes as versioned releases with a deprecation window, and keep the error shape stable even as endpoints evolve.

> 💡 **Tip:** Cap `size` server-side. A client requesting `?size=100000` should receive your maximum, not an attempt to serve it.

---

### 3.9 Filters and Interceptors

**Best practices:** One filter for correlation ids that always clears MDC in a `finally`, security as a filter, and timing or auditing as interceptors. Keep both fast — they run on every request.

**Common production bugs:** MDC values leaking between requests through pooled threads, so logs attribute one user's activity to another. It is a correctness bug and, in regulated environments, a compliance one.

**Performance considerations:** Body-caching wrappers buffer the entire request and response in memory. Enabling them globally to log payloads multiplies memory use per in-flight request and can push a service into OOM under load.

**Security implications:** Filters run before authentication unless ordered after Spring Security's chain. A logging filter placed early will log credentials from unauthenticated requests — redact deliberately, and know where in the chain you sit.

**Monitoring:** Emit a correlation id on every request and include it in the response header and every log line. When a user reports a failure, that one value turns an investigation into a single query.

---

### 3.10 Calling Other Services

**Best practices:** One client bean per downstream service, explicit connect and read timeouts, typed error translation, retries only for idempotent calls with back-off and jitter, and a circuit breaker for dependencies that fail repeatedly.

**Common production bugs:** A downstream service slowing from 50 ms to 20 s without failing, holding every server thread until the service stops responding. The dependency's dashboard shows "degraded"; yours shows a total outage.

**Performance considerations:** Reuse the client so connections pool. Creating one per call pays TCP and TLS setup every time and exhausts ephemeral ports under load — a failure that appears as intermittent connection refusals.

**Monitoring:** Instrument per-dependency latency, error rate and timeout count. Aggregate service metrics cannot tell you which downstream is degrading, which is the first thing you need during an incident.

**Modern recommendations:** `RestClient` for blocking code, `@HttpExchange` interfaces when the API is stable enough to describe declaratively, Resilience4j for retries and circuit breaking, and Micrometer Tracing to propagate context across the call.

> ⚠️ **Warning:** A retry without a circuit breaker amplifies an outage. When a dependency fails, three retries per request triple the load on a service that is already failing.

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

**Best practices:** Enforce the layer rules mechanically rather than by review. An ArchUnit test asserting that controllers never import repositories, and that domain classes never import `org.springframework`, costs ten lines and holds for years.

**Common production bugs:** A controller calling a repository for "just a read", which then grows a write, bypasses the transaction, and leaves a partially applied change the day it fails halfway.

**Maintainability:** Layer violations are invisible to the compiler and accumulate quietly. By the time they are obvious, the service has no boundaries left and every change touches everything.

**Testing advice:** Test each layer at its own level — `@WebMvcTest` for controllers, plain unit tests for services, `@DataJpaTest` for repositories — and keep a small number of end-to-end tests for the paths that matter most.

**Anti-pattern:** A "service" layer that only forwards calls to repositories. It adds a file per entity and no behaviour; either the rules belong there or the layer is ceremony.

---

### 4.2 The Controller Layer

**Best practices:** Keep handlers to a few lines, return DTOs, let exceptions carry failure upward, and document every endpoint's status codes in OpenAPI so clients code against a real contract.

**Common production bugs:** Business logic that crept into controllers and is therefore skipped by a scheduled job or a Kafka consumer performing the "same" operation — two paths, one rule, enforced once.

**Security implications:** Controllers are the trust boundary. Validate and bind to DTOs here, never to entities, and never echo back raw input in error messages where it could carry an injection payload into a downstream consumer.

**Testing advice:** `@WebMvcTest` with a mocked service verifies status codes, serialisation and validation quickly. Those are exactly the behaviours clients depend on and that unit tests of the service cannot cover.

**Monitoring:** Tag request metrics by endpoint rather than by raw URI. Path variables in metric names create unbounded cardinality that will eventually break your metrics backend.

---

### 4.3 The Service Layer

**Best practices:** One service method per use case, transaction on the method, no remote calls inside the transaction, and domain events published for side effects so the main operation stays focused.

**Common production bugs:** An external HTTP call inside `@Transactional`. Under load every thread holds both a connection and an open transaction while waiting, and the pool is exhausted long before the dependency recovers.

**Performance considerations:** Long transactions hold locks and connections. Load what you need, decide, write, commit. Anything that can happen after the commit — emails, notifications, cache invalidation — should, via `@TransactionalEventListener(AFTER_COMMIT)`.

**Testing advice:** Unit-test the rules with fakes and integration-test the transaction behaviour, including rollback. A test asserting that a failure mid-operation leaves nothing persisted is worth more than a dozen happy-path tests.

**Maintainability:** When a service exceeds a few hundred lines, split by use case rather than adding sections. Entity-named services grow forever because every new feature "belongs" to them.

> ⚠️ **Warning:** Side effects inside a transaction that later rolls back still happened. Emails sent, messages published and files written are not undone — publish them after commit, not before.

---

### 4.4 The Repository Layer

**Best practices:** Return projections for list views, page everything, write explicit `@Query` with join fetches where the access pattern matters, and keep the repository focused on one aggregate.

**Common production bugs:** The N+1 query problem — a list endpoint loading 50 orders then issuing 50 more queries for their lines. Response time grows with the page size and nobody notices until the data does.

**Performance considerations:** The repository API hides the SQL, so an inefficient query reads identically to an efficient one. Log SQL in development, inspect query plans for the important paths, and index the columns you filter and sort by.

**Monitoring:** Track query counts per request as well as latency. A sudden jump in queries per request is the signature of an accidental lazy-loading regression, and it precedes the latency alert.

**Testing advice:** `@DataJpaTest` with Testcontainers against the real database engine. H2 accepts SQL that PostgreSQL rejects and plans queries differently, so passing tests there prove less than they appear to.

---

### 4.5 DTOs and the API Boundary

**Best practices:** Separate request and response records per use case, validation on the request, explicit mapping, and no entity type anywhere in a controller signature.

**Common production bugs:** An entity returned from an endpoint gaining a new column — an internal note, a cost price, a password hash — which is then published to every API consumer with no code change at the controller.

**Security implications:** This is the mass-assignment and over-exposure boundary. Binding requests to entities lets clients write fields you never intended; serialising entities lets them read fields you forgot existed.

**Maintainability:** DTOs make the API contract explicit and reviewable in a pull request. A change to the published shape becomes a visible diff rather than an invisible consequence of a schema change.

**Testing advice:** Assert on the serialised JSON for every public endpoint. A field rename in a DTO should fail a test, not a client integration two weeks later.

---

### 4.6 Mapping Between Layers

**Best practices:** Pick one mapping approach per codebase and apply it consistently. Compile-time generation or hand-written factories; avoid runtime reflection mappers in anything performance- or correctness-sensitive.

**Common production bugs:** A reflection-based mapper silently producing nulls after a field rename, so an API starts returning `null` for a populated column with no error anywhere in the logs.

**Performance considerations:** Mapping is cheap per object and expensive per million. In batch paths, map once and avoid intermediate representations; in request paths, the cost is irrelevant next to I/O.

**Testing advice:** Test mappers field by field, including nulls and boundary values. They are pure functions — the cheapest possible tests, and they catch exactly the bugs that are otherwise invisible.

**Anti-pattern:** Business logic inside mappers. A mapper that computes a discount or decides a status hides a rule in the least expected place, and it will be duplicated the next time someone maps the same type.

---

### 4.7 Bean Validation

**Best practices:** Validate request DTOs at the controller, keep entity constraints as a last-resort safety net, and write custom validators for cross-field rules rather than checking them ad hoc in services.

**Common production bugs:** `@NotNull` used for required strings, so empty and whitespace-only values pass validation and fail later — often as a confusing database constraint violation or an empty field in a downstream system.

**Security implications:** Validation is an input-sanitising boundary. Bound string lengths and collection sizes explicitly — and cap the request body size at the server too, because validation runs only after the whole body has been parsed into memory.

**Testing advice:** Test the invalid cases, not just the valid ones, and assert the response body includes the offending field names. Clients build their form errors from that structure.

**Maintainability:** Keep constraint messages useful to API consumers, not to developers. Default messages leak implementation vocabulary and read poorly in a client's user interface.

---

### 4.8 Global Exception Handling

**Best practices:** One `@RestControllerAdvice`, `ProblemDetail` bodies, specific handlers for domain exceptions, and a catch-all that logs the stack trace at ERROR with a reference id returned to the client.

**Common production bugs:** No catch-all handler, so an unexpected exception produces Spring's default error response — which in some configurations includes the exception message and class name, leaking internals.

**Security implications:** Error responses are an information-disclosure channel. Stack traces, SQL fragments and bean names tell an attacker what you run and where. Keep the detail in logs and return a reference instead.

**Monitoring:** Count exceptions by type in the handler. That metric is the earliest signal of a new failure mode after a deploy, well before it shows up as an overall error rate.

**Testing advice:** Test the advice itself with `@WebMvcTest`: throw each handled exception from a stub controller and assert the status and body. Error paths are what clients see during incidents and are rarely covered.

> 💡 **Tip:** Include the correlation id from your logging filter in every error response. One value then links the client's screenshot to the exact log entry and stack trace.

---

### 4.9 Domain Modelling

**Best practices:** Put invariants in the entity that owns them, use value objects for money, quantities and identifiers, and expose intention-revealing methods instead of setters.

**Common production bugs:** An invalid state reached through a setter that bypassed the rule — an order cancelled after shipping, a negative quantity, a price in the wrong currency. Each is a rule that existed in a service but not in the object.

**Maintainability:** Rules enforced in the domain survive refactoring of the services around them. Rules enforced only in services are re-implemented, inconsistently, every time a new entry point appears.

**Testing advice:** Domain tests need no Spring context and run in milliseconds. A rich model turns most business testing into plain JUnit, which is both faster and more precise about what broke.

**Anti-pattern:** Treating entities as database rows with getters and setters while all meaning lives in services. It works at small scale and becomes a service layer nobody can safely change.

---

### 4.10 Hexagonal Architecture

**Best practices:** Adopt the parts that pay for themselves — domain-defined repository interfaces, framework annotations kept out of domain classes — and add full ports and adapters only where the domain is genuinely complex.

**Common production bugs:** Not the architecture's own, but its absence: business logic so entangled with JPA and HTTP that a framework upgrade or a storage change requires rewriting rules nobody fully remembers.

**Maintainability:** The real benefit is the test suite. A core with no framework dependencies can be tested exhaustively in seconds, which changes how willingly people refactor it.

**Scalability concerns:** Architectural, not operational. Clear boundaries are what let a service be split later; a tangled core is what makes extraction a rewrite.

**Anti-pattern:** Ceremony without benefit — ports with one adapter, mappers between near-identical shapes, and interfaces introduced because the style demands them. If the indirection protects nothing, it costs without paying.

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

**Best practices:** Model the data as the business describes it, not as your Java classes happen to be shaped. Declare foreign keys, pick surrogate primary keys, and treat the schema as a long-lived asset with its own review standards.

**Common production bugs:** Missing foreign keys allowing orphaned rows — order lines whose order was deleted, references to customers that no longer exist. The data is then wrong in a way no code change can fix retroactively.

**Maintainability:** Other systems will read your database — reporting tools, data pipelines, the next service. A schema that only makes sense alongside your ORM mappings makes every one of those harder.

**Scalability concerns:** Relational databases scale vertically well and horizontally with effort. Plan read replicas for read-heavy loads, and understand that sharding is a significant architectural change, not a configuration flag.

**Anti-pattern:** Omitting foreign keys "for performance". The write cost is small, the integrity guarantee is absolute, and data corruption is permanent.

---

### 5.2 SELECT and Filtering

**Best practices:** Name the columns you need, filter and sort in the database, page everything, and keep predicates sargable so indexes remain usable.

**Common production bugs:** A query that loads thousands of rows to filter them in Java. It passes tests against a small fixture and becomes the slowest endpoint in the service once real data arrives.

**Performance considerations:** `SELECT *` on wide tables transfers large unused columns and prevents index-only scans. Deep `OFFSET` pagination forces the engine to skip every preceding row; keyset pagination stays constant-time.

**Security implications:** Always use parameterised queries. String-concatenated SQL is injection, and an ORM does not protect you when you drop to native SQL with concatenation.

**Monitoring:** Log slow queries at the database (`log_min_duration_statement` in PostgreSQL) and review the top offenders weekly. The query that matters is rarely the one anyone suspected.

---

### 5.3 Joins

**Best practices:** Join on indexed keys, put conditions about the optional side in `ON`, and verify the row count you expect — an unexpected multiplication is almost always a join condition problem.

**Common production bugs:** A `LEFT JOIN` with a `WHERE` condition on the right table, silently dropping the rows the left join was there to keep. Reports then under-count, and nobody notices until the totals are reconciled.

**Performance considerations:** Joining large tables without indexes on the join columns forces hash joins with large memory use, or worse, nested loops over full scans. Check the plan whenever a join involves a table expected to grow.

**Scalability concerns:** Cross-service joins are not possible — that is the real cost of splitting a database. Denormalised read models or API composition replace them, each with its own consistency trade-off.

**Debugging tips:** When a join returns too many rows, count each side separately and check the join key's uniqueness. A one-to-many join where you expected one-to-one is the usual cause.

---

### 5.4 Aggregation

**Best practices:** Filter before grouping, aggregate in the database, and use window functions when the detail rows must survive. For dashboards, precompute summaries rather than aggregating the full history per request.

**Common production bugs:** A reporting endpoint aggregating the entire orders table on every request. It is fast for a year and then takes thirty seconds, competing with transactional load while it does so.

**Performance considerations:** Aggregations scan what they aggregate. Covering indexes, partial indexes on the filtered subset, and materialised views each help; the right choice depends on how fresh the numbers must be.

**Scalability concerns:** Heavy analytical queries on the transactional database affect user-facing latency. Move them to a read replica, a materialised view refreshed on a schedule, or a separate analytical store.

**Monitoring:** Track the slowest aggregate queries separately from transactional ones. They have different acceptable latencies and different causes, and averaging them together hides both.

---

### 5.5 Subqueries and CTEs

**Best practices:** Use CTEs to make complex queries readable, prefer `EXISTS` for existence checks, and verify the plan whenever a CTE sits on the critical path — readability gains should not cost an order of magnitude.

**Common production bugs:** `NOT IN` against a nullable column returning zero rows, so a reconciliation job reports nothing to do while the discrepancy grows.

**Performance considerations:** A correlated subquery in the `SELECT` list runs per output row. For a thousand-row page that is a thousand extra executions — usually replaceable by a join or a window function.

**Debugging tips:** Break a long CTE chain apart and run each step with a row count. The step where the count explodes is the one to optimise, and it is rarely the one that looks complicated.

**Maintainability:** A query longer than a screen deserves a comment explaining what question it answers. The SQL says how; the next reader needs to know why.

---

### 5.6 Indexes

**Best practices:** Index for the queries you actually run, prefer composite indexes ordered equality-then-range-then-sort, create them `CONCURRENTLY` on live tables, and review unused indexes periodically.

**Common production bugs:** A query that was fast in testing doing a sequential scan in production because the index's leading column was not in the predicate. The fix is one index; finding it requires reading the plan.

**Performance considerations:** Every index is paid for on every write. On write-heavy tables, an unused index is a permanent throughput tax — and most mature schemas carry several.

**Scalability concerns:** Index maintenance and bloat grow with table size. Large tables benefit from partial indexes over the hot subset and, past a certain point, from partitioning.

**Monitoring:** Track index usage statistics and index size. An index with zero scans after a month of production traffic is a candidate for removal, and the write throughput you recover is real.

> ⚠️ **Warning:** `CREATE INDEX` without `CONCURRENTLY` takes a write lock on PostgreSQL for the duration. On a large table during business hours, that is a self-inflicted outage.

---

### 5.7 Query Plans

**Best practices:** Read the plan before adding an index, use production-like data volumes, and keep statistics fresh — especially after bulk loads, which leave the planner working from stale estimates.

**Common production bugs:** A plan flip after data growth: a query that used an index switches to a sequential scan and latency jumps tenfold overnight with no deployment. Statistics and selectivity changed, and the optimiser responded correctly to new information.

**Debugging tips:** `EXPLAIN (ANALYZE, BUFFERS)` shows whether pages came from cache or disk. A query that is fast when warm and slow when cold is an I/O problem, not a plan problem.

**Monitoring:** `pg_stat_statements` (or the equivalent) ranks queries by total time, which is what matters — a 5 ms query run a million times costs more than a 2 s query run twice.

**Testing advice:** Capture plans for critical queries in a test that runs against a realistically sized dataset. A plan regression then fails CI rather than appearing as a production incident.

---

### 5.8 Schema Design

**Best practices:** Correct types first — `TIMESTAMPTZ`, integer minor units or `NUMERIC` for money, native UUID where available. Normalise by default, denormalise with measurements, and record historical values deliberately.

**Common production bugs:** Money stored as `FLOAT`, producing totals that disagree with the sum of their parts by fractions of a cent. The errors are unreconcilable because the information is already lost.

**Security implications:** Design for data minimisation: do not store what you do not need, and keep sensitive columns separable so they can be encrypted, masked in non-production copies, and deleted on request.

**Scalability concerns:** Wide tables with large text or JSON columns slow every query that touches the row. Separate large payloads into their own table, or out of the database entirely into object storage.

**Maintainability:** Review schema changes as carefully as code. A column added casually becomes a permanent part of the contract, and removing it later requires coordinating every reader.

---

### 5.9 Constraints

**Best practices:** Declare every invariant the database can enforce — not null, unique, foreign keys, checks — and translate the resulting exceptions into meaningful API errors rather than letting them surface as 500s.

**Common production bugs:** Duplicate rows created by concurrent requests that both passed an application-level "does it exist?" check. Only a unique constraint closes that window.

**Performance considerations:** Constraints cost a little on write and can save a great deal on read, because the optimiser uses them. Adding one to a large table requires a validation scan and should be done with `NOT VALID` then validated separately where supported.

**Security implications:** Constraints are a defence in depth. If an application bug or an injected statement attempts invalid data, the database still refuses it.

**Testing advice:** Test the violation paths: insert a duplicate, delete a referenced parent, write a negative quantity. Assert the API returns 409 rather than 500 — the error contract matters to clients.

---

### 5.10 Schema Migrations

**Best practices:** `ddl-auto=validate` with Flyway or Liquibase, one logical change per migration, never edit an applied file, and keep migrations fast — backfills belong in separate batched jobs.

**Common production bugs:** A deployment blocked for twenty minutes because a migration rewrote a large table, holding a lock while the rolling deploy waited. Every instance stalls, and the only safe action is to wait.

**Security implications:** Migrations run with elevated database privileges. Review them with the same care as production code; a migration can drop a table, and the audit trail is the pull request.

**Scalability concerns:** As tables grow, previously trivial migrations become dangerous. Adding a `NOT NULL` column with a default rewrites the table on older engines; check your engine's behaviour before assuming it is instant.

**Modern recommendations:** Expand and contract for every breaking change, `CREATE INDEX CONCURRENTLY` on live tables, batched backfills with progress logging, and a staging environment with production-scale data where migrations are timed before release.

> 💡 **Tip:** Time every migration against a production-sized copy. "It took 200 ms locally" tells you nothing about a table with fifty million rows.

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

**Best practices:** Keep SQL observable — log statements in development, enable statistics in staging, and assert query counts in tests. JPA's convenience is only safe when you can see what it generates.

**Common production bugs:** An endpoint that was fast with a hundred rows and collapses with ten thousand, because the access pattern issues one query per row. The Java is unchanged; only the data grew.

**Performance considerations:** Measure queries per request, not just latency. A request issuing 200 small queries can look acceptable locally and fail completely across a network with 1 ms round trips.

**Debugging tips:** `hibernate.generate_statistics=true` — with `hibernate-micrometer` on the classpath — exposes query counts, cache hit ratios and flush timings through Actuator. It is the single most useful switch when diagnosing a JPA performance problem.

**Modern recommendations:** Use JPA for domain CRUD, and plain `JdbcTemplate` or jOOQ for reporting, bulk work and complex SQL. Mixing them deliberately is a sign of maturity, not inconsistency.

---

### 6.2 Entities and Mapping

**Best practices:** `ddl-auto=validate` everywhere, `EnumType.STRING` always, explicit column definitions for anything the default would get wrong, and no Lombok `@Data` on entities.

**Common production bugs:** An enum reordered in Java while the database stores ordinals, silently reinterpreting every existing row. The data is not recoverable without an audit trail of what the values used to mean.

**Maintainability:** Entities drift from the schema unless something checks. `validate` at startup turns a silent mismatch into a failed deployment, which is where you want to find it.

**Security implications:** Entities frequently contain fields the API must never expose. Keeping them out of serialisation is a DTO concern, but the mapping is where sensitive columns should be marked and documented.

**Anti-pattern:** Lombok `@Data` or `@EqualsAndHashCode` on entities. Generated `equals`/`hashCode` over all fields breaks with lazy proxies and changes behaviour after persistence assigns an id.

---

### 6.3 Identifiers and Generation

**Best practices:** `SEQUENCE` with a pooled `allocationSize` on PostgreSQL and Oracle, matching the database sequence's increment. Reserve `IDENTITY` for schemas you do not control.

**Common production bugs:** Duplicate key violations because `allocationSize` did not match the sequence increment — the blocks of ids Hibernate hands out overlap, so even a single instance collides once it fetches its second block. Recent Hibernate versions check the increment at startup; do not disable that check.

**Performance considerations:** `IDENTITY` disables JDBC batching entirely. On a bulk import path, switching to a pooled sequence can turn tens of thousands of statements into a few hundred batches.

**Scalability concerns:** Random UUID primary keys fragment B-tree indexes and inflate every secondary index. If distributed id generation is required, prefer time-ordered UUIDs (UUIDv7) to keep insert locality.

**Testing advice:** Test id generation against the real database sequence, inserting more rows than one allocation block — a mismatch shows up as soon as the second block is fetched, which a test inserting a handful of rows never reaches.

---

### 6.4 Relationships and Ownership

**Best practices:** Always set both sides through helper methods, keep collections lazy, use `orphanRemoval` only for true compositions, and model many-to-many as an explicit entity.

**Common production bugs:** Children saved without their parent because only the inverse collection was updated — with a cascade the row is inserted with no foreign key (or rejected by a `NOT NULL` column); without one it is never inserted. The bug appears as missing or orphaned data rather than as a clear failure.

**Performance considerations:** `CascadeType.ALL` with large collections means loading and writing the whole collection on every change. For large child sets, operate on the child repository directly.

**Security implications:** Cascading deletes can remove far more than intended when relationships chain. Review every `CascadeType.REMOVE` against the question "what is the largest subtree this can delete?".

**Maintainability:** Bidirectional relationships require discipline forever. Where the inverse side is not genuinely needed, a unidirectional `@ManyToOne` is simpler and has fewer failure modes.

---

### 6.5 The Persistence Context

**Best practices:** `spring.jpa.open-in-view=false`, short transactions, deliberate fetch plans, and periodic flush-and-clear in batch loops to bound memory.

**Common production bugs:** Connection-pool exhaustion caused by `open-in-view` holding a connection from the first query to the end of the request, including serialisation and any slow client. It appears as pool timeouts under load with no slow query to blame.

**Memory considerations:** A batch job loading a million entities in one transaction holds every one of them plus a snapshot each. Flush and clear every few hundred, or use a stateless session.

**Monitoring:** Track connection-pool usage and wait time alongside query latency. Pool saturation with fast queries is the signature of transactions held open too long.

**Debugging tips:** When the same row appears with different values in one request, check whether two transactions are involved — identity only holds within one persistence context.

> ⚠️ **Warning:** `open-in-view` is enabled by default and Boot logs a warning about it. That warning is not noise: it means a connection, once used, is held until the request ends, and lazy loading can happen while writing the response.

---

### 6.6 Entity Lifecycle States

**Best practices:** Do all persistence work inside a transaction, use the instance returned by `save`, and keep detached entities out of business logic — map to DTOs at the boundary instead.

**Common production bugs:** Changes made to a detached entity and silently discarded, so an update endpoint returns 200 and changes nothing. There is no error anywhere to point at.

**Testing advice:** Test the update path with an entity loaded in a previous transaction. In-transaction tests pass because everything is managed, hiding exactly the bug that happens in production.

**Debugging tips:** When an update does not persist, check whether the entity was loaded inside the current transaction. That one question resolves most "my change disappeared" reports.

**Anti-pattern:** Passing entities between layers and across transaction boundaries. Once an entity leaves its context it is an ordinary object with surprising behaviour — use DTOs for transport.

---

### 6.7 Dirty Checking and Flushing

**Best practices:** Keep transactions short so flushes stay small, enable batching with a sequence-based id strategy, and never mutate managed entities for temporary computation.

**Common production bugs:** An accidental write — a field modified during a calculation inside a transaction and persisted at commit. There is no `save()` call to find in the code, which makes it hard to trace.

**Performance considerations:** Dirty checking costs scale with the number of managed entities. Long transactions holding thousands of entities spend measurable time comparing snapshots at every flush.

**Testing advice:** Assert the absence of writes where none is expected. A test that counts update statements catches accidental persistence, which no assertion on the return value will.

**Monitoring:** Hibernate statistics expose flush counts and durations. A rising flush duration is an early signal of transactions growing larger than intended.

---

### 6.8 Lazy and Eager Loading

**Best practices:** Map every association lazy — including `@ManyToOne`, which defaults to eager — and fetch per use case with entity graphs or join fetches.

**Common production bugs:** A `LazyInitializationException` during serialisation after disabling `open-in-view`. It is the correct failure: the fix is to fetch what the response needs inside the transaction, not to re-enable the setting.

**Performance considerations:** Eager `@ManyToOne` associations are loaded on every query touching the entity, including list endpoints that only need an id. Across several associations that multiplies the data transferred per row.

**Debugging tips:** Log SQL and count statements for the slow endpoint. Eager chains show up as unexpectedly wide joins; lazy chains show up as repeated small selects.

**Testing advice:** Write tests that access the response's fields outside the transaction. They fail exactly where production would, which is what makes the fetch plan explicit.

---

### 6.9 The N+1 Problem

**Best practices:** Fetch associations in the query that needs them, prefer projections for read models, and keep `@BatchSize` configured as a safety net for the cases you miss.

**Common production bugs:** A list endpoint whose latency grows linearly with page size. At 20 items it is fine; at 200 it times out, and the cause is invisible in the Java.

**Performance considerations:** The cost is round trips, not query complexity. With 1 ms network latency, 200 extra queries add 200 ms of pure waiting before any work happens.

**Monitoring:** Expose Hibernate's query count per request as a metric or a response header in non-production environments. A sudden rise after a deploy identifies the regression immediately.

**Testing advice:** Assert a maximum query count for important endpoints. It is the only test that reliably prevents N+1 from returning, and it fails loudly when someone adds an innocent-looking field access.

> 💡 **Tip:** `datasource-proxy` or Hibernate statistics in an integration test gives you `assertThat(queryCount).isLessThan(3)`. That assertion has prevented more production incidents than most performance work.

---

### 6.10 JPQL and Queries

**Best practices:** Projections for read models, join fetches for write paths that need the graph, native SQL where the database offers something JPQL cannot, and bound parameters everywhere.

**Common production bugs:** A bulk `@Modifying` update in a transaction that also holds loaded entities. Any later change to one of those stale entities makes dirty checking write all its columns — old values included — back over the bulk change.

**Performance considerations:** Loading entities to return a few fields costs the select, the persistence context overhead and the dirty-check at flush. A projection avoids all three and is frequently several times faster.

**Security implications:** Concatenating user input into JPQL or native SQL is injectable. Spring Data's derived queries and bound parameters are safe; string building is not, including in dynamic sort clauses.

**Modern recommendations:** Keep complex analytical SQL out of JPA entirely. A read model built with `JdbcTemplate` or jOOQ is clearer, faster and not constrained by the entity mapping.

---

### 6.11 Hibernate Caching

**Best practices:** Rely on the first-level cache implicitly, enable the second level per entity only for read-mostly reference data, and prefer explicit Spring Cache at the service layer where the caching decision should be visible.

**Common production bugs:** Stale reference data after a migration or an administrative update made outside the application, because Hibernate's cache was never told. The symptom is one instance serving old values indefinitely.

**Scalability concerns:** A distributed second-level cache adds network hops and invalidation traffic. Past a certain cluster size, the coordination can cost more than the database lookups it avoids.

**Monitoring:** Expose cache hit and miss ratios. A second-level cache with a low hit ratio is pure overhead, and that is common enough to be worth checking rather than assuming.

**Anti-pattern:** Enabling the query cache globally to "speed things up". It is invalidated by any write to the involved tables, so on a busy table it does more work than the queries it replaces.

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

**Best practices:** One transaction per business operation, as short as atomicity allows. Treat the database's guarantees as the foundation and enforce business invariants in the domain and with constraints on top of them.

**Common production bugs:** Partially applied operations after a failure because two steps ran in separate transactions — an order saved without its lines, a debit without the matching credit. Reconciliation then has to find and repair them by hand.

**Performance considerations:** Transactions are cheap to start and expensive to hold. Throughput problems attributed to "the database" are frequently long transactions holding locks and connections while doing unrelated work.

**Monitoring:** Track transaction duration percentiles and the count of long-running transactions at the database (`pg_stat_activity` with `xact_start`). A transaction open for minutes is almost always a bug.

**Testing advice:** Test the failure path explicitly: throw part-way through an operation and assert that nothing from it persisted. Happy-path tests prove nothing about atomicity.

---

### 7.2 The Transactional Annotation

**Best practices:** Annotate public service methods that define a unit of work, use `readOnly = true` for queries, set a `timeout` on operations that could run away, and never annotate controllers.

**Common production bugs:** Self-invocation silently dropping the transaction after a refactor moved a call inside the same class. Writes start committing individually, and the inconsistency appears only when something fails mid-operation.

**Debugging tips:** Enable `logging.level.org.springframework.transaction=DEBUG` (and `org.springframework.orm.jpa=DEBUG`) to see where transactions begin, join and commit. It immediately reveals a method that was expected to be transactional and is not.

**Testing advice:** Test-managed transactions roll back after each test, which can hide flush-time failures and commit-time constraint violations. For transactional behaviour itself, test without `@Transactional` on the test and clean up explicitly.

**Anti-pattern:** Blanket `@Transactional` on every class "to be safe". It widens boundaries, holds connections longer and makes the actual unit of work impossible to read from the code.

---

### 7.3 Propagation

**Best practices:** Default to `REQUIRED`. Use `REQUIRES_NEW` sparingly and deliberately — audit records, failure logs — and never as a per-item transaction inside an outer one.

**Common production bugs:** `UnexpectedRollbackException` at commit, after an inner method's exception was caught and logged. The operation appears to have handled the failure and then fails anyway, far from the cause.

**Performance considerations:** Every active `REQUIRES_NEW` holds a second connection while the outer transaction waits. With a pool of ten and nested calls under load, the pool deadlocks: every thread holds one connection and waits for another.

**Debugging tips:** When a commit fails with "transaction silently rolled back because it has been marked as rollback-only", search for a caught exception in a method participating in the same transaction.

**Maintainability:** Propagation settings change behaviour invisibly at the call site. Comment every non-default propagation with the reason — the next reader cannot infer it.

> ⚠️ **Warning:** `REQUIRES_NEW` inside an outer transaction needs two connections per request at once; under concurrent load that can exhaust the pool and deadlock it. If each item in a loop needs its own transaction, run the loop outside any transaction, so each item needs only one connection.

---

### 7.4 Isolation Levels

**Best practices:** Keep the database default (usually `READ_COMMITTED`) and solve specific anomalies with targeted tools — optimistic locking for lost updates, `FOR UPDATE` for hot rows — rather than raising isolation globally.

**Common production bugs:** Lost updates under `READ_COMMITTED`: two requests read a balance, both add to it, and one increment disappears. Isolation did not prevent it; a version column or an atomic `UPDATE ... SET x = x + ?` would have.

**Performance considerations:** `SERIALIZABLE` increases aborts under contention. Benchmark with realistic concurrency before adopting it; the failure rate is invisible in single-user testing.

**Scalability concerns:** Isolation guarantees do not extend to read replicas, which lag asynchronously. Reading from a replica immediately after writing to the primary can return stale data regardless of isolation level.

**Testing advice:** Reproduce concurrency anomalies with two threads and a latch that forces the interleaving. Without deliberate interleaving, the bug will not appear in tests and will appear in production.

---

### 7.5 Rollback Rules

**Best practices:** Adopt a project-wide convention so checked exceptions roll back consistently without relying on each developer to remember — since Spring Framework 6.2, `@EnableTransactionManagement(rollbackOn = ALL_EXCEPTIONS)`; before that, a custom annotation meta-annotated with `@Transactional(rollbackFor = Exception.class)`.

**Common production bugs:** A checked exception from a payment or file operation leaving earlier writes committed, so the order exists but payment failed. The data is inconsistent and nothing in the logs says the transaction committed.

**Debugging tips:** When data is partially persisted after an exception, check whether the exception was checked. That single fact explains most "the transaction did not roll back" reports.

**Testing advice:** Write a test per transactional method that throws each relevant exception type mid-operation and asserts nothing persisted. It costs minutes and documents the rollback contract.

**Maintainability:** Explicit `rollbackFor` makes intent visible. A reader seeing it knows the author considered the failure; its absence on a method throwing checked exceptions is a review comment.

---

### 7.6 Transaction Boundaries

**Best practices:** Compute and call remote services before the transaction, keep the transaction to load-decide-write, and publish side effects after commit with `@TransactionalEventListener(AFTER_COMMIT)` or an outbox.

**Common production bugs:** A payment API call inside a transaction. When the provider slows down, every request holds a connection while waiting, the pool empties, and the whole service fails — including endpoints that never touch payments.

**Performance considerations:** Connection hold time, not query time, determines pool capacity. A service with 5 ms queries and 2 s transactions can serve far fewer requests than its query latency suggests.

**Scalability concerns:** Chunked batch processing with a transaction per chunk lets jobs run alongside live traffic without holding locks for hours, and makes them restartable from the last committed chunk.

**Monitoring:** Export HikariCP's `hikaricp.connections.usage` histogram — how long connections are held. A long tail there identifies boundary problems before they become outages.

---

### 7.7 Optimistic Locking

**Best practices:** `@Version` on every aggregate that can be edited concurrently, the version carried through the API (as a field or an ETag), and conflicts returned as 409 for human edits or retried for mechanical updates.

**Common production bugs:** Silent lost updates in a stateless API that drops the version between the GET and the PUT, so the server compares against the freshly loaded version and the check never fails.

**Real-world use case:** Collaborative editing of records — product listings, customer profiles, configuration — where two people opening the same form must not overwrite each other without knowing.

**Performance considerations:** Under low contention it costs one extra column and comparison. Under high contention conflict rates rise and retries multiply load; switch hot rows to pessimistic locking or atomic updates.

**Testing advice:** Test the conflict: load an entity in two transactions, commit one, then commit the other and assert the exception and the resulting 409. It is the only way to prove the version is actually being enforced end to end.

---

### 7.8 Pessimistic Locking

**Best practices:** Lock the minimum rows for the minimum time, always with a lock timeout, in a consistent order, and never across a remote call. For work queues, use `FOR UPDATE SKIP LOCKED`.

**Common production bugs:** Deadlocks between two code paths that lock the same two rows in opposite orders. They appear only under concurrency and are resolved by the database aborting one transaction — which must then be retried by the application.

**Real-world use case:** Inventory reservation for high-demand items, seat or slot allocation, and database-backed job queues where several workers claim the next available row with `SKIP LOCKED`.

**Performance considerations:** Throughput on a locked row is strictly serial. If every request locks the same row, the service's capacity is one transaction at a time on that row — measure whether sharding the counter or an atomic update would serve better.

**Monitoring:** Monitor lock waits and deadlock counts at the database. Rising lock wait time is an early sign of contention that will eventually surface as timeouts.

> 💡 **Tip:** `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 10` turns a table into a safe multi-worker job queue with no broker — a pattern that covers more use cases than its simplicity suggests.

---

### 7.9 Connection Pooling

**Best practices:** Small pools, sized against the database's capacity divided across instances; a short `connection-timeout` to fail fast; `max-lifetime` below any network idle timeout; and leak detection enabled in non-production environments.

**Common production bugs:** Autoscaling adds instances during a traffic spike, total connections exceed the database's `max_connections`, and every instance — including healthy ones — starts failing to connect.

**Scalability concerns:** Connection count scales with instances, not with load. Beyond a modest number of instances, a server-side pooler such as PgBouncer is the standard way to keep database connections bounded.

**Monitoring:** Export active, idle, pending and total connections plus acquisition time. Pending connections above zero for any sustained period means requests are queueing for the database.

**Debugging tips:** Set `leak-detection-threshold` to a few seconds in staging. Hikari logs the stack trace of the code that borrowed the connection and never returned it, which pinpoints transaction-boundary bugs directly.

---

### 7.10 Distributed Transactions

**Best practices:** Use the outbox pattern for every "write data and publish event" operation, make every consumer idempotent, and design compensations as first-class business operations when a workflow spans services.

**Common production bugs:** The dual write: an order committed to the database and the `OrderPlaced` event lost because the broker stayed unavailable longer than the producer's retry window, or the process died before the send completed. Downstream systems never learn about the order, and nothing retries.

**Scalability concerns:** Outbox relays become a throughput bottleneck if they poll a single table with one worker. Use change data capture or partitioned relays as volume grows, preserving per-aggregate ordering.

**Monitoring:** Alert on outbox lag — the age of the oldest unpublished row. It is the single number that tells you whether events are flowing, and it rises before any downstream system notices.

**Modern recommendations:** Debezium-based CDC on the outbox table, idempotent consumers keyed by event id, and orchestrated sagas for workflows with more than two or three steps. Avoid XA/two-phase commit in new designs.

> ⚠️ **Warning:** Publishing an event before the database transaction commits lets consumers act on data that may then be rolled back. Publish after commit, or write to an outbox — never in the middle.

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

**Best practices:** Return 401 and 403 correctly with a consistent error body, keep authorisation decisions server-side, and propagate the security context explicitly whenever work moves to another thread.

**Common production bugs:** Background work submitted from a request thread running with no security context — or worse, with a stale one inherited from a previous request on a pooled thread — so audit records attribute actions to the wrong user.

**Security implications:** Never trust identity claims from the client — a `userId` in the request body, a role in a header. Identity comes from the authenticated principal, and every authorisation decision should be made against it.

**Monitoring:** Track 401 and 403 rates separately. A spike in 401s usually means expired or misconfigured tokens; a spike in 403s can mean a permissions regression — or someone probing.

**Testing advice:** Test every protected endpoint three ways: unauthenticated (401), authenticated without permission (403), and permitted (2xx). Security tests are the ones whose absence is noticed only after a breach.

---

### 8.2 The Security Filter Chain

**Best practices:** One chain per distinct security model, each with an explicit `securityMatcher` and `@Order`. Custom filters added with `addFilterBefore`/`addFilterAfter` and not annotated `@Component`.

**Common production bugs:** A custom JWT filter registered as a `@Component` that runs in the servlet container's main chain as well as the security chain — executing twice, or before security headers are applied.

**Debugging tips:** TRACE logging for `org.springframework.security` lists every filter and its decision. In production, log the entry-point and access-denied handlers' decisions at INFO with the request path and principal.

**Maintainability:** Keep security configuration in one or two classes. Rules scattered across many configuration files make it impossible to answer "who can call this endpoint?" without reading all of them.

**Anti-pattern:** `web.ignoring()` for API paths to "fix" a 401. It removes the path from security entirely — headers, CSRF, everything — when `permitAll()` was what was intended.

---

### 8.3 Configuring HttpSecurity

**Best practices:** Deny by default, specific rules before general ones, `HttpMethod` on every rule that should not cover all verbs, and a dedicated rule set for Actuator that exposes only health publicly.

**Common production bugs:** A broad `permitAll()` placed above specific rules, silently opening admin endpoints. The configuration compiles, the tests that only check happy paths pass, and the endpoints are public.

**Security implications:** Actuator endpoints such as `/env`, `/heapdump` and `/configprops` expose secrets and memory contents. Expose them only on an internal port or behind an admin role — never publicly.

**Testing advice:** Add an endpoint-security test that enumerates every mapping from `RequestMappingHandlerMapping` and asserts each one is either explicitly public or rejects anonymous access. It catches the forgotten endpoint automatically.

**Modern recommendations:** Spring Security 6 component configuration only — `SecurityFilterChain` beans, `requestMatchers`, lambda DSL. Code copied from `WebSecurityConfigurerAdapter` tutorials should be rewritten, not adapted.

> ⚠️ **Warning:** `management.endpoints.web.exposure.include=*` on a public port exposes heap dumps and environment variables. Exposure and security are separate settings — both must be restricted.

---

### 8.4 Password Hashing

**Best practices:** `DelegatingPasswordEncoder` with BCrypt (cost tuned so a hash takes a few hundred milliseconds) or Argon2id, transparent rehashing on login when parameters change, and rate limiting on every endpoint that checks a password.

**Common production bugs:** Raw passwords logged by a request-logging filter or included in an exception message. Hashing is then irrelevant — the plaintext is in the log aggregation system, with its own retention and access controls.

**Security implications:** A deliberately slow hash makes login a denial-of-service vector. Rate limiting per account and per IP, and lockout or back-off after repeated failures, are part of the same control.

**Performance considerations:** At BCrypt cost 12, each login costs roughly a quarter of a second of CPU on typical hardware. Login traffic must be capacity-planned, and load tests that hammer the login endpoint will saturate CPU.

**Modern recommendations:** Argon2id for new systems, check new passwords against breached-password lists, and support MFA. Password policy matters less than these three — length requirements beat complexity rules.

---

### 8.5 Users and Authentication Providers

**Best practices:** Use Spring's providers rather than hand-rolled credential checks, return one generic error for every credential failure, and publish authentication success and failure events for auditing.

**Common production bugs:** A custom login endpoint that reveals whether an email is registered — through the message, the status code, or a measurably different response time — enabling account enumeration and targeted attacks.

**Security implications:** Brute-force and credential-stuffing attacks target login endpoints continuously. Rate limits, lockout with exponential back-off, and anomaly alerting are baseline controls, not enhancements.

**Monitoring:** Listen to `AuthenticationFailureBadCredentialsEvent` and `AuthenticationSuccessEvent` and emit metrics. A sudden rise in failures across many accounts is credential stuffing; across one account, a targeted attack.

**Performance considerations:** With stateless JWT authentication, do not load the user from the database on every request — the token already carries identity and roles. Load the user only when the operation genuinely needs current data.

---

### 8.6 Stateless Authentication

**Best practices:** Access tokens of 5–15 minutes, refresh tokens stored server-side with rotation and reuse detection, `SessionCreationPolicy.STATELESS`, and tokens never placed in URLs.

**Common production bugs:** Week-long access tokens with no revocation, so a token leaked in a log or a browser extension remains valid long after the user changed their password.

**Security implications:** Browser token storage is the hard part. `localStorage` is readable by any script on the page, so XSS steals tokens. HttpOnly, Secure, SameSite cookies resist XSS but reintroduce CSRF concerns — choose deliberately and protect accordingly.

**Scalability concerns:** Statelessness is the point: any instance validates any request with no shared store. A per-request revocation lookup reintroduces shared state — use it only where immediate revocation is a real requirement.

**Testing advice:** Test expiry explicitly: a token one second past `exp` must be rejected, and a refresh token used twice must invalidate the whole token family. Both are easy to get wrong and invisible in normal use.

---

### 8.7 JSON Web Tokens

**Best practices:** Asymmetric signatures (RS256 or ES256) with keys published as JWKS, pinned algorithms, validation of `iss`, `aud`, `exp` and `nbf`, minimal claims, and planned key rotation.

**Common production bugs:** A verifier that does not check `aud`, so tokens issued for an internal admin service are accepted by a public API that happens to share an issuer.

**Security implications:** Prefer Spring Security's built-in resource-server support over a hand-written JWT filter. Custom parsing code is where the classic vulnerabilities live — algorithm confusion, missing expiry checks, accepting unsigned tokens.

**Debugging tips:** Decode a failing token locally (the payload is readable) and compare `iss`, `aud`, `exp` and `kid` with the configuration. Most validation failures are a mismatch in one of those four.

**Modern recommendations:** Use `JwtEncoder`/`JwtDecoder` from `spring-security-oauth2-jose` for self-issued tokens, and move to a dedicated identity provider once there is more than one service or any need for MFA, SSO or social login.

> ⚠️ **Warning:** A hand-written JWT filter that parses the token with a library but forgets to verify the signature, or accepts the algorithm from the header, is a full authentication bypass. Use the framework's validated decoder.

---

### 8.8 Role-Based Access Control

**Best practices:** Fine-grained permissions in checks, roles as named bundles defined in one place, and a `RoleHierarchy` where roles genuinely nest. Review the role-to-permission mapping as carefully as code.

**Common production bugs:** The `ROLE_` prefix mismatch — tokens carry `roles: ["ADMIN"]`, but the default JWT converter maps only `scope` claims, as `SCOPE_` authorities, so `hasRole("ADMIN")` (which checks `ROLE_ADMIN`) never matches. An admin endpoint rejects administrators, someone "fixes" it with `permitAll()`, and the endpoint becomes public.

**Security implications:** Roles embedded in long-lived tokens do not reflect demotion or offboarding until expiry. For sensitive permissions, either keep token lifetimes short or check current permissions server-side.

**Maintainability:** Role checks scattered as string literals across the codebase cannot be audited. Centralise them as constants or as methods on an access bean, so "who can refund?" has one answer.

**Testing advice:** Test each role against each protected operation, including the negative cases. A matrix test over roles and endpoints catches permission regressions that individual happy-path tests never will.

---

### 8.9 Method Security

**Best practices:** Protect service operations with `@PreAuthorize`, put non-trivial rules in named access beans, and treat ownership checks as mandatory on every endpoint that takes a resource id.

**Common production bugs:** Insecure direct object reference — `GET /api/orders/{id}` returns any order to any authenticated user because only the URL was protected. It is consistently one of the most common API vulnerabilities.

**Security implications:** Every id that arrives from a client is attacker-controlled. Verify the caller may access that specific resource, not merely that they are logged in.

**Testing advice:** For each resource endpoint, test that user A cannot read or modify user B's resource. That single test pattern prevents the IDOR class entirely.

**Maintainability:** Long SpEL expressions are untyped strings that fail at runtime. A bean method with a clear name is testable, refactorable and readable in a stack trace.

---

### 8.10 OAuth2 and Resource Servers

**Best practices:** Configure `issuer-uri` and `audiences`, map roles with a `JwtAuthenticationConverter`, use Authorization Code with PKCE for user-facing clients and Client Credentials between services, and let the identity provider own login, MFA and passwords.

**Common production bugs:** A resource server that validates signatures but not audience, accepting tokens issued for any client of the same identity provider.

**Scalability concerns:** JWT validation is local and scales freely; introspection of opaque tokens adds a network call per request and makes the identity provider a hot dependency. Cache introspection results briefly if you must use it.

**Monitoring:** Alert on JWKS fetch failures and on token-validation error rates. An identity-provider outage or a key-rotation mistake shows up there first, as every request starts failing authentication.

**Modern recommendations:** Current OAuth practice — the security best current practice (RFC 9700) and the OAuth 2.1 draft — no Implicit or Password grants, PKCE everywhere, short-lived tokens, refresh-token rotation — and a managed or well-operated identity provider rather than a home-grown authorisation server.

---

### 8.11 CORS and CSRF

**Best practices:** An explicit allow-list of origins per environment, credentials only where needed, preflight caching with `maxAge`, and CSRF protection kept on for any cookie-based authentication.

**Common production bugs:** An origin allow-list implemented by reflecting the request's `Origin` header with `allowCredentials(true)`, letting any website make authenticated requests through a logged-in user's browser.

**Security implications:** Disabling CSRF is safe only when no authentication travels in cookies. Moving a JWT into a cookie for XSS protection without re-enabling CSRF swaps one vulnerability for another.

**Debugging tips:** CORS failures appear only in the browser console, not in server logs or `curl`. Reproduce with the browser's network tab and check the preflight `OPTIONS` response headers first.

**Maintainability:** Keep allowed origins in configuration per environment rather than in code, so adding a staging front end does not require a release — and so production never accidentally includes `localhost`.

> 💡 **Tip:** If `curl` works and the browser does not, it is CORS. If neither works, it is not CORS. That one check saves a great deal of debugging time.

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

**Best practices:** Test each behaviour at the lowest level that can observe it, keep the full suite runnable locally in minutes, and reserve end-to-end tests for the handful of paths whose failure would be an incident.

**Common production bugs:** The ones that slip through a lopsided suite — configuration and wiring errors in a unit-test-only suite, and untested edge cases in an integration-only suite where each case is too expensive to write.

**Performance considerations:** Suite duration is a productivity metric. A suite that takes twenty minutes is run less often, so defects are found later and fixed at greater cost.

**Maintainability:** Tests are production code for your ability to change things. Brittle, slow or unreadable tests are technical debt that compounds with every feature.

**Testing advice:** Run mutation testing (PIT) occasionally on critical modules. Surviving mutants show assertions that do not actually check anything — something coverage numbers cannot reveal.

---

### 9.2 Unit Tests with JUnit 5

**Best practices:** One behaviour per test, names that state the rule, builders or fixtures for test data, an injected `Clock`, and AssertJ for assertions. Keep unit tests free of Spring entirely.

**Common production bugs:** Time-zone and date-boundary bugs — month ends, leap days, daylight-saving transitions — that pass every test written on an ordinary afternoon. Parameterise tests over the awkward dates explicitly.

**Maintainability:** Shared test fixtures with sensible defaults (`OrderFixtures.open()`) keep tests short and make the relevant detail stand out. Tests that build twenty fields by hand hide what they are actually testing.

**Testing advice:** Make tests deterministic. Fixed clocks, seeded random generators and no reliance on execution order remove the flakiness that teaches teams to ignore failures.

**Anti-pattern:** Tests without assertions, or with assertions that cannot fail (`assertThat(result).isNotNull()` on a method that never returns null). They add coverage and no protection.

---

### 9.3 Mocking with Mockito

**Best practices:** Mock external boundaries — gateways, clients, clocks — and use fakes or real objects for everything else. Verify interactions only when the interaction itself is the behaviour, such as "nothing was saved after a failure".

**Common production bugs:** A mocked collaborator whose behaviour drifted from the real one — the mock returns an empty list where the real repository now throws — so tests pass while production fails.

**Maintainability:** Over-specified tests that verify every call break on every refactor, teaching the team that tests are an obstacle. Assert outcomes, not implementation steps.

**Testing advice:** Pair heavily mocked unit tests with at least one slice or integration test exercising the real collaborator. The mock defines what you assume; the integration test checks the assumption.

**Anti-pattern:** Mocking value objects or data structures. It adds nothing that constructing the real object would not, and it makes the test describe a fiction.

---

### 9.4 Test Slices

**Best practices:** `@WebMvcTest` for controllers, `@DataJpaTest` with Testcontainers for repositories, `@JsonTest` for serialisation contracts, and a small set of standard test configurations shared across classes so contexts are cached.

**Common production bugs:** A slice that silently excludes the component under test — a custom converter or filter not imported — so the test passes against default behaviour while production uses something else.

**Performance considerations:** Every distinct context configuration costs a full start-up. Consolidating `@MockitoBean` declarations into shared base configurations can cut suite time dramatically.

**Debugging tips:** Spring logs context cache statistics at DEBUG for `org.springframework.test.context.cache`. A high miss count explains a slow suite better than any profiler.

**Modern recommendations:** Migrate `@MockBean` and `@SpyBean` to `@MockitoBean` and `@MockitoSpyBean`. The old annotations are deprecated as of Boot 3.4 and removed in Boot 4.

---

### 9.5 Testing Controllers with MockMvc

**Best practices:** Assert the full contract for every endpoint — status, content type, key JSON fields, headers, and error shape — with the real security configuration loaded and the service mocked.

**Common production bugs:** A field renamed in a response DTO, breaking every client, while the controller test still passes because it only asserted the status code.

**Testing advice:** Cover the error paths: validation failure, not found, conflict, unauthenticated, forbidden. Clients depend on these responses as much as on the success case, and they are rarely tested.

**Maintainability:** Keep request bodies in readable fixtures or text blocks rather than string concatenation. A test whose input is hard to read is a test nobody will update correctly.

**Security implications:** Never disable security in controller tests to make them pass. Use `jwt()` or `@WithMockUser`; a test suite that only runs with security off cannot detect a security regression.

---

### 9.6 Testing Repositories

**Best practices:** `@DataJpaTest` against the production database engine via Testcontainers, flush and clear before reading back, query-count assertions on critical queries, and migrations applied at start-up.

**Common production bugs:** A native query using PostgreSQL syntax that was never executed in tests because they ran on H2 — or ran on H2 with compatibility mode that accepted it — failing on the first production call.

**Performance considerations:** Repository tests are the right place to catch N+1 regressions and missing join fetches. Assert maximum statement counts for list queries; it is cheap and highly effective.

**Testing advice:** Test constraints by violating them. A unique constraint, a not-null column, or a check constraint should each have a test proving the database rejects bad data.

**Maintainability:** Shared Testcontainers configuration with `@ServiceConnection` means each repository test is a few lines. Copy-pasted container setup per class drifts in versions and slows the suite.

---

### 9.7 Full Integration Tests

**Best practices:** A small set of end-to-end scenarios through real HTTP and real infrastructure, one shared context configuration, data isolated by unique keys, and Awaitility for asynchronous outcomes.

**Common production bugs:** Configuration that only fails when everything is assembled — a missing property in one profile, a bean conflict between auto-configurations, a security rule that blocks an internal call. Integration tests are the only automated check for these.

**Performance considerations:** Each integration context start-up can take several seconds or more. Keeping them few and cache-friendly is what keeps the suite fast enough to run on every change.

**Testing advice:** Never use `Thread.sleep` to wait for asynchronous work. `await().atMost(5, SECONDS).untilAsserted(...)` is faster on success and gives a clear failure on timeout.

**Anti-pattern:** `@DirtiesContext` as a fix for tests interfering with each other. It hides shared mutable state — usually a cache or a static field — and multiplies the cost of every subsequent test.

---

### 9.8 Testcontainers

**Best practices:** Pin image versions to match production, share containers across the suite through a common test configuration with `@ServiceConnection`, and run the same setup locally and in CI.

**Common production bugs:** Behaviour that differs between test and production database versions — a JSON operator, a collation, a default — because the test image was `latest` or simply older.

**Performance considerations:** Container start-up dominates the first test. Shared containers plus Spring context caching amortise it across the suite; per-class containers repeat it.

**Real-world use case:** Local development with `spring-boot:test-run` or a `TestApplication` main method — the same container configuration starts PostgreSQL, Kafka and Redis for the running application, removing the need for a hand-maintained Docker Compose file.

**Monitoring:** Track CI test duration over time. A sudden increase often means container reuse broke — someone added a per-class container or a configuration that defeats context caching.

---

### 9.9 Testing Security

**Best practices:** For every protected endpoint, test anonymous, unauthorised and authorised access with the real security configuration; test ownership with two distinct users; and add a test that fails when a new endpoint is added without an explicit rule.

**Common production bugs:** An endpoint added months after the security configuration was written, matched by a broad `permitAll()` rule, and publicly accessible — with every existing test still green.

**Security implications:** Security tests are regression protection for the controls attackers probe first. Insecure direct object references in particular are found by attackers within minutes and by teams, usually, only after an incident.

**Testing advice:** For resource servers, pass your claim converter to the `jwt()` post-processor — `jwt().authorities(converter)` — with realistic claims, so your claim-to-authority mapping is exercised. On its own, `jwt()` maps claims with Spring's default converter, and `@WithMockUser` bypasses claims entirely; either can hide a broken converter.

**Maintainability:** A role-by-endpoint matrix test, generated from a table, documents the access model and keeps it under test as roles and endpoints evolve.

> ⚠️ **Warning:** A test profile that disables security makes every security regression undetectable. If tests need an authenticated user, give them one — do not remove the check.

---

### 9.10 Testing External Calls

**Best practices:** Stub dependencies at the HTTP level, test every failure mode your client must handle, keep test timeouts short through configuration, and add consumer-driven contract tests between teams that own the two sides.

**Common production bugs:** A client that was only ever tested against a successful stub, so the first real 503 propagates as an unhandled exception and the first slow response holds a thread indefinitely — most clients' default read timeout is infinite.

**Real-world use case:** Verifying resilience configuration — that the retry fires the expected number of times, that the circuit breaker opens after the threshold and recovers afterwards — which is otherwise only tested by a real outage.

**Testing advice:** Include malformed and unexpected responses: an HTML error page where JSON was expected, an extra field, a missing field, an empty body. Real dependencies return all of them eventually.

**Maintainability:** Contract tests make the agreement between services explicit. When the provider changes a response, the contract fails in the provider's build — before any consumer is affected in production.

> 💡 **Tip:** If a test for an outbound call takes more than a second, your test timeout configuration is probably the production one. Set short timeouts in the test profile so slow-path tests stay fast.

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

**Best practices:** Measure before caching, estimate the hit ratio, fix slow queries first, and design so the system survives the cache being empty or unavailable. A cache is an optimisation, never a dependency for correctness.

**Common production bugs:** A cache restart or a deploy that clears an in-process cache sends the full read load to a database sized for the cached hit ratio — and it falls over. This is the thundering herd, and it turns a routine restart into an outage.

**Scalability concerns:** Caches let a system serve far more reads than its source could, which means the source is no longer sized for uncached load. Capacity planning must include the cold-cache scenario.

**Monitoring:** Export hit ratio, miss ratio, eviction count and latency per cache. A hit ratio that drops after a deploy usually means the key shape changed, and the database load graph confirms it.

**Security implications:** Never place per-user or per-tenant data under a key that omits the user or tenant. A shared key turns a cache into a data-leak mechanism between users.

---

### 10.2 The Spring Cache Abstraction

**Best practices:** Explicit keys, `unless = "#result == null"` where nulls should not be cached, eviction after commit, immutable cached values, and per-cache TTLs configured in the `CacheManager`.

**Common production bugs:** A cached mutable object modified by one caller, silently changing what every subsequent caller receives from an in-process cache. Return immutable records or copies from cached methods.

**Performance considerations:** `sync = true` prevents duplicate loading within one instance but not across instances. For expensive loads on a large fleet, combine it with a distributed lock or refresh-ahead.

**Debugging tips:** When a cached method seems to always execute, check for self-invocation and confirm the bean is proxied. When it seems never to execute, check whether the key is constant by accident.

**Maintainability:** Name caches after what they hold and document their TTL and invalidation trigger next to the configuration. Six months later, "why is this value stale?" needs that answer quickly.

---

### 10.3 Redis

**Best practices:** Set `maxmemory` and an explicit eviction policy, give every key a TTL, use JSON serialisation, avoid blocking commands (`KEYS`, large `DEL`s), and keep values small.

**Common production bugs:** Memory exhaustion from keys without TTLs accumulating over months, until Redis evicts aggressively or rejects writes and every dependent service degrades at once.

**Performance considerations:** Redis is single-threaded per instance for command execution, so one slow command — a huge `HGETALL`, a `KEYS` scan — adds latency to every client. Large values also inflate network time on every hit.

**Scalability concerns:** A single Redis instance caps throughput and memory. Redis Cluster shards the keyspace, but multi-key operations then require keys in the same hash slot — design keys with that in mind before you need to scale.

**Monitoring:** Track memory usage, evicted keys, hit ratio, connected clients and slow-log entries. Rising evictions mean the cache is undersized; slow-log entries identify the commands hurting everyone.

> ⚠️ **Warning:** `KEYS *` in production blocks Redis for every client while it scans the whole keyspace. Use `SCAN` — and treat any code path issuing `KEYS` as a production incident in waiting.

---

### 10.4 Caching Patterns

**Best practices:** Cache-aside with eviction on write, eviction after commit, and a TTL on every entry. Cache individual entities rather than query results where possible — entity invalidation is tractable, list invalidation rarely is.

**Common production bugs:** Stale data after concurrent updates because the code wrote new values into the cache instead of evicting, and two writes interleaved. The cache now holds a value that no longer matches the database and will until expiry.

**Real-world use case:** Product catalogue reads with cache-aside: high hit ratio, tolerant of a minute of staleness, invalidated on edit — the canonical case where caching pays enormously.

**Scalability concerns:** Write-behind looks attractive for write-heavy workloads but moves durability into the cache. For anything financial or contractual, the risk of losing acknowledged writes outweighs the throughput gain.

**Testing advice:** Test the invalidation path: update the source, then read through the cache, and assert the new value. Most caching bugs are on the write side, and most tests only check reads.

---

### 10.5 Expiry and Invalidation

**Best practices:** TTL on everything, sized to the business tolerance for staleness; event-driven eviction after commit for data that must update promptly; TTL jitter for bulk-loaded entries; and single-flight loading for hot keys.

**Common production bugs:** Synchronised expiry — thousands of entries loaded together at start-up, all expiring at once ten minutes later, producing a periodic database spike that looks like a mysterious recurring incident.

**Scalability concerns:** Invalidation fan-out across many instances with in-process caches adds messaging load proportional to write rate times instance count. Past a certain scale, a shared distributed cache is simpler.

**Monitoring:** Graph database query rate alongside cache miss rate. Correlated spikes reveal stampedes and expiry storms that individual metrics hide.

**Debugging tips:** When stale data is reported, determine the age of the cached entry and when the source changed. If the entry outlived the change, the invalidation path failed; if not, the TTL is simply longer than the business expects.

---

### 10.6 Event-Driven Architecture

**Best practices:** Publish facts in past tense, with a stable event id, an occurrence timestamp and a schema version; publish after commit through an outbox; propagate trace context in headers; and document every event's owner and consumers.

**Common production bugs:** An event published before the transaction commits, then the transaction rolls back — downstream systems now believe something happened that did not, and no compensating event exists.

**Scalability concerns:** Events decouple scaling: consumers absorb spikes at their own pace while the broker buffers. That buffering is also a risk — a consumer that falls hours behind is a silent outage for whatever depends on it.

**Monitoring:** End-to-end latency from occurrence to processing, per consumer. Broker health alone tells you nothing about whether the business flow is working.

**Maintainability:** Maintain an event catalogue — names, schemas, producers, consumers. Without it, nobody knows who will break when an event changes, and teams stop daring to change anything.

---

### 10.7 Kafka Fundamentals

**Best practices:** Choose partition counts for peak consumer parallelism with headroom, replication factor 3 with `min.insync.replicas=2`, keys that reflect ordering needs, and retention that covers your longest plausible consumer outage plus replay.

**Common production bugs:** A topic created with one partition during development and never changed, capping its consumers at a single thread forever — or increased later, breaking ordering for keys that moved.

**Scalability concerns:** Partitions are the scaling unit, but very large partition counts cost broker memory and lengthen rebalances and leader elections. Size deliberately rather than generously.

**Monitoring:** Under-replicated partitions, offline partitions, broker disk usage and request latency at the cluster level; consumer lag at the application level. Under-replicated partitions are the earliest sign of a broker problem.

**Modern recommendations:** Run KRaft-mode clusters — ZooKeeper support was removed in Kafka 4.0 — or a managed service, and treat topic configuration as code reviewed alongside the services that use it.

---

### 10.8 Producing Messages

**Best practices:** `acks=all` with idempotence, compression, a meaningful key, a schema registry for compatibility, and every send's future handled — logged on failure at minimum, retried or surfaced where the event matters.

**Common production bugs:** Fire-and-forget sends whose failures are never observed, so a broker outage silently drops events while the application reports success. The gap surfaces days later as missing downstream data.

**Performance considerations:** Batching (`linger.ms`, `batch.size`) and compression transform throughput at a cost of a few milliseconds of latency. Synchronous `get()` on every send destroys batching and throughput.

**Security implications:** Events are frequently consumed by many teams and retained for days. Exclude secrets and minimise personal data in payloads; once published, data cannot be selectively deleted from retained partitions.

**Maintainability:** Use a schema registry with compatibility rules. Without it, a producer change that renames a field breaks consumers at runtime, in production, in other teams' services.

---

### 10.9 Consumers and Consumer Groups

**Best practices:** Keep per-record processing fast and well within `max.poll.interval.ms`, use cooperative rebalancing, match concurrency to partition count, and make every listener idempotent.

**Common production bugs:** Rebalance storms: processing a batch takes longer than the poll interval, the consumer is evicted, its partitions are reassigned, the records are redelivered and processed again — and the cycle repeats, collapsing throughput.

**Scalability concerns:** Scaling consumers beyond the partition count does nothing. When lag grows despite adding instances, either partitions are the limit or processing per record is too slow.

**Monitoring:** Consumer lag per partition is the single most important metric. Alert on lag growth rate, not only absolute lag — a steadily climbing lag predicts an outage hours before users notice.

**Debugging tips:** Correlate rebalance events in logs with processing time. Rebalances clustered around slow downstream calls point straight at the poll-interval problem.

> 💡 **Tip:** If one record per poll takes seconds because of a remote call, either raise `max.poll.interval.ms` deliberately or hand work to an internal executor with careful offset management — but never let processing silently exceed the interval.

---

### 10.10 Delivery Semantics and Idempotency

**Best practices:** Design for at-least-once everywhere: stable producer-assigned event ids, deduplication in the same transaction as the side effect, and naturally idempotent operations wherever the domain allows.

**Common production bugs:** Double charges, duplicate emails and inflated counters after a rebalance or a consumer restart redelivers records that were processed but not yet committed.

**Real-world use case:** Payment and order processing, where a processed-events table keyed by event id — inserted in the same transaction as the state change — turns redelivery into a harmless no-op.

**Testing advice:** Deliver the same event twice in a test and assert the effect happened once. It is the most valuable consumer test there is, and the bug it prevents is expensive and customer-visible.

**Maintainability:** Prune deduplication tables on a schedule with a retention longer than any redelivery window. Without pruning they grow forever and their unique index slows every insert.

---

### 10.11 Retries and Dead-Letter Topics

**Best practices:** `ErrorHandlingDeserializer` on every consumer, explicit classification of retryable and non-retryable exceptions, bounded exponential back-off, a dead-letter topic per consumer, alerting on DLT traffic, and a documented replay procedure.

**Common production bugs:** A poison pill — a malformed record — stalling a partition for hours because the deserialiser threw before error handling could engage. Every record behind it waits, and lag grows without bound.

**Monitoring:** Alert on any message arriving in a dead-letter topic. A DLT is not a waste bin; every record in it is a business operation that did not happen.

**Real-world use case:** A downstream dependency outage: transient failures retry with back-off and recover when it returns, while genuinely invalid records go to the DLT immediately rather than retrying pointlessly.

**Maintainability:** Store failure metadata — exception, stack trace summary, original topic, partition and offset — in DLT headers. Replay and diagnosis are far easier with the context attached to the record itself.

> ⚠️ **Warning:** A dead-letter topic without alerting is a silent data-loss mechanism. Records accumulate, nobody looks, and the business discovers the missing orders or payments weeks later.

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

**Best practices:** Layered images on a small, patched JRE base, a non-root user, an exec-form entrypoint, `MaxRAMPercentage` instead of a fixed `-Xmx`, image tags tied to the Git commit, and a vulnerability scan in CI that fails on critical findings.

**Common production bugs:** `OOMKilled` pods with no Java `OutOfMemoryError`, because heap plus metaspace, thread stacks and direct buffers exceeded the container limit. The fix is headroom, not a bigger heap.

**Performance considerations:** CPU limits throttle the JVM in bursts — start-up, JIT compilation and GC are all CPU-hungry. Very tight CPU limits produce slow starts and latency spikes that look like application bugs.

**Security implications:** The base image's operating-system packages are part of your attack surface. Rebuild regularly to pick up patches, even when your code has not changed.

**Modern recommendations:** Use buildpacks or the Boot 3.3+ `tools` jar mode for layering, consider Class Data Sharing for faster start-up, and evaluate native images only where start-up time or memory genuinely drives cost.

> ⚠️ **Warning:** Set `spring.lifecycle.timeout-per-shutdown-phase` comfortably below the platform's grace period. If shutdown outlasts it, the process is killed mid-request and graceful shutdown achieved nothing.

---

### 11.2 Docker Compose for Local Environments

**Best practices:** Pin image versions to match production, keep the module development-only, use random host ports, and add Compose healthchecks for services that initialise slowly.

**Common production bugs:** Compose support reaching a production artifact — the Maven plugin excludes it by default, but a custom build or a Gradle `implementation` dependency packages it — so the application tries to run `docker compose` at start-up in an environment without Docker, failing start-up or logging confusing errors.

**Maintainability:** Treat `compose.yaml` as code: review version bumps, keep it next to the application, and update it in the same change that adopts a new infrastructure feature.

**Testing advice:** Prefer Testcontainers for automated tests even if developers use Compose locally; tests need isolated, disposable infrastructure per run.

**Real-world use case:** A new team member clones the repository and runs the application in one command, with PostgreSQL, Redis and a mail catcher started automatically and connected without configuration.

---

### 11.3 API Documentation with OpenAPI

**Best practices:** Generate the document in CI, publish it per release, diff it against the previous release to catch breaking changes, and document error responses as `ProblemDetail` schemas.

**Common production bugs:** Client SDKs generated from an outdated document, failing against the live API because the document was produced by hand or from a different branch.

**Security implications:** Disable or secure Swagger UI and `/v3/api-docs` for internal APIs in production. A complete map of endpoints and parameters is reconnaissance handed to an attacker.

**Maintainability:** Keep annotations focused on what types cannot express — summaries, examples, error codes. Excessive annotation turns controllers into documentation files with code hidden inside.

**Modern recommendations:** springdoc-openapi 2.x on Boot 3.x (newer major versions track Boot 4), OpenAPI 3.1 where tooling supports it, and contract-first design for public APIs.

---

### 11.4 API Versioning

**Best practices:** Evolve additively by default, version only for breaking changes, publish a deprecation policy, send `Deprecation` and `Sunset` headers, and measure traffic per version before removing anything.

**Common production bugs:** An "internal" field rename shipped without a version bump, breaking a mobile app release already in users' hands — which cannot be rolled back on the client side.

**Monitoring:** Tag request metrics with the API version so you know exactly who still calls the old one and how often.

**Maintainability:** Keep versioned controllers and DTOs thin, mapping onto one shared service layer. The cost of a version should be a mapping layer, not a parallel codebase.

**Modern recommendations:** On Boot 3.x use path versioning or mapping conditions; on Boot 4, Spring Framework 7's native versioning removes the hand-rolled plumbing and includes deprecation-header support.

---

### 11.5 Pagination, Sorting and Filtering

**Best practices:** Paginate every collection endpoint, cap `max-page-size`, allow-list sortable fields, add a unique tie-breaker to every sort, and index for the sorts you allow.

**Common production bugs:** An admin export endpoint paging with deep offsets over millions of rows — every page slower than the last, eventually timing out halfway through.

**Performance considerations:** `COUNT(*)` on a large, filtered table can cost more than fetching the page. Use `Slice` or keyset scrolling when an exact total is not needed.

**Security implications:** Validate filter inputs and never build JPQL or SQL by concatenation. `Specification`s and parameter binding keep dynamic filters injection-safe.

**Scalability concerns:** Offset pagination degrades with data growth; keyset pagination stays constant. Endpoints used for synchronisation or export should be keyset-based from the start.

---

### 11.6 Logging

**Best practices:** Structured JSON to stdout, consistent field names, trace ids in every line, `INFO` for meaningful events only, and a clear policy on personal data.

**Common production bugs:** Personal data — emails, card fragments, tokens — in logs retained for years, creating a compliance incident discovered during an audit rather than during development.

**Performance considerations:** Synchronous logging of large volumes adds latency to request threads. Async appenders help, but the real fix is logging less on hot paths.

**Debugging tips:** Change a single package to `DEBUG` through the actuator `loggers` endpoint during an incident, then change it back. Leaving debug logging on indefinitely is a cost and data-exposure problem.

**Monitoring:** Alert on error-log rate per service as a backstop, but prefer metric-based alerts; logs are for investigation, not primary detection.

> ⚠️ **Warning:** Request and response body logging "for debugging" is the most common way secrets end up in log storage. If it is ever enabled, it must mask sensitive fields and be time-limited.

---

### 11.7 Spring Boot Actuator

**Best practices:** Separate management port, minimal exposure (`health`, `info`, `prometheus`), a dedicated `SecurityFilterChain`, `show-details: when-authorized`, and network policies so only the platform and monitoring can reach it.

**Common production bugs:** `/actuator/env` or `/actuator/heapdump` exposed publicly, leaking credentials — a real and repeatedly exploited misconfiguration found by automated scanners within hours.

**Security implications:** Treat `loggers` as writable configuration and `heapdump` as a memory dump of secrets. Both require strong authorisation if exposed at all.

**Monitoring:** Scrape `/actuator/prometheus` and alert when the scrape itself fails — a service that stops exposing metrics is often a service in trouble.

**Maintainability:** Re-check actuator configuration after each Boot upgrade; defaults and endpoint access controls have changed between versions.

---

### 11.8 Health Checks and Probes

**Best practices:** Liveness from internal state only, readiness from internal state plus deliberately chosen dependencies, a startup probe for slow starts, cheap and fast checks, and probes that hit the main server port.

**Common production bugs:** A database blip failing every pod's liveness probe simultaneously, triggering a fleet-wide restart that turns a ten-second dependency hiccup into a ten-minute outage.

**Performance considerations:** Health indicators run on every probe. A slow indicator — a remote ping with no timeout — makes probes time out under load exactly when the system is stressed.

**Debugging tips:** For restart loops, check the pod's events and previous container logs; a liveness failure during start-up usually means a missing or too-short startup probe.

**Real-world use case:** During a rolling deploy, readiness keeps each new pod out of rotation until its caches are warm and migrations verified, and graceful shutdown drains each old pod before it stops.

---

### 11.9 Metrics with Micrometer

**Best practices:** Instrument the RED metrics for every endpoint and dependency, add a few business metrics, use histograms for latency, set common tags such as application and region, and review cardinality before adding any tag.

**Common production bugs:** A tag holding a raw path or customer id creating millions of time series, overwhelming the metrics backend and degrading monitoring for every service sharing it.

**Monitoring:** Alert on symptoms users feel — error rate and latency against SLOs — rather than causes such as CPU. Cause metrics are for diagnosis once an alert fires.

**Scalability concerns:** Histogram buckets multiply series by bucket count. Enable percentile histograms on the meters that matter, not globally.

**Real-world use case:** A HikariCP pending-connections gauge climbing alongside p99 latency pinpoints pool exhaustion within minutes, before any error appears.

> 💡 **Tip:** Define dashboards and alerts as code alongside the service. Metrics nobody looks at, and alerts nobody owns, are cost without value.

---

### 11.10 Distributed Tracing

**Best practices:** Boot's instrumented client builders everywhere, observation enabled on messaging, context propagation on custom executors, modest head sampling plus tail sampling for errors and slow requests, and trace ids in every log line.

**Common production bugs:** Traces that stop at a service boundary because one client was built with `new RestTemplate()` or a thread pool dropped the context — discovered only during the incident that needed the trace.

**Performance considerations:** Span creation is cheap, but exporting at full sampling consumes CPU, network and backend storage. Sample proportionally to traffic and value.

**Security implications:** Span attributes and baggage travel to the tracing backend and downstream services. Keep personal data and secrets out of both.

**Modern recommendations:** Micrometer Tracing with the OpenTelemetry bridge and OTLP export to a collector, which handles sampling, enrichment and routing to the chosen backend.

---

### 11.11 Configuration and Secrets

**Best practices:** Secrets from a secret manager or mounted files, never from the repository or image; validated `@ConfigurationProperties`; secret scanning in CI and on push; and automated rotation.

**Common production bugs:** A rotated database password breaking every instance at once because the application read it only at start-up and the old credential was revoked immediately.

**Security implications:** Restrict who can read secrets in the platform, enable encryption at rest, and audit access. Environment variables leak through diagnostics, crash reports and child processes more easily than files.

**Testing advice:** Start the application in CI with the production configuration shape and dummy values, so missing or invalid properties fail the pipeline instead of the deploy.

**Maintainability:** Document every property the service needs, with its source per environment. Configuration that only exists in someone's memory becomes an outage when that person is on holiday.

> ⚠️ **Warning:** A secret that reaches Git history, a container image or a log file must be rotated, not deleted. Deletion hides it from you, not from anyone who already copied it.

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

**Best practices:** Package by feature with enforced boundaries, one database owned by the service, short local transactions, an outbox for events, resilient clients for every dependency, and observability designed in from the first commit.

**Common production bugs:** The dual-write problem — the order committed but the event never published, or the event published for an order that rolled back — producing customers charged for orders that shipping never sees.

**Scalability concerns:** Scale the stateless application horizontally first; the database becomes the bottleneck next. Read replicas, caching and query tuning come before any talk of splitting the service.

**Maintainability:** Enforce module boundaries with architecture tests such as ArchUnit or Spring Modulith's verification, so the modular monolith stays modular as the team grows.

**Anti-pattern:** The distributed monolith — services split too early that must be deployed together and call each other synchronously for every request, combining the costs of both architectures with the benefits of neither.

---

### 12.2 Designing the Domain and API

**Best practices:** Invariants inside aggregates, explicit state transitions, DTOs at the boundary, opaque identifiers, money as minor units with currency, `ProblemDetail` errors with stable types, and paginated collections.

**Common production bugs:** Lost updates when two requests modify the same order concurrently without a `@Version` field — the second write silently overwrites the first.

**Security implications:** Check ownership on every order access — an authenticated user requesting `/orders/{id}` for someone else's order is the most common API vulnerability (broken object-level authorisation).

**Testing advice:** Unit-test the aggregate's state machine exhaustively — every allowed and forbidden transition. It is fast, has no infrastructure, and protects the most important rules.

**Maintainability:** Name things in the language the business uses. When the code says `Order.cancel()` and the business says "cancel", conversations and code reviews stay aligned.

---

### 12.3 Timeouts, Retries and Circuit Breakers

**Best practices:** Explicit connect and read timeouts on every client, deadlines shorter at each inner layer, retries in one layer only with capped exponential back-off and jitter, breakers per dependency, and fallbacks that are visible in metrics.

**Common production bugs:** A dependency without a read timeout hanging during a network partition, holding every Tomcat thread until the whole service stops responding — including its health checks.

**Monitoring:** Export breaker state, retry counts and fallback invocations — Resilience4j publishes Micrometer metrics. An open breaker or a rising fallback rate should alert as clearly as errors do.

**Testing advice:** Test failure behaviour deliberately with WireMock delays and faults, or Toxiproxy in integration tests: slow responses, connection resets and `503`s. Untested resilience configuration usually does not work as intended.

**Anti-pattern:** Retrying on every exception, including `400` responses and validation failures that will fail identically on every attempt.

> ⚠️ **Warning:** A retry on a non-idempotent call without an idempotency key is a duplicate-payment generator. Make the operation idempotent before making it retryable.

---

### 12.4 Rate Limiting and Backpressure

**Best practices:** Rate limits at the edge per client, bulkheads per dependency, bounded queues everywhere, pool wait timeouts shorter than client timeouts, and `429` with `Retry-After` for rejected work.

**Common production bugs:** After enabling virtual threads, a traffic spike sends thousands of concurrent requests to a ten-connection Hikari pool; requests wait for connections, time out en masse, and the service appears to collapse under load it used to handle.

**Performance considerations:** Fast rejection is cheap; slow failure is expensive. Shedding excess load early keeps latency for accepted requests within the objective.

**Scalability concerns:** Autoscaling takes minutes; rate limits and load shedding protect the service during that gap. Neither replaces the other.

**Monitoring:** Track rejected requests per client and per limit, pool pending counts and queue depths. A client hitting its limit constantly is either abusive or misconfigured — both worth knowing.

---

### 12.5 Idempotent APIs

**Best practices:** Required idempotency keys on every non-idempotent mutating endpoint, request fingerprinting, a unique constraint, the response stored in the same transaction as the effect, and scheduled expiry of old keys.

**Common production bugs:** Double charges after a mobile client retried a payment on a flaky network — the first request succeeded, its response was lost, and the server had no way to recognise the retry.

**Security implications:** Scope idempotency keys to the authenticated client, so one client cannot replay another's stored response by guessing or reusing its key.

**Testing advice:** Send the same request twice, and twice concurrently, and assert one effect and identical responses. Then crash between steps in an integration test and assert the retry still behaves.

**Real-world use case:** Payment providers widely require idempotency keys on payment-creating requests; adopting the same pattern for your own APIs makes client retries safe end to end.

---

### 12.6 Performance and Load Testing

**Best practices:** SLO-based pass criteria, production-like data volumes, open workload models, warm-up excluded from results, tests run in CI on a schedule, and every result compared with the previous run.

**Common production bugs:** A soak-only bug — a slow memory leak, an unbounded cache, a connection leak — that passes every short test and takes the service down after three days of uptime.

**Performance considerations:** Measure before tuning. Most Spring Boot bottlenecks are database queries, pool sizing and remote calls, not framework overhead or garbage collection.

**Debugging tips:** Correlate the latency knee with saturation metrics; the first resource to reach 100% — connections, CPU, a lock — is the bottleneck. JFR's lock and allocation profiles find contention and churn quickly.

**Modern recommendations:** Keep Gatling or k6 scenarios in the repository, run a short performance test on every release candidate, and a full soak before major changes.

---

### 12.7 Zero-Downtime Deployment

**Best practices:** Readiness probes, a `preStop` delay, graceful shutdown inside the grace period, `maxUnavailable: 0`, expand-and-contract migrations, additive API and event changes, and automated rollback on canary metric regressions.

**Common production bugs:** A Flyway migration that renames or drops a column the previous release still uses, applied by the first new pod — every old pod's queries against it now fail for the remainder of the rollout.

**Performance considerations:** Large migrations — index creation, backfills — lock or load tables. Run them online (`CREATE INDEX CONCURRENTLY` in PostgreSQL) and batch backfills, separately from the deploy.

**Debugging tips:** For errors clustered at deploy times, compare their timestamps with pod termination events; `502`/`503` spikes at termination almost always mean missing `preStop` delay or graceful shutdown.

**Maintainability:** Track multi-step migrations explicitly — a checklist or ticket per contract step — so the "drop the old column" release is not forgotten for years.

---

### 12.8 Feature Flags and Safe Releases

**Best practices:** Owners and expiry dates for release flags, safe defaults at every call site, evaluation once per request, both paths tested, and flag changes audited like deployments.

**Common production bugs:** A stale flag flipped by mistake during an unrelated incident, re-enabling a code path that had been dead for a year and no longer worked with the current schema.

**Security implications:** Flag administration is production change access. Restrict who can flip flags, require review for sensitive ones, and log every change.

**Monitoring:** Tag metrics with flag variants during a rollout, so error rate and latency can be compared between the old and new paths directly.

**Modern recommendations:** Use OpenFeature as the in-code API so the flag provider can be changed without touching business code, and remove each release flag in the sprint after it reaches 100%.

---

### 12.9 Operating the Service

**Best practices:** A few user-centred SLOs, burn-rate alerts that page only on real user impact, dashboards built around golden signals, a runbook per alert, and blameless reviews with owned, tracked actions.

**Common production bugs:** Alert fatigue — dozens of noisy, cause-based alerts that on-call engineers learn to ignore, so the one alert that mattered is acknowledged and forgotten.

**Monitoring:** Synthetic checks of critical journeys, such as placing a test order, catch failures that internal metrics miss — DNS, certificates, routing and the gateway in front of the service.

**Real-world use case:** An error budget exhausted by a run of bad releases triggers a release freeze for features while the team fixes deploy safety — an objective rule rather than a political argument.

**Maintainability:** Review alerts and runbooks after every incident and every quarter. Delete alerts that never lead to action.

> 💡 **Tip:** Practise restores. A backup that has never been restored is a hope, not a backup.

---

### 12.10 Upgrading Spring Boot

**Best practices:** Patch releases applied continuously, a minor upgrade every release cycle, zero deprecation warnings as a build rule, the properties migrator during upgrades, and Boot-managed dependency versions instead of manual overrides.

**Common production bugs:** A transitive dependency version change after an upgrade — a new Jackson, Hibernate or driver default — altering serialisation or query behaviour in a way the tests did not cover.

**Security implications:** End of OSS support means new CVEs in the framework go unpatched for free users. Track the support timeline and plan upgrades before the date, not after an advisory.

**Testing advice:** Contract tests, Testcontainers integration tests and a staging soak catch most upgrade regressions; unit tests alone catch very few, because upgrades change integration behaviour.

**Modern recommendations:** New projects should start on Spring Boot 4.x. Existing 3.x applications should move to the latest 3.5.x, clear every deprecation, then upgrade to 4.x — using OpenRewrite for the mechanical changes and the official migration guide for the rest.

---

### 12.11 Explaining the System in an Interview

**Best practices:** Prepare one system deeply: its numbers, a diagram you can draw in two minutes, one end-to-end flow, two failure scenarios, one incident and its lessons, and the trade-offs you would revisit.

**Common production bugs:** The interview equivalent — claiming a design you cannot defend. The first follow-up about failure handling or consistency exposes it immediately.

**Real-world use case:** Use this curriculum's order service as a practice target: explain why the outbox exists, what the breaker protects, how a deploy avoids downtime and what the SLO is — then repeat the exercise for your own system.

**Maintainability:** Keep an engineering journal of decisions, incidents and metrics from your real work. It turns "I think we used…" into specific, credible answers.

**Anti-pattern:** Reciting buzzwords — CQRS, event sourcing, sagas, service mesh — for a system that did not need them. Interviewers reward appropriate simplicity over impressive complexity.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Curriculum Complete

You have now worked through all twelve groups at every level of depth:

| File | Goal | Outcome |
|---|---|---|
| `0_foundation.md` | Build the mental map | *"I know what every piece of the framework is."* |
| `1_understand.md` | Develop understanding | *"I understand how this works."* |
| `2_interview.md` | Prepare for interviews | *"I can answer confidently."* |
| `3_production.md` | Apply professionally | *"I know how professionals use this."* |

**Suggested next steps:**

- **Build the reference service.** Implement the order service from Group 12 end to end — REST API, JPA with Flyway, an outbox to Kafka, a resilient payment client, JWT security, Testcontainers tests and Actuator metrics. Every group becomes concrete the moment its pieces have to work together.
- **Break it on purpose.** Remove a timeout and slow the payment stub, drop an index and load test, publish an event inside the transaction and kill the process at the wrong moment. Watching each failure happen is what makes the correct pattern stick.
- **Read the reference documentation for your version.** The Spring Boot, Spring Framework and Spring Data reference guides are thorough and accurate, and they describe exactly the version you run — including what changed in Spring Boot 4.
- **Revisit the interview file before interviews specifically.** The follow-up questions and edge cases are where a good answer becomes a convincing one.
- **Treat the production file as a review checklist.** Its warnings map to the failures that actually cause incidents — missing timeouts, N+1 queries, long transactions, exposed actuator endpoints, non-idempotent retries and destructive migrations.
