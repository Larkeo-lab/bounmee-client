import { useTranslation } from 'react-i18next'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Avatar } from '@heroui/react'
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

  const handleLanguageChange = (key: any) => {
    i18n.changeLanguage(key.toString())
  }

  return (
    <Dropdown placement="bottom-end" className="bg-white/90 backdrop-blur-md border-none shadow-2xl">
      <DropdownTrigger>
        <Button 
          variant="light" 
          isIconOnly
          radius="full"
          className="min-w-10 w-10 h-10 border border-default-100 bg-white/50 shadow-sm"
        >
          <Avatar 
            src={currentLanguage.flag} 
            className="w-6 h-6"
            radius="full"
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Language selection" 
        onAction={handleLanguageChange}
        variant="flat"
        className="p-2"
        itemClasses={{
          base: "rounded-xl font-bold transition-all p-2.5",
          selectedIcon: "text-primary",
        }}
      >
        {languages.map((lang) => (
          <DropdownItem
            key={lang.code}
            startContent={
              <Avatar src={lang.flag} className="w-5 h-5 shadow-sm" radius="full" />
            }
            className={currentLanguage.code === lang.code ? "text-primary" : "text-default-700"}
          >
            {lang.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
