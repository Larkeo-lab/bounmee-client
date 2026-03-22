import { Button } from '@heroui/button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PageNotFound() {
    const navigate = useNavigate()
    const { t } = useTranslation()
  return (
    <div className='min-h-screen flex justify-center items-center flex-col'>
        <div className='text-center'>
            {/* Large 404 with sad face */}
            <div className='flex items-center justify-center mb-4'>
                <span className='text-[8rem] font-bold text-primary leading-none'>4</span>
                <div className='mx-2'>
                    <div className='w-24 h-24 border-8 border-primary rounded-full flex items-center justify-center relative'>
                        {/* Sad face eyes */}
                        <div className='absolute top-6 left-2 w-4 h-4 bg-primary transform rotate-45'></div>
                        <div className='absolute top-6 right-2 w-4 h-4 bg-primary transform rotate-45'></div>
                        {/* Sad mouth */}
                        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-2 border-primary rounded-b-full'></div>
                    </div>
                </div>
                <span className='text-[8rem] font-bold text-primary leading-none'>4</span>
            </div>
            
            {/* Error text */}
            <h1 className='text-2xl font-extrabold text-primary tracking-wider'>{t('pageNotFound.error')}</h1>
            
            {/* Sorry message */}
            <p className='text-lg text-gray-600 mb-4'>{t('pageNotFound.description')}</p>
            
            {/* Decorative line */}
            <div className='w-full h-1 bg-primary mx-auto mb-4'></div>
            
            {/* Go back button */}
            <Button 
                onPress={() => navigate(-1)} 
                variant='solid' 
                color='primary' 
                className='bg-primary px-8 py-2 rounded-lg font-medium'
            >
                {t('pageNotFound.goBack')}
            </Button>
        </div>
    </div>
  )
}
