import { encrypt } from "@/lib/utils";
import { publicProcedure } from "@/server/api/trpc";
import { RegisterFormSchema } from "@/types/forms";

export const register = publicProcedure
  .input(RegisterFormSchema)
  .mutation(async ({ input, ctx }) => {
    const password = encrypt(input.password);
    const user = await ctx.db.user.create({
      data: {
        email: input.email,
        name: input.name,
        password,
      },
    });
    return user;
  });
