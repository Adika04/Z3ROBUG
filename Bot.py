"""
Telegram Bot — JKR Road Hazard Reporting System
UTP Codefest 2026

Collects road damage reports from citizens via Telegram:
  /report → photo (with caption) → GPS location → road type
Analyses damage severity with Google Gemini AI, inserts the report
into the shared Supabase `reports` table so it appears on the
Vercel-hosted JKR Municipal Dashboard in real time.
"""

import os
import json
import random
import base64
from datetime import timezone

from dotenv import load_dotenv
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)
from supabase import create_client

# ── Load shared .env from this directory or its parent ─────────────────────
_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(_dir), ".env"))


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


BOT_TOKEN = require_env("TELEGRAM_BOT_TOKEN")
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
if not SUPABASE_URL:
    raise RuntimeError("Missing required environment variable: SUPABASE_URL")
SUPABASE_KEY = require_env("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Optional Gemini AI setup ────────────────────────────────────────────────
_gemini_model = None
try:
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(
            "gemini-3.5-flash",
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.1,
            },
        )
        print("✅ Gemini AI model loaded")
except ImportError:
    print("⚠️  google-generativeai not installed — AI analysis disabled (pip install google-generativeai)")

PHOTO, LOCATION, ROAD_TYPE = range(3)


# ── Gemini AI Analysis ──────────────────────────────────────────────────────

async def analyze_with_gemini(photo_bytes: bytes) -> dict:
    """Analyse road damage photo with Gemini and return structured assessment."""
    if _gemini_model is None:
        return {
            "severity_score": 3,
            "issue_type": "Pothole",
            "ai_justification": "AI analysis unavailable — Gemini API key not configured. Manual inspection required.",
        }

    try:
        response = await _gemini_model.generate_content_async(
            [
                (
                    "You are a Malaysian JKR road inspection AI. "
                    "Analyze this road damage image and return ONLY valid JSON with exactly these keys:\n"
                    '{"severity_score": <integer 1-5>, '
                    '"issue_type": "Pothole" | "Cracked Road" | "Surface Erosion" | "Road Subsidence" | "Debris/Obstruction", '
                    '"ai_justification": "<1-2 sentence technical explanation for JKR officers>"}\n'
                    "Rules: 1 = minor defect, 5 = critical hazard. No markdown fences. No extra keys."
                ),
                {"mime_type": "image/jpeg", "data": photo_bytes},
            ]
        )

        raw = response.text.strip()
        # Strip markdown code fences if the model wraps them
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
        raw = raw.strip()

        parsed = json.loads(raw)
        score = max(1, min(5, int(parsed.get("severity_score", 3))))
        return {
            "severity_score": score,
            "issue_type": str(parsed.get("issue_type", "Pothole")).strip() or "Pothole",
            "ai_justification": str(parsed.get("ai_justification", "")).strip()
            or "AI assessment completed.",
        }
    except Exception as exc:
        print(f"⚠️  Gemini analysis failed: {exc}")
        return {
            "severity_score": 3,
            "issue_type": "Pothole",
            "ai_justification": "AI analysis encountered an error. Manual inspection recommended.",
        }


# ── Conversation Handlers ───────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📸 Send a photo of the road damage.\n"
        "You can add a description in the caption."
    )
    return PHOTO


async def got_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = update.message
    context.user_data["report"] = {
        "telegram_user_id": msg.from_user.id,
        "username": msg.from_user.username or f"user_{msg.from_user.id}",
        "text": msg.caption,
        "photo_file_id": msg.photo[-1].file_id,
        "sent_at": msg.date.astimezone(timezone.utc).isoformat(),
    }
    button = KeyboardButton("📍 Share location", request_location=True)
    await msg.reply_text(
        "📍 Please share your location so JKR can locate the damage.",
        reply_markup=ReplyKeyboardMarkup(
            [[button]], one_time_keyboard=True, resize_keyboard=True
        ),
    )
    return LOCATION


async def got_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    loc = update.message.location
    report = context.user_data["report"]
    report["latitude"] = loc.latitude
    report["longitude"] = loc.longitude
    report["location_source"] = (
        "geotag" if loc.horizontal_accuracy is not None else "shared pin"
    )

    keyboard = ReplyKeyboardMarkup(
        [["highway", "standard", "suburban"]],
        one_time_keyboard=True,
        resize_keyboard=True,
    )
    await update.message.reply_text(
        "🛣️ What type of road is this?", reply_markup=keyboard
    )
    return ROAD_TYPE


async def got_road_type(update: Update, context: ContextTypes.DEFAULT_TYPE):
    report = context.user_data["report"]
    report["road_type"] = update.message.text

    await update.message.reply_text(
        "⏳ Analysing damage with AI…", reply_markup=ReplyKeyboardRemove()
    )
    result = await load_report(report, context)

    # Send confirmation with AI results
    ai = result["ai"]
    risk = (
        "CRITICAL"
        if ai["severity_score"] >= 5
        else "HIGH"
        if ai["severity_score"] >= 4
        else "MEDIUM"
        if ai["severity_score"] >= 3
        else "LOW"
    )
    await update.message.reply_text(
        f"✅ Aduan Diterima!\n"
        f"No. Rujukan: {result['case_id']}\n"
        f"Keterukan AI: Peringkat {ai['severity_score']}/5 ({risk})\n"
        f"Jenis Kerosakan: {ai['issue_type']}\n"
        f"Justifikasi: {ai['ai_justification']}\n\n"
        f"Status kes boleh disemak melalui papan pemuka JKR."
    )
    return ConversationHandler.END


# ── Supabase Load ───────────────────────────────────────────────────────────

async def load_report(report: dict, context: ContextTypes.DEFAULT_TYPE) -> dict:
    """Upload photo, run AI analysis, and insert the full report into Supabase."""

    # 1. Upsert citizen user → road_users
    user = (
        supabase.table("road_users")
        .upsert(
            {
                "telegram_id": report["telegram_user_id"],
                "telegram_username": report["username"],
            },
            on_conflict="telegram_id",
        )
        .execute()
        .data[0]
    )

    # 2. Generate dashboard-compatible case ID (JKR-XXXX)
    case_id = f"JKR-{random.randint(1000, 9999)}"

    # 3. Upload photo to Supabase Storage → bucket "reports"
    tg_file = await context.bot.get_file(report["photo_file_id"])
    photo_bytes = bytes(await tg_file.download_as_bytearray())
    storage_path = f"{case_id}.jpg"
    supabase.storage.from_("reports").upload(
        storage_path, photo_bytes, {"content-type": "image/jpeg"}
    )
    image_url = supabase.storage.from_("reports").get_public_url(storage_path)

    # 4. Analyse with Gemini AI
    ai = await analyze_with_gemini(photo_bytes)

    # 5. Insert into reports table (column names match Supabase schema exactly)
    supabase.table("reports").insert(
        {
            "id": case_id,
            "user_id": user["user_id"],
            "road_name": report.get("text") or "Lokasi Awam Dilaporkan",
            "telegram_chat_id": report["telegram_user_id"],
            "reporter_name": report["username"],
            "latitude": report["latitude"],
            "longitude": report["longitude"],
            "location_source": report["location_source"],
            "road_type": report["road_type"],
            "description": report.get("text"),
            "image_url": image_url,
            "severity_score": ai["severity_score"],
            "issue_type": ai["issue_type"],
            "ai_justification": ai["ai_justification"],
            "status": "Submitted",
            "history": ["Submitted"],
            "area": "Kuala Lumpur",
            "created_at": report["sent_at"],
        }
    ).execute()

    # 6. Record the image → report_images
    supabase.table("report_images").insert(
        {
            "report_id": case_id,
            "telegram_file_id": report["photo_file_id"],
            "storage_url": image_url,
        }
    ).execute()

    return {"case_id": case_id, "ai": ai}


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Cancelled.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(
        ConversationHandler(
            entry_points=[CommandHandler("report", start)],
            states={
                PHOTO: [MessageHandler(filters.PHOTO, got_photo)],
                LOCATION: [MessageHandler(filters.LOCATION, got_location)],
                ROAD_TYPE: [
                    MessageHandler(
                        filters.Regex("^(highway|standard|suburban)$"), got_road_type
                    )
                ],
            },
            fallbacks=[CommandHandler("cancel", cancel)],
        )
    )
    print("🤖 JKR Road Hazard Bot running… (Press Ctrl+C to stop)")
    app.run_polling()


if __name__ == "__main__":
    main()