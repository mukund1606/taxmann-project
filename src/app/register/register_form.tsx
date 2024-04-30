"use client";

// React
import { useState } from "react";

// Form Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

// Icons
import { Eye, EyeOff } from "lucide-react";

// Components
import { toast } from "sonner";

import { Form, FormField, FormItem } from "@/components/ui/form";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from "@nextui-org/react";

import { api, isTRPCClientError } from "@/trpc/react";
import { RegisterFormSchema } from "@/types/forms";
import Link from "next/link";

export default function RegisterForm() {
  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const registerRoute = api.register.useMutation();

  async function submitForm(values: z.infer<typeof RegisterFormSchema>) {
    try {
      await registerRoute.mutateAsync(values);
      toast.success("Success", {
        description: "User registered successfully",
      });
    } catch (e) {
      if (isTRPCClientError(e)) {
        toast.error(e.message);
      }
      form.reset();
    }
  }
  return (
    <>
      <div className="my-auto grid justify-center p-4 md:p-8">
        <Card className="min-w-[350px] max-w-[500px]">
          <CardHeader className="flex gap-3">
            <h1 className="w-full py-1 text-center font-fredoka text-2xl font-semibold">
              Register User
            </h1>
          </CardHeader>
          <Divider />
          <CardBody className="gap-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submitForm)}
                className="flex w-full flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        autoFocus
                        label="Name"
                        variant="bordered"
                        classNames={{
                          description: "text-sm",
                          label: "text-md font-bold",
                        }}
                        size="lg"
                        {...field}
                        isInvalid={form.formState.errors.name !== undefined}
                        errorMessage={form.formState.errors.name?.message}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        autoFocus
                        label="Email"
                        variant="bordered"
                        classNames={{
                          description: "text-sm",
                          label: "text-md font-bold",
                        }}
                        size="lg"
                        {...field}
                        isInvalid={form.formState.errors.email !== undefined}
                        errorMessage={form.formState.errors.email?.message}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        label="Password"
                        type={isPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        classNames={{
                          description: "text-sm",
                          label: "text-md font-bold",
                        }}
                        size="lg"
                        {...field}
                        isInvalid={form.formState.errors.password !== undefined}
                        errorMessage={form.formState.errors.password?.message}
                        endContent={
                          <Button
                            type="button"
                            variant="light"
                            onPress={() => {
                              setIsPasswordVisible(!isPasswordVisible);
                            }}
                            isIconOnly
                            tabIndex={-1}
                          >
                            {isPasswordVisible ? <EyeOff /> : <Eye />}
                          </Button>
                        }
                      />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  color="primary"
                  className="px-2 text-center font-abeezee text-lg font-bold"
                  isDisabled={registerRoute.isPending}
                  isLoading={registerRoute.isPending}
                >
                  Register
                </Button>
              </form>
            </Form>
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-primary">
                Login
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
