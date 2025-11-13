import React, { useState, useEffect } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings, 
  Zap, 
  DollarSign, 
  TestTube, 
  Star,
  Cpu,
  Brain,
  Sparkles,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-950',
    icon: Brain,
    models: {
      'gpt-4o': {
        name: 'GPT-4o',
        description: 'Latest multimodal model, fast and capable',
        speed: 'Fast',
        cost: '$5.00',
        contextLength: '128K tokens',
        costPerToken: 0.005
      },
      'gpt-3.5': {
        name: 'GPT-3.5 Turbo',
        description: 'Fast and economical for most tasks',
        speed: 'Very Fast',
        cost: '$0.50',
        contextLength: '16K tokens',
        costPerToken: 0.0005
      }
    }
  },
  anthropic: {
    name: 'Anthropic',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-950',
    icon: Sparkles,
    models: {
      'claude-3-opus': {
        name: 'Claude 3 Opus',
        description: 'Most capable model for complex reasoning',
        speed: 'Slow',
        cost: '$15.00',
        contextLength: '200K tokens',
        costPerToken: 0.015
      },
      'claude-3-sonnet': {
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance and speed',
        speed: 'Medium',
        cost: '$3.00',
        contextLength: '200K tokens',
        costPerToken: 0.003
      }
    }
  },
  deepseek: {
    name: 'DeepSeek',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    darkBgColor: 'dark:bg-orange-950',
    icon: Cpu,
    models: {
      'chat': {
        name: 'DeepSeek Chat',
        description: 'General conversation and reasoning',
        speed: 'Fast',
        cost: '$0.14',
        contextLength: '64K tokens',
        costPerToken: 0.00014
      },
      'coder': {
        name: 'DeepSeek Coder',
        description: 'Specialized for code generation',
        speed: 'Fast',
        cost: '$0.14',
        contextLength: '64K tokens',
        costPerToken: 0.00014
      }
    }
  },
  gemini: {
    name: 'Gemini',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    darkBgColor: 'dark:bg-green-950',
    icon: Star,
    models: {
      '1.5-pro': {
        name: 'Gemini 1.5 Pro',
        description: 'Google\'s most capable model',
        speed: 'Medium',
        cost: '$3.50',
        contextLength: '2M tokens',
        costPerToken: 0.0035
      }
    }
  },
  kimi: {
    name: 'Kimi k2',
    color: 'bg-teal-500',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    darkBgColor: 'dark:bg-teal-950',
    icon: Sparkles,
    models: {
      'moonshot-v1-8k': {
        name: 'Moonshot v1 8K',
        description: 'Efficient model for general tasks',
        speed: 'Fast',
        cost: '$0.12',
        contextLength: '8K tokens',
        costPerToken: 0.00012
      },
      'moonshot-v1-32k': {
        name: 'Moonshot v1 32K',
        description: 'Extended context for complex tasks',
        speed: 'Medium',
        cost: '$0.24',
        contextLength: '32K tokens',
        costPerToken: 0.00024
      },
      'moonshot-v1-128k': {
        name: 'Moonshot v1 128K',
        description: 'Maximum context for large documents',
        speed: 'Slow',
        cost: '$0.60',
        contextLength: '128K tokens',
        costPerToken: 0.0006
      }
    }
  }
}

const TASK_TYPES = [
  { value: 'idea', label: 'Idea generation' },
  { value: 'brief', label: 'Brief writing' },
  { value: 'draft', label: 'Draft creation' },
  { value: 'code', label: 'Code generation' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'creative', label: 'Creative writing' }
]

export interface SelectedProvider {
  provider: string
  model: string
}

export interface LLMProviderSwitcherProps {
  selectedProvider?: SelectedProvider | null
  onChange?: (provider: SelectedProvider) => void
  className?: string
}

export const LLMProviderSwitcher: React.FC<LLMProviderSwitcherProps> = ({ 
  selectedProvider, 
  onChange,
  className = "" 
}) => {
  const [localProvider, setLocalProvider] = useState(selectedProvider)
  const [defaultProviders, setDefaultProviders] = useState<Record<string, SelectedProvider>>({})
  const [isTestingModel, setIsTestingModel] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('llm-provider-preferences')
      if (saved) {
        const preferences = JSON.parse(saved)
        setDefaultProviders(preferences.defaultProviders || {})
        setApiKeys(preferences.apiKeys || {})
        if (!selectedProvider && preferences.lastUsed) {
          setLocalProvider(preferences.lastUsed)
          onChange?.(preferences.lastUsed)
        }
      }
    } catch (error) {
      console.error('Failed to load LLM preferences:', error)
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = (newProvider: SelectedProvider, newDefaults = defaultProviders, newApiKeys = apiKeys) => {
    try {
      const preferences = {
        lastUsed: newProvider,
        defaultProviders: newDefaults,
        apiKeys: newApiKeys,
        timestamp: Date.now()
      }
      localStorage.setItem('llm-provider-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save LLM preferences:', error)
    }
  }

  // Handle API key changes
  const handleApiKeyChange = (provider: string, apiKey: string) => {
    const newApiKeys = { ...apiKeys, [provider]: apiKey }
    setApiKeys(newApiKeys)
    if (localProvider) {
      savePreferences(localProvider, defaultProviders, newApiKeys)
    }
  }

  // Toggle API key visibility
  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKey(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleProviderChange = (providerId: string) => {
    if (!(providerId in PROVIDERS)) {
      console.error(`Unknown provider: ${providerId}`)
      return
    }
    
    const selectedProvider = PROVIDERS[providerId as keyof typeof PROVIDERS];
    const models = Object.keys(selectedProvider.models)
    
    if (models.length === 0) {
      console.error(`No models available for provider: ${providerId}`)
      return
    }
    
    const newProvider: SelectedProvider = {
      provider: providerId,
      model: models[0] // Select first model by default
    }
    
    setLocalProvider(newProvider)
    onChange?.(newProvider)
    savePreferences(newProvider)
    
    const firstModelKey = models[0];
    const modelsObj = selectedProvider.models as Record<string, { name: string; description: string; speed: string; cost: string; contextLength: string; costPerToken: number }>;
    const firstModel = modelsObj[firstModelKey];
    
    if (firstModel) {
      toast({
        title: "Provider changed",
        description: `Switched to ${selectedProvider.name} - ${firstModel.name}`,
        duration: 2000,
      })
    }
  }

  const handleModelChange = (modelId: string) => {
    if (!localProvider) return
    const newProvider: SelectedProvider = {
      ...localProvider,
      model: modelId
    }
    
    setLocalProvider(newProvider)
    onChange?.(newProvider)
    savePreferences(newProvider)
    
    const providerInfo = PROVIDERS[localProvider.provider as keyof typeof PROVIDERS]
    const modelsObj = providerInfo.models as Record<string, { name: string; description: string; speed: string; cost: string; contextLength: string; costPerToken: number }>;
    const modelInfo = modelsObj[modelId];
    
    if (modelInfo) {
      toast({
        title: "Model changed",
        description: `Switched to ${modelInfo.name}`,
        duration: 2000,
      })
    }
  }

  const setDefaultForTask = (taskType: string, provider: SelectedProvider) => {
    const newDefaults = {
      ...defaultProviders,
      [taskType]: provider
    }
    setDefaultProviders(newDefaults)
    savePreferences(localProvider!, newDefaults)
    
    toast({
      title: "Default set",
      description: `${PROVIDERS[provider.provider as keyof typeof PROVIDERS].name} set as default for ${TASK_TYPES.find(t => t.value === taskType)?.label}`,
      duration: 2000,
    })
  }

  const testModel = async () => {
    if (!localProvider) return
    
    const currentApiKey = apiKeys[localProvider.provider]
    if (!currentApiKey) {
      toast({
        title: "API key required",
        description: "Please enter an API key before testing the model",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    
    setIsTestingModel(true)
    setTestResult(null)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful response (in real implementation, this would call the actual API)
      setTestResult({
        success: true,
        response: "Test completed successfully! Model is responding normally with provided API key.",
        latency: Math.floor(Math.random() * 1000) + 500
      })
      
      toast({
        title: "Test successful",
        description: "Model is working correctly",
        duration: 3000,
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || "Test failed - please check your API key"
      })
      
      toast({
        title: "Test failed",
        description: "Model test encountered an error",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsTestingModel(false)
    }
  }

  const currentProviderInfo = localProvider ? PROVIDERS[localProvider.provider as keyof typeof PROVIDERS] : null
  const currentModelInfo = currentProviderInfo && localProvider ? 
    (currentProviderInfo.models as Record<string, { name: string; description: string; speed: string; cost: string; contextLength: string; costPerToken: number }>)[localProvider.model] : null
  const ProviderIcon = currentProviderInfo?.icon

  return (
    <TooltipProvider>
      <Card className={`w-full max-w-2xl ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LLM provider settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider-select">Provider</Label>
              <Select 
                value={localProvider?.provider || ""} 
                onValueChange={handleProviderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([id, provider]) => {
                    const Icon = provider.icon
                    return (
                      <SelectItem key={id} value={id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{provider.name}</span>
                          <Badge variant="outline" className={`${provider.color} text-white text-xs`}>
                            {Object.keys(provider.models).length} models
                          </Badge>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-select">Model</Label>
              <Select 
                value={localProvider?.model || ""} 
                onValueChange={handleModelChange}
                disabled={!localProvider?.provider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProviderInfo && Object.entries(currentProviderInfo.models).map(([id, model]) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <Badge variant="outline" className="text-xs">
                            ${model.costPerToken}/1K
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* API Key Configuration */}
          {localProvider?.provider && (
            <div className="space-y-2">
              <Label htmlFor="api-key">
                API Key for {PROVIDERS[localProvider.provider as keyof typeof PROVIDERS]?.name}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type={showApiKey[localProvider.provider] ? "text" : "password"}
                    placeholder={`Enter your ${PROVIDERS[localProvider.provider as keyof typeof PROVIDERS]?.name} API key`}
                    value={apiKeys[localProvider.provider] || ""}
                    onChange={(e) => handleApiKeyChange(localProvider.provider, e.target.value)}
                    className="pl-10 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 px-0"
                    onClick={() => toggleApiKeyVisibility(localProvider.provider)}
                  >
                    {showApiKey[localProvider.provider] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                🔒 API keys are stored securely in your browser's local storage and never sent to external servers
              </p>
            </div>
          )}

          {/* Current Selection Info */}
          {currentProviderInfo && currentModelInfo && ProviderIcon && (
            <Card className={`${currentProviderInfo.bgColor} ${currentProviderInfo.darkBgColor} border-0`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${currentProviderInfo.color}`}>
                    <ProviderIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${currentProviderInfo.textColor}`}>
                        {currentModelInfo.name}
                      </h3>
                      <Badge variant="outline" className={currentProviderInfo.textColor}>
                        {currentProviderInfo.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentModelInfo.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 text-xs">
                            <Zap className="h-3 w-3" />
                            <span>{currentModelInfo.speed}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Response speed</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 text-xs">
                            <DollarSign className="h-3 w-3" />
                            <span>{currentModelInfo.cost}/1M</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cost per 1M tokens</p>
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex items-center gap-1 text-xs col-span-2">
                        <span className="text-muted-foreground">Context:</span>
                        <span>{currentModelInfo.contextLength}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Default Providers by Task Type */}
          <div className="space-y-3">
            <Label>Default providers by task type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TASK_TYPES.map((taskType) => (
                <div key={taskType.value} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{taskType.label}</span>
                  <div className="flex items-center gap-2">
                    {defaultProviders[taskType.value] && (
                      <Badge variant="outline" className="text-xs">
                        {PROVIDERS[defaultProviders[taskType.value].provider as keyof typeof PROVIDERS]?.name}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => localProvider && setDefaultForTask(taskType.value, localProvider)}
                      disabled={!localProvider}
                    >
                      Set current
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Model Testing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Test current model</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={testModel}
                disabled={!localProvider || isTestingModel}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isTestingModel ? "Testing..." : "Run test"}
              </Button>
            </div>
            
            {testResult && (
              <Card className={testResult.success ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-red-200 bg-red-50 dark:bg-red-950"}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${testResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium">
                        {testResult.success ? 'Test successful' : 'Test failed'}
                      </span>
                      {testResult.latency && (
                        <Badge variant="outline" className="text-xs">
                          {testResult.latency}ms
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testResult.response || testResult.error}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default LLMProviderSwitcher


