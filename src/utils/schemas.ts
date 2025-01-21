import { z } from "zod";

const validNameRegex = /^[a-zA-Z0-9\s]+$/;

export const addCalendarSchema = z
  .string()
  .length(20, { message: "ID must be exactly 20 characters long" })
  .regex(validNameRegex, {
    message: "ID must only contain alphanumeric characters",
  });

export const editCalendarSchema = z
  .string()
  .min(3, { message: "Calendar name must be at least 3 characters long" })
  .max(50, { message: "Calendar name must be no more than 50 characters long" })
  .regex(validNameRegex, {
    message:
      "Calendar name can only contain alphanumeric characters and spaces",
  });
