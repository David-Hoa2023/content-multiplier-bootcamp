'use client'

import { RAGSimilarityDebugger, type RAGResult } from '@/components/ui'

const mockQuery = 'How do I implement authentication in Next.js?'

const mockResults: RAGResult[] = [
  {
    doc_id: 'nextjs-docs-auth',
    chunk_index: 5,
    content: 'Next.js provides multiple authentication strategies. You can implement authentication using NextAuth.js, which supports OAuth providers, email/password, and magic links. First, install next-auth and create an API route at pages/api/auth/[...nextauth].js. Configure your providers and session strategy. Then use the useSession hook in your components to access authentication state.',
    similarity_score: 0.92
  },
  {
    doc_id: 'nextjs-best-practices',
    chunk_index: 12,
    content: 'For authentication in Next.js applications, consider using middleware to protect routes. Create a middleware.ts file that checks for authentication tokens and redirects unauthorized users. This approach works well with both App Router and Pages Router. You can also implement server-side authentication checks in getServerSideProps or Server Components.',
    similarity_score: 0.87
  },
  {
    doc_id: 'auth-tutorial',
    chunk_index: 3,
    content: 'Implementing secure authentication requires several steps: setting up session management, configuring secure cookies, implementing CSRF protection, and handling token refresh. Next.js makes this easier with its API routes and middleware system. Always use HTTPS in production and implement proper error handling for authentication failures.',
    similarity_score: 0.78
  },
  {
    doc_id: 'security-guide',
    chunk_index: 8,
    content: 'Authentication security in Next.js involves protecting your API routes, validating JWT tokens, and securing environment variables. Use the built-in environment variable system to store secrets. Implement rate limiting on authentication endpoints to prevent brute force attacks. Consider using a third-party service like Auth0 or Clerk for production applications.',
    similarity_score: 0.72
  },
  {
    doc_id: 'nextjs-docs-middleware',
    chunk_index: 15,
    content: 'Next.js middleware runs before a request is completed, making it ideal for authentication checks. You can verify tokens, check user permissions, and redirect to login pages. Middleware runs on the Edge Runtime for fast response times. Use the NextResponse object to modify requests or redirect users based on authentication state.',
    similarity_score: 0.68
  }
]

export default function RAGSimilarityDebuggerDemo() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">RAG similarity debugger demo</h1>
        <p className="text-muted-foreground">
          Debug and inspect RAG retrieval results with similarity scores and content highlighting.
        </p>
      </div>
      
      <RAGSimilarityDebugger 
        query={mockQuery}
        results={mockResults}
      />
    </div>
  )
}


