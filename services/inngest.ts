import { Inngest } from "inngest";
import { env } from "@/lib/env";

export const inngest = new Inngest({
  id: "social-copilot",
  eventKey: env.INNGEST_EVENT_KEY,
});

export const publishPostFn = inngest.createFunction(
  {
    id: "publish-post",
    retries: 3,
    triggers: [{ event: "post/publish" }],
  },
  async ({ event, step }) => {
    const { postId } = event.data as { postId: string };

    await step.run("publish-post", async () => {
      const { publishPost } = await import("./publisher");
      await publishPost(postId);
    });
  }
);

export const schedulePostEvent = async (
  postId: string,
  scheduledFor: Date
) => {
  await inngest.send({
    name: "post/publish",
    data: { postId },
    ts: scheduledFor.getTime(),
  });
};
