# InterfaceHive Developer Guide

Welcome to the InterfaceHive Developer Guide! This comprehensive documentation will help you understand, navigate, and contribute to the InterfaceHive platform.

## What is InterfaceHive?

InterfaceHive is a contribution marketplace platform that connects project hosts with contributors using a credit-based reputation system. It enables collaborative software development through structured contribution workflows, gamification, and AI-powered project generation.

## Who is this guide for?

This guide is designed for:
- New developers joining the InterfaceHive team
- Contributors wanting to understand the codebase architecture
- Developers looking to extend or customize the platform
- Anyone interested in learning modern full-stack development patterns

## How to use this guide

This guide is organized into progressive sections, from basic setup to advanced topics. We recommend reading in order if you're new to the project:

1. **Getting Started** - Set up your development environment and understand the tech stack
2. **Architecture** - Learn the overall system design and component interactions
3. **Core Features** - Deep dive into each major feature and its implementation
4. **Advanced Topics** - Explore complex patterns, edge cases, and optimization strategies
5. **API Reference** - Comprehensive API documentation with examples
6. **Best Practices** - Code style, testing, and security guidelines

## Table of Contents

### 01. Getting Started

Essential information to get you up and running quickly.

- **[Setup Guide](01-getting-started/setup.md)**
  - Environment setup step-by-step
  - Docker, PostgreSQL, Redis configuration
  - Running backend and frontend servers
  - Creating test data and superuser
  - Common troubleshooting

- **[Tech Stack Overview](01-getting-started/tech-stack.md)**
  - Why we chose each technology
  - Backend: Django, DRF, PostgreSQL, Redis, Celery, Channels
  - Frontend: React, TypeScript, Vite, TanStack Query, shadcn/ui
  - Advanced features and edge cases for each technology
  - Performance characteristics and optimization tips

- **[Project Structure](01-getting-started/project-structure.md)**
  - Directory layout and organization
  - Backend apps and their responsibilities
  - Frontend module organization
  - Key files and their purposes
  - Navigation tips for the codebase

### 02. Architecture

Understanding the system design and how components interact.

- **[Architecture Overview](02-architecture/overview.md)**
  - High-level system architecture diagram
  - Request/response flow
  - Data layer and caching strategy
  - WebSocket communication
  - External service integrations

- **[Backend Architecture](02-architecture/backend-architecture.md)**
  - Django app structure and design principles
  - Service layer pattern
  - API versioning strategy
  - ASGI server (Daphne) and WebSocket handling
  - Celery task queue architecture
  - Database connection pooling

- **[Frontend Architecture](02-architecture/frontend-architecture.md)**
  - React component hierarchy
  - State management strategy (TanStack Query + Context)
  - Routing and code splitting
  - API client architecture and token management
  - Form handling with react-hook-form + Zod
  - UI component library (shadcn/ui)

- **[Database Design](02-architecture/database-design.md)**
  - Entity-Relationship diagram
  - Table schemas and relationships
  - Indexing strategy (B-tree, GIN, composite)
  - Constraints and data integrity
  - Soft delete implementation
  - GDPR compliance considerations

### 03. Core Features

Deep dives into each major feature with code examples and edge cases.

- **[Authentication System](03-core-features/authentication.md)**
  - JWT token flow and lifecycle
  - Email verification process
  - Token refresh mechanism
  - Frontend token interceptor
  - Edge cases: token expiration, concurrent requests, logout
  - Security considerations

- **[Project Management](03-core-features/project-management.md)**
  - Project creation and validation
  - Status lifecycle (draft → open → closed)
  - Full-text search with GIN indexes
  - Tag management and normalization
  - AI-generated projects
  - Edge cases: concurrent updates, duplicate tags

- **[Contribution Workflow](03-core-features/contribution-workflow.md)**
  - State machine (pending → accepted/declined)
  - Submission validation
  - Approval process with atomic transactions
  - Notification system
  - Edge cases: duplicate contributions, race conditions, rollback scenarios

- **[Credit System](03-core-features/credit-system.md)**
  - Immutable ledger design
  - Credit calculation and types (award, reversal, adjustment)
  - XP and leveling formula
  - Reputation score calculation
  - Edge cases: concurrent credits, reversals, integrity checks

- **[Badge System](03-core-features/badge-system.md)**
  - Badge types and tiers
  - Criteria and unlock conditions
  - Progress tracking
  - Secret badges
  - Edge cases: concurrent unlocks, progress rollback

- **[AI Integration](03-core-features/ai-integration.md)**
  - Google Gemini API integration
  - Project template generation
  - Prompt engineering
  - Error handling and retries
  - Cost optimization

### 04. Advanced Topics

Complex patterns, edge cases, and optimization strategies.

- **[Atomic Transactions](04-advanced-topics/atomic-transactions.md)**
  - ACID properties explained
  - Django's `@transaction.atomic` decorator
  - Transaction isolation levels
  - Nested transactions and savepoints
  - `on_commit` hooks for async tasks
  - Deadlock prevention strategies
  - Edge cases: rollback scenarios, concurrent transactions

- **[Full-Text Search](04-advanced-topics/full-text-search.md)**
  - PostgreSQL GIN indexes explained
  - SearchVector weighting system
  - Multi-language support (English, Korean)
  - Query optimization and performance tuning
  - Fallback strategies
  - Edge cases: special characters, case sensitivity

- **[WebSocket Chat](04-advanced-topics/websocket-chat.md)**
  - Django Channels architecture
  - Consumer implementation
  - Channel layers and Redis backend
  - Message routing and broadcasting
  - Connection lifecycle management
  - Edge cases: reconnection, message ordering

- **[Caching Strategies](04-advanced-topics/caching-strategies.md)**
  - TanStack Query caching patterns
  - Redis caching for backend
  - Cache invalidation strategies
  - Optimistic updates
  - staleTime vs cacheTime
  - Edge cases: cache race conditions, memory management

- **[Performance Optimization](04-advanced-topics/performance-optimization.md)**
  - N+1 query problem and solutions
  - Database query optimization
  - Index selection and analysis
  - Frontend bundle optimization
  - React rendering optimization
  - Profiling tools and techniques

### 05. API Reference

Comprehensive API documentation with request/response examples.

- **[REST API](05-api-reference/rest-api.md)**
  - Authentication endpoints
  - Project endpoints
  - Contribution endpoints
  - Credit endpoints
  - Badge endpoints
  - Admin endpoints
  - Request/response examples
  - Pagination and filtering

- **[WebSocket API](05-api-reference/websocket-api.md)**
  - Connection protocol
  - Message formats
  - Event types
  - Authentication
  - Error handling

- **[Error Handling](05-api-reference/error-handling.md)**
  - Standard error response format
  - HTTP status codes
  - Error codes and meanings
  - Validation errors
  - Retry strategies

### 06. Best Practices

Guidelines for writing high-quality, maintainable code.

- **[Code Style](06-best-practices/code-style.md)**
  - Backend: Black, isort, Flake8 configuration
  - Frontend: ESLint, Prettier, TypeScript conventions
  - Naming conventions
  - File organization
  - Comment guidelines
  - Import order

- **[Testing](06-best-practices/testing.md)**
  - Backend: pytest, fixtures, factories
  - Frontend: React Testing Library, Vitest
  - Test organization and naming
  - Coverage requirements
  - Integration vs unit tests
  - Mocking strategies

- **[Security](06-best-practices/security.md)**
  - OWASP Top 10 considerations
  - JWT security best practices
  - SQL injection prevention
  - XSS protection
  - CSRF protection
  - Rate limiting
  - GDPR compliance

### Diagrams

Visual representations of system architecture and workflows.

- **[Architecture Overview](diagrams/architecture-overview.mmd)** - Complete system architecture
- **[Data Flow](diagrams/data-flow.mmd)** - Request/response flow through the stack
- **[Contribution Workflow](diagrams/contribution-workflow.mmd)** - Detailed contribution state machine
- **[Credit Transaction](diagrams/credit-transaction.mmd)** - Atomic credit award process
- **[Database Schema](diagrams/database-schema.mmd)** - Complete ER diagram

## Quick Links

- **Main Project README**: [/README.md](../../README.md)
- **PRD**: [/prd.md](../../prd.md)
- **CLAUDE.md**: [/CLAUDE.md](../../CLAUDE.md)
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin/

## Contributing to this Guide

Found something unclear or want to add more documentation? Contributions to this guide are welcome!

1. Documentation should be clear and concise
2. Include code examples with explanatory comments
3. Cover edge cases and common pitfalls
4. Update diagrams when architecture changes
5. Keep examples up-to-date with the codebase

## Getting Help

If you have questions not covered in this guide:

1. Check the API documentation at `/api/docs/`
2. Review the existing codebase for similar patterns
3. Ask the team in the project chat
4. Create an issue with the `documentation` label

## Version History

- **v1.0** (2026-01-18) - Initial comprehensive developer guide

---

Let's build something amazing together!
