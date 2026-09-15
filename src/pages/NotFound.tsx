import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0B0D10",
        color: "#EDEEF0",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#14171B",
          border: "1px solid #22262B",
          borderRadius: 10,
          padding: "32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <AlertCircle className="h-10 w-10 text-[#E8A33D]" />

        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#EDEEF0",
            margin: 0,
            fontFamily: "IBM Plex Mono, monospace",
          }}
        >
          404
        </h1>

        <p
          style={{
            fontSize: 13,
            color: "#8C93A1",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          The requested path was not found in the workspace.
        </p>

        <Button
          onClick={handleGoHome}
          style={{
            backgroundColor: "#E8A33D",
            color: "#0B0D10",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 6,
            height: 36,
            padding: "0 16px",
            border: "none",
            marginTop: 8,
          }}
        >
          <Home className="w-4 h-4 mr-2" />
          Return home
        </Button>
      </div>
    </div>
  );
}
