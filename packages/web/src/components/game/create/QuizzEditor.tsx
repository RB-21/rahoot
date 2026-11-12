"use client"

import { Quizz, QuizzWithId } from "@rahoot/common/types/game"
import Button from "@rahoot/web/components/Button"
import Input from "@rahoot/web/components/Input"
import Circle from "@rahoot/web/components/icons/Circle"
import Rhombus from "@rahoot/web/components/icons/Rhombus"
import Square from "@rahoot/web/components/icons/Square"
import Triangle from "@rahoot/web/components/icons/Triangle"
import clsx from "clsx"
import React, { useState } from "react"
import toast from "react-hot-toast"

type QuestionItem = {
  question: string
  image?: string
  video?: string
  audio?: string
  answers: string[]
  solution: number
  cooldown: number
  time: number
}

type Props = {
  initialData?: QuizzWithId | null
  onSave: (_data: { id?: string; quizz: Quizz }) => void
  onCancel: () => void
}

const ANSWER_THEMES = [
  {
    name: "Red",
    bg: "bg-red-500",
    border: "border-red-500",
    text: "text-red-500",
    hoverBg: "hover:bg-red-600",
    activeRing: "ring-red-500",
    icon: Triangle,
  },
  {
    name: "Blue",
    bg: "bg-blue-500",
    border: "border-blue-500",
    text: "text-blue-500",
    hoverBg: "hover:bg-blue-600",
    activeRing: "ring-blue-500",
    icon: Rhombus,
  },
  {
    name: "Yellow",
    bg: "bg-amber-400",
    border: "border-amber-400",
    text: "text-amber-500",
    hoverBg: "hover:bg-amber-500",
    activeRing: "ring-amber-400",
    icon: Circle,
  },
  {
    name: "Green",
    bg: "bg-emerald-500",
    border: "border-emerald-500",
    text: "text-emerald-500",
    hoverBg: "hover:bg-emerald-600",
    activeRing: "ring-emerald-500",
    icon: Square,
  },
]

const createDefaultQuestion = (): QuestionItem => ({
  question: "",
  answers: ["", "", "", ""],
  solution: 0,
  cooldown: 5,
  time: 15,
})

const QuizzEditor = ({ initialData, onSave, onCancel }: Props) => {
  const isEditing = Boolean(initialData)

  const [subject, setSubject] = useState(initialData?.subject || "")
  const [slugId, setSlugId] = useState(initialData?.id || "")
  const [questions, setQuestions] = useState<QuestionItem[]>(
    initialData?.questions && initialData.questions.length > 0
      ? JSON.parse(JSON.stringify(initialData.questions))
      : [createDefaultQuestion()],
  )
  const [activeIndex, setActiveIndex] = useState(0)

  const currentQ = questions[activeIndex] || questions[0]

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSubject(val)
    if (!isEditing && (!slugId || slugId === generateSlug(subject))) {
      setSlugId(generateSlug(val))
    }
  }

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

  const updateCurrentQuestion = (updates: Partial<QuestionItem>) => {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[activeIndex] = { ...copy[activeIndex], ...updates }
      return copy
    })
  }

  const handleAnswerTextChange = (answerIdx: number, val: string) => {
    const updatedAnswers = [...currentQ.answers]
    updatedAnswers[answerIdx] = val
    updateCurrentQuestion({ answers: updatedAnswers })
  }

  const handleSetSolution = (answerIdx: number) => {
    updateCurrentQuestion({ solution: answerIdx })
  }

  const handleAddAnswer = () => {
    if (currentQ.answers.length >= 4) return
    const updatedAnswers = [...currentQ.answers, ""]
    updateCurrentQuestion({ answers: updatedAnswers })
  }

  const handleRemoveAnswer = (answerIdx: number) => {
    if (currentQ.answers.length <= 2) {
      toast.error("Setiap pertanyaan minimal memiliki 2 pilihan jawaban")
      return
    }
    const updatedAnswers = currentQ.answers.filter((_, idx) => idx !== answerIdx)
    let newSolution = currentQ.solution
    if (newSolution === answerIdx) {
      newSolution = 0
    } else if (newSolution > answerIdx) {
      newSolution -= 1
    }
    updateCurrentQuestion({
      answers: updatedAnswers,
      solution: newSolution,
    })
  }

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createDefaultQuestion()])
    setActiveIndex(questions.length)
  }

  const handleDuplicateQuestion = () => {
    const duplicated = JSON.parse(JSON.stringify(currentQ))
    setQuestions((prev) => {
      const copy = [...prev]
      copy.splice(activeIndex + 1, 0, duplicated)
      return copy
    })
    setActiveIndex(activeIndex + 1)
    toast.success("Pertanyaan diduplikasi")
  }

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.error("Kuis minimal harus memiliki 1 pertanyaan")
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
    if (activeIndex >= idx && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  const validateAndSave = () => {
    if (!subject.trim()) {
      toast.error("Judul kuis tidak boleh kosong")
      return
    }

    const finalSlug = slugId.trim() || generateSlug(subject)
    if (!finalSlug) {
      toast.error("ID / slug kuis tidak valid")
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        setActiveIndex(i)
        toast.error(`Pertanyaan #${i + 1} belum memiliki teks soal`)
        return
      }

      if (q.answers.length < 2) {
        setActiveIndex(i)
        toast.error(`Pertanyaan #${i + 1} minimal harus memiliki 2 pilihan jawaban`)
        return
      }

      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j].trim()) {
          setActiveIndex(i)
          toast.error(`Pertanyaan #${i + 1}: Opsi jawaban ${j + 1} masih kosong`)
          return
        }
      }

      if (q.solution < 0 || q.solution >= q.answers.length) {
        setActiveIndex(i)
        toast.error(`Pertanyaan #${i + 1}: Kunci jawaban tidak valid`)
        return
      }
    }

    onSave({
      id: finalSlug,
      quizz: {
        subject: subject.trim(),
        questions: questions.map((q) => ({
          question: q.question.trim(),
          image: q.image?.trim() || undefined,
          video: q.video?.trim() || undefined,
          audio: q.audio?.trim() || undefined,
          answers: q.answers.map((a) => a.trim()),
          solution: q.solution,
          cooldown: Number(q.cooldown) || 5,
          time: Number(q.time) || 15,
        })),
      },
    })
  }

  return (
    <div className="z-10 flex w-full max-w-4xl flex-col gap-5 rounded-xl bg-white p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">
            {isEditing ? "✏️ Edit Kuis" : "✨ Buat Kuis Baru"}
          </h2>
          <p className="text-sm text-gray-500">
            Konfigurasi judul kuis, pertanyaan, durasi, dan pilihan jawaban.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Batal
          </button>
          <Button onClick={validateAndSave} className="px-5 py-2">
            💾 Simpan Kuis
          </Button>
        </div>
      </div>

      {/* Quiz Metadata (Title & ID) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Judul Kuis <span className="text-red-500">*</span>
          </label>
          <Input
            value={subject}
            onChange={handleSubjectChange}
            placeholder="Contoh: Kuis Biologi Umum"
            className="w-full text-base"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            ID File Kuis (Slug / Nama File) <span className="text-red-500">*</span>
          </label>
          <Input
            value={slugId}
            onChange={(e) => setSlugId(generateSlug(e.target.value))}
            placeholder="contoh: kuis-biologi"
            disabled={isEditing}
            className={clsx(
              "w-full text-base font-mono",
              isEditing && "bg-gray-100 cursor-not-allowed",
            )}
          />
          <span className="text-xs text-gray-400">
            Disimpan sebagai: config/quizz/{slugId || "nama-kuis"}.json
          </span>
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex flex-col gap-2 border-t border-b border-gray-200 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">
            Daftar Soal ({questions.length})
          </span>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:bg-amber-200"
          >
            + Tambah Soal
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const isComplete =
              q.question.trim().length > 0 &&
              q.answers.every((a) => a.trim().length > 0)

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={clsx(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition",
                  activeIndex === idx
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                <span>Q{idx + 1}</span>
                <span
                  className={clsx(
                    "h-2 w-2 rounded-full",
                    isComplete ? "bg-emerald-400" : "bg-red-400",
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Question Editor */}
      {currentQ && (
        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-800">
              Soal #{activeIndex + 1} dari {questions.length}
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDuplicateQuestion}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                📑 Duplikat
              </button>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(activeIndex)}
                  className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  🗑️ Hapus Soal
                </button>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Teks Pertanyaan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={currentQ.question}
              onChange={(e) => updateCurrentQuestion({ question: e.target.value })}
              placeholder="Ketik pertanyaan kuis di sini..."
              className="w-full rounded-md border border-gray-300 p-2.5 text-lg font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Time & Media Options */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                ⏱️ Waktu Jawab (detik)
              </label>
              <select
                value={currentQ.time}
                onChange={(e) => updateCurrentQuestion({ time: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm font-semibold outline-none focus:border-amber-500"
              >
                <option value={5}>5 detik</option>
                <option value={10}>10 detik</option>
                <option value={15}>15 detik</option>
                <option value={20}>20 detik</option>
                <option value={30}>30 detik</option>
                <option value={45}>45 detik</option>
                <option value={60}>60 detik</option>
                <option value={90}>90 detik</option>
                <option value={120}>120 detik</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                ⏳ Hitung Mundur / Cooldown (detik)
              </label>
              <select
                value={currentQ.cooldown}
                onChange={(e) =>
                  updateCurrentQuestion({ cooldown: Number(e.target.value) })
                }
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm font-semibold outline-none focus:border-amber-500"
              >
                <option value={3}>3 detik</option>
                <option value={5}>5 detik</option>
                <option value={10}>10 detik</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                🖼️ URL Gambar (Opsional)
              </label>
              <input
                type="text"
                value={currentQ.image || ""}
                onChange={(e) => updateCurrentQuestion({ image: e.target.value })}
                placeholder="https://... atau kosongkan"
                className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Image Preview if provided */}
          {currentQ.image && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2">
              <span className="text-xs font-semibold text-gray-500">Preview Gambar:</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentQ.image}
                alt="Preview"
                className="h-16 w-24 rounded object-cover border border-gray-200"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}

          {/* Answers Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">
                Pilihan Jawaban (Klik lingkaran centang untuk memilih jawaban yang benar):
              </span>
              {currentQ.answers.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddAnswer}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  + Tambah Pilihan Jawaban
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentQ.answers.map((answer, ansIdx) => {
                const theme = ANSWER_THEMES[ansIdx] || ANSWER_THEMES[0]
                const Icon = theme.icon
                const isCorrect = currentQ.solution === ansIdx

                return (
                  <div
                    key={ansIdx}
                    className={clsx(
                      "relative flex flex-col gap-2 rounded-xl border-2 p-3 transition shadow-sm bg-white",
                      isCorrect
                        ? "border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/20"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={clsx(
                            "flex h-7 w-7 items-center justify-center rounded-lg shadow-sm text-white",
                            theme.bg,
                          )}
                        >
                          <Icon className="h-4 w-4" fill="#FFF" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          Pilihan {ansIdx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetSolution(ansIdx)}
                          className={clsx(
                            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition",
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                          )}
                        >
                          <span>{isCorrect ? "✓ BENAR" : "Set Benar"}</span>
                        </button>

                        {currentQ.answers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAnswer(ansIdx)}
                            title="Hapus opsi jawaban ini"
                            className="text-gray-400 hover:text-red-500 text-sm font-bold px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <Input
                      value={answer}
                      onChange={(e) => handleAnswerTextChange(ansIdx, e.target.value)}
                      placeholder={`Jawaban ${ansIdx + 1}...`}
                      className="w-full text-base"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddQuestion}
          className="rounded-md border border-dashed border-gray-400 py-2.5 text-center text-sm font-bold text-gray-700 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-800 transition"
        >
          + Tambah Soal Lagi
        </button>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Batal
          </button>
          <Button onClick={validateAndSave} className="px-6 py-2">
            💾 Simpan Kuis
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuizzEditor
