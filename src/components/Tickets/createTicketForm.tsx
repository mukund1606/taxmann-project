"use client";
// Form Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
// Components
import { toast } from "sonner";

import { Form, FormField, FormItem } from "@/components/ui/form";
import { Button, Input, Textarea } from "@nextui-org/react";

import { api, isTRPCClientError } from "@/trpc/react";
import { CreateTicketFormSchema } from "@/types/forms";

export default function CreateTicket() {
  const apiUtils = api.useUtils();
  const createRoute = api.ticket.create.useMutation({
    onSuccess: async () => {
      await apiUtils.ticket.tickets.invalidate();
    },
  });
  const form = useForm<z.infer<typeof CreateTicketFormSchema>>({
    resolver: zodResolver(CreateTicketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  async function submitForm(values: z.infer<typeof CreateTicketFormSchema>) {
    try {
      await createRoute.mutateAsync(values);
      toast.success("Success", {
        description: "Ticket created successfully",
      });
    } catch (e) {
      if (isTRPCClientError(e)) {
        toast.error(e.message);
      }
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="flex w-full flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <Input
                  autoFocus
                  label="Title"
                  variant="bordered"
                  classNames={{
                    description: "text-sm",
                    label: "text-md font-bold",
                  }}
                  size="lg"
                  {...field}
                  isInvalid={form.formState.errors.title !== undefined}
                  errorMessage={form.formState.errors.title?.message}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <Textarea
                  label="Description"
                  variant="bordered"
                  classNames={{
                    description: "text-sm",
                    label: "text-md font-bold",
                  }}
                  size="lg"
                  {...field}
                  isInvalid={form.formState.errors.description !== undefined}
                  errorMessage={form.formState.errors.description?.message}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <Input
                  label="Category"
                  variant="bordered"
                  classNames={{
                    description: "text-sm",
                    label: "text-md font-bold",
                  }}
                  size="lg"
                  {...field}
                  isInvalid={form.formState.errors.category !== undefined}
                  errorMessage={form.formState.errors.category?.message}
                />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            color="primary"
            className="font-abeezee px-2 text-center text-lg font-bold"
            isDisabled={createRoute.isPending}
            isLoading={createRoute.isPending}
          >
            Create Ticket
          </Button>
        </form>
      </Form>
    </div>
  );
}
