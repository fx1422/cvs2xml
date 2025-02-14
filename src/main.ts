import fs from 'fs';
import path from 'path';
import { Transform } from 'stream';
import pLimit from 'p-limit';
import { config } from './config';
import { ensureOutputDir, getCsvFiles } from './utils';
import { createCsvParser } from './csvParser';
import { createXmlBuilder } from './xmlBuilder';
import { createProgressBar } from './progressBar';

// 获取当前时间戳，格式为 YYYY-MM-DD
function getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

async function processCsvFile(file: string, outputDir: string, fileIndex: number, totalFiles: number) {
    const csvPath = path.join(config.inputDir, file);
    const xmlPath = path.join(outputDir, `${path.basename(file, '.csv')}.xml`);

    // @ts-ignore
    const readStream = fs.createReadStream(csvPath, { encoding: config.encoding });
    // @ts-ignore
    const writeStream = fs.createWriteStream(xmlPath, { encoding: config.encoding });

    const csvParser = createCsvParser();
    const xmlBuilder = createXmlBuilder(config);

    let totalRows = 0;
    let processedRows = 0;

    // 创建进度条（初始总行数为 0，后续动态更新）
    const progressBar = createProgressBar(totalRows);

    // 动态计算总行数
    const countStream = new Transform({
        objectMode: true,
        transform(row: Record<string, string>, encoding, callback) {
            totalRows++;
            this.push(row); // 将数据传递到下一个流
            callback();
        },
    });

    // 更新进度条的函数
    const updateProgress = () => {
        processedRows++;
        progressBar.update(processedRows);
    };

    // 处理 CSV 数据并构建 XML
    const xmlTransform = new Transform({
        objectMode: true,
        transform(row: Record<string, string>, encoding, callback) {
            xmlBuilder.addRow(row);
            updateProgress();
            callback();
        },
    });

    // 开始流式处理
    readStream
        .pipe(csvParser)
        .pipe(countStream) // 先通过计数流计算总行数
        .pipe(xmlTransform) // 再通过 XML 转换流处理数据
        .on('finish', () => {
            // 生成 XML 字符串并写入文件
            const xmlString = xmlBuilder.getXmlString();
            writeStream.write(xmlString);
            writeStream.end();
            progressBar.stop();
            console.log(`[${fileIndex + 1}/${totalFiles}] 已生成：${xmlPath}`);
        })
        .on('error', (error) => {
            console.error(`处理文件 ${file} 时出错：`, error.message);
            progressBar.stop();
        });

    // 监听计数流的结束事件，更新进度条的总行数
    countStream.on('end', () => {
        progressBar.setTotal(totalRows);
    });
}

async function main() {
    // 确保输出目录存在
    ensureOutputDir(config.outputDir);

    // 创建以当前时间命名的子文件夹
    const timestamp = getCurrentTimestamp();
    const outputDir = path.join(config.outputDir, timestamp);
    ensureOutputDir(outputDir);

    // 获取所有 CSV 文件
    const csvFiles = getCsvFiles(config.inputDir);
    const totalFiles = csvFiles.length;

    if (totalFiles === 0) {
        console.log('未找到 CSV 文件');
        process.exit(0);
    }

    console.log(`开始处理 ${totalFiles} 个文件，输出目录：${outputDir}`);

    // 使用 p-limit 控制并发数
    const limit = pLimit(config.maxConcurrency);

    // 并发处理所有 CSV 文件
    const tasks = csvFiles.map((file, index) =>
        limit(() => processCsvFile(file, outputDir, index, totalFiles))
    );

    await Promise.all(tasks);

    console.log('所有文件处理完成！');
}

main();
