import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getAllNotes, addNote, deleteNote, updateNote } from "../controllers/note.controller.js";

const router = Router()

// secured routes (login required)
router.route("/fetch-notes").get(verifyToken, getAllNotes)
router.route("/add-note").post(verifyToken, addNote)
router.route("/update-note/:noteId").put(verifyToken, updateNote)
router.route("/delete-note/:noteId").delete(verifyToken, deleteNote)

export default router