import connectDB from '@/lib/db';

import ProductModel from '@/models/productModel';
import { NextResponse } from 'next/server';
export async function GET(request, { params: { id } }) {
  try {
    // connoect to db
    await connectDB();
    // get Product model
    const product = await ProductModel.findOne({ _id: id });
    return NextResponse.json(
      {
        message: 'Product fetched successfully',
        data: product
      },
      {
        status: 200
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch a Product',
        error: error
      },
      {
        status: 500
      }
    );
  }
}
export async function PUT(request, { params: { id } }) {
  try {
    // get the data from the request
    const { name, costPrice, sellingPrice, skuCode } = await request.json();
    // connoect to db
    const newProduct = {
      name,
      costPrice,
      sellingPrice,
      skuCode
    };

    await connectDB();
    await ProductModel.findByIdAndUpdate(id, newProduct);
    return NextResponse.json(
      {
        message: 'Product Updated successfully',
        data: newProduct
      },
      {
        status: 201
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to update a Product',
        error: error
      },
      {
        status: 500
      }
    );
  }
}