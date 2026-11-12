"use client"

import { ManagerStatusDataMap } from "@rahoot/common/types/game/status"
import AnswerButton from "@rahoot/web/components/AnswerButton"
import {
  ANSWERS_COLORS,
  ANSWERS_ICONS,
  SFX_ANSWERS_MUSIC,
  SFX_RESULTS_SOUND,
} from "@rahoot/web/utils/constants"
import { calculatePercentages } from "@rahoot/web/utils/score"
import clsx from "clsx"
import { useEffect, useState } from "react"
import useSound from "use-sound"

type Props = {
  data: ManagerStatusDataMap["SHOW_RESPONSES"]
}

const Responses = ({
  data: { question, answers, responses, correct },
}: Props) => {
  const [percentages, setPercentages] = useState<Record<string, string>>({})
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  const [sfxResults] = useSound(SFX_RESULTS_SOUND, {
    volume: 0.2,
  })

  const [playMusic, { stop: stopMusic }] = useSound(SFX_ANSWERS_MUSIC, {
    volume: 0.2,
    onplay: () => {
      setIsMusicPlaying(true)
    },
    onend: () => {
      setIsMusicPlaying(false)
    },
  })

  useEffect(() => {
    stopMusic()
    sfxResults()

    setPercentages(calculatePercentages(responses))
  }, [responses, playMusic, stopMusic, sfxResults])

  useEffect(() => {
    if (!isMusicPlaying) {
      playMusic()
    }
  }, [isMusicPlaying, playMusic])

  useEffect(() => {
    stopMusic()
  }, [playMusic, stopMusic])

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        <div
          className={`mt-8 grid h-44 w-full max-w-3xl gap-4 px-2 items-end`}
          style={{ gridTemplateColumns: `repeat(${answers.length}, 1fr)` }}
        >
          {answers.map((_, key) => {
            const isCorrect = correct === key

            return (
              <div
                key={key}
                className={clsx(
                  "relative flex flex-col justify-end self-end overflow-hidden rounded-lg transition-all duration-500",
                  ANSWERS_COLORS[key],
                  isCorrect
                    ? "ring-4 ring-white shadow-[0_0_25px_rgba(34,197,94,0.95)] z-10 scale-[1.02]"
                    : "opacity-35 grayscale-[40%]",
                )}
                style={{ height: percentages[key] || "28px" }}
              >
                {isCorrect && (
                  <div className="absolute top-1 left-0 right-0 flex justify-center">
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white shadow-md border border-white">
                      ✓
                    </span>
                  </div>
                )}
                <span className="w-full bg-black/30 text-center text-lg font-black text-white drop-shadow-md py-1">
                  {responses[key] || 0}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mx-auto mb-4 grid w-full max-w-7xl grid-cols-2 gap-3 px-2 text-lg font-bold text-white md:text-xl">
          {answers.map((answer, key) => {
            const isCorrect = correct === key

            return (
              <AnswerButton
                key={key}
                className={clsx(
                  ANSWERS_COLORS[key],
                  "relative transition-all duration-300",
                  isCorrect
                    ? "opacity-100 scale-[1.02] ring-4 ring-white shadow-[0_0_25px_rgba(34,197,94,0.95)] z-20"
                    : "opacity-25 grayscale-[60%] scale-[0.98]",
                )}
                icon={ANSWERS_ICONS[key]}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="truncate">{answer}</span>
                  {isCorrect ? (
                    <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-sm font-black text-white shadow-lg border-2 border-white animate-pulse">
                      ✓ JAWABAN BENAR
                    </span>
                  ) : (
                    <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-xs font-bold text-white/80">
                      ✕
                    </span>
                  )}
                </div>
              </AnswerButton>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Responses
