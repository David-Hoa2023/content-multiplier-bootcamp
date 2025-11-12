'use client'

import { useState } from 'react'
import { StateMachineValidator, type StateLogEntry, type StateTransitionRule } from '@/components/ui/state-machine-validator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  RefreshCw,
  GitBranch,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  FileText,
  Eye,
  ThumbsUp,
  Send
} from 'lucide-react'

// Default state machine configuration
const defaultStates = ['draft', 'review', 'approved', 'published']

// Custom state machine configuration for demo
const customRules: StateTransitionRule[] = [
  { from: 'draft', to: ['review', 'trash'], description: 'Submit for review or move to trash' },
  { from: 'review', to: ['draft', 'approved', 'rejected'], description: 'Send back, approve, or reject' },
  { from: 'approved', to: ['published', 'review', 'scheduled'], description: 'Publish, review again, or schedule' },
  { from: 'scheduled', to: ['published', 'approved'], description: 'Publish or move back to approved' },
  { from: 'published', to: ['archived'], description: 'Archive published content' },
  { from: 'rejected', to: ['draft', 'trash'], description: 'Send back to draft or trash' },
  { from: 'archived', to: [], description: 'Final state - archived content' },
  { from: 'trash', to: ['draft'], description: 'Restore from trash to draft' }
]

const customStates = ['draft', 'review', 'approved', 'scheduled', 'published', 'rejected', 'archived', 'trash']

export default function DemoStateMachinePage() {
  const [currentState, setCurrentState] = useState<string>('draft')
  const [useCustomRules, setUseCustomRules] = useState<boolean>(false)
  const [stateHistory, setStateHistory] = useState<StateLogEntry[]>([])
  const { toast } = useToast()

  const handleValidate = (isValid: boolean, message?: string) => {
    console.log('Validation result:', { isValid, message })
  }

  const handleStateChange = (newState: string) => {
    const oldState = currentState
    setCurrentState(newState)
    
    // Add to history
    const newEntry: StateLogEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      from: oldState,
      to: newState,
      success: true,
      message: `Successfully transitioned from ${oldState} to ${newState}`
    }
    setStateHistory(prev => [newEntry, ...prev])
    
    toast({
      title: "State Changed",
      description: `Content pack moved from ${oldState} to ${newState}`,
    })
  }

  const resetDemo = () => {
    setCurrentState('draft')
    setStateHistory([])
    toast({
      title: "Demo Reset",
      description: "State machine has been reset to initial state",
    })
  }

  const addRandomHistoryEntry = () => {
    const states = useCustomRules ? customStates : defaultStates
    const fromState = states[Math.floor(Math.random() * states.length)]
    const toState = states[Math.floor(Math.random() * states.length)]
    const success = Math.random() > 0.3
    
    const newEntry: StateLogEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      from: fromState,
      to: toState,
      success,
      message: success 
        ? `Successfully transitioned from ${fromState} to ${toState}`
        : `Failed to transition from ${fromState} to ${toState}: Invalid state transition`
    }
    
    setStateHistory(prev => [...prev, newEntry].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
    
    toast({
      title: "History Entry Added",
      description: "A random history entry has been added",
    })
  }

  const getStateBadge = (state: string) => {
    const variants: Record<string, any> = {
      draft: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: <FileText className="h-3 w-3" /> },
      review: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: <Eye className="h-3 w-3" /> },
      approved: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: <ThumbsUp className="h-3 w-3" /> },
      published: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <Send className="h-3 w-3" /> },
      scheduled: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: <Info className="h-3 w-3" /> },
      rejected: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: <XCircle className="h-3 w-3" /> },
      archived: { className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200", icon: <Info className="h-3 w-3" /> },
      trash: { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: <XCircle className="h-3 w-3" /> }
    }
    
    const variant = variants[state] || { className: "bg-gray-100 text-gray-800", icon: <Info className="h-3 w-3" /> }
    
    return (
      <Badge className={`${variant.className} flex items-center gap-1`}>
        {variant.icon}
        {state}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">StateMachineValidator Demo</h1>
            <p className="text-muted-foreground">
              Demo component for validating content pack state transitions với custom rules support.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <GitBranch className="h-3 w-3" />
              {currentState}
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="custom">Custom Rules</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Demo Controls
              </CardTitle>
              <CardDescription>
                Test các tính năng của StateMachineValidator component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current State</label>
                  <Select value={currentState} onValueChange={setCurrentState}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(useCustomRules ? customStates : defaultStates).map(state => (
                        <SelectItem key={state} value={state}>
                          <div className="flex items-center gap-2">
                            {getStateBadge(state)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rule Set</label>
                  <Select value={useCustomRules ? 'custom' : 'default'} onValueChange={(val) => setUseCustomRules(val === 'custom')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Rules (4 states)</SelectItem>
                      <SelectItem value="custom">Custom Rules (8 states)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button onClick={addRandomHistoryEntry} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random History
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Chọn state từ dropdown để test các transitions khác nhau</p>
                <p>• Sử dụng dropdown "Select Next State" để chọn state tiếp theo</p>
                <p>• Click "Validate & Transition" để kiểm tra và chuyển state</p>
                <p>• Xem lịch sử transitions trong History section</p>
                <p>• Switch giữa Default và Custom rules để test các scenarios khác nhau</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <StateMachineValidator
            currentState={currentState}
            onValidate={handleValidate}
            customRules={useCustomRules ? customRules : undefined}
            stateHistory={stateHistory}
            onStateChange={handleStateChange}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• State transition validation logic</li>
                  <li>• Visual state badges với color coding</li>
                  <li>• Transition rules table display</li>
                  <li>• Current state highlighting</li>
                  <li>• Tooltips giải thích từng state</li>
                  <li>• Dark mode support hoàn toàn</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Dropdown selection cho next state</li>
                  <li>• State transition history log</li>
                  <li>• Custom rules configuration</li>
                  <li>• Toast notifications cho feedback</li>
                  <li>• Smooth animations với Framer Motion</li>
                  <li>• Visual state flow diagram</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  Validation Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Real-time transition validation</li>
                  <li>• Error messages cho invalid transitions</li>
                  <li>• Available transitions display</li>
                  <li>• Transition preview visualization</li>
                  <li>• Success/failure status tracking</li>
                  <li>• Callback functions cho validation results</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-orange-500" />
                  Default States
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStateBadge('draft')}
                    <ArrowRight className="h-3 w-3" />
                    {getStateBadge('review')}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStateBadge('review')}
                    <ArrowRight className="h-3 w-3" />
                    {getStateBadge('approved')}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStateBadge('approved')}
                    <ArrowRight className="h-3 w-3" />
                    {getStateBadge('published')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Rules Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom State Machine Configuration</CardTitle>
              <CardDescription>
                Example của custom rules với 8 states và complex transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Custom States</h4>
                <div className="flex flex-wrap gap-2">
                  {customStates.map(state => (
                    <div key={state}>{getStateBadge(state)}</div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Custom Transition Rules</h4>
                <div className="space-y-2 text-sm">
                  {customRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg border">
                      {getStateBadge(rule.from)}
                      <ArrowRight className="h-3 w-3" />
                      {rule.to.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {rule.to.map(state => (
                            <span key={state}>{getStateBadge(state)}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Final state</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Usage</CardTitle>
              <CardDescription>
                Cách sử dụng StateMachineValidator trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { StateMachineValidator } from '@/components/ui/state-machine-validator'

function MyComponent() {
  const [currentState, setCurrentState] = useState('draft')
  
  const handleValidate = (isValid, message) => {
    if (isValid) {
      console.log('Valid transition:', message)
    } else {
      console.error('Invalid transition:', message)
    }
  }
  
  const handleStateChange = (newState) => {
    setCurrentState(newState)
  }

  return (
    <StateMachineValidator
      currentState={currentState}
      onValidate={handleValidate}
      onStateChange={handleStateChange}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Custom Rules</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`const customRules = [
  { from: 'draft', to: ['review', 'trash'], description: 'Submit or trash' },
  { from: 'review', to: ['approved', 'rejected'], description: 'Approve or reject' },
  { from: 'approved', to: ['published'], description: 'Publish content' },
  { from: 'published', to: [], description: 'Final state' }
]

<StateMachineValidator
  currentState={currentState}
  onValidate={handleValidate}
  customRules={customRules}
  stateHistory={history}
  onStateChange={handleStateChange}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface StateMachineValidatorProps {
  currentState: string                               // Required: Current state
  nextState?: string                                 // Optional: Pre-selected next state
  onValidate: (isValid: boolean, message?: string) => void  // Required: Validation callback
  customRules?: StateTransitionRule[]               // Optional: Custom transition rules
  stateHistory?: StateLogEntry[]                    // Optional: Transition history
  onStateChange?: (newState: string) => void        // Optional: State change callback
  className?: string                                // Optional: Additional CSS classes
}

interface StateTransitionRule {
  from: string                                      // Source state
  to: string[]                                      // Allowed destination states
  description?: string                               // Rule description
}

interface StateLogEntry {
  id: string                                        // Unique identifier
  timestamp: string                                 // ISO timestamp
  from: string                                      // Source state
  to: string                                        // Destination state
  success: boolean                                  // Transition success status
  message?: string                                  // Optional message
}`}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}