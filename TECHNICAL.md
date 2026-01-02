# Technical Architecture Documentation

## 🎯 Core Principles

This application demonstrates professional React development practices:

1. **Separation of Concerns**: UI, business logic, and data management are clearly separated
2. **Performance First**: Optimizations applied where they matter (memoization, lazy loading)
3. **Real-time Architecture**: Built for collaborative experiences with InstantDB
4. **User Experience**: Every interaction is smooth, predictable, and delightful
5. **Code Quality**: Clean, maintainable, and well-documented code

---

## 📊 Real-Time State Management Deep Dive

### InstantDB: How It Works

**Query Pattern:**
```javascript
const { isLoading, error, data } = db.useQuery({
  reactions: {
    $: {
      where: { imageId },  // Filter by image
    },
  },
  comments: {
    $: {
      where: { imageId },
    },
  },
});
```

**What Happens:**
1. Component mounts → Query subscribes to database
2. Initial data fetched → Component renders
3. Other user makes change → Server pushes update
4. Query hook updates → Component re-renders
5. **Zero backend code required!**

**Mutation Pattern:**
```javascript
const addReaction = (emoji, imageUrl) => {
  const existingReaction = reactions.find(r => r.userId === userId);
  
  if (existingReaction) {
    if (existingReaction.emoji === emoji) {
      // Toggle off - delete reaction
      db.transact(db.tx.reactions[existingReaction.id].delete());
    } else {
      // Replace with new emoji
      db.transact(
        db.tx.reactions[existingReaction.id].update({
          emoji,
          createdAt: Date.now(),
        })
      );
    }
  } else {
    // Add new reaction
    db.transact(
      db.tx.reactions[uuidv4()].update({
        imageId,
        userId,
        userName,
        emoji,
        imageUrl,
        createdAt: Date.now(),
      })
    );
  }
};
```

**Why This Pattern:**
- **Idempotent**: Same action twice = same result
- **Optimistic**: UI updates immediately
- **Conflict-Free**: Server resolves with last-write-wins
- **WhatsApp-Style**: One emoji per user enforced in logic

---

## ⚛️ React Patterns Explained

### 1. Custom Hooks Architecture

**Pattern: Encapsulate Data + Logic**

```javascript
// ❌ BAD: Logic in component
const ImageModal = ({ image }) => {
  const [reactions, setReactions] = useState([]);
  
  useEffect(() => {
    // Fetch reactions...
    // Subscribe to updates...
    // Handle cleanup...
  }, [image.id]);
  
  const addReaction = () => {
    // Complex logic here...
  };
  
  // Component becomes bloated
};

// ✅ GOOD: Logic in custom hook
const useImageInteractions = (imageId) => {
  const { data } = db.useQuery({ /* ... */ });
  
  const addReaction = useCallback((emoji) => {
    // All logic here
  }, [/* deps */]);
  
  return { 
    reactions: data?.reactions || [],
    addReaction,
  };
};

const ImageModal = ({ image }) => {
  const { reactions, addReaction } = useImageInteractions(image.id);
  // Component stays clean!
};
```

**Benefits:**
- **Testable**: Hooks can be tested independently
- **Reusable**: Same hook in multiple components
- **Organized**: Related logic stays together
- **Maintainable**: Easy to find and modify

### 2. Memoization Strategy

**When to Use useMemo:**

```javascript
// ✅ GOOD: Expensive computation
const reactionCounts = useMemo(() => {
  return reactions.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});
}, [reactions]);

// ❌ BAD: Simple value
const userName = useMemo(() => user.name, [user.name]);
// Just use: const userName = user.name;

// ✅ GOOD: Derived data for child component
const sortedComments = useMemo(() => {
  return [...comments].sort((a, b) => b.createdAt - a.createdAt);
}, [comments]);

// ❌ BAD: No dependencies
const config = useMemo(() => ({ theme: 'dark' }), []);
// Just move outside component or use const
```

**When to Use useCallback:**

```javascript
// ✅ GOOD: Passed to memoized child
const handleClick = useCallback(() => {
  onClick(image);
}, [onClick, image]);

// ✅ GOOD: Dependency in useEffect
const fetchData = useCallback(async () => {
  const data = await api.fetch(id);
  setData(data);
}, [id]);

useEffect(() => {
  fetchData();
}, [fetchData]); // Stable reference

// ❌ BAD: Simple handler not passed down
const handleSubmit = useCallback(() => {
  setCount(count + 1);
}, [count]);
// Just use regular function if not memo'd child
```

### 3. Component Composition

**Pattern: Container vs Presentation**

```javascript
// Container (Smart Component)
const Gallery = ({ searchQuery }) => {
  // Data fetching
  const { images, hasNextPage, fetchNextPage } = useInfiniteImages(searchQuery);
  
  // State management
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Business logic
  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);
  
  return (
    <GalleryView
      images={images}
      viewMode={viewMode}
      onImageClick={handleImageClick}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
    />
  );
};

// Presentation (Dumb Component)
const GalleryView = ({ images, viewMode, onImageClick, onLoadMore, hasMore }) => {
  return (
    <div className={viewMode === 'grid' ? 'grid' : 'list'}>
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          viewMode={viewMode}
          onClick={onImageClick}
        />
      ))}
      {hasMore && <LoadMoreTrigger onInView={onLoadMore} />}
    </div>
  );
};
```

**Benefits:**
- **Testable**: Presentation components easy to test (pure)
- **Reusable**: Presentation can be used in different contexts
- **Maintainable**: Logic separated from UI

### 4. Effect Dependencies

**Understanding the Dependency Array:**

```javascript
// ❌ BAD: Missing dependencies
useEffect(() => {
  console.log(user.name);
}, []); // ESLint warning! user.name should be in deps

// ✅ GOOD: All dependencies listed
useEffect(() => {
  console.log(user.name);
}, [user.name]);

// ✅ GOOD: Stable reference with useCallback
const handleResize = useCallback(() => {
  setWidth(window.innerWidth);
}, []); // No deps needed

useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]); // Stable reference

// ✅ GOOD: Run once on mount (legitimate use)
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = 'unset';
  };
}, []); // Intentionally empty - cleanup on unmount
```

### 5. Refs for DOM Access

**Pattern: Avoid State for DOM Measurements**

```javascript
// ❌ BAD: Using state for DOM reference
const [inputElement, setInputElement] = useState(null);

useEffect(() => {
  if (inputElement) {
    inputElement.focus();
  }
}, [inputElement]);

return <input ref={setInputElement} />;

// ✅ GOOD: Use refs
const inputRef = useRef(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

return <input ref={inputRef} />;
```

**When to Use Refs:**
- DOM measurements (width, height)
- Focus management
- Scroll position
- Third-party library integration
- **Not** for values that should trigger re-renders

---

## 🎨 UX Decision-Making Process

### Decision Framework

For every UX decision, we consider:

1. **User Mental Model**: What does the user expect?
2. **Friction**: How many steps to accomplish the goal?
3. **Feedback**: Does the user know what happened?
4. **Discoverability**: Can users find this feature?
5. **Error Prevention**: Can we prevent mistakes?

### Case Study: WhatsApp-Style Reactions

**User Story:**
> "As a user, I want to react to an image quickly without overthinking my choice"

**Problem:**
- Traditional: Unlimited reactions → spam, unclear intent
- Alternative: Like only → limited expression

**Solution: One Emoji Per User**

**Decision Process:**

| Aspect | Consideration | Solution |
|--------|---------------|----------|
| **Simplicity** | Users understand "pick one" | Single selection enforced |
| **Feedback** | Users see their choice | Blue highlight + ring |
| **Change Mind** | Users can switch | Click different emoji → replaces |
| **Remove** | Users can undo | Click same emoji → toggle off |
| **Discovery** | Users find emoji picker | "+ Add" button visible |
| **Familiarity** | Users recognize pattern | WhatsApp/Discord model |

**Implementation:**

```javascript
// Find existing reaction
const existingReaction = reactions.find(r => r.userId === userId);

if (existingReaction) {
  if (existingReaction.emoji === emoji) {
    // Same emoji → Toggle off
    deleteReaction(existingReaction.id);
  } else {
    // Different emoji → Replace
    updateReaction(existingReaction.id, emoji);
  }
} else {
  // No reaction yet → Add
  addReaction(emoji);
}
```

**Visual Feedback:**

```javascript
const isUserReaction = userReaction?.emoji === emoji;

<button
  className={`
    ${isUserReaction
      ? 'bg-blue-600 ring-2 ring-blue-400/50 shadow-lg'
      : 'bg-gray-800 hover:bg-gray-700'
    }
  `}
>
```

**Result:**
- ✅ Clear user intent
- ✅ No spam
- ✅ Familiar pattern
- ✅ Visual feedback
- ✅ Easy to change/remove

### Animation Philosophy

**Principles:**

1. **Purpose**: Every animation should have a reason
2. **Duration**: 200-300ms for most interactions
3. **Easing**: Natural curves (cubic-bezier)
4. **Performance**: GPU-accelerated properties only
5. **Subtle**: Enhance, don't distract

**Animation Map:**

| Trigger | Effect | Duration | Purpose |
|---------|--------|----------|---------|
| Feed item appears | Fade + slide up | 50ms stagger | Draw attention, guide eye |
| Card hover | Lift + shadow | 300ms | Affordance (clickable) |
| Image hover | Zoom | 500ms | Preview, engagement |
| Emoji hover | Scale | 200ms | Playful, interactive |
| Modal open | Zoom + fade | 300ms | Focus attention |
| Comment delete | Opacity fade | 200ms | Gentle removal |

**Code Example:**

```javascript
// Staggered animation
{feedItems.map((item, index) => (
  <div
    key={item.id}
    style={{
      animationDelay: `${index * 50}ms`,
      animationFillMode: 'backwards'
    }}
    className="animate-in fade-in slide-in-from-bottom-3"
  >
```

**Why Stagger:**
- Creates cascading effect
- Guides user's eye sequentially
- Professional polish
- Prevents overwhelming information

---

## 🔍 Code Quality Patterns

### 1. Naming Conventions

```javascript
// ✅ GOOD: Clear, descriptive names
const handleSubmitComment = () => {};
const isUserComment = comment.userId === userId;
const sortedComments = useMemo(() => [...comments].sort(), [comments]);

// ❌ BAD: Unclear abbreviations
const hsc = () => {};
const flag = comment.userId === userId;
const sc = useMemo(() => [...comments].sort(), [comments]);
```

### 2. Early Returns

```javascript
// ✅ GOOD: Guard clauses
const ImageModal = ({ image, onClose }) => {
  if (!image) return null;
  
  // Main logic here
  return <div>...</div>;
};

// ❌ BAD: Nested conditionals
const ImageModal = ({ image, onClose }) => {
  return (
    <>
      {image && (
        <div>...</div>
      )}
    </>
  );
};
```

### 3. Destructuring

```javascript
// ✅ GOOD: Destructure for clarity
const { reactions, comments, addReaction, addComment, deleteComment } 
  = useImageInteractions(image.id);

// ❌ BAD: Repeated object access
const interactions = useImageInteractions(image.id);
const reactions = interactions.reactions;
const comments = interactions.comments;
```

### 4. Conditional Rendering

```javascript
// ✅ GOOD: Short-circuit for existence
{comments.length > 0 && <CommentList comments={comments} />}

// ✅ GOOD: Ternary for either/or
{isLoading ? <Spinner /> : <Content />}

// ❌ BAD: Nested ternaries
{isLoading ? <Spinner /> : hasError ? <Error /> : hasData ? <Content /> : <Empty />}

// ✅ GOOD: Multiple conditions with early return or variables
const renderContent = () => {
  if (isLoading) return <Spinner />;
  if (hasError) return <Error />;
  if (!hasData) return <Empty />;
  return <Content />;
};
```

### 5. Event Handler Naming

```javascript
// ✅ GOOD: handle + Action
const handleClick = () => {};
const handleSubmit = () => {};
const handleDeleteComment = (id) => {};

// ✅ GOOD: Props use on prefix
<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />

// ❌ BAD: Inconsistent naming
const clickHandler = () => {};
const doSubmit = () => {};
const delComment = (id) => {};
```

---

## 🚀 Performance Optimization Checklist

### ✅ Implemented

- [x] useMemo for derived state
- [x] useCallback for stable references
- [x] React.memo for pure components
- [x] Lazy loading images (`loading="lazy"`)
- [x] Intersection Observer (not scroll listeners)
- [x] GPU-accelerated animations (transform, opacity)
- [x] Debounced search input
- [x] Conditional rendering (don't mount hidden components)
- [x] Key props for list items
- [x] Single state updates (batch when possible)

### 🎯 Measurement Points

```javascript
// Performance marks
performance.mark('gallery-render-start');
// ... render
performance.mark('gallery-render-end');
performance.measure('gallery-render', 'gallery-render-start', 'gallery-render-end');
```

### 📊 Metrics to Track

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

---

## 🧪 Testing Strategy

### Unit Tests (Recommended)

```javascript
describe('useImageInteractions', () => {
  it('should add reaction when user has no existing reaction', () => {
    // Arrange
    const { result } = renderHook(() => useImageInteractions('image-1'));
    
    // Act
    act(() => {
      result.current.addReaction('❤️');
    });
    
    // Assert
    expect(result.current.reactions).toHaveLength(1);
    expect(result.current.reactions[0].emoji).toBe('❤️');
  });
  
  it('should replace reaction when user clicks different emoji', () => {
    // Test implementation
  });
});
```

### Integration Tests

```javascript
describe('ImageModal', () => {
  it('should add comment and display it', async () => {
    // Render with fake data
    const { getByPlaceholderText, getByText } = render(
      <ImageModal image={mockImage} onClose={jest.fn()} />
    );
    
    // Type comment
    const input = getByPlaceholderText('Add a comment...');
    fireEvent.change(input, { target: { value: 'Great photo!' } });
    
    // Submit
    fireEvent.submit(input);
    
    // Verify
    await waitFor(() => {
      expect(getByText('Great photo!')).toBeInTheDocument();
    });
  });
});
```

---

## 📖 Further Reading

- [React Hooks Explained](https://react.dev/reference/react)
- [InstantDB Documentation](https://www.instantdb.com/docs)
- [Web Performance Optimization](https://web.dev/performance/)
- [Accessible UI Patterns](https://www.a11yproject.com/)

---

**Last Updated**: January 2026
