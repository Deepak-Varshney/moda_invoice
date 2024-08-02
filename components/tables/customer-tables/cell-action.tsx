'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/config';
import { Customer } from '@/constants/data';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CellActionProps {
  data: Customer;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  // console.log(data)
  const onConfirm = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${config.deployedUrl}/api/customers?id=${data._id}`,
        {
          method: 'DELETE'
        }
      );

      if (res.ok) {
        router.refresh();
        toast({
          variant: 'default',
          title: 'Customer Deleted Success',
          description: 'Your customer has been deleted from your database.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  // const onConfirm = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch(`/api/customers?id=${data._id}`, {
  //       method: 'DELETE',
  //     });

  //     if (res.ok) {
  //       router.refresh();
  //       router.push('/dashboard/customer');
  //     } else {
  //       console.error('Error deleting customer');
  //     }
  //     // console.log(data);
  //     console.log(data._id);
  //   } catch (error) {
  //     console.error('Error deleting customer:', error);
  //   } finally {
  //     setLoading(false);
  //     setOpen(false);
  //   }
  // };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/customer/${data._id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
