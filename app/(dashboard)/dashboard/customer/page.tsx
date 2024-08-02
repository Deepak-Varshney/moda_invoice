import BreadCrumb from '@/components/breadcrumb';
import { CustomerTable } from '@/components/tables/customer-tables/customer-table';
import { columns } from '@/components/tables/customer-tables/columns';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Customer } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { config } from '@/config';
const breadcrumbItems = [{ title: 'Customer', link: '/dashboard/customer' }];

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default async function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search || '';
  const offset = (page - 1) * pageLimit;

  const res = await fetch(
    `${config.deployedUrl}/api/customers?page=${page}&limit=${pageLimit}&search=${search}`,
    {
      cache: 'no-cache'
    }
  );
  const customerRes = await res.json();
  const totalUsers = customerRes.totalCustomers;
  const pageCount = Math.ceil(totalUsers / pageLimit);
  const customer: Customer[] = customerRes.data;
  return (
    <>
      <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Customer (${totalUsers})`}
            description="Manage customers"
          />

          <Link
            href={'/dashboard/customer/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <CustomerTable
          searchKey="name"
          pageNo={page}
          columns={columns}
          totalUsers={totalUsers}
          data={customer}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
