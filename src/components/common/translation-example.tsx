import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";

export default function TranslationExample() {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t('common.welcome')}</h1>
      <p>{t('common.dashboard')}</p>
      
      <div className="flex gap-2">
        <Button color="primary">{t('common.save')}</Button>
        <Button variant="bordered">{t('common.cancel')}</Button>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Navigation:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('navigation.home')}</li>
          <li>{t('navigation.profile')}</li>
          <li>{t('navigation.notifications')}</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Authentication:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('auth.username')}</li>
          <li>{t('auth.password')}</li>
          <li>{t('auth.signIn')}</li>
        </ul>
      </div>
    </div>
  );
}