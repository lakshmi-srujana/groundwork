from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import verify, blockchain, tasks

app = FastAPI(
    title="Groundwork Backend",
    description="AI verification, IPFS upload, and blockchain write service for Groundwork",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify.router)
app.include_router(blockchain.router)
app.include_router(tasks.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "groundwork-backend"}
