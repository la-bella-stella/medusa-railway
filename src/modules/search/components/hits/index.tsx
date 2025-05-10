import { clx } from "@medusajs/ui"
import React from "react"
import {
  UseHitsProps,
  useHits,
  useSearchBox,
} from "react-instantsearch-hooks-web"
import { ProductHit } from "../hit"
import ShowAll from "../show-all"

type HitsProps<THit> = React.ComponentProps<"div"> &
  UseHitsProps & {
    hitComponent: (props: { hit: THit }) => JSX.Element
    onClose?: () => void
  }

const Hits = ({
  hitComponent: Hit,
  className,
  onClose,
  ...props
}: HitsProps<ProductHit>) => {
  const { query } = useSearchBox()
  const { hits } = useHits(props)

  const hasHits = hits.length > 0 && query.trim().length > 0

  return (
    <div
      className={clx(
        "transition-opacity duration-300 ease-in-out",
        className,
        {
          "opacity-100": hasHits,
          "opacity-0": !hasHits,
        }
      )}
    >
      {hasHits ? (
        <>
          <ul
            className="divide-y divide-gray-100 border-t border-b border-gray-100"
            data-testid="search-results"
          >
            {hits.slice(0, 6).map((hit, index) => (
              <li key={index} className="p-3 sm:p-4 md:p-5">
                <Hit hit={hit as unknown as ProductHit} />
              </li>
            ))}
          </ul>
          <ShowAll onClose={onClose} />
        </>
      ) : null}
    </div>
  )
}

export default Hits