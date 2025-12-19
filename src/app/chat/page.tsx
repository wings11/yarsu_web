'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Loading'
import Layout from '@/components/Layout'
import ContactPopup from '@/components/chat/ContactPopup'
import { useRouter } from 'next/navigation'

// ============================================
// COMMENTED OUT: Real-time chat implementation
// ============================================
// import ChatInterface from '@/components/chat/ChatInterface'
// 
// Previous implementation used real-time Socket.io chat.
// Now replaced with contact popup for messaging admins via
// Telegram, LINE, or Facebook Messenger.
// ============================================

// Contact links configuration - UPDATE THESE WITH YOUR ACTUAL LINKS
const CONTACT_LINKS = {
  telegram: 'https://t.me/NanBkk777',      // Replace with your Telegram link
  line: 'https://line.me/ti/p/CMEQqeayj8',           // Replace with your LINE link  
  messenger: 'https://m.me/61583933405143',       // YarSu Facebook page
  viber: 'https://invite.viber.com/?g2=AQAnqn%2F8W4X3x1OjZPP%2F39icipPzNwEGK8nrQLKwuatMk8PTNukoTdhylPz%2BMA0j',
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showContactPopup, setShowContactPopup] = useState(false)

  // Auto-show popup when page loads for authenticated users
  useEffect(() => {
    if (user && !loading) {
      setShowContactPopup(true)
    }
  }, [user, loading])

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <Layout>
      {/* Contact Admin Popup */}
      <ContactPopup 
        isOpen={showContactPopup}
        onClose={() => {
          setShowContactPopup(false)
          // Optionally redirect back to home when closing
          router.push('/')
        }}
        telegramLink={CONTACT_LINKS.telegram}
        lineLink={CONTACT_LINKS.line}
        messengerLink={CONTACT_LINKS.messenger}
        viberLink={CONTACT_LINKS.viber}
      />

      {/* Fallback content when popup is closed */}
      {!showContactPopup && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="text-center">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-20 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              အကူအညီ လိုအပ်ပါသလား?
            </h1>
            <p className="text-gray-600 mb-6">
              အက်မင်တို့နဲ့ ဆက်သွယ်ရန်  ရွေးချယ်ပါ။
            </p>
            <button
              onClick={() => setShowContactPopup(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Contact Admin
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}

// ============================================
// COMMENTED OUT: Previous admin/user logic
// ============================================
// export default function ChatPage() {
//   const { user, loading } = useAuth()
//   const router = useRouter()
//
//   if (loading) {
//     return <PageLoader />
//   }
//
//   if (!user) {
//     router.push('/login')
//     return null
//   }
//
//   // Check if user is admin for layout decision
//   const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
//
//   // For admins, use normal layout; for users, use fullscreen chat
//   if (isAdmin) {
//     return (
//       <Layout>
//         <ChatInterface />
//       </Layout>
//     )
//   }
//
//   // For regular users, return fullscreen chat without layout
//   return <ChatInterface />
// }
// ============================================
