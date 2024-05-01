"use client";
import { cn } from "@/lib/utils";
import type { AppRouterOutputTypes } from "@/server/api/root";
import { api, isTRPCClientError } from "@/trpc/react";
import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
export default function ViewTicket({
  user,
  data,
}: {
  user: User;
  data: AppRouterOutputTypes["ticket"]["tickets"][0];
}) {
  const apiUtils = api.useUtils();
  const replyRoute = api.ticket.reply.useMutation({
    onSuccess: async () => {
      await apiUtils.ticket.tickets.invalidate();
    },
  });
  const changeTicketStatusRoute = api.ticket.changeTicketStatus.useMutation({
    onSuccess: async () => {
      await apiUtils.ticket.tickets.invalidate();
    },
  });
  const changePriorityRoute = api.ticket.changePriority.useMutation({
    onSuccess: async () => {
      await apiUtils.ticket.tickets.invalidate();
    },
  });
  const [reply, setReply] = useState("");
  const [priority, setPriority] = useState(data.priority);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-between">
        <div>
          <p className="text-base font-bold">
            Status: <span className="font-normal">{data.status}</span>
          </p>
          <p className="text-base font-bold">
            Priority: <span className="font-normal">{data.priority}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Popover placement="left-start">
            <PopoverTrigger>
              <Button color="primary">Change Priority</Button>
            </PopoverTrigger>
            <PopoverContent className="flex min-w-[200px] flex-col gap-2 px-2 py-3">
              <p>Change Priority to </p>
              <Select
                label="Priority"
                variant="bordered"
                selectedKeys={[priority]}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const p = e.target.value as typeof priority;
                  setPriority(p);
                }}
              >
                <SelectItem key="LOW" value="LOW">
                  Low
                </SelectItem>
                <SelectItem key="MEDIUM" value="MEDIUM">
                  Medium
                </SelectItem>
                <SelectItem key="HIGH" value="HIGH">
                  High
                </SelectItem>
                <SelectItem key="CRITICAL" value="CRITICAL">
                  Critical
                </SelectItem>
              </Select>
              <Button
                color="primary"
                className="w-full"
                isLoading={changePriorityRoute.isPending}
                isDisabled={changePriorityRoute.isPending}
                onPress={async () => {
                  try {
                    await changePriorityRoute.mutateAsync({
                      ticketId: data.id,
                      priority,
                    });
                    toast.success("Priority changed successfully");
                  } catch (e) {
                    if (isTRPCClientError(e)) {
                      toast.error(e.message);
                    }
                  }
                }}
              >
                Change Priority
              </Button>
            </PopoverContent>
          </Popover>
          {user.role === "ADMIN" && (
            <Button
              color={data.status === "CLOSED" ? "primary" : "danger"}
              isLoading={changeTicketStatusRoute.isPending}
              isDisabled={changeTicketStatusRoute.isPending}
              onPress={async () => {
                try {
                  if (data.status === "CLOSED") {
                    await changeTicketStatusRoute.mutateAsync({
                      ticketId: data.id,
                      status: "OPEN",
                    });
                    toast.success("Ticket opened successfully");
                  } else {
                    await changeTicketStatusRoute.mutateAsync({
                      ticketId: data.id,
                      status: "CLOSED",
                    });
                    toast.success("Ticket closed successfully");
                  }
                } catch (e) {
                  if (isTRPCClientError(e)) {
                    toast.error(e.message);
                  }
                }
              }}
            >
              {data.status === "CLOSED" ? "Open Ticket" : "Close Ticket"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 py-2">
        <p className="text-lg font-bold">Chat</p>
        <div className="flex w-full flex-col gap-2 rounded-md border p-2">
          {data.content.map((content, index) => (
            <div
              className={cn(user.id === content.userID && "ml-auto text-right")}
              key={`${content.userID}-${index}`}
            >
              <div className="flex w-fit flex-col rounded-sm border">
                <p className="px-2 pt-1 text-base font-normal">
                  {content.description}
                </p>
                <Divider />
                <p className="px-2 pb-1 text-sm font-bold">
                  {user.role === "USER"
                    ? content.userID === user.id
                      ? "You"
                      : "Support"
                    : content.userID === user.id
                      ? "You"
                      : "User"}
                </p>
              </div>
            </div>
          ))}
        </div>
        {data.status === "OPEN" ? (
          <>
            <Textarea
              label="Reply"
              placeholder="Type your reply here"
              variant="bordered"
              color="default"
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <Button
              color="primary"
              size="md"
              isLoading={replyRoute.isPending}
              isDisabled={replyRoute.isPending || !reply}
              onPress={async () => {
                try {
                  await replyRoute.mutateAsync({
                    ticketID: data.id,
                    description: reply,
                  });
                  toast.success("Reply sent successfully");
                  setReply("");
                } catch (e) {
                  if (isTRPCClientError(e)) {
                    toast.error(e.message);
                  }
                }
              }}
            >
              Reply
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
