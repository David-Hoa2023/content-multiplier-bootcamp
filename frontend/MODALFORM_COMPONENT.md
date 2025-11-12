# ModalForm Component Documentation

## Tổng quan

`ModalForm` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, cung cấp form trong modal popup với validation, animations và auto-save features.

## Features

- ✅ **Modal Form**: Dialog-based form với responsive design
- ✅ **Form Validation**: Zod schema validation với React Hook Form
- ✅ **Create/Edit Modes**: Automatic detection dựa trên initialData
- ✅ **Loading States**: Spinner và disabled states khi submitting
- ✅ **Toast Notifications**: Success/error feedback tự động
- ✅ **Smooth Animations**: Framer Motion transitions và staggered fields
- ✅ **Auto-reset**: Form reset khi close modal
- ✅ **Error Handling**: Field-level và form-level error display
- ✅ **Dark Mode Support**: Automatic theme adaptation
- ✅ **Responsive Design**: Mobile-friendly layout

## Installation

### Dependencies

```bash
npm install react-hook-form @hookform/resolvers zod framer-motion
```

### shadcn/ui Components

```bash
npx shadcn@latest add dialog form input textarea select button label toast
```

## Basic Usage

### Simple Create Form

```tsx
import { ModalForm, type FormData } from '@/components/ui/modal-form'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (data: FormData) => {
    // API call to create
    await api.createIdea(data)
    console.log('Created:', data)
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Tạo ý tưởng
      </Button>
      
      <ModalForm
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
```

### Edit Form với Initial Data

```tsx
const [editData, setEditData] = useState(null)
const [isEditOpen, setIsEditOpen] = useState(false)

const handleEdit = (idea) => {
  setEditData(idea)
  setIsEditOpen(true)
}

const handleUpdate = async (data: FormData) => {
  await api.updateIdea(editData.id, data)
  console.log('Updated:', data)
}

return (
  <ModalForm
    open={isEditOpen}
    onClose={() => {
      setIsEditOpen(false)
      setEditData(null)
    }}
    onSubmit={handleUpdate}
    initialData={editData}
  />
)
```

## Props

### ModalForm Props

```tsx
interface ModalFormProps {
  open: boolean                          // Modal open state (required)
  onClose: () => void                   // Close handler (required)
  onSubmit: (data: FormData) => Promise<void> | void  // Submit handler (required)
  initialData?: Partial<FormData>       // Initial form data for edit mode
  title?: string                        // Custom modal title
  description?: string                  // Custom modal description
  className?: string                    // Additional CSS classes
}
```

### FormData Type

```tsx
interface FormData {
  title: string                         // 1-100 characters
  description: string                   // 1-500 characters
  persona: string                       // 1-50 characters
  industry: string                      // From predefined list
  status: 'draft' | 'selected' | 'archived'  // Enum values
}
```

## Form Fields

### Title Field
- **Type**: Input
- **Validation**: Required, 1-100 characters
- **Placeholder**: "Nhập tiêu đề ý tưởng..."

### Description Field
- **Type**: Textarea (4 rows)
- **Validation**: Required, 1-500 characters
- **Placeholder**: "Mô tả chi tiết về ý tưởng..."

### Persona Field
- **Type**: Input
- **Validation**: Required, 1-50 characters
- **Placeholder**: "Ví dụ: Gen Z Food Lovers..."

### Industry Field
- **Type**: Select dropdown
- **Options**: Technology, Healthcare, Finance, Education, Retail, F&B, Fashion, Travel, Real Estate, Automotive, Entertainment, Other
- **Validation**: Required

### Status Field
- **Type**: Select dropdown
- **Options**: Draft (Nháp), Selected (Đã chọn), Archived (Lưu trữ)
- **Validation**: Required
- **Default**: 'draft'

## Validation Schema

```typescript
const formSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề là bắt buộc")
    .max(100, "Tiêu đề không được quá 100 ký tự"),
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .max(500, "Mô tả không được quá 500 ký tự"),
  persona: z
    .string()
    .min(1, "Persona là bắt buộc")
    .max(50, "Persona không được quá 50 ký tự"),
  industry: z
    .string()
    .min(1, "Ngành nghề là bắt buộc"),
  status: z
    .enum(['draft', 'selected', 'archived'], {
      required_error: "Trạng thái là bắt buộc",
    }),
})
```

## Features Detail

### Create vs Edit Mode

Component tự động detect mode dựa trên `initialData`:

```tsx
const isEdit = Boolean(initialData && Object.keys(initialData).length > 0)

// Auto-generated title
const modalTitle = isEdit ? 'Chỉnh sửa ý tưởng' : 'Tạo ý tưởng mới'

// Auto-generated description  
const modalDescription = isEdit 
  ? 'Cập nhật thông tin ý tưởng của bạn'
  : 'Thêm ý tưởng mới vào danh sách'

// Different icons và button text
{isEdit ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
```

### Auto-reset Form

Form được reset trong 2 trường hợp:

1. **Khi modal mở**: Load initialData hoặc default values
2. **Khi modal đóng**: Reset về default values (với delay cho animation)

```tsx
// Reset khi modal opens
useEffect(() => {
  if (open) {
    reset({
      title: '',
      description: '',
      persona: '',
      industry: '',
      status: 'draft',
      ...initialData,
    })
  }
}, [open, initialData, reset])

// Reset khi modal closes
useEffect(() => {
  if (!open) {
    const timer = setTimeout(() => {
      reset(defaultValues)
    }, 200)  // Delay cho exit animation
    return () => clearTimeout(timer)
  }
}, [open, reset])
```

### Loading States

```tsx
const { formState: { isSubmitting } } = form

// Disable form controls
<Input disabled={isSubmitting} />
<Select disabled={isSubmitting}>

// Prevent modal close khi submitting
onPointerDownOutside={(e) => {
  if (isSubmitting) {
    e.preventDefault()
  }
}}

// Button loading state
{isSubmitting ? (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
  </div>
) : (
  <div className="flex items-center gap-2">
    {isEdit ? <Edit /> : <Plus />}
    {isEdit ? 'Cập nhật' : 'Tạo mới'}
  </div>
)}
```

### Toast Notifications

Automatic toast notifications cho success và error:

```tsx
const handleFormSubmit = async (data: FormData) => {
  try {
    await onSubmit(data)
    
    // Success toast
    toast({
      title: isEdit ? "Cập nhật thành công" : "Tạo mới thành công",
      description: isEdit 
        ? "Ý tưởng đã được cập nhật thành công."
        : "Ý tưởng mới đã được tạo thành công.",
    })
    
    onClose()
  } catch (error) {
    // Error toast
    toast({
      title: "Có lỗi xảy ra",
      description: error.message || "Không thể lưu ý tưởng. Vui lòng thử lại.",
      variant: "destructive",
    })
  }
}
```

## Animations

### Modal Entry/Exit

```tsx
const contentVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 }
  }
}
```

### Field Stagger Animation

```tsx
const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

// Usage
<motion.div
  variants={fieldVariants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 0.1 * index }}
>
  <FormField />
</motion.div>
```

### Button State Animation

```tsx
<AnimatePresence mode="wait">
  {isSubmitting ? (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      Loading content
    </motion.div>
  ) : (
    <motion.div key="default">
      Default content
    </motion.div>
  )}
</AnimatePresence>
```

## Error Handling

### Field-level Errors

```tsx
<FormField
  render={({ field }) => (
    <FormItem>
      <FormLabel>Title</FormLabel>
      <FormControl>
        <Input
          className={cn(
            "transition-all duration-200",
            errors.title && "border-destructive focus-visible:ring-destructive"
          )}
          {...field}
        />
      </FormControl>
      <FormMessage />  {/* Shows field error */}
    </FormItem>
  )}
/>
```

### Form-level Error Summary

```tsx
<AnimatePresence>
  {hasErrors && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
    >
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Vui lòng kiểm tra lại các trường bắt buộc</span>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

## Customization

### Custom Options

```tsx
// Custom industry options
const customIndustries = [
  { value: 'tech', label: 'Technology' },
  { value: 'health', label: 'Healthcare' },
  // Add more...
]

// Custom status options
const customStatuses = [
  { value: 'draft', label: 'Draft', color: 'text-gray-600' },
  { value: 'review', label: 'Under Review', color: 'text-yellow-600' },
  { value: 'approved', label: 'Approved', color: 'text-green-600' },
]
```

### Custom Validation

```tsx
const customSchema = z.object({
  title: z.string().min(5, "Title quá ngắn").max(200, "Title quá dài"),
  description: z.string().min(10, "Description quá ngắn"),
  // Custom fields
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.date(),
})
```

### Custom Styling

```tsx
<ModalForm
  className="max-w-4xl"  // Larger modal
  title="Custom Title"
  description="Custom description"
/>
```

## Usage Patterns

### CRUD Operations

```tsx
function IdeaManager() {
  const [ideas, setIdeas] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const handleCreate = async (data: FormData) => {
    const newIdea = await api.createIdea(data)
    setIdeas(prev => [newIdea, ...prev])
    setIsCreateOpen(false)
  }

  const handleEdit = (idea) => {
    setEditData(idea)
  }

  const handleUpdate = async (data: FormData) => {
    const updated = await api.updateIdea(editData.id, data)
    setIdeas(prev => prev.map(idea => 
      idea.id === editData.id ? updated : idea
    ))
    setEditData(null)
  }

  return (
    <>
      <Button onClick={() => setIsCreateOpen(true)}>
        Add Idea
      </Button>

      <ModalForm
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ModalForm
        open={Boolean(editData)}
        onClose={() => setEditData(null)}
        onSubmit={handleUpdate}
        initialData={editData}
      />
    </>
  )
}
```

### With React Query

```tsx
function IdeaManagerWithQuery() {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: api.createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas'])
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateIdea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas'])
    }
  })

  const handleCreate = async (data: FormData) => {
    await createMutation.mutateAsync(data)
  }

  const handleUpdate = async (data: FormData) => {
    await updateMutation.mutateAsync({ 
      id: editData.id, 
      data 
    })
  }

  return (
    <ModalForm
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={editData ? handleUpdate : handleCreate}
      initialData={editData}
    />
  )
}
```

### With Form Context

```tsx
function FormWithContext() {
  const { user } = useAuth()
  
  const handleSubmit = async (data: FormData) => {
    // Add user context
    const ideaData = {
      ...data,
      userId: user.id,
      createdBy: user.name
    }
    
    await api.createIdea(ideaData)
  }

  return (
    <ModalForm
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      initialData={{
        // Pre-fill based on user context
        persona: user.defaultPersona,
        industry: user.industry,
        status: 'draft'
      }}
    />
  )
}
```

## Advanced Examples

### Multi-step Form

```tsx
function MultiStepIdeaForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})

  const handleStep1Submit = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  const handleFinalSubmit = async (data) => {
    const finalData = { ...formData, ...data }
    await api.createIdea(finalData)
  }

  return (
    <>
      {step === 1 && (
        <ModalForm
          title="Bước 1: Thông tin cơ bản"
          onSubmit={handleStep1Submit}
          // Custom fields for step 1
        />
      )}
      
      {step === 2 && (
        <ModalForm
          title="Bước 2: Chi tiết"
          onSubmit={handleFinalSubmit}
          initialData={formData}
          // Custom fields for step 2
        />
      )}
    </>
  )
}
```

### Conditional Fields

```tsx
function ConditionalForm() {
  const watchIndustry = form.watch('industry')
  const showExtraFields = watchIndustry === 'technology'

  return (
    <ModalForm
      // Add conditional fields based on industry
      extraFields={showExtraFields && (
        <FormField name="techStack">
          <FormLabel>Tech Stack</FormLabel>
          <FormControl>
            <Input placeholder="React, Node.js..." />
          </FormControl>
        </FormField>
      )}
    />
  )
}
```

## Best Practices

1. **Form State Management**:
   - Always handle loading states
   - Provide clear error messages
   - Reset form when modal closes

2. **User Experience**:
   - Disable form when submitting
   - Prevent modal close during submission
   - Show progress feedback

3. **Validation**:
   - Use proper Zod schemas
   - Validate on client and server
   - Show field-level errors immediately

4. **Performance**:
   - Avoid unnecessary re-renders
   - Use proper useEffect dependencies
   - Optimize animation performance

5. **Accessibility**:
   - Proper ARIA labels
   - Keyboard navigation support
   - Focus management

6. **Error Handling**:
   - Handle network errors gracefully
   - Provide actionable error messages
   - Log errors for debugging

## Troubleshooting

### Form không reset
- Kiểm tra useEffect dependencies
- Verify reset() được call với đúng values
- Check modal open/close timing

### Validation không hoạt động
- Kiểm tra Zod schema syntax
- Verify zodResolver setup
- Check field names match schema

### Animation stuttering
- Kiểm tra AnimatePresence usage
- Verify motion component keys
- Optimize animation performance

### Toast không hiển thị
- Đảm bảo Toaster component được render
- Kiểm tra toast hook import
- Verify error handling logic

## Demo

Truy cập `/demo-modal-form` để xem demo đầy đủ tính năng của ModalForm component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Base components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Framer Motion** - Animations