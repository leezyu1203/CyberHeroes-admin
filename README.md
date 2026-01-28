# CyberHeroes: A Gamified Cybersecurity Awareness App for Kids

> **Note:** This repository contains the **CyberHeroes Admin Panel** (Angular).  
> Looking for the Game Client? Check out the **[CyberHeroes](https://github.com/leezyu1203/CyberHeroes)**.

**CyberHeroes Admin Panel** is the administrative dashboard for the CyberHeroes system. It allows administrators to view and manage content. Built with **Angular**, it integrates with **Firebase Authentication**, **Firestore**, and **Cloud Functions**.


## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

* **Node.js (v18 or higher)**: [Download here](https://nodejs.org/)
* **Angular CLI**: Install via terminal: `npm install -g @angular/cli`
* **Firebase CLI**: Install via terminal: `npm install -g firebase-tools`
* **Git:** [Download here](https://git-scm.com/).

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    Open your terminal or command prompt and run:
    ```bash
    git clone https://github.com/leezyu1203/CyberHeroes-admin.git
    cd CyberHeroes-admin
    ```

2.  **Install Dependencies**
    Install the frontend dependencies:
    ```bash
    npm install
    ```
3.  **Firebase Configuration**
    You must connect this application to the same Firebase Project used by the CyberHeroes game.
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Select your project.
    * Go to **Project Settings > General > Your apps > Add app > Web**.
    * Copy the `firebaseConfig` object (apiKey, authDomain, projectId, etc.).
    * In your code editor:
        * Create a file `src/app/firebase.config.ts`
        * **Paste your new keys.**
          ```
          export const firebaseConfig = {
            apiKey: "YOUR_NEW_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID",
            measurementId: "YOUR_MEASUREMENT_ID"
          };
          ```
4. **Setting up Cloud Functions**

   The Admin Panel relies on Cloud Functions for sensitive operations (like creating new Admins).
   * Navigate to the functions folder:
      ```bash
      cd functions
      ```
   * Install backend dependencies:
      ```bash
      npm install
      ```
    * Login to Firebase CLI:
      ```bash
      firebase login
      ```
    * Set your project as active:
      ```bash
      firebase use --add
      # Select your current project alias
      ```
   * Deploy the functions to your live Firebase project (or use emulators):
     ```bash
      firebase deploy --only functions
      ```
     *Note: This uploads the backend logic to Google Cloud.*

## 🚀 Running the Game Locally

1.  Start the Angular development server in the root directory
    ```bash
    ng serve
    ```
2.  Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## 🛡 Security Rules & Indexes

If the application throws "Missing or insufficient permissions" or "Index required" errors in the console:
1. Check `firestore.rules` in the root directory and deploy them: `firebase deploy --only firestore:rules`.
2. Check the browser console for a direct link to create missing Firestore Indexes.

## 📄 License
This project is for academic purposes (Final Year Project).
