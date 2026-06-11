import ImageKit from "imagekit";
import { env } from "@/lib/env";

const globalForImageKit = globalThis as unknown as {
  imagekit: ImageKit | undefined;
};

export const imagekit =
  globalForImageKit.imagekit ??
  new ImageKit({
    publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });

if (process.env.NODE_ENV !== "production") {
  globalForImageKit.imagekit = imagekit;
}
