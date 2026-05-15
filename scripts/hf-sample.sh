#!/bin/bash
# Sample Hugging Face CLI workflow: List models and download one

# List the first 5 models tagged with 'audio'
hf model list --filter tags:audio --limit 5

# Download a specific model (replace with your model of interest)
hf model download facebook/wav2vec2-base-960h

# Show your current authentication status
hf whoami

# For more commands, see: https://huggingface.co/docs/huggingface_hub/guides/cli
