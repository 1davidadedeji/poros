import type { AppealState } from '@/lib/data/types'

const heading = 'text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase'

// What the letter is allowed to rest on: facts from the note and guideline criteria, each traceable.
export function DraftReview({ appeal }: { appeal: AppealState }) {
  const review = appeal.review

  if (!review) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-[#b4914e]/40 bg-[#b4914e]/10 p-4 text-sm">
        <p className={heading}>Template draft</p>
        <p>{appeal.fallbackReason ?? 'AI drafting is unavailable.'} Showing the fixed sample template instead.</p>
        <p className="text-muted-foreground">
          The template’s clinical paragraph is fixed sample wording. It doesn’t read the note, so check every
          clinical statement against the note before approving.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 text-sm">
      {review.warnings.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
          {review.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-2">
        <h4 className={heading}>Facts extracted from the note</h4>
        {review.extractedFacts.length ? (
          <ul className="list-disc space-y-1 pl-4">
            {review.extractedFacts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No clinically relevant facts were found in the note.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h4 className={heading}>Criteria supported by the note ({review.criteriaMet.length})</h4>
        {review.criteriaMet.length ? (
          <ul className="flex flex-col gap-2">
            {review.criteriaMet.map((item, index) => (
              <li key={index} className="rounded-md border border-border p-3">
                <p className="font-medium">{item.criterion}</p>
                <blockquote className="mt-1 border-l-2 border-primary pl-2 text-xs text-muted-foreground italic">
                  “{item.quote}”
                </blockquote>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">None. The letter should not claim any criterion is met.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h4 className={heading}>Not supported by the note ({review.criteriaNotSupported.length})</h4>
        {review.criteriaNotSupported.length ? (
          <ul className="flex flex-col gap-2">
            {review.criteriaNotSupported.map((item, index) => (
              <li key={index} className="rounded-md border border-[#b4914e]/40 bg-[#b4914e]/10 p-3">
                <p className="font-medium">{item.criterion}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Every guideline criterion has a supporting quote.</p>
        )}
      </section>
    </div>
  )
}
