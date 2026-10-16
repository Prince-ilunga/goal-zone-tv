import type { SVGProps } from 'react'
import { Facebook, Twitter, MessageCircle } from 'lucide-react'

/**
 * Brand TikTok icon (lucide doesn't ship it yet).
 */
export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.004-.104z" />
    </svg>
  )
}

export const SOCIAL_LINKS = {
  facebook: {
    label: 'Facebook',
    short: 'FB',
    href: 'https://www.facebook.com/search/top?q=GOAL%20ZONE%20TV',
    icon: Facebook,
    handle: 'GOAL ZONE TV',
  },
  tiktok: {
    label: 'TikTok',
    short: 'TikTok',
    href: 'https://www.tiktok.com/search?q=GOAL%20ZONE%20TV',
    icon: TikTokIcon,
    handle: 'GOAL ZONE TV',
  },
  x: {
    label: 'X (Twitter)',
    short: 'X',
    href: 'https://x.com/search?q=GOAL%20ZONE%20TV',
    icon: Twitter,
    handle: 'GOAL ZONE TV',
  },
  whatsapp: {
    label: 'WhatsApp',
    short: 'WA',
    href: 'https://wa.me/243970700632?text=Bonjour%20Moïse%2C%20je%20vous%20contacte%20depuis%20GOAL%20ZONE%20TV',
    icon: MessageCircle,
    handle: '+243 970 700 632',
  },
} as const

export const CONTACT_INFO = {
  email: 'contact@goalzonetv.cd',
  whatsapp: '0970700632',
  whatsappInternational: '+243 970 700 632',
  whatsappLink:
    'https://wa.me/243970700632?text=Bonjour%20Moïse%2C%20je%20vous%20contacte%20depuis%20GOAL%20ZONE%20TV',
  location: 'Lubumbashi, Haut-Katanga — RDC',
  journalist: 'Moïse Kalala',
  brand: 'GOAL ZONE TV',
}
