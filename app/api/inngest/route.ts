import { serve } from "inngest/next";
import { inngest, publishPostFn } from "@/services/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishPostFn],
});
