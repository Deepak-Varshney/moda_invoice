import BreadCrumb from '@/components/breadcrumb';
import { columns } from '@/components/tables/invoice-tables/columns';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Invoice } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { InvoiceTable } from '@/components/tables/invoice-tables/invoice-table';
import { config } from '@/config';

const breadcrumbItems = [{ title: 'Invoices', link: '/dashboard/invoice' }];

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
    `${config.deployedUrl}/api/invoices?page=${page}&limit=${pageLimit}&search=${search}`,
    { cache: 'no-cache' }
  );
  const invoiceRes = await res.json();
  const totalInvoices = invoiceRes.totalInvoices;
  const pageCount = Math.ceil(totalInvoices / pageLimit);
  const invoices: Invoice[] = invoiceRes.data;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Invoices (${totalInvoices})`}
            description="Manage invoices"
          />

          <Link
            href={'/dashboard/invoice/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <InvoiceTable
          searchKey="invoiceNumber"
          pageNo={page}
          columns={columns}
          totalInvoices={totalInvoices}
          data={invoices}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
