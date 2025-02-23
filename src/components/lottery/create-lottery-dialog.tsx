'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryType } from '@/types/lottery'
import { LotteryProgram } from '@/lib/solana/program'
import { toast } from 'sonner'
import { handleProgramError } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import * as z from 'zod'
import { addDays, addWeeks, addMonths, startOfTomorrow } from 'date-fns'

const formSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']),
  ticketPrice: z.string().min(1),
  prizePool: z.string().min(1),
})

type FormValues = z.infer<typeof formSchema>

interface CreateLotteryDialogProps {
  onSuccess: () => void
}

export function CreateLotteryDialog({ onSuccess }: CreateLotteryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { publicKey, wallet } = useWallet()
  const { connection } = useConnection()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'daily',
      ticketPrice: '',
      prizePool: '',
    },
  })

  const getDrawTime = (type: LotteryType) => {
    const tomorrow = startOfTomorrow()
    switch (type) {
      case LotteryType.Daily:
        return addDays(tomorrow, 1)
      case LotteryType.Weekly:
        return addWeeks(tomorrow, 1)
      case LotteryType.Monthly:
        return addMonths(tomorrow, 1)
      default:
        return tomorrow
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!publicKey || !connection || !wallet) {
      toast.error("Please connect your wallet to create a lottery")
      return
    }

    try {
      setLoading(true)
      const adapter = wallet.adapter as BaseSignerWalletAdapter
      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      const drawTime = getDrawTime(values.type as LotteryType)
      await program.createLottery(
        values.type as LotteryType,
        parseFloat(values.ticketPrice),
        Math.floor(drawTime.getTime() / 1000),
        parseFloat(values.prizePool)
      )

      toast.success("Lottery created successfully!")
      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error) {
      const errorMessage = handleProgramError(error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Lottery</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Lottery</DialogTitle>
          <DialogDescription>
            Create a new lottery by specifying its type, ticket price, and prize pool.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'type'> }) => (
                <FormItem>
                  <FormLabel>Lottery Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lottery type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
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
              name="ticketPrice"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'ticketPrice'> }) => (
                <FormItem>
                  <FormLabel>Ticket Price (USDC)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter ticket price"
                      type="number"
                      min="0"
                      step="0.1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The price of each ticket in USDC.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prizePool"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'prizePool'> }) => (
                <FormItem>
                  <FormLabel>Prize Pool (USDC)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter prize pool"
                      type="number"
                      min="0"
                      step="0.1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The total prize pool in USDC.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Lottery'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 