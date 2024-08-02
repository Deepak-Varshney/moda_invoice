'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Product>[] = [
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
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'costPrice',
    header: 'COST PRICE'
  },
  {
    accessorKey: 'sellingPrice',
    header: 'SELLING PRICE'
  },
  {
    accessorKey: 'skuCode',
    header: 'SKU CODE'
  },
  {
    id: 'actions',
    header: 'OPTIONS',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
