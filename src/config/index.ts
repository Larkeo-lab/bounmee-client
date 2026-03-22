const laFlag = "/assets/images/lao-flag.png"
const enFlag = "/assets/images/en-flag.png"

// Create language with flag 
export const languageConfigs = [
  {
    label: 'ພາສາລາວ',
    value: 'lo',
    flag: laFlag,
  },
  {
    label: 'English',
    value: 'en',
    flag: enFlag,
  }
]

// Export i18n configuration
export { default as i18n } from './i18n';