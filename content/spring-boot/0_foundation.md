# Spring Boot — Foundation

> **Goal of this file:** Build a complete mental map of Spring and Spring Boot. After reading, you should be able to say *"I know what every piece of the framework is."* No deep internals, no implementation detail — just what things are, why they exist, and what problem they solve. Assumes you already know Java; see the Java curriculum for the language itself.

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

An application is a web of objects: a controller needs a service, the service needs a repository, the repository needs a connection pool. Something has to create all of them, in the right order, and hand each one the others it needs. In early-2000s enterprise Java that something was your own code — factories, lookups and XML descriptors, written before any business logic could run.

Spring takes that job away. You write plain Java classes and say what each one needs; Spring's **container** creates them, connects them, and manages their lifetime.

Follow the consequence: once one component creates every object, it can also hand out a *wrapped* version — one that starts a transaction or checks a permission before your code runs. *The framework builds your objects, so it can also wrap them* — that single idea explains most of Spring. The framework is modular: web, data access, security, messaging and testing are modules built on that container, and you add only the parts you use.

> 💡 **Tip:** "Spring" usually means the whole ecosystem. "Spring Framework" is the core container and its modules; "Spring Boot" is the layer on top that configures them for you.

---

### 1.2 Inversion of Control

Picture a service that builds its own repository: `new JdbcOrderRepository(url, user, password)`. Now the service knows which database, which driver and which credentials — and testing it requires that database. Needing a repository has dragged in knowing *how one is built*.

**Inversion of Control** cuts that link. The object stops creating or finding its dependencies and simply declares them; something else — the container — supplies them. Control over construction moves from the class to the framework.

The payoff follows on its own: if the class does not build its dependencies, anyone can hand it different ones. A test passes an in-memory fake and the class never notices. Testability is not an extra feature of IoC — it falls straight out of it.

---

### 1.3 The ApplicationContext

If objects no longer build their dependencies, something must hold the whole picture: which objects exist, what each one needs, and the order to build them in. That something is the `ApplicationContext`, Spring's container.

It reads your configuration, creates the objects it describes, injects their dependencies, and keeps them for the life of the application.

```java
var context = new AnnotationConfigApplicationContext(AppConfig.class);
var service = context.getBean(OrderService.class);
```

Because every managed object passes through it, the context is also where the framework attaches its features — transactions, security, scheduling, events. In a Spring Boot application you rarely create it by hand: `SpringApplication.run()` builds one and starts it.

---

### 1.4 Beans and the Bean Lifecycle

A **bean** is simply an object the container manages. The word means nothing more than "Spring created this and knows about it".

Since Spring creates the object, it controls every moment of its life: it instantiates it, injects its dependencies, runs initialisation callbacks, hands it out for use, and at shutdown runs destruction callbacks.

Those fixed moments are what let the framework act without your code asking — open a connection pool once its settings are injected, close it before the JVM exits, or swap the finished object for a wrapper. Because the stages always run in the same order, what the framework does to a bean is predictable.

---

### 1.5 Component Scanning and Stereotypes

Listing every class in a configuration file does not scale: hundreds of entries, each easy to forget. But the classes already sit in your packages — the framework can simply look for them.

**Component scanning** does exactly that: Spring searches your packages for classes marked as components and registers them as beans. The marks are the **stereotype annotations**: `@Component` for anything, and `@Service`, `@Repository` and `@Controller` for the usual layers. All four register a bean; the specific ones document intent and sometimes add behaviour.

One consequence to remember: scanning searches only *beneath* the package where it starts. A class outside that tree is invisible, however correctly it is annotated.

```java
@Service
public class OrderService { }
```

---

### 1.6 Dependency Injection Styles

Spring can hand an object its dependencies at three moments: while constructing it (**constructor** injection), after construction through **setters**, or by writing directly into **fields**.

The moment decides everything. With constructor injection the object cannot exist without its dependencies, so it is fully built the moment it exists, its dependencies are visible in one place, its fields can be `final`, and a test can simply call the constructor. With setter or field injection the object exists first and is filled in afterwards — so for a while it is incomplete. Field injection also hides the dependencies and cannot be done at all without the container's reflection.

That is why constructor injection is the recommended default.

```java
@Service
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {   // injected automatically
        this.repository = repository;
    }
}
```

---

### 1.7 Configuration Classes and @Bean

Scanning only works for classes you can annotate. A `RestClient` from a library, an object that needs a URL and timeouts to build, a choice between two implementations made at startup — you cannot put `@Component` on code you do not own, and an annotation cannot make decisions.

So Spring lets you write the construction in Java. A `@Configuration` class contains `@Bean` methods; each returns an object the container should manage, named after the method.

```java
@Configuration
public class ClientConfig {
    @Bean
    RestClient paymentClient(PaymentProperties properties) {
        return RestClient.builder().baseUrl(properties.url()).build();
    }
}
```

Because it is ordinary code, anything Java can do — conditions, builders, loops — is available when deciding what to create.

---

### 1.8 Bean Scopes

How many instances of a bean should exist? A stateless service holds no per-user data, so one shared instance can serve every request. That is the default scope, **singleton**: one instance per container, shared by everyone.

Some objects *do* hold data that belongs to one request or one user, and sharing one instance of those would mix everyone's data. So Spring offers other **scopes**: **prototype** (a new instance per injection point or lookup) and the web scopes **request** and **session**, which tie an instance to one HTTP request or one user session.

The rule follows directly: a singleton is used by every request at once, so it must never hold mutable per-request state.

> ⚠️ **Common misconception:** A singleton bean is not a Java singleton. It is one instance *per container*, created and destroyed by Spring — not enforced by a private constructor.

---

### 1.9 Qualifiers and Ambiguity

Spring finds a dependency by its type: "this service needs a `PaymentGateway`". That works until there are two — a real gateway and a sandbox one, two data sources, two caches — a perfectly normal situation. The type no longer identifies one bean, and the framework refuses to guess: startup fails.

So you supply the missing information. `@Qualifier("name")` lets an injection point ask for a specific bean; `@Primary` marks one bean as the default for everyone who did not ask.

The failure happens at startup rather than on some later request for the same reason as every other wiring error: the container builds everything before the first request arrives, so an ambiguity is found immediately.

---

### 1.10 Proxies and AOP

Suppose fifty service methods must each run inside a database transaction. Writing begin–commit–rollback into each one gives fifty copies of the same code and fifty chances to get it wrong. Better to write it once and wrap it *around* the methods.

That wrapper is a **proxy**: an object with the same methods as your bean that runs extra behaviour before and after delegating to it. Spring hands other beans the proxy instead of your object. Transactions, security checks, caching and retries all work this way. **Aspect-Oriented Programming** is the general name for the idea: a cross-cutting concern kept in one place and applied to many methods.

Now follow the wrapper, and Spring's most famous surprise predicts itself. When a method calls another method *on the same object* — `this.save()` — the call never leaves your object, so it never passes through the wrapper, and the `@Transactional` on the second method does nothing.

> ⚠️ **Common misconception:** Annotations like `@Transactional` are not magic on the method. They are honoured by the proxy around the bean — which is why self-invocation silently skips them.

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

Spring removed the work of *creating* objects, but not of *declaring* them. A plain Spring application required a great deal of setup before the first line of business logic: a servlet container, a dispatcher servlet, view resolvers, a data source, a transaction manager, each declared by hand — and almost identically in every project.

Spring Boot exists to supply working defaults for all of it. Spring is the framework — the container and its modules. Spring Boot is a layer on top that configures those modules for you and gives the application a `main` method it can run directly.

Nothing is hidden permanently: every default Boot applies can be overridden by defining your own bean or setting a property. That is the whole design idea — *sensible defaults, until you say otherwise*.

---

### 2.2 Starters and Dependency Management

Even one job needs a dozen libraries — serving HTTP needs a web framework, a JSON library, validation and a server — and only certain versions of them work together. Choosing compatible versions by hand is tedious and error-prone, and a wrong choice compiles fine and fails at runtime.

A **starter** solves the *which libraries* half: a dependency that pulls in a coherent set of libraries for one job. Adding `spring-boot-starter-web` brings Spring MVC, Jackson, validation and an embedded Tomcat, all at versions known to work together.

Spring Boot's parent POM or BOM solves the *which versions* half: it manages those versions, so your build file lists what you need, not which version of it.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

---

### 2.3 Auto-Configuration

Most applications configure the same beans in the same way, and the facts needed to do it are already visible: which libraries are on the classpath, and which properties are set. Writing that configuration again in every project is pure repetition.

Auto-configuration is Spring Boot reading those facts: it looks at what is on the classpath and what you have configured, and then creates the beans it believes you need. Find a database driver and a URL, and it configures a data source.

It exists to remove the configuration that is the same in almost every application. The rules are conditional: each piece backs off if you have already defined that bean yourself, so your configuration always wins. That's all it is — a long list of *"if this is present, and you haven't done it yourself, do the usual thing"*.

> 💡 **Tip:** Run the application with `--debug` to print a report of every auto-configuration, whether it matched, and why.

---

### 2.4 The Embedded Server

Deploying a WAR into a separately installed application server made the runtime environment something operations configured and developers could not reproduce — the same code could behave one way on a laptop and another on the server.

So a Spring Boot web application contains its own HTTP server — Tomcat by default, with Jetty and Undertow as alternatives (Spring Boot 4 drops Undertow). You run a jar; the server starts inside it. An embedded server makes the application one self-contained process.

The old relationship is simply flipped: the application no longer lives inside a server — the server is a library living inside the application.

---

### 2.5 External Configuration

An application must behave differently in each environment — another database URL, another log level, other feature flags. Rebuilding it per environment would mean the thing you tested is not the thing you deploy.

So configuration lives outside the code, in `application.properties` or `application.yml`, and can be overridden by environment variables, command-line arguments and other sources.

It exists so the same build artifact runs in every environment. The database URL, the log level and the feature flags change; the jar does not.

```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shop
```

---

### 2.6 Profiles

Environments genuinely differ — an in-memory database locally, a real one in production; a stub payment gateway in testing, the live one in production. Branching inside the code (`if (environment is prod)`) would scatter those differences everywhere, and would be far worse.

A profile is a named set of configuration that is active only in certain environments. `application-dev.yml` applies when the `dev` profile is active, and `@Profile("dev")` makes a bean exist only then.

So each environment's differences live in one place, and the code itself is identical everywhere.

---

### 2.7 Type-Safe Configuration Properties

`@Value("${some.property}")` on individual fields has no structure, no validation and no discoverability — a typo produces a runtime failure at the moment the field is first used, if at all. Yet configuration is input typed by humans, and deserves the same checking as any other input.

`@ConfigurationProperties` exists to give it that: it binds a group of properties onto a typed object, so configuration arrives as a validated Java class rather than as scattered strings — checked once, at startup.

```java
@ConfigurationProperties("payment")
public record PaymentProperties(String baseUrl, Duration timeout) { }
```

---

### 2.8 Project Structure and Build

Component scanning starts at the application class's package, so where that class sits decides what Spring can see.

That is why the conventional layout puts the application class in the root package, with `controller`, `service`, `repository`, `domain` and `config` packages beneath it.

Maven and Gradle both work; Maven's `spring-boot-starter-parent` and Gradle's Spring Boot plugin each supply dependency management and the packaging task.

The structure exists as a convention rather than a requirement, but following it means scanning, testing and tooling all work without configuration.

---

### 2.9 Application Startup and Runners

Some work must happen once at startup — seeding data, registering with a service registry, validating connectivity — and it needs the *finished* application. Constructors and `@PostConstruct` run too early, while beans are still being created.

`SpringApplication.run()` creates the context, applies auto-configuration, starts the embedded server and publishes lifecycle events. If you need code to run once at startup, `ApplicationRunner` and `CommandLineRunner` are the hooks, and they run at the end of that sequence.

They exist so one-off startup work has a defined place that runs after the context is ready, not during bean creation.

---

### 2.10 Packaging and Running

Deploying used to mean installing a server and copying an archive into it. Once the server lives inside the application — see [[#2.4 The Embedded Server]] — all that is left is to ship the application and its libraries together.

`mvn package` produces an executable jar containing your classes, your dependencies and a small launcher. `java -jar app.jar` runs it; no server installation is involved.

Boot can also build a **layered** jar, which separates rarely-changing dependencies from your frequently-changing code so container image layers can be cached effectively — a rebuild then ships only the part that changed.

> ⚠️ **Common misconception:** A Spring Boot jar is not an ordinary jar. It has its own internal layout and launcher, which is why unzipping one and running the classes directly does not work.

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

Two programs on different machines, written by different teams in different languages, need to talk. If every pair invented its own protocol, every client would need custom code for every server.

HTTP is the shared protocol instead — a request/response protocol: a client sends a method, a path, headers and sometimes a body; the server replies with a status code, headers and a body.

**REST** is a style of using HTTP in which URLs identify resources and methods describe what to do with them — `GET /orders/42` reads an order, `DELETE /orders/42` removes it.

It exists so that clients and servers share one predictable vocabulary. Anything that speaks HTTP — a browser, a mobile app, another service, a command-line tool — can use the API without a custom protocol.

---

### 3.2 The DispatcherServlet

Every endpoint has the same chores around its real work: find which method handles this URL, parse and convert the inputs, turn the result into JSON, and translate errors into responses. Written into each handler, that is the same code a hundred times.

The `DispatcherServlet` is the single entry point for every HTTP request in a Spring MVC application. It receives the request, finds the controller method that should handle it, calls it, and turns the result into a response.

It exists so routing, argument binding, serialisation and error handling are solved once, centrally, instead of in every handler. Your controllers only contain the part that is specific to them.

---

### 3.3 Controllers and Request Mapping

Once one dispatcher receives every request, it needs to know which of your methods handles which URL and HTTP method.

A controller is a class whose methods handle HTTP requests. `@RestController` marks it, and `@RequestMapping` — or its shortcuts `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` — maps methods to paths and HTTP methods.

They exist to connect a URL to a Java method without any manual parsing of the request — with the route written right beside the code it reaches.

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) { ... }
}
```

---

### 3.4 Binding Request Data

A raw request is just text: a path, a query string, headers and a body. Your method wants a `Long id` and a `CreateOrderRequest`. Something has to cut the text into pieces, convert each piece to the right type, and reject it if it is invalid.

Spring converts parts of the request into method parameters: `@PathVariable` for a segment of the URL, `@RequestParam` for a query parameter, `@RequestBody` for the request body, and `@RequestHeader` for a header.

This exists so a handler method reads like an ordinary Java method. The framework does the parsing, type conversion and validation before your code runs.

---

### 3.5 Responses and Status Codes

A client — and every load balancer, cache and monitoring tool in between — needs to know what happened without reading and interpreting your response body.

Returning an object from a controller method serialises it as the response body with status 200. `ResponseEntity` gives full control — status, headers and body — and `@ResponseStatus` sets a default status for a method or an exception.

Status codes exist as the standard way to tell a client what happened: 200 for success, 201 for created, 400 for a bad request, 404 for not found, 409 for a conflict, 500 for a server fault.

---

### 3.6 JSON Serialization

Java objects live in memory; a network carries only bytes. Every response object must become text the client understands, and every request body must become an object again — for every class, in both directions.

Spring Boot uses **Jackson** to convert Java objects to JSON and back. The conversion is automatic: a returned object becomes a JSON body, and a JSON body becomes a parameter object.

It exists so the wire format is a configuration concern rather than code you write. Annotations such as `@JsonProperty`, `@JsonIgnore` and `@JsonFormat` adjust how individual fields are represented.

---

### 3.7 Content Negotiation

Clients do not all want the same format, and when a server cannot send or read what a client uses, it should say so plainly instead of failing mysteriously.

Content negotiation is the server choosing a response format based on what the client asked for in the `Accept` header, and interpreting the request body based on `Content-Type`.

It exists so one endpoint can serve more than one representation, and so mismatches fail clearly — a client asking for XML from a JSON-only API gets 406 rather than something it cannot parse.

---

### 3.8 Designing a CRUD API

Nearly every API needs the same four operations on its resources — create, read, update, delete. If each team invents its own URLs and conventions for them, every integration starts with reverse-engineering.

A CRUD API maps the four basic operations onto HTTP: `POST` to create, `GET` to read, `PUT` or `PATCH` to update, `DELETE` to remove — all under a resource path such as `/api/orders`.

Good design exists because an API is a contract that outlives the code behind it. Consistent paths, plural nouns, correct status codes and a documented error shape make a service predictable to everyone who integrates with it.

> 💡 **Tip:** URLs name resources, not actions. `POST /orders/42/cancel` is acceptable for operations that are not plain CRUD; `POST /cancelOrder?id=42` is not.

---

### 3.9 Filters and Interceptors

Some work applies to every request — logging, correlation ids, security checks, compression. Putting it at the top of every controller method means copying it everywhere and forgetting it somewhere.

A **filter** is a servlet-level component that sees every request before Spring MVC does — used for logging, correlation IDs, security and compression. An **interceptor** is a Spring MVC component that runs around handler methods and knows which handler was selected.

They exist so cross-cutting request concerns live in one place rather than at the top of every controller method. The only real difference between the two is *where* they sit: a filter wraps the whole dispatcher, an interceptor wraps your handler.

---

### 3.10 Calling Other Services

A backend usually calls other HTTP services — a payment provider, an inventory service. Each call needs what inbound requests needed — serialisation, error handling — plus something new: the other side can be slow, so every call needs a time limit. Spring offers `RestClient` (the modern synchronous client), `WebClient` (reactive, also usable synchronously) and declarative HTTP interfaces that generate the client from an annotated Java interface.

They exist so outbound calls get the same conveniences as inbound ones: serialisation, error translation, timeouts, and a place to attach retries and metrics.

> ⚠️ **Common misconception:** `RestTemplate` still works, but it is on its way out: in maintenance mode on Spring Framework 6 (Boot 3), documented as deprecated in Spring Framework 7 (Boot 4), with removal planned for 8.0. New code should use `RestClient` or `WebClient`.

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

In a small application one class can receive the request, decide what to do and write to the database. As it grows, every change — a new API field, a new business rule, a new database — lands in the same tangled classes, and each edit risks breaking the other two concerns.

So the standard Spring Boot application is organised in layers: a controller receives the HTTP request, a service performs the business operation, and a repository reads and writes the database.

Each layer talks only to the one beneath it. The controller never touches the database; the repository never knows about HTTP.

This exists because each layer has one reason to change — the API shape, the business rules, the storage technology — and keeping them separate means a change to one does not ripple through the others.

```text
HTTP request → Controller → Service → Repository → Database
```

---

### 4.2 The Controller Layer

If HTTP details — paths, headers, status codes, JSON — leak into business code, that code can only ever be called over HTTP. A scheduled job or a message consumer needing the same operation would have to fake a request or duplicate the logic.

The controller's job is translation: turn an HTTP request into a call on the service, and turn the result into an HTTP response. It validates input, maps DTOs, and chooses status codes.

It exists so that everything specific to HTTP — paths, headers, status codes, serialisation — lives in one layer, and the business logic beneath it can be used by a scheduled job or a message consumer without change.

---

### 4.3 The Service Layer

Strip away HTTP and SQL, and what remains is what the business actually does. That part needs a home that does not depend on how it is called or where its data is stored.

The service layer holds the business operation: what it means to place an order, cancel a booking or apply a discount. It coordinates repositories, enforces rules and defines the transaction boundary.

It exists because business rules are the part of the application that is genuinely yours. Keeping them free of HTTP and SQL concerns is what makes them testable and durable.

---

### 4.4 The Repository Layer

Business code has to load and save data, but if it contains SQL and connection handling it is welded to one database technology and cannot be tested without one.

The repository is the boundary to the database. In Spring, an interface extending `JpaRepository` gives you standard operations — save, find, delete — without an implementation.

It exists so persistence is a dependency the service declares rather than a technology it embeds, and so the storage layer can be replaced or faked without touching business code.

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
}
```

---

### 4.5 DTOs and the API Boundary

The database's shape and the API's shape look alike at first, but they change for different reasons. If one class serves both, renaming a column breaks clients, and adding an internal column publishes it to the world.

A **DTO** — Data Transfer Object — is a class that exists to carry data across a boundary. Request DTOs describe what a client may send; response DTOs describe what the API returns.

They exist so the API's shape and the database's shape can change independently. Exposing entities directly makes every column a public contract and every API change a schema change.

---

### 4.6 Mapping Between Layers

Once each layer has its own objects — see [[#4.5 DTOs and the API Boundary]] — something has to convert between them.

Mapping is converting between DTOs and domain objects. It can be a hand-written method, a static factory, or a generated mapper such as MapStruct.

It exists as a deliberate step because the translation is where you decide what crosses the boundary. The alternative — passing one object everywhere — couples every layer to every other.

---

### 4.7 Bean Validation

Every input from outside can be missing, too long or malformed. Checking it with `if` statements at the top of every method is repetitive, easy to forget, and puts each rule far from the data it describes.

Bean Validation is the standard way to declare constraints on data: `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Min`, `@Max`. Adding `@Valid` to a controller parameter enforces them before the method runs.

It exists so input rules are declared once, next to the field they describe, rather than as scattered `if` statements at the top of every method.

```java
public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotEmpty List<@Valid OrderLine> lines
) { }
```

---

### 4.8 Global Exception Handling

Error handling repeated in every controller drifts: one endpoint returns 404, another 200 with a message, a third leaks a stack trace.

So `@ControllerAdvice` with `@ExceptionHandler` methods turns exceptions into HTTP responses in one place, and every endpoint reports failures the same way. One handler makes the contract uniform.

---

### 4.9 Domain Modelling

An application whose domain classes are only field holders pushes all meaning into services, which then grow until nobody can say where a rule lives — and the same rule ends up checked in several places, and forgotten in one.

The domain model is the set of classes that represent the business: `Order`, `Customer`, `Money`, `OrderStatus`. Good models put rules inside the objects that own the data rather than in procedural service code.

Then a rule such as "a shipped order cannot be cancelled" exists exactly once — inside `Order` — and no caller can get around it.

---

### 4.10 Hexagonal Architecture

In the layered architecture, business logic sits above the database layer and depends on it. When the business rules are the valuable, long-lived part and the technology around them keeps changing, that dependency points the wrong way.

Hexagonal architecture — also called ports and adapters — inverts the layered dependency. The domain defines interfaces (**ports**) for what it needs; infrastructure provides implementations (**adapters**) for HTTP, databases and messaging.

It exists for systems where the domain is the valuable part and the technology around it changes. The trade-off is more indirection, which is why straightforward CRUD services usually stay with plain layering.

> 💡 **Tip:** Layering is the default and is right for most services. Reach for hexagonal structure when the business rules are complex enough to deserve protection from the frameworks around them.

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

An application needs to store facts — customers, orders, payments — and ask questions about them it has not thought of yet. If data is stored in the shape one program happens to use, every new question means new code that walks that shape by hand.

A relational database stores data in **tables** of rows and columns. Each table has a **primary key** that identifies a row uniquely, and rows in one table refer to rows in another through a **foreign key**.

The model exists because it separates how data is stored from how it is queried. You describe what you want in SQL, and the database decides how to retrieve it.

```sql
CREATE TABLE orders (
    id          BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    status      VARCHAR(20) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 5.2 SELECT and Filtering

A table may hold millions of rows, and a screen needs twenty of them. Shipping all of them to the application to throw most away wastes the network, the memory and the time.

`SELECT` reads rows. `WHERE` filters them, `ORDER BY` sorts the result, and `LIMIT`/`OFFSET` returns a slice.

They exist so the database does the work of finding and shaping data, rather than the application loading everything and filtering in memory — which is slower by orders of magnitude at any real size.

```sql
SELECT id, status, created_at
FROM orders
WHERE customer_id = 42 AND status = 'OPEN'
ORDER BY created_at DESC
LIMIT 20;
```

---

### 5.3 Joins

To avoid storing the same fact twice, the relational model splits data across tables: the customer's name lives once in `customers`, not on every order. But a screen showing orders *with* customer names needs both again.

A join combines rows from two tables on a matching condition. An **inner join** keeps only rows that match on both sides; a **left join** keeps every row from the left table and fills in nulls where there is no match.

Joins exist because the relational model deliberately splits data across tables to avoid duplication, and queries need to put it back together. Splitting and joining are two halves of one idea.

---

### 5.4 Aggregation

Many questions are about totals, not rows: how many orders today, how much revenue per customer. Answering them by loading every row into the application means moving all the data just to produce a single number.

Aggregate functions — `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` — reduce many rows to one value. `GROUP BY` produces one such value per group, and `HAVING` filters the groups afterwards.

Aggregation exists so summaries are computed where the data lives. Counting rows in the database costs one query; counting them in the application costs transferring every row.

---

### 5.5 Subqueries and CTEs

Some questions need the answer to another question first — "customers who spent more than *their own average*" needs each customer's average before it can compare.

A **subquery** is a query inside another query. A **common table expression** (`WITH ... AS`) names a subquery so it can be referenced and read more easily.

They exist because real questions are often layered — "the customers whose total this month exceeds their average" — and naming the intermediate steps is what keeps such queries readable.

---

### 5.6 Indexes

Without help, finding one customer's orders means reading every row in the table and checking each one — fine at a thousand rows, an outage at a hundred million.

An index is a separate data structure that lets the database find rows without scanning the whole table — usually a B-tree, kept sorted by the indexed columns.

Indexes exist because a table scan costs time proportional to the table size, while an index lookup costs time proportional to the depth of the tree. The price is slower writes and extra storage, since every index must be maintained.

```sql
CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);
```

---

### 5.7 Query Plans

SQL says *what* you want, not *how* to get it — so when a query is slow, the SQL text alone cannot tell you why.

A query plan is the strategy the database chose to answer a query: which indexes it used, how it joined the tables, and how many rows it expected at each step. `EXPLAIN` shows it.

Plans exist to be read. SQL says what you want, not how to get it, so the plan is the only way to see what the database actually decided to do.

---

### 5.8 Schema Design

If the same fact is stored in two places, sooner or later one copy is updated and the other is not, and the data contradicts itself.

Schema design is deciding what the tables are, what each column means and how tables relate. **Normalisation** is the discipline of storing each fact once, so it cannot become inconsistent.

It exists because the schema outlives the application built on it. Data is migrated and reused; code is rewritten.

---

### 5.9 Constraints

Rules checked only in application code — "every order has a customer", "quantity is positive" — hold only for writes that go through that code.

Constraints are rules the database enforces: `NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `FOREIGN KEY` and `CHECK`. A write that violates one is rejected.

They exist because application code is not the only thing that writes to a database — migrations, scripts, other services and manual fixes all do. A constraint holds regardless of who is writing.

---

### 5.10 Schema Migrations

The code changes every week, and the schema must change with it — identically in development, testing and production, and without anyone remembering which `ALTER` they already ran where.

A migration is a versioned, ordered change to the schema, applied by a tool such as Flyway or Liquibase, which records what has already run.

Migrations exist because a schema evolves alongside the code that uses it, across many environments. Applying changes by hand is how two environments silently diverge.

> ⚠️ **Common misconception:** Letting Hibernate generate the schema (`ddl-auto=update`) is not a migration strategy. It cannot express data changes, it is not reviewable, and it will not produce the same result everywhere.

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

Java code works with objects; the database stores rows. Without help, every read means copying columns into fields by hand, and every write means building an `INSERT` or `UPDATE` from fields — the same tedious JDBC code for every class.

**JPA** — the Jakarta Persistence API — is a specification describing how Java objects map to database tables. **Hibernate** is the implementation Spring Boot uses by default.

They exist to remove the repetitive work of turning rows into objects and objects back into rows, and to let you express queries in terms of your classes rather than your tables.

The abstraction is not free: it hides the SQL, so understanding what Hibernate issues on your behalf is the difference between a fast application and a slow one.

---

### 6.2 Entities and Mapping

To copy between objects and rows automatically, the framework must know which class belongs to which table and which field to which column.

An **entity** is a class marked `@Entity` whose instances correspond to rows in a table. Fields map to columns, either by convention or through `@Column`, and `@Table` names the table when the default is not what you want.

Mapping exists so the database schema and the object model can differ where they need to — different naming conventions, types, or structures — without either dictating the other.

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String status;
}
```

---

### 6.3 Identifiers and Generation

Hibernate must be able to tell rows apart — to know that the object in memory and the row in the table are the same thing, and to avoid loading one row twice.

Every entity needs an `@Id`. `@GeneratedValue` tells JPA how the value is produced: `IDENTITY` uses an auto-increment column, `SEQUENCE` uses a database sequence, and `UUID` generates one in the application.

Identifiers exist because the persistence context tracks entities by identity. The generation strategy matters because it determines when the id is known — and therefore whether inserts can be batched.

---

### 6.4 Relationships and Ownership

In the database a relationship is one foreign-key column. In Java it can be *two* references — `order.getLines()` and `line.getOrder()` — and they can disagree.

Relationships are mapped with `@OneToMany`, `@ManyToOne`, `@OneToOne` and `@ManyToMany`. One side **owns** the relationship — it holds the foreign key and controls what is written — and the other side is the inverse, marked with `mappedBy`.

Ownership exists because the database has one foreign key column, while the object model has two references. Something must decide which side the database follows.

---

### 6.5 The Persistence Context

If every `findById` went to the database and returned a new object, one transaction could hold two different objects for the same row, changed in two different ways — which one should be saved?

The persistence context is Hibernate's working memory for one transaction. Every entity it loads or saves is kept there, and asking for the same row twice returns the same object.

It exists so that within one unit of work there is exactly one in-memory representation of each row, and so changes can be collected and written efficiently at the end.

---

### 6.6 Entity Lifecycle States

The same `Order` object can be watched by Hibernate in one moment and ignored in the next — so "what happens when I change it?" has no single answer.

An entity is in one of four states: **transient** (new, unknown to Hibernate), **managed** (tracked by a persistence context), **detached** (was managed, but the context has closed) and **removed** (scheduled for deletion).

The states exist because what happens when you change an object depends entirely on whether anyone is watching. A change to a managed entity is saved automatically; the same change to a detached one is not.

---

### 6.7 Dirty Checking and Flushing

Writing an `UPDATE` for every field you change is tedious and error-prone. If Hibernate remembers what an entity looked like when it was loaded, it can work out the updates by itself.

**Dirty checking** is Hibernate comparing a managed entity against the snapshot it took when loading it, and issuing an `UPDATE` for whatever changed. **Flushing** is the moment it sends those statements to the database.

They exist so you modify objects rather than writing update statements. The surprise is that you never call `save()` for an entity that is already managed — the change is detected and written anyway.

---

### 6.8 Lazy and Eager Loading

Objects are connected — an order to its customer, the customer to their addresses, each address to a country. Loading one order and following every reference would drag half the database into memory.

A **lazy** association is not loaded until you touch it; an **eager** one is loaded immediately with its owner. `@ManyToOne` and `@OneToOne` are eager by default; `@OneToMany` and `@ManyToMany` are lazy.

The distinction exists because loading an entire object graph is rarely what you want. Lazy loading defers the cost — and creates the two classic problems: extra queries, and failures when the context has already closed.

---

### 6.9 The N+1 Problem

Lazy loading makes a field access quietly run a query — see [[#6.8 Lazy and Eager Loading]]. Put that field access inside a loop, and the quiet query runs once per item.

The N+1 problem is loading a list of N entities with one query, then issuing one more query per entity to fetch an association — N+1 queries where one or two would do.

It exists as the single most common JPA performance bug because the code looks innocent: a loop over orders reading `order.getLines()` produces no visible SQL at all.

> ⚠️ **Common misconception:** N+1 is not caused by lazy loading alone. It is caused by lazy loading inside a loop — the fix is fetching the association in the original query, not switching to eager.

---

### 6.10 JPQL and Queries

Once data is modelled as entities, writing queries in table and column names means thinking in two vocabularies at once — and repeating the mapping in every query.

**JPQL** is a query language over your entities rather than your tables: `select o from Order o where o.status = :status`. Spring Data also derives queries from method names, and `nativeQuery = true` drops to raw SQL when needed.

They exist so queries can be written in the domain's vocabulary, stay portable across databases, and still allow native SQL where the database offers something JPQL cannot express.

---

### 6.11 Hibernate Caching

Some rows are read again and again — the same customer in one transaction, the same list of countries in every request. Reading them from the database each time repeats work whose answer has not changed.

Hibernate has two caches. The **first-level cache** is the persistence context itself — always on, scoped to one transaction. The **second-level cache** is optional, shared across transactions, and must be configured deliberately.

They exist to avoid re-reading the same row. The first level is what makes repeated lookups within a transaction free; the second is a genuine cache with all the invalidation problems that implies.

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

Most business operations touch several rows. Debiting one account and crediting another must happen together; a failure between them would create or destroy money — and a crash can strike between *any* two statements.

So databases offer the **transaction**: a group of operations that either all take effect or none do. Databases guarantee four properties, abbreviated **ACID**: atomicity, consistency, isolation and durability.

```text
A — atomicity:   all or nothing
C — consistency: constraints hold before and after
I — isolation:   concurrent transactions do not see each other's partial work
D — durability:  once committed, it survives a crash
```

---

### 7.2 The Transactional Annotation

Without help, every transactional method would open a connection, begin, commit, roll back on failure and close in a `finally` block — the same lines around every business operation, each a chance to get it wrong.

`@Transactional` on a Spring service method starts a transaction before the method runs and commits it afterwards — or rolls it back if the method throws.

It exists so transaction management is declarative. It is applied by the proxy from [[#1.10 Proxies and AOP]] — which is why it works only on calls that arrive through that proxy.

```java
@Transactional
public void transfer(Long from, Long to, Money amount) {
    accounts.debit(from, amount);
    accounts.credit(to, amount);      // both, or neither
}
```

---

### 7.3 Propagation

Transactional methods call each other: `placeOrder` calls `reserveStock`, which is also `@Transactional`. Should the inner call join the outer transaction and share its fate, or commit on its own? Neither answer is always right.

Propagation decides what happens when a transactional method is called from inside another transaction: join the existing one (`REQUIRED`, the default), suspend it and start a new one (`REQUIRES_NEW`), or refuse to run in one at all.

It exists because methods are composed. Calling one transactional service from another must have defined behaviour, and "always join" is not always what the operation needs.

---

### 7.4 Isolation Levels

Two transactions running at the same time on the same rows can see each other's half-finished work. Separating them completely — as if they ran one after another — is possible, but costs concurrency: transactions must wait or be aborted.

Isolation decides how much concurrent transactions can see of each other's uncommitted or changing data. The standard levels — read uncommitted, read committed, repeatable read, serializable — trade consistency against concurrency.

They exist because perfect isolation is expensive. Most applications accept weaker guarantees in exchange for throughput, and choose a stronger level only where correctness demands it.

---

### 7.5 Rollback Rules

By default Spring rolls back on unchecked exceptions (`RuntimeException` and `Error`) and **commits** on checked exceptions. `@Transactional(rollbackFor = ...)` changes that.

The rule comes from an older view of exceptions, inherited from EJB: a checked exception was an *expected business outcome* — "insufficient funds" — that the caller is meant to handle, so the work done so far was not necessarily wrong; an unchecked exception meant something unexpectedly broke, so everything is undone. Knowing that makes the rule predictable — but it still surprises almost everyone the first time a checked exception leaves a transaction committed halfway through.

---

### 7.6 Transaction Boundaries

A transaction holds a database connection and its locks from the moment it begins until it commits. So *where* it begins and ends decides two things at once: what is atomic, and how long everyone else waits.

The boundary is where the transaction starts and ends — in practice, the service method annotated `@Transactional`. Everything inside it commits together.

Boundaries matter because they determine what is atomic, how long locks are held, and how long a database connection is occupied. Too wide, and the application holds connections while waiting on slow work.

---

### 7.7 Optimistic Locking

Two users open the same order, both edit it, both save. Without protection the second save silently overwrites the first — a *lost update* — and nobody notices.

Optimistic locking assumes conflicts are rare. Each row carries a version number; an update checks that the version has not changed, and fails if another transaction got there first.

It exists because locking rows for the duration of a user's thinking time does not scale. Instead of preventing the conflict, it detects it and lets the application decide what to do.

```java
@Version
private long version;
```

---

### 7.8 Pessimistic Locking

When many transactions fight over the same row — the last units of a popular product — detecting conflicts after the fact means most of them fail and retry, over and over.

Pessimistic locking takes a database lock when the row is read, so no one else can modify it until the transaction ends. `SELECT ... FOR UPDATE` is the usual mechanism.

It exists for the cases where a conflict is likely and retrying is expensive — decrementing stock for a popular item, allocating a limited resource — where it is cheaper to queue than to collide.

---

### 7.9 Connection Pooling

Opening a database connection is expensive — authentication, TLS, session setup — and doing it per query would dominate the cost of the query itself. And the database can serve only a limited number of connections at once.

A connection pool keeps a set of open database connections and lends them to threads that need one. Spring Boot uses HikariCP by default.

So the expensive setup is paid once, and the pool's size caps how much load the application can put on the database.

---

### 7.10 Distributed Transactions

A local transaction makes changes atomic inside *one* database. But placing an order may mean writing to the database *and* publishing an event to Kafka — and no single local transaction covers both.

A distributed transaction spans more than one system — two databases, or a database and a message broker. Classic two-phase commit coordinates them, at considerable cost and with real failure modes.

Modern systems usually avoid it. The **outbox pattern** writes the message into the same database transaction as the data and publishes it afterwards; a **saga** breaks a long operation into local transactions with compensating actions.

> ⚠️ **Common misconception:** Writing to a database and publishing to Kafka in the same method is not atomic. If the publish fails after the commit, the two systems disagree — which is exactly what the outbox pattern exists to prevent.

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

An API has to answer two separate questions about every request: who is calling, and is that caller allowed to do this? Mixing them up produces the wrong error — and the wrong fix.

**Authentication** answers "who are you?" — verifying credentials such as a password or a token. **Authorisation** answers "what are you allowed to do?" — deciding whether that identity may perform a given action.

They are separate steps because they fail differently. An unknown user gets 401 Unauthorized; a known user without permission gets 403 Forbidden.

> ⚠️ **Common misconception:** HTTP's "401 Unauthorized" actually means *unauthenticated*. 403 is the authorisation failure — the naming is a historical accident.

---

### 8.2 The Security Filter Chain

If every controller had to remember to check credentials and permissions, one forgotten check would be an open door — and it would look exactly like a correct endpoint.

Spring Security works as a chain of servlet filters in front of your application. Each filter handles one concern — reading credentials, authenticating, checking access, handling failures — before the request ever reaches a controller.

It exists so security is enforced uniformly at the edge, rather than depending on every controller remembering to check.

---

### 8.3 Configuring HttpSecurity

Security rules scattered across controllers cannot be reviewed as a whole: nobody can answer "which endpoints are public?" without reading every class.

In Spring Security 6 you configure security by declaring a `SecurityFilterChain` bean and describing, through `HttpSecurity`, which requests need which permissions and how users authenticate.

It exists so the security rules of the whole application are visible in one place, as code.

```java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated())
        .build();
}
```

---

### 8.4 Password Hashing

Databases leak — through backups, bugs and breaches. If passwords are stored as written, one leak exposes every user's password, including on every other site where they reused it.

So passwords are never stored. Instead the application stores a **hash** — the output of a deliberately slow, salted one-way function such as BCrypt or Argon2 — and checks a login attempt by hashing it and comparing.

Hashing exists so a database leak does not leak passwords. Slowness is the point: it makes guessing billions of passwords against a stolen hash impractical.

---

### 8.5 Users and Authentication Providers

Users might live in a database, an LDAP directory or an external system, and credentials might be passwords, tokens or certificates. Hard-wiring one combination into the login code would make every change a rewrite.

A `UserDetailsService` loads a user by username — from a database, a directory, anywhere. An `AuthenticationProvider` uses it to verify credentials, and the `AuthenticationManager` coordinates the providers.

They exist so where users live and how credentials are checked are both replaceable without touching the rest of the security configuration.

---

### 8.6 Stateless Authentication

A classic login stores a session in one server's memory. Sessions stored in one server's memory do not survive across many instances: behind a load balancer, the next request may land on a server that has never heard of it.

So stateless authentication means the server keeps no session. Every request carries proof of identity — usually a token in the `Authorization` header — and the server verifies it each time.

A token that the request carries can be verified by any instance, so no instance has to remember anything between requests.

---

### 8.7 JSON Web Tokens

A token carried by the client must prove two things to whichever server receives it: who the user is, and that the token really came from a trusted issuer and was not edited along the way.

A **JWT** is a compact, signed token containing claims — who the user is, what they may do, when the token expires. The signature lets any server verify the token was issued by a trusted party and not altered.

JWTs exist to carry identity between systems without a shared session store. They are signed, not encrypted: anyone holding one can read its contents.

```text
header.payload.signature
eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGVzIjpbIlVTRVIiXX0.<signature>
```

---

### 8.8 Role-Based Access Control

Granting permissions to each user individually stops working after a few dozen people: nobody can say who can do what, and every new hire means editing permissions one by one.

Role-based access control (RBAC) grants permissions to roles — `USER`, `ADMIN`, `SUPPORT` — and assigns roles to users. A rule then says "this endpoint requires `ADMIN`" rather than listing users.

It exists because managing permissions per user does not scale. Roles group them into something an organisation can reason about and audit.

---

### 8.9 Method Security

A URL rule protects one entry point. But the same business operation may be reachable from several — another endpoint, a scheduled job, a message consumer — and a rule on the URL guards only the door it is written on.

Method security puts access rules directly on service methods with annotations such as `@PreAuthorize("hasRole('ADMIN')")`, enabled by `@EnableMethodSecurity`.

It exists because URL rules alone protect endpoints, not operations: a service method called from several places carries its own rule wherever it is invoked.

---

### 8.10 OAuth2 and Resource Servers

If every application implements its own login, every application stores passwords, handles resets, adds MFA and issues tokens — each getting it slightly wrong in its own way.

**OAuth2** is a standard for delegating authorisation: an **authorisation server** (Keycloak, Okta, Auth0, Google) issues tokens, and your API — a **resource server** — validates them. Spring Security supports both roles.

It exists so applications do not each implement login, password storage and token issuance. One trusted service does it, and every API trusts its tokens.

---

### 8.11 CORS and CSRF

Browsers protect users with the *same-origin* rule: JavaScript on one website may not read responses from another. **CORS** — cross-origin resource sharing — is how your API tells the browser which other websites it trusts, relaxing that rule selectively. **CSRF** — cross-site request forgery — is an attack where a malicious site makes a logged-in user's browser send a request on their behalf.

Both exist because browsers attach cookies automatically, whichever site triggered the request. The same-origin rule — opened selectively by CORS — limits who can *read* responses; CSRF protection stops other sites from *triggering* state changes with the user's cookies.

> 💡 **Tip:** CSRF protection matters when authentication uses cookies. A stateless API authenticated by an `Authorization` header is not vulnerable in the same way, which is why such APIs commonly disable it.

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

No single kind of test is both fast and fully convincing. A test of one class runs in milliseconds but proves little about the whole; a test that drives the deployed system proves a lot but is slow and vague about what broke.

The testing pyramid is a guide to proportions: many fast **unit tests** at the base, fewer **integration tests** in the middle, and a small number of slow **end-to-end tests** at the top.

It exists because each level trades speed for confidence differently. Unit tests run in milliseconds and pinpoint failures; end-to-end tests prove the whole system works but are slow and vague about what broke.

---

### 9.2 Unit Tests with JUnit 5

A business rule has many cases — valid, invalid, boundary — and checking each one by starting the whole application would take minutes.

A unit test exercises one class in isolation, with its collaborators replaced by simple fakes or mocks. JUnit 5 — JUnit Jupiter — is the standard framework, with `@Test`, assertions, and lifecycle hooks such as `@BeforeEach`.

Unit tests exist because they are fast, precise and cheap to write, so they can cover the many combinations a business rule has without starting any infrastructure.

```java
class MoneyTest {
    @Test
    void addsAmountsInTheSameCurrency() {
        var total = Money.eur("10.00").plus(Money.eur("2.50"));
        assertThat(total).isEqualTo(Money.eur("12.50"));
    }
}
```

---

### 9.3 Mocking with Mockito

The class you want to test usually calls others — a repository, a payment client. Using the real ones drags in a database and a network and makes the test slow and unpredictable.

**Mockito** creates stand-in objects for collaborators. You can tell a mock what to return (`when(...).thenReturn(...)`) and check how it was used (`verify(...)`).

Mocking exists so a class can be tested without its real dependencies — no database, no network — while still controlling and observing how it interacts with them.

---

### 9.4 Test Slices

Starting the entire application for every test is slow — but a plain unit test cannot check Spring's own behaviour, such as request mapping, JSON conversion or JPA queries.

A test slice starts only part of the Spring application: `@WebMvcTest` loads the web layer, `@DataJpaTest` loads JPA, `@JsonTest` loads JSON serialisation. Everything else is left out.

Slices exist because starting the whole application for every test is slow. Loading only the layer under test keeps tests focused and fast.

---

### 9.5 Testing Controllers with MockMvc

A controller's bugs live mostly in the web plumbing — the wrong path, a missing validation, a bad status code, a renamed JSON field — and none of that runs when you call the controller method directly.

**MockMvc** sends simulated HTTP requests to your controllers without starting a real server, and lets you assert on the status, headers and body of the response.

It exists so the web layer — routing, binding, validation, serialisation, error handling — can be tested quickly and precisely, separately from the business logic behind it.

```java
mockMvc.perform(get("/api/orders/42"))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.id").value(42));
```

---

### 9.6 Testing Repositories

Whether a query is correct depends on the database that runs it. A test with a mocked repository never executes the SQL at all.

`@DataJpaTest` starts only the JPA layer — entities, repositories, a data source — and rolls back each test's changes afterwards.

It exists to test the parts of persistence that unit tests cannot: that queries return what you expect, mappings work, and constraints behave as designed against a real database engine.

---

### 9.7 Full Integration Tests

Every piece can pass its own tests while the assembled application still fails — a missing bean, a security rule that blocks the endpoint, a transaction that never commits.

`@SpringBootTest` starts the entire application context, optionally with a real HTTP server, so a test can exercise a request from the controller all the way to the database.

It exists to prove the pieces work together — configuration, wiring, transactions, security — which no slice or unit test can show on its own.

---

### 9.8 Testcontainers

Tests need a database, a broker or a cache. Shared test servers drift and collide between developers; in-memory substitutes behave differently from the real engine.

**Testcontainers** starts real dependencies — PostgreSQL, Kafka, Redis — in Docker containers for the duration of a test run, then removes them.

It exists because in-memory substitutes behave differently from the real thing. Testing against the same database engine you run in production removes a whole class of "passes in tests, fails in production" bugs.

> 💡 **Tip:** Spring Boot's `@ServiceConnection` wires a Testcontainers container into the application automatically — no manual URL or credential properties needed.

---

### 9.9 Testing Security

A missing access rule looks exactly like a correct one: the endpoint works perfectly — for everyone. Only a test that tries to get in *without* permission notices.

Spring Security's test support lets you run a test as a particular user — `@WithMockUser`, or a simulated JWT — and assert that protected endpoints return 401, 403 or success as intended.

It exists because security rules are code, and untested access rules are where breaches come from. A missing rule is invisible until someone finds the open endpoint.

---

### 9.10 Testing External Calls

The interesting cases with another service are its failures — errors, timeouts, nonsense responses — and the real service rarely produces them on demand.

Code that calls other HTTP services is tested against a fake server — **WireMock** or Spring's `MockRestServiceServer` — that returns prepared responses, including errors and slow replies.

It exists so you can test how your code handles a dependency's failures, timeouts and odd responses — the cases a real dependency rarely produces on demand.

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

Many reads ask the same question again and again — the same product page, the same exchange rate — and each time the database or remote service redoes the same work to produce the same answer.

A cache keeps a copy of data somewhere faster to reach than its source — memory instead of a database, a nearby server instead of a distant API — so repeated reads cost less.

Answering from a cache cuts latency and takes load off the source, at the cost of sometimes serving data that is no longer current.

---

### 10.2 The Spring Cache Abstraction

Caching by hand is the same few lines everywhere: build a key, look it up, on a miss call the real code and store the result — mixed into business methods and tied to one cache product.

Spring's cache abstraction adds caching to methods with annotations. `@Cacheable` returns a stored result if one exists; `@CacheEvict` removes entries; `@CachePut` updates them. `@EnableCaching` turns it on.

It exists so caching is a declaration on a method rather than lookup-and-store code written by hand, and so the cache store — in-memory, Redis, Caffeine — can be swapped without changing the code.

```java
@Cacheable("products")
public Product find(Long id) { return repository.findById(id).orElseThrow(); }
```

---

### 10.3 Redis

An in-process cache lives inside one instance: ten instances hold ten separate copies, each warmed separately, each lost on restart.

**Redis** is an in-memory data store used as a cache, a session store, a rate limiter and a lightweight message broker. It keeps data in memory with rich structures — strings, hashes, lists, sets, sorted sets — and very low latency.

Redis is shared by every instance of a service and survives individual application restarts.

---

### 10.4 Caching Patterns

Once a cache sits beside the database, every read and write raises a question: who fills the cache, and who keeps it in step with the source?

The common patterns differ in who loads and writes the cache. **Cache-aside**: the application checks the cache, loads from the database on a miss, and stores the result. **Write-through**: writes go to the cache and the database together. **Write-behind**: writes go to the cache and are flushed to the database later.

The patterns exist because there is no single right trade-off between freshness, write cost and complexity. Cache-aside is the default for most applications.

---

### 10.5 Expiry and Invalidation

Data changes, but the cache keeps answering with what it stored — and usually it cannot see the change happen. Something has to decide when a stored answer stops being trustworthy.

**Expiry** — a time-to-live, or TTL — removes an entry automatically after a set time. **Invalidation** removes it deliberately when the underlying data changes.

They exist because a cache that never forgets serves stale data forever. Deciding when cached data stops being trustworthy is famously one of the hardest problems in computing.

> ⚠️ **Common misconception:** A cache is not a database. It can lose data at any time — eviction, restart, failover — so nothing should exist only in the cache.

---

### 10.6 Event-Driven Architecture

When placing an order must also bill the customer, reserve stock and send an email, the order service could call each of those services directly — and then it must know all of them, wait for all of them, and fail whenever any of them is down.

In an event-driven system, services announce that something happened — `OrderPlaced`, `PaymentFailed` — and other services react, rather than calling each other directly.

It exists to decouple services in time and knowledge. The producer does not need to know who listens, and a consumer that is down catches up when it returns.

---

### 10.7 Kafka Fundamentals

Events need somewhere to go that is durable, fast, and readable by many independent consumers — each at its own pace, including ones added next year that want to read the history.

**Apache Kafka** is a distributed, durable log. Messages are appended to **topics**, which are split into **partitions** for parallelism. Each message in a partition has a sequential **offset**, and messages are retained for a configured period whether or not they have been read.

Kafka exists for high-throughput, replayable event streams. Unlike a traditional queue, reading a message does not remove it — many independent consumers can read the same stream, each at its own pace.

---

### 10.8 Producing Messages

Once published, a message may be read by consumers you do not know, for days — so how it is published matters long after the producer has moved on.

A **producer** publishes messages to a topic. In Spring, `KafkaTemplate.send(topic, key, value)` does it. The **key** decides the partition, so all messages with the same key — the same order id, say — land in the same partition and stay in order.

Producing exists as a deliberate step because the choice of key, acknowledgement level and serialisation determines ordering, durability and compatibility for every consumer downstream.

---

### 10.9 Consumers and Consumer Groups

One consumer reading a busy topic eventually falls behind, and if it crashes, processing stops. Running several copies is the obvious fix — but then they must not all process the same message.

A **consumer** reads messages from topics; in Spring, a method annotated `@KafkaListener`. Consumers sharing a **group id** form a **consumer group**, and Kafka divides the topic's partitions among them so each message is processed by one member of the group.

Groups exist to scale processing: add consumers to a group, up to the number of partitions, and work is shared. Different groups each receive every message independently.

```java
@KafkaListener(topics = "orders", groupId = "billing")
void onOrder(OrderPlaced event) { billing.invoice(event); }
```

---

### 10.10 Delivery Semantics and Idempotency

A consumer processes a message, then records that it is done. A crash between those two steps forces a choice: treat the message as done and risk losing it, or process it again and risk doing it twice.

Delivery guarantees describe how often a message is processed: **at most once** (may be lost), **at least once** (may be duplicated), or **exactly once** (neither — expensive and limited in scope). At-least-once is the practical default.

Because duplicates happen, consumers must be **idempotent**: processing the same message twice must have the same effect as processing it once.

---

### 10.11 Retries and Dead-Letter Topics

Kafka delivers a partition's messages strictly in order. So if one message keeps failing, every message behind it waits — possibly forever.

When a message fails to process, the consumer can retry it. If it keeps failing, it is moved to a **dead-letter topic** for inspection instead of blocking the partition forever.

This exists because one bad message — a malformed payload, a bug for one specific case — must not stop every message behind it in the same partition.

> 💡 **Tip:** Distinguish transient failures (a database timeout — retry) from permanent ones (an invalid payload — send straight to the dead-letter topic). Retrying a permanent failure only delays the inevitable.

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

A container image packages the application together with the runtime it needs — the JVM, the jar, configuration defaults — into one artifact that runs the same way everywhere.

Containers exist because "it works on my machine" usually meant the machines differed. An image fixes the operating system, the JVM version and the file layout, so development, testing and production run identical bits.

---

### 11.2 Docker Compose for Local Environments

**Docker Compose** describes several containers — the database, a cache, a broker — in one `compose.yaml` file and starts them together. Spring Boot can start that file automatically when the application runs locally.

It exists so a developer can run the whole environment with one command, instead of installing PostgreSQL, Redis and Kafka by hand and hoping the versions match production.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]
```

---

### 11.3 API Documentation with OpenAPI

**OpenAPI** is a standard, machine-readable description of an HTTP API: its paths, parameters, request and response bodies, and status codes. **Swagger UI** renders it as an interactive page. In Spring Boot, `springdoc-openapi` generates the description from your controllers.

It exists so an API's contract is documented accurately and automatically — generated from the code, so it cannot drift — and so clients can be generated from it.

---

### 11.4 API Versioning

API versioning is how a service changes its contract without breaking existing clients. The common approaches put the version in the URL (`/api/v2/orders`), a header, or the media type.

It exists because clients cannot all upgrade at once. Old and new versions must coexist for a while, and removing the old one must be a deliberate, announced step.

---

### 11.5 Pagination, Sorting and Filtering

Pagination returns a large collection in pages; sorting orders it; filtering narrows it. Spring Data binds `page`, `size` and `sort` query parameters to a `Pageable` automatically.

They exist because returning every row of a growing table is a time bomb: fine with a hundred rows, an outage with a million.

```java
@GetMapping("/api/orders")
PagedModel<OrderSummary> list(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
    return new PagedModel<>(service.list(pageable));   // service returns a Page<OrderSummary>
}
```

---

### 11.6 Logging

Spring Boot logs through **SLF4J**, a logging facade, with **Logback** as the default implementation. Code writes to a logger; configuration decides levels, formats and destinations.

Logging exists to record what the application did and why it failed. In production, logs are usually written as structured JSON so a log platform can search and aggregate them.

```java
private static final Logger log = LoggerFactory.getLogger(OrderService.class);
log.info("order placed id={} total={}", order.getId(), order.getTotal());
```

---

### 11.7 Spring Boot Actuator

**Actuator** adds production endpoints to an application: health, metrics, configuration, environment, loggers, thread dumps and more, under `/actuator`.

It exists so every Spring Boot service exposes the same operational information in the same way, without each team building its own diagnostics.

> ⚠️ **Common misconception:** Actuator endpoints are not harmless. Some reveal configuration, environment variables or memory contents, so only a few should be exposed and the rest secured.

---

### 11.8 Health Checks and Probes

A health check reports whether the application is working. Container platforms such as Kubernetes use two separate probes: **liveness** — is the process stuck and in need of a restart? — and **readiness** — should it receive traffic right now?

They exist so the platform can route traffic only to instances that can serve it, and restart instances that will never recover on their own.

---

### 11.9 Metrics with Micrometer

**Micrometer** is the metrics library behind Spring Boot. It records counters, timers and gauges — requests served, latency, pool usage — and exports them to monitoring systems such as Prometheus.

Metrics exist because logs tell you about individual events, while metrics show trends: is latency rising, is the error rate climbing, is the connection pool nearly full?

---

### 11.10 Distributed Tracing

Distributed tracing follows one request across every service it touches. Each hop records a **span**; spans sharing a **trace id** form a timeline of the whole request.

It exists because in a system of many services, a slow or failing request cannot be diagnosed from one service's logs. A trace shows where the time went and which hop failed.

---

### 11.11 Configuration and Secrets

Configuration that varies by environment — URLs, feature flags, pool sizes — is supplied from outside the image. **Secrets** — passwords, API keys, signing keys — need stricter handling: they come from a secrets manager or the platform, never from the code repository.

This exists because one image must run in every environment, and because a secret committed to a repository or baked into an image is, for practical purposes, public.

> 💡 **Tip:** Rotate secrets as if they will leak, because eventually one will. Rotation that is routine and automated turns a leak into a non-event.

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

This group follows one realistic service — an **order service** for an online shop — and shows how the earlier groups fit together. It exposes a REST API, stores orders in PostgreSQL, caches the product catalogue in Redis, publishes `OrderPlaced` events to Kafka, calls a payment service over HTTP, and is secured with JWTs.

A reference architecture exists because the hard part of backend work is rarely one technique in isolation. It is making dozens of them work together reliably, under load, while the system keeps changing.

---

### 12.2 Designing the Domain and API

Before writing code, a service needs a model of its domain — orders, order lines, statuses and the rules between them — and an API that exposes that model to clients in a stable, deliberate shape.

This step exists because the domain model and the API contract are the two things most expensive to change later. The database schema, the endpoints and the events all follow from them.

```text
POST   /api/orders              place an order
GET    /api/orders/{id}         fetch one order
GET    /api/orders?status=...   list orders, paginated
POST   /api/orders/{id}/cancel  cancel an order
```

---

### 12.3 Timeouts, Retries and Circuit Breakers

When a service calls another, the call can be slow or fail. A **timeout** limits how long to wait. A **retry** tries again after a transient failure. A **circuit breaker** stops calling a dependency that keeps failing, so it can recover and so callers fail fast instead of piling up.

These patterns exist because in a distributed system, failure of a dependency is normal, not exceptional. Without them, one slow service drags down every service that calls it.

> ⚠️ **Common misconception:** Retries are not free reliability. Retrying an operation that is not idempotent can perform it twice, and retrying against an overloaded service makes the overload worse.

---

### 12.4 Rate Limiting and Backpressure

**Rate limiting** caps how many requests a client may make in a period, rejecting the excess with `429 Too Many Requests`. **Backpressure** is the general idea that a system under more load than it can handle should slow down or refuse work, rather than accept it and collapse.

They exist because capacity is finite. A service that accepts unlimited work will eventually exhaust threads, connections or memory and fail for everyone.

---

### 12.5 Idempotent APIs

An operation is **idempotent** if performing it several times has the same effect as performing it once. `GET`, `PUT` and `DELETE` are idempotent by definition; `POST` is not. An **idempotency key** — a unique value the client sends with a request — lets the server recognise a retry and return the original result instead of acting again.

Idempotent APIs exist because networks fail after the server has acted but before the client hears back. The client must retry, and the server must not charge the customer twice.

---

### 12.6 Performance and Load Testing

A **load test** sends realistic traffic at a service to measure throughput, latency and errors. Variants push past expected load (**stress**), hold it for hours (**soak**), or jump suddenly (**spike**).

Load testing exists because performance problems — pool exhaustion, slow queries, memory leaks — only appear under concurrency and volume, and production is an expensive place to find them.

---

### 12.7 Zero-Downtime Deployment

A zero-downtime deployment replaces the running version with a new one without users noticing — no failed requests, no maintenance window. Common strategies are **rolling** updates, **blue-green** switches and **canary** releases.

It exists because modern services deploy often, sometimes many times a day, and each deployment cannot be allowed to cause errors.

---

### 12.8 Feature Flags and Safe Releases

A **feature flag** is a switch, evaluated at runtime, that turns a code path on or off without a deployment. It separates **deploying** code from **releasing** a feature to users.

Feature flags exist so risky changes can be released gradually — to staff, then 1% of users, then everyone — and switched off instantly if something goes wrong.

```java
if (flags.isEnabled("new-pricing", customer)) {
    return newPricing.quote(order);
}
return legacyPricing.quote(order);
```

---

### 12.9 Operating the Service

Operating a service means keeping it healthy in production: defining what "healthy" means with **service level objectives** (SLOs), alerting when they are threatened, responding to incidents, and learning from them afterwards.

It exists because writing the service is the start of its life, not the end. Most of its cost and most of its users' experience come from how it is run.

---

### 12.10 Upgrading Spring Boot

Spring Boot ships a new minor version roughly every six months and a new major version every few years. Each minor version is supported for a limited period, after which it stops receiving free security fixes.

Upgrading exists as a discipline because staying on an unsupported version means unpatched vulnerabilities, and skipping several versions at once turns a routine task into a risky project. Spring Boot 4.0, built on Spring Framework 7, followed the 3.x line in November 2025.

> 💡 **Tip:** Upgrade one minor version at a time, and keep the build free of deprecation warnings. Deprecated APIs are what the next major version removes.

---

### 12.11 Explaining the System in an Interview

Backend interviews often end with "walk me through a system you built". A good answer describes the problem, the architecture, the key flows, how it handles failure, how it is observed, and what you would change.

This skill exists because interviewers use the question to test everything at once: whether you understand your own decisions, their trade-offs, and how the pieces from every earlier group fit together.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Where to Go Next

You now have a complete mental map of Spring Boot backend development. You should be able to say: *"I know what every piece of the framework is."*

Continue to **`1_understand.md`**, which expands every topic in this same order with mechanisms, diagrams, trade-offs and the misconceptions that cause real bugs — so you can say *"I understand how this works."*
