# Hugging Face CLI Quickstart

The Hugging Face CLI (`hf`) connects your agents and workflows to the Hugging Face ecosystem. Use it to search models, manage datasets, launch Spaces, and run jobs from any coding agent or script.

---

## Installation

Follow the [official installation guide](https://huggingface.co/docs/huggingface_hub/guides/cli#getting-started) to install or update the CLI:

```bash
pip install -U huggingface_hub[cli]
```

---

## Add the CLI Skill for Agents

Skills give your agent the context it needs to use the CLI effectively. Install the CLI Skill to keep your agent up to date with all `hf` commands.

- **Global install (recommended):**
  ```bash
  hf skills add --global
  ```
- **Project-local install:**
  ```bash
  hf skills add
  ```
- For Claude Code, add `--claude` as needed.

> The Skill is generated from your locally installed CLI version, so it's always up to date.

---

## Example Usage

### List all available models

```bash
hf model list
```

### Launch a Space

```bash
hf space create my-username/my-space
```

---

## Resources

- [CLI Reference](https://huggingface.co/docs/huggingface_hub/guides/cli)
- [Token Settings](https://huggingface.co/settings/tokens)
- [Jobs Documentation](https://huggingface.co/docs/huggingface_hub/guides/cli#hf-jobs)
