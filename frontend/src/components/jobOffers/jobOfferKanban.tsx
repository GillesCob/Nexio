import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import type { IJobOffer, JobOfferStatus } from "@/types/jobOffer";
import { useJobOffers, useUpdateJobOffer, JOB_OFFERS_QUERY_KEY } from "@/hooks/useJobOffers";
import { JobOfferCard } from "./jobOfferCard";

const COLUMNS: { status: JobOfferStatus; label: string }[] = [
  { status: "wishlist", label: "Wishlist" },
  { status: "applied", label: "Candidaté" },
  { status: "interview", label: "Entretien" },
  { status: "offer", label: "Offre reçue" },
  { status: "rejected", label: "Refusé" },
  { status: "accepted", label: "Accepté" },
];

interface IJobOfferKanbanProps {
  onOpenJobOffer: (jobOffer: IJobOffer) => void;
}

export function JobOfferKanban({ onOpenJobOffer }: IJobOfferKanbanProps) {
  const { data: serverJobOffers = [], isPending } = useJobOffers();
  const [localJobOffers, setLocalJobOffers] = useState<IJobOffer[]>([]);
  const updateJobOffer = useUpdateJobOffer();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalJobOffers(serverJobOffers);
  }, [JSON.stringify(serverJobOffers)]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as JobOfferStatus;
    const previousJobOffers = localJobOffers;

    setLocalJobOffers((prev) => prev.map((jo) => (jo.id === draggableId ? { ...jo, status: newStatus } : jo)));

    updateJobOffer.mutate(
      { id: draggableId, data: { status: newStatus } },
      {
        onError: () => {
          setLocalJobOffers(previousJobOffers);
          queryClient.invalidateQueries({ queryKey: JOB_OFFERS_QUERY_KEY });
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ status }) => (
          <div key={status} className="flex flex-col w-64 shrink-0">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-3" />
            <div className="rounded-lg bg-muted/40 min-h-[200px] p-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ status, label }) => (
          <div key={status} className="flex flex-col w-64 shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <span className="text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                {localJobOffers.filter((jo) => jo.status === status).length}
              </span>
            </div>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    flex flex-col gap-2 rounded-lg p-2 min-h-[200px] transition-colors
                    ${snapshot.isDraggingOver ? "bg-accent" : "bg-muted/40"}
                  `}
                >
                  {localJobOffers
                    .filter((jo) => jo.status === status)
                    .map((jobOffer, index) => (
                      <JobOfferCard key={jobOffer.id} jobOffer={jobOffer} index={index} onOpen={onOpenJobOffer} />
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

JobOfferKanban.displayName = "JobOfferKanban";
