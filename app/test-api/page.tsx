"use client";

import { useState } from "react";

export default function TestAPIPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123",
          tiktokUsername: "@testuser",
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test API</h1>
        
        <button
          onClick={testRegister}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
        >
          {loading ? "Test en cours..." : "Tester l'inscription"}
        </button>

        {result && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold mb-2">Résultat:</h3>
            <pre className="text-sm overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 