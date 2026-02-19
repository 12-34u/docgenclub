from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from generator import generate_content, supported_doc_types

app = FastAPI(title="DocGen Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    docType: str
    formData: dict = {}


@app.get("/health")
async def health():
    return {"status": "ok", "supportedDocTypes": supported_doc_types}


@app.post("/generate")
async def generate(body: GenerateRequest):
    try:
        content = generate_content(body.docType, body.formData)
        return {"docType": body.docType, "content": content}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=False)
