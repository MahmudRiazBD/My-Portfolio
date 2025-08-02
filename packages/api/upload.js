// packages/api/upload.js

// This is a Vercel Serverless Function
// It needs to be placed in the /api directory at the root of the project for Vercel deployment.
// In our monorepo, we'll configure vercel.json to find it in `packages/api`.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Load credentials from environment variables
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLAUDFLARE_BUCKET_NAME;
const publicR2Url = process.env.R2_PUBLIC_URL;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicR2Url) {
    // This will cause the function to fail safely if secrets are not set
    throw new Error("Cloudflare R2 environment variables are not fully configured.");
}


// Initialize the S3 client for Cloudflare R2
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default async function handler(req, res) {
  // In a real app, you'd want to add authentication here to ensure
  // only logged-in users can get an upload URL.
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName and fileType are required." });
    }

    // Generate a unique file key to avoid name collisions
    const uniqueKey = `${crypto.randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      ContentType: fileType,
    });

    // Generate the pre-signed URL for the client to upload to
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL expires in 60 seconds

    // This is the URL we will store in our database
    const publicUrl = `${publicR2Url}/${uniqueKey}`;
    
    res.status(200).json({ uploadUrl, publicUrl });

  } catch (error) {
    console.error("Error creating pre-signed URL:", error);
    res.status(500).json({ error: 'Failed to create upload URL.' });
  }
}
