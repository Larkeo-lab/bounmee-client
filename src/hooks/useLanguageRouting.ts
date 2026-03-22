import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const useLanguageRouting = () => {
  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()
  const location = useLocation()
  const { i18n } = useTranslation()

  const validLanguages = ['en', 'lo', 'th']
  const currentLang = lang && validLanguages.includes(lang) ? lang : 'en'

  // Function to navigate to a path with current language
  const navigateWithLang = (path: string) => {
    const newPath = `/${currentLang}${path.startsWith('/') ? path : `/${path}`}`
    navigate(newPath)
  }

  // Function to change language and update URL
  const changeLanguage = (newLang: string) => {
    if (!validLanguages.includes(newLang)) return

    // Update i18n language
    i18n.changeLanguage(newLang)

    // Get current path without language prefix
    const currentPath = location.pathname.replace(`/${currentLang}`, '') || '/'
    
    // Navigate to new language path
    const newPath = `/${newLang}${currentPath === '/' ? '' : currentPath}`
    navigate(newPath, { replace: true })
  }

  // Function to get current path without language prefix
  const getPathWithoutLang = () => {
    return location.pathname.replace(`/${currentLang}`, '') || '/'
  }

  // Function to get full path with language prefix
  const getPathWithLang = (path: string, language?: string) => {
    const targetLang = language || currentLang
    return `/${targetLang}${path.startsWith('/') ? path : `/${path}`}`
  }

  return {
    currentLang,
    navigateWithLang,
    changeLanguage,
    getPathWithoutLang,
    getPathWithLang,
    validLanguages
  }
}