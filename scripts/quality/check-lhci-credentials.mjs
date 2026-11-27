import { readFileSync, readdirSync } from 'node:fs';

// Lighthouse collect/assert do not need GitHub App credentials.
// This is a regression check, not a substitute for removing repository secrets.
const workflows = new URL('../../.github/workflows/', import.meta.url);
const files = readdirSync(workflows).filter((name) => /\.ya?ml$/i.test(name));
if (!files.includes('ci-cd.yml')) {
    throw new Error('Expected CI workflow is missing');
}

const matches = files.filter((name) =>
    /LHCI_GITHUB_APP_TOKEN/i.test(readFileSync(new URL(name, workflows), 'utf8')),
);
if (matches.length > 0) {
    throw new Error(`Unexpected Lighthouse App credential reference: ${matches.join(', ')}`);
}
console.log('Lighthouse App credential regression check passed');
