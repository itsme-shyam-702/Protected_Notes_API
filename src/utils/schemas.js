const { default: z } = require("zod");

const authSchema = z.object({
    email:   z.string().email('Must be a valid email'),
    password:z.string().min(8,'Password must be at least 8 characters')
})

const createNoteSchema = z.object({
    title:   z.string().min(1, "Title is required"),
    content: z.string().min(1,'Content is required'),
    tags:    z.array(z.string()).optional() // tags are optional
})

const updateNoteSchema = z.object({
    title:   z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    tags:    z.array(string()).optional()
})

module.exports = {authSchema,createNoteSchema,updateNoteSchema}