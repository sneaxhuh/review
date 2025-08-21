import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

export const FirebaseSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Setup Required</h1>
          <p className="text-gray-600">Please configure Firebase to use this application</p>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-amber-700">
              <li>Create a new Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">console.firebase.google.com <ExternalLink className="w-3 h-3 ml-1" /></a></li>
              <li>Enable Authentication with Email/Password and Google providers</li>
              <li>Create a Firestore database</li>
              <li>Get your Firebase config from Project Settings</li>
              <li>Update the config in <code className="bg-amber-100 px-1 rounded">src/config/firebase.ts</code></li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Firebase Configuration Example:</h3>
            <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};`}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Security Rules for Firestore:</h3>
            <pre className="text-sm text-blue-700 bg-blue-100 p-3 rounded overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{document} {
      allow read, write: if request.auth != null;
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};