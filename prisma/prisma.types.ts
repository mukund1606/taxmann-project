declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type TicketContent = Array<{
      userID: string;
      description: string;
    }>;
  }
}
