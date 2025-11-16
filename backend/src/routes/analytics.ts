import { FastifyPluginAsync } from 'fastify'
import pool from '../db'

interface AnalyticsStats {
  overview: {
    totalIdeas: number
    totalContentPlans: number
    totalDerivatives: number
    publishedDerivatives: number
    averageDerivativesPerPlan: number
  }
  statusDistribution: {
    draft: number
    scheduled: number
    published: number
  }
  weeklyContent: Array<{
    week: string
    ideas: number
    plans: number
    derivatives: number
    published: number
  }>
  platformBreakdown: Array<{
    platform: string
    total: number
    published: number
    draft: number
    scheduled: number
  }>
  recentActivity: Array<{
    id: string
    title: string
    type: string
    status: string
    createdAt: string
    updatedAt: string
  }>
}

const analyticsRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Get overall analytics stats
  fastify.get('/analytics/stats', async (request, reply) => {
    try {
      // Get overview counts
      const overviewResult = await pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM ideas) as total_ideas,
          (SELECT COUNT(*)::int FROM content_plans) as total_content_plans,
          (SELECT COUNT(*)::int FROM derivatives) as total_derivatives,
          (SELECT COUNT(*)::int FROM derivatives WHERE status = 'published') as published_derivatives
      `)

      const overview = overviewResult.rows[0]
      const avgDerivatives = overview.total_content_plans > 0
        ? (overview.total_derivatives / overview.total_content_plans).toFixed(2)
        : 0

      // Get status distribution for derivatives
      const statusResult = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'draft')::int as draft,
          COUNT(*) FILTER (WHERE status = 'scheduled')::int as scheduled,
          COUNT(*) FILTER (WHERE status = 'published')::int as published
        FROM derivatives
      `)

      // Get weekly content creation (last 4 weeks)
      const weeklyResult = await pool.query(`
        WITH weeks AS (
          SELECT generate_series(
            date_trunc('week', NOW() - INTERVAL '3 weeks'),
            date_trunc('week', NOW()),
            '1 week'::interval
          ) as week_start
        )
        SELECT
          'Week ' || ROW_NUMBER() OVER (ORDER BY w.week_start) as week,
          COALESCE(
            (SELECT COUNT(*)::int FROM ideas WHERE created_at >= w.week_start AND created_at < w.week_start + INTERVAL '1 week'),
            0
          ) as ideas,
          COALESCE(
            (SELECT COUNT(*)::int FROM content_plans WHERE created_at >= w.week_start AND created_at < w.week_start + INTERVAL '1 week'),
            0
          ) as plans,
          COALESCE(
            (SELECT COUNT(*)::int FROM derivatives WHERE created_at >= w.week_start AND created_at < w.week_start + INTERVAL '1 week'),
            0
          ) as derivatives,
          COALESCE(
            (SELECT COUNT(*)::int FROM derivatives WHERE status = 'published' AND created_at >= w.week_start AND created_at < w.week_start + INTERVAL '1 week'),
            0
          ) as published
        FROM weeks w
        ORDER BY w.week_start
      `)

      // Get platform breakdown
      const platformResult = await pool.query(`
        SELECT
          platform,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'published')::int as published,
          COUNT(*) FILTER (WHERE status = 'draft')::int as draft,
          COUNT(*) FILTER (WHERE status = 'scheduled')::int as scheduled
        FROM derivatives
        GROUP BY platform
        ORDER BY total DESC
      `)

      // Get recent activity
      const recentActivityResult = await pool.query(`
        (
          SELECT
            id::text,
            title,
            'idea' as type,
            status,
            created_at,
            created_at as updated_at
          FROM ideas
          ORDER BY created_at DESC
          LIMIT 3
        )
        UNION ALL
        (
          SELECT
            id::text,
            COALESCE(LEFT(plan_content, 50), 'Content Plan') as title,
            'content_plan' as type,
            'created' as status,
            created_at,
            created_at as updated_at
          FROM content_plans
          ORDER BY created_at DESC
          LIMIT 3
        )
        UNION ALL
        (
          SELECT
            id::text,
            platform || ' - ' || LEFT(content, 30) as title,
            'derivative' as type,
            status,
            created_at,
            COALESCE(updated_at, created_at) as updated_at
          FROM derivatives
          ORDER BY created_at DESC
          LIMIT 4
        )
        ORDER BY created_at DESC
        LIMIT 10
      `)

      const stats: AnalyticsStats = {
        overview: {
          totalIdeas: overview.total_ideas || 0,
          totalContentPlans: overview.total_content_plans || 0,
          totalDerivatives: overview.total_derivatives || 0,
          publishedDerivatives: overview.published_derivatives || 0,
          averageDerivativesPerPlan: parseFloat(avgDerivatives as string)
        },
        statusDistribution: statusResult.rows[0] || { draft: 0, scheduled: 0, published: 0 },
        weeklyContent: weeklyResult.rows.map(row => ({
          week: row.week,
          ideas: row.ideas,
          plans: row.plans,
          derivatives: row.derivatives,
          published: row.published
        })),
        platformBreakdown: platformResult.rows,
        recentActivity: recentActivityResult.rows.map(row => ({
          id: row.id,
          title: row.title,
          type: row.type,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }))
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch analytics stats'
      })
    }
  })

  // Get content performance metrics
  fastify.get('/analytics/performance', async (request, reply) => {
    try {
      const result = await pool.query(`
        SELECT
          platform,
          AVG(character_count)::int as avg_character_count,
          COUNT(*)::int as total_posts,
          COUNT(*) FILTER (WHERE status = 'published')::int as published_count,
          COUNT(*) FILTER (WHERE scheduled_at IS NOT NULL)::int as scheduled_count
        FROM derivatives
        GROUP BY platform
        ORDER BY total_posts DESC
      `)

      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch performance metrics'
      })
    }
  })
}

export default analyticsRoutes
