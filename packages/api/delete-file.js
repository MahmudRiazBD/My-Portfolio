const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// This function needs to be deployed as a serverless function, e.g., on Vercel.
// It should be protected and only callable by authenticated admins/staff.

exports.handler = async (event, context) => {
    // Basic validation
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        const { storagePath } = JSON.parse(event.body);
        if (!storagePath) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing storagePath' }) };
        }
        
        // TODO: Add authentication check here to ensure only authorized users can delete files.
        // For example, verify a JWT from Supabase.
        
        const s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, // Replace with your R2 endpoint
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: storagePath,
        });

        await s3Client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File deleted successfully' }),
        };

    } catch (error) {
        console.error('Error deleting file from R2:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};