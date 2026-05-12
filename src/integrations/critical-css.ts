import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { AstroIntegration } from 'astro';

export default function criticalCssIntegration(): AstroIntegration {
    return {
        name: 'critical-css',
        hooks: {
            'astro:build:done': async ({ dir }: { dir: URL }) => {
                const criticalCssPath = path.resolve('src/styles/critical.css');
                const criticalCssResult = await readFile(criticalCssPath, 'utf8').catch(() => null);
                if (!criticalCssResult) {
                    return;
                }

                const dirPath = fileURLToPath(dir);
                const allFiles = await readdir(dirPath, { recursive: true }).catch(() => []);

                const htmlFiles = allFiles.filter(
                    (file): file is string => typeof file === 'string' && file.endsWith('.html')
                );

                const writePromises = htmlFiles.map(async (htmlFile) => {
                    const htmlPath = path.join(dirPath, htmlFile);
                    const htmlContent = await readFile(htmlPath, 'utf8').catch(() => null);
                    if (!htmlContent) {
                        return;
                    }

                    const modifiedHtml = htmlContent.replace(
                        '<head>',
                        `<head>\n<style>${criticalCssResult}</style>`
                    );

                    await writeFile(htmlPath, modifiedHtml).catch(() => {});
                });

                await Promise.all(writePromises);
            },
        },
    };
}