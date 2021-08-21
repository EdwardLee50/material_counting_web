import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Material_counting'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
