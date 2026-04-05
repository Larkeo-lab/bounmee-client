const laFlag = "/assets/images/lao-flag.png"
const enFlag = "/assets/images/en-flag.png"
const thFlag = "/assets/images/thai-flag.png"

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
  }
]

// Export i18n configuration
export { default as i18n } from './i18n';