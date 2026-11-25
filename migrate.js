'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const dataSource = require('./mongo-data-source');

async function migrate() {
    try {
        let filePath = path.join(__dirname, 'database.json');
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, 'products.json');
        }

        if (!fs.existsSync(filePath)) {
            console.error('❌ Không tìm thấy file database.json hoặc products.json');
            process.exit(1);
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(rawData);

        const products = Array.isArray(parsed) ? parsed : (parsed.products || []);
        let maxId = 0;

        for (const p of products) {
            if (typeof p.id === 'number' && p.id > maxId) {
                maxId = p.id;
            }
        }

        if (!Array.isArray(parsed) && typeof parsed.currentId === 'number' && parsed.currentId > maxId) {
            maxId = parsed.currentId - 1;
        }

        const db = await dataSource.connect();
        const productsCol = db.collection('products');
        const countersCol = db.collection('counters');

        await productsCol.deleteMany({});
        await countersCol.deleteMany({});

        if (products.length > 0) {
            const clonedProducts = products.map((p) => ({ ...p }));
            await productsCol.insertMany(clonedProducts);
            console.log(`📦 Đã chuyển ${products.length} sản phẩm vào MongoDB.`);
        }

        await countersCol.updateOne(
            { _id: 'productId' },
            { $set: { seq: maxId } },
            { upsert: true }
        );
        console.log(`🔢 Đã khởi tạo counter productId với seq = ${maxId}`);

        console.log('✅ Migration thành công!');
    } catch (error) {
        console.error('❌ Lỗi trong quá trình migrate:', error);
    } finally {
        await dataSource.close();
        process.exit(0);
    }
}

migrate();