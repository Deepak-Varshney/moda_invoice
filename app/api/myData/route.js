import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CounterModel from "@/models/counter";

export async function GET(request) {
  try {
    await connectDB();

    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // Find the current sequence document without updating it
    let seqDoc = await CounterModel.findOne({ id: "Autoval", date: currentDate });

    if (!seqDoc) {
      // If no sequence document exists, create a new one
      seqDoc = await CounterModel.create({ id: "Autoval", date: currentDate, seq: 1 });
    }
// generating the next invoiceNumber
    const invoiceNumber = `INV-${seqDoc.seq+1}`;

    return NextResponse.json({ invoiceNumber }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving invoice number:", error);
    return NextResponse.json({ message: "Failed to retrieve invoice number", error: error.message }, { status: 500 });
  }
}
