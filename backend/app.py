from __future__ import annotations

from functools import lru_cache

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .config import settings
from .schemas import (
    TxSigner,
    AccessDecisionRequest,
    AccessRequestCreate,
    AddRecordRequest,
    PatientRecordsRequest,
    ReadRecordRequest,
    RegisterActorRequest,
    VerifyActorRequest,
)
from .services import HealthcareService

app = FastAPI(title="Healthcare EHR dApp", version="0.1.0")
app.mount("/static", StaticFiles(directory=settings.base_dir / "frontend" / "static"), name="static")
templates = Jinja2Templates(directory=settings.base_dir / "frontend" / "templates")


@lru_cache(maxsize=1)
def get_service() -> HealthcareService:
    return HealthcareService()


def run_or_400(fn):
    try:
        return fn()
    except Exception as exc:  # keep demo API simple and explicit
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/patient", response_class=HTMLResponse)
def patient_page(request: Request):
    return templates.TemplateResponse("patient_dashboard.html", {"request": request})


@app.get("/staff", response_class=HTMLResponse)
def staff_page(request: Request):
    return templates.TemplateResponse("staff_dashboard.html", {"request": request})


@app.get("/admin", response_class=HTMLResponse)
def admin_page(request: Request):
    return templates.TemplateResponse("admin_dashboard.html", {"request": request})


@app.get("/health")
def health():
    return {"status": "ok", "chain_id": settings.chain_id, "chain_name": settings.chain_name}


@app.post("/api/utils/address-from-key")
def address_from_key(payload: TxSigner):
    return run_or_400(lambda: {"address": get_service().address_from_key(payload.private_key)})


@app.post("/api/actors/register")
def register_actor(payload: RegisterActorRequest):
    return run_or_400(lambda: get_service().register_actor(**payload.model_dump()))


@app.post("/api/actors/verify")
def verify_actor(payload: VerifyActorRequest):
    return run_or_400(lambda: get_service().verify_actor(**payload.model_dump()))


@app.get("/api/actors/{actor_address}")
def get_actor(actor_address: str):
    return run_or_400(lambda: get_service().get_actor(actor_address))


@app.post("/api/access/request")
def request_access(payload: AccessRequestCreate):
    return run_or_400(lambda: get_service().request_access(**payload.model_dump()))


@app.post("/api/access/decide")
def decide_access(payload: AccessDecisionRequest):
    return run_or_400(lambda: get_service().decide_access(**payload.model_dump()))


@app.post("/api/access/requests")
def patient_access_requests(payload: PatientRecordsRequest):
    return run_or_400(lambda: get_service().list_patient_requests(**payload.model_dump()))


@app.post("/api/records")
def add_record(payload: AddRecordRequest):
    return run_or_400(lambda: get_service().add_record(**payload.model_dump()))


@app.post("/api/records/list")
def list_patient_records(payload: PatientRecordsRequest):
    return run_or_400(lambda: get_service().list_patient_record_ids(**payload.model_dump()))


@app.post("/api/records/read")
def read_record(payload: ReadRecordRequest):
    return run_or_400(lambda: get_service().read_record(**payload.model_dump()))
