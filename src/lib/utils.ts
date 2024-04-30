import { env } from "@/env";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const encryptWithKey = (text: string, key: string) => {
  const algorithm = "aes-256-ctr"; // Choosing AES with 256-bit key in Counter Mode
  const encryptionKey = Buffer.from(key, "base64");
  const iv = crypto.randomBytes(16); // Generate a random IV (Initialization Vector)

  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

  let encryptedText = cipher.update(text, "utf8", "base64");
  encryptedText += cipher.final("base64");

  // Combine the IV and encrypted data as a single string
  const combinedData = Buffer.concat([
    iv,
    Buffer.from(encryptedText, "base64"),
  ]);

  return combinedData.toString("base64");
};

const decryptWithKey = (text: string, key: string) => {
  const algorithm = "aes-256-ctr"; // Choosing AES with 256-bit key in Counter Mode
  const encryptionKey = Buffer.from(key, "base64");

  // Decode the combined data from base64
  const combinedData = Buffer.from(text, "base64");

  // Extract the IV from the combined data (first 16 bytes)
  const iv = Buffer.alloc(16);
  combinedData.copy(iv, 0, 0, 16);

  // Extract the encrypted text from the combined data
  const encryptedTextLength = combinedData.length - 16;
  const encryptedText = Buffer.alloc(encryptedTextLength);
  combinedData.copy(encryptedText, 0, 16, combinedData.length);

  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);

  let decryptedText = decipher.update(encryptedText, undefined, "utf8");
  decryptedText += decipher.final("utf8");

  return decryptedText;
};

export const encrypt = (text: string) =>
  encryptWithKey(text, env.ENCRYPTION_SECRET);
export const decrypt = (text: string) =>
  decryptWithKey(text, env.ENCRYPTION_SECRET);
