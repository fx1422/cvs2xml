// @ts-ignore
import cliProgress from 'cli-progress';

export function createProgressBar(total: number) {
    const progressBar = new cliProgress.SingleBar({
        format: '转换进度 |{bar}| {percentage}% | {value}/{total} 行',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
    });

    progressBar.start(total, 0);
    return progressBar;
}
