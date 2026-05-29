"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function UserNav() {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3">
      {user && (
        <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[160px]">
          {user.firstName ?? user.emailAddresses[0]?.emailAddress}
        </span>
      )}
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />
    </div>
  );
}
