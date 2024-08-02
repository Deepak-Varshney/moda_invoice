'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Invoice } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import {formatPhoneNumber} from '@/utils/helpers'


export const columns: ColumnDef<Invoice>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false
  },
  {
    accessorKey: 'invoiceNumber',
    header: 'INVOICE NUMBER'
  },
  {
    accessorKey: 'customer.name',
    header: 'CUSTOMER'
  },
  {
    accessorKey: 'customer.phone',
    header: 'PHONE',
    cell: ({ cell }) => {
      return formatPhoneNumber(cell.getValue() as string);
    }
  },
  {
    accessorKey: 'issueDate',
    header: 'INVOICE DATE',
    cell: ({ cell }) => {
      const date = new Date(cell.getValue() as string);
      return date.toISOString().slice(0,10);
    }
  },
  {
    accessorKey: 'totalAmount',
    header: 'TOTAL AMOUNT',
  },

  {
    accessorKey: 'totalQuantity',
    header: 'TOTAL QUANTITY'
  },

  {
    id: 'actions',
    header: 'OPTION',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
