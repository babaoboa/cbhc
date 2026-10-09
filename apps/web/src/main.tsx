import "@repo/ui/tokens.css";
import { createRoot } from "react-dom/client";
import { Key } from "@repo/ui";

const App = () => {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '24px' }}>
      <Key>Join the club</Key>
      <Key variant="quiet" size="sm">Cancel</Key>
      <Key variant="on-mask" loading>Join the club</Key>
    </div>
  );
};


createRoot(document.getElementById("app")!).render(<App />);