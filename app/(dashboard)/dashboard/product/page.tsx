import BreadCrumb from '@/components/breadcrumb';
import { columns } from '@/components/tables/product-tables/columns';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ProductTable } from '@/components/tables/product-tables/product-table';
import { config } from '@/config';

const breadcrumbItems = [{ title: 'Products', link: '/dashboard/product' }];

type ParamsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default async function page({ searchParams }: ParamsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search || '';
  const offset = (page - 1) * pageLimit;

  const res = await fetch(
    `${config.deployedUrl}/api/products?page=${page}&limit=${pageLimit}&search=${search}`,
    { cache: 'no-cache' }
  );
  const productRes = await res.json();
  const totalProducts = productRes.totalProducts as number;
  const pageCount = Math.ceil(totalProducts / pageLimit);
  const products: Product[] = productRes.data;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Products (${totalProducts})`}
            description="Manage products"
          />

          <Link
            href={'/dashboard/product/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <ProductTable
          searchKey="name"
          pageNo={page}
          data={products}
          columns={columns}
          totalCount={totalProducts}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
