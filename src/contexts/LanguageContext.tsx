'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'my'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'my')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  // Translation function
  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>
    return translation[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Translation object
const translations = {
  en: {
    // Navigation
    home: 'Home',
    chat: 'chat',
    general: 'General',
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    condos: 'Condos',
    courses: 'Courses',
    jobs: 'Jobs',
    travel: 'Travel',
    docs: 'Documents',
    links: 'Links',
    admin: 'Admin Dashboard',
    
    // Common
    nearby:'Nearby: ',
    hello: 'Hello👋🏻',
    welcome: 'Welcome to YarSu',
    signOut: 'Sign Out',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    gym:'Gym',
    garden: 'Garden',
    coWorking: 'Co-working space',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    login: 'Login',
    signup: 'Sign Up',
    forgotPassword: 'Forgot your password?',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    
    // Auth errors
    invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
    emailNotConfirmed: 'Please check your email and click the confirmation link before signing in.',
    tooManyRequests: 'Too many login attempts. Please wait a few minutes and try again.',
    userNotFound: 'No account found with this email address. Please sign up first.',
    passwordsNoMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    emailAlreadyExists: 'An account with this email already exists. Please sign in instead.',
    invalidEmail: 'Please enter a valid email address.',
    accountCreatedSuccess: 'Account created successfully!',
    redirectingMessage: 'You are now signed in. Redirecting to homepage...',
    
    // Features
    name: 'Name',
    description: 'Description',
    location: 'Location',
    price: 'Price',
    notes: 'Note',
    rating: 'Rating',
    
    // Languages
    english: 'English',
    myanmar: 'မြန်မာ',
    
    // Job related
    daily: 'Daily',
    monthly: 'Monthly',
    accommodation: 'Accomodation',
    provided: 'Provided',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    night: 'night',
    month: 'month',
    
    // Page titles and descriptions
    findPerfectStay: 'Find the perfect place to stay',
    discoverCuisine: 'Discover amazing local cuisine',
    longTermAccommodation: 'Long-term accommodation options',
    learnSkills: 'For those who want to Learn',
    findEmployment: 'Find employment opportunities',
    exploreDestinations: 'Explore beautiful destinations',
    importantInfo: 'Important information and guides',
    usefulResources: 'External resources and websites',
    generaldes:'General posts and announcements Here',
    getChatSupport: 'Get help from our team',
    yourGuideThailand: 'Your guide to Thailand',
    
    // Job page
    findCareerOpportunity: 'Find your next career opportunity',
    noJobsAvailable: 'No jobs available',
    checkBackLater: 'Check back later for new opportunities!',
    failedLoadJobs: 'Failed to load jobs. Please try again later.',
    needLoginJobs: 'You need to be logged in to view jobs',
    networkIssues: 'Network connectivity issues',
    serverMaintenance: 'Server maintenance',
    tryAgain: 'Try Again',
    pinkCard: 'Document',
    thaiLanguage: 'Thai Language',
    paymentAvailable: 'Payment Available',
  acceptPlaceholder: 'Enter accept text (shown to users)',
  treatYes: 'Treat',
  treatNo: 'No Treat',
  acceptedLabel: 'Accepted',
  jobDateLabel: 'Job Date',
  paymentLabel: 'Payment',

    //Docs Page
    title: 'Documents',
    Description: 'Important information and helpful guides',

    
    // Hotel page
    failedLoadHotels: 'Failed to load hotels. Please try again later.',
    needLoginHotels: 'You need to be logged in to view hotels',
    noHotelsAvailable: 'No hotels available',
    wifi: 'Wifi',
    bf: 'Breakfast',
    pool: 'Pool',
    
    // Auth page
    welcomeToYarsu: 'Welcome to YarSu',
    signInAccount: 'Sign in to your account',
    createAccount: 'Create your account',
    joinYarsu: 'Join YarSu today',
    failedSignIn: 'Failed to sign in',
    failedSignUp: 'Failed to sign up',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signInHere: 'Sign in here',
    signUpHere: 'Sign up here',
    acco: 'Accomodation Location: ',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    superAdminDashboard: 'Super Admin Dashboard',
    welcomeBack: 'Welcome back',
    managePlatform: 'Manage your YarSu platform',
    userManagement: 'User Management',
    generalPosts: 'General Posts',
    documents: 'Documents',
    socialLinks: 'Social Links',
    highlights: 'Highlights',
    analytics: 'Analytics',
    accessDenied: 'Access Denied',
    needAdminPrivileges: 'You need administrator privileges to access this page',
    currentRole: 'Current Role',
    contactAdmin: 'Please contact a system administrator to upgrade your account permissions',
    manageJobPostings: 'Manage job postings and opportunities',
    manageDocuments: 'Manage important documents and guides',
    manageTravelPackages: 'Manage travel packages and tours',
    manageHotelListings: 'Manage hotel listings and accommodations',
    manageGeneralPosts: 'Manage general posts and announcements',
    manageRestaurantListings: 'Manage restaurant listings and reviews',
    manageCondoRentals: 'Manage condo rentals and properties',
    manageEducationalCourses: 'Manage educational courses and training',
    viewPlatformStatistics: 'View platform statistics',
    promoteUsers: 'Promote/demote users and manage roles',
    manageSocialLinks: 'Manage social media and external links',
    manageHomepageSlideshow: 'Manage homepage slideshow images',
    selectTabToStart: 'Select a tab to get started',
    totalUsers: 'Total Users',
    activeChats: 'Active Chats',
    postsCreated: 'Posts Created',
    
    // Contact Popup (replaces real-time chat)
    contactAdminPopup: 'Contact Admin',
    contactAdminDescription: 'Choose your preferred platform to get in touch with us',
    contactViaTelegram: 'Chat with us on Telegram',
    contactViaLine: 'Chat with us on LINE',
    contactViaMessenger: 'Chat with us on Messenger',
    contactAvailability: 'We typically respond within 24 hours',
  },
  my: {
    // Navigation  
    home: 'ပင်မစာမျက်နှာ',
    chat: 'အကူအညီ',
    general: 'အထွေထွေလမ်းညွှန်',
    hotels: 'ဟိုတယ်လမ်းညွှန်',
    restaurants: 'စားသောက်ဆိုင်လမ်းညွှန်',
    condos: 'ကွန်ဒိုလမ်းညွှန်',
    courses: 'သင်တန်းလမ်းညွှန်',
    jobs: 'အလုပ်အကိုင်လမ်းညွှန်',
    travel: 'ခရီးသွားလမ်းညွှန်',
    docs: 'အထောက်အထားလမ်းညွှန်',
    links: 'လင့်ခ်များ',
    admin: 'စီမံခန့်ခွဲမှု',
    night: 'ည',
    
    // Common
    nearby:'အနီးအနားရှိ လည်ပတ်စရာများ',
    hello: 'မင်္ဂလာပါ',
    welcome: 'ရာစုမှ ကြိုဆိုပါတယ်',
    signOut: 'ထွက်ရန်',
    loading: 'တင်နေသည်...',
    save: 'သိမ်းဆည်း',
    cancel: 'ပယ်ဖျက်',
    edit: 'ပြင်ဆင်',
    delete: 'ဖျက်',
    create: 'ဖန်တီး',
    update: 'မွမ်းမံ',
    search: 'ရှာဖွေ',
    filter: 'စစ်ထုတ်',
    
    // Auth
    email: 'အီးမေးလ်',
    password: 'စကားဝှက်',
    confirmPassword: 'စကားဝှက် အတည်ပြု',
    login: 'ဝင်ရောက်',
    signup: 'စာရင်းသွင်း',
    forgotPassword: 'စကားဝှက် မေ့နေသလား?',
    showPassword: 'စကားဝှက် ပြရန်',
    hidePassword: 'စကားဝှက် ဖုံးရန်',
    
    // Auth errors
    invalidCredentials: 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မမှန်ကန်ပါ။ ထပ်မံ ကြိုးစားပါ။',
    emailNotConfirmed: 'သင့်အီးမေးလ်ကို စစ်ဆေးပြီး အတည်ပြုလင့်ခ်ကို နှိပ်ပါ။',
    tooManyRequests: 'လော့ဂ်အင် ကြိုးစားမှု များလွန်းပါသည်။ ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။',
    userNotFound: 'ဤအီးမေးလ်ဖြင့် အကောင့်မရှိပါ။ အရင် စာရင်းသွင်းပါ။',
    passwordsNoMatch: 'စကားဝှက်များ မတူညီပါ',
    passwordTooShort: 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရမည်',
    emailAlreadyExists: 'ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပြီးသားဖြစ်သည်။ ဝင်ရောက်ပါ။',
    invalidEmail: 'မှန်ကန်သော အီးမေးလ် လိပ်စာ ရိုက်ထည့်ပါ။',
    accountCreatedSuccess: 'အကောင့် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!',
    redirectingMessage: 'သင်ဝင်ရောက်ပြီးပါပြီ။ ပင်မစာမျက်နှာသို့ ပို့ပေးနေသည်...',
    
    // Features
    name: 'အမည်',
    description: 'ဖော်ပြချက်',
    location: 'တည်နေရာ',
    price: 'စျေးနှုန်း',
    notes: 'မှတ်စုများ',
    rating: 'အဆင့်',
     month: 'တစ်လ',
    
    // Languages
    english: 'English',
    myanmar: 'မြန်မာ',
    generaldes:'အထွေထွေ ပို့စ်များနှင့် ကြေညာချက်များ',

    // Job related
    daily: 'နေ့စား',
    monthly: 'လစား',
    accommodation: 'နေစရာပေးသည်',
    provided: 'ပေးထား',
    
    // Status
    active: 'အသုံးပြုနေ',
    inactive: 'အသုံးမပြု',
    pending: 'စောင့်ဆိုင်း',
    approved: 'အတည်ပြု',
    
    // Page titles and descriptions
    findPerfectStay: 'သင့်အတွက် အကောင်းဆုံး ဟော်တယ်ကို ရှာဖွေပါ',
    discoverCuisine: 'အရသာရှိသော စားသောက်ဆိုင်များကို ရှာဖွေပါ',
    longTermAccommodation: 'ရေရှည် နေထိုင်ရန် ရွေးချယ်စရာများ',
    learnSkills: 'သင်တန်းတွေတက်မဲ့သူများအတွက်',
    findEmployment: 'အလုပ်အကိုင် အခွင့်အလမ်းများ ရှာဖွေပါ',
    exploreDestinations: 'လှပသော နေရာများကို လည်ပတ်ပါ',
    importantInfo: 'အရေးကြီးသော သတင်းအချက်အလက်နှင့် လမ်းညွှန်များ',
    usefulResources: 'အခြား Social Media လင့်ခ်များ',
    getChatSupport: 'မင်မင်တို့နဲ့ ဆက်သွယ်ပါ',
    yourGuideThailand: 'သင့်အတွက်ထိုင်းနိုင်ငံ လမ်းညွှန်',
    
    // Job page
    findCareerOpportunity: 'သင့်အတွက် အလုပ်အကိုင် အခွင့်အလမ်းများ ရှာဖွေပါ',
    noJobsAvailable: 'လက်ရှိတွင် အလုပ်များ မရှိပါ',
    checkBackLater: 'အခွင့်အလမ်းအသစ်များအတွက် နောက်မှ ပြန်ကြည့်ပါ!',
    failedLoadJobs: 'အလုပ်များ တင်၍မရပါ။ နောက်မှ ပြန်ကြိုးစားပါ။',
    needLoginJobs: 'အလုပ်များကို ကြည့်ရန် အကောင့်ဝင်ရန် လိုအပ်သည်',
    networkIssues: 'ကွန်ယက် ချိတ်ဆက်မှု ပြဿနာများဖြစ်နေပါသည်',
    serverMaintenance: 'ဆာဗာ ပြုပြင်ထိန်းသိမ်းနေပါသည်',
    tryAgain: 'ပြန်ကြိုးစားပါ',
    pinkCard: 'အထောက်အထားလိုအပ်သည်',
    thaiLanguage: 'ထိုင်းစကားတတ်ရန်လိုသည်',
    paymentAvailable: 'လစာပေးခြေပုံ',
  acceptPlaceholder: 'Accept ကို ရိုက်ထည့်ပါ (အသုံးပြုသူများအား ပြပါ)',
  treatYes: 'ထမင်းကျွေး',
  treatNo: 'ကိုယ့်ဘာသာစား',
  acceptedLabel: 'လက်ခံသည့်ဦးရေ',
  jobDateLabel: 'အလုပ်ရက်',
  paymentLabel: 'ငွေပေးချေမှု',
    

    //Docs Page
    title: 'အထောက်အထားလမ်းညွှန်',
    Description: 'အထောက်အထားအတွက် သိထားသင့်သော အချက်အလက်များနှင့် နည်းလမ်းများ',
    

    
    // Hotel page
    gym:'Gymရှိသည်',
    garden: 'ဥယျာဉ်ရှိသည်',
    coWorking: 'Co-working space ရှိသည်',
    failedLoadHotels: 'ဟိုတယ်များ တင်၍မရပါ။ နောက်မှ ပြန်ကြိုးစားပါ။',
    needLoginHotels: 'ဟိုတယ်များကို ကြည့်ရန် အကောင့်ဝင်ရန် လိုအပ်သည်',
    noHotelsAvailable: 'လက်ရှိတွင် ဟိုတယ်များ မရှိပါ',
    wifi: 'ဝိုင်ဖိုင် အခမဲ့',
    bf: 'မနက်စာပါသည်',
    pool: 'ရေကူးကန်ပါသည်',
    
    // Auth page
    welcomeToYarsu: 'YarSu မှ ကြိုဆိုပါတယ်',
    signInAccount: 'သင့်အကောင့်သို့ ဝင်ရောက်ပါ',
    createAccount: 'သင့်အကောင့်ကို ဖန်တီးပါ',
    joinYarsu: 'YarSu သို့ ယနေ့ပဲ ဝင်လိုက်ပါ',
    failedSignIn: 'ဝင်ရောက်၍ မရပါ',
    failedSignUp: 'စာရင်းသွင်း၍ မရပါ',
    alreadyHaveAccount: 'အကောင့်ရှိပြီးသားလား?',
    dontHaveAccount: 'အကောင့်မရှိသေးဘူးလား?',
    signInHere: 'ဒီမှာ ဝင်ရောက်ပါ',
    signUpHere: 'ဒီမှာ စာရင်းသွင်းပါ',
    acco: 'နေထိုင်ရန် နေရာ:-',
    
    // Admin Dashboard
    adminDashboard: 'စီမံခန့်ခွဲမှု',
    superAdminDashboard: 'အထက်တန်း စီမံခန့်ခွဲမှု',
    welcomeBack: 'ပြန်လည်ကြိုဆိုပါတယ်',
    managePlatform: 'သင့် YarSu ပလပ်ဖောင်းကို စီမံခန့်ခွဲပါ',
    userManagement: 'အသုံးပြုသူများ စီမံခန့်ခွဲမှု',
    generalPosts: 'အထွေထွေ ပို့စ်များ',
    documents: 'အထောက်အထားလမ်းညွှန်',
    socialLinks: 'လူမှုကွန်ယက် လင့်ခ်များ',
    highlights: 'ဦးစားပေး အချက်များ',
    analytics: 'စာရင်းအင်းများ',
    accessDenied: 'ဝင်ခွင့်ပြုမထားပါ',
    needAdminPrivileges: 'ဤစာမျက်နှာကို ဝင်ရောက်ရန် Adminဖြစ်ရန် လိုအပ်သည်',
    currentRole: 'လက်ရှိ အခန်းကဏ္ဍ',
    contactAdmin: 'သင့်အကောင့် ခွင့်ပြုချက်များ မြှင့်တင်ရန် စနစ် စီမံခန့်ခွဲသူကို ဆက်သွယ်ပါ',
    manageJobPostings: 'အလုပ်တွေ့ကြေငြာများနှင့် အခွင့်အလမ်းများကို စီမံခန့်ခွဲပါ',
    manageDocuments: 'အရေးကြီးသော အထောက်အထားများနှင့် လမ်းညွှန်များကို စီမံခန့်ခွဲပါ',
    manageTravelPackages: 'ခရီးသွားပက်ကေ့ဂျ်များနှင့် ခရီးစဉ်များကို စီမံခန့်ခွဲပါ',
    manageHotelListings: 'ဟိုတယ်စာရင်းများနှင့် နေရာထိုင်ခင်းများကို စီမံခန့်ခွဲပါ',
    manageGeneralPosts: 'အထွေထွေ ပို့စ်များနှင့် ကြေငြာများကို စီမံခန့်ခွဲပါ',
    manageRestaurantListings: 'စားသောက်ဆိုင်စာရင်းများနှင့် အသုံးပြုသူ သုံးသပ်ချက်များကို စီမံခန့်ခွဲပါ',
    manageCondoRentals: 'ကွန်ဒို ငှားရမ်းမှုများနှင့် အိမ်ခြံမြေများကို စီမံခန့်ခွဲပါ',
    manageEducationalCourses: 'ပညာရေး သင်တန်းများနှင့် လေ့ကျင့်ရေးများကို စီမံခန့်ခွဲပါ',
    viewPlatformStatistics: 'ပလပ်ဖောင်း စာရင်းအင်းများကို ကြည့်ရှုပါ',
    promoteUsers: 'အသုံးပြုသူများ မြှင့်တင်/နှိမ့်ချခြင်းနှင့် အခန်းကဏ္ဍများ စီမံခန့်ခွဲပါ',
    manageSocialLinks: 'လူမှုကွန်ယက်နှင့် ပြင်ပ လင့်ခ်များကို စီမံခန့်ခွဲပါ',
    manageHomepageSlideshow: 'ပင်မစာမျက်နှာ ဓာတ်ပုံပြခင်းများကို စီမံခန့်ခွဲပါ',
    selectTabToStart: 'စတင်ရန် တက်ဘ်တစ်ခုကို ရွေးချယ်ပါ',
    totalUsers: 'စုစုပေါင်း အသုံးပြုသူများ',
    activeChats: 'လက်ရှိ ချတ်များ',
    postsCreated: 'ဖန်တီးထားသော ပို့စ်များ',
    
    // Contact Popup (replaces real-time chat)
    contactAdminPopup: 'Admin ကို ဆက်သွယ်ရန်',
    contactAdminDescription: 'သင်နှစ်သက်ရာ ပလက်ဖောင်းကို ရွေးချယ်ပါ',
    contactViaTelegram: 'Telegram မှတဆင့် ဆက်သွယ်ပါ',
    contactViaLine: 'LINE မှတဆင့် ဆက်သွယ်ပါ',
    contactViaMessenger: 'Messenger မှတဆင့် ဆက်သွယ်ပါ',
    contactAvailability: '၂၄ နာရီအတွင်း ပြန်လည်ဖြေကြားပေးပါမည်',
  }
}
