import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

const formSchema = z.object({
  msg_type: z.string(),
  msg_prio: z.string(),
  board_type_id: z.string(),
  board_inst_id: z.string(),
  time: z.string(),
  actuator: z.string(),
  cmd_state: z.string(),
})

type FormData = z.infer<typeof formSchema>

export function CanSender() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      msg_type: "ACTUATOR_CMD",
      msg_prio: "HIGHEST",
      board_type_id: "ANY",
      board_inst_id: "ANY",
      time: "000000000",
      actuator: "ACTUATOR_OX_INJECTOR_VALVE",
      cmd_state: "ACT_STATE_ON",
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-end gap-3 bg-zinc-900 p-4 rounded-lg">
          {/* msg_type */}
          <FormField
            control={form.control}
            name="msg_type"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">msg_type</FormLabel>
                <FormControl>
                  <Select {...field} className="bg-zinc-800 border-zinc-700 text-white">
                    <option value="ACTUATOR_CMD">ACTUATOR_CMD</option>
                    <option value="SENSOR_CMD">SENSOR_CMD</option>
                    <option value="OTHER">OTHER</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* msg_prio */}
          <FormField
            control={form.control}
            name="msg_prio"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">msg_prio</FormLabel>
                <FormControl>
                  <Select {...field} className="bg-zinc-800 border-zinc-700 text-white">
                    <option value="HIGHEST">HIGHEST</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* board_type_id */}
          <FormField
            control={form.control}
            name="board_type_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">board_type_id</FormLabel>
                <FormControl>
                  <Select {...field} className="bg-zinc-800 border-zinc-700 text-white">
                    <option value="ANY">ANY</option>
                    <option value="BOARD_1">BOARD_1</option>
                    <option value="BOARD_2">BOARD_2</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* board_inst_id */}
          <FormField
            control={form.control}
            name="board_inst_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">board_inst_id</FormLabel>
                <FormControl>
                  <Select {...field} className="bg-zinc-800 border-zinc-700 text-white">
                    <option value="ANY">ANY</option>
                    <option value="INST_1">INST_1</option>
                    <option value="INST_2">INST_2</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* time */}
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
                    placeholder="000000000"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* actuator */}
          <FormField
            control={form.control}
            name="actuator"
            render={({ field }) => (
              <FormItem className="flex-[2]">
                <FormLabel className="text-xs text-zinc-400">actuator</FormLabel>
                <FormControl>
                  <Select {...field} className="bg-zinc-800 border-zinc-700 text-white">
                    <option value="ACTUATOR_OX_INJECTOR_VALVE">ACTUATOR_OX_INJECTOR_VALVE</option>
                    <option value="ACTUATOR_FUEL_INJECTOR_VALVE">ACTUATOR_FUEL_INJECTOR_VALVE</option>
                    <option value="ACTUATOR_VENT_VALVE">ACTUATOR_VENT_VALVE</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* cmd_state */}
          <FormField
            control={form.control}
            name="cmd_state"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-zinc-400">cmd_state</FormLabel>
                <FormControl>
                  <Select {...field} className="bg-zinc-800 border-zinc-700 text-white">
                    <option value="ACT_STATE_ON">ACT_STATE_ON</option>
                    <option value="ACT_STATE_OFF">ACT_STATE_OFF</option>
                  </Select>
                </FormControl>
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
