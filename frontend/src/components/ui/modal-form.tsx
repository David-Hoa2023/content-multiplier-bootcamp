"use client"

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Loader2, 
  Plus, 
  Edit, 
  X,
  AlertCircle
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Form schema with validation
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
      message: "Trạng thái là bắt buộc",
    }),
})

export type FormData = z.infer<typeof formSchema>

export interface ModalFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void> | void
  initialData?: Partial<FormData>
  title?: string
  description?: string
  className?: string
}

// Industry options
const industries = [
  { value: 'technology', label: 'Công nghệ' },
  { value: 'healthcare', label: 'Y tế' },
  { value: 'finance', label: 'Tài chính' },
  { value: 'education', label: 'Giáo dục' },
  { value: 'retail', label: 'Bán lẻ' },
  { value: 'food-beverage', label: 'Thực phẩm & Đồ uống' },
  { value: 'fashion', label: 'Thời trang' },
  { value: 'travel', label: 'Du lịch' },
  { value: 'real-estate', label: 'Bất động sản' },
  { value: 'automotive', label: 'Ô tô' },
  { value: 'entertainment', label: 'Giải trí' },
  { value: 'other', label: 'Khác' },
]

// Status options
const statusOptions = [
  { value: 'draft', label: 'Nháp', color: 'text-gray-600' },
  { value: 'selected', label: 'Đã chọn', color: 'text-blue-600' },
  { value: 'archived', label: 'Lưu trữ', color: 'text-red-600' },
]

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

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
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2
    }
  }
}

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
}

export function ModalForm({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  className
}: ModalFormProps) {
  const isEdit = Boolean(initialData && Object.keys(initialData).length > 0)
  const modalTitle = title || (isEdit ? 'Chỉnh sửa ý tưởng' : 'Tạo ý tưởng mới')
  const modalDescription = description || (isEdit ? 'Cập nhật thông tin ý tưởng của bạn' : 'Thêm ý tưởng mới vào danh sách')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      persona: '',
      industry: '',
      status: 'draft',
      ...initialData,
    },
  })

  const { 
    handleSubmit, 
    formState: { isSubmitting, errors }, 
    reset,
    watch 
  } = form

  // Watch form values for debugging
  const watchedValues = watch()

  // Reset form when modal opens/closes or initialData changes
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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow exit animation to complete
      const timer = setTimeout(() => {
        reset({
          title: '',
          description: '',
          persona: '',
          industry: '',
          status: 'draft',
        })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open, reset])

  const handleFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      
      toast({
        title: isEdit ? "Cập nhật thành công" : "Tạo mới thành công",
        description: isEdit 
          ? "Ý tưởng đã được cập nhật thành công."
          : "Ý tưởng mới đã được tạo thành công.",
      })
      
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
      
      toast({
        title: "Có lỗi xảy ra",
        description: error instanceof Error 
          ? error.message 
          : "Không thể lưu ý tưởng. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
        onPointerDownOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {isEdit ? (
                    <Edit className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Plus className="h-5 w-5 text-green-500" />
                  )}
                  {modalTitle}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {modalDescription}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 mt-6">
                  <div className="space-y-4">
                    {/* Title Field */}
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 }}
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Tiêu đề <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập tiêu đề ý tưởng..."
                                disabled={isSubmitting}
                                className={cn(
                                  "transition-all duration-200",
                                  errors.title && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Description Field */}
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.2 }}
                    >
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Mô tả <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Mô tả chi tiết về ý tưởng..."
                                rows={4}
                                disabled={isSubmitting}
                                className={cn(
                                  "resize-none transition-all duration-200",
                                  errors.description && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Persona Field */}
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.3 }}
                    >
                      <FormField
                        control={form.control}
                        name="persona"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Persona <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ví dụ: Gen Z Food Lovers..."
                                disabled={isSubmitting}
                                className={cn(
                                  "transition-all duration-200",
                                  errors.persona && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Industry and Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Industry Field */}
                      <motion.div
                        variants={fieldVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                      >
                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Ngành nghề <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger className={cn(
                                    "transition-all duration-200",
                                    errors.industry && "border-destructive focus:ring-destructive"
                                  )}>
                                    <SelectValue placeholder="Chọn ngành nghề" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {industries.map((industry) => (
                                    <SelectItem key={industry.value} value={industry.value}>
                                      {industry.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Status Field */}
                      <motion.div
                        variants={fieldVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                      >
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Trạng thái <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger className={cn(
                                    "transition-all duration-200",
                                    errors.status && "border-destructive focus:ring-destructive"
                                  )}>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      <div className={cn("flex items-center", status.color)}>
                                        {status.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Error Summary */}
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
                          <span className="text-sm font-medium">
                            Vui lòng kiểm tra lại các trường bắt buộc
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6 }}
                    className="flex justify-end gap-3 pt-4 border-t"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="min-w-[100px]"
                    >
                      Hủy
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[120px] gap-2"
                    >
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            {isEdit ? (
                              <>
                                <Edit className="h-4 w-4" />
                                Cập nhật
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Tạo mới
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default ModalForm