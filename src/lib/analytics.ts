/**
 * Google Analytics Utility Functions
 * 
 * ຟັງຊັນສຳລັບຕິດຕາມແລະບັນທຶກຂໍ້ມູນດ້ວຍ Google Analytics
 * ສາມາດເອີ້ນໃຊ້ໄດ້ທົ່ວທຸກຈຸດໃນໂປຣເຈັກ
 */

const GA_MEASUREMENT_ID = 'G-FNYSDPKRRH'  

/**
 * ກວດສອບວ່າ Google Analytics ພ້ອມໃຊ້ງານຫຼືຍັງ
 */
const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * ຕິດຕາມ page view
 * @param pagePath - ເສັ້ນທາງຂອງໜ້າ (ຕົວຢ່າງ: '/login', '/dashboard')
 * @param pageTitle - ຫົວຂໍ້ຂອງໜ້າ (ຕົວຢ່າງ: 'Login Page', 'Dashboard')
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!isGALoaded()) {
    console.warn('Google Analytics is not loaded yet')
    return
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle || pagePath
  })

  window.gtag('event', 'page_view', {
    page_title: pageTitle || pagePath,
    page_location: window.location.href,
    page_path: pagePath
  })
}

/**
 * ຕິດຕາມ custom event
 * @param eventName - ຊື່ຂອງ event (ຕົວຢ່າງ: 'login', 'button_click', 'form_submit')
 * @param eventParams - ພາຣາມິເຕີເພີ່ມເຕີມ (ຕົວຢ່າງ: { button_name: 'Submit', form_name: 'Login Form' })
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  if (!isGALoaded()) {
    console.warn('Google Analytics is not loaded yet')
    return
  }

  window.gtag('event', eventName, {
    ...eventParams,
    event_category: eventParams?.event_category || 'general',
    event_label: eventParams?.event_label || eventName
  })
}

/**
 * ຕິດຕາມການ login
 * @param method - ວິທີການ login (ຕົວຢ່າງ: 'username', 'email')
 * @param userId - ID ຂອງ user (optional, ບໍ່ຕ້ອງສົ່ງຖ້າຕ້ອງການຄວາມເປັນສ່ວນຕົວ)
 */
export const trackLogin = (method?: string, userId?: string): void => {
  trackEvent('login', {
    method: method || 'username',
    ...(userId && { user_id: userId })
  })
}

/**
 * ຕິດຕາມການ logout
 */
export const trackLogout = (): void => {
  trackEvent('logout')
}

/**
 * ຕິດຕາມການກົດປຸ່ມ
 * @param buttonName - ຊື່ຂອງປຸ່ມ
 * @param location - ຕຳແໜ່ງທີ່ກົດ (ຕົວຢ່າງ: 'header', 'sidebar', 'footer')
 */
export const trackButtonClick = (buttonName: string, location?: string): void => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: location || 'unknown'
  })
}

/**
 * ຕິດຕາມການສົ່ງ form
 * @param formName - ຊື່ຂອງ form
 * @param success - ສຳເລັດຫຼືບໍ່
 */
export const trackFormSubmit = (formName: string, success: boolean = true): void => {
  trackEvent('form_submit', {
    form_name: formName,
    form_status: success ? 'success' : 'error'
  })
}

/**
 * ຕິດຕາມການຄົ້ນຫາ
 * @param searchTerm - ຄຳສັ່ງຄົ້ນຫາ
 * @param resultsCount - ຈຳນວນຜົນການຄົ້ນຫາ
 */
export const trackSearch = (searchTerm: string, resultsCount?: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    ...(resultsCount !== undefined && { results_count: resultsCount })
  })
}

/**
 * ຕິດຕາມການດາວໂຫຼດ file
 * @param fileName - ຊື່ file
 * @param fileType - ປະເພດ file (ຕົວຢ່າງ: 'pdf', 'excel', 'image')
 */
export const trackDownload = (fileName: string, fileType?: string): void => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType || 'unknown'
  })
}

/**
 * ຕິດຕາມການເຊື່ອມຕໍ່ພາຍນອກ
 * @param url - URL ທີ່ເຊື່ອມຕໍ່
 */
export const trackOutboundLink = (url: string): void => {
  trackEvent('outbound_link', {
    link_url: url
  })
}

/**
 * ຕິດຕາມ error
 * @param errorMessage - ຂໍ້ຄວາມ error
 * @param errorLocation - ຕຳແໜ່ງທີ່ເກີດ error (ຕົວຢ່າງ: 'Login Form', 'API Call')
 */
export const trackError = (errorMessage: string, errorLocation?: string): void => {
  trackEvent('error', {
    error_message: errorMessage,
    error_location: errorLocation || 'unknown'
  })
}

/**
 * ຕິດຕາມການໃຊ້ເວລາໃນໜ້າ
 * @param pagePath - ເສັ້ນທາງຂອງໜ້າ
 * @param timeInSeconds - ເວລາທີ່ໃຊ້ໃນໜ້າ (ວິນາທີ)
 */
export const trackTimeOnPage = (pagePath: string, timeInSeconds: number): void => {
  trackEvent('time_on_page', {
    page_path: pagePath,
    time_seconds: timeInSeconds
  })
}
