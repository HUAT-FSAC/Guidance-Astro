import type { AstroIntegration } from 'astro';

let originalWarn: typeof console.warn | undefined;
let originalStdoutWrite: typeof process.stdout.write | undefined;
let originalStderrWrite: typeof process.stderr.write | undefined;

const knownWarnings = [
    'experimental-env-css',
    'unused-css',
    'prefetch',
    'duplicate-link',
];

function shouldFilterWarning(message: string): boolean {
    return knownWarnings.some(warning => message.includes(warning));
}

function restoreAll(): void {
    if (originalWarn) {
        console.warn = originalWarn;
        originalWarn = undefined;
    }
    if (originalStdoutWrite) {
        process.stdout.write = originalStdoutWrite;
        originalStdoutWrite = undefined;
    }
    if (originalStderrWrite) {
        process.stderr.write = originalStderrWrite;
        originalStderrWrite = undefined;
    }
}

function registerProcessRecovery(): void {
    const handler = () => restoreAll();
    process.once('SIGINT', handler);
    process.once('SIGTERM', handler);
    process.once('beforeExit', handler);
}

export default function filterKnownBuildWarnings(): AstroIntegration {
    return {
        name: 'filter-known-build-warnings',
        hooks: {
            'astro:config:done': () => {
                originalWarn = console.warn;
                originalStdoutWrite = process.stdout.write;
                originalStderrWrite = process.stderr.write;

                console.warn = (...args) => {
                    const message = args.map(arg => String(arg)).join(' ');
                    if (!shouldFilterWarning(message)) {
                        originalWarn?.(...args);
                    }
                };

                registerProcessRecovery();
            },
            'astro:build:done': () => {
                restoreAll();
            },
        },
    };
}