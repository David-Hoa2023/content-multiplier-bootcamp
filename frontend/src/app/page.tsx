'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, FileText, Lightbulb, ArrowRight, Package, Edit, CheckCircle, Share2, Send, BookOpen, Search } from 'lucide-react';
import ErrorMessage from './components/ErrorMessage';
import SuccessMessage from './components/SuccessMessage';
import ContentStats from './components/ContentStats';
import ContentPlansPage from './components/ContentPlansPage';
import { AppLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LLMProviderSwitcher, type SelectedProvider } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api-config';

interface Idea {
  id: number;
  title: string;
  description: string | null;
  persona: string | null;
  industry: string | null;
  status: string;
  created_at: string;
}

interface ContentPlan {
  id: number;
  idea_id: number;
  plan_content: string;
  target_audience: string | null;
  key_points: string | null;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    persona: '',
    industry: '',
    status: 'draft',
    useKnowledgeBase: false,
    knowledgeQuery: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  // Debug logs
  useEffect(() => {
    console.log('🔍 Component state:', {
      isGenerating,
      hasTitle: !!formData.title,
      titleLength: formData.title?.length || 0,
    });
  }, [isGenerating, formData.title]);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  // Content plan generation states
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatingPlanId, setGeneratingPlanId] = useState<number | null>(null);
  const [contentPlanDialogOpen, setContentPlanDialogOpen] = useState(false);
  const [generatedContentPlan, setGeneratedContentPlan] = useState<ContentPlan | null>(null);
  const [planGenerateError, setPlanGenerateError] = useState<string | null>(null);

  // LLM Provider states
  const [selectedProvider, setSelectedProvider] = useState<SelectedProvider | null>(null);
  const [showProviderSettings, setShowProviderSettings] = useState(false);

  // Fetch ideas
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/ideas`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setIdeas(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      let errorMessage = 'Không thể tải danh sách ý tưởng.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          errorMessage = 'Không thể kết nối đến backend server.\n\nVui lòng kiểm tra:\n1. Backend server đã chạy chưa (http://localhost:4000)\n2. Docker Desktop đã được khởi động chưa\n3. Database đã được khởi động chưa (docker-compose up -d)';
        } else {
          errorMessage = `Không thể tải danh sách ý tưởng: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const response = await fetch(`${API_URL}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess('✅ Ý tưởng đã được tạo thành công!');
        setFormData({
          title: '',
          description: '',
          persona: '',
          industry: '',
          status: 'draft',
          useKnowledgeBase: false,
          knowledgeQuery: '',
        });
        fetchIdeas();
      } else {
        throw new Error(data.error || 'Unknown error from server');
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      const errorMessage = error instanceof Error 
        ? `Không thể tạo ý tưởng: ${error.message}` 
        : 'Không thể tạo ý tưởng. Vui lòng kiểm tra:\n1. Backend server đã chạy chưa (http://localhost:4000)\n2. Database đã được khởi động chưa\n3. Kết nối mạng có ổn định không';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle generate description using AI
  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề trước khi generate mô tả!');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      const response = await fetch(`${API_URL}/ai/generate-idea`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          persona: formData.persona || undefined,
          industry: formData.industry || undefined,
          useKnowledgeBase: formData.useKnowledgeBase,
          knowledgeQuery: formData.knowledgeQuery || formData.title,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        // Provide specific error messages
        let errorMsg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;

        if (errorMsg.includes('No AI providers configured')) {
          errorMsg = '❌ Chưa cấu hình AI provider.\n\n' +
                    'Vui lòng:\n' +
                    '1. Vào Settings → AI Provider\n' +
                    '2. Nhập API key (OpenAI, Anthropic, DeepSeek, hoặc Gemini)\n' +
                    '3. Thử lại';
        } else if (response.status === 0 || errorMsg.includes('fetch')) {
          errorMsg = '❌ Không thể kết nối đến backend.\n\n' +
                    'Vui lòng kiểm tra:\n' +
                    `1. Backend đã chạy chưa? (${API_URL})\n` +
                    '2. Docker container đã start chưa?\n' +
                    '3. Database đã sẵn sàng chưa?';
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setFormData({ ...formData, description: data.data.description });

        let successMessage = '✅ Đã tạo mô tả thành công!';
        if (data.data.knowledgeUsed) {
          successMessage += ` (Sử dụng ${data.data.ragContext?.length || 0} nguồn từ Knowledge Base)`;
        }
        setGenerateSuccess(successMessage);

        if (data.usedProvider !== data.requestedProvider) {
          console.log(`ℹ️ Auto-selected provider: ${data.usedProvider} (requested: ${data.requestedProvider})`);
        }
      } else {
        throw new Error(data.error || 'Không thể generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);

      let errorMessage = 'Không thể tạo mô tả.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          errorMessage = `❌ Không thể kết nối đến backend server.\n\n` +
                        `Backend URL: ${API_URL}\n\n` +
                        `Vui lòng kiểm tra:\n` +
                        `1. Backend đã chạy chưa? (npm run dev trong /backend)\n` +
                        `2. Docker containers đã start chưa? (docker-compose up -d)\n` +
                        `3. Có lỗi trong backend logs không?`;
        } else {
          errorMessage = error.message;
        }
      }

      setGenerateError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle delete idea
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ý tưởng này?')) return;

    try {
      const response = await fetch(`${API_URL}/ideas/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('✅ Xóa ý tưởng thành công!');
        fetchIdeas();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Không thể xóa ý tưởng.');
    }
  };

  // Handle edit idea
  const handleEdit = async (id: number) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) {
      alert('Không tìm thấy ý tưởng!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/ideas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: idea.status === 'approved' ? 'draft' : 'approved',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Cập nhật trạng thái thành công!');
        fetchIdeas();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Không thể cập nhật ý tưởng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve/reject idea
  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!confirm(`Bạn có chắc chắn muốn ${newStatus === 'approved' ? 'duyệt' : 'từ chối'} ý tưởng này?`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/ideas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${newStatus === 'approved' ? 'Duyệt' : 'Từ chối'} ý tưởng thành công!`);
        fetchIdeas();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating idea status:', error);
      alert('Không thể cập nhật trạng thái ý tưởng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle generate content plan from idea
  const handleGenerateContentPlan = async (ideaId: number) => {
    setIsGeneratingPlan(true);
    setGeneratingPlanId(ideaId);
    setPlanGenerateError(null);
    setGeneratedContentPlan(null);

    try {
      const response = await fetch(`${API_URL}/content-plans/generate-from-idea/${ideaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Provider is optional - backend will auto-select
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setGeneratedContentPlan(data.data);
        setContentPlanDialogOpen(true);
        setPlanGenerateError(null);
      } else {
        throw new Error(data.error || 'Không thể tạo kế hoạch nội dung');
      }
    } catch (error) {
      console.error('Error generating content plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo kế hoạch nội dung. Vui lòng kiểm tra backend và API keys.';
      setPlanGenerateError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsGeneratingPlan(false);
      setGeneratingPlanId(null);
    }
  };

  return (
    <AppLayout 
      pageTitle="Content Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Content Management' }
      ]}
      user={{
        name: 'Vibe Coder',
        email: 'coder@vibecoding.com',
        avatar: undefined
      }}
    >
      <Tabs defaultValue="ideas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Ý tưởng
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Kế hoạch nội dung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ideas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-card rounded-lg shadow-lg p-6 border">
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-3">
                ➕ Tạo Ý Tưởng Mới
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-base mb-2">
                    Tiêu đề <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Nhập tiêu đề ngắn gọn và rõ ràng cho ý tưởng nội dung của bạn. Tiêu đề nên mô tả được chủ đề hoặc chủ điểm chính của ý tưởng.
                  </p>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={500}
                    className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring bg-background"
                    placeholder="Ví dụ: Campaign marketing cho sản phẩm mới"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-base mb-2">
                      Đối tượng
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Ai là đối tượng mục tiêu cho ý tưởng này? (ví dụ: marketer, developer, doanh nghiệp SMB...)
                    </p>
                    <input
                      type="text"
                      value={formData.persona}
                      onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                      maxLength={200}
                      className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring bg-background"
                      placeholder="Marketing Managers"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.persona.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-base mb-2">
                      Ngành nghề
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Ngành nghề hoặc lĩnh vực nào mà ý tưởng này hướng đến?
                    </p>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      maxLength={200}
                      className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring bg-background"
                      placeholder="Technology/Software"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.industry.length}/200 characters
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-base mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring bg-background"
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Knowledge Base Integration */}
                <div className="border border-border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="use-knowledge-base"
                      checked={formData.useKnowledgeBase}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, useKnowledgeBase: checked === true })
                      }
                    />
                    <Label htmlFor="use-knowledge-base" className="flex items-center gap-2 font-medium">
                      <BookOpen className="h-4 w-4" />
                      Sử dụng Knowledge Base
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Tích hợp thông tin từ tài liệu đã tải lên để tạo ý tưởng phù hợp và chi tiết hơn
                  </p>
                  
                  {formData.useKnowledgeBase && (
                    <div>
                      <Label htmlFor="knowledge-query" className="text-sm mb-2 block">
                        Từ khóa tìm kiếm (tùy chọn)
                      </Label>
                      <Input
                        id="knowledge-query"
                        value={formData.knowledgeQuery}
                        onChange={(e) => setFormData({ ...formData, knowledgeQuery: e.target.value })}
                        placeholder="Để trống để sử dụng tiêu đề làm từ khóa tìm kiếm..."
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Nếu để trống, hệ thống sẽ sử dụng tiêu đề để tìm kiếm thông tin liên quan
                      </p>
                    </div>
                  )}
                </div>

                {/* Generate Description Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateDescription}
                    disabled={!formData.title.trim() || isGenerating}
                    className="flex items-center gap-2 flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {formData.useKnowledgeBase ? 'Tạo mô tả (với KB)' : 'Tạo mô tả bằng AI'}
                      </>
                    )}
                  </Button>
                </div>

                {generateSuccess && <SuccessMessage message={generateSuccess} />}
                {generateError && <ErrorMessage message={generateError} />}

                {/* Description Field */}
                <div>
                  <label className="block font-semibold text-base mb-2">
                    Mô tả chi tiết
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Mô tả chi tiết về ý tưởng, bao gồm mục tiêu, đối tượng và nội dung chính
                  </p>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    maxLength={2000}
                    className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring bg-background resize-y"
                    placeholder="Nhập mô tả chi tiết hoặc sử dụng AI để tự động tạo..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/2000 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo Ý Tưởng'
                  )}
                </button>

                {submitSuccess && <SuccessMessage message={submitSuccess} />}
              </form>
            </div>

            {/* Ideas List */}
            <div className="bg-card rounded-lg shadow-lg p-6 border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  📋 Danh Sách Ý Tưởng
                </h2>
                <ContentStats ideas={ideas} />
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : ideas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có ý tưởng nào. Hãy tạo ý tưởng đầu tiên!</p>
              ) : (
                <div className="space-y-4 max-h-[700px] overflow-y-auto">
                  {ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{idea.title}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            idea.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : idea.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {idea.status === 'approved' ? 'Approved' : idea.status === 'rejected' ? 'Rejected' : 'Draft'}
                        </span>
                      </div>

                      {idea.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                          {idea.description.length > 150
                            ? idea.description.substring(0, 150) + '...'
                            : idea.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        {idea.persona && (
                          <div>
                            <strong>Đối tượng:</strong> {idea.persona}
                          </div>
                        )}
                        {idea.industry && (
                          <div>
                            <strong>Ngành:</strong> {idea.industry}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">
                        Tạo ngày: {new Date(idea.created_at).toLocaleDateString('vi-VN')}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleGenerateContentPlan(idea.id)}
                          disabled={isGeneratingPlan && generatingPlanId === idea.id}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isGeneratingPlan && generatingPlanId === idea.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang tạo kế hoạch...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Tạo kế hoạch</span>
                            </>
                          )}
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(idea.id)}
                            className="flex-1 px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(idea.id)}
                            className="flex-1 px-3 py-2 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <ContentPlansPage />
        </TabsContent>
      </Tabs>

      {/* Content Plan Dialog */}
      <Dialog open={contentPlanDialogOpen} onOpenChange={setContentPlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              ✨ Kế hoạch nội dung đã tạo
            </DialogTitle>
            <DialogDescription>
              Kế hoạch nội dung chi tiết đã được tạo thành công từ ý tưởng của bạn.
            </DialogDescription>
          </DialogHeader>

          {generatedContentPlan && (
            <div className="space-y-6 mt-4">
              {/* Target Audience */}
              {generatedContentPlan.target_audience && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>👥</span> Đối tượng người đọc
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{generatedContentPlan.target_audience}</p>
                  </div>
                </div>
              )}

              {/* Key Points */}
              {generatedContentPlan.key_points && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>🎯</span> Các điểm chính
                  </h3>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {generatedContentPlan.key_points}
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Content */}
              {generatedContentPlan.plan_content && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>📝</span> Nội dung kế hoạch
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {generatedContentPlan.plan_content}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Được tạo vào: {new Date(generatedContentPlan.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )}

          {planGenerateError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{planGenerateError}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LLM Provider Settings Dialog */}
      <Dialog open={showProviderSettings} onOpenChange={setShowProviderSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              AI model settings
            </DialogTitle>
            <DialogDescription>
              Choose your preferred AI model for generating content descriptions and plans.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <LLMProviderSwitcher 
              selectedProvider={selectedProvider}
              onChange={(provider) => {
                setSelectedProvider(provider)
                console.log('Selected provider:', provider)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Navigation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quy trình tạo nội dung</CardTitle>
          <CardDescription>
            Quy trình từ ý tưởng đến xuất bản nội dung
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Workflow Steps */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Lightbulb className="h-3 w-3" />
                <span>Ideas</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Briefs</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span>Content Packs</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                <span>Chỉnh sửa</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Duyệt</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                <span>Derivatives</span>
              </div>
              <ArrowRight className="h-3 w-3" />
              <div className="flex items-center gap-1">
                <Send className="h-3 w-3" />
                <span>Xuất bản</span>
              </div>
            </div>
          </div>

          {/* Next Step Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push('/briefs')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Xem Briefs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}