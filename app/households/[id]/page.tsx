"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import UserProfile from "./UserProfile";
import { Household } from "../../lib/types";
import { useHouseholdsStore } from "../../store/householdsStore";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { fetchOne } = useHouseholdsStore();
  const [household, setHousehold] = useState<Household | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setHousehold(undefined);
    fetchOne(id).then((result) => {
      if (!cancelled) setHousehold(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id, fetchOne]);

  if (household === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 size={28} className="animate-spin text-blue-500 mb-3" />
        <p className="text-gray-500 text-sm">Loading household profile…</p>
      </div>
    );
  }

  if (household === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900">Household Not Found</h1>
        <p className="text-gray-500 mt-2">No record exists for ID: <span className="font-mono">{id}</span></p>
      </div>
    );
  }

  return <UserProfile household={household} />;
}
