"use client";

// React
import { useState } from "react";

// Next Auth
import { signIn } from "next-auth/react";

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
  Select,
  SelectItem,
} from "@nextui-org/react";

import { LoginFormSchema } from "@/types/forms";
import Link from "next/link";

export default function LoginForm() {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "USER",
    },
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function submitForm(values: z.infer<typeof LoginFormSchema>) {
    try {
      await signIn("credentials", {
        ...values,
        callbackUrl: `/`,
      });
    } catch (error) {
      const e = error as { response: { data: string } };
      toast.error("Error", {
        description: e.response.data,
      });
      form.reset();
    }
  }
  return (
    <>
      <div className="my-auto grid justify-center p-4 md:p-8">
        <Card className="min-w-[350px] max-w-[500px]">
          <CardHeader className="flex gap-3">
            <h1 className="w-full py-1 text-center font-fredoka text-2xl font-semibold">
              Login
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
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        label="Role"
                        variant="bordered"
                        classNames={{
                          description: "text-sm",
                          label: "text-md font-bold",
                        }}
                        selectedKeys={[form.getValues("role")]}
                        size="lg"
                        {...field}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const val = e.target.value as "USER" | "ADMIN";
                          form.setValue("role", val);
                        }}
                        isInvalid={form.formState.errors.role !== undefined}
                        errorMessage={
                          form.formState.errors.role?.message
                            ? "Role is required"
                            : ""
                        }
                      >
                        <SelectItem value="USER" key="USER">
                          User
                        </SelectItem>
                        <SelectItem value="ADMIN" key="ADMIN">
                          Admin
                        </SelectItem>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  color="primary"
                  className="font-abeezee px-2 text-center text-lg font-bold"
                  isDisabled={form.formState.isSubmitting}
                  isLoading={form.formState.isSubmitting}
                >
                  Login
                </Button>
              </form>
            </Form>
            <p>
              {"Don't"} have an account?{" "}
              <Link href="/register" className="text-primary">
                Register
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
