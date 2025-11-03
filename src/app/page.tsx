"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "better-auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setUser(session.data?.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        {user ? (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome Back!
              </h1>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">ID:</span> {user.id}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You are not signed in
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/signin"
                className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="block w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-center focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
