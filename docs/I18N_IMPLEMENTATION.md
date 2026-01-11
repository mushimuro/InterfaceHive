# i18n (Internationalization) Implementation Guide

InterfaceHive now supports English and Korean languages with automatic browser language detection.

## Overview

The application uses:
- **Backend**: Django's built-in i18n framework
- **Frontend**: react-i18next for React internationalization
- **Auto-detection**: Automatically detects user's browser language
- **Persistence**: Saves language preference to localStorage

## Quick Start

### For Users

**Language Switcher**: Click the language icon (🌐) in the navigation bar to switch between English and Korean.

**Auto-Detection**: On first visit, the app automatically detects your browser language and displays content accordingly.

---

## Implementation Details

### Frontend (React)

#### Libraries Used
```json
{
  "i18next": "^23.17.5",
  "react-i18next": "^15.2.0",
  "i18next-browser-languagedetector": "^8.0.2"
}
```

#### Configuration

**File**: `frontend/src/i18n.ts`

```typescript
i18n
  .use(LanguageDetector) // Auto-detect from browser
  .use(initReactI18next)
  .init({
    resources, // Translation files
    fallbackLng: 'en', // Default language
    supportedLngs: ['en', 'ko'], // Supported languages
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });
```

**Detection Order**:
1. **localStorage**: Check if user previously selected a language
2. **navigator**: Read browser's language preference
3. **htmlTag**: Check HTML `<html lang="en">` attribute

#### Translation Files

**Location**: `frontend/src/i18n.ts`

**Structure**:
```typescript
const resources = {
  en: {
    translation: {
      nav: {
        projects: 'Projects',
        myProjects: 'My Projects',
        // ...
      },
      auth: {
        login: 'Login',
        // ...
      },
    },
  },
  ko: {
    translation: {
      nav: {
        projects: '프로젝트',
        myProjects: '내 프로젝트',
        // ...
      },
      auth: {
        login: '로그인',
        // ...
      },
    },
  },
};
```

#### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.projects')}</h1>
      <p>{t('auth.login')}</p>
    </div>
  );
};
```

#### Language Switcher Component

**File**: `frontend/src/components/LanguageSwitcher.tsx`

- Dropdown menu with language options
- Shows flag emojis (🇺🇸 🇰🇷)
- Highlights current language
- Saves preference to localStorage

---

### Backend (Django)

#### Configuration

**File**: `backend/config/settings.py`

```python
# Middleware - LocaleMiddleware added
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # ← Added
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Language settings
LANGUAGE_CODE = 'en'  # Default language

LANGUAGES = [
    ('en', 'English'),
    ('ko', '한국어'),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

USE_I18N = True
USE_L10N = True
```

#### Creating Translation Files

1. **Mark strings for translation** in your Django code:

```python
from django.utils.translation import gettext_lazy as _

class MyModel(models.Model):
    title = models.CharField(_("Title"), max_length=100)
```

2. **Generate message files**:

```bash
# From backend directory
cd backend

# Generate/update translation files
python manage.py makemessages -l ko

# This creates: backend/locale/ko/LC_MESSAGES/django.po
```

3. **Edit the `.po` file**:

```
#: apps/projects/models.py:15
msgid "Title"
msgstr "제목"

#: apps/projects/models.py:16
msgid "Description"
msgstr "설명"
```

4. **Compile translations**:

```bash
python manage.py compilemessages
```

This creates `.mo` files which Django uses at runtime.

---

## Adding New Translations

### Frontend

**1. Update `frontend/src/i18n.ts`:**

```typescript
const resources = {
  en: {
    translation: {
      // Add new key
      newFeature: {
        title: 'New Feature',
        description: 'This is a new feature',
      },
    },
  },
  ko: {
    translation: {
      // Add Korean translation
      newFeature: {
        title: '새로운 기능',
        description: '이것은 새로운 기능입니다',
      },
    },
  },
};
```

**2. Use in components:**

```typescript
{t('newFeature.title')}
{t('newFeature.description')}
```

### Backend

**1. Mark string for translation:**

```python
from django.utils.translation import gettext_lazy as _

error_message = _("This is an error")
```

**2. Update translation files:**

```bash
python manage.py makemessages -l ko
# Edit backend/locale/ko/LC_MESSAGES/django.po
python manage.py compilemessages
```

---

## Current Translations

### Navigation (nav.*)
- `nav.projects` - Projects / 프로젝트
- `nav.myProjects` - My Projects / 내 프로젝트
- `nav.contributions` - Contributions / 기여 내역
- `nav.signin` - Sign in / 로그인
- `nav.getStarted` - Get Started / 시작하기
- `nav.signout` - Sign out / 로그아웃
- `nav.profile` - Profile Settings / 프로필 설정
- `nav.credits` - credits / 크레딧

### Authentication (auth.*)
- `auth.login` - Login / 로그인
- `auth.register` - Register / 회원가입
- `auth.email` - Email / 이메일
- `auth.password` - Password / 비밀번호
- `auth.confirmPassword` - Confirm Password / 비밀번호 확인
- `auth.displayName` - Display Name / 표시 이름

### Projects (projects.*)
- `projects.title` - Projects / 프로젝트
- `projects.create` - Create Project / 프로젝트 생성
- `projects.myProjects` - My Projects / 내 프로젝트
- `projects.search` - Search projects... / 프로젝트 검색...

### Common (common.*)
- `common.loading` - Loading... / 로딩 중...
- `common.save` - Save / 저장
- `common.cancel` - Cancel / 취소
- `common.delete` - Delete / 삭제
- `common.edit` - Edit / 수정
- `common.submit` - Submit / 제출

---

## Testing

### Local Development

1. **Install dependencies:**

```bash
cd frontend
npm install
```

2. **Run dev server:**

```bash
npm run dev
```

3. **Test language switching:**
   - Open browser DevTools → Application → Local Storage
   - Look for `i18nextLng` key
   - Change language using the switcher
   - Verify translations update

4. **Test auto-detection:**
   - Clear localStorage
   - Change browser language settings
   - Reload page
   - Verify app uses browser language

### Browser Language Settings

**Chrome**:
1. Settings → Languages
2. Add Korean (한국어)
3. Move to top of list
4. Restart browser

**Firefox**:
1. Settings → General → Language
2. Add Korean
3. Set as default

---

## Deployment

### Frontend Build

The translations are **bundled** into the JavaScript at build time.

```bash
npm run build
```

The `i18n.ts` file with all translations is included in the bundle.

### Backend Deployment

**Important**: Compiled message files (`.mo`) must be included in Docker image.

```dockerfile
# backend/Dockerfile
COPY . .
# This includes locale/ directory with .mo files
```

**On EC2**:
```bash
# If you update translations
docker-compose exec backend python manage.py compilemessages
docker-compose restart backend
```

---

## Best Practices

### 1. Use Translation Keys, Not Raw Text

❌ **Bad**:
```typescript
<h1>My Projects</h1>
```

✅ **Good**:
```typescript
<h1>{t('nav.myProjects')}</h1>
```

### 2. Organize Translation Keys by Feature

```typescript
translation: {
  nav: { /* navigation items */ },
  auth: { /* authentication */ },
  projects: { /* projects feature */ },
  common: { /* shared terms */ },
}
```

### 3. Use Interpolation for Dynamic Content

```typescript
// English
greeting: 'Hello, {{name}}!'

// Korean
greeting: '안녕하세요, {{name}}님!'

// Usage
{t('greeting', { name: user.name })}
```

### 4. Pluralization

```typescript
// English
items: 'You have {{count}} item',
items_other: 'You have {{count}} items',

// Korean (no plural form needed)
items: '{{count}}개의 항목이 있습니다',

// Usage
{t('items', { count: 5 })}
```

### 5. Keep Translations in Sync

When adding a new English translation, **immediately add the Korean version** to avoid missing translations.

---

## Troubleshooting

### Translations Not Showing

**Check**:
1. Is `i18n.ts` imported in `main.tsx`?
2. Are you using `t()` function correctly?
3. Check browser console for errors
4. Verify translation key exists in both languages

### Language Not Switching

**Check**:
1. Is LanguageSwitcher component rendered?
2. Check localStorage for `i18nextLng` key
3. Clear cache and reload
4. Check browser console for i18next errors

### Auto-Detection Not Working

**Check**:
1. Browser language is set to 'en' or 'ko'
2. Clear localStorage (`i18nextLng`)
3. Reload page
4. Check fallback language is working

### Backend Translations Not Working

**Check**:
1. `.mo` files compiled: `python manage.py compilemessages`
2. LocaleMiddleware is in MIDDLEWARE list
3. Check LANGUAGE_CODE and LANGUAGES settings
4. Restart Django server

---

## Future Improvements

### Add More Languages

1. **Update settings**:

```python
LANGUAGES = [
    ('en', 'English'),
    ('ko', '한국어'),
    ('ja', '日本語'),  # Japanese
    ('zh', '中文'),    # Chinese
]
```

2. **Add translations** to `i18n.ts`

3. **Update LanguageSwitcher** component

### Separate Translation Files

For larger apps, split translations into separate files:

```typescript
// frontend/src/locales/en/common.json
// frontend/src/locales/en/auth.json
// frontend/src/locales/ko/common.json
// frontend/src/locales/ko/auth.json

import en_common from './locales/en/common.json';
import ko_common from './locales/ko/common.json';

const resources = {
  en: {
    common: en_common,
    // ...
  },
  ko: {
    common: ko_common,
    // ...
  },
};
```

### Translation Management Tools

Consider using:
- **Lokalise** - Translation management platform
- **Crowdin** - Collaborative translation
- **POEditor** - Localization management

---

## Summary

✅ **English and Korean** support implemented
✅ **Auto-detection** from browser language
✅ **Language switcher** in navigation
✅ **localStorage** persistence
✅ **Both frontend and backend** configured
✅ **Easy to extend** with more languages

Users can now enjoy InterfaceHive in their preferred language with seamless switching!
