# i18n Usage Guide - Translating Your Components

## Quick Start

### 1. Import the hook

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Use in your component

```typescript
const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('projects.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

## Available Translation Keys

### Navigation (nav.*)
- `nav.projects`, `nav.myProjects`, `nav.contributions`
- `nav.signin`, `nav.signout`, `nav.getStarted`
- `nav.profile`, `nav.credits`

### Authentication (auth.*)
- `auth.login`, `auth.register`, `auth.loginTitle`
- `auth.email`, `auth.password`, `auth.confirmPassword`
- `auth.emailPlaceholder`, `auth.passwordPlaceholder`
- `auth.loginButton`, `auth.registerButton`
- `auth.loginSuccess`, `auth.registerSuccess`
- `auth.alreadyHaveAccount`, `auth.dontHaveAccount`

### Projects (projects.*)
- `projects.title`, `projects.createProject`, `projects.editProject`
- `projects.projectTitle`, `projects.description`
- `projects.searchPlaceholder`, `projects.noProjects`
- `projects.createButton`, `projects.updateButton`, `projects.cancelButton`
- `projects.viewProject`, `projects.deleteProject`
- `projects.contributors`, `projects.acceptedContributors`

### Contributions (contributions.*)
- `contributions.title`, `contributions.myContributions`
- `contributions.submitContribution`, `contributions.proposal`
- `contributions.pending`, `contributions.accepted`, `contributions.declined`
- `contributions.approve`, `contributions.decline`, `contributions.withdraw`

### Profile (profile.*)
- `profile.title`, `profile.editProfile`, `profile.viewProfile`
- `profile.displayName`, `profile.email`, `profile.bio`
- `profile.skills`, `profile.githubUrl`, `profile.portfolioUrl`
- `profile.save`, `profile.profileUpdated`

### Credits (credits.*)
- `credits.title`, `credits.myCredits`, `credits.totalCredits`
- `credits.creditHistory`, `credits.earnedCredits`

### Chat (chat.*)
- `chat.title`, `chat.sendMessage`, `chat.messagePlaceholder`
- `chat.noMessages`, `chat.online`, `chat.offline`

### Common (common.*)
- `common.loading`, `common.save`, `common.cancel`, `common.delete`
- `common.edit`, `common.submit`, `common.back`, `common.next`
- `common.search`, `common.filter`, `common.sort`
- `common.yes`, `common.no`, `common.ok`, `common.confirm`
- `common.noResults`, `common.tryAgain`, `common.goHome`

### Errors (errors.*)
- `errors.generic`, `errors.network`, `errors.unauthorized`
- `errors.notFound`, `errors.serverError`
- `errors.required`, `errors.invalidEmail`, `errors.passwordMismatch`

### Success (success.*)
- `success.saved`, `success.updated`, `success.deleted`
- `success.created`, `success.submitted`

## Examples

### Example 1: Login Page

```typescript
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('auth.loginTitle')}</h1>
      <p>{t('auth.loginSubtitle')}</p>
      
      <form>
        <label>{t('auth.email')}</label>
        <input placeholder={t('auth.emailPlaceholder')} />
        
        <label>{t('auth.password')}</label>
        <input placeholder={t('auth.passwordPlaceholder')} />
        
        <button>{t('auth.loginButton')}</button>
      </form>
      
      <p>
        {t('auth.dontHaveAccount')}{' '}
        <Link to="/register">{t('auth.register')}</Link>
      </p>
    </div>
  );
};
```

### Example 2: Project Card

```typescript
const ProjectCard = ({ project }) => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle> {/* User content - don't translate */}
      </CardHeader>
      <CardContent>
        <p>{project.description}</p> {/* User content - don't translate */}
      </CardContent>
      <CardFooter>
        <Button>{t('projects.viewProject')}</Button>
        <Button>{t('projects.editProjectBtn')}</Button>
      </CardFooter>
    </Card>
  );
};
```

### Example 3: Error Message

```typescript
const handleSubmit = async () => {
  try {
    await submitData();
    toast.success(t('success.submitted'));
  } catch (error) {
    if (error.status === 401) {
      toast.error(t('errors.unauthorized'));
    } else if (error.status === 404) {
      toast.error(t('errors.notFound'));
    } else {
      toast.error(t('errors.generic'));
    }
  }
};
```

### Example 4: Loading States

```typescript
const MyComponent = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery('projects', fetchProjects);
  
  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }
  
  if (!data || data.length === 0) {
    return (
      <div>
        <p>{t('projects.noProjects')}</p>
        <p>{t('projects.noProjectsDesc')}</p>
        <Button>{t('projects.createFirst')}</Button>
      </div>
    );
  }
  
  return <div>{/* render projects */}</div>;
};
```

### Example 5: Confirmation Dialogs

```typescript
const deleteProject = () => {
  if (window.confirm(t('projects.deleteConfirm'))) {
    // Delete project
    toast.success(t('projects.projectDeleted'));
  }
};
```

### Example 6: Form Placeholders

```typescript
<Input
  label={t('projects.projectTitle')}
  placeholder={t('projects.projectTitlePlaceholder')}
/>

<Textarea
  label={t('projects.description')}
  placeholder={t('projects.descriptionPlaceholder')}
/>
```

## What NOT to Translate

❌ **User-generated content** (keep original):
- Project titles
- Project descriptions
- User comments
- Chat messages
- User names
- User bios

✅ **System UI text** (translate):
- Buttons
- Labels
- Placeholders
- Error messages
- Success messages
- Navigation items
- Form labels

## Dynamic Content with Interpolation

Use `{{variable}}` for dynamic values:

```typescript
// Translation file
{
  "welcome": "Welcome, {{name}}!",
  "creditsCount": "You have {{count}} credits"
}

// Usage
<h1>{t('welcome', { name: user.displayName })}</h1>
<p>{t('creditsCount', { count: user.totalCredits })}</p>
```

## Pluralization

```typescript
// Translation file (English)
{
  "items": "{{count}} item",
  "items_other": "{{count}} items"
}

// Translation file (Korean - no plural)
{
  "items": "{{count}}개의 항목"
}

// Usage
<p>{t('items', { count: projectCount })}</p>
// English: "1 item" or "5 items"
// Korean: "1개의 항목" or "5개의 항목"
```

## Quick Conversion Checklist

When translating a component:

1. ✅ Import `useTranslation`
2. ✅ Call `const { t } = useTranslation()`
3. ✅ Replace hardcoded text with `{t('key')}`
4. ✅ Keep user content as-is
5. ✅ Test both languages

## Common Patterns

### Buttons
```typescript
<Button>{t('common.save')}</Button>
<Button>{t('common.cancel')}</Button>
<Button>{t('common.delete')}</Button>
<Button>{t('common.submit')}</Button>
```

### Form Labels
```typescript
<Label>{t('auth.email')}</Label>
<Label>{t('auth.password')}</Label>
<Label>{t('projects.projectTitle')}</Label>
```

### Empty States
```typescript
{items.length === 0 && (
  <EmptyState
    title={t('projects.noProjects')}
    description={t('projects.noProjectsDesc')}
    action={<Button>{t('projects.createFirst')}</Button>}
  />
)}
```

### Loading States
```typescript
{isLoading && <Spinner>{t('common.loading')}</Spinner>}
```

### Success Messages
```typescript
toast.success(t('success.saved'));
toast.success(t('success.updated'));
toast.success(t('success.deleted'));
```

### Error Messages
```typescript
toast.error(t('errors.generic'));
toast.error(t('errors.network'));
toast.error(t('errors.unauthorized'));
```

## Priority Components to Translate

High priority:
1. ✅ Navbar (done)
2. Login/Register pages
3. Project List
4. Project Detail
5. Create/Edit Project forms

Medium priority:
6. Profile page
7. Contributions page
8. Error messages
9. Loading states
10. Empty states

Low priority:
11. Chat messages
12. Admin panel
13. Settings pages

## Testing

After translating a component:

1. **Test English**: Switch to English and verify all text appears
2. **Test Korean**: Switch to Korean and verify translations
3. **Check layout**: Ensure Korean text doesn't break layout
4. **Test placeholders**: Check input placeholders in both languages
5. **Test errors**: Trigger errors and check error messages

## Tips

- Korean text is often longer than English - ensure layouts accommodate this
- Use `max-width` and `overflow` for long text
- Test with both languages before committing
- Keep translation keys organized by feature/page
- Use descriptive key names

## Need to Add New Translations?

Edit `frontend/src/i18n.ts` and add to both `en` and `ko` sections:

```typescript
const resources = {
  en: {
    translation: {
      myFeature: {
        title: 'My Feature',
        description: 'Description here',
      },
    },
  },
  ko: {
    translation: {
      myFeature: {
        title: '내 기능',
        description: '여기에 설명',
      },
    },
  },
};
```

Then use: `{t('myFeature.title')}`

---

Happy translating! 🌏
