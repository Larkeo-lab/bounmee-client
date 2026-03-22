import React from 'react'
import { useTranslation } from 'react-i18next'
import { Switch, Avatar } from '@heroui/react'
import { languageConfigs } from '@/config'

interface Language {
  code: string
  name: string
  flag: string
}

// Transform languageConfigs to match our Language interface
const languages: Language[] = languageConfigs.map(config => ({
  code: config.value,
  name: config.label,
  flag: config.flag,
}))

export default function LanguageSwitch() {
  const { i18n } = useTranslation()

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]
  const [isSelected, setIsSelected] = React.useState(currentLanguage.code === languages[1]?.code)

  const handleLanguageChange = (selected: boolean) => {
    setIsSelected(selected)
    const newLanguage = selected ? languages[1] : languages[0]
    i18n.changeLanguage(newLanguage.code)
  }

  // Update isSelected when language changes externally
  React.useEffect(() => {
    setIsSelected(currentLanguage.code === languages[1]?.code)
  }, [currentLanguage.code])

  const startLanguage = languages[0]
  const endLanguage = languages[1] || languages[0]

  return (
    <Switch
      isSelected={isSelected}
      onValueChange={handleLanguageChange}
      color='default'
      size="md"
      thumbIcon={({ isSelected }) =>
        !isSelected ? <Avatar
          src={startLanguage.flag}
          alt={`${startLanguage.name} flag`}
          className="w-5 h-5"
        /> : <Avatar
          src={endLanguage.flag}
          alt={`${endLanguage.name} flag`}
          className="w-5 h-5"
        />
      }
    >
      {/* {currentLanguage.name} */}
    </Switch>
  )
}
