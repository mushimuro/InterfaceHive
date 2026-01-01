# Create Project with AI Plan

This document outlines the plan to implement AI-powered project creation using Google Gemini 2.5 Flash.

## Overview
We will enhance the "Create Project" workflow by integrating Google Gemini 2.5 Flash to automatically fill in project details.

There are two main scenarios:
1.  **Pre-existing Project**: User provides a GitHub URL. The AI analyzes the repository (likely the README) and fills in the form.
2.  **New Project**: User provides a rough "Project Idea". The AI expands this into a full project specification.

## Implementation Steps

### 1. Backend: AI Service (`backend/apps/ai_agent`)

We need a backend service to handle communication with Google Gemini.

-   **New App**: Create `backend/apps/ai_agent`.
-   **Dependencies**: Install `google-generativeai` (or appropriate client library).
-   **Configuration**: Add `GEMINI_API_KEY` to environment variables.
-   **Endpoints**:
    -   `POST /api/ai/generate-from-repo/`:
        -   Input: `{ "github_url": "..." }`
        -   Logic:
            1.  Fetch the README.md content from the GitHub repository.
            2.  Construct a prompt for Gemini 2.5 Flash to analyze the README.
            3.  Request structure: `title`, `description`, `what_it_does`, `inputs_dependencies`, `desired_outputs`, `difficulty`, `tags`.
        -   Output: JSON object with the above fields.
    -   `POST /api/ai/generate-from-idea/`:
        -   Input: `{ "idea": "..." }`
        -   Logic:
            1.  Construct a prompt for Gemini 2.5 Flash to expand the idea.
            2.  Request same JSON structure as above.
        -   Output: JSON object with the above fields.

### 2. Frontend: Update Project Form (`frontend/src/components/ProjectForm.tsx`)

We will modify the form to include the AI triggers.

-   **Project Idea Section (New)**:
    -   Add a new collapsible or prominent section at the top: "AI Assistant".
    -   **Tab 1: From Idea**: Textarea for "Project Idea" + Button "Auto-fill with AI".
    -   **Tab 2: From GitHub**: Input for "GitHub URL" + Button "Analyze & Auto-fill". (We can link this to the existing GitHub URL field, but having it in the AI section makes the action clear).
-   **Integration**:
    -   Create `useAIProjectGeneration` hook to handle API calls.
    -   On success, use `form.setValue()` to populate the main form fields.
    -   Show loading state while AI is processing.

### 3. User Interface

-   **Buttons**:
    -   "Auto-fill from GitHub" button next to the GitHub URL field (or in the top AI section).
    -   "Generate from Idea" button next to the Idea input.
-   **Visual Feedback**:
    -   Loading spinners during generation.
    -   Success toast notification when fields are filled.

## Detailed Data Mapping

The AI will be instructed to populate the following fields matching `ProjectSchema`:

| Form Field            | Source/Prompt Instruction |
|:--------------------- |:------------------------- |
| `title`               | Project name or derived title |
| `description`         | Summary of the project goals (min 50 chars) |
| `what_it_does`        | Functional description |
| `inputs_dependencies` | Technologies used/required (derived from repo or idea) |
| `desired_outputs`     | What is expected from contributors |
| `difficulty`          | Estimated difficulty (EASY/INTERMEDIATE/ADVANCED) |
| `tags`                | Tech stack keywords (max 5) |
| `github_url`          | (Passed through or generated if applicable) |

## Next Steps
1.  Setup Backend AI App.
2.  Implement `generate-from-repo` and `generate-from-idea` endpoints.
3.  Update Frontend `ProjectForm` with AI UI controls.
4.  Test with real GitHub repos and ideas.
