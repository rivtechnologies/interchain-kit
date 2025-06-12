import { ConfigContext } from "@/starship/config";
import { useEffect, useState } from "react";

export const Starship = ({ children }: { children: React.ReactNode }) => {
  const [isStarshipReady, setStarshipReady] = useState(false);

  useEffect(() => {
    ConfigContext.init("x").then(() => {
      setStarshipReady(true);
    });
  }, []);

  if (!isStarshipReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};
