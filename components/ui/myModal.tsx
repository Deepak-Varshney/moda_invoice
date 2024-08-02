'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/mydialogue';
import { ScrollArea } from './scroll-area';


interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (

    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
<ScrollArea className='h-[85vh]'>
        <div className="">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div>{children}</div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
