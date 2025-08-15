# Form Persistence Implementation Guide

## Overview
This guide shows how to implement form persistence in admin managers to prevent data loss when navigating between pages.

## Quick Implementation Steps

### 1. Import Required Dependencies
```tsx
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { DraftNotification } from '@/components/ui/DraftNotification'
import { useState, useEffect } from 'react'
```

### 2. Replace useState with useFormPersistence
```tsx
// OLD WAY
const [formData, setFormData] = useState({
  title: '',
  description: '',
  // ... other fields
})

// NEW WAY
const defaultFormData = {
  title: '',
  description: '',
  // ... other fields
}

const {
  formData,
  updateFormData,
  resetForm: resetPersistentForm,
  clearDraft,
  hasUnsavedChanges,
  hasSavedDraft
} = useFormPersistence({
  key: 'unique_form_key', // e.g., 'hotels_form', 'restaurants_form'
  defaultValues: defaultFormData,
  autoSave: true,
  autoSaveDelay: 2000
})
```

### 3. Add Draft Notification State
```tsx
const [showDraftNotification, setShowDraftNotification] = useState(false)

// Check for saved draft on component mount
useEffect(() => {
  if (hasSavedDraft && !isEditing) {
    setShowDraftNotification(true)
  }
}, [hasSavedDraft, isEditing])
```

### 4. Update Form Input Handlers
```tsx
// OLD WAY
onChange={(e) => setFormData({ ...formData, title: e.target.value })}

// NEW WAY
onChange={(e) => updateFormData({ title: e.target.value })}
```

### 5. Update Reset Form Function
```tsx
const resetForm = () => {
  resetPersistentForm()
  setIsEditing(false)
  setEditingItem(null)
  setShowDraftNotification(false)
}
```

### 6. Clear Draft on Successful Save
```tsx
const createMutation = useMutation({
  mutationFn: (data) => apiService.createItem(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] })
    resetForm()
    clearDraft() // Add this line
    toast.success('Item created successfully!')
  },
})
```

### 7. Add Draft Notification to Form
```tsx
<h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
  <span>{editingItem ? 'Edit Item' : 'Create New Item'}</span>
  {hasUnsavedChanges && !editingItem && (
    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
      Draft saved
    </span>
  )}
</h3>

<DraftNotification
  isVisible={showDraftNotification}
  onRestore={() => setShowDraftNotification(false)}
  onDiscard={() => {
    clearDraft()
    setShowDraftNotification(false)
  }}
  formType="item"
/>
```

## Files That Need This Update
- [ ] HotelsManager.tsx
- [ ] RestaurantsManager.tsx  
- [ ] CondosManager.tsx
- [ ] CoursesManager.tsx
- [ ] TravelManager.tsx
- [ ] LinksManager.tsx
- [ ] HighlightsManager.tsx
- [ ] GeneralPostManager.tsx
- [x] JobsManager.tsx ✅ 
- [x] DocsManager.tsx ✅

## Benefits
1. **Data Persistence**: Form data survives page navigation
2. **Auto-save**: Automatically saves drafts every 2 seconds
3. **User Experience**: Shows draft notifications and save indicators
4. **Conflict Resolution**: Handles editing vs. creating scenarios
5. **Clean Cleanup**: Clears drafts after successful submissions

## Testing
1. Fill out a form partially
2. Navigate to another page (e.g., /docs or /chat)
3. Return to the form
4. Should see draft notification
5. Choose "Restore Draft" to continue where you left off
