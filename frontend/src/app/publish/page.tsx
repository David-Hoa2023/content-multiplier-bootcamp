'use client'

import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Package, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PublishPage() {
  const router = useRouter()

  return (
    <AppLayout
      pageTitle="Xuất bản nội dung"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Xuất bản' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Xuất bản nội dung</h1>
          <p className="text-muted-foreground">
            Xuất bản nội dung lên các nền tảng khác nhau
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hàng đợi xuất bản</CardTitle>
            <CardDescription>
              Danh sách các nội dung đã sẵn sàng để xuất bản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tính năng xuất bản nội dung đang được phát triển. Vui lòng quay lại sau.
              </p>
              <Button
                onClick={() => router.push('/test-packs-draft')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Xem Content Packs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}



