// pages/api/generate.js
import { dbConnect } from '../../lib/dbConnect';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(400).json({ message: 'Only POST requests allowed' });
    }

    const client = await dbConnect();
    const collection = client.db(process.env.MONGODB_DATABASE_NAME).collection(process.env.MONGODB_COLLECTION_NAME);
    console.log('[process.env.MONGODB_DATABASE_NAME]', process.env.MONGODB_DATABASE_NAME);
    console.log('[process.env.MONGODB_COLLECTION_NAME]', process.env.MONGODB_COLLECTION_NAME);
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
        const filename = `${hash.digest('hex')}.png`;

        // Generate the QR code and save it as an image
        const qrCodeDataUrl = await QRCode.toDataURL(url);
        const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        await fs.writeFile(join(process.cwd(), 'public', 'images', filename), qrCodeBuffer);

        // Save the URL and filename in MongoDB
        const result = await collection.insertOne({ url, filename });
        return res.status(200).json({ _id: result.insertedId, url, filename });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred' });
    } finally {
        // 데이터베이스 작업을 완료한 후에는 연결을 닫아야 합니다.
        await client.close();
    }
}
