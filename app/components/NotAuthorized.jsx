import React from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function NotAuthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6 text-center">
          You do not have permission to access the admin dashboard.
          <br />
          Please contact your administrator if you believe this is a mistake.
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium shadow hover:from-pink-600 hover:to-rose-600 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
