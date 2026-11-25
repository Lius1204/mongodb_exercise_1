'use strict';

require('dotenv').config();
const http = require('http');
const { logRequest } = require('./middleware');
const router = require('./router');
const dataSource = require('./mongo-data-source');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function bootstrap() {
    try {
        await dataSource.connect();

        const server = http.createServer((request, response) => {
            logRequest(request, response);
            router.handleRequest(request, response);
        });

        server.listen(PORT, () => {
            console.log(`✅ Server đang chạy tại ${BASE_URL}`);
            console.log('   Nhấn Ctrl + C để dừng server.');
        });

        const shutdown = async () => {
            console.log('\nĐang dừng server...');
            server.close(async () => {
                await dataSource.close();
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    } catch (error) {
        console.error('Không thể khởi động server:', error);
        process.exit(1);
    }
}

bootstrap();