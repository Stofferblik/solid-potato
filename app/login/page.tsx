"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPagina() {
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState("");
  const [laden, setLaden] = useState(false);
  const router = useRouter();

  async function handleInloggen(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFout("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: gebruikersnaam, password: wachtwoord }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setFout(data.error ?? "Inloggen mislukt");
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welkom bij PO App</CardTitle>
          <CardDescription>Log in om je Product Owner dashboard te openen</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInloggen} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gebruikersnaam">Gebruikersnaam</Label>
              <Input
                id="gebruikersnaam"
                type="text"
                value={gebruikersnaam}
                onChange={(e) => setGebruikersnaam(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wachtwoord">Wachtwoord</Label>
              <Input
                id="wachtwoord"
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {fout && <p className="text-sm text-destructive">{fout}</p>}
            <Button type="submit" className="w-full" disabled={laden}>
              {laden ? "Inloggen..." : "Inloggen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
