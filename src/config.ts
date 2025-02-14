export interface Config {
    inputDir: string;    // CSV 文件存放目录
    outputDir: string;   // XML 输出目录
    rootName: string;    // XML 根节点名称
    rowName: string;     // 每行数据的节点名称
    encoding: string;    // 文件编码
    maxConcurrency: number; // 最大并发数
}

export const config: Config = {
    inputDir: './csv_files',
    outputDir: './xml_files',
    rootName: 'Root',
    rowName: 'Record',
    encoding: 'utf-8',
    maxConcurrency: 4, // 默认最大并发数为 4
};
