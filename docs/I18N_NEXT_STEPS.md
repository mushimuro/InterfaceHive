# i18n Implementation - Next Steps

## ✅ What's Been Implemented

### Backend (Django)
- ✅ LocaleMiddleware added to settings
- ✅ Language configuration (English + Korean)
- ✅ Locale paths configured

### Frontend (React)
- ✅ i18next libraries added to package.json
- ✅ i18n configuration file created (`src/i18n.ts`)
- ✅ LanguageSwitcher component created
- ✅ Navbar updated with translations
- ✅ Language auto-detection from browser
- ✅ localStorage persistence

## 📋 Steps to Deploy

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector`

### Step 2: Test Locally

```bash
# Run frontend dev server
npm run dev
```

**Test checklist**:
- [ ] Language switcher appears in navbar (🌐 icon)
- [ ] Click switcher shows English/Korean options
- [ ] Switching languages updates UI
- [ ] Refresh page keeps selected language
- [ ] Clear localStorage and refresh - should auto-detect browser language

### Step 3: Build and Deploy

```bash
# Build frontend
npm run build

# Commit changes
git add .
git commit -m "feat: Add i18n support for English and Korean"
git push origin master
```

### Step 4: Verify on Production

After GitHub Actions completes and deploys to EC2:

1. Visit `http://your-ec2-ip`
2. Check language switcher works
3. Verify translations display correctly
4. Test browser language auto-detection

## 🔧 Customizing Translations

### Add More Translations

Edit `frontend/src/i18n.ts`:

```typescript
const resources = {
  en: {
    translation: {
      // Add your translations here
      yourKey: 'Your English text',
    },
  },
  ko: {
    translation: {
      // Add Korean translations
      yourKey: '한국어 텍스트',
    },
  },
};
```

### Use in Components

```typescript
import { useTranslation } from 'react-i18next';

const YourComponent = () => {
  const { t } = useTranslation();
  
  return <div>{t('yourKey')}</div>;
};
```

## 📝 Current Translations

See `docs/I18N_IMPLEMENTATION.md` for full list of available translation keys.

**Quick reference**:
- `nav.*` - Navigation items
- `auth.*` - Authentication forms
- `projects.*` - Project management
- `common.*` - Common UI elements

## 🎯 Tips

1. **Browser Language Testing**:
   - Chrome: Settings → Languages → Add Korean
   - Firefox: Settings → General → Language

2. **Clear Language Preference**:
   - Open DevTools → Application → Local Storage
   - Delete `i18nextLng` key
   - Refresh page

3. **Check Current Language**:
   ```javascript
   // In browser console
   localStorage.getItem('i18nextLng')
   ```

## 📚 Documentation

- Full implementation guide: `docs/I18N_IMPLEMENTATION.md`
- Deployment process: `docs/DEPLOYMENT_PROCESS.md`

Happy translating! 🌏
