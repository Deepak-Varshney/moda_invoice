import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import ProductModel from '../../../models/productModel';
// Creating a new product
export async function POST(request) {
  try {
    const { name, costPrice, sellingPrice, skuCode } = await request.json();
    const newProduct = { name, costPrice, sellingPrice, skuCode };

    await connectDB();
    const createdProduct = await ProductModel.create(newProduct);

    return NextResponse.json(
      {
        message: "Product created successfully",
        data: createdProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// // Deleting a product by ID
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    await connectDB();
    await ProductModel.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Fetching products with optional search and sorting
export async function GET(request) {
    try {
        // Get query parameters
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;
        const sort = url.searchParams.get('sort') || 'desc'; // Default sort order

        // Connect to database
        await connectDB();

        // Build query
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        // Fetch products with sorting and pagination
        const totalProducts = await ProductModel.countDocuments(query);
        const products = await ProductModel.find(query)
            .skip(offset)
            .limit(limit)
            .sort({ updatedAt: -1 }); // Sort by updatedAt

        return NextResponse.json({
            message: 'Products fetched successfully',
            data: products,
            totalProducts,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            message: 'Failed to fetch products',
            error: error.message,
        }, { status: 500 });
    }
}
