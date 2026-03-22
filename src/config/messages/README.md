# Internationalization (i18n) Setup

This project uses i18next for internationalization with support for English, Lao, and Thai languages.

## File Structure

```
src/config/messages/
├── en.json     # English translations
├── lo.json     # Lao translations
├── th.json     # Thai translations
└── README.md   # This file
```

## Usage

### 1. Using translations in components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 2. Changing language programmatically

```tsx
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage('lo')}>
      Switch to Lao
    </button>
  );
}
```

### 3. Adding new translations

1. Add the key-value pair to all language files (en.json, lo.json, th.json)
2. Use the translation key in your component with `t('your.key')`

Example:
```json
// en.json
{
  "common": {
    "newButton": "New Button"
  }
}

// lo.json
{
  "common": {
    "newButton": "ປຸ່ມໃໝ່"
  }
}

// th.json
{
  "common": {
    "newButton": "ปุ่มใหม่"
  }
}
```

## Language Detection

The system automatically detects the user's language preference from:
1. localStorage (if previously set)
2. Browser language settings
3. Falls back to English if no match found

## Available Translation Keys

### Common
- `common.welcome` - Welcome message
- `common.login` - Login
- `common.logout` - Logout
- `common.dashboard` - Dashboard
- `common.settings` - Settings
- `common.userManagement` - User Management
- `common.save` - Save
- `common.cancel` - Cancel
- `common.edit` - Edit
- `common.delete` - Delete
- `common.add` - Add
- `common.search` - Search
- `common.loading` - Loading message
- `common.error` - Error
- `common.success` - Success

### Navigation
- `navigation.home` - Home
- `navigation.profile` - Profile
- `navigation.notifications` - Notifications

### Authentication
- `auth.username` - Username
- `auth.password` - Password
- `auth.rememberMe` - Remember me
- `auth.forgotPassword` - Forgot password
- `auth.signIn` - Sign In
- `auth.signOut` - Sign Out

### Language Names
- `language.english` - English
- `language.lao` - ພາສາລາວ
- `language.thai` - พาสาไทย