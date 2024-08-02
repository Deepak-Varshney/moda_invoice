import connectDB from "@/lib/db";

import CustomerModel from "@/models/customerModel";
import { NextResponse } from "next/server";
export async function GET(request,{params}){
    try {
        const {id} = params;
        // connoect to db
        await connectDB();
        // get Product model
        const customer = await CustomerModel.findOne({_id:id});
        return NextResponse.json({
            message:"Customer fetched successfully",
            data:customer
        },{
            status:200
        })
    } catch (error) {
        return NextResponse.json(
        {
            message:"Failed to fetch a Customer",
            error:error
        },{
            status:500
        })
    }
}
export async function PUT(request,{params:{id}}){
    try {
        // get the data from the request 
        const {name, phone, gender} = await request.json()
        const newCustomer = {
            name,
            phone,
            gender
        };
        
        // connoect to db
        await connectDB();
        await CustomerModel.findByIdAndUpdate(id,newCustomer);
        return NextResponse.json({
            message:"Customer Updated successfully",
            data:newCustomer
        },{
            status:201
        })
    } catch (error) {
        return NextResponse.json(
        {
            message:"Failed to update a Customer",
            error:error
        },{
            status:500
        })
    }
}
