'use client'

import { useState } from 'react'
import { PromptIterationTracker, type PromptIteration } from '@/components/ui/prompt-iteration-tracker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  RefreshCw,
  History,
  Plus,
  Settings,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Target,
  Zap,
  GitCompare,
  Play,
  Download,
  StickyNote,
  Sparkles
} from 'lucide-react'

const sampleIterations: PromptIteration[] = [
  {
    id: 'iter-001',
    prompt: 'Write a comprehensive marketing strategy for an AI-powered content creation platform targeting small businesses.',
    timestamp: '2024-11-04T10:30:00Z',
    output: 'AI-Powered Content Creation Platform Marketing Strategy\n\n1. Target Market Analysis\nSmall businesses (1-50 employees) struggling with content creation due to limited resources and expertise.\n\n2. Value Proposition\n- Reduce content creation time by 70%\n- Maintain professional quality without hiring specialists\n- Cost-effective solution compared to agencies\n\n3. Marketing Channels\n- Content marketing through blogs and case studies\n- Social media presence on LinkedIn and Twitter\n- Partnership with small business associations\n- Free trial and freemium model\n\n4. Key Metrics\n- Customer acquisition cost\n- Monthly recurring revenue\n- User engagement and retention rates',
    status: 'success',
    model: 'GPT-4',
    tokens_used: 450,
    execution_time: 2300,
    notes: 'Excellent comprehensive strategy. Could use more specific budget allocation details.'
  },
  {
    id: 'iter-002',
    prompt: 'Create a marketing strategy for AI content platform for small businesses. Include specific budget recommendations.',
    timestamp: '2024-11-04T11:15:00Z',
    output: 'Marketing Strategy with Budget Allocation\n\n1. Market Research & Analysis ($2,000/month)\n- Competitor analysis tools\n- Customer surveys and interviews\n- Market trend monitoring\n\n2. Content Marketing ($5,000/month)\n- Blog content creation (3-4 posts/week)\n- Video production (2 videos/month)\n- Infographic design\n- SEO optimization\n\n3. Paid Advertising ($8,000/month)\n- Google Ads: $4,000\n- LinkedIn Ads: $2,500\n- Facebook/Instagram: $1,500\n\n4. Partnership & Events ($3,000/month)\n- Industry conference participation\n- Partnership development\n- Webinar hosting\n\nTotal Monthly Budget: $18,000\nProjected ROI: 3.5x within 12 months',
    status: 'success',
    model: 'GPT-4',
    tokens_used: 520,
    execution_time: 2800,
    notes: 'Perfect! Added specific budget allocations as requested. Very actionable.'
  },
  {
    id: 'iter-003',
    prompt: 'Marketing strategy AI platform small business',
    timestamp: '2024-11-04T09:45:00Z',
    output: 'Basic Marketing Strategy:\n\n1. Identify target customers\n2. Create social media presence\n3. Use online advertising\n4. Offer free trials\n5. Get customer testimonials\n6. Partner with other businesses\n\nThis approach will help you reach small businesses and show them the value of your AI platform.',
    status: 'needs_improvement',
    model: 'GPT-3.5',
    tokens_used: 180,
    execution_time: 1200,
    notes: 'Too basic and generic. Prompt was too short and lacked context.'
  },
  {
    id: 'iter-004',
    prompt: 'Write detailed go-to-market strategy for AI content creation SaaS targeting SMBs with under $1M revenue. Include pricing, positioning, and 90-day launch plan.',
    timestamp: '2024-11-04T12:00:00Z',
    output: 'Go-to-Market Strategy for AI Content SaaS\n\n🎯 TARGET MARKET\nSMBs with <$1M revenue, specifically:\n- E-commerce stores\n- Local service businesses\n- Professional services (consultants, agencies)\n- SaaS startups\n\n💰 PRICING STRATEGY\nTiered pricing model:\n- Starter: $29/mo (5 content pieces)\n- Professional: $79/mo (25 content pieces)\n- Business: $199/mo (unlimited + team features)\n\n🏆 POSITIONING\n"The AI content co-pilot that helps small businesses create professional marketing content in minutes, not hours"\n\n📅 90-DAY LAUNCH PLAN\n\nDays 1-30: Foundation\n- Complete beta testing with 50 users\n- Finalize onboarding flow\n- Create initial content library (templates, examples)\n- Set up analytics and tracking\n\nDays 31-60: Pre-launch\n- Build email list of 1,000 prospects\n- Create launch content (demos, case studies)\n- Set up customer success processes\n- Recruit 10 design partners for testimonials\n\nDays 61-90: Launch & Scale\n- Public launch with ProductHunt\n- Activate paid advertising campaigns\n- Content marketing push (3 posts/week)\n- Partnership outreach to complementary tools\n\n📊 SUCCESS METRICS\n- 100 paying customers by day 90\n- $10,000 MRR\n- 2.5% free-to-paid conversion rate\n- <$100 customer acquisition cost',
    status: 'success',
    model: 'Claude-3',
    tokens_used: 680,
    execution_time: 3200,
    notes: 'Excellent detailed strategy with specific metrics and timeline. Very comprehensive.'
  },
  {
    id: 'iter-005',
    prompt: 'Create marketing plan for AI platform targeting businesses with revenue under $1M',
    timestamp: '2024-11-04T08:30:00Z',
    output: 'Error: The request was too broad and resulted in a generic response that did not meet the specific requirements for actionable marketing strategies.',
    status: 'failed',
    model: 'GPT-3.5',
    tokens_used: 50,
    execution_time: 800,
    notes: 'Failed due to lack of specificity in the prompt. Need to include more context and specific requirements.'
  },
  {
    id: 'iter-006',
    prompt: 'You are a senior marketing strategist with 15 years of experience in SaaS marketing. Create a comprehensive go-to-market strategy for an AI-powered content creation platform. The target market is small businesses with annual revenue under $1M who struggle with creating consistent, high-quality marketing content.\n\nInclude:\n1. Market segmentation and ideal customer profile\n2. Competitive positioning and unique value proposition\n3. Pricing strategy with justification\n4. Marketing channel mix and budget allocation\n5. 90-day launch timeline with specific milestones\n6. Key metrics and success criteria\n\nFormat the response with clear sections and actionable insights.',
    timestamp: '2024-11-04T13:30:00Z',
    output: '# Go-to-Market Strategy: AI Content Creation Platform\n\n## 1. MARKET SEGMENTATION & ICP\n\n### Primary Segments:\n**Segment A: E-commerce SMBs** (40% of TAM)\n- Revenue: $100K-$1M\n- Pain: Need product descriptions, social posts, email campaigns\n- Decision maker: Founder/Marketing Manager\n\n**Segment B: Professional Services** (35% of TAM)\n- Revenue: $200K-$800K\n- Pain: Thought leadership, case studies, proposals\n- Decision maker: Principal/Business Development\n\n**Segment C: Local Service Businesses** (25% of TAM)\n- Revenue: $50K-$500K\n- Pain: Local SEO content, social media, newsletters\n- Decision maker: Owner/Operations Manager\n\n### Ideal Customer Profile:\n- Company size: 1-25 employees\n- Current content creation: Manual/outsourced\n- Tech-savvy: Moderate to high\n- Budget: $50-$300/month for content tools\n\n## 2. POSITIONING & VALUE PROPOSITION\n\n### Primary Positioning:\n"The AI content co-pilot that transforms any small business into a content marketing machine"\n\n### Unique Value Props:\n- **Speed**: Create a month of content in 2 hours\n- **Quality**: Professional-grade copy without hiring specialists\n- **Consistency**: Never run out of content ideas\n- **Cost**: 90% cheaper than agencies or freelancers\n\n### Competitive Differentiation:\n- Industry-specific templates and prompts\n- Built-in brand voice training\n- Multi-format output (social, email, blog, ads)\n- Small business workflow optimization\n\n## 3. PRICING STRATEGY\n\n### Tiered SaaS Model:\n\n**Starter Plan: $39/month**\n- 20 content pieces/month\n- 3 brand voices\n- Basic templates\n- Email support\n*Target: Solo entrepreneurs, very small businesses*\n\n**Growth Plan: $99/month** ⭐ MOST POPULAR\n- 100 content pieces/month\n- Unlimited brand voices\n- Premium templates + custom prompts\n- Priority support + onboarding\n*Target: Growing SMBs with 2-10 employees*\n\n**Pro Plan: $249/month**\n- Unlimited content\n- Team collaboration (up to 10 users)\n- Custom integrations\n- Dedicated success manager\n*Target: Larger SMBs, agencies*\n\n### Pricing Justification:\n- Replaces $2,000-5,000/month agency costs\n- Saves 15-20 hours/week of content creation time\n- Delivers 5-10x ROI through consistent content marketing\n\n## 4. MARKETING CHANNEL MIX\n\n### Budget Allocation ($25,000/month):\n\n**Content Marketing (30% - $7,500)**\n- SEO-optimized blog content\n- YouTube tutorials and demos\n- Podcast appearances\n- Free tools and templates\n\n**Paid Acquisition (40% - $10,000)**\n- Google Ads: $6,000 (high-intent keywords)\n- LinkedIn Ads: $2,500 (B2B targeting)\n- Facebook/Instagram: $1,500 (lookalike audiences)\n\n**Partnerships (15% - $3,750)**\n- Integration partnerships (Shopify, HubSpot)\n- Affiliate program setup\n- Industry association sponsorships\n\n**Product-Led Growth (10% - $2,500)**\n- Free tier optimization\n- Referral program\n- In-app upgrade prompts\n\n**Events & PR (5% - $1,250)**\n- Small business conferences\n- Press outreach\n- Webinar series\n\n## 5. 90-DAY LAUNCH TIMELINE\n\n### Phase 1: Foundation (Days 1-30)\n**Week 1-2: Product Readiness**\n- Complete beta testing with 100 users\n- Finalize onboarding flow and UX\n- Set up analytics and tracking infrastructure\n- Create customer success playbooks\n\n**Week 3-4: Go-to-Market Assets**\n- Develop marketing website and landing pages\n- Create demo videos and case studies\n- Build email nurture sequences\n- Set up customer support systems\n\n### Phase 2: Market Preparation (Days 31-60)\n**Week 5-6: Audience Building**\n- Launch content marketing (3 posts/week)\n- Build email list to 2,000 subscribers\n- Establish social media presence\n- Begin SEO optimization\n\n**Week 7-8: Partnership Development**\n- Secure 3 key integration partnerships\n- Recruit 20 beta customers as references\n- Set up affiliate program\n- Plan launch event/webinar\n\n### Phase 3: Launch & Scale (Days 61-90)\n**Week 9-10: Public Launch**\n- ProductHunt launch (target #1 product of day)\n- Activate all paid advertising channels\n- Press release and media outreach\n- Launch referral program\n\n**Week 11-12: Optimization & Growth**\n- Analyze performance data\n- Optimize conversion funnels\n- Scale successful ad campaigns\n- Plan next phase expansion\n\n## 6. KEY METRICS & SUCCESS CRITERIA\n\n### 90-Day Targets:\n- **Customers**: 200 paying customers\n- **Revenue**: $15,000 MRR\n- **Growth Rate**: 20% month-over-month\n- **Conversion Rates**:\n  - Website visitor to trial: 5%\n  - Trial to paid: 15%\n  - Overall visitor to paid: 0.75%\n\n### Unit Economics:\n- **Customer Acquisition Cost (CAC)**: <$150\n- **Lifetime Value (LTV)**: >$1,200\n- **LTV:CAC Ratio**: >8:1\n- **Payback Period**: <6 months\n\n### Leading Indicators:\n- Website traffic: 25,000 monthly visitors\n- Trial signups: 1,250/month\n- Email subscribers: 5,000\n- Content engagement rate: >5%\n\n### Success Milestones:\n- Month 1: Product-market fit validation\n- Month 2: Repeatable acquisition channels\n- Month 3: Scalable growth engine\n\n---\n\n*This strategy positions the platform for rapid, sustainable growth while building a strong foundation for long-term success in the SMB market.*',
    status: 'success',
    model: 'Claude-3.5',
    tokens_used: 1250,
    execution_time: 4500,
    notes: 'Outstanding comprehensive strategy! Very detailed and actionable. The role-playing context made a huge difference.'
  },
  {
    id: 'iter-007',
    prompt: 'Generate social media content ideas for a productivity app',
    timestamp: '2024-11-03T16:20:00Z',
    output: 'Social Media Content Ideas:\n\n1. Tips Tuesday: Weekly productivity tips\n2. Feature Friday: Showcase app features\n3. User testimonials and success stories\n4. Behind-the-scenes content\n5. Productivity challenges\n6. Industry news and trends\n7. How-to tutorials\n8. Motivational quotes\n9. App updates and announcements\n10. User-generated content campaigns',
    status: 'needs_improvement',
    model: 'GPT-3.5',
    tokens_used: 220,
    execution_time: 1100,
    notes: 'Good ideas but too generic. Need more specific, creative concepts with actual content examples.'
  },
  {
    id: 'iter-008',
    prompt: 'Act as a creative social media strategist. Generate 20 specific, engaging social media content ideas for a productivity app called "FocusFlow" that helps remote workers manage distractions and stay focused. Include the post format, platform, and a brief description for each idea.',
    timestamp: '2024-11-03T17:00:00Z',
    output: '# 20 Engaging Social Media Content Ideas for FocusFlow\n\n## LinkedIn Content (Professional Focus)\n\n1. **"Remote Work Reality Check" Poll**\n   - Format: LinkedIn poll with image\n   - Content: "What\'s your biggest distraction while working from home?" with 4 options and tips in comments\n\n2. **"Focus Flow State" Case Study**\n   - Format: Carousel post\n   - Content: Before/after productivity metrics of a real user with FocusFlow implementation\n\n3. **"The Science of Focus" Educational Series**\n   - Format: Video + infographic\n   - Content: Weekly posts explaining neuroscience behind focus, attention spans, and deep work\n\n## Instagram Content (Visual & Inspirational)\n\n4. **"Desk Setup Sundays"**\n   - Format: User-generated content campaign\n   - Content: Users share their optimized workspaces with FocusFlow running, best setups featured\n\n5. **"Focus Challenge" Stories**\n   - Format: Instagram Stories with interactive stickers\n   - Content: 7-day challenges like "No phone for 2 hours" with progress tracking\n\n6. **"Productivity Mantras" Reels**\n   - Format: Short video with text overlay\n   - Content: Motivational phrases with aesthetic backgrounds and trending audio\n\n## Twitter/X Content (Quick Tips & Engagement)\n\n7. **"Focus Hack Friday" Thread**\n   - Format: Twitter thread\n   - Content: Weekly thread with 5-7 actionable focus techniques, encourage replies with user hacks\n\n8. **"Distraction Detective" Live Tweets**\n   - Format: Real-time tweet series\n   - Content: CEO/team members tweet their distraction encounters and how FocusFlow helped\n\n9. **"Remote Work Confession Booth"**\n   - Format: Quote tweets and replies\n   - Content: Share funny/relatable work-from-home confessions, respond with helpful tips\n\n## TikTok Content (Trendy & Educational)\n\n10. **"POV: Your Brain on Distractions"**\n    - Format: Acting/comedy skit\n    - Content: Humorous take on the internal monologue during distractions vs. focused work\n\n11. **"60-Second Focus Transformation"**\n    - Format: Time-lapse video\n    - Content: Show cluttered/distracted workspace transforming into organized/focused environment\n\n12. **"Focus App vs. Willpower" Challenge**\n    - Format: Split-screen comparison\n    - Content: Person trying to focus without vs. with FocusFlow, showing the difference\n\n## YouTube Content (In-Depth Value)\n\n13. **"Day in the Life: Ultra-Productive Remote Worker"**\n    - Format: Vlog-style video\n    - Content: Follow a power user through their day using FocusFlow, show real results\n\n14. **"Focus Flow Setup Tutorial"**\n    - Format: Screen recording + talking head\n    - Content: Step-by-step guide to optimize the app for different work styles\n\n## Cross-Platform Campaigns\n\n15. **"Focus Fails Friday"**\n    - Format: Meme/image posts\n    - Content: Relatable memes about losing focus, position FocusFlow as the solution\n\n16. **"Pomodoro vs. Flow State" Debate**\n    - Format: Discussion post with graphics\n    - Content: Compare different focus techniques, show how FocusFlow supports both\n\n17. **"Remote Work Bingo"**\n    - Format: Interactive image\n    - Content: Bingo card with common remote work distractions, encourage sharing completed cards\n\n18. **"Focus Metrics Monday"**\n    - Format: Data visualization post\n    - Content: Share aggregated (anonymous) user productivity stats, insights about focus patterns\n\n19. **"Accountability Partner Program"**\n    - Format: Community-building post\n    - Content: Match users for focus challenges, feature success stories of partnerships\n\n20. **"Before Coffee vs. After Coffee Focus"**\n    - Format: Comparison post/video\n    - Content: Humorous take on productivity levels throughout the day, how FocusFlow adapts\n\n## Content Calendar Strategy:\n- Monday: Motivational/Goal setting\n- Tuesday: Tips and tutorials\n- Wednesday: User-generated content\n- Thursday: Behind-the-scenes/Team content\n- Friday: Fun/Entertainment/Memes\n- Weekend: Inspiration/Preparation for next week\n\nEach piece includes clear calls-to-action driving to app download or free trial signup.',
    status: 'success',
    model: 'Claude-3.5',
    tokens_used: 890,
    execution_time: 3800,
    notes: 'Excellent! Very specific and creative ideas with platform-specific optimization. Much better than the previous attempt.'
  }
]

export default function DemoPromptIterationPage() {
  const [iterations, setIterations] = useState<PromptIteration[]>(sampleIterations)
  const { toast } = useToast()

  const handleSelect = (iteration: PromptIteration) => {
    console.log('Selected iteration:', iteration.id)
    toast({
      title: "Iteration Selected",
      description: `Selected prompt iteration: ${iteration.id}`,
    })
  }

  const handleRerun = (iteration: PromptIteration) => {
    console.log('Re-running iteration:', iteration.id)
    toast({
      title: "Prompt Re-execution",
      description: `Re-running prompt with ${iteration.model || 'default'} model`,
    })
  }

  const handleCompare = (iteration1: PromptIteration, iteration2: PromptIteration) => {
    console.log('Comparing iterations:', iteration1.id, 'vs', iteration2.id)
    toast({
      title: "Comparison View",
      description: `Comparing iterations ${iteration1.id} and ${iteration2.id}`,
    })
  }

  const handleUpdateNotes = (iterationId: string, notes: string) => {
    setIterations(prevIterations => 
      prevIterations.map(iteration => 
        iteration.id === iterationId 
          ? { ...iteration, notes }
          : iteration
      )
    )
    console.log('Updated notes for iteration:', iterationId)
  }

  const handleExportJSON = () => {
    console.log('Exporting iterations to JSON...')
    toast({
      title: "JSON Export",
      description: "Prompt iterations exported to JSON successfully",
    })
  }

  const handleExportCSV = () => {
    console.log('Exporting iterations to CSV...')
    toast({
      title: "CSV Export",
      description: "Prompt iterations exported to CSV successfully",
    })
  }

  const addRandomIteration = () => {
    const prompts = [
      'Create a marketing email for a new product launch',
      'Write a blog post about AI trends in 2024',
      'Generate social media captions for a coffee shop',
      'Create a product description for smart headphones',
      'Write customer support responses for common issues'
    ]
    
    const outputs = [
      'Subject: Introducing Our Revolutionary New Product!\n\nDear Valued Customer,\n\nWe\'re excited to announce the launch of our latest innovation...',
      'The AI Revolution: What 2024 Holds for Businesses\n\nArtificial Intelligence continues to reshape industries...',
      '☕ Start your morning right with our freshly roasted beans! #CoffeeLovers #FreshBrew',
      'Experience crystal-clear audio with our Smart Headphones Pro featuring noise cancellation...',
      'Thank you for contacting our support team. Here\'s how we can help resolve your issue...'
    ]
    
    const statuses = ['success', 'needs_improvement', 'failed'] as const
    const models = ['GPT-4', 'GPT-3.5', 'Claude-3', 'Claude-3.5']
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    const randomOutput = outputs[Math.floor(Math.random() * outputs.length)]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomModel = models[Math.floor(Math.random() * models.length)]
    
    const newIteration: PromptIteration = {
      id: `iter-${String(iterations.length + 1).padStart(3, '0')}`,
      prompt: randomPrompt,
      timestamp: new Date().toISOString(),
      output: randomOutput,
      status: randomStatus,
      model: randomModel,
      tokens_used: Math.floor(Math.random() * 800) + 200,
      execution_time: Math.floor(Math.random() * 4000) + 1000,
      notes: randomStatus === 'failed' ? 'Random test iteration for demo' : undefined
    }
    
    setIterations(prev => [newIteration, ...prev])
    toast({
      title: "Iteration Added",
      description: `New ${randomStatus} iteration has been added to the tracker`,
    })
  }

  const simulateStatusUpdate = () => {
    const pendingIterations = iterations.filter(i => i.status === 'needs_improvement')
    if (pendingIterations.length === 0) {
      toast({
        title: "No Iterations to Update",
        description: "There are no iterations marked as 'needs improvement'",
        variant: "destructive"
      })
      return
    }

    const randomIteration = pendingIterations[Math.floor(Math.random() * pendingIterations.length)]
    const newStatus = Math.random() > 0.5 ? 'success' : 'failed'
    
    setIterations(prevIterations => 
      prevIterations.map(iteration => 
        iteration.id === randomIteration.id 
          ? { ...iteration, status: newStatus as any }
          : iteration
      )
    )
    
    toast({
      title: "Status Updated",
      description: `Iteration ${randomIteration.id} status changed to ${newStatus}`,
    })
  }

  const resetDemo = () => {
    setIterations(sampleIterations)
    toast({
      title: "Demo Reset",
      description: "Prompt iteration tracker has been reset to original state",
    })
  }

  // Statistics
  const stats = {
    total: iterations.length,
    success: iterations.filter(i => i.status === 'success').length,
    needsImprovement: iterations.filter(i => i.status === 'needs_improvement').length,
    failed: iterations.filter(i => i.status === 'failed').length,
    models: new Set(iterations.map(i => i.model).filter(Boolean)).size
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PromptIterationTracker Demo</h1>
            <p className="text-muted-foreground">
              Demo component theo dõi và quản lý các phiên bản prompt với AI agents, bao gồm notes, comparison và export functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <History className="h-3 w-3" />
              {stats.total} Iterations
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
          <TabsTrigger value="stats">Statistics</TabsTrigger>
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
                Test các tính năng của PromptIterationTracker component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={addRandomIteration} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random Iteration
                </Button>
                <Button onClick={simulateStatusUpdate} variant="outline" className="gap-2">
                  <Target className="h-4 w-4" />
                  Update Status
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Click vào Compare icon để chọn 2 iterations để so sánh</p>
                <p>• Click Play icon để re-run prompt với cùng parameters</p>
                <p>• Add/edit notes cho từng iteration</p>
                <p>• Filter theo status: success/needs improvement/failed</p>
                <p>• Export data to JSON hoặc CSV format</p>
                <p>• Expand iterations để xem full prompt và output</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <PromptIterationTracker
            iterations={iterations}
            onSelect={handleSelect}
            onRerun={handleRerun}
            onCompare={handleCompare}
            onUpdateNotes={handleUpdateNotes}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Timeline layout với chronological sorting</li>
                  <li>• Status badges với color coding và tooltips</li>
                  <li>• Expandable cards cho detailed view</li>
                  <li>• Real-time timestamps và relative time display</li>
                  <li>• Model and performance metrics tracking</li>
                  <li>• Dark mode support hoàn toàn</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Notes functionality cho từng iteration</li>
                  <li>• Comparison feature giữa 2 prompts</li>
                  <li>• Export to JSON và CSV formats</li>
                  <li>• LLM integration để re-run prompts</li>
                  <li>• Filtering theo status</li>
                  <li>• Toast notifications cho user feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Status Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span><strong>Success:</strong> Prompt hiệu quả và cho kết quả tốt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span><strong>Needs Improvement:</strong> Cần cải thiện để có kết quả tốt hơn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span><strong>Failed:</strong> Prompt không cho kết quả mong muốn</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Interactive Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Hover tooltips cho status badges</li>
                  <li>• Smooth animations khi expand/collapse</li>
                  <li>• Multi-select cho comparison</li>
                  <li>• Inline editing cho notes</li>
                  <li>• One-click prompt re-execution</li>
                  <li>• Responsive design cho mobile/desktop</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Iterations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Tracked prompts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <p className="text-xs text-muted-foreground">
                  Working prompts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Need Work</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.needsImprovement}</div>
                <p className="text-xs text-muted-foreground">
                  Can improve
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  Need rework
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Models Used</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.models}</div>
                <p className="text-xs text-muted-foreground">
                  Different LLMs
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prompt Performance Analysis</CardTitle>
              <CardDescription>
                Success rate và performance metrics cho các iterations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.success / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Improvement Needed</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.total > 0 ? ((stats.needsImprovement / stats.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.needsImprovement / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Failed Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-red-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.failed / stats.total) * 100 : 0}%` }}
                    />
                  </div>
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
                Cách sử dụng PromptIterationTracker trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { PromptIterationTracker, type PromptIteration } from '@/components/ui/prompt-iteration-tracker'

const promptHistory: PromptIteration[] = [
  {
    id: 'iter-001',
    prompt: 'Create a marketing strategy for AI platform',
    timestamp: '2024-11-04T10:30:00Z',
    output: 'Comprehensive marketing strategy with target audience...',
    status: 'success',
    model: 'GPT-4',
    tokens_used: 450,
    execution_time: 2300
  }
]

function MyComponent() {
  const handleSelect = (iteration) => {
    console.log('Selected iteration:', iteration.id)
  }

  return (
    <PromptIterationTracker
      iterations={promptHistory}
      onSelect={handleSelect}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With All Features</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`<PromptIterationTracker
  iterations={iterations}
  onSelect={handleSelect}
  onRerun={(iteration) => {
    // Re-execute prompt with same parameters
    executePrompt(iteration.prompt, iteration.model)
  }}
  onCompare={(iter1, iter2) => {
    // Show comparison view
    openComparisonModal(iter1, iter2)
  }}
  onUpdateNotes={(iterationId, notes) => {
    // Save notes to database
    updateIterationNotes(iterationId, notes)
  }}
  onExportJSON={() => {
    // Custom JSON export
    exportToJSON(iterations)
  }}
  onExportCSV={() => {
    // Custom CSV export
    exportToCSV(iterations)
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface PromptIterationTrackerProps {
  iterations: PromptIteration[]            // Required: Array of prompt iterations
  onSelect?: (iteration: PromptIteration) => void  // Optional: Selection handler
  onRerun?: (iteration: PromptIteration) => void   // Optional: Re-run prompt handler
  onCompare?: (iter1: PromptIteration, iter2: PromptIteration) => void  // Optional: Compare handler
  onUpdateNotes?: (iterationId: string, notes: string) => void  // Optional: Notes update handler
  onExportJSON?: () => void                // Optional: JSON export handler
  onExportCSV?: () => void                 // Optional: CSV export handler
  className?: string                       // Optional: Additional CSS classes
}

interface PromptIteration {
  id: string                               // Required: Unique identifier
  prompt: string                           // Required: The prompt text
  timestamp: string                        // Required: ISO timestamp
  output: string                           // Required: AI response/output
  status: 'success' | 'needs_improvement' | 'failed'  // Required: Evaluation status
  notes?: string                           // Optional: User notes
  model?: string                           // Optional: AI model used
  tokens_used?: number                     // Optional: Token consumption
  execution_time?: number                  // Optional: Execution time in ms
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