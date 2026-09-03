# Docs Center English Slug Translation Design

**Date:** 2026-03-21

## Goal

Translate the `docs-center` section into English with English-native slugs under `/en/docs-center/`, while preserving the existing Chinese routes under `/docs-center/`.

## Scope

This round covers the 7 `docs-center` pages:

- `docs-center/index`
- `docs-center/入门/index`
- `docs-center/流程与模板/index`
- `docs-center/资源中心/index`
- `docs-center/体验与反馈/index`
- `docs-center/运营与协作/index`
- `docs-center/运营与协作/项目进度看板`

## Route Strategy

Chinese stays unchanged.

English gets independent, translated slugs:

- `/en/docs-center/`
- `/en/docs-center/onboarding/`
- `/en/docs-center/processes-and-templates/`
- `/en/docs-center/resource-hub/`
- `/en/docs-center/feedback-and-experience/`
- `/en/docs-center/operations-and-collaboration/`
- `/en/docs-center/operations-and-collaboration/project-progress-board/`

Legacy English URLs using Chinese slugs should redirect to the new English slugs.

## Content Strategy

Use a mixed translation style:

- Keep document structure close to the Chinese source.
- Rewrite wording for natural English instead of literal translation.
- Normalize section naming and terminology across all 7 pages.

## Navigation Strategy

Update English-only navigation surfaces to the new slugs:

- English docs-center landing page cards
- English sidebar labels and links
- English cross-links inside translated docs-center pages

Chinese navigation stays untouched.

## Verification

- Add browser coverage for the new English docs-center slug routes.
- Verify the old English Chinese-slug path redirects to the new English slug.
- Run the focused Playwright suite and a production build.
