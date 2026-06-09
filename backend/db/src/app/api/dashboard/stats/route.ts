import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    // Get total revenue from orders
    const [revenueResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM orders WHERE status = 'Completed'`
    );
    const totalRevenue = (revenueResult as any)[0].totalRevenue;

    // Get total clients count
    const [clientsResult] = await pool.query(`SELECT COUNT(*) as totalClients FROM clients`);
    const totalClients = (clientsResult as any)[0].totalClients;

    // Get total orders count
    const [ordersResult] = await pool.query(`SELECT COUNT(*) as totalOrders FROM orders`);
    const totalOrders = (ordersResult as any)[0].totalOrders;

    // Get order statistics by status for today
    const today = new Date().toISOString().slice(0, 10);
    const [todayOrdersResult] = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders WHERE DATE(date) = CURDATE() GROUP BY status`
    );
    
    const todayOrdersStats: Record<string, number> = {
      todayOrders: 0,
      reprocessingToday: 0,
      processingToday: 0,
      pendingToday: 0,
      completedTotal: 0,
    };

    (todayOrdersResult as any[]).forEach((row) => {
      const status = row.status.toLowerCase();
      if (status === 'reprocessing') {
        todayOrdersStats.reprocessingToday = row.count;
      } else if (status === 'processing') {
        todayOrdersStats.processingToday = row.count;
      } else if (status === 'pending') {
        todayOrdersStats.pendingToday = row.count;
      }
      todayOrdersStats.todayOrders += row.count;
    });

    // Get total completed orders
    const [completedResult] = await pool.query(
      `SELECT COUNT(*) as completedTotal FROM orders WHERE status = 'Completed'`
    );
    todayOrdersStats.completedTotal = (completedResult as any)[0].completedTotal;

    // Get growth rate from analytics
    const [analyticsResult] = await pool.query(
      `SELECT revenue FROM analytics ORDER BY month DESC LIMIT 2`
    );
    let growthRate = 0;
    if ((analyticsResult as any[]).length >= 2) {
      const currentMonth = (analyticsResult as any[])[0].revenue;
      const previousMonth = (analyticsResult as any[])[1].revenue;
      if (previousMonth > 0) {
        growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
      }
    }

    return NextResponse.json({
      data: {
        totalRevenue: totalRevenue || 0,
        totalClients: totalClients || 0,
        totalOrders: totalOrders || 0,
        growthRate: growthRate || 0,
        ...todayOrdersStats,
      },
    }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/dashboard/stats]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics." }, { status: 500 });
  }
}
