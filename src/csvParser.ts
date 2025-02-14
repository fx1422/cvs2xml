import { parse } from 'csv-parse';
import { Transform } from 'stream';

export function createCsvParser() {
    return parse({
        columns: true,        // 使用第一行作为字段名
        skip_empty_lines: true,
        trim: true,
    });
}
