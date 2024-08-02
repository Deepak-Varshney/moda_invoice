import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InvoiceModel from "@/models/invoiceModel";
import CounterModel from "@/models/counter";

// Utility function to aggregate data by month using MongoDB's aggregation framework
const aggregateDataByMonth = async () => {
  const result = await InvoiceModel.aggregate([
    {
      $group: {
        _id: { $month: "$issueDate" },
        totalAmount: { $sum: "$totalAmount" }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const aggregatedData = Array(12).fill(0).map((_, index) => ({
    name: monthNames[index],
    total: 0
  }));

  result.forEach(({ _id, totalAmount }) => {
    aggregatedData[_id - 1].total = totalAmount;
  });

  return aggregatedData;
};

// Fetch all invoices
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    await connectDB();
    const searchRegex = new RegExp(search, 'i');
    const query = search ? { $or: [{ 'customer.name': searchRegex }, { 'customer.phone': searchRegex }, { invoiceNumber: searchRegex }] } : {};
    const totalInvoices = await InvoiceModel.countDocuments(query);
    const invoices = await InvoiceModel.find(query)
      .skip(offset)
      .limit(limit);

    const aggregate = url.searchParams.get('aggregate');

    if (aggregate) {
      const aggregatedData = await aggregateDataByMonth();
      return NextResponse.json({
        message: "Invoices fetched and aggregated successfully",
        data: aggregatedData
      }, {
        status: 200
      });
    } else {
      return NextResponse.json({
        message: 'Invoices fetched successfully',
        data: invoices,
        totalInvoices,
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({
      message: "Failed to fetch Invoices",
      error: error.message
    }, {
      status: 500
    });
  }
}

// Delete an invoice
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    await connectDB();

    const deletedInvoice = await InvoiceModel.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return NextResponse.json({
        message: "Invoice not found",
      }, {
        status: 404
      });
    }

    return NextResponse.json({
      message: "Invoice Deleted Successfully",
    }, {
      status: 200
    });

  } catch (error) {
    return NextResponse.json({
      message: "Failed to delete Invoice",
      error: error.message
    }, {
      status: 500
    });
  }
}

// Create a new invoice
export async function POST(request) {
  try {
    const { customer, products, totalAmount, totalQuantity } = await request.json();

    await connectDB();
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let seqDoc = await CounterModel.findOneAndUpdate(
      { id: "Autoval", date: currentDate },
      { "$inc": { "seq": 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!seqDoc) {
      seqDoc = await CounterModel.create({ id: "Autoval", date: currentDate, seq: 1 });
    }

    const currentDateUTC = new Date();
    const ISTOffset = 330 * 60000;
    const currentDateIST = new Date(currentDateUTC.getTime() + ISTOffset);
    const issueDate = currentDateIST.toISOString().slice(0, 10);
    const invoiceNumber = `INV-${seqDoc.seq}`;

    const invoiceData = {
      invoiceNumber,
      customer,
      products,
      totalAmount,
      issueDate,
      totalQuantity
    };

    await InvoiceModel.create(invoiceData);

    return NextResponse.json({ message: "Invoice Created Successfully", data: invoiceData }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      message: "Failed to create Invoice",
      error: error.message,
    }, {
      status: 500,
    });
  }
}
