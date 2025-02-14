import { create } from 'xmlbuilder2';
import { Config } from './config';
import { escapeXml } from './utils';

export function createXmlBuilder(config: Config) {
    const root = create({ version: '1.0' }).ele(config.rootName);

    return {
        addRow(row: Record<string, string>) {
            const recordNode = root.ele(config.rowName);
            // @ts-ignore
            Object.entries(row).forEach(([key, value]) => {
                const safeKey = escapeXml(key.replace(/[^\w_-]/g, ''));
                const safeValue = escapeXml(value.toString());
                recordNode.ele(safeKey).txt(safeValue);
            });
        },
        getXmlString() {
            return root.end({ prettyPrint: true });
        },
    };
}
