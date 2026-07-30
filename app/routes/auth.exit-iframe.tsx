import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Do NOT require authenticate.admin here, this route is just a redirect bounce
  return null;
};

export default function ExitIframe() {
  const [exitUrl, setExitUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const exitIframe = url.searchParams.get("exitIframe");
    if (exitIframe) {
      setExitUrl(exitIframe);
      try {
        window.top!.location.href = exitIframe;
      } catch (e) {
        console.error("Auto-redirect failed", e);
      }
    }
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Action Required</h2>
      <p>Redirecting to billing approval...</p>
      {exitUrl && (
        <a 
          href={exitUrl} 
          target="_top" 
          style={{ 
            display: "inline-block", 
            marginTop: "20px", 
            padding: "12px 24px", 
            background: "#0066FF", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "8px",
            fontWeight: "bold"
          }}
        >
          Click Here to Continue
        </a>
      )}
    </div>
  );
}
