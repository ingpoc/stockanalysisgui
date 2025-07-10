'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { LotteryType } from '@/types/lottery_types';
import { handleProgramError, formatUSDC } from '@/lib/utils';
import { useLottery } from '@/hooks/useLottery';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly'], {
    required_error: 'Lottery type is required',
  }),
  ticketPrice: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Ticket price must be a positive number',
    }),
  prizePool: z
    .string()
    .optional()
    .refine(
      val =>
        val === '' ||
        val === undefined ||
        (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      {
        message: 'Target prize pool must be a non-negative number',
      }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLotteryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const getDrawTime = (type: string): Date => {
  const now = new Date();
  let drawTime = new Date(now);
  drawTime.setHours(23, 59, 59, 999);

  switch (type) {
    case 'daily':
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      const daysUntilSunday = 7 - dayOfWeek;
      drawTime.setDate(now.getDate() + daysUntilSunday);
      break;
    case 'monthly':
      drawTime = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      drawTime.setHours(23, 59, 59, 999);
      break;
  }
  return drawTime;
};

const getDurationHours = (type: string) => {
  switch (type) {
    case 'Daily':
      return 24;
    case 'Weekly':
      return 24 * 7;
    case 'Monthly':
      return 24 * 30;
    default:
      return 24;
  }
};

// Convert form values to LotteryType
const convertToLotteryType = (formType: string): LotteryType => {
  switch (formType) {
    case 'daily':
      return 'Daily' as unknown as LotteryType;
    case 'weekly':
      return 'Weekly' as unknown as LotteryType;
    case 'monthly':
      return 'Monthly' as unknown as LotteryType;
    default:
      return 'Daily' as unknown as LotteryType;
  }
};

export function CreateLotteryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLotteryDialogProps) {
  const { publicKey } = useWallet();
  const { createLottery, isCreating } = useLottery();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'daily',
      ticketPrice: '1',
      prizePool: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!publicKey) {
      toast.error('Please connect your wallet to create a lottery');
      return;
    }

    try {
      const ticketPrice = parseFloat(values.ticketPrice);
      const prizePool =
        values.prizePool === '' || values.prizePool === undefined
          ? 0
          : parseFloat(values.prizePool);

      const drawTime = getDrawTime(values.type);
      const drawTimeSeconds = Math.floor(drawTime.getTime() / 1000);

      await createLottery({
        type: convertToLotteryType(values.type),
        ticketPrice,
        drawTime: drawTimeSeconds,
        prizePool,
      });

      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Lottery</DialogTitle>
          <DialogDescription>
            Create a new lottery by specifying its type, ticket price, and prize
            pool.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='type'
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, 'type'>;
              }) => (
                <FormItem>
                  <FormLabel>Lottery Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select lottery type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly</SelectItem>
                      <SelectItem value='monthly'>Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type determines when the lottery will be drawn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ticketPrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Price (USDC)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., 1.5'
                      {...field}
                      type='number'
                      step='0.01'
                    />
                  </FormControl>
                  <FormDescription>
                    Price for a single ticket. Values will be converted to the
                    smallest USDC unit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='prizePool'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Prize Pool (USDC - Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., 1000 (leave empty for no target)'
                      {...field}
                      type='number'
                      step='1'
                    />
                  </FormControl>
                  <FormDescription>
                    Optional target prize pool to reach. The actual prize pool
                    will start at 0 and grow as tickets are purchased.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit' disabled={isCreating}>
                {isCreating && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {isCreating ? 'Creating...' : 'Create Lottery'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
