
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    // Await the params object
    const { filename } = await params

    // Security check: simple validation to prevent directory traversal
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return new NextResponse("Invalid filename", { status: 400 })
    }

    const docsDir = path.join(process.cwd(), "docs")
    const filePath = path.join(docsDir, filename)

    try {
        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 })
        }

        const fileBuffer = fs.readFileSync(filePath)
        const stats = fs.statSync(filePath)

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Length": stats.size.toString(),
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("Error serving file:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
