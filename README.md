# GalleryStream 🖼️

A modern, real-time image gallery application built with React, featuring WhatsApp-style emoji reactions, live comments, and beautiful animations.

## 🌟 Features

- **Real-time Interactions**: Instant reactions and comments powered by InstantDB
- **WhatsApp-Style Reactions**: Users can select one emoji per image with visual feedback
- **Emoji Picker**: Full emoji library with search functionality
- **Live Activity Feed**: Real-time feed showing all user interactions
- **Image Gallery**: Grid and list view modes with infinite scrolling
- **Smooth Animations**: Subtle, performant animations throughout
- **User Management**: Authentication with custom usernames

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gallerystream
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_api_key
VITE_INSTANT_APP_ID=your_instantdb_app_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AuthUser.jsx    # User authentication
│   ├── Feed.jsx        # Activity feed
│   ├── Gallery.jsx     # Image gallery with view modes
│   ├── Header.jsx      # App header with user info
│   ├── ImageCard.jsx   # Individual image card
│   ├── ImageModal.jsx  # Full-screen image modal
│   └── MainLayout.jsx  # App layout wrapper
├── hooks/              # Custom React hooks
│   ├── useImageInteractions.js   # Image reactions/comments
│   ├── useInfiniteImages.js      # Infinite scroll
│   └── useFeedInteractions.js    # Activity feed data
├── lib/                # External services
│   ├── instantdb.js    # InstantDB configuration
│   └── unsplash.js     # Unsplash API client
├── store/              # State management
│   └── useUserStore.js # User state (Zustand)
└── App.jsx             # Root component
```

## 🏗️ Architecture & Design Decisions

### Real-Time State Management

**InstantDB Integration**
- Chosen for zero-backend real-time capabilities
- Automatic subscriptions with `useQuery` hook
- Optimistic updates for instant UI feedback
- Transactional mutations ensure data consistency

```javascript
// Example: Real-time reactions query
const { data } = db.useQuery({
  reactions: {
    $: { where: { imageId } }
  }
});
```

**State Architecture**
- **Global State**: User data via Zustand (persistent across sessions)
- **Server State**: InstantDB for real-time collaborative data
- **Local State**: React useState for UI-only state (modals, forms)
- **Derived State**: useMemo for performance optimization

### React Patterns & Best Practices

**Performance Optimizations**
1. **Memoization**: All expensive computations use `useMemo`
   ```javascript
   const reactionCounts = useMemo(() => {
     return reactions.reduce((acc, curr) => {
       acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
       return acc;
     }, {});
   }, [reactions]);
   ```

2. **Callback Stability**: All event handlers use `useCallback`
   ```javascript
   const handleSubmitComment = useCallback((e) => {
     e.preventDefault();
     if (commentText.trim()) {
       addComment(commentText.trim(), image.urls.thumb);
       setCommentText('');
     }
   }, [commentText, addComment, image.urls.thumb]);
   ```

3. **Component Memoization**: React.memo for pure components
   ```javascript
   export default React.memo(ImageCard);
   ```

4. **Lazy Loading**: Images load on-demand with `loading="lazy"`

5. **Infinite Scroll**: Intersection Observer for efficient pagination

**Custom Hooks Pattern**
- Encapsulate complex logic
- Promote reusability
- Separate concerns (data vs UI)

Example: `useImageInteractions`
```javascript
export const useImageInteractions = (imageId) => {
  // Data fetching
  const { data } = db.useQuery({ ... });
  
  // Business logic
  const addReaction = (emoji) => { ... };
  
  // Return clean interface
  return { reactions, comments, addReaction, addComment };
};
```

### UX Decision-Making

**1. WhatsApp-Style Emoji Reactions**
- **Why**: Familiar pattern, reduces decision fatigue
- **Implementation**: One emoji per user, click to toggle
- **Visual Feedback**: Blue highlight on selected emoji with ring effect
- **Benefit**: Prevents spam, clear user intent

**2. Staggered Animations**
- **Why**: Draws attention without overwhelming
- **Implementation**: 50ms delay per item in feed
- **Benefit**: Professional feel, guides user's eye

**3. Hover States Throughout**
- **Why**: Provides affordance (shows what's clickable)
- **Implementation**: Consistent scale/shadow effects
- **Transitions**: 200-300ms for natural feel

**4. Auto-focus Comment Input**
- **Why**: Reduces friction for engagement
- **Implementation**: `useEffect` with ref on modal mount
- **Benefit**: User can start typing immediately

**5. Click-Outside to Close**
- **Why**: Standard modal pattern, improves UX
- **Implementation**: Event listener with ref-based detection
- **Benefit**: Intuitive escape hatch

**6. Keyboard Shortcuts**
- **ESC**: Close modal/picker
- **Why**: Power users expect keyboard navigation
- **Benefit**: Accessibility and efficiency

**7. Delete on Hover**
- **Why**: Prevents accidental deletion
- **Implementation**: `opacity-0` → `group-hover:opacity-100`
- **Benefit**: Clean UI until needed

**8. Real-time Feed Position**
- **Why**: Keeps users engaged with activity
- **Implementation**: Fixed sidebar with live updates
- **Benefit**: Discoverability, social proof

## 🎨 Component Documentation

### ImageModal

The centerpiece of the application - a full-screen modal for viewing images and interactions.

**Features:**
- Emoji reactions with picker
- Comment system with delete
- Real-time updates
- Keyboard navigation
- Click-outside to close
- Auto-scroll lock

**State Management:**
```javascript
// UI State
const [commentText, setCommentText] = useState('');
const [showEmojiPicker, setShowEmojiPicker] = useState(false);

// Server State (Real-time)
const { reactions, comments, addReaction, addComment, deleteComment } 
  = useImageInteractions(image.id);

// Derived State
const userReaction = useMemo(() => 
  reactions.find(r => r.userId === userId)
, [reactions, userId]);
```

**UX Enhancements:**
- Staggered emoji animations
- Smooth modal entry (zoom + fade)
- Comment hover states
- Emoji scale on hover
- Delete confirmation via single click

### Feed Component

Real-time activity feed showing all user interactions.

**Key Features:**
- Staggered entry animations
- Time-ago formatting
- User color coding
- Image thumbnails
- Empty states

**Performance:**
```javascript
// Memoize empty state check
const isEmpty = useMemo(() => feedItems.length === 0, [feedItems.length]);
```

### Gallery Component

Image grid with dual view modes and infinite scroll.

**View Modes:**
1. **Grid**: Card-based, optimized for browsing
2. **List**: Compact, shows more metadata

**Infinite Scroll Implementation:**
```javascript
const { ref: loadMoreRef, inView } = useInView({
  threshold: 0.5,
  triggerOnce: false,
});

useEffect(() => {
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
```

## 🔧 API Integration

### Unsplash API
- **Purpose**: Fetch high-quality images
- **Rate Limit**: 50 requests/hour (demo mode)
- **Pagination**: 12 images per page
- **Search**: Debounced search with query params

### InstantDB
- **Purpose**: Real-time database for interactions
- **Schema**:
  ```javascript
  {
    reactions: { imageId, userId, userName, emoji, imageUrl, createdAt },
    comments: { imageId, userId, userName, text, imageUrl, createdAt }
  }
  ```
- **Features**: Automatic subscriptions, optimistic updates

## 🎯 State Flow Diagram

```
User Action (Click Emoji)
    ↓
Component Handler (handleReactionClick)
    ↓
Custom Hook (useImageInteractions.addReaction)
    ↓
InstantDB Transaction (db.transact)
    ↓
Server Update
    ↓
Real-time Subscription (db.useQuery)
    ↓
Component Re-render with New Data
    ↓
UI Update (Emoji highlighted)
```

## 🚀 Performance Optimizations

1. **Code Splitting**: Components lazy-loaded where beneficial
2. **Image Optimization**: Multiple URL sizes from Unsplash
3. **Memoization**: useMemo for all derived state
4. **Callback Stability**: useCallback for all handlers
5. **DOM Measurements**: IntersectionObserver (not scroll events)
6. **CSS Animations**: GPU-accelerated transforms
7. **Debouncing**: Search queries debounced 300ms

## 🧪 Testing Guide

### Manual Testing Checklist

**Authentication:**
- [ ] Create user with username
- [ ] Username persists across refresh
- [ ] Different users see different "your reaction" states

**Reactions:**
- [ ] Click emoji → adds reaction
- [ ] Click same emoji → removes reaction
- [ ] Click different emoji → replaces reaction
- [ ] Emoji picker opens and adds custom emoji
- [ ] Only one emoji per user per image
- [ ] Real-time updates from other users

**Comments:**
- [ ] Add comment appears instantly
- [ ] Delete own comment (trash icon on hover)
- [ ] Cannot delete other users' comments
- [ ] Input auto-focuses on modal open
- [ ] Empty state shows when no comments

**Feed:**
- [ ] Shows all reactions and comments
- [ ] Time updates (refresh to see)
- [ ] Staggered animation on load
- [ ] Image thumbnails clickable

**General UX:**
- [ ] ESC closes modal
- [ ] Click backdrop closes modal
- [ ] Infinite scroll loads more images
- [ ] Animations smooth (60fps)
- [ ] No layout shifts

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_UNSPLASH_ACCESS_KEY` | Unsplash API key | Yes |
| `VITE_INSTANT_APP_ID` | InstantDB app ID | Yes |

### Code Style

- **Naming**: camelCase for functions, PascalCase for components
- **Structure**: Props → State → Hooks → Handlers → Render
- **Comments**: Only for complex logic, code should be self-documenting
- **Formatting**: Prettier/ESLint default settings

## 📚 Key Learnings & Patterns

### Real-Time State
- Let server be source of truth
- Optimistic updates for UX
- Handle conflict resolution gracefully

### React Performance
- Measure before optimizing
- Memoize correctly (don't over-memoize)
- Use production build for testing

### UX Design
- Consistent patterns build familiarity
- Animations should enhance, not distract
- Empty states are important
- Loading states prevent confusion

### Code Organization
- Separate data from presentation
- Custom hooks for reusable logic
- Components should have single responsibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- **Unsplash** for beautiful imagery
- **InstantDB** for real-time infrastructure
- **Lucide React** for clean icons
- **emoji-picker-react** for emoji selection

---

Built with ❤️ using React, Vite, and InstantDB
