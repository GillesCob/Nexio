import { Draggable } from '@hello-pangea/dnd'
import type { IJobOffer } from '@/types/jobOffer'

interface IJobOfferCardProps {
  jobOffer: IJobOffer
  index: number
  onOpen: (jobOffer: IJobOffer) => void
}

function getScoreBadgeClass(score: number): string {
  if (score > 7) return 'bg-green-500/15 text-green-600 border-green-500/30'
  if (score >= 4) return 'bg-orange-500/15 text-orange-600 border-orange-500/30'
  return 'bg-red-500/15 text-red-600 border-red-500/30'
}

export function JobOfferCard({ jobOffer, index, onOpen }: IJobOfferCardProps) {
  return (
    <Draggable draggableId={jobOffer.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(jobOffer)}
          className={`
            cursor-pointer rounded-md border bg-card p-3 shadow-sm
            hover:shadow-md transition-shadow select-none
            ${snapshot.isDragging ? 'opacity-80 rotate-1 shadow-lg' : ''}
          `}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-card-foreground truncate flex-1 min-w-0">{jobOffer.title}</p>
            {jobOffer.score != null && (
              <span className={`shrink-0 text-xs font-semibold border rounded px-1.5 py-0.5 ${getScoreBadgeClass(jobOffer.score)}`}>
                {jobOffer.score}/10
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{jobOffer.company}</p>

          <div className="flex flex-wrap gap-1 mt-2">
            {jobOffer.remote && (
              <span className="inline-block text-xs border border-border rounded px-1.5 py-0.5 text-foreground">
                Remote
              </span>
            )}
            {jobOffer.location && (
              <span className="inline-block text-xs text-muted-foreground truncate max-w-[120px]">
                {jobOffer.location}
              </span>
            )}
          </div>

          {jobOffer.stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {jobOffer.stack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="inline-block text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5"
                >
                  {tech}
                </span>
              ))}
              {jobOffer.stack.length > 3 && (
                <span className="inline-block text-xs text-muted-foreground">
                  +{jobOffer.stack.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

JobOfferCard.displayName = 'JobOfferCard'
