from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_frontend_pages_exist():
    expected = [
        "base.html",
        "index.html",
        "register.html",
        "patient_dashboard.html",
        "staff_dashboard.html",
        "admin_dashboard.html",
    ]
    for name in expected:
        assert (ROOT / "frontend" / "templates" / name).exists()


def test_frontend_js_contains_core_setup_functions():
    source = (ROOT / "frontend" / "static" / "js" / "main.js").read_text()
    for fn in ["setupRegisterPage", "setupPatientPage", "setupStaffPage", "setupAdminPage"]:
        assert f"function {fn}" in source


def test_backend_exposes_frontend_routes():
    source = (ROOT / "backend" / "app.py").read_text()
    for route in ['"/register"', '"/patient"', '"/staff"', '"/admin"']:
        assert route in source
