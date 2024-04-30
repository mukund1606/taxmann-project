import AllTickets from "@/components/Tickets/allTickets";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();
  const userID = session?.user.id;
  if (!userID) {
    redirect("/login");
  }
  return (
    <div className="p-4">
      <AllTickets user={session.user} />
    </div>
  );
}
