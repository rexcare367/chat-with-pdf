import { connect } from "@/db/dbConfig";
import { createChat } from "@/db/helper";
import Chat from "@/db/models/chatModel";
// import { loadS3IntoPinecone } from "@/lib/pinecone";
// import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { utapi } from "uploadthing/server";

// /api/create-chat
connect();
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  console.log("userID from server", userId);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    const pdf = await utapi.getFileUrls(file_key);
    console.log("pdf from server==>", pdf);
    const file_url = pdf[0].url;
    // await loadS3IntoPinecone(file_key);
    const data = {
      file_key,
      file_name,
      file_url,
      userId,
    };
    const chat = await createChat(data);
    console.log("chat=>", chat);
    const chat_id = chat._id;

    return NextResponse.json(
      {
        chat_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}