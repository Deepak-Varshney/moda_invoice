import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InvoiceModel from "@/models/invoiceModel";

export async function GET(request) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({
      message: "Invalid date parameters",
    }, {
      status: 400,
    });
  }

  try {
    await connectDB();

    // Ensure that endDate is inclusive
    end.setHours(23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          issueDate: {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSales: { $sum: 1 },
          totalCustomers: { $addToSet: "$customer.id" },
          totalSoldItems: { $sum: "$totalQuantity" },
          totalItems: { $sum: { $size: "$products" } },
          totalPrice: { $sum: { $sum: "$products.price" } },
        }
      },
      {
        $addFields: {
          averageItemPrice: {
            $cond: {
              if: { $gt: ["$totalItems", 0] },
              then: { $divide: ["$totalPrice", "$totalItems"] },
              else: 0
            }
          },
          totalCustomersCount: { $size: "$totalCustomers" }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalSales: 1,
          totalCustomersCount: 1,
          totalSoldItems: 1,
          totalItems: 1,
          averageItemPrice: 1
        }
      }
    ];

    const [result] = await InvoiceModel.aggregate(aggregationPipeline);
    const recentSales = await InvoiceModel.find({ issueDate: { $gte: start, $lte: end } })
      .sort({ _id: -1 })
      .limit(5);

    return NextResponse.json({
      totalRevenue: result?.totalRevenue || 0,
      totalSales: result?.totalSales || 0,
      totalCustomers: result?.totalCustomersCount || 0,
      totalSoldItems: result?.totalSoldItems || 0,
      totalItems: result?.totalItems || 0,
      averageItemPrice: result?.averageItemPrice || 0,
      recentSales: recentSales.length > 0 ? recentSales : [],  // Ensure empty result
    }, {
      status: 200,
    });

  } catch (error) {
    return NextResponse.json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    }, {
      status: 500,
    });
  }
}
