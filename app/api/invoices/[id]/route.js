import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

import InvoiceModel from "@/models/invoiceModel";
export async function GET(request,{params:{id}}){
    try {
        // connoect to db
        await connectDB();
        // get Product model
        const invoice = await InvoiceModel.findOne({_id:id});
        return NextResponse.json({
            message:"Invoice fetched successfully",
            data:invoice
        },{
            status:200
        })
    } catch (error) {
        return NextResponse.json(
        {
            message:"Failed to fetch a Invoice",
            error:error
        },{
            status:500
        })
    }
}
export async function PUT(request,{params:{id}}){
    try {
        // get the data from the request 
        const { newInvoiceNumber:invoiceNumber, newCustomer:customer, newProducts:products, newTotalAmount:totalAmount, newStatus:status,newIssueDate:issueDate,newDueDate:dueDate} = await request.json();
        // connoect to db
        const newInvoice = {
            invoiceNumber,
            customer,
            products, // Include the products directly
            totalAmount,
            status,
            issueDate,
            dueDate,
        };

        await connectDB();
        await InvoiceModel.findByIdAndUpdate(id,newInvoice);
        return NextResponse.json({
            message:"Invoice Updated successfully",
            data:newInvoice
        },{
            status:201
        })
    } catch (error) {
        return NextResponse.json(
        {
            message:"Failed to update a Invoice",
            error:error
        },{
            status:500
        })
    }
}
