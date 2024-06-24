import { z } from "zod";

const notificationIDValidator = z.object({
  id: z.string().uuid(),
});

export const v = {
  notificationIDValidator
}