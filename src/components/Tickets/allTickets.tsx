"use client";
import type { AppRouterOutputTypes } from "@/server/api/root";
import { api, isTRPCClientError } from "@/trpc/react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  getKeyValue,
  useDisclosure,
  type SortDescriptor,
} from "@nextui-org/react";

import { format } from "date-fns";
import { Eye, MessageSquareQuoteIcon, PlusIcon } from "lucide-react";
import type { User } from "next-auth";
import {
  parseAsInteger,
  useQueryState,
  useQueryStates,
} from "next-usequerystate";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import ErrorComponent from "../errorComponent";
import CreateTicketForm from "./createTicketForm";
import ViewTicketForm from "./viewTicketForm";

type TicketTableCellData = AppRouterOutputTypes["ticket"]["tickets"][0];

const tableColumns: Array<{ key: string; label: string }> = [
  {
    key: "actions",
    label: "ACTIONS",
  },
  {
    key: "title",
    label: "TITLE",
  },
  {
    key: "priority",
    label: "PRIOIRTY",
  },
  {
    key: "status",
    label: "STATUS",
  },
  {
    key: "category",
    label: "CATEGORY",
  },
  {
    key: "createdAt",
    label: "TICKET CREATED AT",
  },
  {
    key: "updatedAt",
    label: "LAST UPDATE",
  },
];
export default function AllTickets({ user }: { user: User }) {
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalOpenChange,
  } = useDisclosure();
  const {
    data: allData,
    isPending,
    isError,
    error,
  } = api.ticket.tickets.useQuery(
    {
      userID: user.id,
    },
    {
      retry: 0,
    },
  );

  const [searchTitle, setSearchTitle] = useQueryState("title", {
    defaultValue: "",
  });
  const [searchStatus, setSearchStatus] = useState<Array<"OPEN" | "CLOSED">>([
    "OPEN",
    "CLOSED",
  ]);

  const [searchPriority, setSearchPriority] = useState<
    Array<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">
  >(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

  const [pageStates, setPageStates] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      rows: parseAsInteger.withDefault(10),
    },
    {
      history: "push",
    },
  );
  if (pageStates.page < 1) {
    void setPageStates({ page: 1, rows: pageStates.rows ?? 10 });
    pageStates.page = 1;
    pageStates.rows = pageStates.rows ?? 10;
  } else if (![10, 25, 50, 100].includes(pageStates.rows)) {
    void setPageStates({ page: pageStates.page ?? 1, rows: 10 });
    pageStates.rows = 10;
    pageStates.page = pageStates.page ?? 1;
  }

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "title",
    direction: "ascending",
  });

  const col = sortDescriptor.column as keyof TicketTableCellData;

  const filteredData = useMemo(() => {
    if (!allData) return [];
    if (searchTitle === "") {
      return allData.filter(
        (elem) =>
          searchStatus.includes(elem.status) &&
          searchPriority.includes(elem.priority),
      );
    } else {
      return allData.filter(
        (elem) =>
          elem.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
          searchStatus.includes(elem.status) &&
          searchPriority.includes(elem.priority),
      );
    }
  }, [allData, searchPriority, searchStatus, searchTitle]);

  const data = useMemo(() => {
    return sortDescriptor.direction === "ascending"
      ? filteredData?.sort((a, b) => {
          if (getKeyValue(a, col) > getKeyValue(b, col)) return 1;
          if (getKeyValue(a, col) < getKeyValue(b, col)) return -1;
          return 0;
        })
      : filteredData?.sort((a, b) => {
          if (getKeyValue(a, col) < getKeyValue(b, col)) return 1;
          if (getKeyValue(a, col) > getKeyValue(b, col)) return -1;
          return 0;
        });
  }, [col, filteredData, sortDescriptor.direction]);

  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.length / pageStates.rows);
  }, [data, pageStates.rows]);

  const renderTableCells = useCallback(
    (
      cellData: TicketTableCellData,
      columnKey: keyof TicketTableCellData | "actions",
    ) => {
      let cellValue: string | number | null;
      if (columnKey === "actions" || columnKey === "content") {
        cellValue = null;
      } else if (columnKey === "createdAt" || columnKey === "updatedAt") {
        cellValue = format(cellData[columnKey] ?? "", "dd/MM/yyyy hh:mm a");
      } else {
        cellValue = cellData[columnKey];
      }
      switch (columnKey) {
        case "status":
          const status = cellData.status;
          const color = status === "OPEN" ? "danger" : "success";
          return <Chip color={color}>{cellData.status}</Chip>;
        case "priority":
          const priority = cellData.priority;
          const priorityColor =
            priority === "LOW"
              ? "success"
              : priority === "MEDIUM"
                ? "primary"
                : priority === "HIGH"
                  ? "warning"
                  : "danger";
          return <Chip color={priorityColor}>{cellData.priority}</Chip>;
        case "content":
          return "Will be implemented soon";
        case "actions":
          return <ActionsComponent data={cellData} user={user} />;
        default:
          return cellValue;
      }
    },
    [user],
  );

  if (!allData && isError) {
    return <ErrorComponent message={error.message} />;
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-xl font-bold">My Tickets</h1>
      <div className="flex items-start justify-between gap-4">
        <div className="flex w-full flex-wrap gap-2">
          <Input
            type="text"
            variant="bordered"
            className="w-full max-w-[15rem]"
            label="Search by Name"
            aria-label="Search by Title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          <Select
            className="w-full max-w-[15rem]"
            label="Status"
            aria-label="Status"
            variant="bordered"
            selectionMode="multiple"
            selectedKeys={searchStatus}
            onChange={(e) => {
              void setSearchStatus(
                e.target.value.split(",") as Array<"OPEN" | "CLOSED">,
              );
            }}
          >
            <SelectItem key="OPEN" value="OPEN">
              OPEN
            </SelectItem>
            <SelectItem key="CLOSED" value="CLOSED">
              CLOSED
            </SelectItem>
          </Select>
          <Select
            className="w-full max-w-[15rem]"
            label="Priority"
            aria-label="Priority"
            variant="bordered"
            selectionMode="multiple"
            selectedKeys={searchPriority}
            onChange={(e) => {
              void setSearchPriority(
                e.target.value.split(",") as Array<
                  "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
                >,
              );
            }}
          >
            <SelectItem key="LOW" value="LOW">
              LOW
            </SelectItem>
            <SelectItem key="MEDIUM" value="MEDIUM">
              MEDIUM
            </SelectItem>
            <SelectItem key="HIGH" value="HIGH">
              HIGH
            </SelectItem>
            <SelectItem key="CRITICAL" value="CRITICAL">
              CRITICAL
            </SelectItem>
          </Select>
        </div>
        <div className="flex flex-col items-end gap-2 md:flex-row">
          <Select
            label="Rows"
            aria-label="Rows"
            className="max-w-[5rem]"
            classNames={{
              trigger: "h-14 w-[5rem]",
            }}
            variant="bordered"
            selectedKeys={[String(pageStates.rows)]}
            onChange={(e) => {
              if (
                !e.target.value ||
                parseInt(e.target.value) === pageStates.rows
              )
                return;
              void setPageStates({
                page: pageStates.page,
                rows: parseInt(e.target.value),
              });
            }}
          >
            <SelectItem key="10" value="10">
              10
            </SelectItem>
            <SelectItem key="25" value="25">
              25
            </SelectItem>
            <SelectItem key="50" value="50">
              50
            </SelectItem>
            <SelectItem key="100" value="100">
              100
            </SelectItem>
          </Select>
          {user.role === "USER" ? (
            <Button
              isIconOnly
              variant="bordered"
              size="lg"
              className="h-14 w-14"
              onPress={onCreateModalOpen}
            >
              <PlusIcon className="h-8 w-8" />
            </Button>
          ) : null}
        </div>
      </div>
      <Table
        className="w-[calc(100vw-35px)] overflow-x-auto"
        aria-label="All Tickets"
        removeWrapper
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={tableColumns}>
          {(column) => (
            <TableColumn
              allowsSorting={column.key !== "actions"}
              key={column.key}
              align="center"
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={data.slice(
            (pageStates.page - 1) * pageStates.rows,
            pageStates.page * pageStates.rows,
          )}
          isLoading={isPending}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell className="w-fit">
                  {renderTableCells(
                    item,
                    columnKey as keyof TicketTableCellData,
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {isPending ? (
        <Spinner size="lg" label="Loading Tickets..." />
      ) : (
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={pageStates.page}
            total={totalPages}
            onChange={(page) =>
              void setPageStates({
                page,
                rows: pageStates.rows,
              })
            }
          />
        </div>
      )}
      <Modal
        isOpen={isCreateModalOpen}
        onOpenChange={onCreateModalOpenChange}
        isDismissable={false}
        size="5xl"
        className="max-h-[85vh]"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-lg">
            Create Ticket
          </ModalHeader>
          <ModalBody className="overflow-y-auto">
            <CreateTicketForm />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function ActionsComponent({
  data,
  user,
}: {
  data: TicketTableCellData;
  user: User;
}) {
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onOpenChange: onEditModalOpenChange,
  } = useDisclosure();
  const apiUtils = api.useUtils();
  const replyRoute = api.ticket.reply.useMutation({
    onSuccess: async () => {
      await apiUtils.ticket.tickets.invalidate();
    },
  });
  const [reply, setReply] = useState("");
  return (
    <div className="flex gap-2">
      <Tooltip content="Edit" color="secondary">
        <Eye
          className="cursor-pointer text-lg text-default-400 active:opacity-50"
          onClick={onEditModalOpen}
        />
      </Tooltip>
      {data.status === "OPEN" ? (
        <Popover placement="bottom">
          <PopoverTrigger>
            <span>
              <Tooltip content="Reply" color="secondary">
                <MessageSquareQuoteIcon className="cursor-pointer text-lg text-default-400 active:opacity-50" />
              </Tooltip>
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <div className="w-72 px-1 py-2">
              <Textarea
                type="text"
                variant="bordered"
                label="Reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button
                variant="bordered"
                color="primary"
                className="mt-2 w-full"
                onPress={async () => {
                  try {
                    await replyRoute.mutateAsync({
                      ticketID: data.id,
                      description: reply,
                    });
                    toast.success("Replied successfully");
                  } catch (e) {
                    if (isTRPCClientError(e)) {
                      toast.error(e.message);
                    }
                  }
                  setReply("");
                }}
                isDisabled={reply === "" || replyRoute.isPending}
                isLoading={replyRoute.isPending}
              >
                Reply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={onEditModalOpenChange}
        isDismissable={false}
        size="5xl"
        className="max-h-[85vh]"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-xl">
            {data.title}
          </ModalHeader>
          <ModalBody className="overflow-y-auto">
            <ViewTicketForm data={data} user={user} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
