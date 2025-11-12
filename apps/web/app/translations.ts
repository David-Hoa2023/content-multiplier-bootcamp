export const translations = {
    en: {
        home: {
            title: 'Welcome to Content Multiplier',
            subtitle: 'AI-powered content ideation, research, and distribution',
            quickStart: 'Quick Start',
            quickStartDesc: 'Begin your content creation journey by generating AI-powered ideas tailored to your audience and goals.',
            analytics: 'Analytics',
            analyticsDesc: 'Track your content performance and optimize your strategy with detailed insights and metrics.',
            configuration: 'Configuration',
            configurationDesc: 'Set up your preferred AI models and API keys to customize your content generation experience.',
            workflow: 'Content Creation Workflow',
            generateIdeas: 'Generate Ideas',
            generateIdeasDesc: 'AI-powered content ideas',
            createBriefs: 'Create Briefs',
            createBriefsDesc: 'Research & structure',
            contentPacks: 'Content Packs',
            contentPacksDesc: 'Draft & manage content',
            generateDerivatives: 'Generate Derivatives',
            generateDerivativesDesc: 'Multi-channel content',
            publishDistribute: 'Publish & Distribute',
            publishDistributeDesc: 'Launch your content'
        },
        navigation: {
            home: 'Dashboard',
            ideas: 'Generate & select ideas',
            briefs: 'Research & create briefs',
            packs: 'Draft & manage content',
            settings: 'Configure LLM & API keys'
        },
        packs: {
            title: 'Content Packs',
            subtitle: 'Manage your content drafts and published packs',
            createNew: 'Create New Pack',
            noPacks: 'No Content Packs Yet',
            noPacksDesc: 'Start by creating your first content pack from an approved brief.',
            goToBriefs: 'Go to Briefs →',
            hasDerivatives: 'Has derivatives',
            noDerivatives: 'No derivatives',
            viewDetails: 'View Details →',
            published: 'Published',
            pending: 'Pending'
        }
    },
    vn: {
        home: {
            title: 'Chào mừng đến với Content Multiplier',
            subtitle: 'Tạo nội dung, nghiên cứu và phân phối bằng AI',
            quickStart: 'Bắt đầu nhanh',
            quickStartDesc: 'Bắt đầu hành trình tạo nội dung của bạn bằng cách tạo ra những ý tưởng được hỗ trợ bởi AI phù hợp với đối tượng và mục tiêu của bạn.',
            analytics: 'Phân tích',
            analyticsDesc: 'Theo dõi hiệu suất nội dung và tối ưu hóa chiến lược của bạn với các thông tin chi tiết và số liệu.',
            configuration: 'Cấu hình',
            configurationDesc: 'Thiết lập các mô hình AI và API keys ưa thích của bạn để tùy chỉnh trải nghiệm tạo nội dung.',
            workflow: 'Quy trình tạo nội dung',
            generateIdeas: 'Tạo ý tưởng',
            generateIdeasDesc: 'Ý tưởng nội dung AI',
            createBriefs: 'Tạo bản tóm tắt',
            createBriefsDesc: 'Nghiên cứu & cấu trúc',
            contentPacks: 'Gói nội dung',
            contentPacksDesc: 'Soạn thảo & quản lý nội dung',
            generateDerivatives: 'Tạo nội dung phái sinh',
            generateDerivativesDesc: 'Nội dung đa kênh',
            publishDistribute: 'Xuất bản & Phân phối',
            publishDistributeDesc: 'Phát hành nội dung của bạn'
        },
        navigation: {
            home: 'Bảng điều khiển',
            ideas: 'Tạo & chọn ý tưởng',
            briefs: 'Nghiên cứu & tạo bản tóm tắt',
            packs: 'Soạn thảo & quản lý nội dung',
            settings: 'Cấu hình LLM & API keys'
        },
        packs: {
            title: 'Gói nội dung',
            subtitle: 'Quản lý bản nháp và gói nội dung đã xuất bản',
            createNew: 'Tạo gói mới',
            noPacks: 'Chưa có gói nội dung nào',
            noPacksDesc: 'Bắt đầu bằng cách tạo gói nội dung đầu tiên từ bản tóm tắt đã được phê duyệt.',
            goToBriefs: 'Đi đến Bản tóm tắt →',
            hasDerivatives: 'Có nội dung phái sinh',
            noDerivatives: 'Không có nội dung phái sinh',
            viewDetails: 'Xem chi tiết →',
            published: 'Đã xuất bản',
            pending: 'Đang chờ'
        }
    }
}

export type Language = 'en' | 'vn'
export type TranslationKey = keyof typeof translations.en
