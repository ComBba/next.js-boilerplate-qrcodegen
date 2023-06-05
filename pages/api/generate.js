// pages/api/generate.js
import { dbConnect } from '../../lib/dbConnect';
import QRCode from 'qrcode';
import crypto from 'crypto';
const cloudinary = require('cloudinary').v2;

// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(400).json({ message: 'Only POST requests allowed' });
    }

    const client = await dbConnect();
    const collection = client.db(process.env.MONGODB_DATABASE_NAME).collection(process.env.MONGODB_COLLECTION_NAME);
    const { url } = req.body;

    try {
        // Check if the QR code image already exists
        const existingQRCode = await collection.findOne({ url });
        if (existingQRCode) {
            return res.status(200).json(existingQRCode);
        }

        // Create a hash of the URL
        const hash = crypto.createHash('sha256');
        hash.update(url);
        const filename = `${hash.digest('hex')}`;

        // Generate the QR code
        const qrCodeDataUrl = await QRCode.toDataURL(url);
        const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

        // Upload the image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { public_id: filename, resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(qrCodeBuffer);
        });

        // Save the URL and filename in MongoDB
        const dbResult = await collection.insertOne({ url, filename: result.secure_url });
        return res.status(200).json({ _id: dbResult.insertedId, url, filename: result.secure_url });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred' });
    } finally {
        // 데이터베이스 작업을 완료한 후에는 연결을 닫아야 합니다.
        await client.close();
    }
}