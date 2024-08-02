import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ObjectId } from 'mongodb';

import CustomerModel from '@/models/customerModel';

export async function POST(request) {
  try {
    // get the data from the requrest
    const { name, phone, gender, id } = await request.json();
    const newCustomer = {
      name,
      phone,
      gender
    };

    if (id) newCustomer._id = new ObjectId(id);
    //connect to mongodb

    await connectDB();
    // use model to create a product
    const data = await CustomerModel.create(newCustomer);
    return NextResponse.json(
      { message: 'Customer Created Successfully', data: data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to create a Customer',
        error: error
      },
      {
        status: 500
      }
    );
  }
}

export async function DELETE(request) {
  try {
    // get the id of the product
    const id = request.nextUrl.searchParams.get('id');
    console.log(id);
    //connect the db
    await connectDB();
    // use the model to delete
    await CustomerModel.findByIdAndDelete(id);
    // return the response
    return NextResponse.json(
      {
        message: 'Customer Deleted Successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to delete Customer',
        error: error
      },
      {
        status: 500
      }
    );
  }
}

// Fetching customers with optional search and pagination
export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Connect to database
    await connectDB();

    // Build query
    const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive
    const query = search
      ? { $or: [{ name: searchRegex }, { phone: searchRegex }] }
      : {};
    const totalCustomers = await CustomerModel.countDocuments(query);
    const customers = await CustomerModel.find(query)
      .skip(offset)
      .limit(limit)
      .sort({ updatedAt: -1 }); // Sort by updatedAt

    return NextResponse.json(
      {
        message: 'Customers fetched successfully',
        data: customers,
        totalCustomers
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch customers',
        error: error.message
      },
      { status: 500 }
    );
  }
}
