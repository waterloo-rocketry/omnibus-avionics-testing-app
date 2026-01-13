import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const jsonStringSchema = z.string().refine((val) => {
  if (val.trim() === "") return true
  try {
    JSON.parse(val)
    return true
  } catch {
    return false
  }
}, {
  message: "Invalid JSON format",
})

const formSchema = z.object({
  msg_type: jsonStringSchema,
  msg_prio: jsonStringSchema,
  board_type_id: jsonStringSchema,
  board_inst_id: jsonStringSchema,
  time: jsonStringSchema,
})

type FormData = z.infer<typeof formSchema>

export function CanSender() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      msg_type: "",
      msg_prio: "",
      board_type_id: "",
      board_inst_id: "",
      time: "",
    },
  })

  const onSubmit = (data: FormData) => {
    // Parse JSON values before submitting
    const parsedData = {
      msg_type: data.msg_type ? JSON.parse(data.msg_type) : null,
      msg_prio: data.msg_prio ? JSON.parse(data.msg_prio) : null,
      board_type_id: data.board_type_id ? JSON.parse(data.board_type_id) : null,
      board_inst_id: data.board_inst_id ? JSON.parse(data.board_inst_id) : null,
      time: data.time ? JSON.parse(data.time) : null,
    }
    console.log(parsedData)
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col items-end items-stretch gap-3 bg-zinc-900 p-4 rounded-lg">
          {/* msg_type */}
          <FormField
            control={form.control}
            name="msg_type"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">msg_type </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder='e.g., {"value": 1}'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* msg_prio */}
          <FormField
            control={form.control}
            name="msg_prio"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">msg_prio </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder='e.g., {"priority": 2}'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* board_type_id */}
          <FormField
            control={form.control}
            name="board_type_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">board_type_id </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder='e.g., {"id": "abc123"}'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* board_inst_id */}
          <FormField
            control={form.control}
            name="board_inst_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">board_inst_id </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder='e.g., {"inst": 5}'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">time (s)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder='e.g., {"seconds": 10}'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
         


          {/* SEND Button */}
          <Button
            type="submit"
            className="bg-zinc-700 hover:bg-zinc-600 text-white h-9 px-6"
          >
            SEND
          </Button>
        </div>
      </form>
    </Form>
    </div>
  )
}
