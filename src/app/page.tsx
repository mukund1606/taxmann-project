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
      <h1 className="text-right text-xl">
        Hello, <strong>{session.user.name}!</strong>
      </h1>
      <AllTickets user={session.user} />
    </div>
  );
}
