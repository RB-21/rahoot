"use client"

import { Quizz, QuizzWithId } from "@rahoot/common/types/game"
import { STATUS } from "@rahoot/common/types/game/status"
import ManagerPassword from "@rahoot/web/components/game/create/ManagerPassword"
import QuizzEditor from "@rahoot/web/components/game/create/QuizzEditor"
import SelectQuizz from "@rahoot/web/components/game/create/SelectQuizz"
import { useEvent, useSocket } from "@rahoot/web/contexts/socketProvider"
import { useManagerStore } from "@rahoot/web/stores/manager"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

const Manager = () => {
  const { setGameId, setStatus } = useManagerStore()
  const router = useRouter()
  const { socket } = useSocket()

  const [isAuth, setIsAuth] = useState(false)
  const [quizzList, setQuizzList] = useState<QuizzWithId[]>([])
  const [mode, setMode] = useState<"select" | "create" | "edit">("select")
  const [editingQuizz, setEditingQuizz] = useState<QuizzWithId | null>(null)

  useEvent("manager:quizzList", (updatedList) => {
    setIsAuth(true)
    setQuizzList(updatedList)
  })

  useEvent("manager:quizzSaved", (savedQuizz) => {
    toast.success(`Kuis "${savedQuizz.subject}" berhasil disimpan!`)
    setMode("select")
    setEditingQuizz(null)
  })

  useEvent("manager:quizzDeleted", () => {
    toast.success("Kuis berhasil dihapus!")
  })

  useEvent("manager:errorMessage", (msg) => {
    toast.error(msg)
  })

  useEvent("manager:gameCreated", ({ gameId, inviteCode }) => {
    setGameId(gameId)
    setStatus(STATUS.SHOW_ROOM, { text: "Waiting for the players", inviteCode })
    router.push(`/game/manager/${gameId}`)
  })

  const handleAuth = (password: string) => {
    socket?.emit("manager:auth", password)
  }

  const handleCreateGame = (quizzId: string) => {
    socket?.emit("game:create", quizzId)
  }

  const handleStartCreateQuizz = () => {
    setEditingQuizz(null)
    setMode("create")
  }

  const handleStartEditQuizz = (quizz: QuizzWithId) => {
    setEditingQuizz(quizz)
    setMode("edit")
  }

  const handleDeleteQuizz = (quizzId: string) => {
    socket?.emit("manager:deleteQuizz", quizzId)
  }

  const handleSaveQuizz = (data: { id?: string; quizz: Quizz }) => {
    socket?.emit("manager:saveQuizz", data)
  }

  if (!isAuth) {
    return <ManagerPassword onSubmit={handleAuth} />
  }

  if (mode === "create") {
    return (
      <QuizzEditor
        onSave={handleSaveQuizz}
        onCancel={() => setMode("select")}
      />
    )
  }

  if (mode === "edit" && editingQuizz) {
    return (
      <QuizzEditor
        initialData={editingQuizz}
        onSave={handleSaveQuizz}
        onCancel={() => {
          setEditingQuizz(null)
          setMode("select")
        }}
      />
    )
  }

  return (
    <SelectQuizz
      quizzList={quizzList}
      onSelect={handleCreateGame}
      onCreate={handleStartCreateQuizz}
      onEdit={handleStartEditQuizz}
      onDelete={handleDeleteQuizz}
    />
  )
}

export default Manager
