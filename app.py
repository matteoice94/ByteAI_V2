import os
import time
import hmac
import json
import base64
import hashlib
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env', override=True)
from collections import defaultdict
from flask import Flask, render_template, request, jsonify
from src.generator import (
    generate_microlearning_path,
    valuta_con_pipeline,
    valuta_risposta,
    genera_spiegazione_alternativa,
    genera_saluto_finale,
    genera_riepilogo_finale,
    genera_hint,
)
from src.database import (
    init_db,
    save_session,
    save_attempt,
    update_module_state,
    clear_module_attempts,
    save_riepilogo,
    find_similar_modules,
    get_all_sessions,
    get_session_modules,
    get_module_attempts,
    create_user,
    authenticate_user,
    get_user_by_id,
    get_user_stats,
    get_leaderboard,
    update_user_stats,
    award_user_xp,
    rename_session,
    delete_session,
    rename_module,
    delete_module,
)
from src.config import RAG_TOP_K
from src.i18n import tr

app = Flask(__name__)
_secret = os.environ.get("SECRET_KEY")
if not _secret:
    raise RuntimeError("SECRET_KEY environment variable is required. Set it before starting the app.")

def _make_token(user_id: int, username: str) -> str:
    payload = json.dumps({"user_id": user_id, "username": username, "exp": time.time() + 86400 * 7})
    payload_b64 = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    sig = hmac.new(_secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def _verify_token(token: str) -> dict | None:
    try:
        payload_b64, sig = token.rsplit(".", 1)
        expected = hmac.new(_secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "==").decode())
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def _require_auth():
    token = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        token = request.cookies.get("bt_token")
    if not token:
        return None
    payload = _verify_token(token)
    if not payload:
        return None
    return payload

# ── Rate Limiter ──────────────────────────────────────────
RATE_LIMIT_WINDOW = 60        # secondi
RATE_LIMIT_MAX_REQUESTS = 200  # development
_rate_buckets: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(ip: str) -> tuple[bool, int]:
    """Restituisce (allowed, retry_after_seconds)."""
    now = time.time()
    bucket = _rate_buckets[ip]
    bucket[:] = [t for t in bucket if now - t < RATE_LIMIT_WINDOW]
    if len(bucket) >= RATE_LIMIT_MAX_REQUESTS:
        retry_after = int(RATE_LIMIT_WINDOW - (now - bucket[0]) + 1)
        return False, retry_after
    bucket.append(now)
    return True, 0


@app.before_request
def _before_request():
    if request.path == '/' or request.path.startswith('/api/'):
        ip = request.remote_addr or '127.0.0.1'
        allowed, retry = _check_rate_limit(ip)
        if not allowed:
            return jsonify({
                'success': False,
                'error': f'Too Many Requests. Retry after {retry}s',
                'retry_after': retry,
            }), 429


def _get_lang():
    data = request.json or {}
    return data.get('lang', request.args.get('lang', 'it'))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/generate', methods=['POST'])
def api_generate():
    lang = _get_lang()
    data = request.json or {}
    topic = data.get('topic', '').strip()
    level = data.get('level', '').strip().lower()
    name = data.get('name', '').strip() or 'Studente'
    num_modules = int(data.get('num_modules', 3))

    if not topic or not level:
        return jsonify({'success': False, 'error': tr('api_topic_level', lang)}), 400

    try:
        payload = _require_auth()
        user_id = payload['user_id'] if payload else None
        context = find_similar_modules(topic, top_k=RAG_TOP_K) or None
        tutor_response = generate_microlearning_path(topic, level, context_modules=context, lang=lang, num_modules=num_modules)
        modules_data = [m.model_dump() for m in tutor_response.percorso_studio.moduli]
        sid = save_session(topic, level, modules_data, user_id=user_id)
        db_modules = get_session_modules(sid)
        module_id_map = {str(dbm["module_index"] + 1): dbm["id"] for dbm in db_modules}
        return jsonify({
            'success': True,
            'session_id': sid,
            'module_db_ids': module_id_map,
            'data': tutor_response.model_dump(),
        }), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/evaluate', methods=['POST'])
def api_evaluate():
    lang = _get_lang()
    data = request.json or {}
    esercizio = data.get('esercizio', '').strip()
    soluzione = data.get('soluzione', '').strip()
    module_db_id = data.get('module_db_id')

    if not esercizio or not soluzione:
        return jsonify({'success': False, 'error': tr('api_exercise_solution', lang)}), 400

    pipeline = valuta_con_pipeline(esercizio, soluzione, data.get('livello', 'base'), lang,
                                   tentativi=data.get('tentativi', 0))

    if not pipeline["valido"]:
        reason = 'heuristic_invalid' if 'troppo corta' in pipeline['message'] or 'random' in pipeline['message'].lower() else 'not_pertinent'
        return jsonify({'success': False, 'error': pipeline['message'], 'reason': reason}), 422

    try:
        feedback = pipeline["feedback"]
        esito = feedback.esito or "sbagliata"

        if module_db_id:
            save_attempt(module_db_id, soluzione, esito, feedback.model_dump_json())

        return jsonify({
            'success': True,
            'esito': esito,
            'commento_costruttivo': feedback.commento_costruttivo,
            'suggerimento_miglioramento': feedback.suggerimento_miglioramento,
            'cosa_manca': getattr(feedback, 'cosa_manca', None),
            'hint': pipeline.get('hint'),
        }), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/hint', methods=['POST'])
def api_hint():
    lang = _get_lang()
    data = request.json or {}
    esercizio = data.get('esercizio', '').strip()
    soluzione = data.get('soluzione', '').strip()
    livello = data.get('livello', '').strip().lower()
    tentativo = data.get('tentativo', 1)

    if not esercizio or not soluzione or not livello:
        return jsonify({'success': False, 'error': tr('api_exercise_solution_level', lang)}), 400

    try:
        hint = genera_hint(esercizio, soluzione, livello, int(tentativo), lang)
        return jsonify({'success': True, 'hint': hint}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/archive-module', methods=['POST'])
def api_archive_module():
    lang = _get_lang()
    data = request.json or {}
    module_db_id = data.get('module_db_id')
    if not module_db_id:
        return jsonify({'success': False, 'error': tr('api_module_db_id', lang)}), 400
    try:
        update_module_state(module_db_id, archived=True)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/complete-module', methods=['POST'])
def api_complete_module():
    lang = _get_lang()
    data = request.json or {}
    module_db_id = data.get('module_db_id')
    if not module_db_id:
        return jsonify({'success': False, 'error': tr('api_module_db_id', lang)}), 400
    try:
        update_module_state(module_db_id, completed=True)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/history', methods=['GET'])
def api_history():
    try:
        payload = _require_auth()
        user_id = payload['user_id'] if payload else None
        sessions = get_all_sessions(user_id=user_id)
        return jsonify({'success': True, 'data': sessions}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/session-detail', methods=['POST'])
def api_session_detail():
    lang = _get_lang()
    data = request.json or {}
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({'success': False, 'error': tr('api_session_id', lang)}), 400
    try:
        modules = get_session_modules(int(session_id))
        result = []
        for m in modules:
            attempts = get_module_attempts(m["id"])
            result.append({**m, "attempts": attempts})
        return jsonify({'success': True, 'data': result}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/clarify', methods=['POST'])
def api_clarify():
    lang = _get_lang()
    data = request.json or {}
    argomento = data.get('argomento', '').strip()
    spiegazione = data.get('spiegazione', '').strip()
    dubbio = data.get('dubbio', '').strip()
    livello = data.get('livello', '').strip().lower()

    if not argomento or not spiegazione or not dubbio or not livello:
        return jsonify({'success': False, 'error': tr('api_topic_explanation_doubt_level', lang)}), 400

    try:
        result = genera_spiegazione_alternativa(argomento, spiegazione, dubbio, livello, lang)
        return jsonify({'success': True, 'data': result}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/final-summary', methods=['POST'])
def api_final_summary():
    lang = _get_lang()
    data = request.json or {}
    solutions = data.get('solutions')
    diary = data.get('diary', [])
    livello = data.get('livello', '').strip().lower()
    session_id = data.get('session_id')

    if not isinstance(solutions, list) or not livello:
        return jsonify({'success': False, 'error': tr('api_solutions_level', lang)}), 400

    try:
        riepilogo = genera_riepilogo_finale(solutions, diary, livello, lang)
        if session_id:
            save_riepilogo(int(session_id), riepilogo.model_dump_json())
        # Award path completion XP
        payload = _require_auth()
        if payload:
            award_user_xp(payload['user_id'], 25, 'path_completed')
        return jsonify({'success': True, 'data': riepilogo.model_dump()}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/saluto', methods=['POST'])
def api_saluto():
    lang = _get_lang()
    data = request.json or {}
    nome = data.get('nome', '').strip() or 'Studente'
    livello = data.get('livello', '').strip().lower()
    interruzione = data.get('interruzione', False)

    if not livello:
        return jsonify({'success': False, 'error': tr('api_level_required', lang)}), 400

    try:
        saluto = genera_saluto_finale(nome, livello, bool(interruzione), lang)
        return jsonify({'success': True, 'saluto': saluto}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/translations', methods=['GET'])
def api_translations():
    """Serve translations to the frontend, avoiding duplicated JS dictionaries."""
    from src.i18n import TRANSLATIONS, SUPPORTED_LANGS
    lang = request.args.get('lang', 'it')
    if lang not in SUPPORTED_LANGS:
        lang = 'it'
    flat = {}
    for key, entry in TRANSLATIONS.items():
        flat[key] = entry.get(lang, entry.get('it', key))
    return jsonify({'success': True, 'lang': lang, 'translations': flat}), 200


# ── Auth ──────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'success': False, 'error': 'Username e password richiesti.'}), 400
    uid = create_user(username, password)
    if not uid:
        return jsonify({'success': False, 'error': 'Username già esistente.'}), 409
    token = _make_token(uid, username)
    resp = jsonify({'success': True, 'token': token, 'user_id': uid, 'username': username})
    resp.set_cookie("bt_token", token, httponly=True, samesite="Lax", max_age=86400*7, path="/")
    return resp, 201


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'success': False, 'error': 'Username e password richiesti.'}), 400
    user = authenticate_user(username, password)
    if not user:
        return jsonify({'success': False, 'error': 'Credenziali errate.'}), 401
    token = _make_token(user['id'], user['username'])
    resp = jsonify({'success': True, 'token': token, 'user_id': user['id'], 'username': user['username']})
    resp.set_cookie("bt_token", token, httponly=True, samesite="Lax", max_age=86400*7, path="/")
    return resp, 200


@app.route('/api/logout', methods=['POST'])
def api_logout():
    resp = jsonify({'success': True})
    resp.delete_cookie("bt_token", path="/")
    return resp


# ── User Stats ────────────────────────────────────────────

@app.route('/api/user/stats', methods=['GET'])
def api_user_stats():
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    try:
        stats = get_user_stats(payload['user_id'])
        return jsonify({'success': True, 'data': stats}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/leaderboard', methods=['GET'])
def api_leaderboard():
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    try:
        lb = get_leaderboard(10)
        return jsonify({'success': True, 'data': lb}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/user/profile', methods=['PUT'])
def api_user_profile():
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    data = request.json or {}
    updates = {}
    if 'avatar' in data:
        updates['avatar'] = data['avatar']
    if 'theme_color' in data:
        updates['theme_color'] = data['theme_color']
    if 'featured_badges' in data:
        updates['featured_badges'] = json.dumps(data['featured_badges'])
    try:
        update_user_stats(payload['user_id'], updates)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


# ── Session & Module Management ────────────────────────────

@app.route('/api/session/<int:session_id>/rename', methods=['PUT'])
def api_rename_session(session_id):
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    data = request.json or {}
    new_topic = data.get('topic', '').strip()
    if not new_topic:
        return jsonify({'success': False, 'error': 'Nuovo topic richiesto.'}), 400
    try:
        rename_session(session_id, new_topic)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/session/<int:session_id>', methods=['DELETE'])
def api_delete_session(session_id):
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    try:
        delete_session(session_id)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/module/<int:module_id>/rename', methods=['PUT'])
def api_rename_module(module_id):
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    data = request.json or {}
    new_title = data.get('title', '').strip()
    if not new_title:
        return jsonify({'success': False, 'error': 'Nuovo titolo richiesto.'}), 400
    try:
        rename_module(module_id, new_title)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/module/<int:module_id>', methods=['DELETE'])
def api_delete_module(module_id):
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    try:
        delete_module(module_id)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/api/module/<int:module_id>/reopen', methods=['POST'])
def api_reopen_module(module_id):
    payload = _require_auth()
    if not payload:
        return jsonify({'success': False, 'error': 'Non autorizzato.'}), 401
    try:
        clear_module_attempts(module_id)
        update_module_state(module_id, completed=False, archived=False)
        return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'success': False, 'error': str(exc)}), 500


if __name__ == '__main__':
    init_db()
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug)
