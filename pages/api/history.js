// pages/api/history.js
import { dbConnect } from '../../lib/dbConnect';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(400).json({ message: 'Only GET requests allowed' });
    }

    const client = await dbConnect();
    const collection = client.db(process.env.MONGODB_DATABASE_NAME).collection(process.env.MONGODB_COLLECTION_NAME);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const qrHistory = await collection.find({})
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .sort({ _id: -1 })
            .toArray();
        const total = await collection.countDocuments();
        return res.status(200).json({ qrHistory, page, pageSize, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred' });
    } finally {
        await client.close();
    }
}
