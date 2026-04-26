import { getAuthenticatedUser } from "@/lib/auth";
import { getClients, getAllTasks } from "@/lib/data";
import { ClientsView } from "./ClientsView";

export default async function ClientsPage() {
  const auth = await getAuthenticatedUser();
  const firmId = auth?.firmId;

  const [clients, tasks] = await Promise.all([
    getClients(firmId),
    getAllTasks(firmId)
  ]);

  return <ClientsView initialClients={clients} initialTasks={tasks} firmId={firmId} />;
}
