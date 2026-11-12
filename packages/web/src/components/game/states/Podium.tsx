"use client"

import { ManagerStatusDataMap } from "@rahoot/common/types/game/status"
import useScreenSize from "@rahoot/web/hooks/useScreenSize"
import {
  SFX_PODIUM_FIRST,
  SFX_PODIUM_SECOND,
  SFX_PODIUM_THREE,
  SFX_SNEAR_ROOL,
} from "@rahoot/web/utils/constants"
import clsx from "clsx"
import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"
import useSound from "use-sound"

type Props = {
  data: ManagerStatusDataMap["FINISHED"]
}

const Podium = ({ data: { subject, top } }: Props) => {
  const [apparition, setApparition] = useState(0)

  const { width, height } = useScreenSize()

  const [sfxtThree] = useSound(SFX_PODIUM_THREE, {
    volume: 0.2,
  })

  const [sfxSecond] = useSound(SFX_PODIUM_SECOND, {
    volume: 0.2,
  })

  const [sfxRool, { stop: sfxRoolStop }] = useSound(SFX_SNEAR_ROOL, {
    volume: 0.2,
  })

  const [sfxFirst] = useSound(SFX_PODIUM_FIRST, {
    volume: 0.2,
  })

  useEffect(() => {
    switch (apparition) {
      case 4:
        sfxRoolStop()
        sfxFirst()

        break

      case 3:
        sfxRool()

        break

      case 2:
        sfxSecond()

        break

      case 1:
        sfxtThree()

        break
    }
  }, [apparition, sfxFirst, sfxSecond, sfxtThree, sfxRool, sfxRoolStop])

  useEffect(() => {
    if (top.length < 3) {
      setApparition(4)

      return
    }

    const interval = setInterval(() => {
      if (apparition > 4) {
        clearInterval(interval)

        return
      }

      setApparition((value) => value + 1)
    }, 2000)

    // eslint-disable-next-line consistent-return
    return () => clearInterval(interval)
  }, [apparition, top.length])

  return (
    <>
      {apparition >= 4 && (
        <ReactConfetti
          width={width}
          height={height}
          className="h-full w-full"
        />
      )}

      {apparition >= 3 && top.length >= 3 && (
        <div className="pointer-events-none absolute min-h-dvh w-full overflow-hidden">
          <div className="spotlight"></div>
        </div>
      )}
      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-between">
        <h2 className="anim-show text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {subject}
        </h2>

        <div
          style={{ gridTemplateColumns: `repeat(${Math.max(top.length, 1)}, 1fr)` }}
          className={`grid w-full max-w-200 flex-1 items-end justify-center justify-self-end overflow-x-visible overflow-y-hidden px-2`}
        >
          {top.length === 0 && (
            <div className="col-span-full py-12 text-center text-2xl font-bold text-white">
              Permainan Selesai!
            </div>
          )}

          {top[1] && (
            <div
              className={clsx(
                "z-20 flex h-[50%] w-full translate-y-full flex-col items-center justify-center gap-2 md:gap-3 opacity-0 transition-all",
                { "translate-y-0! opacity-100": apparition >= 2 },
              )}
            >
              <p
                className={clsx(
                  "overflow-visible text-center text-lg md:text-3xl font-bold truncate max-w-[90%] text-white drop-shadow-lg",
                  {
                    "anim-balanced": apparition >= 4,
                  },
                )}
              >
                {top[1].username}
              </p>
              <div className="bg-primary flex h-full w-full flex-col items-center gap-2 md:gap-4 rounded-t-md pt-4 md:pt-6 text-center shadow-2xl">
                <p className="flex aspect-square h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full border-4 border-zinc-400 bg-zinc-500 text-xl md:text-3xl font-bold text-white drop-shadow-lg">
                  <span className="drop-shadow-md">2</span>
                </p>
                <p className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                  {top[1].points}
                </p>
              </div>
            </div>
          )}

          {top[0] && (
            <div
              className={clsx(
                "z-30 flex h-[65%] w-full translate-y-full flex-col items-center gap-2 md:gap-3 opacity-0 transition-all",
                {
                  "translate-y-0! opacity-100": apparition >= 3,
                },
                {
                  "min-w-48 md:min-w-64": top.length < 2,
                },
              )}
            >
              <p
                className={clsx(
                  "overflow-visible text-center text-xl md:text-4xl font-extrabold truncate max-w-[95%] text-white opacity-0 drop-shadow-lg",
                  { "anim-balanced opacity-100": apparition >= 4 },
                )}
              >
                👑 {top[0].username}
              </p>
              <div className="bg-primary flex h-full w-full flex-col items-center gap-2 md:gap-4 rounded-t-md pt-4 md:pt-6 text-center shadow-2xl ring-2 ring-amber-300">
                <p className="flex aspect-square h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-amber-300 bg-amber-400 text-2xl md:text-4xl font-black text-amber-950 drop-shadow-lg">
                  <span className="drop-shadow-md">1</span>
                </p>
                <p className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                  {top[0].points}
                </p>
              </div>
            </div>
          )}

          {top[2] && (
            <div
              className={clsx(
                "z-10 flex h-[40%] w-full translate-y-full flex-col items-center gap-2 md:gap-3 opacity-0 transition-all",
                {
                  "translate-y-0! opacity-100": apparition >= 1,
                },
              )}
            >
              <p
                className={clsx(
                  "overflow-visible text-center text-base md:text-2xl font-bold truncate max-w-[90%] text-white drop-shadow-lg",
                  {
                    "anim-balanced": apparition >= 4,
                  },
                )}
              >
                {top[2].username}
              </p>
              <div className="bg-primary flex h-full w-full flex-col items-center gap-2 md:gap-4 rounded-t-md pt-4 md:pt-6 text-center shadow-2xl">
                <p className="flex aspect-square h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border-4 border-amber-800 bg-amber-700 text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                  <span className="drop-shadow-md">3</span>
                </p>

                <p className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
                  {top[2].points}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Podium
