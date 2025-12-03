/**
 * Test YAML content examples
 */

export const validRegistryYaml = `
version: 1
globals:
  api_version: v1
partials:
  enabled: true
  path: partials
groups:
  common:
    path: common
    enabled: true
    prompts:
      - api-design.yaml
      - code-review.yaml
  laravel:
    path: laravel
    enabled: true
    prompts:
      - laravel-api-implementation.yaml
`

export const invalidRegistryYaml = `
version: 1
groups:
  common:
    path: common
    enabled: true
    # Missing prompts field
`

export const validPromptYaml = `
id: test-prompt
title: Test Prompt
description: This is a test prompt
args:
  name:
    type: string
    description: The name parameter
    required: true
  count:
    type: number
    description: The count parameter
    required: false
    default: 10
template: |
  Hello {{name}}, count is {{count}}
`

export const invalidPromptYamlMissingId = `
title: Test Prompt
description: This is a test prompt
args:
  name:
    type: string
template: Hello {{name}}
`

export const invalidPromptYamlInvalidArgType = `
id: test-prompt
title: Test Prompt
description: This is a test prompt
args:
  name:
    type: invalid_type
    description: The name parameter
template: Hello {{name}}
`

export const invalidYamlSyntax = `
version: 1
groups:
  common:
    path: common
    enabled: true
    prompts: [
      - item1
      - item2
    # Missing closing bracket
`

export const promptYamlWithPartials = `
id: test-prompt-with-partials
title: Test Prompt with Partials
description: This is a test prompt with partials
args:
  name:
    type: string
    description: The name parameter
    required: true
template: |
  {{> role-expert}}
  Hello {{name}}
  {{> role-helper}}
`

export const promptYamlWithMissingPartial = `
id: test-prompt-missing-partial
title: Test Prompt Missing Partial
description: This prompt references a missing partial
args:
  name:
    type: string
template: |
  {{> role-expert}}
  {{> missing-partial}}
`

