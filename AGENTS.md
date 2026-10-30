# Agent guidelines

## Owner control

- Only the repository owner may authorize changes to this file. Agents must not edit, delete, rename, replace, or weaken it unless the owner explicitly requests that change in the current conversation.
- General requests to build, refactor, fix, or improve the app do not authorize changes to these guidelines.
- Do not bypass these rules through nested instruction files or generated configuration. If instructions conflict, explain the conflict to the owner.
- This file is an instruction policy, not a filesystem or GitHub access-control mechanism.

## Product scope

- Build from the owner's stated requirements. Do not infer the app's purpose from the repository name.
- Resolve missing product requirements before implementing behavior that depends on them.
- Keep work focused on the requested outcome. Record material assumptions and unresolved decisions.

## Development workflow

- Use the installed Compound Engineering skills appropriate to the task: brainstorm unclear requirements, plan substantial changes, implement, and review before shipping.
- Read each applicable skill before using it. Keep planning proportional to the work.
- Use the existing checkout. Cloud tasks are already isolated; do not create Git worktrees unless the owner requests one.
- Inspect repository status before editing and preserve existing user work.
- Prefer simple, maintainable implementations and supported dependencies. Never disable TLS, integrity verification, assertions, or checks to obtain a passing result.
- Keep secrets out of source, logs, artifacts, and chat. Document required variable names without values.

## Quality and verification

- Implement complete user flows with clear loading, empty, success, and error states where relevant.
- Make interfaces responsive and accessible, including semantic controls, keyboard access, labels, and visible focus.
- Validate user input and enforce authorization on the server whenever server-side data or actions exist.
- Run the relevant build, type checks, and meaningful tests. Verify the affected user flow directly when possible.
- Investigate failures; report repository defects and environment blockers separately. Never claim unrun checks passed.
- Update setup and usage documentation when the implementation introduces or changes development commands.

## Completion and external actions

- Report what changed, what was verified, and any remaining limitations.
- Do not push, publish, deploy, or send messages to others without authorization covering that action.
- Do not commit changes unless the owner requests it or explicitly invokes a workflow that includes committing.
