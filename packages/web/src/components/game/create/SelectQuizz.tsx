"use client"

import { QuizzWithId } from "@rahoot/common/types/game"
import Button from "@rahoot/web/components/Button"
import clsx from "clsx"
import React, { useState } from "react"
import toast from "react-hot-toast"

type Props = {
  quizzList: QuizzWithId[]
  onSelect: (_id: string) => void
  onCreate: () => void
  onEdit: (_quizz: QuizzWithId) => void
  onDelete: (_id: string) => void
}

const SelectQuizz = ({
  quizzList,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: Props) => {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected(selected === id ? null : id)
  }

  const handleSubmit = () => {
    if (!selected) {
      toast.error("Silakan pilih salah satu kuis terlebih dahulu")
      return
    }

    onSelect(selected)
  }

  const handleDeleteClick = (e: React.MouseEvent, quizz: QuizzWithId) => {
    e.stopPropagation()
    if (confirm(`Yakin ingin menghapus kuis "${quizz.subject}"?`)) {
      onDelete(quizz.id)
      if (selected === quizz.id) {
        setSelected(null)
      }
    }
  }

  const handleEditClick = (e: React.MouseEvent, quizz: QuizzWithId) => {
    e.stopPropagation()
    onEdit(quizz)
  }

  return (
    <div className="z-10 flex w-full max-w-lg flex-col gap-5 rounded-xl bg-white p-6 shadow-2xl">
      {/* Header with Title and Create Button */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Daftar Kuis</h1>
          <p className="text-xs text-gray-500">
            Pilih kuis untuk mulai bermain, atau kelola konfigurasi kuis.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition hover:bg-primary/20"
        >
          <span>+ Buat Kuis Baru</span>
        </button>
      </div>

      {/* Quizzes List */}
      <div className="flex max-h-[50vh] flex-col gap-2.5 overflow-y-auto pr-1">
        {quizzList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-4xl mb-2">📋</span>
            <p className="text-base font-bold text-gray-700">Belum ada kuis</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Klik tombol &quot;Buat Kuis Baru&quot; di atas untuk membuat kuis pertama Anda!
            </p>
            <button
              type="button"
              onClick={onCreate}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition"
            >
              + Buat Kuis Sekarang
            </button>
          </div>
        ) : (
          quizzList.map((quizz) => {
            const isSelected = selected === quizz.id
            const questionCount = quizz.questions?.length || 0

            return (
              <div
                key={quizz.id}
                onClick={() => handleSelect(quizz.id)}
                className={clsx(
                  "group relative flex cursor-pointer items-center justify-between rounded-xl border-2 p-3.5 transition",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50",
                )}
              >
                {/* Left: Radio indicator + Details */}
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-300 bg-white group-hover:border-gray-400",
                    )}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-base font-bold text-gray-800">
                      {quizz.subject}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-amber-600">
                        {questionCount} Soal
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-gray-400">
                        {quizz.id}.json
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Edit, Delete) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleEditClick(e, quizz)}
                    title="Edit Kuis"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, quizz)}
                    title="Hapus Kuis"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer: Start Button */}
      {quizzList.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
          <Button
            onClick={handleSubmit}
            disabled={!selected}
            className={clsx(
              "w-full py-2.5",
              !selected && "opacity-50 cursor-not-allowed",
            )}
          >
            🚀 Mulai Permainan
          </Button>

          <button
            type="button"
            onClick={onCreate}
            className="w-full py-2 text-center text-xs font-bold text-gray-600 hover:text-primary transition"
          >
            + Buat Kuis Baru Lainnya
          </button>
        </div>
      )}
    </div>
  )
}

export default SelectQuizz
