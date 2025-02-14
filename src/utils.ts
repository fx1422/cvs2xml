// 确保输出目录存在
export function ensureOutputDir(outputDir: string): void {
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

// 获取所有 CSV 文件
export function getCsvFiles(inputDir: string): string[] {
    const fs = require('fs');
    const path = require('path');
    return fs.readdirSync(inputDir)
        .filter((file: string) => path.extname(file).toLowerCase() === '.csv');
}

// 处理特殊字符，确保 XML 有效性
export function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (char) => {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return char;
        }
    });
}
