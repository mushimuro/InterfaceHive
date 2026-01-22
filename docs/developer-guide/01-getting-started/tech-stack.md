# Tech Stack Overview

This document explains the technologies used in InterfaceHive, why we chose them, and their advanced features and edge cases.

## Philosophy

InterfaceHive's tech stack was chosen based on these principles:

1. **Developer Experience** - Tools that are enjoyable and productive to work with
2. **Type Safety** - Catch errors at compile time, not runtime
3. **Performance** - Fast response times and efficient resource usage
4. **Scalability** - Ability to handle growing user base and data
5. **Modern Patterns** - Leverage the latest best practices in web development

## Backend Stack

### Python 3.12.9

**Why Python?**
- Excellent for rapid development and prototyping
- Rich ecosystem of libraries
- Strong typing support (with type hints)
- Great for data processing and async tasks

**Key Features:**
- **Structural Pattern Matching** (Python 3.10+): Clean match/case statements
- **Type Hints**: Enhanced type system for better IDE support
- **AsyncIO**: Native async/await for concurrent operations
- **Performance**: ~15% faster than Python 3.11

**Edge Cases:**
- **GIL (Global Interpreter Lock)**: Single-threaded execution within a process
  - **Solution**: Use Celery for CPU-bound tasks, leverage I/O-bound operations
- **Memory Usage**: Python uses more memory than compiled languages
  - **Solution**: Use generators, lazy evaluation, and proper garbage collection
- **Type Checking**: Optional at runtime, requires mypy for static analysis
  - **Solution**: Run `mypy` in CI/CD pipeline

### Django 5.0.1

**Why Django?**
- "Batteries included" - comes with everything needed
- Excellent ORM with query optimization
- Built-in admin panel for data management
- Strong security defaults (CSRF, XSS, SQL injection protection)
- Mature ecosystem with extensive documentation

**Key Features:**
- **ORM**: Intuitive database queries with automatic SQL generation
- **Migrations**: Version-controlled database schema changes
- **Admin**: Auto-generated admin interface
- **Auth System**: User authentication and permissions
- **Form Handling**: Validation and rendering
- **Security**: CSRF tokens, password hashing, clickjacking protection

**Advanced Django Patterns:**

```python
# Efficient QuerySet usage
# ❌ Bad: N+1 query problem
for project in Project.objects.all():
    print(project.host_user.display_name)  # Separate query per project

# ✅ Good: Select related (foreign keys)
projects = Project.objects.select_related('host_user').all()
for project in projects:
    print(project.host_user.display_name)  # Single JOIN query

# ✅ Good: Prefetch related (many-to-many, reverse foreign keys)
projects = Project.objects.prefetch_related('contributions__contributor_user').all()
```

**Edge Cases:**
- **QuerySet Evaluation**: Lazy evaluation can surprise developers
  ```python
  qs = Project.objects.all()  # No database query yet
  list(qs)  # Query executed now
  len(qs)   # Query executed again!

  # Solution: Cache queryset or use qs.count()
  ```
- **Transaction Rollback**: Failed transactions don't revert Python state
  ```python
  @transaction.atomic
  def create_project(data):
      project = Project.objects.create(**data)
      some_list.append(project)  # This persists even if transaction fails!
      raise Exception("Rollback")  # DB rolled back, but some_list still modified
  ```
- **Auto-commit**: Each query is a transaction by default
  - **Solution**: Use `@transaction.atomic` for multiple operations

### Django REST Framework 3.14

**Why DRF?**
- De facto standard for Django REST APIs
- Powerful serialization system
- Built-in authentication (JWT, session, token)
- Browsable API for development
- Excellent pagination and filtering

**Key Features:**
- **Serializers**: Convert Django models to JSON and vice versa
- **ViewSets**: CRUD operations with minimal code
- **Authentication**: Multiple schemes (JWT, session, token, OAuth)
- **Permissions**: Fine-grained access control
- **Throttling**: Rate limiting for API endpoints

**Serializer Patterns:**

```python
# Read-only vs write-only fields
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Never in response
    reputation_score = serializers.FloatField(read_only=True)  # Never in request

    class Meta:
        model = User
        fields = ['email', 'password', 'display_name', 'reputation_score']

# Nested serializers for complex objects
class ProjectDetailSerializer(serializers.ModelSerializer):
    host_user = UserSerializer(read_only=True)  # Nested user data
    contributions = ContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
```

**Edge Cases:**
- **Serializer Validation Order**: Field validation → Validator functions → `validate()` method
- **Performance**: Nested serializers can cause N+1 queries
  ```python
  # Solution: Use select_related/prefetch_related in ViewSet
  queryset = Project.objects.select_related('host_user').prefetch_related('contributions')
  ```
- **File Uploads**: Requires special handling for multipart/form-data
  ```python
  class ProjectSerializer(serializers.ModelSerializer):
      image = serializers.ImageField(use_url=True, required=False)
  ```

### PostgreSQL 16

**Why PostgreSQL?**
- Most advanced open-source relational database
- Full-text search with GIN indexes
- JSON support (JSONB columns)
- Excellent performance and reliability
- ACID compliance with transaction isolation

**Key Features:**
- **JSONB**: Binary JSON storage with indexing
- **GIN Indexes**: Generalized Inverted Index for full-text search
- **Full-Text Search**: Built-in search capabilities
- **Window Functions**: Advanced analytics queries
- **CTEs**: Common Table Expressions for complex queries
- **Row-Level Security**: Fine-grained access control

**InterfaceHive Usage:**

```python
# Full-text search with SearchVector
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class Project(models.Model):
    search_vector = SearchVectorField(null=True)

    class Meta:
        indexes = [
            GinIndex(fields=['search_vector'])  # Fast text search
        ]

# JSONB for flexible data
class User(models.Model):
    reputation_data = models.JSONField(default=dict)  # Stores XP, level, stats
```

**Edge Cases:**
- **GIN Index Size**: Can be 2-3x larger than B-tree indexes
  - **Trade-off**: Slower writes, faster searches
- **Connection Pooling**: Default max 100 connections
  ```python
  # settings.py
  DATABASES = {
      'default': {
          'CONN_MAX_AGE': 600,  # Reuse connections for 10 minutes
      }
  }
  ```
- **Query Performance**: `EXPLAIN ANALYZE` shows actual vs estimated rows
  ```sql
  EXPLAIN ANALYZE SELECT * FROM projects_project WHERE search_vector @@ to_tsquery('react');
  ```
- **Vacuum**: Needs periodic vacuuming to reclaim space
  - **Solution**: Auto-vacuum is enabled by default in PostgreSQL 16

### Redis 7

**Why Redis?**
- In-memory data store for ultra-fast access
- Cache frequently accessed data
- Message broker for Celery tasks
- Session storage
- Rate limiting

**Key Features:**
- **Data Structures**: Strings, hashes, lists, sets, sorted sets
- **Pub/Sub**: Real-time messaging
- **Persistence**: Optional disk snapshots (RDB) or append-only file (AOF)
- **Expiration**: Automatic key expiry
- **Atomic Operations**: Thread-safe increments, etc.

**InterfaceHive Usage:**

```python
# Cache project list
from django.core.cache import cache

def get_project_list():
    cache_key = 'project_list'
    projects = cache.get(cache_key)

    if projects is None:
        projects = list(Project.objects.all().values())
        cache.set(cache_key, projects, timeout=300)  # 5 minutes

    return projects

# Invalidate cache on update
def update_project(project_id, data):
    project = Project.objects.get(id=project_id)
    project.title = data['title']
    project.save()

    cache.delete('project_list')  # Invalidate cache
```

**Edge Cases:**
- **Memory Limits**: Redis stores everything in RAM
  - **Solution**: Set `maxmemory` and eviction policy in redis.conf
  ```
  maxmemory 256mb
  maxmemory-policy allkeys-lru  # Evict least recently used
  ```
- **Persistence Trade-offs**:
  - RDB: Fast, but can lose data between snapshots
  - AOF: Slower, but more durable
  - **Our choice**: RDB for development, AOF for production
- **Key Expiration**: Not guaranteed to happen at exact time
  - **Solution**: Check expiry in application logic if timing is critical

### Celery 5.3

**Why Celery?**
- Distributed task queue for async operations
- Reliable retry mechanisms
- Scheduled tasks (cron-like)
- Real-time monitoring
- Scales horizontally

**Key Features:**
- **Task Queues**: Distribute work across workers
- **Retries**: Automatic retry with exponential backoff
- **Scheduling**: Periodic tasks with Celery Beat
- **Result Backend**: Store task results
- **Monitoring**: Flower for web-based monitoring

**InterfaceHive Usage:**

```python
# apps/contributions/tasks.py
from celery import shared_task

@shared_task(
    bind=True,
    autoretry_for=(SMTPException,),  # Retry on email failures
    retry_kwargs={'max_retries': 3, 'countdown': 60},  # 3 retries, 1 minute apart
    retry_backoff=True  # Exponential backoff
)
def send_contribution_notification(self, contribution_id):
    """
    Send email when contribution is accepted/declined.

    Retries automatically on SMTP failures.
    """
    contribution = Contribution.objects.get(id=contribution_id)
    send_mail(
        subject=f'Contribution {contribution.status}',
        message=f'Your contribution has been {contribution.status}.',
        from_email='noreply@interfacehive.com',
        recipient_list=[contribution.contributor_user.email]
    )
```

**Edge Cases:**
- **Task Serialization**: Only JSON-serializable arguments
  ```python
  # ❌ Bad: Can't serialize Django model
  send_email.delay(user_object)

  # ✅ Good: Pass primary key
  send_email.delay(user_id=user.id)
  ```
- **Idempotency**: Tasks may execute multiple times
  ```python
  @shared_task
  def award_credit(contribution_id):
      # Check if credit already awarded
      if CreditLedgerEntry.objects.filter(contribution_id=contribution_id).exists():
          return  # Already processed, skip

      # Award credit...
  ```
- **Long-Running Tasks**: May timeout
  - **Solution**: Break into smaller tasks or increase timeout
  ```python
  @shared_task(time_limit=300, soft_time_limit=270)  # 4.5 minute soft limit, 5 minute hard limit
  def process_large_dataset():
      # ...
  ```

### Django Channels 4.0

**Why Channels?**
- WebSocket support for Django
- Real-time bidirectional communication
- Async Django views (ASGI)
- Channel layers for message passing

**Key Features:**
- **Consumers**: WebSocket request handlers
- **Channel Layers**: Distributed messaging with Redis
- **Routing**: WebSocket URL patterns
- **Authentication**: Integrate with Django auth

**InterfaceHive Usage:**

```python
# apps/chat/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'chat_{self.project_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def receive_json(self, content):
        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': content['message'],
                'user': self.scope['user'].display_name
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send_json({
            'message': event['message'],
            'user': event['user']
        })
```

**Edge Cases:**
- **Connection Limits**: Too many open WebSocket connections
  - **Solution**: Horizontal scaling with Redis channel layer
- **Memory Leaks**: Connections not properly closed
  ```python
  async def disconnect(self, close_code):
      await self.channel_layer.group_discard(
          self.room_group_name,
          self.channel_name
      )
  ```
- **Message Ordering**: Not guaranteed across multiple workers
  - **Solution**: Include timestamps in messages

## Frontend Stack

### React 19

**Why React?**
- Most popular UI library with huge ecosystem
- Component-based architecture
- Virtual DOM for efficient updates
- Concurrent rendering for better UX
- Strong TypeScript support

**Key Features (React 19):**
- **Server Components**: Render on server, reduce bundle size
- **Concurrent Rendering**: Non-blocking UI updates
- **Automatic Batching**: Group state updates for performance
- **Transitions**: Smooth UI transitions without blocking
- **Suspense**: Declarative loading states

**React 19 New Features:**

```typescript
// Transitions for non-urgent updates
import { useTransition } from 'react';

function SearchProjects() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (value: string) => {
    setQuery(value);  // Urgent: Update input immediately

    startTransition(() => {
      // Non-urgent: Update results without blocking input
      setResults(searchProjects(value));
    });
  };

  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </div>
  );
}
```

**Edge Cases:**
- **Stale Closures**: Functions capture old state values
  ```typescript
  // ❌ Bad: count is stale in setTimeout
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setTimeout(() => console.log(count), 1000);  // Always logs 0
  };

  // ✅ Good: Use ref or functional update
  const countRef = useRef(count);
  useEffect(() => { countRef.current = count; }, [count]);
  ```
- **Memory Leaks**: Unmounted components updating state
  ```typescript
  useEffect(() => {
    let cancelled = false;

    fetchData().then(data => {
      if (!cancelled) {
        setData(data);
      }
    });

    return () => { cancelled = true; };  // Cleanup
  }, []);
  ```

### TypeScript 5.9

**Why TypeScript?**
- Type safety catches bugs at compile time
- Better IDE autocomplete and refactoring
- Self-documenting code
- Easier to maintain large codebases

**Key Features:**
- **Static Typing**: Catch errors before runtime
- **Interfaces and Types**: Define data shapes
- **Generics**: Reusable typed functions
- **Union Types**: Multiple possible types
- **Type Inference**: Automatic type detection

**InterfaceHive TypeScript Patterns:**

```typescript
// API response types
interface Project {
  id: string;
  title: string;
  description: string;
  host_user: User;
  status: 'draft' | 'open' | 'closed';  // Union type
  created_at: string;
}

// Generic API response
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Type-safe API client
async function getProject(id: string): Promise<ApiResponse<Project>> {
  const response = await axios.get<ApiResponse<Project>>(`/projects/${id}/`);
  return response.data;
}

// Discriminated unions for state
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function ProjectDetail({ id }: { id: string }) {
  const [state, setState] = useState<RequestState<Project>>({ status: 'idle' });

  // TypeScript knows state.data exists only when status is 'success'
  if (state.status === 'success') {
    return <div>{state.data.title}</div>;
  }
}
```

**Edge Cases:**
- **Type Assertions**: Can bypass type checking
  ```typescript
  const data = response.data as Project;  // Dangerous! Type not verified

  // Better: Use type guards
  function isProject(data: any): data is Project {
    return typeof data.title === 'string' && typeof data.id === 'string';
  }
  ```
- **Any Type**: Disables type checking
  ```typescript
  // ❌ Bad: Defeats purpose of TypeScript
  const data: any = response.data;

  // ✅ Good: Use unknown and type guards
  const data: unknown = response.data;
  if (isProject(data)) {
    console.log(data.title);  // Safe
  }
  ```

### Vite 7.2

**Why Vite?**
- Lightning-fast HMR (Hot Module Replacement)
- Native ESM (no bundling in dev)
- Optimized production builds with Rollup
- Built-in TypeScript support
- Plugin ecosystem

**Key Features:**
- **Instant Server Start**: No bundling in development
- **Fast HMR**: ~10ms updates
- **Code Splitting**: Automatic chunk optimization
- **Asset Handling**: Images, fonts, CSS
- **Environment Variables**: VITE_ prefix

**Edge Cases:**
- **Environment Variables**: Must start with `VITE_`
  ```typescript
  // ✅ Accessible
  console.log(import.meta.env.VITE_API_BASE_URL);

  // ❌ Not accessible
  console.log(import.meta.env.API_KEY);  // Undefined
  ```
- **Dynamic Imports**: Path must be partially static
  ```typescript
  // ❌ Won't work
  const module = await import(dynamicPath);

  // ✅ Works
  const module = await import(`./components/${componentName}.tsx`);
  ```

### TanStack Query 5.90 (React Query)

**Why TanStack Query?**
- Simplifies server state management
- Built-in caching and invalidation
- Automatic background refetching
- Optimistic updates
- Request deduplication

**Key Features:**
- **Queries**: Fetch and cache data
- **Mutations**: Update server data
- **Invalidation**: Smart cache updates
- **Prefetching**: Load data before needed
- **Pagination**: Built-in support

**InterfaceHive Patterns:**

```typescript
// Query with caching
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000,  // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),  // Exponential backoff
  });
}

// Mutation with optimistic update
export function useAcceptContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptContribution(id),

    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['contributions', id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['contributions', id]);

      // Optimistically update
      queryClient.setQueryData(['contributions', id], (old: any) => ({
        ...old,
        status: 'accepted'
      }));

      return { previous };
    },

    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(['contributions', id], context?.previous);
    },

    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    }
  });
}
```

**Edge Cases:**
- **Cache Keys**: Must be unique and consistent
  ```typescript
  // ❌ Bad: Keys not consistent
  useQuery({ queryKey: ['projects', id, { sort: 'asc' }] });
  useQuery({ queryKey: ['projects', { sort: 'asc' }, id] });  // Different cache!

  // ✅ Good: Consistent key structure
  useQuery({ queryKey: ['projects', id, { sort: 'asc' }] });
  ```
- **Stale While Revalidate**: Shows cached data while refetching
  ```typescript
  const { data, isLoading, isFetching } = useQuery(...);
  // isLoading: true only on first fetch
  // isFetching: true on background refetch
  ```

### shadcn/ui + Radix UI

**Why shadcn/ui?**
- Copy-paste components (not npm package)
- Full control over code
- Built on Radix UI (accessible primitives)
- Tailwind CSS styling
- TypeScript support

**Key Features:**
- **Accessibility**: ARIA attributes, keyboard navigation
- **Unstyled Primitives**: Style however you want
- **Composable**: Build complex UIs from simple parts
- **Dark Mode**: Built-in support

**Edge Cases:**
- **Portal Conflicts**: Modals and dropdowns may conflict
  - **Solution**: Use proper z-index layering
- **Focus Management**: Must handle focus trapping
  ```typescript
  <Dialog.Root>
    <Dialog.Trigger />
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>  {/* Focus trapped here */}
        <Dialog.Close />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  ```

## Infrastructure

### Docker Compose

**Why Docker Compose?**
- Consistent development environment
- Easy service orchestration
- Isolated dependencies
- Simple setup for new developers

**Edge Cases:**
- **Volume Permissions**: File ownership issues on Linux
  - **Solution**: Match UID/GID in container
- **Port Conflicts**: Services already running on host
  - **Solution**: Change port mapping in docker-compose.yml

### JWT (JSON Web Tokens)

**Why JWT?**
- Stateless authentication
- No server-side session storage
- Cross-domain support
- Mobile-friendly

**Edge Cases:**
- **Token Size**: Can get large with many claims
  - **Solution**: Keep claims minimal
- **Revocation**: Can't invalidate until expiry
  - **Solution**: Short expiry + refresh tokens
- **Secret Key**: Must be kept secure
  - **Solution**: Environment variable, never commit

## Summary

InterfaceHive's tech stack provides:

- **Type Safety**: TypeScript + Python type hints
- **Performance**: React 19, Vite, PostgreSQL, Redis
- **Scalability**: Celery, Channels, horizontal scaling
- **Developer Experience**: Hot reload, API docs, admin panel
- **Modern Patterns**: React hooks, Django service layer, async tasks

Understanding these technologies and their edge cases will help you write robust, performant code.

## Next Steps

- [Project Structure](project-structure.md) - Navigate the codebase
- [Architecture Overview](../02-architecture/overview.md) - See how it all fits together
