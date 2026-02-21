import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user?.twitchUserId) {
    redirect("/login");
  }

  return children;
}
