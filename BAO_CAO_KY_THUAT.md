# BÃO CÃO Ká»¸ THUáº¬T: Há»† THá»NG Ná»€N Táº¢NG THÆ¯Æ NG Máº I ÄIá»†N Tá»¬ ÃO DÃ€I
## Kiáº¿n trÃºc Microservices â€” 12 Dá»‹ch vá»¥ Äá»™c láº­p

**NgÃ y láº­p:** 07/05/2026  
**PhiÃªn báº£n:** 1.0  
**Vai trÃ² soáº¡n tháº£o:** Software Architect & Bridge System Engineer (BSE)

---

# PHáº¦N 1: CÆ  Sá»ž LÃ THUYáº¾T Vá»€ CÃ”NG NGHá»† Sá»¬ Dá»¤NG

## 1.1. Frontend Stack

### 1.1.1. React 19

React lÃ  thÆ° viá»‡n JavaScript mÃ£ nguá»“n má»Ÿ do Meta phÃ¡t triá»ƒn, chuyÃªn xÃ¢y dá»±ng giao diá»‡n ngÆ°á»i dÃ¹ng (User Interface â€” UI) theo mÃ´ hÃ¬nh **Component-Based Architecture**. PhiÃªn báº£n React 19 mang Ä‘áº¿n cÃ¡c cáº£i tiáº¿n quan trá»ng:

- **React Compiler**: Tá»± Ä‘á»™ng tá»‘i Æ°u hÃ³a re-render mÃ  khÃ´ng cáº§n `useMemo`/`useCallback` thá»§ cÃ´ng, giáº£m Ä‘Ã¡ng ká»ƒ boilerplate code.
- **Server Components**: Cho phÃ©p render component phÃ­a server, giáº£m JavaScript bundle gá»­i tá»›i client.
- **Concurrent Rendering**: CÆ¡ cháº¿ render khÃ´ng cháº·n (non-blocking) giÃºp UI luÃ´n pháº£n há»“i mÆ°á»£t mÃ  ngay cáº£ khi xá»­ lÃ½ tÃ¡c vá»¥ náº·ng.

**Vai trÃ² trong há»‡ thá»‘ng:** React 19 lÃ  ná»n táº£ng xÃ¢y dá»±ng **cáº£ hai á»©ng dá»¥ng frontend** â€” Admin Dashboard (`Front-end/`, dÃ¹ng Vite) vÃ  Client Storefront (`fe-client/`, dÃ¹ng Next.js). Kiáº¿n trÃºc component-based cho phÃ©p tÃ¡i sá»­ dá»¥ng UI component giá»¯a cÃ¡c module (Product Card, Order Table, v.v.).

### 1.1.2. Next.js 16

Next.js lÃ  React meta-framework do Vercel phÃ¡t triá»ƒn, cung cáº¥p giáº£i phÃ¡p **full-stack** cho á»©ng dá»¥ng web hiá»‡n Ä‘áº¡i. Trong há»‡ thá»‘ng, Next.js 16 Ä‘Æ°á»£c sá»­ dá»¥ng cho **Client Storefront** (`fe-client/`).

**LÃ½ do lá»±a chá»n:**
- **Server-Side Rendering (SSR)** vÃ  **Static Site Generation (SSG)**: Tá»‘i Æ°u SEO â€” yáº¿u tá»‘ sá»‘ng cÃ²n cho trang thÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­ Ã¡o dÃ i cáº§n Ä‘Æ°á»£c index tá»‘t bá»Ÿi cÃ´ng cá»¥ tÃ¬m kiáº¿m.
- **App Router**: Há»‡ thá»‘ng routing dá»±a trÃªn cáº¥u trÃºc thÆ° má»¥c `app/`, há»— trá»£ layout lá»“ng nhau (nested layouts), loading states, vÃ  error boundaries tá»± nhiÃªn.
- **API Routes / Server Actions**: Cho phÃ©p proxy request tá»›i backend microservices mÃ  khÃ´ng expose trá»±c tiáº¿p internal API endpoints ra client, tÄƒng cÆ°á»ng báº£o máº­t.
- **Image Optimization**: Tá»± Ä‘á»™ng tá»‘i Æ°u áº£nh sáº£n pháº©m Ã¡o dÃ i (resize, format conversion sang WebP), cá»±c ká»³ quan trá»ng khi sáº£n pháº©m yÃªu cáº§u nhiá»u áº£nh cháº¥t lÆ°á»£ng cao tá»‰ lá»‡ 3:4.

### 1.1.3. Vite 7

Vite lÃ  build tool tháº¿ há»‡ má»›i, sá»­ dá»¥ng **ES Modules** native vÃ  **esbuild** Ä‘á»ƒ Ä‘áº¡t tá»‘c Ä‘á»™ khá»Ÿi Ä‘á»™ng dev server gáº§n nhÆ° tá»©c thá»i (< 300ms).

**Vai trÃ² trong há»‡ thá»‘ng:** Vite 7 Ä‘Æ°á»£c sá»­ dá»¥ng lÃ m bundler cho **Admin Dashboard** (`Front-end/`). LÃ½ do chá»n Vite thay vÃ¬ Next.js cho admin:
- Admin dashboard lÃ  **Single Page Application (SPA)** thuáº§n tÃºy, khÃ´ng cáº§n SSR/SSG vÃ¬ khÃ´ng phá»¥c vá»¥ SEO.
- **Hot Module Replacement (HMR)** cá»±c nhanh, tÄƒng nÄƒng suáº¥t phÃ¡t triá»ƒn.
- Bundle size nhá» hÆ¡n so vá»›i Next.js khi khÃ´ng cáº§n server-side features.

### 1.1.4. Zustand

Zustand lÃ  thÆ° viá»‡n quáº£n lÃ½ tráº¡ng thÃ¡i (State Management) tá»‘i giáº£n cho React, dá»±a trÃªn mÃ´ hÃ¬nh **Flux Ä‘Æ¡n giáº£n hÃ³a** (simplified Flux pattern).

**LÃ½ do lá»±a chá»n thay vÃ¬ Redux:**
- **API tá»‘i giáº£n**: KhÃ´ng yÃªu cáº§u boilerplate (reducers, action creators, middleware) nhÆ° Redux.
- **Bundle size nhá»**: ~1KB gzipped, phÃ¹ há»£p vá»›i yÃªu cáº§u hiá»‡u suáº¥t cá»§a e-commerce.
- **TypeScript-first**: TÃ­ch há»£p tá»± nhiÃªn vá»›i TypeScript, há»— trá»£ type inference tá»‘t.
- **KhÃ´ng cáº§n Provider wrapper**: Giáº£m component tree nesting.

**Vai trÃ²:** Quáº£n lÃ½ global state cho Admin Dashboard â€” tráº¡ng thÃ¡i authentication, cart state, filter/sort preferences, UI state (sidebar toggle, modal states).

### 1.1.5. Ant Design 6 (antd)

Ant Design lÃ  há»‡ thá»‘ng thiáº¿t káº¿ UI (Design System) cáº¥p doanh nghiá»‡p do Alibaba phÃ¡t triá»ƒn, cung cáº¥p bá»™ component React phong phÃº, chuáº©n hÃ³a.

**Vai trÃ² trong há»‡ thá»‘ng:** Ant Design 6 lÃ  UI framework chÃ­nh cho **Admin Dashboard**, cung cáº¥p sáºµn cÃ¡c component phá»©c táº¡p:
- **Table** vá»›i pagination, sorting, filtering tÃ­ch há»£p â€” phá»¥c vá»¥ danh sÃ¡ch sáº£n pháº©m, Ä‘Æ¡n hÃ ng.
- **Form** vá»›i validation rules â€” phá»¥c vá»¥ form táº¡o/sá»­a sáº£n pháº©m Ã¡o dÃ i (nhiá»u trÆ°á»ng, nhiá»u biáº¿n thá»ƒ).
- **Charts** (`@ant-design/charts`) â€” phá»¥c vá»¥ dashboard bÃ¡o cÃ¡o doanh thu, thá»‘ng kÃª.
- **Upload** component â€” phá»¥c vá»¥ upload áº£nh sáº£n pháº©m tá»‰ lá»‡ 3:4.

### 1.1.6. TailwindCSS 4

TailwindCSS lÃ  framework CSS theo phÆ°Æ¡ng phÃ¡p **Utility-First**, cho phÃ©p styling trá»±c tiáº¿p trong markup báº±ng cÃ¡c class tiá»‡n Ã­ch Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a sáºµn.

**Vai trÃ²:** TailwindCSS 4 Ä‘Æ°á»£c sá»­ dá»¥ng cho **Client Storefront** (`fe-client/`), káº¿t há»£p vá»›i Radix UI primitives (headless components) Ä‘á»ƒ xÃ¢y dá»±ng giao diá»‡n khÃ¡ch hÃ ng tÃ¹y chá»‰nh cao, tháº©m má»¹, phÃ¹ há»£p vá»›i thÆ°Æ¡ng hiá»‡u Ã¡o dÃ i.

---

## 1.2. Backend & System Stack

### 1.2.1. Node.js

Node.js lÃ  runtime environment cho JavaScript phÃ­a server, xÃ¢y dá»±ng trÃªn **V8 Engine** cá»§a Google Chrome, hoáº¡t Ä‘á»™ng theo mÃ´ hÃ¬nh **Event-Driven, Non-Blocking I/O**.

**LÃ½ do lá»±a chá»n cho kiáº¿n trÃºc Microservices:**
- **Single-threaded Event Loop**: PhÃ¹ há»£p cho cÃ¡c service I/O-intensive (Ä‘á»c/ghi database, gá»i API bÃªn ngoÃ i), vá»‘n chiáº¿m Ä‘a sá»‘ workload cá»§a e-commerce.
- **Lightweight**: Má»—i microservice Node.js tiÃªu thá»¥ Ã­t tÃ i nguyÃªn (RAM ~50-100MB), cho phÃ©p cháº¡y Ä‘á»“ng thá»i 12 service trÃªn má»™t mÃ¡y chá»§ duy nháº¥t.
- **JavaScript Ecosystem thá»‘ng nháº¥t**: CÃ¹ng ngÃ´n ngá»¯ giá»¯a Frontend vÃ  Backend, giáº£m context-switching cho Ä‘á»™i phÃ¡t triá»ƒn.
- **npm Ecosystem**: Há»‡ sinh thÃ¡i package lá»›n nháº¥t tháº¿ giá»›i, há»— trá»£ nhanh chÃ³ng tÃ­ch há»£p cÃ¡c thÆ° viá»‡n cáº§n thiáº¿t (Kafka client, Redis client, Mongoose ODM, v.v.).

### 1.2.2. TypeScript

TypeScript lÃ  superset cá»§a JavaScript, bá»• sung **Static Type System** táº¡i thá»i Ä‘iá»ƒm biÃªn dá»‹ch (compile-time).

**Vai trÃ² trong há»‡ thá»‘ng:**
- **Type Safety**: Giáº£m runtime errors, Ä‘áº·c biá»‡t quan trá»ng trong há»‡ thá»‘ng phÃ¢n tÃ¡n khi dá»¯ liá»‡u truyá»n giá»¯a 12 services qua HTTP/Kafka.
- **Interface Contracts**: Äá»‹nh nghÄ©a rÃµ rÃ ng cáº¥u trÃºc dá»¯ liá»‡u (Product schema, Order schema) táº¡i compile-time, Ä‘áº£m báº£o tÃ­nh nháº¥t quÃ¡n giá»¯a cÃ¡c service.
- **Enhanced IDE Support**: IntelliSense, auto-completion, refactoring tools â€” tÄƒng nÄƒng suáº¥t phÃ¡t triá»ƒn.
- **Documentation as Code**: Types tá»± thÃ¢n lÃ  tÃ i liá»‡u ká»¹ thuáº­t sá»‘ng (living documentation).

### 1.2.3. Docker

Docker lÃ  ná»n táº£ng **containerization** cho phÃ©p Ä‘Ã³ng gÃ³i á»©ng dá»¥ng cÃ¹ng toÃ n bá»™ dependencies vÃ o cÃ¡c container cÃ´ láº­p, Ä‘áº£m báº£o tÃ­nh nháº¥t quÃ¡n giá»¯a cÃ¡c mÃ´i trÆ°á»ng (development, staging, production).

**Vai trÃ² trong há»‡ thá»‘ng:** Docker lÃ  **xÆ°Æ¡ng sá»‘ng triá»ƒn khai** (deployment backbone) cá»§a toÃ n bá»™ kiáº¿n trÃºc microservices, Ä‘Æ°á»£c orchestrate qua `docker-compose.yml`:
- **12 service containers** (auth:5000, share:5001, user:5002, products:5003, order:5004, cart:5005, payment:5006, contact:5010, news:5011, ai:5012, report:5014)
- **Infrastructure containers**: Redis (caching), Zookeeper + Kafka (message broker), Nginx (API Gateway)
- **Isolated Networking**: Táº¥t cáº£ container giao tiáº¿p qua Docker bridge network (`admin-network`), cÃ´ láº­p hoÃ n toÃ n khá»i máº¡ng host.
- **Health Checks**: CÆ¡ cháº¿ kiá»ƒm tra sá»©c khá»e tá»± Ä‘á»™ng (vÃ­ dá»¥: User Service expose endpoint `/health`).

---

## 1.3. Architecture & Infrastructure Stack

### 1.3.1. Microservices Architecture

Kiáº¿n trÃºc Microservices phÃ¢n tÃ¡ch há»‡ thá»‘ng thÃ nh cÃ¡c **dá»‹ch vá»¥ nhá», Ä‘á»™c láº­p**, má»—i service Ä‘áº£m nhiá»‡m má»™t bounded context cá»¥ thá»ƒ vÃ  cÃ³ database riÃªng (**Database-per-Service pattern**).

**12 Microservices trong há»‡ thá»‘ng:**

| # | Service | Port | Database | Chá»©c nÄƒng cá»‘t lÃµi |
|---|---------|------|----------|-------------------|
| 1 | Auth Service | 5000 | MongoDB (Atlas) | XÃ¡c thá»±c, JWT, Ä‘Äƒng nháº­p/Ä‘Äƒng kÃ½ |
| 2 | Share Service | 5001 | â€” | Upload áº£nh (Cloudinary), gá»­i email (Kafka consumer) |
| 3 | User Service | 5002 | MongoDB (Atlas) | Quáº£n lÃ½ thÃ´ng tin ngÆ°á»i dÃ¹ng, profile |
| 4 | Products Service | 5003 | MongoDB (Atlas) | Sáº£n pháº©m, danh má»¥c, bá»™ sÆ°u táº­p |
| 5 | Order Service | 5004 | MongoDB (Atlas) | ÄÆ¡n hÃ ng, tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng |
| 6 | Cart Service | 5005 | MongoDB (Atlas) | Giá» hÃ ng |
| 7 | Payment Service | 5006 | MongoDB (Atlas) | Thanh toÃ¡n (MoMo integration) |
| 8 | Contact Service | 5010 | MongoDB (Atlas) | LiÃªn há»‡, pháº£n há»“i khÃ¡ch hÃ ng |
| 9 | News Service | 5011 | MongoDB (Atlas) | Tin tá»©c, bÃ i viáº¿t, blog |
| 10 | AI Service | 5012 | MongoDB (Atlas) | TÆ° váº¥n AI (LangGraph + GPT) |
| 11 | Report Service | 5014 | â€” | BÃ¡o cÃ¡o, thá»‘ng kÃª, analytics |
| 12 | API Gateway | 80 | â€” | Nginx reverse proxy, routing |

### 1.3.2. Nginx â€” Vai trÃ² API Gateway

Nginx Ä‘Ã³ng vai trÃ² **API Gateway** â€” Ä‘iá»ƒm vÃ o duy nháº¥t (Single Entry Point) cho toÃ n bá»™ há»‡ thá»‘ng, thá»±c hiá»‡n cÃ¡c chá»©c nÄƒng:

- **Reverse Proxy & Request Routing**: PhÃ¢n phá»‘i request tá»« client tá»›i Ä‘Ãºng microservice dá»±a trÃªn URL path pattern. VÃ­ dá»¥: `/api/admin/products/*` â†’ Products Service (port 5003), `/api/client/auth/*` â†’ Auth Service (port 5000).
- **URL Rewriting**: Chuyá»ƒn Ä‘á»•i public API path sang internal path. VÃ­ dá»¥: `/api/admin/products/123` â†’ `/api/v1/admin/product/123`.
- **CORS Handling**: Xá»­ lÃ½ táº­p trung Cross-Origin Resource Sharing, bao gá»“m preflight OPTIONS requests, trÃ¡nh má»—i service pháº£i tá»± cáº¥u hÃ¬nh CORS.
- **Load Balancing**: Há»— trá»£ phÃ¢n táº£i khi scale horizontally (hiá»‡n táº¡i má»—i service 1 instance).
- **Client Max Body Size**: Cáº¥u hÃ¬nh giá»›i háº¡n upload file (50MB cho Share Service upload áº£nh).

### 1.3.3. Redis â€” Caching Layer

Redis lÃ  in-memory data store, hoáº¡t Ä‘á»™ng nhÆ° **caching layer** táº­p trung cho há»‡ thá»‘ng.

**Vai trÃ² trong há»‡ thá»‘ng:**
- **Session/Token Caching**: Auth Service lÆ°u trá»¯ refresh tokens, blacklisted tokens trong Redis cho viá»‡c tra cá»©u O(1).
- **Product Data Caching**: Products Service cache káº¿t quáº£ truy váº¥n sáº£n pháº©m phá»• biáº¿n, giáº£m táº£i MongoDB.
- **Rate Limiting Data**: LÆ°u trá»¯ counter cho rate limiting API.
- **Deployment**: Cháº¡y dÆ°á»›i dáº¡ng Docker container (`redis:7-alpine`) vá»›i persistent storage (AOF â€” Append Only File).

### 1.3.4. Apache Kafka â€” Message Broker

Apache Kafka lÃ  ná»n táº£ng **distributed event streaming**, Ä‘Ã³ng vai trÃ² message broker cho giao tiáº¿p báº¥t Ä‘á»“ng bá»™ (asynchronous communication) giá»¯a cÃ¡c microservices.

**Vai trÃ² trong há»‡ thá»‘ng:**
- **Email Notification Pipeline**: Auth Service (producer) publish sá»± kiá»‡n `send-mail` khi user Ä‘Äƒng kÃ½/reset password â†’ Share Service (consumer) nháº­n vÃ  gá»­i email qua SMTP.
- **Event-Driven Decoupling**: TÃ¡ch rá»i (decouple) cÃ¡c nghiá»‡p vá»¥ khÃ´ng yÃªu cáº§u response tá»©c thá»i, vÃ­ dá»¥: gá»­i email xÃ¡c nháº­n Ä‘Æ¡n hÃ ng khÃ´ng cáº§n cháº·n luá»“ng Ä‘áº·t hÃ ng chÃ­nh.
- **Deployment**: Kafka + Zookeeper cháº¡y dÆ°á»›i dáº¡ng Docker containers. Topic `send-mail` Ä‘Æ°á»£c auto-create vá»›i 1 partition, 1 replica.

---

## 1.4. AI Stack

### 1.4.1. OpenAI GPT (gpt-4o-mini)

Há»‡ thá»‘ng sá»­ dá»¥ng model `gpt-4o-mini` thÃ´ng qua **GitHub Models API** (`https://models.github.ai/inference`) lÃ m LLM (Large Language Model) cá»‘t lÃµi cho AI Service.

**Vai trÃ²:** Xá»­ lÃ½ ngÃ´n ngá»¯ tá»± nhiÃªn (NLU) cho táº¥t cáº£ agents â€” hiá»ƒu intent khÃ¡ch hÃ ng, sinh cÃ¢u tráº£ lá»i tÆ° váº¥n, phÃ¢n tÃ­ch ná»™i dung kiá»ƒm duyá»‡t.

### 1.4.2. OpenAI Embeddings (text-embedding-3-large)

Model `text-embedding-3-large` Ä‘Æ°á»£c sá»­ dá»¥ng Ä‘á»ƒ chuyá»ƒn Ä‘á»•i vÄƒn báº£n mÃ´ táº£ sáº£n pháº©m thÃ nh **vector embeddings** Ä‘a chiá»u, phá»¥c vá»¥ tÃ¬m kiáº¿m ngá»¯ nghÄ©a (semantic search).

**Vai trÃ²:** XÃ¢y dá»±ng **in-memory vector store** â€” khi AI Service khá»Ÿi Ä‘á»™ng, toÃ n bá»™ sáº£n pháº©m Ä‘Æ°á»£c embed vÃ  lÆ°u trong bá»™ nhá»›. Khi khÃ¡ch hÃ ng há»i "tÃ¬m Ã¡o dÃ i lá»¥a tÆ¡ táº±m dÆ°á»›i 2 triá»‡u", há»‡ thá»‘ng tÃ­nh **cosine similarity** giá»¯a query embedding vÃ  product embeddings Ä‘á»ƒ tráº£ vá» káº¿t quáº£ phÃ¹ há»£p nháº¥t.

### 1.4.3. LangGraph â€” Supervisor Pattern

LangGraph lÃ  framework xÃ¢y dá»±ng **stateful, multi-agent** workflows dÆ°á»›i dáº¡ng Ä‘á»“ thá»‹ cÃ³ hÆ°á»›ng (directed graph). Há»‡ thá»‘ng Ã¡p dá»¥ng **Supervisor Pattern** tá»« `@langchain/langgraph-supervisor`.

**Kiáº¿n trÃºc Multi-Agent trong há»‡ thá»‘ng:**

| Agent | Vai trÃ² | Tools |
|-------|---------|-------|
| **Supervisor** | Äiá»u phá»‘i, phÃ¢n tÃ­ch intent, routing | â€” |
| **product_advisor** | TÆ° váº¥n sáº£n pháº©m Ã¡o dÃ i | `search_products`, `get_product_detail`, `get_categories` |
| **content_moderator** | Kiá»ƒm duyá»‡t ná»™i dung bÃ i viáº¿t | `moderate_content` |
| **utility_agent** | Truy váº¥n ngÃ y/giá», thá»i tiáº¿t | `get_current_date`, `get_weather` |
| **order_assistant** | Tra cá»©u Ä‘Æ¡n hÃ ng khÃ¡ch hÃ ng | `get_user_orders`, `get_order_detail` |

### 1.4.4. LangSmith â€” Observability & Tracing

LangSmith lÃ  ná»n táº£ng **observability** dÃ nh riÃªng cho á»©ng dá»¥ng LLM, cung cáº¥p:
- **Distributed Tracing**: Theo dÃµi toÃ n bá»™ execution flow tá»« Supervisor â†’ Agent â†’ Tool â†’ LLM call.
- **Prompt Debugging**: Xem chÃ­nh xÃ¡c prompt Ä‘Æ°á»£c gá»­i tá»›i GPT vÃ  response nháº­n vá».
- **Latency Analysis**: PhÃ¢n tÃ­ch thá»i gian xá»­ lÃ½ tá»«ng bÆ°á»›c trong pipeline.
- **Cost Monitoring**: Theo dÃµi token usage vÃ  chi phÃ­ API.

**Cáº¥u hÃ¬nh:** `LANGSMITH_TRACING=true`, project name `DoAn`, endpoint `https://api.smith.langchain.com`.

---

# PHáº¦N 2: KIáº¾N TRÃšC Tá»”NG THá»‚ & GIAO TIáº¾P Há»† THá»NG

## 2.1. SÆ¡ Ä‘á»“ Kiáº¿n trÃºc Tá»•ng thá»ƒ

```mermaid
graph TB
    subgraph "Client Layer"
        A1["Admin Dashboard<br/>(React 19 + Vite 7 + Ant Design 6)"]
        A2["Client Storefront<br/>(React 19 + Next.js 16 + TailwindCSS 4)"]
    end

    subgraph "Gateway Layer"
        GW["Nginx API Gateway<br/>Port 80<br/>Reverse Proxy / URL Rewrite / CORS"]
    end

    subgraph "Microservices Layer"
        S1["Auth Service<br/>:5000"]
        S2["User Service<br/>:5002"]
        S3["Products Service<br/>:5003"]
        S4["Order Service<br/>:5004"]
        S5["Cart Service<br/>:5005"]
        S6["Payment Service<br/>:5006"]
        S7["Share Service<br/>:5001"]
        S8["Contact Service<br/>:5010"]
        S9["News Service<br/>:5011"]
        S10["AI Service<br/>:5012"]
        S11["Report Service<br/>:5014"]
    end

    subgraph "Infrastructure Layer"
        R["Redis Cache<br/>:6379"]
        K["Apache Kafka<br/>:9092"]
        ZK["Zookeeper<br/>:2181"]
        DB["MongoDB Atlas<br/>(Cloud)"]
    end

    subgraph "External Services"
        CL["Cloudinary<br/>(Image CDN)"]
        MM["MoMo<br/>(Payment Gateway)"]
        OAI["OpenAI GPT<br/>(via GitHub Models)"]
        OW["OpenWeather API"]
        LS["LangSmith<br/>(Tracing)"]
    end

    A1 & A2 -->|"HTTP/REST"| GW
    GW --> S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11

    S1 & S2 & S3 ---|"Read/Write"| R
    S1 & S7 ---|"Pub/Sub"| K
    K --- ZK

    S1 & S2 & S3 & S4 & S5 & S6 & S8 & S9 & S10 -->|"CRUD"| DB

    S7 -->|"Upload"| CL
    S6 -->|"Payment API"| MM
    S10 -->|"LLM Inference"| OAI
    S10 -->|"Weather API"| OW
    S10 -->|"Trace Logs"| LS
```

## 2.2. Luá»“ng Request: Client â†’ Nginx â†’ Microservices

**MÃ´ táº£ chi tiáº¿t luá»“ng Ä‘i cá»§a má»™t request:**

```mermaid
sequenceDiagram
    participant C as Client Browser
    participant NG as Nginx API Gateway :80
    participant AS as Auth Service :5000
    participant PS as Products Service :5003
    participant RD as Redis Cache
    participant DB as MongoDB Atlas

    Note over C,DB: VÃ­ dá»¥: Client láº¥y danh sÃ¡ch sáº£n pháº©m (cÃ³ xÃ¡c thá»±c)

    C->>NG: GET /api/client/products?page=1&limit=10
    Note right of NG: 1. CORS Check<br/>2. URL Rewrite:<br/>/api/client/products â†’ /api/v1/client/product

    NG->>PS: GET /api/v1/client/product?page=1&limit=10
    Note right of PS: Proxy headers:<br/>X-Real-IP, X-Forwarded-For

    PS->>RD: GET cache:products:page1:limit10
    alt Cache HIT
        RD-->>PS: Cached product list
        PS-->>NG: 200 OK (from cache)
    else Cache MISS
        RD-->>PS: null
        PS->>DB: db.products.find({isDeleted: false}).skip(0).limit(10)
        DB-->>PS: Product documents
        PS->>RD: SET cache:products:page1:limit10 (TTL 5min)
        PS-->>NG: 200 OK (from DB)
    end

    NG-->>C: 200 OK + JSON Response
    Note right of NG: Add CORS headers:<br/>Access-Control-Allow-Origin
```

**CÃ¡c bÆ°á»›c chi tiáº¿t:**

1. **Client gá»­i request** tá»›i Nginx API Gateway (port 80) â€” Ä‘iá»ƒm vÃ o duy nháº¥t.
2. **Nginx xá»­ lÃ½ CORS**: Vá»›i request OPTIONS (preflight), tráº£ vá» 204 ngay láº­p tá»©c kÃ¨m cÃ¡c CORS headers. Vá»›i request thá»±c, thÃªm headers `Access-Control-Allow-Origin` vÃ  `Access-Control-Allow-Credentials`.
3. **URL Rewriting**: Nginx rewrite public path sang internal path (vÃ­ dá»¥: `/api/admin/products` â†’ `/api/v1/admin/product`).
4. **Proxy Pass**: Forward request tá»›i upstream service tÆ°Æ¡ng á»©ng, Ä‘Ã­nh kÃ¨m proxy headers (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`).
5. **Service xá»­ lÃ½**: Microservice nháº­n request, kiá»ƒm tra cache Redis, náº¿u miss thÃ¬ truy váº¥n MongoDB, xá»­ lÃ½ business logic, tráº£ response.
6. **Response ngÆ°á»£c láº¡i**: Service â†’ Nginx (thÃªm CORS headers) â†’ Client.

## 2.3. CÆ¡ cháº¿ Giao tiáº¿p giá»¯a cÃ¡c Services

### 2.3.1. Giao tiáº¿p Äá»“ng bá»™ (Synchronous â€” HTTP/REST)

CÃ¡c service giao tiáº¿p trá»±c tiáº¿p qua **internal HTTP calls** sá»­ dá»¥ng Axios. Má»—i service Ä‘Æ°á»£c cáº¥u hÃ¬nh URL cá»§a cÃ¡c service phá»¥ thuá»™c qua environment variables.

**Báº£n Ä‘á»“ giao tiáº¿p Ä‘á»“ng bá»™:**

```mermaid
graph LR
    subgraph "Synchronous HTTP Communication"
        Auth["Auth :5000"] -->|"Verify user exists"| User["User :5002"]
        Order["Order :5004"] -->|"Get cart items"| Cart["Cart :5005"]
        Order -->|"Validate product/stock"| Products["Products :5003"]
        Order -->|"Get user info"| User
        Cart -->|"Validate product"| Products
        Payment["Payment :5006"] -->|"Update order status"| Order
        News["News :5011"] -->|"Get author info"| User
        News -->|"AI content generation"| AI["AI :5012"]
        News -->|"Upload images"| Share["Share :5001"]
        AI -->|"Search products"| Products
        AI -->|"Get order data"| Order
        Report["Report :5014"] -->|"Aggregate order data"| Order
        Report -->|"Aggregate product data"| Products
    end
```

### 2.3.2. Giao tiáº¿p Báº¥t Ä‘á»“ng bá»™ (Asynchronous â€” Apache Kafka)

Kafka Ä‘Æ°á»£c sá»­ dá»¥ng cho cÃ¡c tÃ¡c vá»¥ **fire-and-forget** â€” nÆ¡i producer khÃ´ng cáº§n chá» consumer xá»­ lÃ½ xong.

```mermaid
graph LR
    subgraph "Asynchronous Kafka Communication"
        AuthP["Auth Service<br/>(Producer)"] -->|"Topic: send-mail<br/>Event: REGISTER / RESET_PASSWORD"| KF["Apache Kafka<br/>Broker :9092"]
        KF -->|"Consume"| ShareC["Share Service<br/>(Consumer)<br/>â†’ Send Email via SMTP"]
    end
```

**Luá»“ng chi tiáº¿t:**

1. **Auth Service** (producer) publish message vÃ o Kafka topic `send-mail` khi xáº£y ra sá»± kiá»‡n Ä‘Äƒng kÃ½ tÃ i khoáº£n, kÃ­ch hoáº¡t tÃ i khoáº£n, hoáº·c yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u.
2. **Kafka broker** lÆ°u message vÃ o partition, Ä‘áº£m báº£o durability.
3. **Share Service** (consumer) subscribe topic `send-mail`, nháº­n message vÃ  gá»­i email qua SMTP sá»­ dá»¥ng credentials `EMAIL_USER`/`EMAIL_PASS`.

**Æ¯u Ä‘iá»ƒm cá»§a Kafka trong luá»“ng nÃ y:**
- **Decoupling**: Auth Service khÃ´ng phá»¥ thuá»™c vÃ o Share Service â€” náº¿u email server down, message váº«n Ä‘Æ°á»£c lÆ°u trong Kafka vÃ  sáº½ Ä‘Æ°á»£c xá»­ lÃ½ khi Share Service recover.
- **Guaranteed Delivery**: Kafka Ä‘áº£m báº£o message khÃ´ng bá»‹ máº¥t nhá» persistent storage.
- **Backpressure Handling**: Náº¿u cÃ³ spike Ä‘Äƒng kÃ½ hÃ ng loáº¡t, Kafka buffer messages, Share Service xá»­ lÃ½ theo tá»‘c Ä‘á»™ riÃªng.


---

# PHáº¦N 3: Äáº¶C Táº¢ USECASE CHO TOÃ€N Bá»˜ SERVICES

## 3.1. Tá»•ng quan Usecase theo Service

### 3.1.1. Auth Service â€” XÃ¡c thá»±c & PhÃ¢n quyá»n

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-AUTH-01 | ÄÄƒng kÃ½ tÃ i khoáº£n | Guest | ÄÄƒng kÃ½ báº±ng email/password, gá»­i email kÃ­ch hoáº¡t qua Kafka |
| UC-AUTH-02 | KÃ­ch hoáº¡t tÃ i khoáº£n | Guest | XÃ¡c thá»±c token kÃ­ch hoáº¡t tá»« email |
| UC-AUTH-03 | ÄÄƒng nháº­p | Guest | XÃ¡c thá»±c credentials, phÃ¡t hÃ nh Access Token (JWT) + Refresh Token (HTTP-only cookie) |
| UC-AUTH-04 | ÄÄƒng xuáº¥t | Member/Admin | Thu há»“i token, thÃªm vÃ o Redis blacklist |
| UC-AUTH-05 | LÃ m má»›i token | Member/Admin | Sá»­ dá»¥ng Refresh Token Ä‘á»ƒ phÃ¡t hÃ nh Access Token má»›i |
| UC-AUTH-06 | QuÃªn máº­t kháº©u | Guest | Gá»­i email chá»©a link reset password (token cÃ³ TTL 15 phÃºt) |
| UC-AUTH-07 | Äáº·t láº¡i máº­t kháº©u | Guest | XÃ¡c thá»±c reset token, cáº­p nháº­t password má»›i (bcrypt hash) |
| UC-AUTH-08 | ÄÄƒng nháº­p Admin | Staff/Admin | XÃ¡c thá»±c vá»›i role-based access control (RBAC) cho admin dashboard |

### 3.1.2. User Service â€” Quáº£n lÃ½ NgÆ°á»i dÃ¹ng

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-USER-01 | Xem thÃ´ng tin cÃ¡ nhÃ¢n | Member | Láº¥y profile: name, email, phone, avatar, Ä‘á»‹a chá»‰ |
| UC-USER-02 | Cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n | Member | Sá»­a profile, upload avatar qua Share Service |
| UC-USER-03 | Quáº£n lÃ½ Ä‘á»‹a chá»‰ giao hÃ ng | Member | CRUD Ä‘á»‹a chá»‰ (fullName, phone, street, ward, city) |
| UC-USER-04 | Äá»•i máº­t kháº©u | Member | XÃ¡c thá»±c máº­t kháº©u cÅ©, hash máº­t kháº©u má»›i |
| UC-USER-05 | Xem danh sÃ¡ch ngÆ°á»i dÃ¹ng | Admin | Pagination, search, filter theo role/status |
| UC-USER-06 | Cáº­p nháº­t role ngÆ°á»i dÃ¹ng | Admin | GÃ¡n/thu há»“i role (member, staff, admin) |
| UC-USER-07 | VÃ´ hiá»‡u hÃ³a tÃ i khoáº£n | Admin | Soft disable tÃ i khoáº£n vi pháº¡m |
| UC-USER-08 | Xem lá»‹ch sá»­ Ä‘Æ¡n hÃ ng | Member | Gá»i internal API tá»›i Order Service |

### 3.1.3. Products Service â€” Quáº£n lÃ½ Sáº£n pháº©m, Danh má»¥c, Bá»™ sÆ°u táº­p

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-PROD-01 | ThÃªm má»›i sáº£n pháº©m Ã¡o dÃ i | Admin | Nháº­p thÃ´ng tin, áº£nh (tá»‰ lá»‡ 3:4), biáº¿n thá»ƒ size, specs cháº¥t liá»‡u, auto-generate SEO |
| UC-PROD-02 | Cáº­p nháº­t sáº£n pháº©m | Admin | Sá»­a thÃ´ng tin, auto-regenerate SEO khi thay Ä‘á»•i trÆ°á»ng quan trá»ng |
| UC-PROD-03 | XÃ³a sáº£n pháº©m (Soft Delete) | Admin | Set `isDeleted=true`, kiá»ƒm tra Ä‘Æ¡n hÃ ng pending trÆ°á»›c khi xÃ³a |
| UC-PROD-04 | Xem chi tiáº¿t sáº£n pháº©m | Admin/Member | Populate category, collection, hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§ specs |
| UC-PROD-05 | Danh sÃ¡ch sáº£n pháº©m | Admin/Guest | Pagination, search tiáº¿ng Viá»‡t, filter (category, gender, status, productType) |
| UC-PROD-06 | Thay Ä‘á»•i tráº¡ng thÃ¡i sáº£n pháº©m | Admin | Toggle: active / inactive / draft |
| UC-PROD-07 | Bulk Actions | Admin | Thay Ä‘á»•i tráº¡ng thÃ¡i / xÃ³a hÃ ng loáº¡t |
| UC-PROD-08 | Quáº£n lÃ½ biáº¿n thá»ƒ size | Admin | CRUD size, auto-recalculate totalStock |
| UC-PROD-09 | Upload áº£nh sáº£n pháº©m | Admin | Validate format/size, auto-resize 3:4, upload Cloudinary |
| UC-CAT-01 | Quáº£n lÃ½ danh má»¥c | Admin | CRUD danh má»¥c, auto-generate slug, update productCount |
| UC-COLL-01 | Quáº£n lÃ½ bá»™ sÆ°u táº­p | Admin | CRUD bá»™ sÆ°u táº­p (Táº¿t, CÆ°á»›i há»i, Ká»· yáº¿u), gÃ¡n sáº£n pháº©m |

### 3.1.4. Order Service â€” Quáº£n lÃ½ ÄÆ¡n hÃ ng

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-ORD-01 | Táº¡o Ä‘Æ¡n hÃ ng | Member | Láº¥y giá» hÃ ng tá»« Cart Service, validate stock tá»« Products Service, táº¡o orderNumber |
| UC-ORD-02 | Xem danh sÃ¡ch Ä‘Æ¡n hÃ ng | Admin | Pagination, filter theo status/paymentStatus/dateRange |
| UC-ORD-03 | Xem chi tiáº¿t Ä‘Æ¡n hÃ ng | Admin/Member | Hiá»ƒn thá»‹ items, shippingAddress, payment info, timeline |
| UC-ORD-04 | Cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n | Admin | Chuyá»ƒn tráº¡ng thÃ¡i: pending â†’ confirmed â†’ shipped â†’ delivered |
| UC-ORD-05 | Há»§y Ä‘Æ¡n hÃ ng | Member/Admin | Chá»‰ cho phÃ©p khi status = pending, hoÃ n tráº£ stock |
| UC-ORD-06 | Tra cá»©u Ä‘Æ¡n theo mÃ£ | Member | TÃ¬m Ä‘Æ¡n báº±ng orderNumber (VD: ORD-1234567890-ABCDE) |
| UC-ORD-07 | Xem sao kÃª Ä‘Æ¡n hÃ ng | Member | Internal API cho AI Service tra cá»©u Ä‘Æ¡n hÃ ng |

### 3.1.5. Cart Service â€” Giá» hÃ ng

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-CART-01 | ThÃªm sáº£n pháº©m vÃ o giá» | Member | Validate product + size + stock tá»« Products Service |
| UC-CART-02 | Cáº­p nháº­t sá»‘ lÆ°á»£ng | Member | Validate stock availability, recalculate subtotal |
| UC-CART-03 | XÃ³a sáº£n pháº©m khá»i giá» | Member | Remove item, recalculate cart total |
| UC-CART-04 | Xem giá» hÃ ng | Member | Populate product details (name, price, thumbnail) |
| UC-CART-05 | XÃ³a toÃ n bá»™ giá» hÃ ng | Member | Clear all items (thÆ°á»ng sau khi Ä‘áº·t hÃ ng thÃ nh cÃ´ng) |

### 3.1.6. Payment Service â€” Thanh toÃ¡n

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-PAY-01 | Thanh toÃ¡n COD | Member | Äáº·t hÃ ng vá»›i phÆ°Æ¡ng thá»©c thanh toÃ¡n khi nháº­n hÃ ng |
| UC-PAY-02 | Thanh toÃ¡n MoMo | Member | Táº¡o payment request tá»›i MoMo API, redirect user |
| UC-PAY-03 | Xá»­ lÃ½ callback MoMo | System | Nháº­n IPN callback tá»« MoMo, verify signature, cáº­p nháº­t paymentStatus |
| UC-PAY-04 | Xem lá»‹ch sá»­ thanh toÃ¡n | Admin | Danh sÃ¡ch transactions, filter theo method/status |

### 3.1.7. Share Service â€” Dá»‹ch vá»¥ DÃ¹ng chung

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-SHARE-01 | Upload áº£nh Ä‘Æ¡n/nhiá»u | Admin | Upload tá»›i Cloudinary, tráº£ vá» URL + public_id |
| UC-SHARE-02 | XÃ³a áº£nh | Admin | XÃ³a áº£nh tá»« Cloudinary báº±ng public_id |
| UC-SHARE-03 | Gá»­i email (Kafka Consumer) | System | Consume topic `send-mail`, gá»­i email qua SMTP |

### 3.1.8. Contact Service â€” LiÃªn há»‡

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-CONTACT-01 | Gá»­i form liÃªn há»‡ | Guest/Member | Submit cÃ¢u há»i/pháº£n há»“i |
| UC-CONTACT-02 | Xem danh sÃ¡ch liÃªn há»‡ | Admin | Pagination, filter theo tráº¡ng thÃ¡i (má»›i/Ä‘Ã£ Ä‘á»c/Ä‘Ã£ pháº£n há»“i) |
| UC-CONTACT-03 | Pháº£n há»“i liÃªn há»‡ | Admin | Reply trá»±c tiáº¿p, cáº­p nháº­t tráº¡ng thÃ¡i |

### 3.1.9. News Service â€” Tin tá»©c & Blog

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-NEWS-01 | Táº¡o bÃ i viáº¿t | Admin | Soáº¡n tháº£o (TinyMCE), upload áº£nh, AI há»— trá»£ content generation |
| UC-NEWS-02 | Cáº­p nháº­t bÃ i viáº¿t | Admin | Sá»­a ná»™i dung, tráº¡ng thÃ¡i (draft/published) |
| UC-NEWS-03 | XÃ³a bÃ i viáº¿t | Admin | Soft delete |
| UC-NEWS-04 | Xem danh sÃ¡ch bÃ i viáº¿t | Guest/Member | Pagination, filter theo category, SEO-friendly URLs |
| UC-NEWS-05 | Kiá»ƒm duyá»‡t ná»™i dung | Admin | Gá»i AI Service Ä‘á»ƒ moderate content trÆ°á»›c khi publish |

### 3.1.10. AI Service â€” TÆ° váº¥n ThÃ´ng minh

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-AI-01 | TÆ° váº¥n sáº£n pháº©m Ã¡o dÃ i | Member | Chat vá»›i AI, nháº­n gá»£i Ã½ sáº£n pháº©m phÃ¹ há»£p (semantic search) |
| UC-AI-02 | Tra cá»©u Ä‘Æ¡n hÃ ng qua AI | Member | Há»i AI vá» tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng, lá»‹ch sá»­ mua |
| UC-AI-03 | Kiá»ƒm duyá»‡t ná»™i dung bÃ i viáº¿t | Admin | AI phÃ¢n tÃ­ch vÄƒn báº£n, Ä‘Ã¡nh giÃ¡ má»©c Ä‘á»™ an toÃ n |
| UC-AI-04 | Truy váº¥n tiá»‡n Ã­ch | Member | Há»i ngÃ y/giá», thá»i tiáº¿t (tÃ­ch há»£p OpenWeather) |
| UC-AI-05 | LÆ°u lá»‹ch sá»­ há»™i thoáº¡i | Member | Persist conversation history vÃ o MongoDB |

### 3.1.11. Report Service â€” BÃ¡o cÃ¡o & Thá»‘ng kÃª

| ID | Usecase | Actor | MÃ´ táº£ |
|----|---------|-------|-------|
| UC-RPT-01 | Dashboard tá»•ng quan | Admin | Tá»•ng doanh thu, Ä‘Æ¡n hÃ ng, sáº£n pháº©m bÃ¡n cháº¡y |
| UC-RPT-02 | BÃ¡o cÃ¡o doanh thu theo ká»³ | Admin | Aggregate order data theo ngÃ y/tuáº§n/thÃ¡ng |
| UC-RPT-03 | Thá»‘ng kÃª sáº£n pháº©m | Admin | Top selling, low stock alerts, category performance |
| UC-RPT-04 | Export bÃ¡o cÃ¡o | Admin | Xuáº¥t Excel/PDF |

## 3.2. SÆ¡ Ä‘á»“ Usecase Tá»•ng quÃ¡t

```mermaid
graph TB
    subgraph Actors
        Guest["ðŸ§‘ Guest<br/>(KhÃ¡ch vÃ£ng lai)"]
        Member["ðŸ‘¤ Member<br/>(ThÃ nh viÃªn)"]
        Admin["ðŸ‘¨â€ðŸ’¼ Admin<br/>(Quáº£n trá»‹ viÃªn)"]
    end

    subgraph "Auth Service"
        A1["ÄÄƒng kÃ½ tÃ i khoáº£n"]
        A2["ÄÄƒng nháº­p"]
        A3["QuÃªn / Äáº·t láº¡i máº­t kháº©u"]
        A4["ÄÄƒng xuáº¥t / LÃ m má»›i token"]
    end

    subgraph "Products Service"
        P1["Xem danh sÃ¡ch sáº£n pháº©m"]
        P2["Xem chi tiáº¿t sáº£n pháº©m"]
        P3["TÃ¬m kiáº¿m sáº£n pháº©m"]
        P4["CRUD Sáº£n pháº©m"]
        P5["Quáº£n lÃ½ Danh má»¥c"]
        P6["Quáº£n lÃ½ Bá»™ sÆ°u táº­p"]
    end

    subgraph "Order Service"
        O1["Táº¡o Ä‘Æ¡n hÃ ng"]
        O2["Xem Ä‘Æ¡n hÃ ng cá»§a tÃ´i"]
        O3["Há»§y Ä‘Æ¡n hÃ ng"]
        O4["Quáº£n lÃ½ Ä‘Æ¡n hÃ ng"]
        O5["Cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n"]
    end

    subgraph "Cart Service"
        C1["Quáº£n lÃ½ giá» hÃ ng"]
    end

    subgraph "Payment Service"
        PM1["Thanh toÃ¡n COD"]
        PM2["Thanh toÃ¡n MoMo"]
    end

    subgraph "AI Consultation Service"
        AI1["TÆ° váº¥n sáº£n pháº©m AI"]
        AI2["Tra cá»©u Ä‘Æ¡n hÃ ng AI"]
        AI3["Kiá»ƒm duyá»‡t ná»™i dung"]
    end

    subgraph "Other Services"
        N1["Xem tin tá»©c / blog"]
        N2["Quáº£n lÃ½ tin tá»©c"]
        CT1["Gá»­i form liÃªn há»‡"]
        CT2["Quáº£n lÃ½ liÃªn há»‡"]
        R1["Xem bÃ¡o cÃ¡o thá»‘ng kÃª"]
        U1["Quáº£n lÃ½ profile"]
        U2["Quáº£n lÃ½ ngÆ°á»i dÃ¹ng"]
    end

    Guest --> A1 & A2 & A3
    Guest --> P1 & P2 & P3
    Guest --> N1 & CT1

    Member --> A4
    Member --> P1 & P2 & P3
    Member --> C1 --> O1
    O1 --> PM1 & PM2
    Member --> O2 & O3
    Member --> AI1 & AI2
    Member --> U1 & N1

    Admin --> A4
    Admin --> P4 & P5 & P6
    Admin --> O4 & O5
    Admin --> AI3
    Admin --> N2 & CT2 & R1 & U2
```


---

# PHáº¦N 4: SÆ  Äá»’ LUá»’NG HOáº T Äá»˜NG (ACTIVITY FLOW)

## 4.1. Luá»“ng ÄÄƒng nháº­p & XÃ¡c thá»±c (Authentication Flow)

```mermaid
flowchart TD
    Start(["ðŸŸ¢ Báº¯t Ä‘áº§u"]) --> InputCredentials["User nháº­p Email + Password"]
    InputCredentials --> SendRequest["Client gá»­i POST /api/client/auth/login"]
    SendRequest --> NginxRoute["Nginx rewrite â†’ /api/v1/client/auth/login<br/>Proxy Pass â†’ Auth Service :5000"]
    NginxRoute --> ValidateInput{"Validate input<br/>(email format, password min length)"}

    ValidateInput -->|"âŒ Invalid"| ReturnError400["Return 400: Validation Error"]
    ReturnError400 --> End1(["ðŸ”´ Káº¿t thÃºc"])

    ValidateInput -->|"âœ… Valid"| FindUser["Query MongoDB: findOne({email})"]
    FindUser --> UserExists{"User tá»“n táº¡i?"}
    UserExists -->|"âŒ KhÃ´ng"| Return401["Return 401: Email khÃ´ng tá»“n táº¡i"]
    Return401 --> End2(["ðŸ”´ Káº¿t thÃºc"])

    UserExists -->|"âœ… CÃ³"| CheckActivated{"TÃ i khoáº£n<br/>Ä‘Ã£ kÃ­ch hoáº¡t?"}
    CheckActivated -->|"âŒ ChÆ°a"| Return403["Return 403: ChÆ°a kÃ­ch hoáº¡t"]
    Return403 --> End3(["ðŸ”´ Káº¿t thÃºc"])

    CheckActivated -->|"âœ… Rá»“i"| ComparePassword["bcrypt.compare(inputPassword, hashedPassword)"]
    ComparePassword --> PasswordMatch{"Máº­t kháº©u<br/>khá»›p?"}
    PasswordMatch -->|"âŒ Sai"| Return401b["Return 401: Sai máº­t kháº©u"]
    Return401b --> End4(["ðŸ”´ Káº¿t thÃºc"])

    PasswordMatch -->|"âœ… ÄÃºng"| GenerateTokens["PhÃ¡t hÃ nh JWT Tokens:<br/>â€¢ Access Token (1h TTL)<br/>â€¢ Refresh Token (30d TTL)"]
    GenerateTokens --> StoreRefresh["LÆ°u Refresh Token vÃ o Redis<br/>Key: refresh:{userId}, TTL: 30 days"]
    StoreRefresh --> SetCookie["Set HTTP-Only Cookie:<br/>refreshToken, maxAge=30d, sameSite=lax"]
    SetCookie --> ReturnSuccess["Return 200:<br/>{accessToken, user: {id, name, email, role}}"]
    ReturnSuccess --> ClientStore["Client lÆ°u accessToken<br/>vÃ o Zustand store"]
    ClientStore --> End5(["ðŸŸ¢ Káº¿t thÃºc"])
```

## 4.2. Luá»“ng Äáº·t hÃ ng & Thanh toÃ¡n (Order + Payment Flow)

```mermaid
flowchart TD
    Start(["ðŸŸ¢ Member click Äáº·t hÃ ng"]) --> SendOrder["POST /api/client/order<br/>{shippingAddress, paymentMethod, customerNote}"]
    SendOrder --> NginxProxy["Nginx â†’ Order Service :5004"]
    NginxProxy --> AuthMiddleware{"JWT Middleware<br/>Verify Access Token"}
    AuthMiddleware -->|"âŒ Invalid/Expired"| Return401["Return 401: Unauthorized"]
    Return401 --> End1(["ðŸ”´ Káº¿t thÃºc"])

    AuthMiddleware -->|"âœ… Valid"| FetchCart["Gá»i Cart Service :5005<br/>GET /api/v1/client/cart/{userId}"]
    FetchCart --> CartEmpty{"Giá» hÃ ng<br/>trá»‘ng?"}
    CartEmpty -->|"âœ… Trá»‘ng"| Return400["Return 400: Giá» hÃ ng trá»‘ng"]
    Return400 --> End2(["ðŸ”´ Káº¿t thÃºc"])

    CartEmpty -->|"âŒ CÃ³ items"| ValidateStock["Gá»i Products Service :5003<br/>Validate tá»«ng item: stock â‰¥ quantity"]
    ValidateStock --> StockOK{"Táº¥t cáº£<br/>cÃ²n Ä‘á»§ hÃ ng?"}
    StockOK -->|"âŒ Háº¿t hÃ ng"| Return409["Return 409: Sáº£n pháº©m XYZ háº¿t size M"]
    Return409 --> End3(["ðŸ”´ Káº¿t thÃºc"])

    StockOK -->|"âœ… Äá»§"| CalcTotal["TÃ­nh toÃ¡n:<br/>subtotal = Î£(price Ã— quantity)<br/>shippingFee = calculateShipping()<br/>totalAmount = subtotal + shippingFee"]
    CalcTotal --> GenOrderNumber["Sinh mÃ£ Ä‘Æ¡n:<br/>ORD-{timestamp}-{random5chars}"]
    GenOrderNumber --> CreateOrder["LÆ°u Order vÃ o MongoDB:<br/>status=pending, paymentStatus=unpaid"]
    CreateOrder --> DeductStock["Gá»i Products Service<br/>Trá»« stock cho tá»«ng sáº£n pháº©m"]
    DeductStock --> ClearCart["Gá»i Cart Service<br/>XÃ³a giá» hÃ ng"]

    ClearCart --> CheckPayment{"PhÆ°Æ¡ng thá»©c<br/>thanh toÃ¡n?"}

    CheckPayment -->|"COD"| ReturnOrderCOD["Return 201:<br/>{order, message: Äáº·t hÃ ng thÃ nh cÃ´ng}"]
    ReturnOrderCOD --> End4(["ðŸŸ¢ Káº¿t thÃºc"])

    CheckPayment -->|"MoMo"| CreateMoMo["Gá»i Payment Service :5006<br/>POST /api/v1/client/payment/momo"]
    CreateMoMo --> MoMoRequest["Payment Service táº¡o request tá»›i MoMo API:<br/>â€¢ partnerCode, accessKey<br/>â€¢ amount, orderId<br/>â€¢ redirectUrl, ipnUrl<br/>â€¢ HMAC-SHA256 signature"]
    MoMoRequest --> MoMoResponse["MoMo tráº£ vá» payUrl"]
    MoMoResponse --> RedirectUser["Redirect User â†’ MoMo Payment Page"]
    RedirectUser --> UserPay["User xÃ¡c nháº­n thanh toÃ¡n trÃªn MoMo"]
    UserPay --> MoMoCallback["MoMo gá»i IPN Callback<br/>POST /api/client/payment/momo/callback"]
    MoMoCallback --> VerifySignature{"Verify HMAC<br/>Signature"}
    VerifySignature -->|"âŒ Invalid"| LogFraud["Log: Possible fraud attempt"]
    LogFraud --> End5(["ðŸ”´ Káº¿t thÃºc"])

    VerifySignature -->|"âœ… Valid"| CheckResult{"resultCode == 0?"}
    CheckResult -->|"âœ… Success"| UpdatePaid["Cáº­p nháº­t Order:<br/>paymentStatus = paid"]
    UpdatePaid --> End6(["ðŸŸ¢ Káº¿t thÃºc"])
    CheckResult -->|"âŒ Failed"| UpdateFailed["Cáº­p nháº­t Order:<br/>paymentStatus = failed"]
    UpdateFailed --> End7(["ðŸ”´ Káº¿t thÃºc"])
```

## 4.3. Luá»“ng Äá»“ng bá»™ Dá»¯ liá»‡u báº±ng Kafka (Email Notification Flow)

```mermaid
flowchart TD
    Start(["ðŸŸ¢ Sá»± kiá»‡n kÃ­ch hoáº¡t"]) --> TriggerEvent{"Loáº¡i sá»± kiá»‡n?"}

    TriggerEvent -->|"ÄÄƒng kÃ½ má»›i"| Register["Auth Service: User Ä‘Äƒng kÃ½<br/>â†’ Táº¡o activation token (1h TTL)"]
    TriggerEvent -->|"QuÃªn máº­t kháº©u"| ForgotPW["Auth Service: User yÃªu cáº§u reset<br/>â†’ Táº¡o reset token (15min TTL)"]
    TriggerEvent -->|"ÄÆ¡n hÃ ng má»›i"| NewOrder["Order Service: ÄÆ¡n hÃ ng táº¡o thÃ nh cÃ´ng"]

    Register & ForgotPW & NewOrder --> ProduceMsg["Kafka Producer (Auth/Order Service):<br/>kafka.producer.send({<br/>  topic: 'send-mail',<br/>  messages: [{<br/>    value: JSON.stringify({<br/>      type: 'REGISTER' | 'RESET_PW' | 'ORDER_CONFIRM',<br/>      to: user.email,<br/>      data: {name, token/orderNumber}<br/>    })<br/>  }]<br/>})"]

    ProduceMsg --> KafkaBroker["Apache Kafka Broker :9092<br/>Topic: send-mail<br/>Partition: 0, Offset: N"]

    KafkaBroker --> ConsumeMsg["Kafka Consumer (Share Service :5001):<br/>kafka.consumer.subscribe({topic: 'send-mail'})<br/>kafka.consumer.run({eachMessage})"]

    ConsumeMsg --> ParseMsg["Parse message:<br/>const {type, to, data} = JSON.parse(value)"]

    ParseMsg --> BuildEmail{"Loáº¡i email?"}
    BuildEmail -->|"REGISTER"| EmailActivate["Táº¡o email kÃ­ch hoáº¡t:<br/>Subject: KÃ­ch hoáº¡t tÃ i khoáº£n<br/>Body: Link /activate?token=xxx"]
    BuildEmail -->|"RESET_PW"| EmailReset["Táº¡o email reset password:<br/>Subject: Äáº·t láº¡i máº­t kháº©u<br/>Body: Link /reset-password?token=xxx"]
    BuildEmail -->|"ORDER_CONFIRM"| EmailOrder["Táº¡o email xÃ¡c nháº­n Ä‘Æ¡n:<br/>Subject: ÄÆ¡n hÃ ng ORD-xxx<br/>Body: Chi tiáº¿t Ä‘Æ¡n hÃ ng"]

    EmailActivate & EmailReset & EmailOrder --> SendSMTP["Gá»­i email qua SMTP:<br/>nodemailer.sendMail({<br/>  from: EMAIL_USER,<br/>  to: recipient,<br/>  subject, html<br/>})"]

    SendSMTP --> Result{"Gá»­i thÃ nh cÃ´ng?"}
    Result -->|"âœ…"| LogSuccess["Log: Email sent successfully"]
    Result -->|"âŒ"| RetryOrDLQ["Retry hoáº·c chuyá»ƒn vÃ o<br/>Dead Letter Queue (DLQ)"]

    LogSuccess & RetryOrDLQ --> End(["ðŸ”´ Káº¿t thÃºc"])
```

---

# PHáº¦N 5: THIáº¾T Káº¾ CHUYÃŠN SÃ‚U AI SERVICE (AI CONSULTATION SERVICE)

## 5.1. Tá»•ng quan Chá»©c nÄƒng

AI Service (`AI_services/`, port 5012) lÃ  dá»‹ch vá»¥ trÃ­ tuá»‡ nhÃ¢n táº¡o cá»‘t lÃµi cá»§a há»‡ thá»‘ng, Ä‘Ã³ng vai trÃ² **trá»£ lÃ½ áº£o thÃ´ng minh** (Virtual Shopping Assistant) cho khÃ¡ch hÃ ng vÃ  **cÃ´ng cá»¥ kiá»ƒm duyá»‡t ná»™i dung** cho quáº£n trá»‹ viÃªn. Service Ä‘Æ°á»£c xÃ¢y dá»±ng trÃªn ná»n táº£ng **LangGraph Multi-Agent** vá»›i **Supervisor Pattern**.

### 5.1.1. Chá»©c nÄƒng chÃ­nh

| Chá»©c nÄƒng | MÃ´ táº£ | Agent xá»­ lÃ½ |
|-----------|-------|-------------|
| **TÆ° váº¥n sáº£n pháº©m Ã¡o dÃ i** | Hiá»ƒu ngÃ´n ngá»¯ tá»± nhiÃªn cá»§a khÃ¡ch, tÃ¬m kiáº¿m sáº£n pháº©m phÃ¹ há»£p báº±ng semantic search (vector embeddings), tráº£ lá»i vá»›i format Ä‘áº¹p máº¯t | `product_advisor` |
| **Tra cá»©u Ä‘Æ¡n hÃ ng** | KhÃ¡ch há»i tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng báº±ng ngÃ´n ngá»¯ tá»± nhiÃªn, AI tra cá»©u vÃ  trÃ¬nh bÃ y káº¿t quáº£ dá»… hiá»ƒu | `order_assistant` |
| **Kiá»ƒm duyá»‡t ná»™i dung** | PhÃ¢n tÃ­ch vÄƒn báº£n bÃ i viáº¿t/tin tá»©c, Ä‘Ã¡nh giÃ¡ má»©c Ä‘á»™ an toÃ n (báº¡o lá»±c, spam, ná»™i dung nháº¡y cáº£m) | `content_moderator` |
| **Truy váº¥n tiá»‡n Ã­ch** | Cung cáº¥p thÃ´ng tin ngÃ y/giá» thá»±c, thá»i tiáº¿t hiá»‡n táº¡i (tÃ­ch há»£p OpenWeather API) | `utility_agent` |
| **Quáº£n lÃ½ há»™i thoáº¡i** | Äiá»u hÆ°á»›ng ngá»¯ cáº£nh, xá»­ lÃ½ cÃ¢u há»i ngoÃ i pháº¡m vi, duy trÃ¬ tÃ´ng giá»ng thÃ¢n thiá»‡n, chuyÃªn nghiá»‡p | `supervisor` |

### 5.1.2. Kiáº¿n trÃºc ká»¹ thuáº­t

**In-Memory Vector Store:**
- Khi service khá»Ÿi Ä‘á»™ng, gá»i Products Service API láº¥y toÃ n bá»™ sáº£n pháº©m active.
- Má»—i sáº£n pháº©m Ä‘Æ°á»£c chuyá»ƒn thÃ nh text mÃ´ táº£ (tÃªn, cháº¥t liá»‡u, phong cÃ¡ch, giÃ¡, danh má»¥c, tags...).
- Text Ä‘Æ°á»£c embed thÃ nh vector báº±ng `text-embedding-3-large` (batch size = 20, delay 1s giá»¯a cÃ¡c batch).
- Vectors lÆ°u trong RAM (array `productDocs[]`), tÃ¬m kiáº¿m báº±ng **cosine similarity**.

**LangGraph Supervisor Architecture:**
- **Supervisor Node**: Nháº­n message tá»« user, phÃ¢n tÃ­ch intent, routing tá»›i agent phÃ¹ há»£p.
- **Agent Nodes**: Má»—i agent lÃ  má»™t `ReactAgent` vá»›i tools chuyÃªn biá»‡t, prompt riÃªng.
- **Tool Nodes**: CÃ¡c function thá»±c thi nghiá»‡p vá»¥ cá»¥ thá»ƒ (gá»i API, tÃ­nh toÃ¡n, v.v.).
- **State Management**: LangGraph quáº£n lÃ½ conversation state (message history) dÆ°á»›i dáº¡ng graph state.

### 5.1.3. Báº£o máº­t & RÃ ng buá»™c

- **User Context Injection**: Khi báº¯t Ä‘áº§u há»™i thoáº¡i, há»‡ thá»‘ng inject `[Há»† THá»NG] userId: xxx` vÃ o message Ä‘áº§u tiÃªn. Order Assistant chá»‰ truy váº¥n Ä‘Æ¡n hÃ ng cá»§a Ä‘Ãºng userId nÃ y, ngÄƒn cháº·n truy cáº­p trÃ¡i phÃ©p.
- **No Hallucination Policy**: Product Advisor **báº¯t buá»™c** gá»i tool `search_products` trÆ°á»›c khi tÆ° váº¥n, tuyá»‡t Ä‘á»‘i khÃ´ng tá»± bá»‹a sáº£n pháº©m.
- **Scope Guard**: CÃ¢u há»i ngoÃ i pháº¡m vi (Äƒn uá»‘ng, tÃ¢m sá»±) Ä‘Æ°á»£c Supervisor xá»­ lÃ½ trá»±c tiáº¿p vá»›i cÃ¢u tráº£ lá»i ngáº¯n gá»n, sau Ä‘Ã³ khÃ©o lÃ©o Ä‘iá»u hÆ°á»›ng vá» sáº£n pháº©m Ã¡o dÃ i.

## 5.2. SÆ¡ Ä‘á»“ Activity Diagram â€” AI Service

```mermaid
flowchart TD
    Start(["ðŸŸ¢ User gá»­i message"]) --> API["POST /api/ai/chat<br/>{message, conversationId, userId}"]
    API --> NginxRewrite["Nginx: /api/ai/* â†’ /ai/*<br/>Proxy â†’ AI Service :5012"]
    NginxRewrite --> Controller["AI Controller nháº­n request"]
    Controller --> InjectCtx["Inject System Context:<br/>Prepend '[Há»† THá»NG] userId: {userId}'<br/>vÃ o message Ä‘áº§u tiÃªn náº¿u chÆ°a cÃ³"]

    InjectCtx --> SupervisorNode["ðŸ§  SUPERVISOR NODE<br/>(LangGraph Supervisor)<br/>Model: gpt-4o-mini"]

    SupervisorNode --> AnalyzeIntent["PhÃ¢n tÃ­ch Intent cá»§a User<br/>Dá»±a trÃªn prompt routing rules"]

    AnalyzeIntent --> RouteDecision{"Routing<br/>Decision?"}

    %% Product Advisor Path
    RouteDecision -->|"Há»i mua/tÆ° váº¥n<br/>sáº£n pháº©m"| PA["ðŸ›ï¸ PRODUCT ADVISOR AGENT"]
    PA --> PA_Extract["BÆ°á»›c 1: BÃ³c tÃ¡ch thÃ´ng tin<br/>â€¢ Loáº¡i: Ã¡o dÃ i, vÃ¡y, quáº§n...<br/>â€¢ Cháº¥t liá»‡u: lá»¥a, gáº¥m, voan...<br/>â€¢ NgÃ¢n sÃ¡ch: 500k â†’ 500000<br/>â€¢ Giá»›i tÃ­nh, Size"]
    PA_Extract --> PA_Tool["BÆ°á»›c 2: Gá»i Tool search_products<br/>Params: {query, minPrice, maxPrice, gender}"]
    PA_Tool --> VectorSearch["Vector Store: Semantic Search<br/>1. Embed query â†’ vector<br/>2. Cosine similarity vá»›i productDocs<br/>3. Filter: price range, gender<br/>4. Return top-K results"]
    VectorSearch --> PA_Format["BÆ°á»›c 3: Format káº¿t quáº£<br/>ðŸŒŸ TÃªn | ðŸ’° GiÃ¡ | ðŸ§µ Cháº¥t liá»‡u | ðŸ“ Size"]

    %% Order Assistant Path
    RouteDecision -->|"Há»i Ä‘Æ¡n hÃ ng"| OA["ðŸ“¦ ORDER ASSISTANT AGENT"]
    OA --> OA_ExtractUID["Láº¥y userId tá»« System Context"]
    OA_ExtractUID --> OA_Tool["Gá»i Tool: get_user_orders<br/>hoáº·c get_order_detail"]
    OA_Tool --> OA_CallAPI["HTTP GET â†’ Order Service :5004<br/>/internal/order/statement/{userId}"]
    OA_CallAPI --> OA_Format["Format káº¿t quáº£:<br/>MÃ£ Ä‘Æ¡n | Tráº¡ng thÃ¡i | Sáº£n pháº©m | Tá»•ng tiá»n"]

    %% Content Moderator Path
    RouteDecision -->|"Kiá»ƒm duyá»‡t<br/>ná»™i dung"| CM["ðŸ” CONTENT MODERATOR AGENT"]
    CM --> CM_Tool["Gá»i Tool: moderate_content<br/>â†’ OpenAI Moderation API"]
    CM_Tool --> CM_Result["Káº¿t quáº£:<br/>ðŸŸ¢ An toÃ n / ðŸ”´ Vi pháº¡m / ðŸŸ¡ Cáº§n xem xÃ©t<br/>Score + LÃ½ do chi tiáº¿t"]

    %% Utility Agent Path
    RouteDecision -->|"Há»i ngÃ y/giá»<br/>thá»i tiáº¿t"| UA["âš™ï¸ UTILITY AGENT"]
    UA --> UA_Decision{"Loáº¡i truy váº¥n?"}
    UA_Decision -->|"NgÃ y/giá»"| UA_Date["Tool: get_current_date<br/>â†’ System Date API"]
    UA_Decision -->|"Thá»i tiáº¿t"| UA_Weather["Tool: get_weather<br/>â†’ OpenWeather API<br/>({city} â†’ temp, humidity, description)"]

    %% Self-handle Path
    RouteDecision -->|"ChÃ o há»i /<br/>NgoÃ i ngá»¯ cáº£nh"| SelfHandle["Supervisor tá»± tráº£ lá»i:<br/>ChÃ o há»i thÃ¢n thiá»‡n +<br/>Äiá»u hÆ°á»›ng vá» sáº£n pháº©m Ã¡o dÃ i"]

    %% Convergence â†’ LangSmith Tracing
    PA_Format & OA_Format & CM_Result & UA_Date & UA_Weather & SelfHandle --> LangSmithTrace["ðŸ“Š LANGSMITH TRACING<br/>Log toÃ n bá»™ execution:<br/>â€¢ Supervisor routing decision<br/>â€¢ Agent selected + prompt<br/>â€¢ Tool calls + parameters<br/>â€¢ LLM tokens used<br/>â€¢ Latency per step<br/>â€¢ Final response"]

    LangSmithTrace --> SupervisorFinish["Supervisor nháº­n káº¿t quáº£ tá»« Agent<br/>â†’ Route: FINISH<br/>âš ï¸ KHÃ”NG tÃ³m táº¯t láº¡i, KHÃ”NG nháº¡i láº¡i"]

    SupervisorFinish --> SaveHistory["LÆ°u conversation history<br/>vÃ o MongoDB (AI DB)"]
    SaveHistory --> ReturnResponse["Return 200:<br/>{response, conversationId}"]
    ReturnResponse --> End(["ðŸŸ¢ Káº¿t thÃºc"])
```

## 5.3. SÆ¡ Ä‘á»“ Sequence â€” Luá»“ng TÆ° váº¥n Sáº£n pháº©m Chi tiáº¿t

```mermaid
sequenceDiagram
    participant U as User (Client)
    participant NG as Nginx Gateway
    participant AIS as AI Service :5012
    participant SV as Supervisor (LangGraph)
    participant PA as Product Advisor Agent
    participant VS as Vector Store (In-Memory)
    participant EMB as OpenAI Embeddings API
    participant LLM as GPT-4o-mini
    participant LS as LangSmith

    U->>NG: POST /api/ai/chat {message: "TÃ¬m Ã¡o dÃ i lá»¥a dÆ°á»›i 2 triá»‡u"}
    NG->>AIS: Rewrite + Proxy â†’ /ai/chat
    AIS->>SV: Invoke supervisor graph with message

    Note over SV,LS: LangSmith báº¯t Ä‘áº§u trace session

    SV->>LLM: Analyze intent (Supervisor prompt + user message)
    LLM-->>SV: Route â†’ product_advisor
    SV->>LS: Log: routing_decision = product_advisor

    SV->>PA: Delegate message to product_advisor
    PA->>LLM: Extract search params from natural language
    LLM-->>PA: {query: "Ã¡o dÃ i lá»¥a", maxPrice: 2000000}
    PA->>LS: Log: tool_call = search_products

    PA->>VS: searchProducts("Ã¡o dÃ i lá»¥a", k=15)
    VS->>EMB: embedQuery("Ã¡o dÃ i lá»¥a")
    EMB-->>VS: query_vector [0.012, -0.034, ...]
    VS->>VS: Cosine similarity with all productDocs
    VS-->>PA: Top 15 results (sorted by score)

    PA->>PA: Filter: price <= 2,000,000
    PA->>PA: Slice top 5 results

    PA->>LLM: Format results with advisor prompt
    LLM-->>PA: Formatted response with emojis

    PA-->>SV: Agent response complete
    SV->>LS: Log: agent_complete, tokens_used, latency
    SV->>SV: Route â†’ FINISH (khÃ´ng tÃ³m táº¯t láº¡i)

    SV-->>AIS: Final response
    AIS->>AIS: Save to MongoDB (conversation history)
    AIS-->>NG: 200 OK {response, conversationId}
    NG-->>U: JSON Response
```


---

# PHáº¦N 6: ÄÃNH GIÃ CHI TIáº¾T Há»† THá»NG

## 6.1. Nhá»¯ng Ä‘iá»u Ä‘Ã£ lÃ m tá»‘t (Pros)

### 6.1.1. TÃ­nh má»Ÿ rá»™ng cao (High Scalability)

Kiáº¿n trÃºc microservices cho phÃ©p **scale tá»«ng service Ä‘á»™c láº­p** theo nhu cáº§u thá»±c táº¿. VÃ­ dá»¥:
- Trong mÃ¹a Táº¿t â€” khi traffic mua Ã¡o dÃ i tÄƒng Ä‘á»™t biáº¿n â€” chá»‰ cáº§n scale horizontally Products Service vÃ  Order Service (thÃªm replicas) mÃ  khÃ´ng áº£nh hÆ°á»Ÿng Ä‘áº¿n cÃ¡c service khÃ¡c.
- AI Service cÃ³ thá»ƒ scale riÃªng khi lÆ°á»£ng ngÆ°á»i dÃ¹ng chatbot tÄƒng, khÃ´ng gÃ¢y bottleneck cho luá»“ng Ä‘áº·t hÃ ng.
- Nginx upstream configuration há»— trá»£ sáºµn load balancing cho multiple instances.

### 6.1.2. Kháº£ nÄƒng chá»‹u lá»—i (Fault Tolerance)

- **Service Isolation**: Náº¿u AI Service gáº·p sá»± cá»‘ (OpenAI API down), toÃ n bá»™ luá»“ng mua hÃ ng (Products â†’ Cart â†’ Order â†’ Payment) váº«n hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng.
- **Docker Restart Policy**: Táº¥t cáº£ containers Ä‘Æ°á»£c cáº¥u hÃ¬nh `restart: unless-stopped`, tá»± Ä‘á»™ng restart khi crash.
- **Health Checks**: User Service expose endpoint `/health` Ä‘á»ƒ Docker daemon giÃ¡m sÃ¡t, Ä‘áº£m báº£o service dependency (Auth Service phá»¥ thuá»™c User Service) chá»‰ start khi dependencies Ä‘Ã£ healthy.
- **Kafka Durability**: Messages trong Kafka Ä‘Æ°á»£c persist trÃªn disk, náº¿u Share Service (email consumer) crash, messages váº«n Ä‘Æ°á»£c giá»¯ láº¡i vÃ  xá»­ lÃ½ khi service recover â€” Ä‘áº£m báº£o khÃ´ng máº¥t email thÃ´ng bÃ¡o.

### 6.1.3. Tá»‘i Æ°u hiá»‡u suáº¥t (Performance Optimization)

- **Redis Caching**: Giáº£m 70-90% database queries cho cÃ¡c endpoint Ä‘á»c nhiá»u (danh sÃ¡ch sáº£n pháº©m, thÃ´ng tin category). Cache invalidation khi cÃ³ write operations.
- **In-Memory Vector Store**: TÃ¬m kiáº¿m sáº£n pháº©m báº±ng semantic search vá»›i latency < 50ms (khÃ´ng cáº§n gá»i external vector database nhÆ° Pinecone/Weaviate).
- **Nginx Static Serving**: Nginx xá»­ lÃ½ hiá»‡u quáº£ static assets, CORS preflight, vÃ  connection pooling tá»›i upstream services.
- **Database-per-Service**: Má»—i service cÃ³ database riÃªng (MongoDB Atlas), trÃ¡nh contention vÃ  lock conflicts giá»¯a cÃ¡c bounded contexts.

### 6.1.4. á»¨ng dá»¥ng AI hiá»‡n Ä‘áº¡i & SÃ¡ng táº¡o

- **Multi-Agent Architecture**: KhÃ´ng dÃ¹ng monolithic chatbot Ä‘Æ¡n giáº£n, mÃ  triá»ƒn khai kiáº¿n trÃºc multi-agent chuyÃªn biá»‡t vá»›i Supervisor Pattern â€” má»—i agent táº­p trung vÃ o má»™t domain cá»¥ thá»ƒ.
- **Semantic Search**: TÃ¬m kiáº¿m sáº£n pháº©m báº±ng ngÃ´n ngá»¯ tá»± nhiÃªn (vÃ­ dá»¥: "Ã¡o dÃ i thanh lá»‹ch cho Ä‘Ã¡m cÆ°á»›i") thay vÃ¬ keyword matching truyá»n thá»‘ng.
- **Observability**: TÃ­ch há»£p LangSmith cho tracing toÃ n bá»™ LLM pipeline â€” debug prompt engineering, monitor token usage, phÃ¢n tÃ­ch latency.
- **Context-Aware**: AI tá»± Ä‘á»™ng láº¥y userId tá»« system context Ä‘á»ƒ tra cá»©u Ä‘Æ¡n hÃ ng, Ä‘áº£m báº£o báº£o máº­t dá»¯ liá»‡u cÃ¡ nhÃ¢n.

### 6.1.5. Developer Experience (DX) tá»‘t

- **Monorepo Structure**: ToÃ n bá»™ 12 services náº±m trong cÃ¹ng má»™t repository, dá»… quáº£n lÃ½ vÃ  deploy.
- **Docker Compose**: Má»™t lá»‡nh `docker-compose up` khá»Ÿi cháº¡y toÃ n bá»™ há»‡ thá»‘ng (12 services + Redis + Kafka + Nginx).
- **TypeScript Consistency**: Táº¥t cáº£ services sá»­ dá»¥ng TypeScript, Ä‘áº£m báº£o type safety xuyÃªn suá»‘t.
- **Unified API Convention**: API paths tuÃ¢n theo convention nháº¥t quÃ¡n `/api/{role}/{resource}` (vÃ­ dá»¥: `/api/admin/products`, `/api/client/order`).

### 6.1.6. PhÃ¢n tÃ¡ch trÃ¡ch nhiá»‡m rÃµ rÃ ng (Separation of Concerns)

- **Frontend TÃ¡ch biá»‡t**: Admin Dashboard (Vite + Ant Design â€” focus UX quáº£n trá»‹) vÃ  Client Storefront (Next.js + TailwindCSS â€” focus SEO + tháº©m má»¹) Ä‘Æ°á»£c phÃ¡t triá»ƒn vÃ  deploy Ä‘á»™c láº­p.
- **API Gateway Pattern**: Client chá»‰ biáº¿t Ä‘áº¿n Nginx (port 80), khÃ´ng biáº¿t internal topology cá»§a 12 services â€” thay Ä‘á»•i port, thÃªm/bá»›t service khÃ´ng áº£nh hÆ°á»Ÿng client.
- **Database-per-Service**: Má»—i service quáº£n lÃ½ schema riÃªng, khÃ´ng chia sáº» database â€” trÃ¡nh tight coupling.

---

## 6.2. Nhá»¯ng Ä‘iá»u chÆ°a tá»‘t / ThÃ¡ch thá»©c (Cons)

### 6.2.1. Äá»™ phá»©c táº¡p triá»ƒn khai vÃ  váº­n hÃ nh (Operational Complexity)

- **12 services + 4 infrastructure containers = 16 containers**: Äá»™i váº­n hÃ nh cáº§n giÃ¡m sÃ¡t Ä‘á»“ng thá»i 16 processes, má»—i cÃ¡i cÃ³ log riÃªng, metrics riÃªng, failure modes riÃªng.
- **Thiáº¿u Container Orchestration**: Há»‡ thá»‘ng hiá»‡n dÃ¹ng Docker Compose â€” phÃ¹ há»£p cho development/staging nhÆ°ng **khÃ´ng Ä‘Ã¡p á»©ng yÃªu cáº§u production** (khÃ´ng cÃ³ auto-scaling, self-healing khi node cháº¿t, rolling updates, v.v.). Production cáº§n Kubernetes hoáº·c Docker Swarm.
- **Thiáº¿u CI/CD Pipeline**: ChÆ°a tháº¥y cáº¥u hÃ¬nh CI/CD tá»± Ä‘á»™ng (GitHub Actions, GitLab CI), viá»‡c deploy thá»§ cÃ´ng cho 12 services ráº¥t dá»… sai sÃ³t.

### 6.2.2. KhÃ³ khÄƒn trong Trace lá»—i há»‡ thá»‘ng phÃ¢n tÃ¡n (Distributed Debugging)

- **Thiáº¿u Distributed Tracing**: Ngoáº¡i trá»« AI Service cÃ³ LangSmith, 11 services cÃ²n láº¡i **khÃ´ng cÃ³** distributed tracing (Jaeger, Zipkin, OpenTelemetry). Khi xáº£y ra lá»—i trong chuá»—i Order â†’ Cart â†’ Products â†’ Payment, ráº¥t khÃ³ xÃ¡c Ä‘á»‹nh service nÃ o gÃ¢y ra váº¥n Ä‘á».
- **Thiáº¿u Correlation ID**: KhÃ´ng tháº¥y implementation request correlation ID (traceId) truyá»n qua cÃ¡c service, lÃ m cho viá»‡c trace má»™t request xuyÃªn suá»‘t nhiá»u services trá»Ÿ nÃªn cá»±c ká»³ khÃ³ khÄƒn.
- **Logging phÃ¢n tÃ¡n**: Má»—i service log vÃ o stdout riÃªng (Docker logs), khÃ´ng cÃ³ centralized logging (ELK Stack, Grafana Loki) Ä‘á»ƒ tÃ¬m kiáº¿m vÃ  correlate logs.

### 6.2.3. Quáº£n lÃ½ Transaction xuyÃªn Service (Cross-Service Transactions)

- **Thiáº¿u Saga Pattern**: Luá»“ng Ä‘áº·t hÃ ng liÃªn quan Ä‘áº¿n 4 services (Cart â†’ Order â†’ Products â†’ Payment) nhÆ°ng **khÃ´ng cÃ³ cÆ¡ cháº¿ compensating transactions**. VÃ­ dá»¥: Náº¿u táº¡o Order thÃ nh cÃ´ng, trá»« stock thÃ nh cÃ´ng, nhÆ°ng xÃ³a giá» hÃ ng tháº¥t báº¡i â†’ há»‡ thá»‘ng rÆ¡i vÃ o tráº¡ng thÃ¡i inconsistent.
- **Thiáº¿u Idempotency**: Náº¿u request retry do network timeout, Order cÃ³ thá»ƒ Ä‘Æ°á»£c táº¡o duplicate vÃ¬ thiáº¿u idempotency key.
- **Eventual Consistency Issues**: Vá»›i database-per-service, khÃ´ng cÃ³ distributed transaction (2PC), dá»¯ liá»‡u giá»¯a cÃ¡c services cÃ³ thá»ƒ táº¡m thá»i inconsistent.

### 6.2.4. Thiáº¿u sÃ³t vá» Báº£o máº­t (Security Gaps)

- **Thiáº¿u Rate Limiting**: Nginx chÆ°a cáº¥u hÃ¬nh rate limiting â€” há»‡ thá»‘ng dá»… bá»‹ táº¥n cÃ´ng brute force (login endpoint) hoáº·c DDoS.
- **Internal Communication khÃ´ng Ä‘Æ°á»£c báº£o vá»‡**: Giao tiáº¿p giá»¯a cÃ¡c services qua Docker network dÃ¹ng plain HTTP, khÃ´ng cÃ³ mTLS (mutual TLS) hoáº·c service mesh. Náº¿u attacker xÃ¢m nháº­p Docker network, cÃ³ thá»ƒ gá»i trá»±c tiáº¿p internal APIs.
- **Thiáº¿u API Versioning Strategy**: Máº·c dÃ¹ URL cÃ³ `/v1/`, chÆ°a tháº¥y chiáº¿n lÆ°á»£c deprecation vÃ  migration cho API version má»›i.

### 6.2.5. AI Service â€” Háº¡n cháº¿ ká»¹ thuáº­t

- **In-Memory Vector Store khÃ´ng scalable**: ToÃ n bá»™ product embeddings lÆ°u trong RAM â€” khi sá»‘ lÆ°á»£ng sáº£n pháº©m tÄƒng lÃªn hÃ ng chá»¥c ngÃ n, memory consumption sáº½ ráº¥t lá»›n vÃ  khÃ´ng thá»ƒ scale horizontally (má»—i instance pháº£i load láº¡i toÃ n bá»™ data).
- **Cold Start Problem**: Khi AI Service restart, pháº£i embed láº¡i toÃ n bá»™ sáº£n pháº©m (gá»i OpenAI API nhiá»u láº§n, máº¥t vÃ i phÃºt), trong thá»i gian nÃ y chatbot khÃ´ng thá»ƒ tÃ¬m kiáº¿m sáº£n pháº©m.
- **KhÃ´ng cÃ³ Real-time Sync**: Khi Products Service thÃªm/sá»­a/xÃ³a sáº£n pháº©m, AI Vector Store khÃ´ng tá»± Ä‘á»™ng cáº­p nháº­t â€” cáº§n gá»i `refreshVectorStore()` thá»§ cÃ´ng.

### 6.2.6. Chi phÃ­ duy trÃ¬ (Maintenance Cost)

- **API Costs**: OpenAI GPT-4o-mini + Embeddings API, LangSmith, OpenWeather API â€” táº¥t cáº£ Ä‘á»u cÃ³ chi phÃ­ theo usage.
- **MongoDB Atlas**: Cloud database cÃ³ chi phÃ­ hÃ ng thÃ¡ng, 10 databases (1 per service trá»« Share vÃ  Report) cáº§n monitoring.
- **Cloudinary**: LÆ°u trá»¯ vÃ  bandwidth áº£nh sáº£n pháº©m cÃ³ chi phÃ­.
- **Infrastructure**: Cháº¡y 16 containers Ä‘á»“ng thá»i yÃªu cáº§u server cÃ³ specs tá»‘i thiá»ƒu 4 CPU cores, 8GB RAM.

---

## 6.3. Äá» xuáº¥t Cáº£i tiáº¿n

### 6.3.1. Observability Stack

| Váº¥n Ä‘á» | Giáº£i phÃ¡p | CÃ´ng cá»¥ Ä‘á» xuáº¥t |
|---------|-----------|-----------------|
| Thiáº¿u distributed tracing | Implement OpenTelemetry SDK trong má»—i service, propagate trace context qua HTTP headers | **Jaeger** hoáº·c **Tempo** |
| Log phÃ¢n tÃ¡n | Centralized logging vá»›i structured JSON logs | **Grafana Loki** + **Promtail** |
| Thiáº¿u metrics monitoring | Expose metrics endpoint, scrape vÃ  visualize | **Prometheus** + **Grafana** |
| Thiáº¿u alerting | Tá»± Ä‘á»™ng alert khi service down, latency cao, error rate tÄƒng | **Grafana Alerting** hoáº·c **PagerDuty** |

### 6.3.2. Resilience Patterns

| Váº¥n Ä‘á» | Giáº£i phÃ¡p |
|---------|-----------|
| Thiáº¿u Saga Pattern | Implement Choreography-based Saga cho luá»“ng Ä‘áº·t hÃ ng: má»—i service publish event khi hoÃ n thÃ nh bÆ°á»›c cá»§a mÃ¬nh + compensating action khi nháº­n failure event |
| Thiáº¿u Circuit Breaker | TÃ­ch há»£p thÆ° viá»‡n **opossum** (Node.js circuit breaker) cho cÃ¡c inter-service HTTP calls, trÃ¡nh cascade failures |
| Thiáº¿u Retry + Idempotency | Implement exponential backoff retry + idempotency key (hash cá»§a userId + cartSnapshot + timestamp) cho Order creation |
| Thiáº¿u Dead Letter Queue | Cáº¥u hÃ¬nh Kafka DLQ cho messages khÃ´ng xá»­ lÃ½ Ä‘Æ°á»£c sau N láº§n retry |

### 6.3.3. Security Hardening

| Váº¥n Ä‘á» | Giáº£i phÃ¡p |
|---------|-----------|
| Thiáº¿u Rate Limiting | Cáº¥u hÃ¬nh Nginx `limit_req_zone` cho login, register, vÃ  AI chat endpoints |
| Internal comms khÃ´ng mÃ£ hÃ³a | Deploy **Istio Service Mesh** hoáº·c tá»‘i thiá»ƒu implement API key validation cho inter-service calls |
| Thiáº¿u input sanitization táº­p trung | Implement validation middleware chuáº©n hÃ³a (Zod/Joi) táº¡i API Gateway level |
| Thiáº¿u audit logging | Ghi log má»i admin actions (CRUD sáº£n pháº©m, thay Ä‘á»•i Ä‘Æ¡n hÃ ng) vÃ o audit trail collection |

### 6.3.4. AI Service Improvements

| Váº¥n Ä‘á» | Giáº£i phÃ¡p |
|---------|-----------|
| In-Memory Vector Store khÃ´ng scalable | Migrate sang **dedicated vector database**: Qdrant (self-hosted, free) hoáº·c Pinecone (managed) |
| Cold Start Problem | Persist embeddings vÃ o MongoDB/Redis, chá»‰ compute incremental embeddings cho sáº£n pháº©m má»›i |
| KhÃ´ng real-time sync | Implement **Kafka event**: Products Service publish event `product.created / product.updated / product.deleted` â†’ AI Service consume vÃ  cáº­p nháº­t vector store |
| Thiáº¿u conversation context window | Implement sliding window (giá»¯ N messages gáº§n nháº¥t) + summary compression cho long conversations |
| Thiáº¿u streaming response | Implement Server-Sent Events (SSE) Ä‘á»ƒ stream AI response tá»«ng token, cáº£i thiá»‡n UX |

### 6.3.5. Infrastructure & DevOps

| Váº¥n Ä‘á» | Giáº£i phÃ¡p |
|---------|-----------|
| Docker Compose khÃ´ng production-ready | Migrate sang **Kubernetes** (K8s) vá»›i Helm charts, hoáº·c tá»‘i thiá»ƒu **Docker Swarm** |
| Thiáº¿u CI/CD | Setup **GitHub Actions**: lint â†’ test â†’ build â†’ push Docker images â†’ deploy |
| Thiáº¿u environment parity | Sá»­ dá»¥ng **Terraform** hoáº·c **Pulumi** cho Infrastructure as Code (IaC) |
| Single point of failure (Nginx) | Deploy Nginx cluster vá»›i **keepalived** hoáº·c sá»­ dá»¥ng cloud load balancer |

### 6.3.6. Lá»™ trÃ¬nh Cáº£i tiáº¿n Äá» xuáº¥t (Roadmap)

```mermaid
gantt
    title Lá»™ trÃ¬nh Cáº£i tiáº¿n Há»‡ thá»‘ng
    dateFormat YYYY-MM
    axisFormat %Y-%m

    section Æ¯u tiÃªn Cao
    Rate Limiting trÃªn Nginx           :crit, 2026-06, 2026-06
    Distributed Tracing (Jaeger)       :crit, 2026-06, 2026-07
    Saga Pattern cho Order Flow        :crit, 2026-07, 2026-08
    CI/CD Pipeline (GitHub Actions)    :crit, 2026-06, 2026-07

    section Æ¯u tiÃªn Trung bÃ¬nh
    Centralized Logging (Loki)         :2026-07, 2026-08
    Migrate Vector Store â†’ Qdrant      :2026-08, 2026-09
    Kafka Event Sync cho AI            :2026-08, 2026-09
    Circuit Breaker Pattern            :2026-09, 2026-10

    section Æ¯u tiÃªn Tháº¥p
    Kubernetes Migration               :2026-10, 2026-12
    Service Mesh (Istio)               :2026-11, 2027-01
    AI Streaming Response (SSE)        :2026-10, 2026-11
    Audit Logging System               :2026-11, 2026-12
```

---

## Káº¾T LUáº¬N

Há»‡ thá»‘ng E-commerce Ão DÃ i vá»›i kiáº¿n trÃºc 12 Microservices Ä‘Ã£ thá»ƒ hiá»‡n má»™t ná»n táº£ng ká»¹ thuáº­t **vá»¯ng cháº¯c vÃ  hiá»‡n Ä‘áº¡i**, Ä‘áº·c biá»‡t ná»•i báº­t á»Ÿ:

1. **Kiáº¿n trÃºc phÃ¢n tÃ¡ch rÃµ rÃ ng** vá»›i Docker containerization vÃ  Nginx API Gateway, cho phÃ©p phÃ¡t triá»ƒn vÃ  triá»ƒn khai Ä‘á»™c láº­p tá»«ng service.
2. **AI Integration sÃ¡ng táº¡o** vá»›i LangGraph Multi-Agent Supervisor Pattern, semantic search báº±ng vector embeddings, vÃ  LangSmith observability â€” vÆ°á»£t xa má»©c Ä‘á»™ cá»§a má»™t chatbot truyá»n thá»‘ng.
3. **Tech stack hiá»‡n Ä‘áº¡i** vá»›i React 19, Next.js 16, TypeScript, Kafka, Redis â€” tuÃ¢n theo best practices cá»§a ngÃ nh.

Tuy nhiÃªn, Ä‘á»ƒ sáºµn sÃ ng cho production táº¡i quy mÃ´ lá»›n, há»‡ thá»‘ng cáº§n bá»• sung **observability** (distributed tracing, centralized logging), **resilience patterns** (Saga, Circuit Breaker), vÃ  **infrastructure maturity** (Kubernetes, CI/CD). CÃ¡c Ä‘á» xuáº¥t cáº£i tiáº¿n trÃªn Ä‘Ã¢y cung cáº¥p lá»™ trÃ¬nh rÃµ rÃ ng Ä‘á»ƒ nÃ¢ng cáº¥p há»‡ thá»‘ng tá»« má»©c **proof-of-concept** lÃªn **production-grade**.

---

*BÃ¡o cÃ¡o Ä‘Æ°á»£c soáº¡n tháº£o bá»Ÿi Software Architect & BSE â€” ThÃ¡ng 05/2026*

