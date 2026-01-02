# GalleryStream

A real-time, interactive image gallery application built with React, InstantDB, and TailwindCSS. Users can view images from Unsplash, react with emojis, and leave comments in real-time.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/adi-de9/gallerystream
    cd gallerystream
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_INSTANTDB_APP_ID=your_instantdb_app_id
    VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📡 API Handling Strategy

### Image Data (Unsplash API)
The application fetches high-quality images using the Unsplash API.
- **Client Wrapper**: A dedicated `unsplash.js` utility (using Axios) handles all HTTP requests.
- **Robust Fallback**: If the API key is missing, invalid, or rate-limited, the system seamlessly switches to a **Mock Mode**, generating consistent, reliable placeholder data so the UI never breaks.
- **Pagination**: Supports infinite scrolling by fetching images in pages.

### Real-time Interactions (InstantDB)
All user interactions (likes, comments) are handled via **InstantDB**, a client-side database that syncs state across all connected clients in real-time.
- **No Backend Required**: Database logic is handled directly in the frontend hooks (`useQuery`, `transact`).
- **Live Feed**: The `Feed.jsx` component subscribes to the database, ensuring that whenever a user comments or reacts, the activity feed updates instantly for everyone.

## 💾 InstantDB Schema & Usage

We utilize a flexible, schema-on-read approach typical of InstantDB.

### key Entities

#### 1. `reactions`
Stores emoji reactions on images.
- `id` (UUID): Unique ID.
- `imageId`: ID of the image being reacted to.
- `userId`: ID of the user reacting.
- `userName`: Display name of the user.
- `emoji`: The emoji character used.
- `createdAt`: Timestamp.

#### 2. `comments`
Stores text comments on images.
- `id` (UUID): Unique ID.
- `imageId`: ID of the image.
- `userId`: ID of the user.
- `text`: The comment content.
- `createdAt`: Timestamp.

### Usage Pattern
Data access is encapsulated in custom hooks:
- **`useImageInteractions(imageId)`**: Fetches reactions/comments for a specific image and exposes `addReaction`, `addComment` methods.
- **`useFeedInteractions()`**: Subscribes to the global stream of recent activities for the sidebar feed.

## ⚛️ Key React Decisions

1.  **Zustand for State**: We use `zustand` with persistence middleware for checking user sessions (generating a stable User ID/Name without requiring full auth). It's simpler and less boilerplate-heavy than Redux.
2.  **Component Composition**: 
    - `Feed`: Handles the real-time activity stream.
    - `ImageCard`: A smart component that manages its own hover states and display modes (grid vs list).
    - `ImageModal`: Handles deep interaction (viewing full details, comments).
3.  **Custom Hooks**: Logic for database interaction is strictly separated from UI components. This makes the code testable and reusable.
4.  **TailwindCSS**: Used for rapid, utility-first styling. We leverage `group-hover` and `peer` modifiers for complex interaction states (e.g., hovering an image dimming the background).

## 🧩 Challenges & Solutions

### 1. Handling API Failures/Limits
**Challenge**: Unsplash has strict rate limits (50/hr for free tier).
**Solution**: Implemented a transparent "Mock Mode". If an API call fails, the `fetchImages` function catches the error and returns formatted mock objects that match the Unsplash schema exactly. This ensures typical development workflows aren't blocked by API limits.

### 2. Real-time Synchronization
**Challenge**: Keeping the global "Feed" in sync with individual "Image Cards".
**Solution**: InstantDB handles this natively. By subscribing to the same data source (`reactions` table), a change in `ImageCard` automatically propagates to `Feed` without complex prop drilling or context updates.

### 3. Infinite Scroll Performance
**Challenge**: Rendering many heavy images can lag the DOM.
**Solution**: Used `react-intersection-observer` to trigger fetches only when necessary and optimized image rendering (using smaller thumbnails where appropriate).

## 🔮 Future Improvements

With more time, I would focus on:
1.  **Virtualization**: Implementing `react-window` or `react-virtuoso` for the grid to support thousands of items without performance degradation.
2.  **Full Authentication**: Replacing the current UUID-based session with true Auth (Google/GitHub) using Clerk or Firebase Auth.
3.  **Image Optimization**: Implementing a blurred placeholder strategy (BlurHash) for smoother loading experiences.
4.  **User Profiles**: Clicking a user in the feed should show a filtered view of their liked images and comments.