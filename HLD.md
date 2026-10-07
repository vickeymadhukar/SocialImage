# SocialImage — High-Level Design (HLD) Document

## 1. Executive Summary

**SocialImage** is a full-stack, cloud-native social media and media-sharing platform designed for seamless image sharing, high-speed feed consumption, AI-driven categorization, and real-time content discovery.

The platform employs a decoupled client-server architecture:
- **Client Tier**: A mobile-first Single Page Application (SPA) built with **React 19**, **Vite**, and **TailwindCSS**, featuring client-side Canvas-based image optimization, Auth0 authentication, and a Pinterest-style masonry grid with infinite scroll.
- **Application Tier**: A modular RESTful API built on **Node.js** and **Express 5**, managing media ingestion pipelines, cache invalidation, and data synchronization.
- **Cache & Message Acceleration**: **Redis** for sub-millisecond cursor pagination caching with automated pattern-based cache clearing.
- **Database Tier**: **MongoDB (via Mongoose)** storing users, posts, text search indexes, and social interactions.
- **External Cloud Services**: **Cloudinary** for image CDN storage & Google AI auto-tagging, and **Auth0** as the OpenID Connect (OIDC) identity provider.

---

## 2. High-Level Architecture (HLD) Diagram

The following diagram illustrates the complete end-to-end system topology across clients, edge services, backend services, caching tiers, primary storage, and external SaaS providers.

```mermaid
graph TB
    subgraph Client_Tier ["Client Tier (Browser / Mobile Web)"]
        UI["React 19 SPA (Vite + TailwindCSS)"]
        AUTH_CLIENT["Auth0 React SDK"]
        COMPRESSOR["HTML5 Canvas Image Compressor"]
        FEED_ENGINE["Infinite Scroll & Cursor Feed Engine"]
    end

    subgraph CDN_Edge ["Edge & Identity Tier"]
        AUTH0["Auth0 Identity Platform<br/>(OAuth2 / OIDC JWTs)"]
        CLOUDINARY_CDN["Cloudinary Media CDN<br/>& AI Google Vision Tagging"]
    end

    subgraph API_Tier ["Application Tier (Node.js / Express 5)"]
        EXPRESS["Express.js Server (Port 5000 / Render)"]
        CORS["CORS & Error Handler Middleware"]
        MULTER["Multer Cloudinary Storage Streamer"]
        
        subgraph Controllers ["Controllers & Routes"]
            POST_CTRL["Post Controller<br/>(/posts)"]
            USER_CTRL["User Controller<br/>(/users)"]
        end
    end

    subgraph Cache_Tier ["In-Memory Caching Tier"]
        REDIS[("Redis In-Memory Cache<br/>posts:page:limit:cursor")]
    end

    subgraph Database_Tier ["Persistent Storage Tier"]
        MONGO[("MongoDB Atlas Database")]
        subgraph Collections ["Collections"]
            POSTS_COLL[("Posts Collection<br/>Text Indexed: caption, tags")]
            USERS_COLL[("Users Collection<br/>Unique: userId (Auth0 sub)")]
        end
    end

    %% Client Interactions
    UI -->|"1. Authenticate"| AUTH_CLIENT
    AUTH_CLIENT <-->|"OIDC Tokens"| AUTH0
    UI -->|"2. Pre-process Image"| COMPRESSOR
    COMPRESSOR -->|"Optimized Binary"| UI

    %% API Gateway Flow
    UI -->|"HTTP REST API Requests"| EXPRESS
    EXPRESS --> CORS
    CORS --> MULTER
    MULTER -->|"Stream File & AI Tagging"| CLOUDINARY_CDN
    CLOUDINARY_CDN -->|"Secure URL + Tags + Category"| MULTER

    MULTER --> POST_CTRL
    CORS --> USER_CTRL

    %% Controller to Redis & DB
    POST_CTRL <-->|"Read Feed Cache / Clear Cache"| REDIS
    POST_CTRL <-->|"CRUD / Text Search"| POSTS_COLL
    USER_CTRL <-->|"Sync / Profile Updates"| USERS_COLL

    MONGO --- POSTS_COLL
    MONGO --- USERS_COLL

    %% Media Retrieval directly from CDN
    UI -.->|"Direct Image Delivery (Optimized WebP/JPG)"| CLOUDINARY_CDN
```

---

## 3. Core Subsystems & Components

| Subsystem | Technology | Purpose & Responsibility |
| :--- | :--- | :--- |
| **Frontend Web App** | React 19, Vite, TailwindCSS | Dynamic UI, Masonry grid layout, search debounce, responsive curved navigation bar, and state management. |
| **Client Optimizer** | HTML5 Canvas API | Client-side image compression (`raw`, `high`, `standard` presets) before upload to save mobile bandwidth and reduce network latency. |
| **Authentication** | Auth0 Universal Login | Secure authentication (Google/Social/Email-Password), managing user sessions and sub-identifiers. |
| **Backend API** | Node.js (ESM), Express 5 | RESTful API endpoints for posts, user profiles, likes, search queries, and error handling. |
| **File Processing** | Multer + `multer-storage-cloudinary` | Multipart form processing, direct-to-cloud file streaming, and 5MB size limit validation. |
| **AI Tagging Engine** | Cloudinary Google Tagging Add-on | Automated image recognition; generates semantic tags and category classification upon upload. |
| **Cache Layer** | Redis (`redis` v5 npm) | High-speed caching for paginated feed queries (`posts:page:limit:X:cursor:Y`) with TTL and scan-based cache invalidation. |
| **Persistent DB** | MongoDB Atlas, Mongoose 8 | Stores structured records for Posts (with text indexes) and Users (with automatic age calculation hooks). |

---

## 4. End-to-End Sequence Workflows

### 4.1 Image Upload & AI Auto-Tagging Flow
The upload pipeline leverages client-side compression followed by Cloudinary's streaming upload and Google Tagging AI before committing metadata to MongoDB and invalidating the Redis cache.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as React Client (Upload.jsx)
    participant Compressor as Canvas Compressor
    participant API as Express API (/posts/createpost)
    participant Cloudinary as Cloudinary + Google AI
    participant DB as MongoDB (Post Model)
    participant Redis as Redis Cache

    User->>Client: Selects Image (Gallery / Camera / Files) & enters caption
    Client->>Compressor: compressImage(file, preset)
    Compressor-->>Client: Returns compressed JPEG/WebP blob
    Client->>API: POST /posts/createpost (Multipart form: image, caption, userId)
    API->>Cloudinary: Stream image directly via Multer storage
    Note over Cloudinary: Executes Google Tagging AI (confidence >= 0.7)
    Cloudinary-->>API: Returns secure_url, tags[], and category
    API->>DB: Post.create({ image, caption, userId, tags, category })
    DB-->>API: Saved Post Document
    API->>Redis: clearPostsCache() via SCAN 'posts:*' -> DEL keys
    Redis-->>API: Cache Cleared
    API-->>Client: HTTP 201 Created (Post Data)
    Client-->>User: Success toast & redirect to Home feed
```

---

### 4.2 Paginated Feed Retrieval & Redis Caching Flow
The feed implements a cursor-based pagination pattern to eliminate offset performance penalties and handle continuous infinite scrolling.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as React Client (Home.jsx)
    participant API as Express API (/posts/getallpost)
    participant Redis as Redis Cache
    participant DB as MongoDB (Post Model)

    User->>Client: Opens Feed / Scrolls to bottom (Observer triggers)
    Client->>API: GET /posts/getallpost?limit=10&cursor={cursorId}
    API->>Redis: GET posts:page:limit:10:cursor:{cursorId}
    
    alt Cache Hit
        Redis-->>API: Cached JSON response
        API-->>Client: HTTP 200 OK (from Redis Cache)
    else Cache Miss
        Redis-->>API: null
        API->>DB: Post.find(query).sort({createdAt: -1, _id: -1}).limit(11)
        DB-->>API: Records (up to 11 documents)
        Note over API: Extracts data (10 items), nextCursor, hasNextPage
        API->>Redis: SETEX posts:page:limit:10:cursor:{cursorId} 3600 (1 hr TTL)
        API-->>Client: HTTP 200 OK (data, nextCursor, hasNextPage)
    end

    Client-->>User: Renders Masonry Grid / Updates UI
```

---

### 4.3 Full-Text Search & Discovery Flow
Searches are debounced on the client to avoid request hammering and executed against MongoDB's compound text index (`caption` and `tags`).

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as React Client (Search.jsx)
    participant Debounce as useDebounce (400ms)
    participant API as Express API (/posts/search)
    participant DB as MongoDB (Post Model)

    User->>Client: Types keyword "nature" / clicks Category Pill "Travel"
    Client->>Debounce: Passes query string & category
    Debounce-->>Client: Settled debounced parameters
    Client->>API: GET /posts/search?q=nature&category=Travel
    API->>DB: Post.find({ $text: { $search: "nature" }, category: "Travel" })
    Note over DB: Sorts by textScore ({ score: { $meta: "textScore" } })
    DB-->>API: Filtered posts matching query
    API-->>Client: HTTP 200 OK ({ count, data: posts })
    Client-->>User: Live Masonry Grid update with search results
```

---

### 4.4 User Profile Synchronization & Lifecycle Flow
User authentication is managed externally by Auth0. The client synchronizes profile metadata with MongoDB upon sign-in.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Auth0 as Auth0 Service
    participant Client as React Client (UserBoard / Setting)
    participant API as Express API (/users)
    participant DB as MongoDB (User Model)

    User->>Auth0: Logs in via Social / Email
    Auth0-->>Client: Returns ID Token (sub, name, email, picture)
    Client->>API: POST /users/sync ({ userId: sub, name, email, profileImage })
    API->>DB: User.findOne({ userId })
    alt User not found
        API->>DB: User.create({ userId, name, email, profileImage })
    end
    DB-->>API: User profile document
    API-->>Client: HTTP 200 OK ({ success: true, data: user })
    Client->>Client: Cache profile in localStorage
    Client-->>User: Displays user board & posts
```

---

## 5. Database Schema & Data Models

### 5.1 Post Model (`posts`)
```json
{
  "_id": "ObjectId",
  "image": "String (Cloudinary HTTPS URL)",
  "caption": "String (Trimmed, Max 300 chars)",
  "likes": ["Array of Strings (userIds)"],
  "userId": "String (Auth0 sub ID)",
  "tags": ["Array of Strings (Google AI generated)"],
  "category": "String (Default: 'General')",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
**Indexes**:
- Compound Text Index: `{ caption: "text", tags: "text" }` for high-performance full-text search.
- Secondary B-Tree: `{ createdAt: -1, _id: -1 }` for cursor pagination.

### 5.2 User Model (`users`)
```json
{
  "_id": "ObjectId",
  "userId": "String (Auth0 sub ID, Unique Index)",
  "name": "String",
  "email": "String",
  "dob": "Date (Nullable)",
  "age": "Number (Computed automatically via pre-save hook)",
  "bio": "String (Default: '')",
  "profileImage": "String (Cloudinary HTTPS URL)",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
**Hooks**:
- `pre("save")`: Automatically derives `age` integer from `dob` date comparison against current year and month.

---

## 6. Caching & Invalidation Architecture

```mermaid
graph LR
    subgraph Operations ["Mutating Operations"]
        OP1["POST /posts/createpost"]
        OP2["DELETE /posts/deletepost/:id"]
        OP3["PUT /posts/likes/:postId"]
    end

    subgraph Invalidation ["Cache Eviction Engine"]
        FUNC["clearPostsCache()"]
        SCAN["SCAN 0 MATCH posts:* COUNT 100"]
        DEL["DEL matched keys"]
    end

    subgraph RedisStore ["Redis Keyspace"]
        K1["posts:page:limit:10:cursor:start"]
        K2["posts:page:limit:10:cursor:65f1a..."]
        K3["posts:page:limit:10:cursor:65f2b..."]
    end

    OP1 --> FUNC
    OP2 --> FUNC
    OP3 --> FUNC
    FUNC --> SCAN
    SCAN --> DEL
    DEL -.->|"Purged"| K1
    DEL -.->|"Purged"| K2
    DEL -.->|"Purged"| K3
```

- **Cache Keys**: Formatted as `posts:page:limit:<limit>:cursor:<cursor || 'start'>`.
- **TTL**: 3600 seconds (1 hour) default lifespan for feed pages.
- **Eviction Strategy**: Non-blocking `SCAN` iteration ensures the Redis thread is never blocked, even with millions of active keys.

---

## 7. Security & Non-Functional Attributes

1. **Authentication & Authorization**:
   - Authentication decoupled to Auth0 OIDC standard.
   - User identity keyed securely to Auth0 `sub` claim.
2. **Media Security & Validation**:
   - Multer middleware validates incoming MIME types (`jpg`, `jpeg`, `png`, `webp`).
   - Hard upload threshold enforced at 5MB with dedicated Multer error interceptor returning friendly status codes.
3. **CORS Governance**:
   - Strict origin allowlist supporting development (`http://localhost:5173`, `http://localhost:5000`) and production deployment (`https://socialimage-1.onrender.com`).
4. **Performance & Optimization**:
   - Multi-tier compression: Client-side Canvas downscaling (up to ~80% size savings) combined with Cloudinary automatic format/quality negotiation.
   - Cursor pagination prevents query degradation for deep feeds.
   - Client-side input debouncing (300ms–400ms) prevents API saturation on searches.

---

## 8. Directory & File Mapping

```
socialimage/
├── HLD.md                               # High-Level Architecture Documentation (This file)
├── README.md                            # Project Deployment Links
├── Backend/                             # Express.js REST API
│   ├── server.js                        # HTTP Server bootstrap & DB connection
│   ├── package.json                     # Backend dependencies & scripts
│   └── src/
│       ├── app.js                       # Express app configuration & middlewares
│       ├── config/
│       │   ├── db.js                    # MongoDB Mongoose connection
│       │   ├── redis.js                 # Redis client & cache invalidation logic
│       │   ├── cloudinary.js            # Cloudinary SDK credentials configuration
│       │   └── env.js                   # Environment variable loader
│       ├── controller/
│       │   ├── post.controller.js       # Post creation, cursor feed, search, likes
│       │   └── user.controller.js       # Profile sync & updates
│       ├── middlewares/
│       │   ├── upload.middlerware.js    # Multer + Cloudinary post image handler
│       │   └── profile.middleware.js   # Multer profile photo handler
│       ├── models/
│       │   ├── post.model.js            # MongoDB Post Schema & text index
│       │   └── user.model.js            # MongoDB User Schema & age hook
│       └── routes/
│           ├── post.route.js            # /posts API route definitions
│           └── user.route.js            # /users API route definitions
│
└── SocialImage/                         # React 19 Client SPA
    ├── package.json                     # Frontend dependencies
    ├── vite.config.js                   # Vite configuration
    ├── index.html                       # HTML document root
    └── src/
        ├── main.jsx                     # React root & Auth0Provider setup
        ├── App.jsx                      # Client router setup
        ├── Components/
        │   ├── Navbar.jsx               # Floating curved bottom navigation bar
        │   ├── SearchBar.jsx            # Category filter pills & search input
        │   └── MasonryGrid.jsx          # CSS-column responsive image grid
        ├── routes/
        │   ├── Home.jsx                 # Infinite scroll feed with cursor pagination
        │   ├── Search.jsx               # Real-time debounced search & category discovery
        │   ├── Upload.jsx               # Multi-source photo drawer & upload form
        │   ├── UserBoard.jsx            # User profile dashboard & uploaded post manager
        │   └── Setting.jsx              # User preferences, compression preset & profile editor
        ├── utils/
        │   └── compressor.js            # Client-side HTML5 Canvas image compressor
        └── hooks/
            └── useDebounce.js           # Debounce hook for instant search queries
```
