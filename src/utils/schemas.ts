import { z } from "zod";

export const addCalendarSchema = z
  .string()
  .length(20, { message: "ID must be exactly 20 characters long" })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "ID must only contain alphanumeric characters",
  });
