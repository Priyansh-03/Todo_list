# Todo Summary Assistant

Developed by: **Priyansh Srivastava**
Email: [priyansh.sriv03@gmail.com](mailto:priyansh.sriv03@gmail.com)

_**Note: The server may take a few moments to load. Meanwhile, an interactive mini-game is available on-screen to keep you engaged.**_

🔴 **[Click here to view the Live Demo](https://9000-firebase-studio-1747917962006.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev/?monospaceUid=280597&embedded=0)**



Todo Summary Assistant is a Next.js application designed to help you manage your to-do list efficiently. It leverages Firebase Firestore for real-time data storage and Genkit with Google's Gemini API for intelligent task summarization, perfect for quick Slack updates.

## Features

*   **Task Management**: Create, Read, Update, and Delete (CRUD) to-do items.
*   **Real-time Updates**: Tasks sync across devices in real-time using Firebase Firestore.
*   **AI-Powered Summaries**: Generate concise summaries of pending tasks for Slack using Genkit and Gemini.
*   **Modern UI/UX**: Built with Next.js, React, ShadCN UI components, and Tailwind CSS for a responsive and aesthetically pleasing experience.
*   **Edit Functionality**: Modify existing tasks.
*   **Loading States & Toasts**: User-friendly feedback during operations.

## Tech Stack

*   **Frontend**:
    *   Next.js 15 (App Router, Server Components, Client Components)
    *   React 18
    *   TypeScript
    *   ShadCN UI
    *   Tailwind CSS
    *   `react-hook-form` (for form validation)
*   **Backend/AI**:
    *   Genkit (for defining AI flows)
    *   Google Gemini API (via `@genkit-ai/googleai`)
*   **Database**:
    *   Firebase Firestore (for real-time NoSQL database)
*   **Styling**:
    *   Tailwind CSS
    *   CSS Variables for theming (`src/app/globals.css`)

## Setup Instructions

Follow these steps to get the project running locally:

1.  **Clone the Repository**:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set Up Firebase**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
    *   **Enable Firestore**: In your Firebase project, navigate to "Firestore Database" and create a database. Choose a region.
    *   **Get Client-Side Configuration**:
        *   In your Firebase project settings (click the gear icon next to "Project Overview"), go to the "General" tab.
        *   Scroll down to "Your apps". If you don't have a web app, click the web icon (`</>`) to add one.
        *   Register the app and you'll find the Firebase SDK snippet with `firebaseConfig` object. You'll need these values for the `NEXT_PUBLIC_FIREBASE_...` variables in your `.env` file.
    *   **Get Server-Side (Admin) Configuration**:
        *   In your Firebase project settings, go to the "Service accounts" tab.
        *   Click "Generate new private key" and confirm. A JSON file will be downloaded. This file contains your `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PROJECT_ID` for backend services like Genkit.
    *   **Configure Firestore Security Rules**: For development, you can set open rules. Go to Firestore Database -> Rules and paste:
        ```firestore-rules
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              // Allow read and write access for development.
              // Secure these rules before deploying to production!
              allow read, write: if true;
            }
          }
        }
        ```
        Publish the rules. **Remember to secure these rules for production!**

4.  **Set Up Slack (for Summaries)**:
    *   Go to [Slack API](https://api.slack.com/apps) and create a new Slack app or use an existing one.
    *   Navigate to "Incoming Webhooks" under "Features".
    *   Activate Incoming Webhooks.
    *   Click "Add New Webhook to Workspace" and choose a channel.
    *   Copy the generated Webhook URL. This will be your `SLACK_WEBHOOK_URL`.

5.  **Environment Variables**:
    *   Create a new file named `.env` in the root of the project by copying the example file:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and fill in the values you obtained from Firebase and Slack (refer to `.env.example` for the full list of required variables).

6.  **Enable Google Cloud APIs (for Gemini)**:
    *   Ensure the Google Cloud project linked to your Firebase project has the "Vertex AI API" or "Generative Language API" enabled. You can do this from the [Google Cloud Console API Library](https://console.cloud.google.com/apis/library).
    *   For local development using Genkit with Google AI, it's often easiest to authenticate via the `gcloud` CLI:
        ```bash
        gcloud auth application-default login
        ```
        This allows Genkit to use your user credentials to access Google Cloud services. Alternatively, you can set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your Firebase service account JSON key.

7.  **Run the Development Servers**:
    *   Genkit Development Server (for testing flows, though current app calls flows directly):
        ```bash
        npm run genkit:dev
        # or for auto-reloading on changes
        # npm run genkit:watch
        ```
    *   Next.js Development Server:
        ```bash
        npm run dev
        ```
    *   Open your browser and navigate to `http://localhost:9002` (or the port specified in your `dev` script).

## Slack and LLM Setup Guidance

*   **Slack**:
    *   The `SLACK_WEBHOOK_URL` environment variable is used by the application (though the actual sending logic isn't implemented in the current AI flows, it's set up for future use). When the "Summarize & Send to Slack" button's functionality is extended to actually send the message, it would make an HTTP POST request to this URL with the AI-generated summary.

*   **LLM (Genkit & Gemini)**:
    *   This application uses **Genkit** as a framework to interact with Large Language Models. Genkit simplifies calling different models and structuring AI-powered features.
    *   The AI model used is **Google Gemini**, accessed via the `@genkit-ai/googleai` Genkit plugin.
    *   The configuration for Genkit and the chosen Gemini model (`googleai/gemini-2.0-flash`) is in `src/ai/genkit.ts`.
    *   The backend Firebase credentials (`FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID`) are essential for Genkit to authenticate with Google Cloud services, which host the Gemini API.
    *   AI prompts and logic are defined in "flows" within the `src/ai/flows/` directory (e.g., `summarize-pending-todos.ts`). These flows use Zod for input/output schema definition and validation.

## Design/Architecture Decisions

*   **Frontend (Next.js/React)**:
    *   **Next.js App Router**: Chosen for its modern features like nested layouts, server components, and improved routing.
    *   **Server Components by Default**: Leveraged to reduce client-side JavaScript and improve initial load times. Client Components (`"use client"`) are used where browser-specific APIs or interactivity (hooks like `useState`, `useEffect`) are necessary (e.g., `src/app/page.tsx`, form components).
    *   **ShadCN UI**: Provides a set of beautifully designed, accessible, and customizable UI components built on Radix UI and Tailwind CSS. This accelerates UI development while maintaining high quality.
    *   **Firebase Client SDK**: Used directly in client components for real-time Create, Read, Update, Delete (CRUD) operations with Firestore (`onSnapshot` for live updates).
    *   **`react-hook-form` & Zod**: For robust and type-safe form handling and validation.

*   **Backend (AI with Genkit)**:
    *   **`'use server';` directive**: Genkit flow files include this Next.js directive, allowing these server-side functions to be securely called from client components as if they were Server Actions.
    *   **Genkit Flows**: AI logic is encapsulated in Genkit flows (e.g., `summarizePendingTodos`). This promotes modularity and makes it easier to manage AI-related code.
    *   **Zod Schemas**: Inputs and outputs for Genkit flows are strongly typed and validated using Zod, enhancing reliability.

*   **State Management**:
    *   **React `useState` and `useEffect`**: Used for managing local component state and side effects (like fetching initial data or setting up listeners).
    *   **Firestore as Source of Truth**: To-do items are stored in Firestore. The `onSnapshot` listener ensures the UI reflects the current state of the database in real-time, simplifying client-side state management for the task list.

*   **Styling**:
    *   **Tailwind CSS**: A utility-first CSS framework for rapid UI development and easy customization.
    *   **CSS Variables**: Defined in `src/app/globals.css` for theming (background, foreground, primary, accent colors, etc.), making it easy to adjust the application's look and feel. ShadCN components are configured to use these variables.

*   **Firebase Integration**:
    *   Client-side Firebase (`src/lib/firebase.ts`) handles direct UI interactions with Firestore.
    *   Backend Firebase configuration in `.env` is intended for Genkit/admin operations.

## (Optional) Deployed URL

You can deploy this application to various platforms like:
*   [Vercel](https://vercel.com/) (Recommended for Next.js)
*   [Netlify](https://www.netlify.com/)
*   [Firebase Hosting](https://firebase.google.com/docs/hosting)

Deployment instructions are specific to the chosen platform. Ensure your environment variables are correctly set up in the deployment environment.
