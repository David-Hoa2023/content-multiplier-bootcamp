'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  GitBranch,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Clock,
  FileText,
  Eye,
  ThumbsUp,
  Send,
  History,
  RefreshCw,
  Settings,
  ChevronRight
} from 'lucide-react'

export interface StateTransitionRule {
  from: string
  to: string[]
  description?: string
}

export interface StateLogEntry {
  id: string
  timestamp: string
  from: string
  to: string
  success: boolean
  message?: string
}

export interface StateMachineValidatorProps {
  currentState: string
  nextState?: string
  onValidate: (isValid: boolean, message?: string) => void
  customRules?: StateTransitionRule[]
  stateHistory?: StateLogEntry[]
  onStateChange?: (newState: string) => void
  className?: string
}

const defaultStates = ['draft', 'review', 'approved', 'published']

const defaultRules: StateTransitionRule[] = [
  { from: 'draft', to: ['review'], description: 'Submit for review' },
  { from: 'review', to: ['draft', 'approved'], description: 'Send back to draft or approve' },
  { from: 'approved', to: ['published', 'review'], description: 'Publish or send back for review' },
  { from: 'published', to: [], description: 'Final state - no transitions allowed' }
]

const stateDescriptions = {
  draft: 'Content is being created or edited',
  review: 'Content is under review by stakeholders',
  approved: 'Content has been approved and ready to publish',
  published: 'Content is live and published'
}

export function StateMachineValidator({
  currentState,
  nextState: propNextState,
  onValidate,
  customRules,
  stateHistory = [],
  onStateChange,
  className = ''
}: StateMachineValidatorProps) {
  const [selectedNextState, setSelectedNextState] = useState<string>(propNextState || '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [localHistory, setLocalHistory] = useState<StateLogEntry[]>(stateHistory)
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  const rules = customRules || defaultRules
  const states = useMemo(() => {
    const stateSet = new Set<string>()
    rules.forEach(rule => {
      stateSet.add(rule.from)
      rule.to.forEach(state => stateSet.add(state))
    })
    return Array.from(stateSet)
  }, [rules])

  const currentRule = useMemo(() => {
    return rules.find(rule => rule.from === currentState)
  }, [currentState, rules])

  const availableTransitions = useMemo(() => {
    return currentRule?.to || []
  }, [currentRule])

  useEffect(() => {
    if (propNextState && propNextState !== selectedNextState) {
      setSelectedNextState(propNextState)
      validateTransition(currentState, propNextState)
    }
  }, [propNextState])

  const validateTransition = (from: string, to: string) => {
    setIsValidating(true)
    setValidationError(null)

    setTimeout(() => {
      const rule = rules.find(r => r.from === from)
      const isValid = rule ? rule.to.includes(to) : false
      
      let message = ''
      if (!rule) {
        message = `No transition rules defined for state "${from}"`
      } else if (!isValid) {
        message = `Invalid transition: "${from}" → "${to}". Allowed transitions: ${rule.to.length > 0 ? rule.to.join(', ') : 'none'}`
      } else {
        message = `Valid transition: "${from}" → "${to}"`
      }

      setValidationError(isValid ? null : message)
      onValidate(isValid, message)
      
      // Add to history
      const newEntry: StateLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        from,
        to,
        success: isValid,
        message
      }
      setLocalHistory(prev => [newEntry, ...prev])
      
      // Show toast
      toast({
        title: isValid ? "Transition Valid" : "Transition Invalid",
        description: message,
        variant: isValid ? "default" : "destructive",
      })
      
      setIsValidating(false)
    }, 500) // Simulate validation delay
  }

  const handleTransition = () => {
    if (!selectedNextState) {
      toast({
        title: "No state selected",
        description: "Please select a state to transition to",
        variant: "destructive",
      })
      return
    }

    validateTransition(currentState, selectedNextState)
    
    if (onStateChange && availableTransitions.includes(selectedNextState)) {
      onStateChange(selectedNextState)
    }
  }

  const getStateBadge = (state: string) => {
    const variants: Record<string, any> = {
      draft: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: <FileText className="h-3 w-3" /> },
      review: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: <Eye className="h-3 w-3" /> },
      approved: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: <ThumbsUp className="h-3 w-3" /> },
      published: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <Send className="h-3 w-3" /> }
    }
    
    const variant = variants[state] || { className: "bg-gray-100 text-gray-800", icon: <Info className="h-3 w-3" /> }
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${variant.className} flex items-center gap-1`}>
            {variant.icon}
            {state}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {stateDescriptions[state as keyof typeof stateDescriptions] || 'Custom state'}
        </TooltipContent>
      </Tooltip>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timestamp
    }
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Current State and Transition Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-500" />
              State Machine Validator
            </CardTitle>
            <CardDescription>
              Validate and manage content pack state transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current State Display */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Current State:</span>
                <motion.div
                  key={currentState}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {getStateBadge(currentState)}
                </motion.div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {availableTransitions.length} available transitions
              </div>
            </motion.div>

            {/* State Transition Control */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Select Next State</label>
                  <Select value={selectedNextState} onValueChange={setSelectedNextState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a state to transition to" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTransitions.length > 0 ? (
                        availableTransitions.map(state => (
                          <SelectItem key={state} value={state}>
                            <div className="flex items-center gap-2">
                              {state}
                              <ChevronRight className="h-3 w-3" />
                              {getStateBadge(state)}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No transitions available from this state
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleTransition}
                  disabled={!selectedNextState || availableTransitions.length === 0 || isValidating}
                  className="gap-2"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Validate & Transition
                    </>
                  )}
                </Button>
              </div>
              
              {/* Transition Preview */}
              {selectedNextState && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-background"
                >
                  {getStateBadge(currentState)}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  {getStateBadge(selectedNextState)}
                </motion.div>
              )}
            </div>

            {/* Validation Error Alert */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Transition</AlertTitle>
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* State Transition Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              State Transition Rules
            </CardTitle>
            <CardDescription>
              Valid state transitions and their descriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From State</TableHead>
                  <TableHead>Allowed Transitions</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule, index) => (
                  <motion.tr
                    key={`${rule.from}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={rule.from === currentState ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStateBadge(rule.from)}
                        {rule.from === currentState && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.to.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {rule.to.map(state => (
                            <div key={state} className="flex items-center gap-1">
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              {getStateBadge(state)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No transitions (final state)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {rule.description || 'No description'}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* State Transition History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transition History
            </CardTitle>
            <CardDescription>
              Recent state transition attempts and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {localHistory.length > 0 ? (
              <ScrollArea className="h-64 w-full">
                <div className="space-y-3">
                  {localHistory.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                    >
                      <div className="flex-shrink-0">
                        {entry.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getStateBadge(entry.from)}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          {getStateBadge(entry.to)}
                        </div>
                        {entry.message && (
                          <p className="text-xs text-muted-foreground">{entry.message}</p>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mb-4" />
                <p className="text-sm">No transition history yet</p>
                <p className="text-xs">Transitions will appear here as they occur</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* State Diagram Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              State Flow Diagram
            </CardTitle>
            <CardDescription>
              Visual representation of the state machine flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 p-8 overflow-x-auto">
              {defaultStates.map((state, index) => (
                <div key={state} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative ${state === currentState ? 'scale-110' : ''}`}
                  >
                    <div className={`p-4 rounded-lg border-2 ${
                      state === currentState 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted bg-background'
                    }`}>
                      {getStateBadge(state)}
                    </div>
                    {state === currentState && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {index < defaultStates.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="mx-2"
                    >
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}