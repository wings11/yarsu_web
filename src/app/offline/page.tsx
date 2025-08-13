'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img
            className="mx-auto h-24 w-24"
            src="/images/logo.png"
            alt="YarSu"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            အင်တာနက်မရှိပါ။
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
           အင်တာနက်လိုင်းပြတ်တောက်သွားပါတယ်။ လိုင်းအရင်ပြန်ချိတ်ပေးနော်။ 🌻🙏
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg
                    className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  လိုင်းပြတ်သွားပါတယ်။
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  အင်တာနက်လိုင်းပြတ်တောက်သွားပါတယ်။ လိုင်းအရင်ပြန်ချိတ်ပေးနော်။ 🌻🙏
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleRefresh}
                  className="w-full"
                >
                  Try again
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => window.history.back()}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Go back
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Available offline
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <a
                    href="/"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Home
                  </a>
                  <a
                    href="/chat"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
