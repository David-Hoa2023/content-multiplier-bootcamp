'use client'

import { useState } from 'react'
import { VersionHistoryViewer, type Version } from '@/components/ui/version-history-viewer'
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
  Trash2,
  FileText,
  Settings,
  User,
  Clock
} from 'lucide-react'

const sampleVersions: Version[] = [
  {
    id: '1',
    version: 1,
    changed_by: 'Nguyễn Văn An',
    timestamp: '2024-01-01T10:00:00Z',
    content: `# Chiến lược Marketing 2024

## Mục tiêu chính
- Tăng trưởng doanh thu 30% so với năm 2023
- Mở rộng thị trường sang 3 tỉnh thành mới
- Xây dựng thương hiệu mạnh mẽ trên digital platform

## Kế hoạch thực hiện
1. **Q1/2024**: Nghiên cứu thị trường và đối thủ cạnh tranh
2. **Q2/2024**: Phát triển chiến lược content marketing
3. **Q3/2024**: Triển khai các campaign quảng cáo
4. **Q4/2024**: Đánh giá và tối ưu hóa chiến lược

## Ngân sách dự kiến
- Digital Marketing: 500 triệu VNĐ
- Event Marketing: 200 triệu VNĐ
- Content Creation: 150 triệu VNĐ
- Influencer Partnership: 100 triệu VNĐ

Tổng ngân sách: 950 triệu VNĐ`
  },
  {
    id: '2',
    version: 2,
    changed_by: 'Trần Thị Bình',
    timestamp: '2024-01-15T14:30:00Z',
    content: `# Chiến lược Marketing 2024 (Cập nhật)

## Mục tiêu chính
- Tăng trưởng doanh thu 35% so với năm 2023 (tăng từ 30%)
- Mở rộng thị trường sang 5 tỉnh thành mới (tăng từ 3)
- Xây dựng thương hiệu mạnh mẽ trên digital platform
- Tăng cường customer retention lên 85%

## Kế hoạch thực hiện
1. **Q1/2024**: Nghiên cứu thị trường và đối thủ cạnh tranh
2. **Q2/2024**: Phát triển chiến lược content marketing và automation
3. **Q3/2024**: Triển khai các campaign quảng cáo đa kênh
4. **Q4/2024**: Đánh giá và tối ưu hóa chiến lược

## Ngân sách dự kiến (Cập nhật)
- Digital Marketing: 650 triệu VNĐ (tăng 150 triệu)
- Event Marketing: 300 triệu VNĐ (tăng 100 triệu)
- Content Creation: 200 triệu VNĐ (tăng 50 triệu)
- Influencer Partnership: 150 triệu VNĐ (tăng 50 triệu)
- Marketing Automation Tools: 80 triệu VNĐ (mới)

Tổng ngân sách: 1.38 tỷ VNĐ

## Các chỉ số KPI bổ sung
- Conversion rate: 3.5%
- Customer acquisition cost: giảm 20%
- Return on marketing investment: 4:1`
  },
  {
    id: '3',
    version: 3,
    changed_by: 'Lê Minh Cường',
    timestamp: '2024-02-01T09:15:00Z',
    content: `# Chiến lược Marketing 2024 (Phiên bản cuối)

## Tóm tắt Executive Summary
Chiến lược marketing tập trung vào digital transformation và customer experience, với mục tiêu tăng trưởng bền vững và xây dựng thương hiệu dài hạn.

## Mục tiêu chính
- Tăng trưởng doanh thu 35% so với năm 2023
- Mở rộng thị trường sang 5 tỉnh thành mới: Đà Nẵng, Cần Thơ, Hải Phòng, Nha Trang, Đà Lạt
- Xây dựng thương hiệu mạnh mẽ trên digital platform (Facebook, Instagram, TikTok, LinkedIn)
- Tăng cường customer retention lên 85%
- Đạt Net Promoter Score (NPS) ≥ 70

## Phân tích SWOT
### Strengths (Điểm mạnh)
- Đội ngũ creative team giàu kinh nghiệm
- Sản phẩm chất lượng cao, được khách hàng tin tưởng
- Hệ thống phân phối rộng khắp

### Weaknesses (Điểm yếu)
- Thương hiệu chưa mạnh ở thị trường trẻ
- Hệ thống CRM chưa tối ưu
- Thiếu data analytics chuyên sâu

### Opportunities (Cơ hội)
- Thị trường digital marketing phát triển mạnh
- Consumer behavior chuyển sang online
- Government support cho digital transformation

### Threats (Thách thức)
- Cạnh tranh khốc liệt từ các brand quốc tế
- Biến động kinh tế macro
- Thay đổi thuật toán các platform

## Kế hoạch thực hiện chi tiết
### Q1/2024: Foundation & Research
- Nghiên cứu thị trường và đối thủ cạnh tranh
- Xây dựng customer persona chi tiết
- Setup marketing technology stack
- Đào tạo team về digital tools

### Q2/2024: Content & Automation
- Phát triển chiến lược content marketing
- Triển khai marketing automation system
- Xây dựng customer journey mapping
- A/B testing các message key

### Q3/2024: Campaign Execution
- Triển khai các campaign quảng cáo đa kênh
- Influencer partnership program
- Community building và engagement
- Performance optimization liên tục

### Q4/2024: Optimization & Scale
- Đánh giá và tối ưu hóa chiến lược
- Scale up successful campaigns
- Planning cho năm 2025
- Team building và capability development

## Ngân sách chi tiết
### Digital Marketing: 650 triệu VNĐ
- Facebook/Instagram Ads: 300 triệu
- Google Ads: 200 triệu  
- TikTok Ads: 100 triệu
- LinkedIn Ads: 50 triệu

### Event Marketing: 300 triệu VNĐ
- Product launch events: 150 triệu
- Trade shows & exhibitions: 100 triệu
- Customer appreciation events: 50 triệu

### Content Creation: 200 triệu VNĐ
- Video production: 120 triệu
- Photography: 40 triệu
- Graphic design: 40 triệu

### Influencer Partnership: 150 triệu VNĐ
- Macro influencers: 100 triệu
- Micro influencers: 50 triệu

### Marketing Automation Tools: 80 triệu VNĐ
- CRM system: 40 triệu
- Email marketing platform: 20 triệu
- Analytics tools: 20 triệu

**Tổng ngân sách: 1.38 tỷ VNĐ**

## KPI và Metrics
- Revenue growth: 35% YoY
- Customer acquisition cost: giảm 20%
- Customer retention rate: 85%
- Conversion rate: 3.5%
- Return on marketing investment: 4:1
- Brand awareness: tăng 40%
- Social media engagement rate: 8%
- Email open rate: 25%
- Website organic traffic: tăng 60%

## Risk Management
- Budget contingency: 10% tổng ngân sách
- Alternative channel strategy nếu platform thay đổi
- Crisis communication plan
- Regular competitor monitoring

## Timeline và Milestones
- Tháng 3: Hoàn thành market research
- Tháng 6: Launch automation system
- Tháng 9: Đạt 50% revenue target
- Tháng 12: Final evaluation và planning 2025`
  },
  {
    id: '4',
    version: 4,
    changed_by: 'Nguyễn Văn An',
    timestamp: '2024-02-15T16:45:00Z',
    content: `# Chiến lược Marketing 2024 (Điều chỉnh sau review)

## Tóm tắt Executive Summary
Chiến lược marketing tập trung vào digital transformation và customer experience, với mục tiêu tăng trưởng bền vững và xây dựng thương hiệu dài hạn. Bổ sung focus vào sustainability và social responsibility.

## Mục tiêu chính (Cập nhật)
- Tăng trưởng doanh thu 40% so với năm 2023 (tăng từ 35%)
- Mở rộng thị trường sang 5 tỉnh thành mới: Đà Nẵng, Cần Thơ, Hải Phòng, Nha Trang, Đà Lạt
- Xây dựng thương hiệu mạnh mẽ trên digital platform (Facebook, Instagram, TikTok, LinkedIn, YouTube)
- Tăng cường customer retention lên 90% (tăng từ 85%)
- Đạt Net Promoter Score (NPS) ≥ 75 (tăng từ 70)
- Trở thành Top 3 green brand trong ngành

## Phân tích SWOT (Cập nhật)
### Strengths (Điểm mạnh)
- Đội ngũ creative team giàu kinh nghiệm
- Sản phẩm chất lượng cao, được khách hàng tin tưởng
- Hệ thống phân phối rộng khắp
- Commitment mạnh về sustainability

### Weaknesses (Điểm yếu)
- Thương hiệu chưa mạnh ở thị trường trẻ
- Hệ thống CRM chưa tối ưu
- Thiếu data analytics chuyên sâu
- Chi phí logistics cao

### Opportunities (Cơ hội)
- Thị trường digital marketing phát triển mạnh
- Consumer behavior chuyển sang online
- Government support cho digital transformation
- Trend tăng mạnh về green consumption
- Gen Z có sức mua lớn

### Threats (Thách thức)
- Cạnh tranh khốc liệt từ các brand quốc tế
- Biến động kinh tế macro
- Thay đổi thuật toán các platform
- Tăng chi phí quảng cáo digital
- Fake news và brand crisis risk

## Kế hoạch thực hiện chi tiết (Bổ sung)
### Q1/2024: Foundation & Research
- Nghiên cứu thị trường và đối thủ cạnh tranh
- Xây dựng customer persona chi tiết với focus Gen Z
- Setup marketing technology stack
- Đào tạo team về digital tools và sustainability marketing
- Launch employee advocacy program

### Q2/2024: Content & Automation
- Phát triển chiến lược content marketing với sustainability angle
- Triển khai marketing automation system
- Xây dựng customer journey mapping
- A/B testing các message key
- Tạo original content series về green lifestyle

### Q3/2024: Campaign Execution
- Triển khai các campaign quảng cáo đa kênh
- Influencer partnership program (focus eco-influencers)
- Community building và engagement
- Performance optimization liên tục
- Launch podcast series "Green Business Talks"

### Q4/2024: Optimization & Scale
- Đánh giá và tối ưu hóa chiến lược
- Scale up successful campaigns
- Planning cho năm 2025
- Team building và capability development
- Awards submission và PR activities

## Ngân sách chi tiết (Điều chỉnh)
### Digital Marketing: 750 triệu VNĐ (tăng 100 triệu)
- Facebook/Instagram Ads: 350 triệu
- Google Ads: 200 triệu  
- TikTok Ads: 120 triệu
- LinkedIn Ads: 50 triệu
- YouTube Ads: 30 triệu

### Event Marketing: 400 triệu VNĐ (tăng 100 triệu)
- Product launch events: 200 triệu
- Trade shows & exhibitions: 100 triệu
- Customer appreciation events: 50 triệu
- Sustainability workshops: 50 triệu

### Content Creation: 250 triệu VNĐ (tăng 50 triệu)
- Video production: 150 triệu
- Photography: 50 triệu
- Graphic design: 50 triệu

### Influencer Partnership: 200 triệu VNĐ (tăng 50 triệu)
- Macro influencers: 120 triệu
- Micro influencers: 50 triệu
- Nano influencers: 30 triệu

### Marketing Automation Tools: 100 triệu VNĐ (tăng 20 triệu)
- CRM system: 50 triệu
- Email marketing platform: 25 triệu
- Analytics tools: 25 triệu

### PR & Communications: 80 triệu VNĐ (mới)
- PR agency retainer: 50 triệu
- Crisis management: 20 triệu
- Awards & recognition: 10 triệu

**Tổng ngân sách: 1.78 tỷ VNĐ**

## KPI và Metrics (Cập nhật)
- Revenue growth: 40% YoY
- Customer acquisition cost: giảm 25%
- Customer retention rate: 90%
- Conversion rate: 4.0%
- Return on marketing investment: 4.5:1
- Brand awareness: tăng 50%
- Social media engagement rate: 10%
- Email open rate: 28%
- Website organic traffic: tăng 80%
- Sustainability brand perception: Top 3 trong survey
- Employee Net Promoter Score: ≥ 60

## Sustainability Focus (Mới)
- 100% marketing materials sử dụng recycled paper
- Carbon neutral events
- Partnership với environmental NGOs
- Green packaging messaging
- Quarterly sustainability reports

## Innovation Lab (Mới)
- AR/VR marketing experiments
- AI chatbot development
- Voice search optimization
- Blockchain loyalty program pilot
- IoT integration cho retail experience

## Risk Management (Cập nhật)
- Budget contingency: 15% tổng ngân sách
- Alternative channel strategy nếu platform thay đổi
- Crisis communication plan với sustainability angle
- Regular competitor monitoring
- Legal compliance cho data privacy
- Supply chain risk assessment

## Timeline và Milestones (Cập nhật)
- Tháng 3: Hoàn thành market research và sustainability audit
- Tháng 6: Launch automation system và green content series
- Tháng 9: Đạt 60% revenue target
- Tháng 12: Final evaluation, sustainability report, và planning 2025

## Success Metrics Dashboard
- Daily: Social media metrics, website traffic
- Weekly: Email campaign performance, ad spend ROI
- Monthly: Revenue, customer acquisition, retention
- Quarterly: Brand tracking, sustainability metrics, competitive analysis
- Annually: Full marketing audit và strategic review`
  },
  {
    id: '5',
    version: 5,
    changed_by: 'Phạm Thị Dung',
    timestamp: '2024-03-01T11:20:00Z',
    content: `# Chiến lược Marketing 2024 (Final Version - Approved)

## Executive Summary
Chiến lược marketing tích hợp toàn diện tập trung vào digital transformation, customer experience excellence, và sustainable growth. Mục tiêu xây dựng ecosystem thương hiệu bền vững với tăng trưởng 40% và trở thành top 3 green brand trong ngành.

## Strategic Vision 2024-2026
"Trở thành thương hiệu được yêu thích nhất trong lòng khách hàng thông qua trải nghiệm xuất sắc và giá trị bền vững."

## Core Objectives (Approved)
### Primary Goals
- **Revenue Growth**: 40% YoY (từ 500 tỷ lên 700 tỷ VNĐ)
- **Market Expansion**: 5 tỉnh thành mới với 50 touchpoints
- **Brand Positioning**: Top 3 green brand, top 5 most loved brand
- **Customer Metrics**: 90% retention, NPS ≥ 75, CSAT ≥ 4.5/5

### Secondary Goals  
- Digital transformation completion: 80% processes digitized
- Employee advocacy: 70% staff participation
- Innovation pipeline: 5 new product launches
- Market share: tăng từ 12% lên 18%

## Target Audience Segmentation
### Primary Segments
1. **Green Millennials** (28-42 tuổi): 40% budget allocation
   - High income, environmental conscious
   - Digital-first, value authentic brands
   - Key channels: Instagram, LinkedIn, Email

2. **Eco Gen Z** (18-27 tuổi): 35% budget allocation  
   - Social impact driven, tech-native
   - Visual content preference, peer influence high
   - Key channels: TikTok, Instagram, YouTube

3. **Conscious Gen X** (43-58 tuổi): 25% budget allocation
   - Established, family-focused, quality-driven
   - Traditional + digital mix, trust-based decisions
   - Key channels: Facebook, Google, In-store

## Marketing Mix Strategy (4P + 3P)

### Product Enhancement
- Eco-friendly packaging cho 100% sản phẩm
- Carbon footprint labeling
- Circular economy integration
- Quality certification transparency

### Pricing Strategy
- Value-based pricing với sustainability premium 10-15%
- Loyalty program với green rewards
- Subscription model cho frequent customers
- Dynamic pricing dựa trên demand forecasting

### Place/Distribution  
- Omnichannel experience seamless
- Pop-up stores tại green events
- Partnership với eco-friendly retailers
- Direct-to-consumer platform enhancement

### Promotion Integration
- 360-degree campaign integration
- Storytelling-focused content
- User-generated content amplification
- Cause marketing partnerships

### People Development
- Customer service excellence training
- Sustainability ambassador program
- Internal communications về green values
- Performance metrics alignment

### Process Optimization
- Customer journey automation
- Real-time feedback integration
- Continuous improvement framework
- Data-driven decision making

### Physical Evidence
- Store design với sustainable materials
- Packaging experience elevation
- Digital touchpoint consistency
- Brand guideline strict compliance

## Digital Marketing Strategy

### Content Marketing (300 triệu VNĐ)
- **Blog Strategy**: 3 posts/week, SEO-optimized
- **Video Content**: 20 videos/month, platform-specific
- **Podcast Series**: "Green Future Talks" - monthly episodes
- **Webinar Program**: Quarterly thought leadership sessions
- **User-Generated Content**: Customer story amplification

### Social Media Marketing (400 triệu VNĐ)
- **Facebook**: Community building, customer service, events
- **Instagram**: Visual storytelling, behind-the-scenes, UGC
- **TikTok**: Trend participation, educational content, challenges
- **LinkedIn**: B2B networking, thought leadership, employee advocacy
- **YouTube**: Long-form content, tutorials, brand documentaries

### Search Marketing (250 triệu VNĐ)
- **SEO**: Technical optimization, content strategy, local SEO
- **Google Ads**: Search, Shopping, Display, YouTube campaigns
- **Voice Search**: Optimization cho smart devices
- **Local Marketing**: Google My Business optimization

### Email Marketing (80 triệu VNĐ)
- Personalized customer journeys
- Automated drip campaigns
- Newsletter with sustainability tips
- Retention campaigns cho inactive users

### Marketing Automation (120 triệu VNĐ)
- Lead scoring và nurturing
- Customer lifecycle management
- Cross-sell/upsell automation
- Churn prediction và prevention

## Traditional Marketing Integration

### Event Marketing (400 triệu VNĐ)
- **Trade Shows**: 8 major exhibitions annually
- **Product Launches**: 4 major events with media coverage
- **Community Events**: Monthly local engagement activities
- **Sustainability Workshops**: Educational programs for customers

### PR & Communications (150 triệu VNĐ)
- Media relations strategy
- Crisis communication preparedness
- Awards và recognition programs
- CSR storytelling amplification

### Print & OOH (100 triệu VNĐ)
- Strategic outdoor placements
- Magazine partnerships
- Sustainable print materials
- QR code integration cho digital connection

## Budget Allocation & ROI Targets

### Total Marketing Investment: 2.1 tỷ VNĐ
- **Digital Marketing**: 1.15 tỷ (55%)
- **Traditional Marketing**: 650 triệu (31%)
- **Technology & Tools**: 150 triệu (7%)
- **Training & Development**: 100 triệu (5%)
- **Contingency**: 50 triệu (2%)

### Expected ROI by Channel
- Social Media: 5:1
- Email Marketing: 8:1  
- Content Marketing: 4:1
- Events: 3:1
- PR: 6:1
- Overall Target: 4.5:1

## Implementation Timeline

### Phase 1 (Q1): Foundation & Launch
**Jan-Mar 2024**
- Team training completion
- Technology stack implementation
- Brand guideline finalization
- Initial campaign launches
- Baseline metrics establishment

### Phase 2 (Q2): Scale & Optimize  
**Apr-Jun 2024**
- Full campaign deployment
- Community building acceleration
- Partnership activations
- First performance review
- Strategy adjustments

### Phase 3 (Q3): Peak Performance
**Jul-Sep 2024**
- High-season campaigns
- Major event executions
- Influencer collaborations peak
- Mid-year performance evaluation
- Q4 planning initiation

### Phase 4 (Q4): Consolidate & Plan
**Oct-Dec 2024**
- Year-end campaigns
- Annual review execution
- 2025 strategy development
- Team performance evaluation
- Success celebration events

## KPI Dashboard & Monitoring

### Financial Metrics
- **Revenue Growth**: 40% YoY target
- **Marketing ROI**: 4.5:1 minimum
- **Customer Acquisition Cost**: Giảm 25%
- **Customer Lifetime Value**: Tăng 30%
- **Market Share**: Từ 12% lên 18%

### Brand Metrics  
- **Brand Awareness**: Tăng 50% (unaided)
- **Brand Consideration**: Top 3 in category
- **Net Promoter Score**: ≥ 75
- **Customer Satisfaction**: ≥ 4.5/5
- **Green Brand Perception**: Top 3 ranking

### Digital Metrics
- **Website Traffic**: Tăng 80% organic
- **Social Engagement**: 10% average rate
- **Email Performance**: 28% open rate, 4% CTR
- **Conversion Rate**: 4.0% website-wide
- **Mobile Optimization**: 95% mobile speed score

### Operational Metrics
- **Campaign Delivery**: 95% on-time
- **Budget Efficiency**: 98% budget utilization
- **Team Productivity**: 90% goal achievement
- **Customer Response Time**: <2 hours
- **Process Automation**: 80% automated workflows

## Risk Management & Contingency

### Identified Risks
1. **Economic Downturn**: 30% probability
   - Mitigation: Flexible budget allocation, value proposition adjustment
   
2. **Platform Algorithm Changes**: 60% probability  
   - Mitigation: Diversified channel strategy, owned media focus

3. **Competitive Response**: 80% probability
   - Mitigation: Innovation acceleration, customer loyalty reinforcement

4. **Supply Chain Disruption**: 40% probability
   - Mitigation: Multiple supplier strategy, inventory optimization

5. **Regulatory Changes**: 25% probability
   - Mitigation: Compliance monitoring, legal consultation

### Crisis Management Protocol
- 24/7 monitoring system
- Escalation matrix defined
- Communication templates ready
- Stakeholder contact database
- Recovery plan framework

## Success Measurement Framework

### Monthly Reviews
- Performance vs. targets analysis
- Budget utilization tracking
- Campaign effectiveness assessment
- Customer feedback compilation
- Competitive landscape monitoring

### Quarterly Business Reviews
- Strategic alignment verification
- ROI comprehensive analysis
- Market share evaluation
- Brand health assessment
- Team performance review

### Annual Strategic Review
- Full strategy effectiveness evaluation
- Market position analysis
- Competitive advantage assessment
- Future opportunity identification
- Next year strategic planning

## Innovation & Future Roadmap

### Technology Integration
- AI-powered personalization
- Augmented reality experiences
- Voice commerce optimization
- Blockchain loyalty programs
- IoT customer insights

### Sustainability Leadership
- Carbon-neutral marketing by 2025
- Circular marketing materials
- Regenerative business practices
- Climate action partnerships
- Transparent impact reporting

### Market Expansion
- International market entry planning
- New customer segment exploration
- Product category diversification
- Strategic acquisition opportunities
- Ecosystem partnership development

---

**Document Approval:**
- Marketing Director: Phạm Thị Dung ✓
- CEO: Nguyễn Minh Khôi ✓  
- CFO: Trần Văn Nam ✓
- Board of Directors: Approved ✓

**Next Review Date:** June 30, 2024
**Document Version:** 5.0 (Final)
**Classification:** Confidential - Internal Use Only`
  }
]

export default function DemoVersionHistoryPage() {
  const [versions, setVersions] = useState<Version[]>(sampleVersions)
  const [currentVersion, setCurrentVersion] = useState(5)
  const { toast } = useToast()

  const handleRestore = (version: Version) => {
    // Simulate restore by moving the version to be current
    const newVersions = [...versions]
    const restoredVersion = { ...version, version: currentVersion + 1 }
    newVersions.unshift(restoredVersion)
    setVersions(newVersions)
    setCurrentVersion(currentVersion + 1)
    
    toast({
      title: "Khôi phục thành công!",
      description: `Đã khôi phục nội dung từ phiên bản v${version.version}`,
    })
  }

  const addNewVersion = () => {
    const newVersion: Version = {
      id: (versions.length + 1).toString(),
      version: currentVersion + 1,
      changed_by: 'Demo User',
      timestamp: new Date().toISOString(),
      content: `# Phiên bản mới ${currentVersion + 1}

Đây là nội dung demo được tạo tự động lúc ${new Date().toLocaleString('vi-VN')}.

## Những thay đổi chính
- Cập nhật thông tin mới nhất
- Điều chỉnh chiến lược theo feedback
- Bổ sung các metrics tracking
- Tối ưu hóa performance indicators

Nội dung này được tạo để demo tính năng version history viewer.`
    }
    
    setVersions([newVersion, ...versions])
    setCurrentVersion(currentVersion + 1)
    
    toast({
      title: "Phiên bản mới đã được tạo",
      description: `Phiên bản v${currentVersion + 1} đã được thêm vào lịch sử`,
    })
  }

  const resetDemo = () => {
    setVersions(sampleVersions)
    setCurrentVersion(5)
    
    toast({
      title: "Demo đã được reset",
      description: "Tất cả dữ liệu đã được khôi phục về trạng thái ban đầu",
    })
  }

  // Statistics
  const stats = {
    totalVersions: versions.length,
    uniqueAuthors: new Set(versions.map(v => v.changed_by)).size,
    currentVersion: currentVersion,
    latestChange: versions[0]?.timestamp
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VersionHistoryViewer Demo</h1>
            <p className="text-muted-foreground">
              Demo component hiển thị lịch sử phiên bản với diff viewer, filtering và restore functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              v{currentVersion} (Current)
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
                Test các tính năng của VersionHistoryViewer component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={addNewVersion} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo phiên bản mới
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Click vào chevron để expand/collapse phiên bản</p>
                <p>• Sử dụng bộ lọc để tìm kiếm theo người dùng hoặc thời gian</p>
                <p>• Click nút Compare để so sánh 2 phiên bản</p>
                <p>• Click nút Restore để khôi phục phiên bản cũ</p>
                <p>• Tất cả animations được tối ưu với Framer Motion</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <VersionHistoryViewer
            versions={versions}
            currentVersion={currentVersion}
            onRestore={handleRestore}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Version listing với expand/collapse animation</li>
                  <li>• Preview nội dung với scroll area</li>
                  <li>• Restore functionality với confirmation modal</li>
                  <li>• Current version highlighting</li>
                  <li>• Responsive design hoàn toàn</li>
                  <li>• Dark mode support</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Diff viewer cho so sánh phiên bản</li>
                  <li>• Filtering theo user và time range</li>
                  <li>• Search trong nội dung</li>
                  <li>• Toast notifications</li>
                  <li>• Animation với Framer Motion</li>
                  <li>• Tooltips cho better UX</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  User Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Smooth animations và transitions</li>
                  <li>• Intuitive controls và navigation</li>
                  <li>• Loading states và empty states</li>
                  <li>• Accessible design patterns</li>
                  <li>• Mobile-first responsive</li>
                  <li>• Keyboard navigation support</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• TypeScript interfaces cho type safety</li>
                  <li>• Efficient filtering và searching</li>
                  <li>• Memory optimization cho large datasets</li>
                  <li>• Real-time updates support</li>
                  <li>• Export functionality ready</li>
                  <li>• Version comparison algorithms</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Versions</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVersions}</div>
                <p className="text-xs text-muted-foreground">
                  Versions in history
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Version</CardTitle>
                <Badge className="text-xs">v{stats.currentVersion}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v{stats.currentVersion}</div>
                <p className="text-xs text-muted-foreground">
                  Latest version number
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueAuthors}</div>
                <p className="text-xs text-muted-foreground">
                  Unique contributors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.latestChange ? new Date(stats.latestChange).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Latest change date
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Version Distribution</CardTitle>
              <CardDescription>
                Phân phối versions theo contributor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(versions.map(v => v.changed_by))).map(author => {
                  const authorVersions = versions.filter(v => v.changed_by === author).length
                  const percentage = (authorVersions / versions.length) * 100
                  
                  return (
                    <div key={author} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{author}</span>
                        <span className="text-sm text-muted-foreground">
                          {authorVersions} versions ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
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
                Cách sử dụng VersionHistoryViewer trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { VersionHistoryViewer, type Version } from '@/components/ui/version-history-viewer'

const versions: Version[] = [
  {
    version: 1,
    changed_by: 'John Doe',
    timestamp: '2024-01-15T10:30:00Z',
    content: 'Your version content here...'
  }
]

function MyComponent() {
  const handleRestore = (version: Version) => {
    console.log('Restoring version:', version)
  }

  return (
    <VersionHistoryViewer
      versions={versions}
      currentVersion={1}
      onRestore={handleRestore}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface VersionHistoryViewerProps {
  versions: Version[]                          // Required: Array of versions
  currentVersion?: number                      // Optional: Current version number
  onRestore: (version: Version) => void        // Required: Restore callback
  className?: string                           // Optional: Additional CSS classes
}

interface Version {
  version: number                              // Required: Version number
  changed_by: string                          // Required: Author name
  timestamp: string                           // Required: ISO timestamp
  content: string                             // Required: Version content
  id?: string                                 // Optional: Unique identifier
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Features Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Core Functionality</h5>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Version listing với preview</li>
                      <li>• Expand/collapse animation</li>
                      <li>• Restore với confirmation</li>
                      <li>• Current version highlighting</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Advanced Features</h5>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Diff viewer comparison</li>
                      <li>• Search và filtering</li>
                      <li>• Toast notifications</li>
                      <li>• Responsive design</li>
                    </ul>
                  </div>
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