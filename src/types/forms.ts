import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(3, {
      message: "Email is required",
    })
    .max(255, {
      message: "Email is too long",
    }),
  password: z
    .string()
    .min(8, {
      message: "Password is required",
    })
    .max(255, {
      message: "Password is too long",
    }),
  role: z.enum(["ADMIN", "USER"]),
});

export const RegisterFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Name is required",
    })
    .max(255, {
      message: "Name is too long",
    }),
  email: z
    .string()
    .min(3, {
      message: "Email is required",
    })
    .max(255, {
      message: "Email is too long",
    }),
  password: z
    .string()
    .min(8, {
      message: "Password is required",
    })
    .max(255, {
      message: "Password is too long",
    }),
});

export const CreateTicketFormSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title is required",
    })
    .max(255, {
      message: "Title is too long",
    }),
  description: z
    .string()
    .min(3, {
      message: "Description is required",
    })
    .max(5000, {
      message: "Description is too long",
    }),
  category: z
    .string()
    .min(3, {
      message: "Category is required",
    })
    .max(255, {
      message: "Category is too long",
    }),
});
