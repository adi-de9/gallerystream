# GalleryStream 🖼️

> A real-time image gallery with WhatsApp-style emoji reactions and live comments


## ✨ What It Does

- 🖼️ Browse beautiful images from Unsplash
- ❤️ React with emojis (WhatsApp-style: one per user)
- 💬 Add & delete your own comments
- ⚡ See updates in real-time across all users
- 🎨 Smooth animations and modern UI

[Live Demo](#) | [Report Bug](https://github.com/adi-de9/gallerystream/issues) | [Request Feature](https://github.com/adi-de9/gallerystream/issues)


## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/adi-de9/gallerystream
cd gallerystream
npm install
```

### 2. Configure

Create `.env` file:

```env
VITE_UNSPLASH_ACCESS_KEY=your_key_here
VITE_INSTANT_APP_ID=your_app_id_here
```

**Get your keys:**
- Unsplash: [unsplash.com/developers](https://unsplash.com/developers)
- InstantDB: [instantdb.com](https://www.instantdb.com/)

### 3. Run

```bash
npm run dev
```

Open [localhost:5173](http://localhost:5173)

## � Project Structure

```
src/
├── components/       # UI components
├── hooks/           # Custom React hooks (data + logic)
├── lib/             # External services (Unsplash, InstantDB)
├── store/           # Global state (Zustand)
└── utils/           # Helper functions
```

**Key Files:**
- `ImageModal.jsx` - Main interaction hub (reactions, comments)
- `useImageInteractions.js` - Real-time data hook
- `Gallery.jsx` - Infinite scroll gallery

## 🏗️ How It Works

### Real-Time Architecture

```
User clicks emoji
    ↓
Component handler
    ↓
InstantDB transaction → Server
    ↓
Real-time subscription updates
    ↓
All users see change instantly ⚡
```

**Why InstantDB?**
- Zero backend code needed
- Automatic real-time subscriptions
- Optimistic UI updates
- Built-in conflict resolution

### WhatsApp-Style Reactions

**Problem:** How to let users express themselves without spam?

**Solution:** One emoji per user, per image

```javascript
// Click emoji #1 → Adds reaction
// Click emoji #2 → Replaces with #2
// Click emoji #2 again → Removes reaction
```

**Benefits:**
- ✅ Clear user intent
- ✅ No spam
- ✅ Familiar pattern
- ✅ Easy to change mind

### Performance Optimizations

| What | How | Why |
|------|-----|-----|
| **Memoization** | `useMemo`, `useCallback` | Prevent unnecessary re-renders |
| **Lazy Loading** | `loading="lazy"` on images | Faster initial load |
| **Infinite Scroll** | Intersection Observer | Load only what's visible |
| **Animations** | GPU-accelerated (transform, opacity) | Smooth 60fps |
| **Debounce** | Search input 300ms | Reduce API calls |

## 🎯 Key Features Explained

### 1. Real-Time Comments

**How it works:**
- Type comment → Save to InstantDB
- Other users subscribe to same image
- See new comments instantly

**User Experience:**
- Auto-focus on input (start typing immediately)
- Delete your own comments (trash icon on hover)
- Newest comments first

### 2. Emoji Reactions

**Quick Reactions:**
- 5 common emojis for fast access
- Click to toggle
- Count shows next to emoji

**Custom Emojis:**
- Click "+ Add" button
- Search from full emoji library
- Replaces your current reaction

**Visual Feedback:**
- Blue highlight = your selection
- Ring effect for emphasis
- "You reacted with 😂" message

### 3. Activity Feed

**Shows:**
- Who reacted/commented
- What image
- When (time ago)
- Thumbnail preview

**Updates:**
- Real-time as actions happen
- Staggered fade-in animation
- Newest first

### 4. Gallery Views

**Grid View:** Cards with image preview
**List View:** Compact with metadata

Both support:
- Infinite scroll
- Hover animations
- View mode toggle

## 🔧 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 | UI components |
| **Build Tool** | Vite | Fast development |
| **Database** | InstantDB | Real-time backend |
| **Images** | Unsplash API | High-quality photos |
| **State** | Zustand | Global state |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Icons** | Lucide React | Clean icons |
| **Emojis** | emoji-picker-react | Emoji selection |

## 💡 Design Decisions

### Why One Emoji Per User?

**Considered:**
- Unlimited reactions → Too chaotic, spam potential
- Like only → Not expressive enough
- Multiple emojis → Confusing intent

**Chose:** WhatsApp model (one emoji)

**Result:** Clear, familiar, prevents spam

### Why Staggered Animations?

**Without:** All items appear at once (overwhelming)
**With:** Cascading effect (50ms delay each)

**Benefit:** Guides user's eye, feels polished

### Why Auto-Focus Comment Input?

**Problem:** User has to click input to start typing
**Solution:** Auto-focus on modal open

**Benefit:** One less click, faster interaction

### Why Delete on Hover?

**Problem:** Delete button always visible = cluttered UI
**Solution:** Show trash icon only on hover

**Benefit:** Clean interface, prevents accidents

## 📖 Usage Examples

### Add a Reaction

```
1. Click any image
2. Click an emoji or "+" button
3. Select emoji from picker (optional)
4. See your selection highlighted
5. Click again to remove
```

### Add a Comment

```
1. Click any image
2. Type in the comment box (auto-focused)
3. Press Enter or click Send
4. See your comment appear instantly
```

### Delete Your Comment

```
1. Hover over your comment
2. Click trash icon (red)
3. Comment removed instantly
```

## 🛠️ Development

### Available Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_UNSPLASH_ACCESS_KEY` | Unsplash API key | ✅ Yes |
| `VITE_INSTANT_APP_ID` | InstantDB app ID | ✅ Yes |

### Code Structure Pattern

**Components:** Organized by feature
```javascript
// Container (data + logic)
const Gallery = () => {
  const { images } = useInfiniteImages();
  return <GalleryView images={images} />;
};

// Presentation (UI only)
const GalleryView = ({ images }) => {
  return <div>{images.map(...)}</div>;
};
```

**Hooks:** Encapsulate logic
```javascript
// Custom hook handles all data/logic
const useImageInteractions = (imageId) => {
  const { data } = db.useQuery({...});
  const addReaction = () => {...};
  return { reactions, addReaction };
};
```

## 🎨 Customization

### Change Quick Reaction Emojis

Edit `src/utils/constants.js`:

```javascript
export const EMOJIS = ["❤️", "🔥", "👏", "😂", "😮"];
// Change to your preferred emojis
```

### Adjust Animation Speed

In components, change duration values:

```javascript
// Faster
className="transition-all duration-150"

// Slower
className="transition-all duration-500"
```

### Change Image Load Count

Edit `src/hooks/useInfiniteImages.js`:

```javascript
const fetchImages = async ({ pageParam = 1 }) => {
  const images = await unsplash.getImages(searchQuery, pageParam, 12);
  // Change 12 to load more/fewer images per page
};
```

## 🐛 Troubleshooting

**Images not loading?**
- Check Unsplash API key in `.env`
- Verify key is valid at unsplash.com/account

**Reactions not working?**
- Check InstantDB app ID in `.env`
- Ensure you're logged in (enter username)

**Slow performance?**
- Build for production: `npm run build`
- Check Network tab for heavy images

**Animations janky?**
- Check browser GPU acceleration
- Reduce animation complexity in CSS

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature-name`
5. Open Pull Request

## 📝 License

MIT License - feel free to use for learning and projects!

## 🙏 Credits

- **Images:** [Unsplash](https://unsplash.com)
- **Real-time DB:** [InstantDB](https://instantdb.com)
- **Icons:** [Lucide](https://lucide.dev)

---

**Built with ❤️ using React + InstantDB**

