const laFlag = "/assets/images/lao-flag.png"
const enFlag = "/assets/images/en-flag.png"
const thFlag = "/assets/images/thai-flag.png"
const chFlag = "/assets/images/chinese-logo.avif"

// Create language with flag 
export const languageConfigs = [
  {
    label: 'ພາສາລາວ',
    value: 'lo',
    flag: laFlag,
  },
  {
    label: 'ไทย',
    value: 'th',
    flag: thFlag,
  },
  {
    label: 'English',
    value: 'en',
    flag: enFlag,
  },
  {
    label: '中文',
    value: 'ch',
    flag: chFlag,
  }
]

// Export i18n configuration
export { default as i18n } from './i18n';